import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/kurierdienst-essen";

const schema = createServiceSchema({
  name: "Kurierdienst in Essen",
  path: "/kurierdienst-essen",
  description: "Direkte Kurierfahrten für Dokumente und kleinere Sendungen in Essen und der Region. Abholung, Ziel, Inhalt und Übergabe werden vorab abgestimmt.",
  areaServed: ["Essen", "Ruhrgebiet", "Nordrhein-Westfalen"],
});

const { title: _title, description: _desc } = getPageMeta('/kurierdienst-essen');

export default function KurierdienstEssen() {
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
        { href: "/grossraumtaxi-essen/", label: "Großraumtaxi Essen" },
        { href: "/krankenfahrten-essen/", label: "Krankenfahrten Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Kurierdienst Essen"
    />
  );
}
