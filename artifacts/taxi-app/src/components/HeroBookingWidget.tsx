import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";
import { Phone, Mail, CheckCircle2, AlertCircle, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateBooking } from "@/hooks/use-bookings";

interface Props {
  onExpand?: () => void;
  onCollapse?: () => void;
}

export function HeroBookingWidget({ onExpand, onCollapse }: Props) {
  const createBooking = useCreateBooking();

  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [message, setMessage]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);

  const isEmpty =
    firstName.trim() === "" &&
    lastName.trim() === "" &&
    phone.trim() === "" &&
    email.trim() === "" &&
    message.trim() === "";

  useEffect(() => {
    if (collapsed) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        if (isEmpty) {
          setCollapsed(true);
          onCollapse?.();
        }
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [collapsed, isEmpty]);

  const valid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    phone.trim().length >= 6;

  function handleExpand() {
    if (collapsed) {
      setCollapsed(false);
      onExpand?.();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError(false);
    try {
      await createBooking.mutateAsync({
        data: {
          customerName:      firstName.trim(),
          customerLastName:  lastName.trim(),
          customerPhone:     phone.trim(),
          destination:       message.trim() || "–",
          pickupLocation:    email.trim()   || "–",
          scheduledTime:     null,
          estimatedDistance: null,
          estimatedDuration: null,
          foundVia:          null,
        } as Parameters<typeof createBooking.mutateAsync>[0]["data"],
      });
      setSubmitted(true);
    } catch {
      setError(true);
    }
  };

  const fieldIcon =
    "w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all";
  const textarea =
    "w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all resize-none leading-relaxed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full space-y-3"
    >
      <div ref={widgetRef} className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
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

                {/* Titel — immer sichtbar */}
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white leading-snug">
                    Stellen Sie jetzt Ihre Anfrage
                  </h2>
                  <p className="text-sm sm:text-base font-semibold text-primary/90 mt-1.5">
                    zum günstigsten Festpreis.
                  </p>
                </div>

                {/* Eingabefelder — nur sichtbar wenn aufgeklappt */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      key="fields"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      {/* Vorname / Nachname */}
                      <div className="grid grid-cols-2 gap-2.5 mb-3">
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-white/35 pointer-events-none" />
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
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-white/35 pointer-events-none" />
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

                      {/* Telefon / E-Mail */}
                      <div className="grid grid-cols-2 gap-2.5 mb-3">
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-white/35 pointer-events-none" />
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
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-white/35 pointer-events-none" />
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
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Textarea — immer sichtbar */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={handleExpand}
                  rows={collapsed ? 2 : 3}
                  placeholder={
                    collapsed
                      ? "Schreiben Sie eine kurze Nachricht und wir melden uns bei Ihnen!"
                      : "Ihre Nachricht…"
                  }
                  className={textarea}
                />

                {/* Button — nur sichtbar wenn aufgeklappt */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      key="btn"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      className="overflow-hidden"
                    >
                      {error && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/15 border border-red-500/20 text-red-400 text-xs mb-3">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Fehler beim Senden – bitte rufen Sie uns direkt an.</span>
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
                    </motion.div>
                  )}
                </AnimatePresence>

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
