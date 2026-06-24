import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Phone, ArrowRight, ChevronDown, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem { q: string; a: string; }
interface RelatedLink { href: string; label: string; }
interface ContentSection { h2: string; body: React.ReactNode; }

interface ServicePageTemplateProps {
  title: string;
  description: string;
  h1: string;
  badge: string;
  intro: string;
  sections: ContentSection[];
  faq?: FAQItem[];
  relatedLinks?: RelatedLink[];
  stadtteileLinks?: RelatedLink[];
  schema: Record<string, unknown>;
  breadcrumbLabel: string;
}

const glassCard = "backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]";
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.28)] divide-y divide-white/[0.06]">
      {items.map((item, idx) => (
        <div key={idx} className={`transition-colors ${openIdx === idx ? "bg-white/[0.045]" : "hover:bg-white/[0.025]"}`}>
          <button
            type="button"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            className="w-full flex items-start justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left group"
            aria-expanded={openIdx === idx}
          >
            <span className="text-sm sm:text-base font-bold text-white/85 group-hover:text-white transition-colors leading-snug pr-2">
              {item.q}
            </span>
            <ChevronDown className={`w-5 h-5 shrink-0 text-primary/80 transition-transform duration-300 mt-0.5 ${openIdx === idx ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {openIdx === idx && (
              <motion.div
                key="answer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <p className="text-sm text-white/60 leading-relaxed px-5 sm:px-6 pb-5">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function ServicePageTemplate({
  title, description, h1, badge, intro, sections, faq, relatedLinks, stadtteileLinks, schema, breadcrumbLabel,
}: ServicePageTemplateProps) {
  usePageMeta({ title, description, schemaOrg: schema });

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-20" style={{ background: "linear-gradient(to bottom, rgba(255,193,7,0.04) 0%, transparent 60%)" }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/40 font-bold uppercase tracking-widest mb-8">
              <Link href="/" className="hover:text-primary transition-colors">Startseite</Link>
              <span>/</span>
              <span className="text-white/60">{breadcrumbLabel}</span>
            </nav>

            <Reveal>
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">{badge}</span>
              <h1
                className="font-display font-black uppercase tracking-tighter leading-none mb-6"
                style={{ fontSize: "clamp(2rem,6vw,4.5rem)" }}
              >
                {h1}
              </h1>
              <p className="text-white/65 text-lg leading-relaxed max-w-2xl mb-10">{intro}</p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:0201707060"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-black px-6 py-3.5 rounded-2xl hover:shadow-[0_0_24px_rgba(255,193,7,0.4)] transition-all text-sm uppercase tracking-widest"
                >
                  <Phone className="w-4 h-4" />
                  0201 707060
                </a>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 border border-white/20 text-white font-black px-6 py-3.5 rounded-2xl hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                >
                  Online buchen
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Content sections */}
        <section className="pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-3xl">
            <div className="space-y-12">
              {sections.map((sec, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className={`${glassCard} rounded-3xl p-8`}>
                    <h2 className="font-display font-black uppercase tracking-tighter text-white mb-4" style={{ fontSize: "clamp(1.2rem,2.5vw,1.8rem)" }}>
                      {sec.h2}
                    </h2>
                    <div className="text-white/65 leading-relaxed space-y-3 text-sm sm:text-base">
                      {sec.body}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Weitere Stadtteile */}
        {stadtteileLinks && stadtteileLinks.length > 0 && (
          <section className="py-12 border-t border-white/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-3xl">
              <Reveal>
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6">Weitere Stadtteile</h2>
                <div className="flex flex-wrap gap-3">
                  {stadtteileLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-bold px-4 py-2 rounded-xl text-sm transition-all"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* Related links */}
        {relatedLinks && relatedLinks.length > 0 && (
          <section className="py-12 border-t border-white/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-3xl">
              <Reveal>
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6">Weitere Leistungen</h2>
                <div className="flex flex-wrap gap-3">
                  {relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-2 border border-primary/30 text-primary/80 hover:text-primary hover:border-primary/60 font-bold px-4 py-2 rounded-xl text-sm transition-all"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faq && faq.length > 0 && (
          <section className="py-16 border-t border-white/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12">
              <Reveal className="text-center mb-10">
                <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-3 block">Häufige Fragen</span>
                <h2 className="font-display font-black uppercase tracking-tighter" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>
                  Ihre Fragen — <span className="text-white/60">unsere Antworten</span>
                </h2>
              </Reveal>
              <FAQAccordion items={faq} />
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <Reveal>
              <div className={`${glassCard} rounded-3xl p-8 sm:p-12 text-center`}>
                <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
                <h2 className="font-display font-black uppercase tracking-tighter text-white mb-3" style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)" }}>
                  Jetzt Taxi bestellen
                </h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Taxi B&B GmbH · Menzelstraße 8–10 · 45147 Essen · 24/7 erreichbar
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href="tel:0201707060"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-black px-8 py-4 rounded-2xl hover:shadow-[0_0_28px_rgba(255,193,7,0.45)] transition-all uppercase tracking-widest text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    0201 707060
                  </a>
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 border border-white/20 text-white font-black px-8 py-4 rounded-2xl hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
                  >
                    Online buchen
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </Layout>
  );
}
