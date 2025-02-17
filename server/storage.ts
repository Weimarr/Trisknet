import { User, Trade, Achievement, Message, Watchlist, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<void>;
  updateUserReputation(userId: number, points: number): Promise<void>;
  addExperience(userId: number, amount: number): Promise<void>;
  
  createTrade(trade: Omit<Trade, "id">): Promise<Trade>;
  getUserTrades(userId: number): Promise<Trade[]>;
  
  createAchievement(achievement: Omit<Achievement, "id">): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<Achievement[]>;
  
  createMessage(message: Omit<Message, "id">): Promise<Message>;
  getRoomMessages(room: string): Promise<Message[]>;
  
  addToWatchlist(watchlist: Omit<Watchlist, "id">): Promise<Watchlist>;
  getWatchlist(userId: number): Promise<Watchlist[]>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trades: Map<number, Trade>;
  private achievements: Map<number, Achievement>;
  private messages: Map<number, Message>;
  private watchlists: Map<number, Watchlist>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.trades = new Map();
    this.achievements = new Map();
    this.messages = new Map();
    this.watchlists = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      reputation: 0,
      level: 1,
      experience: 0,
      balance: 10000,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      this.users.set(userId, { ...user, balance: newBalance });
    }
  }

  async updateUserReputation(userId: number, points: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      this.users.set(userId, { ...user, reputation: user.reputation + points });
    }
  }

  async addExperience(userId: number, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      const newExp = user.experience + amount;
      const newLevel = Math.floor(Math.sqrt(newExp / 100)) + 1;
      this.users.set(userId, { 
        ...user, 
        experience: newExp,
        level: newLevel 
      });
    }
  }

  async createTrade(trade: Omit<Trade, "id">): Promise<Trade> {
    const id = this.currentId++;
    const newTrade = { ...trade, id };
    this.trades.set(id, newTrade);
    return newTrade;
  }

  async getUserTrades(userId: number): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(
      (trade) => trade.userId === userId,
    );
  }

  async createAchievement(achievement: Omit<Achievement, "id">): Promise<Achievement> {
    const id = this.currentId++;
    const newAchievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.userId === userId,
    );
  }

  async createMessage(message: Omit<Message, "id">): Promise<Message> {
    const id = this.currentId++;
    const newMessage = { ...message, id };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getRoomMessages(room: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.room === room)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async addToWatchlist(watchlist: Omit<Watchlist, "id">): Promise<Watchlist> {
    const id = this.currentId++;
    const newWatchlist = { ...watchlist, id };
    this.watchlists.set(id, newWatchlist);
    return newWatchlist;
  }

  async getWatchlist(userId: number): Promise<Watchlist[]> {
    return Array.from(this.watchlists.values()).filter(
      (watchlist) => watchlist.userId === userId,
    );
  }
}

export const storage = new MemStorage();
