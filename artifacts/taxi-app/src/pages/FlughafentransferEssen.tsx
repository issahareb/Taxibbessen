import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getPageMeta } from "@/page-meta-manifest";
import { createServiceSchema } from "@/seo/business";

const schema = createServiceSchema({
  name: "Flughafentransfer Essen–Düsseldorf",
  path: "/flughafentransfer-essen-duesseldorf",
  description: "Flughafentransfer von Essen nach Düsseldorf sowie zu weiteren Flughäfen. Fahrzeug, Abholzeit und Preis werden vor der Fahrt abgestimmt.",
  areaServed: ["Essen", "Düsseldorf", "Köln/Bonn", "Dortmund", "Frankfurt"],
});

const sections = [
  {
    h2: "Von Essen zu den großen Flughäfen",
    body: (
      <>
        <p>Taxi B&B GmbH bringt Sie von Essen zu den wichtigen Flughäfen der Region. Die häufig angefragte Strecke zum <strong>Flughafen Düsseldorf (DUS)</strong> beträgt je nach Abholort ungefähr 35 bis 40 Kilometer. Fahrten nach Köln/Bonn, Dortmund und Frankfurt können ebenfalls angefragt werden.</p>
        <p>Abholzeit, Fahrzeug und Preis werden vor der Fahrt individuell bestätigt. Geben Sie bei der Anfrage bitte Flugnummer, Personenzahl und Gepäckmenge an.</p>
      </>
    ),
  },
  {
    h2: "Abholung auf Ihre Flugzeiten abstimmen",
    body: (
      <>
        <p>Bei einer Abholung am Flughafen können Sie Ihre Flugnummer bereits bei der Buchung angeben. Dadurch lässt sich die geplante Abholzeit besser auf Ihre Ankunft abstimmen.</p>
        <p>Treffpunkt, mögliche Wartezeiten und besondere Wünsche werden vorab besprochen. Bei viel Gepäck oder einer größeren Reisegruppe sollte dies direkt bei der Anfrage angegeben werden.</p>
      </>
    ),
  },
  {
    h2: "Großraumtaxi für Gruppen und Gepäck",
    body: (
      <>
        <p>Für Familien, Reisegruppen und Firmenteams steht auf Anfrage eine <strong>Mercedes V-Klasse für bis zu 7 Personen</strong> zur Verfügung. Die tatsächlich mögliche Gepäckmenge hängt von der Personenzahl ab.</p>
        <p>Teilen Sie uns Personenzahl, Anzahl der Koffer und weitere Anforderungen mit, damit das passende Fahrzeug bestätigt werden kann.</p>
      </>
    ),
  },
  {
    h2: "Flughafentransfer bei Taxi B&B anfragen",
    body: (
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Preis vorab:</strong> Sie erhalten nach Angabe der Strecke und Anforderungen eine konkrete Auskunft.</li>
        <li><strong>24/7 erreichbar:</strong> Fahrten am frühen Morgen oder in der Nacht können vorbestellt werden.</li>
        <li><strong>Seit 1992:</strong> langjährige Erfahrung mit Fahrten in Essen und der Region.</li>
        <li><strong>Fahrzeugauswahl:</strong> Das Fahrzeug wird anhand von Personenzahl und Gepäck geplant.</li>
      </ul>
    ),
  },
];

const faq = [
  {
    q: "Wie viel kostet ein Taxi von Essen zum Flughafen Düsseldorf?",
    a: "Der Preis hängt vom genauen Abholort, der Abholzeit und dem benötigten Fahrzeug ab. Rufen Sie uns unter 0201 707060 an oder senden Sie eine Anfrage für eine konkrete Auskunft.",
  },
  {
    q: "Welche Angaben benötigen Sie bei einer Abholung am Flughafen?",
    a: "Bitte geben Sie Flugnummer, geplante Ankunft, Personenzahl, Gepäckmenge und eine erreichbare Telefonnummer an. Treffpunkt und Abholzeit werden anschließend bestätigt.",
  },
  {
    q: "Kann ich ein Großraumtaxi für eine Gruppe zum Flughafen buchen?",
    a: "Ja, eine Mercedes V-Klasse für bis zu 7 Personen kann angefragt werden. Bitte nennen Sie zusätzlich die Gepäckmenge, damit die passende Fahrzeugbelegung bestätigt werden kann.",
  },
  {
    q: "Fahren Sie auch nach Frankfurt oder Köln/Bonn?",
    a: "Fahrten zu den Flughäfen Düsseldorf, Köln/Bonn, Dortmund und Frankfurt können angefragt werden. Verfügbarkeit und Preis werden vorab bestätigt.",
  },
];

const { title: _title, description: _desc } = getPageMeta('/flughafentransfer-essen-duesseldorf');

export default function FlughafentransferEssen() {
  return (
    <ServicePageTemplate
      title={_title}
      description={_desc}
      h1="Flughafentransfer Essen Düsseldorf"
      badge="Taxi B&B GmbH · Essen"
      intro="Flughafentransfer von Essen nach Düsseldorf und zu weiteren Flughäfen. Abholzeit, Fahrzeug, Gepäck und Preis stimmen wir vor der Fahrt mit Ihnen ab."
      sections={sections}
      faq={faq}
      relatedLinks={[
        { href: "/grossraumtaxi-essen", label: "Großraumtaxi Essen" },
        { href: "/krankenfahrten-essen", label: "Krankenfahrten Essen" },
        { href: "/kurierdienst-essen", label: "Kurierdienst Essen" },
      ]}
      schema={schema}
      breadcrumbLabel="Flughafentransfer Essen Düsseldorf"
    />
  );
}
