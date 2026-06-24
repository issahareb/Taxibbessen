import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";

const schema = createServiceSchema({
  name: "Taxi im Essen-Südviertel",
  path: "/taxi-essen-suedviertel",
  description: "Taxifahrten im Essener Südviertel zu Huyssenallee, Aalto-Theater, Philharmonie, Stadtgarten und weiteren Zielen.",
  areaServed: ["Essen-Südviertel", "Essen", "Nordrhein-Westfalen"],
});

const sections = [
  {
    h2: "Taxi an der Huyssenallee und im Südviertel",
    body: (
      <>
        <p>Das Essener Südviertel liegt zwischen Hauptbahnhof, Stadtgarten und Rüttenscheid. Taxi B&B kann Abholungen an Wohnadressen, Hotels, Büros und vereinbarten Treffpunkten entlang der <strong>Huyssenallee</strong> und in den umliegenden Straßen einplanen.</p>
        <p>Bei Geschäftsterminen oder Hotelabholungen sollte der Firmen- beziehungsweise Hotelname zusammen mit der vollständigen Adresse angegeben werden.</p>
      </>
    ),
  },
  {
    h2: "Kultur, Veranstaltungen und Geschäftstermine",
    body: (
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Aalto-Theater</strong> – Abholung nach einer Vorstellung an einem vereinbarten Treffpunkt</li>
        <li><strong>Philharmonie Essen und Saalbau</strong> – für Konzerte und Veranstaltungen</li>
        <li><strong>Stadtgarten Essen</strong> – Treffpunkt an einem vorher genannten Zugang</li>
        <li><strong>Huyssenallee</strong> – Hotels, Büros und Geschäftstermine</li>
        <li><strong>Essen Hauptbahnhof</strong> – kurze Verbindung zu Fern- und Regionalzügen</li>
      </ul>
    ),
  },
  {
    h2: "Flughafentransfer und Gruppenfahrten",
    body: (
      <>
        <p>Ein <a href="/flughafentransfer-essen-duesseldorf" className="text-primary hover:underline">Flughafentransfer nach Düsseldorf</a> kann aus dem Südviertel vorbestellt werden. Flugzeit, Personenzahl, Gepäck und gewünschte Abholung sollten vollständig angegeben werden.</p>
        <p>Für Gruppen kann eine <a href="/grossraumtaxi-essen" className="text-primary hover:underline">Mercedes V-Klasse für bis zu 7 Fahrgäste</a> angefragt werden. Fahrzeugverfügbarkeit und Preis werden vor der Fahrt bestätigt.</p>
      </>
    ),
  },
  {
    h2: "Taxi im Südviertel anfragen",
    body: (
      <>
        <p>Rufen Sie uns unter <strong>0201 707060</strong> an oder senden Sie eine <a href="/book" className="text-primary hover:underline">Online-Anfrage</a>. Bei Veranstaltungen empfiehlt sich eine frühzeitige Vorbestellung.</p>
      </>
    ),
  },
];

const faq = [
  {
    q: "Kann ich nach einer Veranstaltung im Aalto-Theater oder der Philharmonie abgeholt werden?",
    a: "Ja, eine Abholung kann vorbestellt werden. Wegen hoher Auslastung und möglicher Zufahrtsbeschränkungen sollte ein genauer Treffpunkt vereinbart werden.",
  },
  {
    q: "Wie bestelle ich ein Taxi zu einem Hotel an der Huyssenallee?",
    a: "Nennen Sie Hotelname, vollständige Adresse, gewünschte Zeit, Ziel und eine erreichbare Telefonnummer. Die Abholung wird anschließend bestätigt.",
  },
  {
    q: "Kann ich aus dem Südviertel einen Flughafentransfer buchen?",
    a: "Ja, Flughafentransfers können angefragt werden. Personenzahl, Gepäck, Flugzeit, Fahrzeug und Preis werden vor der Fahrt abgestimmt.",
  },
];

const { title: _title, description: _desc } = getPageMeta('/taxi-essen-suedviertel');

export default function TaxiSuedviertel() {
  return (
    <ServicePageTemplate
      title={_title}
      description={_desc}
      h1="Taxi Südviertel Essen"
      badge="Huyssenallee · Aalto-Theater · Philharmonie"
      intro="Taxifahrten im Essener Südviertel zu Hotels, Büros, Kulturveranstaltungen, dem Hauptbahnhof und weiteren Zielen."
      sections={sections}
      faq={faq}
      stadtteileLinks={[
        { href: "/taxi-essen-hbf", label: "Taxi Essen HBF" },
        { href: "/taxi-essen-ruettenscheid", label: "Taxi Rüttenscheid" },
        { href: "/taxi-essen-holsterhausen", label: "Taxi Holsterhausen" },
        { href: "/taxi-essen-frohnhausen", label: "Taxi Frohnhausen" },
      ]}
      relatedLinks={[
        { href: "/flughafentransfer-essen-duesseldorf", label: "Flughafentransfer Essen" },
        { href: "/krankenfahrten-essen", label: "Krankenfahrten Essen" },
        { href: "/grossraumtaxi-essen", label: "Großraumtaxi Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Taxi Südviertel Essen"
    />
  );
}
