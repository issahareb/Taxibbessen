import { usePageMeta } from "@/hooks/use-page-meta";
import { getPageMeta } from "@/page-meta-manifest";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Car,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Phone,
  Route,
} from "lucide-react";
import { motion } from "framer-motion";
import { BUSINESS } from "@/seo/business";

const services = [
  { label: "Krankenfahrten Essen", href: "/krankenfahrten-essen" },
  { label: "Flughafentransfer Düsseldorf", href: "/flughafentransfer-essen-duesseldorf" },
  { label: "Großraumtaxi Essen", href: "/grossraumtaxi-essen" },
  { label: "Kurierdienst Essen", href: "/kurierdienst-essen" },
  { label: "Dialysefahrten Essen", href: "/dialysefahrten-essen" },
  { label: "Unsere Fahrzeuge", href: "/fahrzeuge" },
];

const facts = [
  {
    icon: CalendarDays,
    title: "Seit 1992 in Essen",
    text: "Taxi B&B GmbH ist seit 1992 in Essen tätig. Das Gründungsjahr ist Bestandteil der offiziellen Unternehmensangaben.",
  },
  {
    icon: MapPin,
    title: "Sitz in Holsterhausen",
    text: "Der Unternehmenssitz befindet sich in der Menzelstraße 8-10, 45147 Essen-Holsterhausen.",
  },
  {
    icon: Clock,
    title: "Rund um die Uhr erreichbar",
    text: "Anfragen und Vorbestellungen werden telefonisch rund um die Uhr entgegengenommen. Die konkrete Verfügbarkeit wird bei der Anfrage bestätigt.",
  },
  {
    icon: Car,
    title: "Unterschiedliche Fahrzeuggrößen",
    text: "Je nach Personenzahl und Gepäck kann ein passendes Fahrzeug angefragt werden. Für Gruppen steht auf Anfrage eine Mercedes V-Klasse zur Verfügung.",
  },
  {
    icon: Route,
    title: "Fahrten in Essen und darüber hinaus",
    text: "Neben Fahrten innerhalb Essens können Flughafen-, Fern- und Kurierfahrten nach vorheriger Abstimmung geplant werden.",
  },
  {
    icon: Building2,
    title: "Eingetragene GmbH",
    text: "Taxi B&B GmbH ist beim Amtsgericht Essen unter der Handelsregisternummer HRB 36284 eingetragen.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
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

export default function UeberUns() {
  const { title, description } = getPageMeta('/ueber-uns');
  usePageMeta({ title, description });

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="relative bg-gradient-to-b from-white/5 to-transparent border-b border-white/5 pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <Reveal>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Zurück zur Startseite
              </Link>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="text-4xl sm:text-5xl font-display font-bold leading-tight mb-5">
                Über Taxi B&amp;B GmbH<br />
                <span className="text-primary">in Essen</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Taxi B&amp;B GmbH ist ein Essener Taxiunternehmen mit Sitz in Holsterhausen. Seit 1992 werden Fahrten innerhalb der Stadt sowie vorbestellte Flughafen-, Kranken-, Gruppen- und Kurierfahrten angeboten.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 sm:py-20 space-y-14">
          <section className="space-y-5">
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-display font-bold">Das Unternehmen</h2>
            </Reveal>
            <div className="space-y-4 text-[15px] sm:text-base text-foreground/80 leading-relaxed">
              <Reveal delay={0.05}>
                <p>
                  Taxi B&amp;B GmbH wurde 1992 in Essen gegründet. Der heutige Unternehmenssitz liegt in der Menzelstraße 8-10 in Essen-Holsterhausen. Die Gesellschaft ist beim Amtsgericht Essen unter HRB 36284 eingetragen.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p>
                  Zum Leistungsangebot gehören klassische Taxifahrten, Flughafentransfers, Kranken- und Dialysefahrten, Großraumfahrten und Kurierdienste. Welche Fahrt möglich ist, welches Fahrzeug eingesetzt wird und welcher Preis gilt, wird bei der Anfrage individuell bestätigt.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p>
                  Bei Kranken- und Dialysefahrten hängen Kostenübernahme und direkte Abrechnung von einer gültigen Verordnung, einer gegebenenfalls erforderlichen Genehmigung und den Vorgaben der jeweiligen Krankenkasse ab. Diese Voraussetzungen werden vor Fahrtbeginn abgestimmt.
                </p>
              </Reveal>
            </div>
          </section>

          <section className="space-y-5">
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-display font-bold">Verbindliche Unternehmensdaten</h2>
            </Reveal>
            <Reveal delay={0.05}>
              <dl className="grid sm:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Unternehmen</dt>
                  <dd className="font-semibold">{BUSINESS.legalName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Gegründet</dt>
                  <dd className="font-semibold">{BUSINESS.foundingYear}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Adresse</dt>
                  <dd className="font-semibold">{BUSINESS.address.streetAddress}, {BUSINESS.address.postalCode} {BUSINESS.address.addressLocality}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Handelsregister</dt>
                  <dd className="font-semibold">{BUSINESS.register}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Telefon</dt>
                  <dd><a href="tel:0201707060" className="font-semibold text-primary hover:underline">{BUSINESS.telephoneDisplay}</a></dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wider mb-1">E-Mail</dt>
                  <dd><a href={`mailto:${BUSINESS.email}`} className="font-semibold text-primary hover:underline">{BUSINESS.email}</a></dd>
                </div>
              </dl>
            </Reveal>
          </section>

          <section className="space-y-5">
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-display font-bold">Was Taxi B&amp;B anbietet</h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {facts.map((fact, index) => {
                const Icon = fact.icon;
                return (
                  <Reveal key={fact.title} delay={index * 0.05}>
                    <div className="bg-card border border-border rounded-xl p-5 space-y-2.5 h-full">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-[18px] h-[18px] text-primary" />
                      </div>
                      <h3 className="font-bold text-sm">{fact.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{fact.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </section>

          <section className="space-y-5">
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-display font-bold">Leistungen im Überblick</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((service, index) => (
                <Reveal key={service.href} delay={index * 0.04}>
                  <Link
                    href={service.href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-4 hover:border-primary/40 transition-colors"
                  >
                    <span className="font-semibold text-sm">{service.label}</span>
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          <Reveal>
            <section className="rounded-2xl border border-primary/20 bg-primary/5 p-7 sm:p-9">
              <h2 className="text-xl sm:text-2xl font-display font-bold mb-3">Fahrt oder Leistung anfragen</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                Nennen Sie Abholort, Ziel, gewünschten Zeitpunkt, Personenzahl und besondere Anforderungen. Verfügbarkeit, Fahrzeug und Preis werden anschließend bestätigt.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="tel:0201707060" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold px-5 py-3">
                  <Phone className="w-4 h-4" />
                  {BUSINESS.telephoneDisplay}
                </a>
                <a href={`mailto:${BUSINESS.email}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card font-bold px-5 py-3 hover:border-primary/40 transition-colors">
                  <Mail className="w-4 h-4" />
                  E-Mail senden
                </a>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </Layout>
  );
}
