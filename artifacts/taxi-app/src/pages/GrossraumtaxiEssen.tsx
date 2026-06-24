import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";

const schema = createServiceSchema({
  name: "Großraumtaxi in Essen",
  path: "/grossraumtaxi-essen",
  description: "Großraumtaxi in Essen für Gruppen und Familien. Personenzahl, Gepäck, Fahrzeugverfügbarkeit und Preis werden vor der Fahrt bestätigt.",
  areaServed: ["Essen", "Ruhrgebiet", "Düsseldorf", "Nordrhein-Westfalen"],
});

const sections = [
  {
    h2: "Mercedes V-Klasse für Gruppenfahrten",
    body: (
      <>
        <p>Für größere Gruppen kann eine <strong>Mercedes V-Klasse für bis zu 7 Fahrgäste</strong> angefragt werden. Das Fahrzeug eignet sich unter anderem für Familien, Reisegruppen und Firmenteams.</p>
        <p>Die mögliche Gepäckmenge hängt von der tatsächlichen Personenzahl ab. Bitte nennen Sie bei der Anfrage alle Fahrgäste, Koffer, Kinderwagen oder weiteren Gegenstände.</p>
      </>
    ),
  },
  {
    h2: "Typische Einsatzbereiche",
    body: (
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Flughafentransfer für Gruppen</strong> – gemeinsame An- und Abreise</li>
        <li><strong>Familienfahrten</strong> – mit vorab abgestimmtem Platzbedarf</li>
        <li><strong>Firmenfahrten und Delegationen</strong> – planbare Abholzeiten</li>
        <li><strong>Hochzeiten und Veranstaltungen</strong> – nach Vorbestellung</li>
        <li><strong>Bahnhof, Hotel oder Konzert</strong> – eine Fahrt für die gesamte Gruppe</li>
      </ul>
    ),
  },
  {
    h2: "Kindersitze und besondere Anforderungen",
    body: (
      <>
        <p>Kindersitze und zusätzlicher Platz für Rollator, Kinderwagen oder Sportausrüstung müssen bei der Buchung ausdrücklich angefragt werden. Die Verfügbarkeit wird vor der Fahrt bestätigt.</p>
        <p>Geben Sie bei Kindersitzen bitte Alter und Gewicht des Kindes an, damit geprüft werden kann, welche Ausstattung benötigt wird.</p>
      </>
    ),
  },
  {
    h2: "Großraumtaxi in Essen anfragen",
    body: (
      <>
        <p>Rufen Sie uns unter <strong>0201 707060</strong> an oder senden Sie eine <a href="/book" className="text-primary hover:underline">Online-Anfrage</a>. Personenzahl, Gepäck, Abholort, Ziel und gewünschte Zeit sollten vollständig angegeben werden.</p>
        <p>Fahrzeugverfügbarkeit und Preis werden vor der Fahrt bestätigt.</p>
      </>
    ),
  },
];

const faq = [
  {
    q: "Wie viele Personen können mit dem Großraumtaxi fahren?",
    a: "Eine Mercedes V-Klasse für bis zu 7 Fahrgäste kann angefragt werden. Die mögliche Gepäckmenge hängt von der Personenzahl ab und sollte vorab abgestimmt werden.",
  },
  {
    q: "Sind Kindersitze verfügbar?",
    a: "Kindersitze können angefragt werden. Bitte nennen Sie Alter und Gewicht des Kindes; die Verfügbarkeit wird vor der Fahrt bestätigt.",
  },
  {
    q: "Kann ich das Großraumtaxi für einen Flughafentransfer buchen?",
    a: "Ja, Gruppenfahrten zu Flughäfen können angefragt werden. Geben Sie Personenzahl, Gepäckmenge und Flugdaten bei der Buchung an.",
  },
  {
    q: "Was kostet ein Großraumtaxi in Essen?",
    a: "Der Preis richtet sich nach Strecke, Abholzeit und Anforderungen. Sie erhalten nach vollständiger Anfrage eine konkrete Auskunft.",
  },
];

const { title: _title, description: _desc } = getPageMeta('/grossraumtaxi-essen');

export default function GrossraumtaxiEssen() {
  return (
    <ServicePageTemplate
      title={_title}
      description={_desc}
      h1="Großraumtaxi Essen"
      badge="Bis zu 7 Fahrgäste · Mercedes V-Klasse"
      intro="Großraumtaxi für Gruppen, Familien und Firmenteams in Essen. Personenzahl, Gepäck und besondere Anforderungen werden vor der Fahrt abgestimmt."
      sections={sections}
      faq={faq}
      relatedLinks={[
        { href: "/flughafentransfer-essen-duesseldorf", label: "Flughafentransfer Essen" },
        { href: "/krankenfahrten-essen", label: "Krankenfahrten Essen" },
        { href: "/kurierdienst-essen", label: "Kurierdienst Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Großraumtaxi Essen"
    />
  );
}
