import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendBookingNotification } from "../lib/email";
import { requireAdmin, requireAdminCsrf } from "../middleware/require-admin-key";

const router = Router();

router.get("/bookings", requireAdmin, async (_req, res) => {
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

  sendBookingNotification({
    id: booking.id,
    pickupLocation: booking.pickupLocation,
    destination: booking.destination,
    customerName: booking.customerName,
    customerLastName: booking.customerLastName,
    customerPhone: booking.customerPhone,
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

  res.status(201).json({
    ok: true,
    requestId: booking.id,
    message: "Ihre Anfrage wurde übermittelt. Wir melden uns so schnell wie möglich.",
  });
});

router.get("/bookings/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) return res.status(404).json({ error: "Not found" });
  res.json(booking);
});

router.patch("/bookings/:id/status", requireAdmin, requireAdminCsrf, async (req, res) => {
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
