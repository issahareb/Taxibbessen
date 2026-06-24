import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, CheckCircle } from "lucide-react";

const STORAGE_KEY = "taxi-bb-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[9999]"
        >
          <div className="relative bg-[hsl(220,18%,10%)] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-xl p-5 overflow-hidden">
            {/* Decorative yellow top bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500/0 via-yellow-400/80 to-yellow-500/0" />

            <button
              onClick={decline}
              aria-label="Schließen"
              className="absolute top-3 right-3 p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-4 pr-6">
              <div className="w-9 h-9 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-4.5 h-4.5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Cookies & Datenschutz</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Wir verwenden ausschließlich technisch notwendige Cookies, um die Website korrekt darzustellen. Es findet kein Tracking oder Profiling statt. Mehr dazu in unserer{" "}
                  <a href="/datenschutz" className="text-yellow-400/80 hover:text-yellow-400 underline underline-offset-2 transition-colors">
                    Datenschutzerklärung
                  </a>.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={decline}
                className="flex-1 h-9 rounded-xl border border-white/10 text-xs font-semibold text-white/50 hover:text-white/70 hover:border-white/20 transition-colors"
              >
                Ablehnen
              </button>
              <button
                onClick={accept}
                className="flex-1 h-9 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black text-xs font-black uppercase tracking-wide transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Akzeptieren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
