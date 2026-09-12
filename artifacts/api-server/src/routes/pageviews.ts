import { Router, type IRouter } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { db, pageviewCountersTable } from "@workspace/db";
import { and, desc, eq, gte, sql, sum } from "drizzle-orm";
import { requireAdmin } from "../middleware/require-admin-key";

const router: IRouter = Router();

function sinceDate(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * Compares the flush token in constant time. Both sides are hashed first so
 * the comparison operates on equal-length buffers: timingSafeEqual throws on
 * a length mismatch, and reaching that throw would itself leak the expected
 * length.
 */
function tokenMatches(provided: string | undefined): boolean {
  const expected = (process.env.PAGEVIEW_SINK_TOKEN ?? "").trim();
  const candidate = (provided ?? "").trim();
  if (!expected || !candidate) return false;
  const left = createHash("sha256").update(candidate, "utf8").digest();
  const right = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(left, right);
}

/**
 * Receives counter increments from the static server. Writes are upserts that
 * add to the existing count, so a retried flush after a network hiccup can
 * only ever double-count the batch it retries - never lose it. The static
 * server therefore keeps a batch until it is acknowledged.
 */
router.post("/pageviews", async (req, res) => {
  if (!process.env.PAGEVIEW_SINK_TOKEN) {
    return res.status(503).json({ error: "Pageview sink is not configured" });
  }
  if (!tokenMatches(req.get("x-pageview-token"))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const counters = req.body.counters as {
    bucketHour: string;
    path: string;
    referrerHost: string;
    isBot: boolean;
    views: number;
  }[];

  try {
    await db
      .insert(pageviewCountersTable)
      .values(
        counters.map((counter) => ({
          bucketHour: new Date(counter.bucketHour),
          path: counter.path,
          referrerHost: counter.referrerHost,
          isBot: counter.isBot,
          views: counter.views,
        })),
      )
      .onConflictDoUpdate({
        target: [
          pageviewCountersTable.bucketHour,
          pageviewCountersTable.path,
          pageviewCountersTable.referrerHost,
          pageviewCountersTable.isBot,
        ],
        set: { views: sql`${pageviewCountersTable.views} + excluded.views` },
      });

    return res.status(204).end();
  } catch {
    // Ein Fehler hier darf die Auslieferung der Seite nicht beeinflussen; der
    // statische Server behaelt den Stapel und versucht es erneut.
    return res.status(503).json({ error: "Counters could not be stored" });
  }
});

router.get("/pageviews/overview", requireAdmin, async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 730);
  const since = sinceDate(days);
  const humanOnly = req.query.bots !== "include";

  const scope = humanOnly
    ? and(gte(pageviewCountersTable.bucketHour, since), eq(pageviewCountersTable.isBot, false))
    : gte(pageviewCountersTable.bucketHour, since);

  try {
    const [totals] = await db
      .select({
        views: sum(pageviewCountersTable.views),
        paths: sql<number>`count(distinct ${pageviewCountersTable.path})`,
      })
      .from(pageviewCountersTable)
      .where(scope);

    const [split] = await db
      .select({
        human: sql<number>`coalesce(sum(case when ${pageviewCountersTable.isBot} then 0 else ${pageviewCountersTable.views} end), 0)`,
        bot: sql<number>`coalesce(sum(case when ${pageviewCountersTable.isBot} then ${pageviewCountersTable.views} else 0 end), 0)`,
      })
      .from(pageviewCountersTable)
      .where(gte(pageviewCountersTable.bucketHour, since));

    const timeline = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${pageviewCountersTable.bucketHour}), 'YYYY-MM-DD')`,
        views: sum(pageviewCountersTable.views),
      })
      .from(pageviewCountersTable)
      .where(scope)
      .groupBy(sql`date_trunc('day', ${pageviewCountersTable.bucketHour})`)
      .orderBy(sql`date_trunc('day', ${pageviewCountersTable.bucketHour})`);

    const pages = await db
      .select({ path: pageviewCountersTable.path, views: sum(pageviewCountersTable.views) })
      .from(pageviewCountersTable)
      .where(scope)
      .groupBy(pageviewCountersTable.path)
      .orderBy(desc(sum(pageviewCountersTable.views)))
      .limit(25);

    const referrers = await db
      .select({ host: pageviewCountersTable.referrerHost, views: sum(pageviewCountersTable.views) })
      .from(pageviewCountersTable)
      .where(scope)
      .groupBy(pageviewCountersTable.referrerHost)
      .orderBy(desc(sum(pageviewCountersTable.views)))
      .limit(25);

    const [firstRow] = await db
      .select({ bucketHour: pageviewCountersTable.bucketHour })
      .from(pageviewCountersTable)
      .orderBy(pageviewCountersTable.bucketHour)
      .limit(1);

    const asNumber = (value: unknown): number => Number(value ?? 0);

    return res.json({
      days,
      humanOnly,
      measuringSince: firstRow?.bucketHour ?? null,
      summary: {
        views: asNumber(totals?.views),
        paths: asNumber(totals?.paths),
        humanViews: asNumber(split?.human),
        botViews: asNumber(split?.bot),
      },
      timeline: timeline.map((row) => ({ day: row.day, views: asNumber(row.views) })),
      pages: pages.map((row) => ({ path: row.path, views: asNumber(row.views) })),
      referrers: referrers.map((row) => ({
        host: row.host || "(direkt)",
        views: asNumber(row.views),
      })),
    });
  } catch {
    return res.status(503).json({ error: "Overview is temporarily unavailable" });
  }
});

export default router;
