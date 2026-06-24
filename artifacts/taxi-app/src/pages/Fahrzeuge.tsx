import { usePageMeta } from "@/hooks/use-page-meta";
import { getPageMeta } from "@/page-meta-manifest";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Car,
  CheckCircle,
  Leaf,
  Phone,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const vehicles = [
  {
    image: "car-kombi2.webp",
    category: "Kombi",
    model: "Mercedes E-Klasse T-Modell",
    icon: BriefcaseBusiness,
    description: "Geeignet für klassische Taxifahrten, Geschäftstermine und Flughafentransfers mit normaler Personenzahl und Gepäck.",
    features: [
      "Bis zu 4 Fahrgäste",
      "Kofferraum für übliches Reisegepäck",
      "Klimatisierter Fahrgastraum",
      "Fahrzeugverfügbarkeit wird bestätigt",
    ],
  },
  {
    image: "car-grossraum2.webp",
    category: "Großraumtaxi",
    model: "Mercedes V-Klasse",
    icon: Users,
    description: "Für Familien, Gruppen und Firmenteams. Die mögliche Gepäckmenge hängt von der tatsächlichen Zahl der Fahrgäste ab.",
    features: [
      "Bis zu 7 Fahrgäste",
      "Für Gruppen- und Flughafenfahrten",
      "Zusätzliche Anforderungen vorab angeben",
      "Kindersitz nur nach Bestätigung",
    ],
  },
  {
    image: "car-elektro2.webp",
    category: "Hybrid",
    model: "Mercedes E 300 e",
    icon: Leaf,
    description: "Plug-in-Hybrid-Fahrzeug für komfortable Fahrten in Essen und der Region. Der konkrete Fahrzeugeinsatz hängt von der Verfügbarkeit ab.",
    features: [
      "Plug-in-Hybrid-Antrieb",
      "Bis zu 4 Fahrgäste",
      "Klimatisierter Fahrgastraum",
      "Einsatz nach Verfügbarkeit",
    ],
  },
];

const { title: pageTitle, description: pageDescription } = getPageMeta('/fahrzeuge');

export default function Fahrzeuge() {
  usePageMeta({ title: pageTitle, description: pageDescription });

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24">
        <header className="border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent pt-10 pb-12 sm:pt-16 sm:pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Startseite
            </Link>

            <div className="max-w-3xl">
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-4">Taxi B&amp;B GmbH · Essen</p>
              <h1 className="font-display font-black uppercase tracking-tighter leading-none mb-5" style={{ fontSize: "clamp(2.5rem,7vw,5.5rem)" }}>
                Unsere <span className="text-primary">Fahrzeuge</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Unterschiedliche Fahrzeuggrößen für klassische Taxifahrten, Gruppen und Flughafentransfers. Teilen Sie uns Personenzahl, Gepäck und besondere Anforderungen mit; das passende verfügbare Fahrzeug wird anschließend bestätigt.
              </p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-14 sm:py-20">
          <div className="grid lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => {
              const Icon = vehicle.icon;
              return (
                <motion.article
                  key={vehicle.model}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-black/20">
                    <img
                      src={`${import.meta.env.BASE_URL}${vehicle.image}`}
                      alt={`${vehicle.model} von Taxi B&B GmbH`}
                      width="900"
                      height="675"
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent" />
                    <div className="absolute left-5 bottom-4 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary text-black flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{vehicle.category}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="font-display font-black text-xl text-white mb-3">{vehicle.model}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{vehicle.description}</p>
                    <ul className="space-y-2 mb-6">
                      {vehicle.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-white/65">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="tel:0201707060"
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold px-4 py-3 hover:bg-primary hover:text-black transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Fahrzeug anfragen
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <section className="mt-14 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 sm:p-10">
            <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                  <h2 className="font-display font-black text-xl sm:text-2xl">Welches Fahrzeug wird benötigt?</h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Geben Sie Personenzahl, Anzahl und Größe der Gepäckstücke, Kinderwagen, Rollator oder weitere Anforderungen an. Wir prüfen anschließend, welches Fahrzeug verfügbar und geeignet ist.
                </p>
              </div>
              <a
                href="tel:0201707060"
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-black font-black px-6 py-3.5 hover:shadow-[0_0_24px_rgba(255,193,7,0.4)] transition-shadow"
              >
                <Phone className="w-4 h-4" />
                0201 707060
              </a>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
