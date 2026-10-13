import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";
import { createHash } from "node:crypto";
import { bookingReceipt, fingerprintBooking } from "../lib/booking-measurement";
import { eq, sql } from "drizzle-orm";
import { sendBookingNotification } from "../lib/email";
import { requireAdmin, requireAdminCsrf } from "../middleware/require-admin-key";

const router = Router();

router.get("/bookings", requireAdmin, async (_req, res) => {
  const bookings = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);
  res.json(bookings);
});

// Preserve compatibility with older clients that omit optional contact fields.
const NOT_PROVIDED = "Nicht angegeben";

router.post("/bookings", async (req, res) => {
  const body = req.body;
  const fingerprint = fingerprintBooking(body);
  const requestKey = body.requestKey ? createHash("sha256").update(body.requestKey).digest("hex") : null;
  const [inserted] = await db.insert(bookingsTable).values({
    requestKey,
    requestFingerprint: fingerprint,
    analyticsSessionId: body.attribution?.sessionId ?? null,
    sourceCategory: body.attribution?.sourceCategory ?? null,
    entryPath: body.attribution?.entryPath ?? null,
    pickupLocation: body.pickupLocation,
    destination: body.destination,
    customerName: body.customerName ?? NOT_PROVIDED,
    customerLastName: body.customerLastName ?? NOT_PROVIDED,
    customerPhone: body.customerPhone ?? NOT_PROVIDED,
    customerEmail: body.customerEmail ?? null,
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
  }).onConflictDoNothing({ target: bookingsTable.requestKey }).returning();
  if (!inserted && requestKey) {
    const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.requestKey, requestKey));
    if (!existing || existing.requestFingerprint !== fingerprint) {
      return res.status(409).json({ error: "Die Anfrage wurde geändert. Bitte erneut absenden." });
    }
    return res.status(200).json(bookingReceipt(existing.id));
  }
  const booking = inserted;
  if (!booking) return res.status(503).json({ error: "Anfrage konnte nicht gespeichert werden." });

  sendBookingNotification({
    id: booking.id,
    pickupLocation: booking.pickupLocation,
    destination: booking.destination,
    customerName: booking.customerName,
    customerLastName: booking.customerLastName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    scheduledTime: booking.scheduledTime?.toISOString() ?? null,
    estimatedDistance: booking.estimatedDistance,
    estimatedDuration: booking.estimatedDuration,
    passengerCount: booking.passengerCount,
    notes: booking.notes,
    foundVia: booking.foundVia,
    laterPickup: booking.laterPickup,
    returnPickupTime: booking.returnPickupTime,
    returnPickupLocation: booking.returnPickupLocation,
    returnDestination: booking.returnDestination,
  }).catch((error) => console.error("Booking email failed", error));

  res.status(201).json(bookingReceipt(booking.id));
});

router.get("/bookings/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) return res.status(404).json({ error: "Not found" });
  res.json(booking);
});

router.patch("/bookings/:id/status", requireAdmin, requireAdminCsrf, async (req, res) => {
  const id = Number(req.params.id);
  const { status, revenueCents, isTest, rejectionReason } = req.body;
  if (revenueCents != null && status !== "completed") {
    return res.status(400).json({ error: "Tatsächlichen Umsatz bitte erst nach der Fahrt erfassen." });
  }
  const [booking] = await db.update(bookingsTable)
    .set({
      status, updatedAt: new Date(),
      ...(isTest !== undefined ? { isTest } : {}),
      ...(revenueCents !== undefined ? { revenueCents } : {}),
      ...(status !== "completed" ? { revenueCents: null } : {}),
      ...(status !== "rejected" ? { rejectionReason: null } : rejectionReason !== undefined ? { rejectionReason } : {}),
      firstRespondedAt: status === "new" ? sql`${bookingsTable.firstRespondedAt}` : sql`coalesce(${bookingsTable.firstRespondedAt}, now())`,
    })
    .where(eq(bookingsTable.id, id))
    .returning();
  if (!booking) return res.status(404).json({ error: "Not found" });
  res.json(booking);
});

export default router;
