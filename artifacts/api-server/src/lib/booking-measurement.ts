import { createHash } from "node:crypto";

/** Ignore consent metadata on retries, but reject reuse for changed ride data. */
export function fingerprintBooking(body: Record<string, unknown>): string {
  const data = Object.fromEntries(Object.entries(body).filter(([key]) => !["requestKey", "attribution"].includes(key)).sort(([a], [b]) => a.localeCompare(b)));
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}
export function bookingReceipt(id: number) {
  return { ok: true as const, requestId: id, message: "Anfrage eingegangen. Ihre Fahrt ist erst nach persönlicher Bestätigung verbindlich." };
}
