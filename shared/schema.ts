import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weekly player registrations
export const weeklyGames = pgTable("weekly_games", {
  id: serial("id").primaryKey(),
  gameDate: timestamp("game_date").notNull(),
  isFrozen: boolean("is_frozen").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Player registrations for each week
export const playerRegistrations = pgTable("player_registrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gameId: serial("game_id").notNull().references(() => weeklyGames.id, { onDelete: "cascade" }),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const insertPlayerRegistrationSchema = createInsertSchema(playerRegistrations).omit({
  id: true,
  registeredAt: true,
});

export const insertWeeklyGameSchema = createInsertSchema(weeklyGames).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type WeeklyGame = typeof weeklyGames.$inferSelect;
export type PlayerRegistration = typeof playerRegistrations.$inferSelect;
export type InsertPlayerRegistration = z.infer<typeof insertPlayerRegistrationSchema>;
export type InsertWeeklyGame = z.infer<typeof insertWeeklyGameSchema>;
