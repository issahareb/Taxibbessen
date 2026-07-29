import { Layout } from "@/components/Layout";
import { usePageMeta } from "@/hooks/use-page-meta";
import { getPageMeta } from "@/page-meta-manifest";
import { Link } from "wouter";
import {
  ArrowRight,
  Car,
  CheckCircle,
  Clock,
  HeartHandshake,
  MapPin,
  Plane,
  Stethoscope,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Car,
    title: "Taxifahrten in Essen",
    text: "Zuverlässig von A nach B, bei Bedarf auch vorbestellt und rund um die Uhr erreichbar.",
  },
  {
    icon: Plane,
    title: "Flughafentransfer",
    text: "Entspannt zum Flughafen und wieder zurück, passend zu Ihrer Abflug- oder Ankunftszeit.",
  },
  {
    icon: Stethoscope,
    title: "Kranken- und Dialysefahrten",
    text: "Planbare Fahrten zu Arztpraxen, Kliniken, Therapien und regelmäßigen Behandlungen.",
  },
  {
    icon: Users,
    title: "Fahrten für mehrere Personen",
    text: "Für Familien, Gruppen und zusätzliches Gepäck organisieren wir ein passendes Fahrzeug.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default function EcoTaxi() {
  const { title, description } = getPageMeta("/eco-taxi");
  usePageMeta({ title, description });

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-primary/10 via-background to-background pt-28 pb-20 sm:pt-36 sm:pb-24">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 right-[-6rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-8rem] left-[-5rem] h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-7">
                <CheckCircle className="h-4 w-4" />
                Eco Taxi gehört jetzt zu Taxi B&amp;B
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="max-w-3xl text-4xl font-display font-bold leading-tight sm:text-5xl lg:text-6xl">
                Aus Eco Taxi wird
                <span className="block text-primary">Taxi B&amp;B Essen</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Für unsere Fahrgäste bleibt das Wichtigste gleich: ein zuverlässiger Service, angenehme Fahrten und ein Team, das sich kümmert. Eco Taxi wird heute unter dem Namen Taxi B&amp;B weitergeführt.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Weiter zu Taxi B&amp;B
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="tel:0201707060"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 font-bold transition-colors hover:border-primary/40"
                >
                  0201 707060 anrufen
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="container mx-auto max-w-4xl space-y-16 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <Reveal>
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Vertrauter Service, neuer Name</p>
                <h2 className="text-3xl font-display font-bold sm:text-4xl">Wir fahren für Sie weiter</h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/80">
                  <p>
                    Viele Menschen in Essen kennen Eco Taxi seit Jahren. Diesen Service führen wir weiter, nun gemeinsam unter dem Namen Taxi B&amp;B. Sie erreichen uns über dieselbe zentrale Anlaufstelle und können sich weiterhin auf eine freundliche, pünktliche und sichere Beförderung verlassen.
                  </p>
                  <p>
                    Ob kurze Fahrt durch Essen, Termin im Krankenhaus, regelmäßige Dialysefahrt, Flughafentransfer oder Fahrt mit mehreren Personen: Wir planen die passende Lösung und stimmen besondere Wünsche vorab mit Ihnen ab.
                  </p>
                  <p>
                    Unser Anspruch ist einfach. Sie sollen sich von der Buchung bis zur Ankunft gut aufgehoben fühlen.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
                <HeartHandshake className="h-10 w-10 text-primary" />
                <h3 className="mt-5 text-xl font-bold">Was sich für Sie nicht ändert</h3>
                <ul className="mt-5 space-y-4 text-sm text-foreground/80">
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>Erreichbarkeit rund um die Uhr für Anfragen und Vorbestellungen</span>
                  </li>
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>Fahrten in Essen sowie zu Flughäfen und Zielen außerhalb der Stadt</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>Persönliche Abstimmung bei besonderen Anforderungen</span>
                  </li>
                </ul>
              </div>
            </Reveal>
          </section>

          <section>
            <Reveal>
              <div className="text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Unsere Leistungen</p>
                <h2 className="text-3xl font-display font-bold sm:text-4xl">Für viele Wege die passende Fahrt</h2>
                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                  Der bekannte Eco-Taxi-Service wird durch das Angebot von Taxi B&amp;B ergänzt. So können wir unterschiedliche Fahrten zuverlässig aus einer Hand organisieren.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Reveal key={service.title} delay={index * 0.05}>
                    <article className="h-full rounded-2xl border border-border bg-card p-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mt-5 text-lg font-bold">{service.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.text}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </section>

          <Reveal>
            <section className="rounded-3xl border border-primary/20 bg-primary/10 p-8 text-center sm:p-12">
              <h2 className="text-2xl font-display font-bold sm:text-3xl">Willkommen bei Taxi B&amp;B</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                Sie waren bisher bei Eco Taxi? Dann sind Sie bei uns weiterhin richtig. Lernen Sie Taxi B&amp;B kennen oder nehmen Sie direkt Kontakt mit uns auf.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground"
                >
                  Zu Taxi B&amp;B Essen
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 font-bold transition-colors hover:border-primary/40"
                >
                  Fahrt anfragen
                </Link>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </Layout>
  );
}
