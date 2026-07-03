import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/krankenfahrten-essen";

const schema = createServiceSchema({
  name: "Krankenfahrten in Essen",
  path: "/krankenfahrten-essen",
  description: "Krankenfahrten in Essen zu Arztterminen, Therapien, Kliniken und Reha-Einrichtungen. Voraussetzungen und Abrechnung werden vor der Fahrt abgestimmt.",
  areaServed: ["Essen", "Bochum", "Duisburg", "Ruhrgebiet"],
});

const { title: _title, description: _desc } = getPageMeta('/krankenfahrten-essen');

export default function KrankenfahrtenEssen() {
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
        { href: "/dialysefahrten-essen/", label: "Dialysefahrten Essen" },
        { href: "/flughafentransfer-essen-duesseldorf/", label: "Flughafentransfer Essen" },
        { href: "/grossraumtaxi-essen/", label: "Großraumtaxi Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Krankenfahrten Essen"
    />
  );
}
