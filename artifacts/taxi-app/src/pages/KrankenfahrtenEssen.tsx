import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";

const schema = createServiceSchema({
  name: "Krankenfahrten in Essen",
  path: "/krankenfahrten-essen",
  description: "Krankenfahrten in Essen zu Arztterminen, Therapien, Kliniken und Reha-Einrichtungen. Voraussetzungen und Abrechnung werden vor der Fahrt abgestimmt.",
  areaServed: ["Essen", "Bochum", "Duisburg", "Ruhrgebiet"],
});

const sections = [
  {
    h2: "Krankenfahrten mit vorheriger Abstimmung",
    body: (
      <>
        <p>Taxi B&B GmbH übernimmt Krankenfahrten in Essen und Umgebung, beispielsweise zu Arztterminen, Kliniken und ambulanten Therapien. Ob eine Kostenübernahme möglich ist, hängt von der ärztlichen Verordnung, einer möglichen Genehmigung und den Vorgaben Ihrer Krankenkasse ab.</p>
        <p>Eine direkte Abrechnung kann bei entsprechend genehmigten Fahrten nach vorheriger Prüfung vereinbart werden. Bitte stimmen Sie die Unterlagen und Abrechnungsart vor der ersten Fahrt mit uns ab.</p>
      </>
    ),
  },
  {
    h2: "Für welche Fahrten kann der Service angefragt werden?",
    body: (
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Dialysefahrten</strong> – regelmäßig und nach festem Zeitplan</li>
        <li><strong>Strahlen- und Chemotherapietermine</strong> – planbare Hin- und Rückfahrten</li>
        <li><strong>Arzttermine und Fachkliniken</strong> – in Essen und der Region</li>
        <li><strong>Reha und Physiotherapie</strong> – nach vorheriger Terminabstimmung</li>
        <li><strong>Krankenhausaufnahme und Entlassung</strong> – mit vereinbartem Abholzeitpunkt</li>
      </ul>
    ),
  },
  {
    h2: "Planbare Abholung und persönliche Unterstützung",
    body: (
      <>
        <p>Unsere Fahrer kennen viele Kliniken, Dialysezentren und Arztpraxen in Essen und der Region. Bei der Buchung können Sie mitteilen, ob Hilfe beim Ein- und Aussteigen oder eine Begleitung bis zum Eingang benötigt wird.</p>
        <p>Medizinische Betreuung oder qualifizierter Krankentransport gehören nicht zu einer normalen Taxifahrt. Bei medizinischem Überwachungsbedarf wenden Sie sich bitte an einen geeigneten Krankentransportdienst.</p>
      </>
    ),
  },
  {
    h2: "Krankenfahrt in Essen anfragen",
    body: (
      <>
        <p>Rufen Sie uns unter <strong>0201 707060</strong> an oder senden Sie eine <a href="/book" className="text-primary hover:underline">Online-Anfrage</a>. Halten Sie vorhandene Verordnungen, Genehmigungen, Terminzeiten und die vollständigen Abhol- und Zieladressen bereit.</p>
        <p>Für regelmäßige Fahrten kann nach Abstimmung ein wiederkehrender Fahrplan eingerichtet werden.</p>
      </>
    ),
  },
];

const faq = [
  {
    q: "Wann übernimmt die Krankenkasse die Kosten einer Krankenfahrt?",
    a: "Das hängt von der Art der Behandlung, der ärztlichen Verordnung und gegebenenfalls einer vorherigen Genehmigung der Krankenkasse ab. Klären Sie die Voraussetzungen vor Fahrtbeginn mit Ihrer Krankenkasse.",
  },
  {
    q: "Kann Taxi B&B direkt mit meiner Krankenkasse abrechnen?",
    a: "Bei genehmigten Fahrten kann eine direkte Abrechnung nach vorheriger Prüfung möglich sein. Bitte senden oder zeigen Sie uns die erforderlichen Unterlagen vor der ersten Fahrt.",
  },
  {
    q: "Fahren Sie auch nachts oder am Wochenende?",
    a: "Taxi B&B ist rund um die Uhr erreichbar. Medizinisch planbare Fahrten sollten trotzdem möglichst frühzeitig vorbestellt werden.",
  },
  {
    q: "Können regelmäßige Fahrten eingerichtet werden?",
    a: "Ja, für wiederkehrende Termine wie Dialyse oder Therapie kann nach Abstimmung ein fester Fahrplan eingerichtet werden. Änderungen sollten möglichst früh telefonisch mitgeteilt werden.",
  },
];

const { title: _title, description: _desc } = getPageMeta('/krankenfahrten-essen');

export default function KrankenfahrtenEssen() {
  return (
    <ServicePageTemplate
      title={_title}
      description={_desc}
      h1="Krankenfahrten Essen"
      badge="Taxi B&B GmbH · Seit 1992"
      intro="Krankenfahrten zu Arztterminen, Therapien und Kliniken in Essen. Voraussetzungen, Unterlagen und Abrechnungsmöglichkeiten stimmen wir vor der Fahrt mit Ihnen ab."
      sections={sections}
      faq={faq}
      relatedLinks={[
        { href: "/dialysefahrten-essen", label: "Dialysefahrten Essen" },
        { href: "/flughafentransfer-essen-duesseldorf", label: "Flughafentransfer Essen" },
        { href: "/grossraumtaxi-essen", label: "Großraumtaxi Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Krankenfahrten Essen"
    />
  );
}
