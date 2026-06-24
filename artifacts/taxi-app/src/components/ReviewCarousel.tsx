import { useEffect, useRef, type CSSProperties } from "react";
import { Star } from "lucide-react";

interface Review {
  name: string;
  role: string;
  text: string;
  rating: number;
  initials: string;
  color: string;
}

const reviews: Review[] = [
  { name: "Dogukan Yildirim", role: "Google Rezension", text: "Sehr zuverlässige Taxi-Zentrale. Das Taxi kam pünktlich, der Fahrer war freundlich und die Fahrt war angenehm. Klare Empfehlung!", rating: 5, initials: "DY", color: "bg-blue-500" },
  { name: "Detlev Köhler", role: "Google Rezension", text: "Ganz tolles Taxiunternehmen. Alle Versprechen eingehalten. Immer erreichbar, auch Silvester.", rating: 5, initials: "DK", color: "bg-emerald-500" },
  { name: "A Mo", role: "Google Rezension", text: "Tolle Fahrt! Hatten einen sehr netten, jungen und hilfsbereiten Fahrer gehabt.", rating: 5, initials: "AM", color: "bg-purple-500" },
  { name: "Marcel Werner", role: "Google Rezension", text: "Freundlicher Kontakt. Schnell und kosteneffektiv. Danke – gerne wieder!", rating: 5, initials: "MW", color: "bg-orange-500" },
  { name: "Oualid Kardal", role: "Google Rezension", text: "Super Service und freundliche Mitarbeiter.", rating: 5, initials: "OK", color: "bg-rose-500" },
  { name: "Walid Hamo", role: "Google Rezension", text: "Tolle Fahrt gehabt. Super Fahrer.", rating: 5, initials: "WH", color: "bg-teal-500" },
  { name: "Fatima Afrin", role: "Google Rezension", text: "Sehr guter Umgang und sehr gutes Unternehmen.", rating: 5, initials: "FA", color: "bg-indigo-500" },
  { name: "Wal Ham", role: "Google Rezension", text: "Top Familienunternehmen.", rating: 5, initials: "WH", color: "bg-pink-500" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} von 5 Sternen`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "fill-primary text-primary" : "fill-muted/40 text-muted/40"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

const duplicated = [...reviews, ...reviews];

export function ReviewCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const speed = 0.07;
    const tick = (time: number) => {
      const delta = lastTimeRef.current ? time - lastTimeRef.current : 16;
      container.scrollLeft += speed * delta;
      const half = container.scrollWidth / 2;
      if (container.scrollLeft >= half) container.scrollLeft -= half;
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-label="Echte Google-Rezensionen über Taxi B&B"
      className="w-full overflow-x-auto select-none rv-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as CSSProperties}
    >
      <style>{`.rv-hide::-webkit-scrollbar{display:none}`}</style>
      <div className="flex w-max py-2">
        {duplicated.map((review, i) => (
          <article
            key={`${review.name}-${i}`}
            className="w-[320px] sm:w-[380px] mx-3 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-md flex-shrink-0"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <Stars rating={review.rating} />
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/8 text-white/60 px-2 py-0.5 rounded-full whitespace-nowrap border border-white/10">
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </span>
            </div>
            <blockquote className="text-sm sm:text-[15px] text-foreground/85 leading-relaxed italic mb-4">„{review.text}“</blockquote>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className={`w-9 h-9 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                {review.initials}
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
