import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { Button } from "@/components/ui";
import {
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Flag,
  Clock,
  CalendarClock,
  Users,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateBooking } from "@/hooks/use-bookings";
import { AddressField } from "@/components/AddressField";

type Mode = "text" | "auswahl";

/** Wert im Zeit-Auswahlfeld, der das freie Datumsfeld einblendet. */
const CUSTOM_TIME = "custom";

const LINE_SPRING = { type: "spring", stiffness: 340, damping: 32 } as const;

/** Placeholder for the free-text tab, which has no address fields of its own. */
const NOT_SPECIFIED = "Nicht angegeben";

/**
 * Pickup times offered in the guided tab: "as soon as possible" plus
 * quarter-hour slots covering the next 24 hours. One simple rule instead of
 * mixed granularities, and a native select renders it as a scroll picker on
 * phones.
 */
function buildTimeSlots(): { value: string; label: string }[] {
  const now = new Date();
  const start = new Date(now);
  start.setSeconds(0, 0);
  const remainder = start.getMinutes() % 15;
  start.setMinutes(start.getMinutes() + (15 - remainder));

  const today = now.toDateString();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

  return Array.from({ length: 96 }, (_, index) => {
    const slot = new Date(start.getTime() + index * 15 * 60 * 1000);
    const day = slot.toDateString();
    const dayLabel =
      day === today
        ? "Heute"
        : day === tomorrow
          ? "Morgen"
          : slot.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
    const time = slot.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    return { value: slot.toISOString(), label: `${dayLabel} ${time}` };
  });
}

export function HeroBookingWidget() {
  const createBooking = useCreateBooking();

  const [mode, setMode] = useState<Mode>("text");

  // Der Text-Tab braucht nur die Nachricht; alles Weitere gehört zum
  // Auswahl-Tab und bleibt beim Umschalten erhalten.
  const [message, setMessage]     = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");

  const [pickup, setPickup]                 = useState("");
  const [destination, setDestination]       = useState("");
  const [timeSlot, setTimeSlot]             = useState("");
  const [customDateTime, setCustomDateTime] = useState("");
  const [passengers, setPassengers]         = useState("1");

  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const stripRef  = useRef<HTMLDivElement>(null);
  const tabRefs   = useRef<Partial<Record<Mode, HTMLButtonElement | null>>>({});

  // Geometrie des aktiven Reiters. Die Aktenlinie wird daraus gezeichnet,
  // statt sie aus festen Werten zu raten: die Reiterbreite hängt an der
  // Textlänge und der Schriftgröße.
  const [bump, setBump] = useState({ left: 0, width: 0, height: 0, ready: false });

  useLayoutEffect(() => {
    const strip = stripRef.current;
    const button = tabRefs.current[mode];
    if (!strip || !button) return;

    const measure = () =>
      setBump({
        left: button.offsetLeft,
        width: button.offsetWidth,
        height: button.offsetHeight,
        ready: true,
      });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    observer.observe(button);
    return () => observer.disconnect();
  }, [mode]);

  const timeSlots = useMemo(buildTimeSlots, []);
  // Untergrenze für das freie Datumsfeld: lokale Zeit, nicht UTC, sonst
  // verschiebt der Browser die Auswahl um den Zeitzonen-Offset.
  const minDateTime = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }, []);

  const valid =
    mode === "text"
      ? message.trim().length >= 5
      : pickup.trim().length >= 2 &&
        destination.trim().length >= 2 &&
        firstName.trim().length >= 2 &&
        lastName.trim().length >= 2 &&
        phone.trim().length >= 6 &&
        (timeSlot !== CUSTOM_TIME || customDateTime !== "");

  function selectMode(next: Mode) {
    setMode(next);
    setError(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError(false);

    const shared = {
      estimatedDistance: null,
      estimatedDuration: null,
      foundVia:          null,
    };

    // "Sofort" sendet keinen Zeitpunkt, ein gewählter Slot seinen ISO-Wert,
    // und beim freien Termin wird die lokale Eingabe nach ISO umgerechnet.
    const scheduledTime =
      timeSlot === CUSTOM_TIME
        ? customDateTime
          ? new Date(customDateTime).toISOString()
          : null
        : timeSlot || null;

    const payload =
      mode === "text"
        ? {
            ...shared,
            // Der Text-Tab erhebt bewusst nur die Nachricht. Name, Telefon
            // und E-Mail werden gar nicht mitgeschickt; der Server setzt für
            // die Pflichtspalten einen Platzhalter.
            pickupLocation: NOT_SPECIFIED,
            destination:    NOT_SPECIFIED,
            scheduledTime:  null,
            passengerCount: null,
            notes:          message.trim(),
          }
        : {
            ...shared,
            pickupLocation: pickup.trim(),
            destination:    destination.trim(),
            customerName:     firstName.trim(),
            customerLastName: lastName.trim(),
            customerPhone:    phone.trim(),
            customerEmail:    email.trim() || null,
            scheduledTime,
            passengerCount: Number(passengers),
            notes:          message.trim() || null,
          };

    try {
      await createBooking.mutateAsync({ data: payload });
      setSubmitted(true);
    } catch {
      setError(true);
    }
  };

  const fieldIcon =
    "w-full h-12 pl-11 pr-4 rounded-xl bg-black/30 border border-white/25 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all";
  const textarea =
    "w-full px-4 py-3.5 rounded-xl bg-black/30 border border-white/25 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all resize-none leading-relaxed";
  const select =
    "w-full h-12 pl-11 pr-9 rounded-xl bg-black/30 border border-white/25 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all";
  const sectionLabel =
    "text-[10px] font-black uppercase tracking-[0.28em] text-white/45 mb-2.5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full space-y-3"
    >
      {/* Dark, slightly opaque card: the hero photo behind it is bright and
          busy, so a white glass panel left the white text and placeholders
          hard to read. Deliberately no backdrop-blur - the background here is
          a scroll-scrubbed video, and re-blurring it every frame is costly on
          phones. */}
      <div ref={widgetRef} className="bg-black/45 border border-white/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">

        {/* Registerreiter wie bei einer Akte: eine durchgehende Grundlinie am
            unteren Rand der Leiste, die sich um den aktiven Reiter nach oben
            herauszieht. Beide Reiter sind flächenlos, markiert wird
            ausschließlich über diese Linie. Sie wird aus der gemessenen
            Reitergeometrie gezeichnet und wandert beim Umschalten animiert
            zum anderen Reiter. */}
        {!submitted && (
          <div
            ref={stripRef}
            role="tablist"
            aria-label="Art der Anfrage"
            className="relative flex items-end gap-1 px-4 pt-4"
          >
            {([
              ["text", "Text"],
              ["auswahl", "Auswahl"],
            ] as const).map(([key, label]) => {
              const active = mode === key;
              return (
                <button
                  key={key}
                  ref={(el) => { tabRefs.current[key] = el; }}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectMode(key)}
                  className={`relative z-10 rounded-t-xl px-5 text-xs font-black uppercase tracking-widest transition-colors duration-200 ${
                    active ? "h-10 text-white" : "h-8 text-white/35 hover:text-white/65"
                  }`}
                >
                  {label}
                </button>
              );
            })}

            {bump.ready && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
                <motion.span
                  className="absolute bottom-0 left-0 h-px bg-primary/45 shadow-[0_0_8px_rgba(255,193,7,0.4)]"
                  animate={{ width: bump.left }}
                  transition={LINE_SPRING}
                />
                <motion.span
                  className="absolute bottom-0 rounded-t-xl border-l border-r border-t border-primary/55 shadow-[0_0_10px_rgba(255,193,7,0.3)]"
                  animate={{ left: bump.left, width: bump.width, height: bump.height }}
                  transition={LINE_SPRING}
                />
                <motion.span
                  className="absolute bottom-0 right-0 h-px bg-primary/45 shadow-[0_0_8px_rgba(255,193,7,0.4)]"
                  animate={{ left: bump.left + bump.width }}
                  transition={LINE_SPRING}
                />
              </div>
            )}
          </div>
        )}

        <div className="p-5 sm:p-6">

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center gap-3 py-6 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-primary" />
                <p className="text-white font-semibold text-lg">Vielen Dank!</p>
                <p className="text-white/60 text-sm">
                  Wir melden uns so schnell wie möglich bei Ihnen.
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-3">

                {/* Titel - immer sichtbar */}
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white leading-snug">
                    Stellen Sie jetzt Ihre Anfrage
                  </h2>
                  <p className="text-sm sm:text-base font-semibold text-primary/90 mt-1.5">
                    zum günstigsten Festpreis.
                  </p>
                </div>

                {mode === "text" ? (
                  /* Nur der Nachrichtblock. Kontaktdaten werden hier bewusst
                     nicht erhoben; für alles Strukturierte gibt es den
                     Auswahl-Reiter. */
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Schreiben Sie eine kurze Nachricht und wir melden uns bei Ihnen! Bitte Telefonnummer angeben."
                    className={textarea}
                  />
                ) : (
                  <motion.div
                    key="auswahl"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* ── Fahrt ── */}
                    <div>
                      <p className={sectionLabel}>Fahrt</p>
                      <div className="space-y-2.5">
                        <AddressField
                          value={pickup}
                          onChange={setPickup}
                          placeholder="Abholort"
                          icon={MapPin}
                          inputClassName={fieldIcon}
                        />
                        <AddressField
                          value={destination}
                          onChange={setDestination}
                          placeholder="Zielort"
                          icon={Flag}
                          inputClassName={fieldIcon}
                        />
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="relative">
                            <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-white/55 pointer-events-none z-10" />
                            <select
                              value={timeSlot}
                              onChange={(e) => setTimeSlot(e.target.value)}
                              aria-label="Abholzeit"
                              className={select}
                            >
                              <option value="">Sofort</option>
                              {timeSlots.map((slot) => (
                                <option key={slot.value} value={slot.value}>
                                  {slot.label}
                                </option>
                              ))}
                              <option value={CUSTOM_TIME}>Späterer Termin…</option>
                            </select>
                            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 text-[10px]">▼</span>
                          </div>
                          <div className="relative">
                            <Users className="absolute left-3.5 top-3.5 h-4 w-4 text-white/55 pointer-events-none z-10" />
                            <select
                              value={passengers}
                              onChange={(e) => setPassengers(e.target.value)}
                              aria-label="Personenanzahl"
                              className={select}
                            >
                              {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                                <option key={count} value={String(count)}>
                                  {count} {count === 1 ? "Person" : "Personen"}
                                </option>
                              ))}
                              <option value="8">8 oder mehr</option>
                            </select>
                            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 text-[10px]">▼</span>
                          </div>
                        </div>

                        {/* Freier Termin: erlaubt Vorbestellungen beliebig weit
                            im Voraus, nicht nur innerhalb der nächsten 24
                            Stunden. */}
                        {timeSlot === CUSTOM_TIME && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="relative pt-0.5">
                              <CalendarClock className="absolute left-3.5 top-4 h-4 w-4 text-white/55 pointer-events-none z-10" />
                              <input
                                type="datetime-local"
                                value={customDateTime}
                                min={minDateTime}
                                onChange={(e) => setCustomDateTime(e.target.value)}
                                aria-label="Datum und Uhrzeit der Fahrt"
                                className={fieldIcon}
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* ── Anmerkungen ── */}
                    <div>
                      <p className={sectionLabel}>Besondere Anmerkungen</p>
                      <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-white/55 pointer-events-none" />
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={2}
                          placeholder="z. B. Kindersitz, Rollator, viel Gepäck (optional)"
                          className={`${textarea} pl-11`}
                        />
                      </div>
                    </div>

                    {/* ── Kontakt ── */}
                    <div>
                      <p className={sectionLabel}>Kontakt</p>
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="relative">
                            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-white/55 pointer-events-none" />
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Vorname"
                              autoComplete="given-name"
                              className={fieldIcon}
                            />
                          </div>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-white/55 pointer-events-none" />
                            <input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Nachname"
                              autoComplete="family-name"
                              className={fieldIcon}
                            />
                          </div>
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-white/55 pointer-events-none" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Telefonnummer"
                            autoComplete="tel"
                            className={fieldIcon}
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-white/55 pointer-events-none" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-Mail (optional)"
                            autoComplete="email"
                            className={fieldIcon}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/15 border border-red-500/20 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Fehler beim Senden. Bitte rufen Sie uns direkt an.</span>
                  </div>
                )}
                <Button
                  type="submit"
                  size="lg"
                  disabled={!valid || createBooking.isPending}
                  className="w-full text-base font-bold"
                  isLoading={createBooking.isPending}
                >
                  {createBooking.isPending ? "Wird gesendet…" : "Anfrage absenden"}
                </Button>

              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* CTA-Buttons: Anrufen + WhatsApp */}
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href="tel:0201707060"
          className="group relative flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-primary text-black font-black text-sm tracking-wide transition-all duration-300 shadow-[0_4px_24px_rgba(255,193,7,0.45)] hover:shadow-[0_4px_32px_rgba(255,193,7,0.7)] hover:scale-[1.03] active:scale-[0.98]"
        >
          <Phone className="w-4 h-4 shrink-0" />
          <span>Anrufen</span>
        </a>
        <a
          href="https://wa.me/491711111535"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#25D366] text-white font-black text-sm tracking-wide transition-all duration-300 shadow-[0_4px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_32px_rgba(37,211,102,0.65)] hover:scale-[1.03] active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>WhatsApp</span>
        </a>
      </div>
    </motion.div>
  );
}
