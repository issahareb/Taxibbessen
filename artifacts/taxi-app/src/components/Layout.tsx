import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe, Phone, MapPin, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/useLanguage";
import { Language, languageNames } from "@/i18n/translations";

const LANGUAGES: Language[] = ["de", "en", "fr", "tr", "ar"];

const glassClass = "backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]";

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 hover:bg-white/15 transition-colors"
        aria-label="Sprache / Language"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black uppercase leading-none text-white/70">{lang.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-2xl shadow-2xl z-[200] overflow-hidden"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-white/5 transition-colors text-left ${
                  lang === l ? "bg-primary/10 text-primary" : "text-foreground"
                }`}
              >
                <span className="text-xs font-mono font-black uppercase opacity-50 w-6">{l}</span>
                <span>{languageNames[l]}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroLogoVisible, setHeroLogoVisible] = useState(true);
  const { t, isRtl } = useLanguage();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "1") {
      setIsMobileMenuOpen(true);
      setTimeout(() => setEditPanelOpen(true), 350);
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Track hero logo visibility — header logo + blur only appear when hero logo scrolls away
  useEffect(() => {
    setHeroLogoVisible(true); // reset on route change
    const attach = () => {
      const el = document.getElementById("hero-logo");
      if (!el) {
        setHeroLogoVisible(false); // Unterseiten ohne Hero → Header immer sichtbar
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => setHeroLogoVisible(entry.isIntersecting),
        { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    };
    // Small delay to allow route render
    const cleanup = attach();
    if (cleanup) return cleanup;
    return undefined;
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: "/", label: t("nav_home") },
    { href: "/fahrzeuge", label: t("nav_vehicles") },
    { href: "/book", label: t("nav_book") },
  ];

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    };
    if (location === "/") {
      setTimeout(doScroll, 320);
    } else {
      window.location.href = `${import.meta.env.BASE_URL}#${id}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Fixed Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-[100] py-4"
      >
        {/* Blur layer with gradient mask – fades in when hero logo leaves viewport */}
        <div
          className="absolute inset-x-0 top-0 bg-black/25 backdrop-blur-md pointer-events-none transition-opacity duration-500"
          style={{
            bottom: "-22px",
            opacity: heroLogoVisible ? 0 : 1,
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          }}
        />
        <div className="relative container mx-auto px-4 lg:px-12 flex items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-foreground/80 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Menü öffnen"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/"
              className="flex items-center gap-3 group shrink-0 transition-opacity duration-500"
              style={{ opacity: heroLogoVisible ? 0 : 1, pointerEvents: heroLogoVisible ? "none" : "auto" }}
            >
              <img
                src={`${import.meta.env.BASE_URL}bb-logo-v7-transparent.webp`}
                alt="Taxi B&B"
                className="h-7 w-auto group-hover:scale-105 transition-all duration-500"
              />
            </Link>
          </div>

          {/* Desktop Pill Nav */}
          <nav className={`hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-full ${glassClass}`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  location === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => scrollToSection("leistungen")}
              className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
            >
              {t("nav_services")}
            </button>
            <Link
              href="/ueber-uns"
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                location === "/ueber-uns"
                  ? "bg-primary text-primary-foreground"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t("nav_about")}
            </Link>
          </nav>

          {/* Mobile: individual buttons (no glass pill) */}
          <div className="flex lg:hidden items-center gap-2">
            <a href="tel:0201707060" className="group">
              <div className="relative flex items-center justify-center">
                {scrolled && (
                  <>
                    <span className="absolute inset-0 rounded-xl bg-primary/50 animate-call-glow" />
                    <span className="absolute inset-0 rounded-xl bg-primary/35 animate-call-glow-delay" />
                  </>
                )}
                <div
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    scrolled
                      ? "bg-primary shadow-[0_0_22px_6px_rgba(255,193,7,0.65)]"
                      : "bg-transparent border border-white/20"
                  }`}
                >
                  <Phone className={`w-4 h-4 transition-colors duration-500 ${scrolled ? "text-black" : "text-primary"}`} />
                </div>
              </div>
            </a>
            <a
              href="mailto:taxibb@outlook.com"
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/5 transition-colors"
              aria-label="E-Mail"
            >
              <Mail className="w-4 h-4 text-primary" />
            </a>
            <LanguageSwitcher />
          </div>

          {/* Desktop: unified glass pill */}
          <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5">
            <a href="tel:0201707060" className="flex items-center gap-3 group">
              <div className="flex flex-col items-end leading-none gap-[2px]">
                <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">24/7 Erreichbar</span>
                <span className="font-display font-black text-sm text-primary leading-none">0201 707060</span>
              </div>
              <div className="relative flex items-center justify-center">
                {scrolled && (
                  <>
                    <span className="absolute inset-0 rounded-xl bg-primary/50 animate-call-glow" />
                    <span className="absolute inset-0 rounded-xl bg-primary/35 animate-call-glow-delay" />
                  </>
                )}
                <div
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    scrolled
                      ? "bg-primary shadow-[0_0_22px_6px_rgba(255,193,7,0.65)] group-hover:shadow-[0_0_32px_10px_rgba(255,193,7,0.8)]"
                      : "hover:bg-white/15 group-hover:bg-white/15"
                  }`}
                >
                  <Phone className={`w-4 h-4 transition-colors duration-500 ${scrolled ? "text-black" : "text-primary"}`} />
                </div>
              </div>
            </a>
            <div className="w-px h-6 bg-white/15" />
            <a
              href="mailto:taxibb@outlook.com"
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/15 transition-colors"
              aria-label="E-Mail"
            >
              <Mail className="w-4 h-4 text-primary" />
            </a>
            <div className="w-px h-6 bg-white/15" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-[100dvh] w-[70%] max-w-[260px] bg-card border-r border-border z-[110] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-border/50">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src={`${import.meta.env.BASE_URL}bb-logo-v7-transparent.webp`} alt="Taxi B&B" className="h-9 w-auto" loading="lazy" decoding="async" />
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 flex flex-col px-4 pt-6 gap-1 overflow-y-auto min-h-0">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-xl font-black text-base transition-all ${
                      location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => scrollToSection("leistungen")}
                  className="flex items-center px-3 py-2.5 rounded-xl font-black text-base text-foreground hover:bg-white/5 transition-all text-left"
                >
                  {t("nav_services")}
                </button>
                <Link
                  href="/ueber-uns"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-xl font-black text-base transition-all ${
                    location === "/ueber-uns" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                  }`}
                >
                  {t("nav_about")}
                </Link>

              </nav>

              <div className="px-4 pb-10 pt-4 border-t border-border/50 space-y-3">
                {/* Oberste Zeile: WhatsApp (links) + FAQ (rechts) */}
                <div className="flex gap-2">
                  <a
                    href="https://wa.me/491711111535"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 font-bold py-3 rounded-2xl text-sm transition-colors backdrop-blur-sm"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                  <button
                    onClick={() => scrollToSection("faq")}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-bold py-3 rounded-2xl text-sm transition-colors"
                  >
                    FAQ
                  </button>
                </div>
                {/* Telefon: volle Breite */}
                <a
                  href="tel:0201707060"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-4 rounded-2xl text-base hover:shadow-[0_0_20px_rgba(255,193,7,0.35)] transition-all"
                >
                  <Phone className="w-5 h-5" />
                  0201 707060
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main — pt-20 to clear fixed nav on non-hero pages */}
      <main className="flex-1 w-full relative pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-white/5 py-16 relative" style={{ zIndex: 2 }}>
        <div className="absolute -top-24 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(220,20%,4%) 100%)", zIndex: 1 }} />
        <div className="container mx-auto px-4 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-12">
            <div className="md:col-span-2 lg:col-span-2 xl:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img id="footer-logo" src={`${import.meta.env.BASE_URL}bb-logo-v7-transparent.webp`} alt="Taxi B&B" className="h-9 w-auto" loading="lazy" decoding="async" />
                <span className="font-display font-black text-xl uppercase tracking-tighter">Taxi B&B GmbH</span>
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed text-sm mb-6">{t("footer_desc")}</p>
              <div className="flex gap-3">
                <a href="mailto:taxibb@outlook.com" className="p-3 bg-white/5 rounded-xl hover:text-primary transition-colors border border-white/5">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="tel:0201707060" className="p-3 bg-white/5 rounded-xl hover:text-primary transition-colors border border-white/5">
                  <Phone className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/taxiessenbb"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Taxi B&B auf Instagram folgen"
                  className="p-3 bg-white/5 rounded-xl hover:text-primary transition-colors border border-white/5"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
              </div>
              <a
                href="https://www.instagram.com/taxiessenbb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:border-primary/50 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
                @taxiessenbb folgen
              </a>
            </div>

            <div>
              <h4 className="font-black text-white uppercase tracking-widest text-xs mb-6">{t("footer_contact")}</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Menzelstraße 8-10,<br />45147 Essen</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a href="tel:0201707060" className="hover:text-primary transition-colors">0201 707060</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href="mailto:taxibb@outlook.com" className="hover:text-primary transition-colors">taxibb@outlook.com</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-white uppercase tracking-widest text-xs mb-6">Regionen</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li><Link href="/taxi-essen-holsterhausen" className="text-muted-foreground hover:text-primary transition-colors">Holsterhausen</Link></li>
                <li><Link href="/taxi-essen-ruettenscheid" className="text-muted-foreground hover:text-primary transition-colors">Rüttenscheid</Link></li>
                <li><Link href="/taxi-essen-frohnhausen" className="text-muted-foreground hover:text-primary transition-colors">Frohnhausen</Link></li>
                <li><Link href="/taxi-essen-suedviertel" className="text-muted-foreground hover:text-primary transition-colors">Südviertel</Link></li>
                <li className="pt-2 border-t border-white/5"><Link href="/taxi-essen-hbf" className="text-muted-foreground hover:text-primary transition-colors">Hauptbahnhof</Link></li>
                <li><Link href="/flughafentransfer-essen-duesseldorf" className="text-muted-foreground hover:text-primary transition-colors">Flughafentransfer</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-white uppercase tracking-widest text-xs mb-6">{t("footer_legal")}</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="/book" className="text-muted-foreground hover:text-primary transition-colors">{t("nav_book")}</Link></li>
                <li className="pt-2 border-t border-white/5"><Link href="/impressum" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_imprint")}</Link></li>
                <li><Link href="/datenschutz" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_privacy")}</Link></li>
                <li><Link href="/agb" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_terms")}</Link></li>
              </ul>
            </div>
          </div>

          {/* Zahlungsarten */}
          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-1">Zahlung:</span>
              {/* Bargeld */}
              <span className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/60">
                <svg className="w-3.5 h-3.5 text-primary/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M22 10H2M6 14h.01"/>
                </svg>
                Bar
              </span>
              {/* EC-Karte */}
              <span className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/60">
                <svg className="w-3.5 h-3.5 text-primary/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
                </svg>
                EC-Karte
              </span>
              {/* Visa */}
              <span className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider" style={{ color: "#1a1f71" }}>
                <svg viewBox="0 0 48 48" className="w-8 h-4" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="6" fill="#1a1f71"/>
                  <path d="M19.5 31.5L21.9 16.5H25.9L23.5 31.5H19.5ZM15.1 16.5L11.3 26.3L10.8 23.7L10.8 23.7L9.4 17.7C9.1 16.7 8.3 16.5 7.3 16.5H1.1L1 16.9C2.4 17.2 4 17.7 5.3 18.4L8.7 31.5H12.9L19.1 16.5H15.1ZM41.5 31.5H45.3L42 16.5H38.6C37.7 16.5 37 17 36.6 17.8L30.7 31.5H34.9L35.7 29.2H40.8L41.5 31.5ZM36.8 26L39 20.1L40.2 26H36.8ZM32.1 20.3C31.7 19.9 30.8 19.5 29.7 19.5C27.6 19.5 26.1 20.6 26.1 22.1C26.1 23.3 27.1 23.9 28.8 24.7C30.5 25.4 30.8 25.8 30.8 26.4C30.8 27.2 29.9 27.6 29 27.6C27.7 27.6 27 27.3 26 26.8L25.5 26.5L25 29.5C25.6 29.8 26.8 30.1 28 30.1C30.3 30.1 31.9 29 31.9 27.4C31.9 26.5 31.3 25.8 29.8 25.1C28.2 24.4 27.2 23.9 27.2 23.3C27.2 22.7 27.9 22.2 29.2 22.2C30.3 22.2 31 22.5 31.7 22.8L32.1 23L32.6 20.1L32.1 20.3Z" fill="white"/>
                </svg>
              </span>
              {/* Mastercard */}
              <span className="flex items-center gap-1 bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5">
                <svg viewBox="0 0 48 30" className="w-9 h-5" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="15" r="13" fill="#EB001B"/>
                  <circle cx="30" cy="15" r="13" fill="#F79E1B"/>
                  <path d="M24 5.5a13 13 0 0 1 0 19A13 13 0 0 1 24 5.5z" fill="#FF5F00"/>
                </svg>
              </span>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Präzision in Bewegung.</span>
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>© {new Date().getFullYear()} Taxi B&B GmbH. Essen.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
