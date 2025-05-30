import {
  users,
  weeklyGames,
  playerRegistrations,
  type User,
  type UpsertUser,
  type WeeklyGame,
  type PlayerRegistration,
  type InsertWeeklyGame,
  type InsertPlayerRegistration,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Game management operations
  getCurrentWeekGame(): Promise<WeeklyGame | undefined>;
  createWeeklyGame(game: InsertWeeklyGame): Promise<WeeklyGame>;
  freezeGame(gameId: number): Promise<void>;
  
  // Player registration operations
  registerPlayer(registration: InsertPlayerRegistration): Promise<PlayerRegistration>;
  removePlayerRegistration(userId: string, gameId: number): Promise<void>;
  getGameRegistrations(gameId: number): Promise<(PlayerRegistration & { user: User })[]>;
  getUserRegistrationForGame(userId: string, gameId: number): Promise<PlayerRegistration | undefined>;
  
  // Cleanup operations
  deleteOldGames(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Game management operations
  async getCurrentWeekGame(): Promise<WeeklyGame | undefined> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const [game] = await db
      .select()
      .from(weeklyGames)
      .where(
        and(
          gte(weeklyGames.gameDate, startOfWeek),
          lte(weeklyGames.gameDate, endOfWeek)
        )
      )
      .orderBy(desc(weeklyGames.gameDate));

    return game;
  }

  async createWeeklyGame(game: InsertWeeklyGame): Promise<WeeklyGame> {
    const [newGame] = await db
      .insert(weeklyGames)
      .values(game)
      .returning();
    return newGame;
  }

  async freezeGame(gameId: number): Promise<void> {
    await db
      .update(weeklyGames)
      .set({ isFrozen: true })
      .where(eq(weeklyGames.id, gameId));
  }

  // Player registration operations
  async registerPlayer(registration: InsertPlayerRegistration): Promise<PlayerRegistration> {
    const [newRegistration] = await db
      .insert(playerRegistrations)
      .values(registration)
      .returning();
    return newRegistration;
  }

  async removePlayerRegistration(userId: string, gameId: number): Promise<void> {
    await db
      .delete(playerRegistrations)
      .where(
        and(
          eq(playerRegistrations.userId, userId),
          eq(playerRegistrations.gameId, gameId)
        )
      );
  }

  async getGameRegistrations(gameId: number): Promise<(PlayerRegistration & { user: User })[]> {
    const registrations = await db
      .select({
        id: playerRegistrations.id,
        userId: playerRegistrations.userId,
        gameId: playerRegistrations.gameId,
        registeredAt: playerRegistrations.registeredAt,
        user: users,
      })
      .from(playerRegistrations)
      .innerJoin(users, eq(playerRegistrations.userId, users.id))
      .where(eq(playerRegistrations.gameId, gameId))
      .orderBy(desc(playerRegistrations.registeredAt));

    return registrations;
  }

  async getUserRegistrationForGame(userId: string, gameId: number): Promise<PlayerRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(playerRegistrations)
      .where(
        and(
          eq(playerRegistrations.userId, userId),
          eq(playerRegistrations.gameId, gameId)
        )
      );
    return registration;
  }

  // Cleanup operations
  async deleteOldGames(): Promise<void> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await db
      .delete(weeklyGames)
      .where(lte(weeklyGames.gameDate, oneWeekAgo));
  }
}

export const storage = new DatabaseStorage();
