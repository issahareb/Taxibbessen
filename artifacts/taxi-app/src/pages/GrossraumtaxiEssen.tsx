import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/grossraumtaxi-essen";

const schema = createServiceSchema({
  name: "Großraumtaxi in Essen",
  path: "/grossraumtaxi-essen",
  description: "Großraumtaxi in Essen für Gruppen und Familien. Personenzahl, Gepäck, Fahrzeugverfügbarkeit und Preis werden vor der Fahrt bestätigt.",
  areaServed: ["Essen", "Ruhrgebiet", "Düsseldorf", "Nordrhein-Westfalen"],
});

const { title: _title, description: _desc } = getPageMeta('/grossraumtaxi-essen');

export default function GrossraumtaxiEssen() {
  return (
    <ServicePageTemplate
      title={_title}
      description={_desc}
      h1={content.h1}
      badge={content.badge}
      intro={content.intro}
      sections={content.sections}
      faq={content.faq}
      relatedLinks={[
        { href: "/flughafentransfer-essen-duesseldorf/", label: "Flughafentransfer Essen" },
        { href: "/krankenfahrten-essen/", label: "Krankenfahrten Essen" },
        { href: "/kurierdienst-essen/", label: "Kurierdienst Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Großraumtaxi Essen"
    />
  );
}
