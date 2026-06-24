import { Router, type Request, type Response, type NextFunction } from "express";
import { db, bookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendBookingNotification } from "../lib/email";

const router = Router();

function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return next();
  const provided = req.headers["x-admin-key"] ?? req.query["adminKey"];
  if (provided !== adminKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.get("/bookings", requireAdminKey, async (_req, res) => {
  const bookings = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);
  res.json(bookings);
});

router.post("/bookings", async (req, res) => {
  const body = req.body;
  const [booking] = await db.insert(bookingsTable).values({
    pickupLocation: body.pickupLocation,
    destination: body.destination,
    customerName: body.customerName,
    customerLastName: body.customerLastName,
    customerPhone: body.customerPhone,
    scheduledTime: body.scheduledTime ? new Date(body.scheduledTime) : null,
    estimatedDistance: body.estimatedDistance ?? null,
    estimatedDuration: body.estimatedDuration ?? null,
    passengerCount: body.passengerCount ?? null,
    notes: body.notes ?? null,
    foundVia: body.foundVia ?? null,
    laterPickup: body.laterPickup ?? null,
    returnPickupTime: body.returnPickupTime ?? null,
    returnPickupLocation: body.returnPickupLocation ?? null,
    returnDestination: body.returnDestination ?? null,
    callbackTime: body.callbackTime ? new Date(body.callbackTime) : null,
    status: "new",
  }).returning();

  // E-Mail-Benachrichtigung asynchron senden (blockiert die Antwort nicht)
  sendBookingNotification(booking)
    .then(() => console.log(`[EMAIL] Buchung #${booking.id}: E-Mail erfolgreich gesendet`))
    .catch((err) => console.error(`[EMAIL] Buchung #${booking.id}: Fehler beim Senden:`, err?.message ?? err));

  res.status(201).json(booking);
});

router.get("/bookings/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) return res.status(404).json({ error: "Not found" });
  res.json(booking);
});

router.patch("/bookings/:id/status", requireAdminKey, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const [booking] = await db.update(bookingsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookingsTable.id, id))
    .returning();
  if (!booking) return res.status(404).json({ error: "Not found" });
  res.json(booking);
});

export default router;
