import { useState } from "react";
import { Phone, Mail, User, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");

const inputCls = "w-full bg-white/8 border border-white/25 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:bg-white/10 transition-colors text-sm";

export function ContactForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const update = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim() || !form.firstName.trim() || !form.lastName.trim()) return;
    setState("loading");
    try {
      const res = await fetch(`${BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setState("success");
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
        <p className="text-white font-bold text-lg mb-1">Anfrage gesendet!</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Wir melden uns schnellstmöglich bei Ihnen.<br />
          Oder direkt anrufen: <a href="tel:+4920170706" className="text-primary hover:underline">0201 707060</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            className={`${inputCls} pl-10`}
            placeholder="Vorname"
            value={form.firstName}
            onChange={update("firstName")}
            required
            autoComplete="given-name"
          />
        </div>
        <input
          className={inputCls}
          placeholder="Nachname"
          value={form.lastName}
          onChange={update("lastName")}
          required
          autoComplete="family-name"
        />
      </div>

      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          className={`${inputCls} pl-10`}
          placeholder="Telefonnummer *"
          type="tel"
          value={form.phone}
          onChange={update("phone")}
          required
          autoComplete="tel"
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          className={`${inputCls} pl-10`}
          placeholder="E-Mail (optional)"
          type="email"
          value={form.email}
          onChange={update("email")}
          autoComplete="email"
        />
      </div>

      <div className="relative">
        <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-white/30 pointer-events-none" />
        <textarea
          className={`${inputCls} pl-10 resize-none min-h-[100px]`}
          placeholder="Ihre Nachricht – z. B. Abholort, Ziel, Uhrzeit …"
          value={form.message}
          onChange={update("message")}
          rows={3}
        />
      </div>

      {state === "error" && (
        <p className="text-red-400 text-xs text-center">Etwas ist schiefgelaufen. Bitte rufen Sie uns an: 0201 707060</p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full bg-primary text-black font-black py-3.5 rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {state === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Wird gesendet…</>
        ) : (
          "Anfrage senden"
        )}
      </button>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <a
          href="tel:0201707060"
          className="flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-primary text-black font-black text-sm tracking-wide transition-all duration-300 shadow-[0_4px_24px_rgba(255,193,7,0.45)] hover:shadow-[0_4px_32px_rgba(255,193,7,0.7)] hover:scale-[1.03] active:scale-[0.98]"
        >
          <Phone className="w-4 h-4 shrink-0" />
          <span>Anrufen</span>
        </a>
        <a
          href="https://wa.me/491711111535"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#25D366] text-white font-black text-sm tracking-wide transition-all duration-300 shadow-[0_4px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_32px_rgba(37,211,102,0.65)] hover:scale-[1.03] active:scale-[0.98]"
        >
          <WaIcon />
          <span>WhatsApp</span>
        </a>
      </div>
    </form>
  );
}
