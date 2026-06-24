import { useState, useEffect, useCallback } from "react";
import {
  Search, MapPin, Navigation, Phone, User, Users, Clock,
  Edit2, Save, X, CheckCircle2, Loader2, AlertCircle,
  RotateCcw, CalendarClock, MessageSquare, ChevronDown, Timer
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

type LaterPickup = "none" | "same" | "different" | "callback";

interface BookingResult {
  id: number;
  bookingNr: string;
  status: string;
  pickupLocation: string;
  destination: string;
  scheduledTime: string | null;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  estimatedPrice: number | null;
  passengerCount: number;
  customerName: string;
  customerLastName: string;
  customerPhone: string;
  notes: string;
  laterPickup: LaterPickup;
  returnPickupTime: string | null;
  returnPickupLocation: string;
  returnDestination: string;
  callbackTime: string | null;
  bookingTime: string;
}

function useRemainingSeconds(bookingTime: string | null) {
  const WINDOW = 5 * 60;
  const calc = useCallback(() => {
    if (!bookingTime) return 0;
    const elapsed = (Date.now() - new Date(bookingTime).getTime()) / 1000;
    return Math.max(0, Math.ceil(WINDOW - elapsed));
  }, [bookingTime]);

  const [secs, setSecs] = useState(calc);

  useEffect(() => {
    if (!bookingTime) return;
    const iv = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(iv);
  }, [bookingTime, calc]);

  return secs;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${String(ss).padStart(2, "0")}`;
}

const inputCls =
  "w-full h-10 px-3 rounded-xl bg-white/8 border border-white/12 text-white placeholder:text-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all";

const labelCls = "text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1 block";

type View = "search" | "detail" | "edit";

export function BookingEditPanel({ onClose }: { onClose?: () => void }) {
  const [view, setView] = useState<View>("search");
  const [bookingNr, setBookingNr] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [booking, setBooking] = useState<BookingResult | null>(null);

  const [form, setForm] = useState<Partial<BookingResult>>({});

  const remaining = useRemainingSeconds(booking?.bookingTime ?? null);
  const canEdit = remaining > 0;

  const base = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingNr.trim() || !lastName.trim()) return;
    setLoading(true);
    setLookupError(null);
    try {
      const res = await fetch(
        `${base}/api/bookings/status?booking_nr=${encodeURIComponent(bookingNr.trim())}&last_name=${encodeURIComponent(lastName.trim())}`
      );
      if (res.status === 404) { setLookupError("Buchungsnummer nicht gefunden."); }
      else if (res.status === 403) { setLookupError("Nachname stimmt nicht überein."); }
      else if (!res.ok) { setLookupError("Fehler. Bitte erneut versuchen."); }
      else {
        const data = await res.json();
        setBooking(data);
        setForm({
          pickupLocation: data.pickupLocation,
          destination: data.destination,
          customerName: data.customerName,
          customerLastName: data.customerLastName,
          customerPhone: data.customerPhone,
          passengerCount: data.passengerCount,
          notes: data.notes,
          scheduledTime: data.scheduledTime,
          laterPickup: data.laterPickup,
          returnPickupTime: data.returnPickupTime,
          returnPickupLocation: data.returnPickupLocation,
          returnDestination: data.returnDestination,
          callbackTime: data.callbackTime,
        });
        setView("detail");
      }
    } catch { setLookupError("Netzwerkfehler. Bitte erneut versuchen."); }
    finally { setLoading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!booking) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`${base}/api/bookings/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_nr: booking.bookingNr,
          last_name: lastName,
          ...form,
        }),
      });
      if (res.status === 410) {
        setSaveError("Bearbeitungsfenster abgelaufen (5 Minuten überschritten).");
      } else if (res.status === 403) {
        setSaveError("Authentifizierung fehlgeschlagen.");
      } else if (!res.ok) {
        const d = await res.json();
        setSaveError(d.error ?? "Fehler beim Speichern.");
      } else {
        const updated = await res.json();
        setBooking({ ...booking, ...updated });
        setSaved(true);
        setTimeout(() => { setSaved(false); setView("detail"); }, 2000);
      }
    } catch { setSaveError("Netzwerkfehler. Bitte erneut versuchen."); }
    finally { setSaving(false); }
  }

  function updateForm(field: keyof BookingResult, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const statusColors: Record<string, string> = {
    new: "text-yellow-400",
    accepted: "text-blue-400",
    completed: "text-green-400",
    rejected: "text-red-400",
  };
  const statusLabels: Record<string, string> = {
    new: "Neu",
    accepted: "Angenommen",
    completed: "Abgeschlossen",
    rejected: "Abgelehnt",
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-black uppercase tracking-widest text-white">Buchung ändern</span>
        </div>
        <div className="flex items-center gap-2">
          {view !== "search" && (
            <button
              onClick={() => { setView("search"); setBooking(null); setSaved(false); setSaveError(null); }}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              title="Neue Suche"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 py-5 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* STEP 1: SEARCH */}
          {view === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs text-white/50 mb-4 leading-relaxed">
                Buchungsnummer und Nachnamen eingeben, um Ihre Buchung anzuzeigen und zu bearbeiten.
              </p>
              <form onSubmit={handleSearch} className="space-y-3">
                <div>
                  <label className={labelCls}>Buchungsnummer</label>
                  <input
                    value={bookingNr}
                    onChange={(e) => setBookingNr(e.target.value)}
                    placeholder="z.B. TBB-000042"
                    className={inputCls}
                    autoCapitalize="characters"
                  />
                </div>
                <div>
                  <label className={labelCls}>Nachname</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ihr Nachname"
                    className={inputCls}
                  />
                </div>
                {lookupError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {lookupError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !bookingNr.trim() || !lastName.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-black font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {loading ? "Suchen…" : "Buchung suchen"}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: DETAIL VIEW */}
          {view === "detail" && booking && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Booking number + status */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Buchungsnr.</span>
                  <p className="font-mono font-bold text-white text-sm">{booking.bookingNr}</p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${statusColors[booking.status] ?? "text-white/60"}`}>
                  {statusLabels[booking.status] ?? booking.status}
                </span>
              </div>

              {/* Route */}
              <div className="bg-white/5 rounded-xl p-3.5 space-y-2.5 border border-white/8">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-white/40 shrink-0" />
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Abholort</span>
                    <p className="text-xs text-white font-medium leading-snug">{booking.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-2 h-2 rounded-sm bg-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Zielort</span>
                    <p className="text-xs text-white font-medium leading-snug">{booking.destination}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <User className="w-3 h-3" />, label: "Name", value: `${booking.customerName} ${booking.customerLastName}`.trim() },
                  { icon: <Phone className="w-3 h-3" />, label: "Telefon", value: booking.customerPhone || "–" },
                  { icon: <Users className="w-3 h-3" />, label: "Personen", value: String(booking.passengerCount) },
                  { icon: <Clock className="w-3 h-3" />, label: "Abholung", value: booking.scheduledTime ? format(new Date(booking.scheduledTime), "dd.MM. HH:mm", { locale: de }) : "Sofort" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-2.5 border border-white/8">
                    <div className="flex items-center gap-1.5 text-white/40 mb-1">
                      {icon}
                      <span className="text-[9px] uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-xs text-white font-medium truncate">{value}</p>
                  </div>
                ))}
              </div>

              {booking.laterPickup !== "none" && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                  <div className="flex items-center gap-1.5 text-white/40 mb-1">
                    <RotateCcw className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wider">Spätere Abholung</span>
                  </div>
                  <p className="text-xs text-white font-medium">
                    {booking.laterPickup === "same" && "Rückfahrt (gleiche Strecke)"}
                    {booking.laterPickup === "different" && "Rückfahrt (andere Strecke)"}
                    {booking.laterPickup === "callback" && "Rückruf gewünscht"}
                  </p>
                  {booking.returnPickupTime && (
                    <p className="text-[10px] text-white/50 mt-0.5">{format(new Date(booking.returnPickupTime), "dd.MM. HH:mm", { locale: de })}</p>
                  )}
                </div>
              )}

              {booking.notes && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                  <div className="flex items-center gap-1.5 text-white/40 mb-1">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wider">Hinweise</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">{booking.notes}</p>
                </div>
              )}

              {/* Timer + Edit button */}
              {canEdit ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2.5">
                    <Timer className="w-3.5 h-3.5 text-primary shrink-0" />
                    <p className="text-[10px] text-primary font-bold flex-1">
                      Noch <span className="font-black text-sm">{fmt(remaining)}</span> Min. zum Bearbeiten
                    </p>
                  </div>
                  <button
                    onClick={() => setView("edit")}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-black font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-primary/90 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Buchung bearbeiten
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-3">
                  <AlertCircle className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    Bearbeitung nur innerhalb von 5 Minuten nach der Buchung möglich. Bitte rufen Sie uns an: <a href="tel:0201707060" className="text-primary font-bold">0201 707060</a>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: EDIT FORM */}
          {view === "edit" && booking && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Timer bar */}
              {canEdit && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 mb-4">
                  <Timer className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-[10px] text-primary font-bold">
                    Noch <span className="font-black">{fmt(remaining)}</span> zum Bearbeiten
                  </span>
                </div>
              )}

              {saved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-green-500/15 border border-green-500/25 rounded-xl px-3 py-3 mb-4"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-xs text-green-400 font-bold">Buchung erfolgreich gespeichert!</span>
                </motion.div>
              )}

              <form onSubmit={handleSave} className="space-y-3.5">
                {/* Abholort */}
                <div>
                  <label className={labelCls}><MapPin className="w-3 h-3 inline mr-1" />Abholort</label>
                  <input
                    value={form.pickupLocation ?? ""}
                    onChange={(e) => updateForm("pickupLocation", e.target.value)}
                    className={inputCls}
                    placeholder="Abholadresse"
                  />
                </div>

                {/* Zielort */}
                <div>
                  <label className={labelCls}><Navigation className="w-3 h-3 inline mr-1" />Zielort</label>
                  <input
                    value={form.destination ?? ""}
                    onChange={(e) => updateForm("destination", e.target.value)}
                    className={inputCls}
                    placeholder="Zieladresse"
                  />
                </div>

                <div className="h-px bg-white/8" />

                {/* Name */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Vorname</label>
                    <input
                      value={form.customerName ?? ""}
                      onChange={(e) => updateForm("customerName", e.target.value)}
                      className={inputCls}
                      placeholder="Vorname"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Nachname</label>
                    <input
                      value={form.customerLastName ?? ""}
                      onChange={(e) => updateForm("customerLastName", e.target.value)}
                      className={inputCls}
                      placeholder="Nachname"
                    />
                  </div>
                </div>

                {/* Telefon */}
                <div>
                  <label className={labelCls}><Phone className="w-3 h-3 inline mr-1" />Telefon / SMS</label>
                  <input
                    value={form.customerPhone ?? ""}
                    onChange={(e) => updateForm("customerPhone", e.target.value)}
                    type="tel"
                    className={inputCls}
                    placeholder="+49 201 ..."
                  />
                </div>

                {/* Fahrgäste */}
                <div>
                  <label className={labelCls}><Users className="w-3 h-3 inline mr-1" />Fahrgäste</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => updateForm("passengerCount", Math.max(1, (form.passengerCount ?? 1) - 1))}
                      className="w-9 h-9 rounded-xl bg-white/8 border border-white/12 text-white flex items-center justify-center hover:bg-white/15 transition-colors text-lg font-bold">−</button>
                    <span className="flex-1 text-center text-sm font-bold text-white">{form.passengerCount ?? 1}</span>
                    <button type="button" onClick={() => updateForm("passengerCount", Math.min(7, (form.passengerCount ?? 1) + 1))}
                      className="w-9 h-9 rounded-xl bg-white/8 border border-white/12 text-white flex items-center justify-center hover:bg-white/15 transition-colors text-lg font-bold">+</button>
                  </div>
                </div>

                {/* Geplante Zeit */}
                <div>
                  <label className={labelCls}><CalendarClock className="w-3 h-3 inline mr-1" />Geplante Abholzeit</label>
                  <input
                    value={form.scheduledTime ? new Date(form.scheduledTime).toISOString().slice(0, 16) : ""}
                    onChange={(e) => updateForm("scheduledTime", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    type="datetime-local"
                    className={inputCls}
                  />
                  {form.scheduledTime && (
                    <button type="button" onClick={() => updateForm("scheduledTime", null)}
                      className="text-[10px] text-white/40 hover:text-primary mt-1 ml-1 transition-colors">
                      × Sofortfahrt (Zeit entfernen)
                    </button>
                  )}
                </div>

                {/* Spätere Abholung */}
                <div>
                  <label className={labelCls}><RotateCcw className="w-3 h-3 inline mr-1" />Spätere Abholung</label>
                  <div className="relative">
                    <select
                      value={form.laterPickup ?? "none"}
                      onChange={(e) => updateForm("laterPickup", e.target.value)}
                      className={`${inputCls} appearance-none pr-8`}
                    >
                      <option value="none">Keine</option>
                      <option value="same">Rückfahrt (gleiche Strecke)</option>
                      <option value="different">Rückfahrt (andere Strecke)</option>
                      <option value="callback">Rückruf gewünscht</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                  </div>
                </div>

                {(form.laterPickup === "same" || form.laterPickup === "different") && (
                  <div>
                    <label className={labelCls}>Rückfahrt-Uhrzeit</label>
                    <input
                      value={form.returnPickupTime ? new Date(form.returnPickupTime).toISOString().slice(0, 16) : ""}
                      onChange={(e) => updateForm("returnPickupTime", e.target.value ? new Date(e.target.value).toISOString() : null)}
                      type="datetime-local"
                      className={inputCls}
                    />
                  </div>
                )}

                {form.laterPickup === "different" && (
                  <>
                    <div>
                      <label className={labelCls}>Abholort (Rückfahrt)</label>
                      <input
                        value={form.returnPickupLocation ?? ""}
                        onChange={(e) => updateForm("returnPickupLocation", e.target.value)}
                        className={inputCls}
                        placeholder="Abholadresse Rückfahrt"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Zielort (Rückfahrt)</label>
                      <input
                        value={form.returnDestination ?? ""}
                        onChange={(e) => updateForm("returnDestination", e.target.value)}
                        className={inputCls}
                        placeholder="Zieladresse Rückfahrt"
                      />
                    </div>
                  </>
                )}

                {form.laterPickup === "callback" && (
                  <div>
                    <label className={labelCls}>Rückruf-Uhrzeit</label>
                    <input
                      value={form.callbackTime ? new Date(form.callbackTime).toISOString().slice(0, 16) : ""}
                      onChange={(e) => updateForm("callbackTime", e.target.value ? new Date(e.target.value).toISOString() : null)}
                      type="datetime-local"
                      className={inputCls}
                    />
                  </div>
                )}

                {/* Notizen */}
                <div>
                  <label className={labelCls}><MessageSquare className="w-3 h-3 inline mr-1" />Hinweise / Notizen</label>
                  <textarea
                    value={form.notes ?? ""}
                    onChange={(e) => updateForm("notes", e.target.value)}
                    rows={3}
                    className={`${inputCls} h-auto resize-none py-2.5`}
                    placeholder="Besondere Wünsche, Rollstuhl, etc."
                  />
                </div>

                {saveError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {saveError}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setSaveError(null); setView("detail"); }}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-white/15 text-white/60 font-bold text-xs uppercase tracking-widest py-2.5 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !canEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-black font-black text-xs uppercase tracking-widest py-2.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving ? "Speichern…" : "Speichern"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
