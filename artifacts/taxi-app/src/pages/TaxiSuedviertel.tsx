import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/taxi-essen-suedviertel";

const schema = createServiceSchema({
  name: "Taxi im Essen-Südviertel",
  path: "/taxi-essen-suedviertel",
  description: "Taxifahrten im Essener Südviertel zu Huyssenallee, Aalto-Theater, Philharmonie, Stadtgarten und weiteren Zielen.",
  areaServed: ["Essen-Südviertel", "Essen", "Nordrhein-Westfalen"],
});

const { title: _title, description: _desc } = getPageMeta('/taxi-essen-suedviertel');

export default function TaxiSuedviertel() {
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
        { href: "/taxi-essen-hbf", label: "Taxi Essen HBF" },
        { href: "/taxi-essen-ruettenscheid", label: "Taxi Rüttenscheid" },
        { href: "/taxi-essen-holsterhausen", label: "Taxi Holsterhausen" },
        { href: "/taxi-essen-frohnhausen", label: "Taxi Frohnhausen" },
      ]}
      relatedLinks={[
        { href: "/flughafentransfer-essen-duesseldorf", label: "Flughafentransfer Essen" },
        { href: "/krankenfahrten-essen", label: "Krankenfahrten Essen" },
        { href: "/grossraumtaxi-essen", label: "Großraumtaxi Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Taxi Südviertel Essen"
    />
  );
}
