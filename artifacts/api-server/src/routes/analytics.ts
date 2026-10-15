import { Router, type IRouter } from "express";
import { analyticsEventsTable, bookingsTable, db } from "@workspace/db";
import { and, countDistinct, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { requireAnalyticsRead } from "../middleware/require-analytics-read";

const router: IRouter = Router();

const RETENTION_DAYS = 180;

function sinceDate(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

router.post("/track", async (req, res) => {
  const events = req.body.events as {
    sessionId: string;
    eventType: "pageview" | "engagement" | "scroll" | "click" | "form_start" | "form_submit" | "form_attempt" | "form_error";
    path: string;
    referrerHost: string | null;
    sourceCategory: "direct" | "search" | "social" | "referral" | "ai" | "business_profile" | null;
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

router.get("/analytics/overview", requireAnalyticsRead, async (req, res) => {
  const days = Number(req.query.days ?? 30);
  const since = sinceDate(Number.isFinite(days) && days > 0 ? Math.min(days, 180) : 30);
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
      bookingSources,
      bookingPages,
      linkedRows,
      formRows,
    ] = await Promise.all([
      db
        .select({
          pageviews: sql<number>`count(*) filter (where ${analyticsEventsTable.eventType} = 'pageview')`,
          sessions: sql<number>`count(distinct ${analyticsEventsTable.sessionId}) filter (where ${analyticsEventsTable.eventType} = 'pageview')`,
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
        .limit(100),

      db
        .select({
          visitors: countDistinct(analyticsEventsTable.sessionId),
          ctaSessions: sql<number>`count(distinct ${analyticsEventsTable.sessionId}) filter (where ${analyticsEventsTable.eventType} = 'click' and (${analyticsEventsTable.target} ~ '^(phone|email|whatsapp|google_maps)($|_)' or ${analyticsEventsTable.target} = 'booking_cta'))`,
          formStartSessions: sql<number>`count(distinct ${analyticsEventsTable.sessionId}) filter (where ${analyticsEventsTable.eventType} = 'form_start')`,
          formSubmitSessions: sql<number>`count(distinct ${analyticsEventsTable.sessionId}) filter (where ${analyticsEventsTable.eventType} = 'form_submit')`,
        })
        .from(analyticsEventsTable)
        .where(inRange),

      db
        .select({
          bookings: sql<number>`count(*)`,
          pending: sql<number>`count(*) filter (where status = 'new')`,
          overdue: sql<number>`count(*) filter (where status = 'new' and created_at < now() - interval '30 minutes')`,
          confirmed: sql<number>`count(*) filter (where status in ('accepted', 'completed'))`,
          completed: sql<number>`count(*) filter (where status = 'completed')`,
          rejected: sql<number>`count(*) filter (where status = 'rejected')`,
          revenueCents: sql<number>`coalesce(sum(revenue_cents) filter (where status = 'completed'), 0)`,
          revenueRecorded: sql<number>`count(*) filter (where status = 'completed' and revenue_cents is not null)`,
          avgResponseMinutes: sql<number | null>`avg(extract(epoch from (first_responded_at - created_at))/60) filter (where first_responded_at is not null)`,
        })
        .from(bookingsTable)
        .where(and(gte(bookingsTable.createdAt, since), eq(bookingsTable.isTest, false))),
      db.select({ source: bookingsTable.sourceCategory, requests: sql<number>`count(*)`, confirmed: sql<number>`count(*) filter (where status in ('accepted','completed'))`, completed: sql<number>`count(*) filter (where status = 'completed')`, revenueCents: sql<number>`coalesce(sum(revenue_cents) filter (where status = 'completed'), 0)` })
        .from(bookingsTable).where(and(gte(bookingsTable.createdAt, since), eq(bookingsTable.isTest, false))).groupBy(bookingsTable.sourceCategory),
      db.select({ path: bookingsTable.entryPath, requests: sql<number>`count(*)`, completed: sql<number>`count(*) filter (where status = 'completed')` })
        .from(bookingsTable).where(and(gte(bookingsTable.createdAt, since), eq(bookingsTable.isTest, false))).groupBy(bookingsTable.entryPath),
      db.select({ sessions: countDistinct(bookingsTable.analyticsSessionId) }).from(bookingsTable)
        .where(and(gte(bookingsTable.createdAt, since), eq(bookingsTable.isTest, false), sql`exists (select 1 from analytics_events a where a.session_id = ${bookingsTable.analyticsSessionId} and a.event_type = 'pageview' and a.created_at >= ${since})`)),
      db.select({
        kind: sql<string>`coalesce(${analyticsEventsTable.target}, 'legacy')`,
        starts: sql<number>`count(*) filter (where event_type = 'form_start')`,
        attempts: sql<number>`count(*) filter (where event_type = 'form_attempt')`,
        successes: sql<number>`count(*) filter (where event_type = 'form_submit')`,
        errors: sql<number>`count(*) filter (where event_type = 'form_error')`,
        startedSessions: sql<number>`count(distinct session_id) filter (where event_type = 'form_start')`,
        successSessions: sql<number>`count(distinct session_id) filter (where event_type = 'form_submit')`,
      }).from(analyticsEventsTable)
        .where(and(inRange, sql`event_type in ('form_start', 'form_attempt', 'form_submit', 'form_error')`))
        .groupBy(sql`coalesce(${analyticsEventsTable.target}, 'legacy')`),
    ]);

    const summary = summaryRows[0];
    const funnel = funnelRows[0];

    const outcomes = Object.fromEntries(Object.entries(bookingRows[0] ?? {}).map(([key, value]) => [key, value === null ? null : Number(value)]));
    res.json({
      outcomes,
      forms: formRows.map(row => ({ kind: row.kind, starts: Number(row.starts), attempts: Number(row.attempts), successes: Number(row.successes), errors: Number(row.errors), startedSessions: Number(row.startedSessions), successSessions: Number(row.successSessions) })),
      bookingSources: bookingSources.map(row => ({ ...row, requests: Number(row.requests), confirmed: Number(row.confirmed), completed: Number(row.completed), revenueCents: Number(row.revenueCents) })),
      bookingPages: bookingPages.map(row => ({ ...row, requests: Number(row.requests), completed: Number(row.completed) })),
      rangeDays: Math.min(Number.isFinite(days) && days > 0 ? days : 30, 180),
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
        visitors: Number(summary?.sessions ?? 0),
        linkedBookingSessions: Number(linkedRows[0]?.sessions ?? 0),
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
  await db.update(bookingsTable).set({ analyticsSessionId: null, sourceCategory: null, entryPath: null })
    .where(sql`${bookingsTable.createdAt} < now() - interval '180 days'`);
  await db
    .delete(analyticsEventsTable)
    .where(sql`${analyticsEventsTable.createdAt} < now() - interval '${sql.raw(String(RETENTION_DAYS))} days'`);
}

export default router;
