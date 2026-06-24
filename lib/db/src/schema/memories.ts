import { pgTable, text, integer, timestamp, pgEnum, real, jsonb } from "drizzle-orm/pg-core";

export const memoryCategoryEnum = pgEnum("memory_category", [
  "personal", "goal", "project", "preference", "decision", "mistake", "general",
]);

export const memoryRelationEnum = pgEnum("memory_relation", [
  "leads_to", "related_to", "contradicts", "supports",
]);

export const memorySessionEventEnum = pgEnum("memory_session_event", [
  "file_edit", "decision", "task", "error", "user_prompt", "other",
]);

export const memoriesTable = pgTable("memories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  content: text("content").notNull(),
  category: memoryCategoryEnum("category").notNull().default("general"),
  importance: real("importance").notNull().default(0.5),
  embedding: text("embedding"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const memoryConnectionsTable = pgTable("memory_connections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sourceId: integer("source_id").notNull().references(() => memoriesTable.id, { onDelete: "cascade" }),
  targetId: integer("target_id").notNull().references(() => memoriesTable.id, { onDelete: "cascade" }),
  relation: memoryRelationEnum("relation").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const memorySessionsTable = pgTable("memory_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id").notNull(),
  eventType: memorySessionEventEnum("event_type").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
