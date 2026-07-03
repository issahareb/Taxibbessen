import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/taxi-essen-ruettenscheid";

const schema = createServiceSchema({
  name: "Taxi in Essen-Rüttenscheid",
  path: "/taxi-essen-ruettenscheid",
  description: "Taxifahrten in Essen-Rüttenscheid zu Restaurants, Veranstaltungen, Messe Essen, Grugahalle und weiteren Zielen.",
  areaServed: ["Essen-Rüttenscheid", "Essen", "Nordrhein-Westfalen"],
});

const { title: _title, description: _desc } = getPageMeta('/taxi-essen-ruettenscheid');

export default function TaxiRuettenscheid() {
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
      breadcrumbLabel="Taxi Rüttenscheid"
    />
  );
}
