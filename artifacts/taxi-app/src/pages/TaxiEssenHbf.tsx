import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/taxi-essen-hbf";

const schema = createServiceSchema({
  name: "Taxi am Essen Hauptbahnhof",
  path: "/taxi-essen-hbf",
  description: "Vorbestellbare Taxifahrten vom und zum Essen Hauptbahnhof. Abholpunkt, Zugankunft, Gepäck und Ziel werden bei der Anfrage abgestimmt.",
  areaServed: ["Essen", "Essen Hauptbahnhof", "Essen-Stadtmitte"],
});

const { title: _title, description: _desc } = getPageMeta('/taxi-essen-hbf');

export default function TaxiEssenHbf() {
  return (
    <ServicePageTemplate
      title={_title}
      description={_desc}
      h1={content.h1}
      badge={content.badge}
      intro={content.intro}
      sections={content.sections}
      faq={content.faq}
      stadtteileLinks={[
        { href: "/taxi-essen-ruettenscheid", label: "Taxi Rüttenscheid" },
        { href: "/taxi-essen-holsterhausen", label: "Taxi Holsterhausen" },
        { href: "/taxi-essen-frohnhausen", label: "Taxi Frohnhausen" },
        { href: "/taxi-essen-suedviertel", label: "Taxi Südviertel" },
      ]}
      relatedLinks={[
        { href: "/flughafentransfer-essen-duesseldorf", label: "Flughafentransfer Essen" },
        { href: "/grossraumtaxi-essen", label: "Großraumtaxi Essen" },
        { href: "/krankenfahrten-essen", label: "Krankenfahrten Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Taxi Essen Hauptbahnhof"
    />
  );
}
