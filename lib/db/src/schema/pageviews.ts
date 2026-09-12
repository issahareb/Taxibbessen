import { boolean, index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Consent-free reach measurement, counted on the server.
 *
 * Every row is a *counter*, not an event: the static server accumulates hits
 * in memory and flushes increments, so a row says "this path was requested n
 * times in this hour from this referring host". There is no IP address, no
 * user agent, no session identifier, no cookie and no row per visitor, which
 * is precisely what keeps this out of personal-data territory - nothing here
 * can single out an individual, so the counters need neither consent nor a
 * retention limit and can back year-over-year comparisons.
 *
 * `analytics_events` is the opposite trade: richer per-session detail, but
 * only for visitors who accepted the cookie banner and do not send
 * Do-Not-Track. The two tables answer different questions and are meant to
 * be read side by side.
 *
 * `isBot` is kept as a flag rather than filtered away at write time. On a
 * site this size crawler traffic is a large share of all requests, so mixing
 * it into the totals would make them useless - but dropping it would hide
 * how often search engines actually fetch the pages.
 */
export const pageviewCountersTable = pgTable(
  "pageview_counters",
  {
    bucketHour: timestamp("bucket_hour", { withTimezone: true }).notNull(),
    path: text("path").notNull(),
    /** Host of the referring URL, never a full URL. Empty string = direct or unknown. */
    referrerHost: text("referrer_host").notNull(),
    isBot: boolean("is_bot").notNull(),
    views: integer("views").notNull().default(0),
  },
  (table) => [
    primaryKey({
      name: "pageview_counters_pkey",
      columns: [table.bucketHour, table.path, table.referrerHost, table.isBot],
    }),
    index("pageview_counters_bucket_hour_idx").on(table.bucketHour),
    index("pageview_counters_path_idx").on(table.path),
  ],
);
