import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const adminCredentialsTable = pgTable("admin_credentials", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminSessionsTable = pgTable("admin_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  csrfToken: text("csrf_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
});
