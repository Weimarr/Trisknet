import { pgTable, text, serial, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  reputation: integer("reputation").notNull().default(0),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  balance: decimal("balance").notNull().default("10000"),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  quantity: decimal("quantity").notNull(),
  price: decimal("price").notNull(),
  type: text("type").notNull(), // buy or sell
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  room: text("room").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTradeSchema = createInsertSchema(trades).pick({
  symbol: true,
  quantity: true,
  price: true,
  type: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  room: true,
  content: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).pick({
  symbol: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Watchlist = typeof watchlist.$inferSelect;
