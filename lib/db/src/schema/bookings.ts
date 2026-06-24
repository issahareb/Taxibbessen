import { pgTable, text, integer, timestamp, pgEnum, real } from "drizzle-orm/pg-core";

export const bookingStatusEnum = pgEnum("booking_status", ["new", "accepted", "completed", "rejected"]);

export const bookingsTable = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pickupLocation: text("pickup_location").notNull(),
  destination: text("destination").notNull(),
  customerName: text("customer_name").notNull(),
  customerLastName: text("customer_last_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  scheduledTime: timestamp("scheduled_time"),
  estimatedDistance: real("estimated_distance"),
  estimatedDuration: real("estimated_duration"),
  passengerCount: integer("passenger_count"),
  notes: text("notes"),
  foundVia: text("found_via"),
  laterPickup: text("later_pickup"),
  returnPickupTime: text("return_pickup_time"),
  returnPickupLocation: text("return_pickup_location"),
  returnDestination: text("return_destination"),
  callbackTime: timestamp("callback_time"),
  status: bookingStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
