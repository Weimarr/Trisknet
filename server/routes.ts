import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertTradeSchema, insertMessageSchema, insertWatchlistSchema } from "@shared/schema";
import { parse as parseCookie } from "cookie";
import type { SessionData } from "express-session";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  username?: string;
  currentRoom?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/trades/:userId", async (req, res) => {
    const trades = await storage.getUserTrades(parseInt(req.params.userId));
    res.json(trades);
  });

  app.post("/api/trades", async (req, res) => {
    const trade = insertTradeSchema.parse(req.body);
    if (!req.user) return res.sendStatus(401);
    const newTrade = await storage.createTrade({
      ...trade,
      userId: req.user.id,
      timestamp: new Date(),
    });
    res.json(newTrade);
  });

  app.get("/api/messages/:room", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    console.log(`Fetching messages for room: ${req.params.room}`);
    const messages = await storage.getRoomMessages(req.params.room);
    console.log(`Found ${messages.length} messages for room ${req.params.room}`);
    res.json(messages);
  });

  app.get("/api/watchlist/:userId", async (req, res) => {
    const watchlist = await storage.getWatchlist(parseInt(req.params.userId));
    res.json(watchlist);
  });

  app.post("/api/watchlist", async (req, res) => {
    const watchlist = insertWatchlistSchema.parse(req.body);
    if (!req.user) return res.sendStatus(401);
    const newWatchlist = await storage.addToWatchlist({
      ...watchlist,
      userId: req.user.id,
    });
    res.json(newWatchlist);
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws",
    verifyClient: async (info, cb) => {
      try {
        console.log("WebSocket connection attempt", {
          origin: info.origin,
          secure: info.secure,
          headers: info.req.headers,
        });

        const cookies = parseCookie(info.req.headers.cookie || '');
        const sessionId = cookies.sid;

        if (!sessionId) {
          console.log("No session cookie found");
          return cb(false, 401, "Unauthorized");
        }

        // Get session data
        const sessionData = await new Promise<SessionData | null>((resolve) => {
          storage.sessionStore.get(sessionId, (err, session) => {
            if (err) {
              console.error("Session retrieval error:", err);
              resolve(null);
            } else {
              resolve(session || null);
            }
          });
        });

        if (!sessionData?.passport?.user) {
          console.log("No user in session");
          return cb(false, 401, "Unauthorized");
        }

        // Store user data to be used after connection is established
        (info.req as any).userId = sessionData.passport.user;

        cb(true);
      } catch (error) {
        console.error("WebSocket verification error:", error);
        cb(false, 500, "Internal Server Error");
      }
    }
  });

  wss.on("connection", async (ws: AuthenticatedWebSocket, req) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);

      if (!user) {
        console.log("User not found for ID:", userId);
        ws.close(1008, "User not found");
        return;
      }

      ws.userId = user.id;
      ws.username = user.username;

      console.log("New WebSocket connection established for user:", user.username);

      ws.on("message", async (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log("Received WebSocket message:", data);

          if (data.type === "chat") {
            const { room, content } = data.payload;
            ws.currentRoom = room;

            console.log(`Processing message for room ${room} from user ${ws.username}`);

            const newMessage = await storage.createMessage({
              userId: ws.userId!,
              username: ws.username!,
              room,
              content,
              timestamp: new Date(),
            });

            // Broadcast only to clients in the same room
            console.log(`Broadcasting message to room ${room}`);
            wss.clients.forEach((client: AuthenticatedWebSocket) => {
              if (client.readyState === WebSocket.OPEN && client.currentRoom === room) {
                client.send(JSON.stringify({
                  type: "chat",
                  payload: newMessage,
                }));
              }
            });
          }
        } catch (err) {
          console.error("WebSocket message error:", err);
          ws.send(JSON.stringify({
            type: "error",
            payload: {
              message: "Failed to process message",
            }
          }));
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      ws.on("close", () => {
        console.log("Client disconnected", { 
          username: ws.username,
          lastRoom: ws.currentRoom 
        });
      });
    } catch (error) {
      console.error("Error in connection handler:", error);
      ws.close(1011, "Something went wrong");
    }
  });

  return httpServer;
}