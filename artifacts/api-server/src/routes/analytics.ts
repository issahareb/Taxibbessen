import { Router, type IRouter } from "express";
import { analyticsEventsTable, bookingsTable, db } from "@workspace/db";
import { and, countDistinct, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { requireAdmin } from "../middleware/require-admin-key";

const router: IRouter = Router();

const RETENTION_DAYS = 180;

function sinceDate(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

router.post("/track", async (req, res) => {
  const events = req.body.events as {
    sessionId: string;
    eventType: "pageview" | "engagement" | "scroll" | "click" | "form_start" | "form_submit";
    path: string;
    referrerHost: string | null;
    sourceCategory: "direct" | "search" | "social" | "referral" | null;
    deviceType: "mobile" | "tablet" | "desktop" | null;
    browser: string | null;
    language: string | null;
    viewportWidth: number | null;
    target: string | null;
    scrollDepth: number | null;
    activeMs: number | null;
  }[];

  try {
    await db.insert(analyticsEventsTable).values(events);
  } catch (error) {
    // Reach measurement must never break a visitor's page. Swallow and log.
    console.error("[ANALYTICS] insert failed", error);
  }

  res.status(204).end();
});

router.get("/analytics/overview", requireAdmin, async (req, res) => {
  const days = Number(req.query.days ?? 30);
  const since = sinceDate(Number.isFinite(days) && days > 0 ? Math.min(days, 365) : 30);
  const inRange = gte(analyticsEventsTable.createdAt, since);

  try {
    const [
      summaryRows,
      timeline,
      pages,
      sources,
      referrers,
      devices,
      browsers,
      clicks,
      funnelRows,
      bookingRows,
    ] = await Promise.all([
      db
        .select({
          pageviews: sql<number>`count(*) filter (where ${analyticsEventsTable.eventType} = 'pageview')`,
          sessions: countDistinct(analyticsEventsTable.sessionId),
          totalActiveMs: sql<number>`coalesce(sum(${analyticsEventsTable.activeMs}), 0)`,
          engagementEvents: sql<number>`count(*) filter (where ${analyticsEventsTable.eventType} = 'engagement')`,
          avgScrollDepth: sql<number>`coalesce(avg(${analyticsEventsTable.scrollDepth}) filter (where ${analyticsEventsTable.eventType} = 'scroll'), 0)`,
        })
        .from(analyticsEventsTable)
        .where(inRange),

      db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${analyticsEventsTable.createdAt}), 'YYYY-MM-DD')`,
          pageviews: sql<number>`count(*) filter (where ${analyticsEventsTable.eventType} = 'pageview')`,
          sessions: countDistinct(analyticsEventsTable.sessionId),
        })
        .from(analyticsEventsTable)
        .where(inRange)
        .groupBy(sql`date_trunc('day', ${analyticsEventsTable.createdAt})`)
        .orderBy(sql`date_trunc('day', ${analyticsEventsTable.createdAt})`),

      db
        .select({
          path: analyticsEventsTable.path,
          pageviews: sql<number>`count(*) filter (where ${analyticsEventsTable.eventType} = 'pageview')`,
          sessions: countDistinct(analyticsEventsTable.sessionId),
          avgActiveMs: sql<number>`coalesce(avg(${analyticsEventsTable.activeMs}) filter (where ${analyticsEventsTable.eventType} = 'engagement'), 0)`,
          avgScrollDepth: sql<number>`coalesce(avg(${analyticsEventsTable.scrollDepth}) filter (where ${analyticsEventsTable.eventType} = 'scroll'), 0)`,
        })
        .from(analyticsEventsTable)
        .where(inRange)
        .groupBy(analyticsEventsTable.path)
        .orderBy(desc(sql`count(*) filter (where ${analyticsEventsTable.eventType} = 'pageview')`))
        .limit(25),

      db
        .select({
          sourceCategory: analyticsEventsTable.sourceCategory,
          sessions: countDistinct(analyticsEventsTable.sessionId),
        })
        .from(analyticsEventsTable)
        .where(and(inRange, eq(analyticsEventsTable.eventType, "pageview")))
        .groupBy(analyticsEventsTable.sourceCategory)
        .orderBy(desc(countDistinct(analyticsEventsTable.sessionId))),

      db
        .select({
          referrerHost: analyticsEventsTable.referrerHost,
          sessions: countDistinct(analyticsEventsTable.sessionId),
        })
        .from(analyticsEventsTable)
        .where(and(inRange, eq(analyticsEventsTable.eventType, "pageview"), isNotNull(analyticsEventsTable.referrerHost)))
        .groupBy(analyticsEventsTable.referrerHost)
        .orderBy(desc(countDistinct(analyticsEventsTable.sessionId)))
        .limit(15),

      db
        .select({
          deviceType: analyticsEventsTable.deviceType,
          sessions: countDistinct(analyticsEventsTable.sessionId),
        })
        .from(analyticsEventsTable)
        .where(and(inRange, eq(analyticsEventsTable.eventType, "pageview")))
        .groupBy(analyticsEventsTable.deviceType)
        .orderBy(desc(countDistinct(analyticsEventsTable.sessionId))),

      db
        .select({
          browser: analyticsEventsTable.browser,
          sessions: countDistinct(analyticsEventsTable.sessionId),
        })
        .from(analyticsEventsTable)
        .where(and(inRange, eq(analyticsEventsTable.eventType, "pageview")))
        .groupBy(analyticsEventsTable.browser)
        .orderBy(desc(countDistinct(analyticsEventsTable.sessionId)))
        .limit(10),

      db
        .select({
          target: analyticsEventsTable.target,
          clicks: sql<number>`count(*)`,
          sessions: countDistinct(analyticsEventsTable.sessionId),
        })
        .from(analyticsEventsTable)
        .where(and(inRange, eq(analyticsEventsTable.eventType, "click"), isNotNull(analyticsEventsTable.target)))
        .groupBy(analyticsEventsTable.target)
        .orderBy(desc(sql`count(*)`))
        .limit(20),

      db
        .select({
          visitors: countDistinct(analyticsEventsTable.sessionId),
          ctaSessions: sql<number>`count(distinct ${analyticsEventsTable.sessionId}) filter (where ${analyticsEventsTable.eventType} = 'click')`,
          formStartSessions: sql<number>`count(distinct ${analyticsEventsTable.sessionId}) filter (where ${analyticsEventsTable.eventType} = 'form_start')`,
          formSubmitSessions: sql<number>`count(distinct ${analyticsEventsTable.sessionId}) filter (where ${analyticsEventsTable.eventType} = 'form_submit')`,
        })
        .from(analyticsEventsTable)
        .where(inRange),

      db
        .select({ bookings: sql<number>`count(*)` })
        .from(bookingsTable)
        .where(gte(bookingsTable.createdAt, since)),
    ]);

    const summary = summaryRows[0];
    const funnel = funnelRows[0];

    res.json({
      rangeDays: Math.min(Number.isFinite(days) && days > 0 ? days : 30, 365),
      summary: {
        pageviews: Number(summary?.pageviews ?? 0),
        sessions: Number(summary?.sessions ?? 0),
        avgActiveSecondsPerSession:
          Number(summary?.sessions ?? 0) > 0
            ? Math.round(Number(summary?.totalActiveMs ?? 0) / Number(summary?.sessions) / 1000)
            : 0,
        avgScrollDepth: Math.round(Number(summary?.avgScrollDepth ?? 0)),
        pageviewsPerSession:
          Number(summary?.sessions ?? 0) > 0
            ? Math.round((Number(summary?.pageviews ?? 0) / Number(summary.sessions)) * 10) / 10
            : 0,
      },
      timeline: timeline.map((row) => ({
        day: row.day,
        pageviews: Number(row.pageviews),
        sessions: Number(row.sessions),
      })),
      pages: pages.map((row) => ({
        path: row.path,
        pageviews: Number(row.pageviews),
        sessions: Number(row.sessions),
        avgActiveSeconds: Math.round(Number(row.avgActiveMs) / 1000),
        avgScrollDepth: Math.round(Number(row.avgScrollDepth)),
      })),
      sources: sources.map((row) => ({
        sourceCategory: row.sourceCategory ?? "unbekannt",
        sessions: Number(row.sessions),
      })),
      referrers: referrers.map((row) => ({
        referrerHost: row.referrerHost,
        sessions: Number(row.sessions),
      })),
      devices: devices.map((row) => ({
        deviceType: row.deviceType ?? "unbekannt",
        sessions: Number(row.sessions),
      })),
      browsers: browsers.map((row) => ({
        browser: row.browser ?? "unbekannt",
        sessions: Number(row.sessions),
      })),
      clicks: clicks.map((row) => ({
        target: row.target,
        clicks: Number(row.clicks),
        sessions: Number(row.sessions),
      })),
      funnel: {
        visitors: Number(funnel?.visitors ?? 0),
        ctaSessions: Number(funnel?.ctaSessions ?? 0),
        formStartSessions: Number(funnel?.formStartSessions ?? 0),
        formSubmitSessions: Number(funnel?.formSubmitSessions ?? 0),
        bookings: Number(bookingRows[0]?.bookings ?? 0),
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] overview failed", error);
    res.status(503).json({ error: "Statistiken sind derzeit nicht verfügbar" });
  }
});

export async function deleteExpiredAnalyticsEvents(): Promise<void> {
  await db
    .delete(analyticsEventsTable)
    .where(sql`${analyticsEventsTable.createdAt} < now() - interval '${sql.raw(String(RETENTION_DAYS))} days'`);
}

export default router;
