import { z } from "zod";

const PHONE_PATTERN = /^\+?[0-9][0-9\s()\/-]{5,24}$/;
const MAX_DATABASE_ID = 2_147_483_647;

const requiredText = (field: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${field} ist zu kurz.`)
    .max(max, `${field} ist zu lang.`);

const phoneNumber = z
  .string()
  .trim()
  .min(6, "Die Telefonnummer ist zu kurz.")
  .max(25, "Die Telefonnummer ist zu lang.")
  .regex(PHONE_PATTERN, "Die Telefonnummer hat ein ungültiges Format.");

const optionalText = (max: number) =>
  z
    .union([z.string().trim().max(max), z.null()])
    .optional()
    .transform((value) => value || null);

const optionalEmail = z
  .union([z.string().trim().email("Die E-Mail-Adresse ist ungültig.").max(254), z.literal(""), z.null()])
  .optional()
  .transform((value) => value || null);

const optionalDateTime = z
  .union([
    z
      .string()
      .trim()
      .max(64)
      .refine((value) => !Number.isNaN(Date.parse(value)), "Datum oder Uhrzeit ist ungültig."),
    z.null(),
  ])
  .optional()
  .transform((value) => value || null);

export const BookingRequestSchema = z
  .object({
    pickupLocation: requiredText("Abholort", 2, 200),
    destination: requiredText("Ziel", 2, 200),
    customerName: requiredText("Vorname", 1, 80),
    customerLastName: requiredText("Nachname", 1, 80),
    customerPhone: phoneNumber,
    scheduledTime: optionalDateTime,
    estimatedDistance: z.number().finite().min(0).max(2_000).nullable().optional().default(null),
    estimatedDuration: z.number().int().min(0).max(1_440).nullable().optional().default(null),
    passengerCount: z.number().int().min(1).max(99).nullable().optional().default(null),
    notes: optionalText(2_000),
    foundVia: z
      .union([
        z.enum(["google", "ki", "empfehlung", "whatsapp", "stammkunde", "sonstiges"]),
        z.literal(""),
        z.null(),
      ])
      .optional()
      .transform((value) => value || null),
    laterPickup: optionalText(200),
    returnPickupTime: optionalText(100),
    returnPickupLocation: optionalText(200),
    returnDestination: optionalText(200),
    callbackTime: optionalDateTime,
  })
  .strict();

export const ContactRequestSchema = z
  .object({
    firstName: requiredText("Vorname", 1, 80),
    lastName: requiredText("Nachname", 1, 80),
    email: optionalEmail,
    phone: phoneNumber,
    message: optionalText(2_000),
  })
  .strict();

export const BookingIdParamsSchema = z
  .object({
    id: z.coerce.number().int().positive().max(MAX_DATABASE_ID),
  })
  .strict();

export const BookingStatusRequestSchema = z
  .object({
    status: z.enum(["new", "accepted", "completed", "rejected"]),
  })
  .strict();

export const AdminSetupRequestSchema = z
  .object({
    setupKey: z.string().min(1).max(512),
    password: z.string().min(12, "Das Passwort muss mindestens 12 Zeichen lang sein.").max(256),
  })
  .strict();

export const AdminLoginRequestSchema = z
  .object({
    password: z.string().min(1, "Password is required").max(256),
  })
  .strict();
