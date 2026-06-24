import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";

const schema = createServiceSchema({
  name: "Taxi in Essen-Frohnhausen",
  path: "/taxi-essen-frohnhausen",
  description: "Taxifahrten in Essen-Frohnhausen zu Wohnadressen, dem S-Bahnhof, lokalen Treffpunkten und weiteren Zielen in Essen.",
  areaServed: ["Essen-Frohnhausen", "Essen", "Nordrhein-Westfalen"],
});

const sections = [
  {
    h2: "Taxi an Wohnadressen und Treffpunkten in Frohnhausen",
    body: (
      <>
        <p>Taxi B&B übernimmt Abholungen an Wohnadressen, Geschäften und vereinbarten Treffpunkten in <strong>Essen-Frohnhausen</strong>. Für eine eindeutige Zuordnung sollten Straße, Hausnummer und eine erreichbare Telefonnummer vollständig angegeben werden.</p>
        <p>Bei größeren Wohnanlagen oder schwer erreichbaren Eingängen hilft eine kurze Beschreibung des Treffpunkts.</p>
      </>
    ),
  },
  {
    h2: "Typische Ziele und Abholpunkte",
    body: (
      <ul className="list-disc list-inside space-y-2">
        <li><strong>S-Bahnhof Essen-Frohnhausen</strong> – Anschluss an den Nahverkehr</li>
        <li><strong>Frohnhauser Markt</strong> – zentraler Treffpunkt im Stadtteil</li>
        <li><strong>Gervinuspark</strong> – Abholung an einem vereinbarten Zugang</li>
        <li><strong>Essen Hauptbahnhof</strong> – Weiterfahrt zu Fern- und Regionalzügen</li>
        <li><strong>Holsterhausen und Universitätsklinikum</strong> – für Termine und Besuche</li>
      </ul>
    ),
  },
  {
    h2: "Kranken- und Dialysefahrten aus Frohnhausen",
    body: (
      <>
        <p><a href="/krankenfahrten-essen" className="text-primary hover:underline">Krankenfahrten</a> und <a href="/dialysefahrten-essen" className="text-primary hover:underline">Dialysefahrten</a> können für einzelne oder wiederkehrende Termine angefragt werden.</p>
        <p>Ob eine Kostenübernahme oder direkte Abrechnung möglich ist, hängt von Verordnung, Genehmigung und den Vorgaben der Krankenkasse ab. Die Unterlagen werden vor der ersten Fahrt abgestimmt.</p>
      </>
    ),
  },
  {
    h2: "Taxi in Frohnhausen anfragen",
    body: (
      <>
        <p>Rufen Sie unter <strong>0201 707060</strong> an oder senden Sie eine <a href="/book" className="text-primary hover:underline">Online-Anfrage</a>. Abholzeit, Fahrzeug und Preis werden anschließend bestätigt.</p>
      </>
    ),
  },
];

const faq = [
  {
    q: "Welche Angaben benötigen Sie für eine Abholung in Frohnhausen?",
    a: "Bitte nennen Sie Straße, Hausnummer, Zeitpunkt, Ziel, Personenzahl und eine erreichbare Telefonnummer. Bei Bahnhöfen oder Parks sollte zusätzlich ein genauer Treffpunkt vereinbart werden.",
  },
  {
    q: "Kann ich vom S-Bahnhof Essen-Frohnhausen abgeholt werden?",
    a: "Ja, eine Abholung am S-Bahnhof kann angefragt werden. Der genaue Treffpunkt und die gewünschte Zeit werden bei der Buchung abgestimmt.",
  },
  {
    q: "Sind regelmäßige Krankenfahrten aus Frohnhausen möglich?",
    a: "Regelmäßige Fahrten können nach vorheriger Abstimmung geplant werden. Erforderliche Unterlagen und Abrechnungsmöglichkeiten werden vor Beginn geprüft.",
  },
];

const { title: _title, description: _desc } = getPageMeta('/taxi-essen-frohnhausen');

export default function TaxiFrohnhausen() {
  return (
    <ServicePageTemplate
      title={_title}
      description={_desc}
      h1="Taxi Frohnhausen"
      badge="S-Bahnhof · Frohnhauser Markt · Wohnadressen"
      intro="Taxifahrten in Essen-Frohnhausen mit Abholung an Wohnadressen, dem S-Bahnhof und vereinbarten Treffpunkten im Stadtteil."
      sections={sections}
      faq={faq}
      stadtteileLinks={[
        { href: "/taxi-essen-hbf", label: "Taxi Essen HBF" },
        { href: "/taxi-essen-ruettenscheid", label: "Taxi Rüttenscheid" },
        { href: "/taxi-essen-holsterhausen", label: "Taxi Holsterhausen" },
        { href: "/taxi-essen-suedviertel", label: "Taxi Südviertel" },
      ]}
      relatedLinks={[
        { href: "/flughafentransfer-essen-duesseldorf", label: "Flughafentransfer Essen" },
        { href: "/krankenfahrten-essen", label: "Krankenfahrten Essen" },
        { href: "/grossraumtaxi-essen", label: "Großraumtaxi Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Taxi Frohnhausen"
    />
  );
}
