import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";

const schema = createServiceSchema({
  name: "Taxi in Essen-Rüttenscheid",
  path: "/taxi-essen-ruettenscheid",
  description: "Taxifahrten in Essen-Rüttenscheid zu Restaurants, Veranstaltungen, Messe Essen, Grugahalle und weiteren Zielen.",
  areaServed: ["Essen-Rüttenscheid", "Essen", "Nordrhein-Westfalen"],
});

const sections = [
  {
    h2: "Taxi auf der Rüttenscheider Straße und im Stadtteil",
    body: (
      <>
        <p>Rüttenscheid verbindet Wohngebiete, Gastronomie, Büros und Veranstaltungsorte. Taxi B&B kann Abholungen entlang der <strong>Rüttenscheider Straße</strong> sowie an Wohn- und Geschäftsadressen im Stadtteil einplanen.</p>
        <p>Bei stark besuchten Veranstaltungen oder am Wochenende ist ein eindeutiger Treffpunkt besonders wichtig. Nennen Sie am besten Hausnummer, Restaurant, Hoteleingang oder eine gut erreichbare Seitenstraße.</p>
      </>
    ),
  },
  {
    h2: "Messe, Grugahalle und Grugapark",
    body: (
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Messe Essen</strong> – Abholung an einem vereinbarten Eingang oder Taxihaltepunkt</li>
        <li><strong>Grugahalle</strong> – für Konzerte, Shows und Veranstaltungen</li>
        <li><strong>Grugapark</strong> – Abholung an einem vorher genannten Eingang</li>
        <li><strong>Museum Folkwang</strong> – Verbindung Richtung Südviertel und Innenstadt</li>
        <li><strong>Essen Hauptbahnhof</strong> – Anschluss an Fern- und Regionalzüge</li>
      </ul>
    ),
  },
  {
    h2: "Abendfahrten und Gruppen in Rüttenscheid",
    body: (
      <>
        <p>Für Restaurantbesuche, Veranstaltungen und Abendtermine können Hin- und Rückfahrten vorbestellt werden. Bei einer Gruppe sollten Personenzahl und gewünschte Abholzeit bereits bei der Anfrage angegeben werden.</p>
        <p>Eine <a href="/grossraumtaxi-essen" className="text-primary hover:underline">Mercedes V-Klasse für bis zu 7 Fahrgäste</a> kann angefragt werden. Die Verfügbarkeit wird vor der Fahrt bestätigt.</p>
      </>
    ),
  },
  {
    h2: "Taxi in Rüttenscheid anfragen",
    body: (
      <>
        <p>Rufen Sie uns unter <strong>0201 707060</strong> an oder senden Sie eine <a href="/book" className="text-primary hover:underline">Online-Anfrage</a>. Bei Veranstaltungen sollten Sie genügend Vorlauf einplanen.</p>
      </>
    ),
  },
];

const faq = [
  {
    q: "Wo kann ich mich in Rüttenscheid abholen lassen?",
    a: "Abholungen sind an Wohnadressen, Hotels, Restaurants und vereinbarten Treffpunkten möglich. Bei Veranstaltungen sollte ein genauer Eingang oder eine Seitenstraße genannt werden.",
  },
  {
    q: "Kann ich eine Rückfahrt nach einer Veranstaltung vorbestellen?",
    a: "Ja, eine Rückfahrt kann vorab angefragt werden. Wegen möglicher Straßensperrungen oder hoher Auslastung wird der genaue Treffpunkt bei der Buchung abgestimmt.",
  },
  {
    q: "Ist ein Großraumtaxi in Rüttenscheid verfügbar?",
    a: "Eine Mercedes V-Klasse für bis zu 7 Fahrgäste kann angefragt werden. Bitte Personenzahl und Gepäck beziehungsweise zusätzliche Gegenstände angeben.",
  },
];

const { title: _title, description: _desc } = getPageMeta('/taxi-essen-ruettenscheid');

export default function TaxiRuettenscheid() {
  return (
    <ServicePageTemplate
      title={_title}
      description={_desc}
      h1="Taxi Rüttenscheid"
      badge="Rüttenscheider Straße · Messe · Grugahalle"
      intro="Taxifahrten in Rüttenscheid zu Restaurants, Hotels, Messe Essen, Grugahalle und weiteren Zielen. Treffpunkt und Abholzeit werden vorab abgestimmt."
      sections={sections}
      faq={faq}
      stadtteileLinks={[
        { href: "/taxi-essen-hbf", label: "Taxi Essen HBF" },
        { href: "/taxi-essen-holsterhausen", label: "Taxi Holsterhausen" },
        { href: "/taxi-essen-frohnhausen", label: "Taxi Frohnhausen" },
        { href: "/taxi-essen-suedviertel", label: "Taxi Südviertel" },
      ]}
      relatedLinks={[
        { href: "/flughafentransfer-essen-duesseldorf", label: "Flughafentransfer Essen" },
        { href: "/grossraumtaxi-essen", label: "Großraumtaxi Essen" },
        { href: "/krankenfahrten-essen", label: "Krankenfahrten Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Taxi Rüttenscheid"
    />
  );
}
