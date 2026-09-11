import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "pageview",
  "engagement",
  "scroll",
  "click",
  "form_start",
  "form_submit",
]);

/**
 * First-party reach measurement. Deliberately stores no IP address, no raw
 * user agent and no persistent identifier: `sessionId` is a random value the
 * client keeps in sessionStorage, so it dies with the browser tab and cannot
 * link a visitor across visits. `referrerHost` keeps only the host of the
 * referring URL, never the full path.
 */
export const analyticsEventsTable = pgTable(
  "analytics_events",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sessionId: text("session_id").notNull(),
    eventType: analyticsEventTypeEnum("event_type").notNull(),
    path: text("path").notNull(),
    referrerHost: text("referrer_host"),
    sourceCategory: text("source_category"),
    deviceType: text("device_type"),
    browser: text("browser"),
    language: text("language"),
    viewportWidth: integer("viewport_width"),
    target: text("target"),
    scrollDepth: integer("scroll_depth"),
    activeMs: integer("active_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("analytics_events_created_at_idx").on(table.createdAt),
    index("analytics_events_event_type_idx").on(table.eventType),
    index("analytics_events_session_id_idx").on(table.sessionId),
    index("analytics_events_path_idx").on(table.path),
  ],
);
