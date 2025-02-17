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

  app.get("/api/achievements/:userId", async (req, res) => {
    const achievements = await storage.getUserAchievements(parseInt(req.params.userId));
    res.json(achievements);
  });

  app.get("/api/messages/:room", async (req, res) => {
    const messages = await storage.getRoomMessages(req.params.room);
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
      // Accept all connections for now, but you can add authentication here
      cb(true);
    }
  });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection established");

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "chat") {
          const msg = insertMessageSchema.parse(data.payload);
          const newMessage = await storage.createMessage({
            ...msg,
            timestamp: new Date(),
          });

          // Broadcast to all connected clients
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
        // Send error back to client
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
      console.log("Client disconnected");
    });
  });

  return httpServer;
}