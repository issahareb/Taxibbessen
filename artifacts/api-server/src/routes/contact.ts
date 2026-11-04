import { Router } from "express";
import { sendContactNotification } from "../lib/email";

const router = Router();

router.post("/contact", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body ?? {};

  if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: "Vorname, Nachname und Telefon sind Pflichtfelder." });
  }

  try {
    const providerMessageId = await sendContactNotification({ firstName: firstName.trim(), lastName: lastName.trim(), email: email?.trim() || null, phone: phone.trim(), message: message?.trim() || null });
    req.log.info({ event: "contact_notification", status: "accepted", providerMessageId }, "Contact notification accepted by provider");
    return res.json({ ok: true });
  } catch {
    req.log.error({ event: "contact_notification", status: "failed" }, "Contact notification failed");
    return res.status(500).json({ error: "E-Mail konnte nicht gesendet werden." });
  }
});

export default router;
