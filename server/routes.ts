import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertTradeSchema, insertMessageSchema, insertWatchlistSchema } from "@shared/schema";

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
    verifyClient: (info, cb) => {
      console.log("WebSocket connection attempt", {
        origin: info.origin,
        secure: info.secure,
        headers: info.req.headers,
      });
      // Accept all connections in development
      cb(true);
    }
  });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection established");
    let currentRoom: string | null = null;

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received WebSocket message:", data);

        if (data.type === "chat") {
          const { room, content, userId, username } = data.payload;
          currentRoom = room;
          console.log(`Processing message for room ${room} from user ${username}`);

          const newMessage = await storage.createMessage({
            userId,
            username,
            room,
            content,
            timestamp: new Date(),
          });

          // Broadcast only to clients in the same room
          console.log(`Broadcasting message to room ${room}`);
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
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
      console.log("Client disconnected", { lastRoom: currentRoom });
    });
  });

  return httpServer;
}