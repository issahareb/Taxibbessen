import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/taxi-essen-frohnhausen";

const schema = createServiceSchema({
  name: "Taxi in Essen-Frohnhausen",
  path: "/taxi-essen-frohnhausen",
  description: "Taxifahrten in Essen-Frohnhausen zu Wohnadressen, dem S-Bahnhof, lokalen Treffpunkten und weiteren Zielen in Essen.",
  areaServed: ["Essen-Frohnhausen", "Essen", "Nordrhein-Westfalen"],
});

const { title: _title, description: _desc } = getPageMeta('/taxi-essen-frohnhausen');

export default function TaxiFrohnhausen() {
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
        { href: "/taxi-essen-hbf/", label: "Taxi Essen HBF" },
        { href: "/taxi-essen-ruettenscheid/", label: "Taxi Rüttenscheid" },
        { href: "/taxi-essen-holsterhausen/", label: "Taxi Holsterhausen" },
        { href: "/taxi-essen-suedviertel/", label: "Taxi Südviertel" },
      ]}
      relatedLinks={[
        { href: "/flughafentransfer-essen-duesseldorf/", label: "Flughafentransfer Essen" },
        { href: "/krankenfahrten-essen/", label: "Krankenfahrten Essen" },
        { href: "/grossraumtaxi-essen/", label: "Großraumtaxi Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Taxi Frohnhausen"
    />
  );
}
