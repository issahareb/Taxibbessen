import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface BookingEmailData {
  id: number;
  pickupLocation: string;
  destination: string;
  customerName: string;
  customerLastName: string;
  customerPhone: string;
  scheduledTime?: string | null;
  estimatedDistance?: number | null;
  estimatedDuration?: number | null;
  passengerCount?: number | null;
  notes?: string | null;
  foundVia?: string | null;
  laterPickup?: string | null;
  returnPickupTime?: string | null;
  returnPickupLocation?: string | null;
  returnDestination?: string | null;
}

export async function sendBookingNotification(booking: BookingEmailData): Promise<void> {
  const subject = `Neue Anfrage #${booking.id} – ${booking.customerName} ${booking.customerLastName}`;

  const foundViaLabels: Record<string, string> = {
    google: "Google-Suche",
    ki: "ChatGPT / KI-Assistent",
    empfehlung: "Persönliche Empfehlung",
    whatsapp: "WhatsApp",
    stammkunde: "Stammkunde",
    sonstiges: "Sonstiges",
  };

  const rows = [
    ["Buchungs-Nr.", `#${booking.id}`],
    ["Name", `${booking.customerName} ${booking.customerLastName}`],
    ["Telefon", booking.customerPhone],
    ["Abholort", booking.pickupLocation],
    ["Ziel", booking.destination],
    booking.scheduledTime ? ["Wunschzeit", new Date(booking.scheduledTime).toLocaleString("de-DE")] : null,
    booking.passengerCount ? ["Personen", String(booking.passengerCount)] : null,
    booking.laterPickup ? ["Spätere Abholung", booking.laterPickup] : null,
    booking.returnPickupTime ? ["Rückfahrt", booking.returnPickupTime] : null,
    booking.returnPickupLocation ? ["Rückfahrt Abholort", booking.returnPickupLocation] : null,
    booking.returnDestination ? ["Rückfahrt Ziel", booking.returnDestination] : null,
    booking.notes ? ["Hinweis", booking.notes] : null,
    booking.foundVia ? ["Gefunden via", foundViaLabels[booking.foundVia] ?? booking.foundVia] : null,
  ].filter(Boolean) as [string, string][];

  const tableRows = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap;border-bottom:1px solid #f0f0f0;">${label}</td>
        <td style="padding:8px 12px;color:#111;border-bottom:1px solid #f0f0f0;">${value}</td>
      </tr>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
            <div style="font-size:22px;font-weight:900;color:#FFC107;letter-spacing:2px;text-transform:uppercase;">🚕 Taxi B&amp;B GmbH</div>
            <div style="color:#888;font-size:12px;margin-top:4px;letter-spacing:1px;">NEUE BUCHUNGSANFRAGE</div>
          </td>
        </tr>

        <!-- Alert bar -->
        <tr>
          <td style="background:#FFC107;padding:12px 32px;">
            <div style="font-size:15px;font-weight:700;color:#1a1a1a;">📋 Buchung #${booking.id} eingegangen</div>
          </td>
        </tr>

        <!-- Table -->
        <tr>
          <td style="padding:24px 32px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
              ${tableRows}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:8px 32px 32px;text-align:center;">
            <a href="tel:${booking.customerPhone}" style="display:inline-block;background:#FFC107;color:#1a1a1a;font-weight:800;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
              📞 Jetzt zurückrufen
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
            <div style="font-size:12px;color:#999;">Taxi B&amp;B GmbH · Essen · 0201 707060</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: "Taxi B&B Buchungen <buchungen@hareb.org>",
    to: ["taxibb@outlook.com", "issa@hareb.org"],
    subject,
    html,
  });

  if (error) {
    console.error("[EMAIL] Buchung senden fehlgeschlagen:", JSON.stringify(error));
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log("[EMAIL] Buchung gesendet, id:", data?.id);
}

export interface ContactEmailData {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  message: string | null;
}

export async function sendContactNotification(data: ContactEmailData): Promise<void> {
  const subject = `Neue Anfrage – ${data.firstName} ${data.lastName}`;

  const rows = [
    ["Name", `${data.firstName} ${data.lastName}`],
    ["Telefon", data.phone],
    data.email ? ["E-Mail", data.email] : null,
    data.message ? ["Nachricht", data.message] : null,
  ].filter(Boolean) as [string, string][];

  const tableRows = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap;border-bottom:1px solid #f0f0f0;">${label}</td>
        <td style="padding:8px 12px;color:#111;border-bottom:1px solid #f0f0f0;">${value}</td>
      </tr>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
            <div style="font-size:22px;font-weight:900;color:#FFC107;letter-spacing:2px;text-transform:uppercase;">🚕 Taxi B&amp;B GmbH</div>
            <div style="color:#888;font-size:12px;margin-top:4px;letter-spacing:1px;">NEUE KONTAKTANFRAGE</div>
          </td>
        </tr>
        <tr>
          <td style="background:#FFC107;padding:12px 32px;">
            <div style="font-size:15px;font-weight:700;color:#1a1a1a;">📋 Anfrage von ${data.firstName} ${data.lastName}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
              ${tableRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 32px;text-align:center;">
            <a href="tel:${data.phone}" style="display:inline-block;background:#FFC107;color:#1a1a1a;font-weight:800;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
              📞 Jetzt zurückrufen
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
            <div style="font-size:12px;color:#999;">Taxi B&amp;B GmbH · Essen · 0201 707060</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { data: sentData, error: sendError } = await resend.emails.send({
    from: "Taxi B&B Anfragen <buchungen@hareb.org>",
    to: ["taxibb@outlook.com", "issa@hareb.org"],
    subject,
    html,
  });

  if (sendError) {
    console.error("[EMAIL] Kontakt senden fehlgeschlagen:", JSON.stringify(sendError));
    throw new Error(`Resend error: ${sendError.message}`);
  }

  console.log("[EMAIL] Kontakt gesendet, id:", sentData?.id);
}
