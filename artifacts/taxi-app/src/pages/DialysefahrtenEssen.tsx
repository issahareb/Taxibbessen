import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";
import { content } from "@/content/dialysefahrten-essen";

const schema = createServiceSchema({
  name: "Dialysefahrten in Essen",
  path: "/dialysefahrten-essen",
  description: "Regelmäßige Dialysefahrten in Essen und der Region. Fahrplan, Unterlagen und mögliche Abrechnung werden vor Beginn abgestimmt.",
  areaServed: ["Essen", "Bochum", "Gelsenkirchen", "Duisburg"],
});

const { title: _title, description: _desc } = getPageMeta('/dialysefahrten-essen');

export default function DialysefahrtenEssen() {
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
        { href: "/krankenfahrten-essen", label: "Krankenfahrten Essen" },
        { href: "/flughafentransfer-essen-duesseldorf", label: "Flughafentransfer Essen" },
        { href: "/grossraumtaxi-essen", label: "Großraumtaxi Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Dialysefahrten Essen"
    />
  );
}
