import { Router, type IRouter } from "express";
import { db, bookingsTable } from "@workspace/db";
import { count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [total] = await db.select({ total: count() }).from(bookingsTable);
  const [newBookings] = await db.select({ total: count() }).from(bookingsTable).where(sql`${bookingsTable.status} = 'new'`);
  const [accepted] = await db.select({ total: count() }).from(bookingsTable).where(sql`${bookingsTable.status} = 'accepted'`);
  const [completed] = await db.select({ total: count() }).from(bookingsTable).where(sql`${bookingsTable.status} = 'completed'`);

  res.json({
    total: total?.total ?? 0,
    new: newBookings?.total ?? 0,
    accepted: accepted?.total ?? 0,
    completed: completed?.total ?? 0,
  });
});

export default router;
