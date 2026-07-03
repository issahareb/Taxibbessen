import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/taxi-essen-holsterhausen";

const schema = createServiceSchema({
  name: "Taxi in Essen-Holsterhausen",
  path: "/taxi-essen-holsterhausen",
  description: "Taxifahrten in Essen-Holsterhausen mit Abholung an Wohnadressen, dem Universitätsklinikum und weiteren Zielen im Stadtteil.",
  areaServed: ["Essen-Holsterhausen", "Essen", "Nordrhein-Westfalen"],
});

const { title: _title, description: _desc } = getPageMeta('/taxi-essen-holsterhausen');

export default function TaxiHolsterhausen() {
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
        { href: "/taxi-essen-frohnhausen", label: "Taxi Frohnhausen" },
        { href: "/taxi-essen-suedviertel", label: "Taxi Südviertel" },
      ]}
      relatedLinks={[
        { href: "/flughafentransfer-essen-duesseldorf", label: "Flughafentransfer Essen" },
        { href: "/krankenfahrten-essen", label: "Krankenfahrten Essen" },
        { href: "/grossraumtaxi-essen", label: "Großraumtaxi Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Taxi Holsterhausen"
    />
  );
}
