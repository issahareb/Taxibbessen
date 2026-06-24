import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";

const schema = createServiceSchema({
  name: "Dialysefahrten in Essen",
  path: "/dialysefahrten-essen",
  description: "Regelmäßige Dialysefahrten in Essen und der Region. Fahrplan, Unterlagen und mögliche Abrechnung werden vor Beginn abgestimmt.",
  areaServed: ["Essen", "Bochum", "Gelsenkirchen", "Duisburg"],
});

const sections = [
  {
    h2: "Regelmäßige Dialysefahrten in Essen",
    body: (
      <>
        <p>Dialysetermine finden häufig mehrmals pro Woche zu festen Zeiten statt. Taxi B&B GmbH kann dafür regelmäßige Hin- und Rückfahrten in Essen und der Region einplanen.</p>
        <p>Abholadresse, Dialysezentrum, Behandlungszeiten und gewünschte Rückfahrt werden vor Beginn gemeinsam abgestimmt.</p>
      </>
    ),
  },
  {
    h2: "Verordnung, Genehmigung und Abrechnung",
    body: (
      <>
        <p>Ob die gesetzliche Krankenversicherung die Fahrtkosten übernimmt, hängt von der ärztlichen Verordnung und den Vorgaben Ihrer Krankenkasse ab. Eine erforderliche Genehmigung sollte vor der ersten Fahrt vorliegen.</p>
        <p>Eine direkte Abrechnung kann bei entsprechend genehmigten Fahrten nach vorheriger Prüfung vereinbart werden. Bitte klären Sie die Unterlagen frühzeitig mit uns und Ihrer Krankenkasse.</p>
      </>
    ),
  },
  {
    h2: "Fester Fahrplan und verlässliche Kommunikation",
    body: (
      <>
        <p>Für wiederkehrende Termine kann ein fester Wochenplan eingerichtet werden. So stehen die regelmäßigen Abholzeiten fest und müssen nicht vor jedem Termin neu vereinbart werden.</p>
        <p>Änderungen, Ausfälle oder abweichende Behandlungszeiten sollten möglichst früh telefonisch mitgeteilt werden, damit der Fahrplan angepasst werden kann.</p>
      </>
    ),
  },
  {
    h2: "Dialysefahrt anfragen",
    body: (
      <>
        <p>Rufen Sie uns unter <strong>0201 707060</strong> an oder senden Sie eine <a href="/book" className="text-primary hover:underline">Online-Anfrage</a>. Für die Planung benötigen wir Abholadresse, Dialysezentrum, Terminzeiten, Personendaten und Informationen zu vorhandenen Unterlagen.</p>
      </>
    ),
  },
];

const faq = [
  {
    q: "Übernimmt die Krankenkasse die Kosten für Dialysefahrten?",
    a: "Dialysefahrten können unter bestimmten Voraussetzungen von der Krankenkasse übernommen werden. Maßgeblich sind die ärztliche Verordnung und gegebenenfalls eine Genehmigung Ihrer Krankenkasse.",
  },
  {
    q: "Kann Taxi B&B direkt mit der Krankenkasse abrechnen?",
    a: "Eine direkte Abrechnung kann bei genehmigten Fahrten nach vorheriger Prüfung möglich sein. Bitte stimmen Sie die benötigten Unterlagen vor der ersten Fahrt mit uns ab.",
  },
  {
    q: "Können wir einen festen Fahrplan einrichten?",
    a: "Ja, für regelmäßige Dialysefahrten kann ein wiederkehrender Wochenplan vereinbart werden. Änderungen sollten möglichst früh telefonisch gemeldet werden.",
  },
  {
    q: "Fahren Sie auch zu Dialysezentren außerhalb von Essen?",
    a: "Fahrten zu Einrichtungen in umliegenden Städten können angefragt werden. Verfügbarkeit, Fahrplan und Abrechnung werden vorab bestätigt.",
  },
];

const { title: _title, description: _desc } = getPageMeta('/dialysefahrten-essen');

export default function DialysefahrtenEssen() {
  return (
    <ServicePageTemplate
      title={_title}
      description={_desc}
      h1="Dialysefahrten Essen"
      badge="Regelmäßige Fahrten · Planbare Zeiten"
      intro="Regelmäßige Dialysefahrten in Essen mit abgestimmtem Fahrplan. Unterlagen, Voraussetzungen und Abrechnungsmöglichkeiten werden vor der ersten Fahrt geprüft."
      sections={sections}
      faq={faq}
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
