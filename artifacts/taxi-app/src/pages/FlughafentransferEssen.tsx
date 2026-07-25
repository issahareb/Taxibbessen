import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/flughafentransfer-essen-duesseldorf";

const schema = createServiceSchema({
  name: "Flughafentransfer Essen Düsseldorf",
  path: "/flughafentransfer-essen-duesseldorf",
  description: "Flughafentransfer von Essen nach Düsseldorf sowie zu weiteren Flughäfen. Fahrzeug, Abholzeit und Preis werden vor der Fahrt abgestimmt.",
  areaServed: ["Essen", "Düsseldorf", "Köln/Bonn", "Dortmund", "Frankfurt"],
});

const { title: _title, description: _desc } = getPageMeta('/flughafentransfer-essen-duesseldorf');

export default function FlughafentransferEssen() {
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
        { href: "/grossraumtaxi-essen/", label: "Großraumtaxi Essen" },
        { href: "/krankenfahrten-essen/", label: "Krankenfahrten Essen" },
        { href: "/kurierdienst-essen/", label: "Kurierdienst Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Flughafentransfer Essen Düsseldorf"
    />
  );
}
