import React from "react";
import type { PageContent } from "./types";

export const content: PageContent = {
  path: "/eco-taxi",
  h1: "Aus Eco Taxi wird Taxi B&B Essen",
  badge: "Eco Taxi gehört jetzt zu Taxi B&B",
  intro: "Für unsere Fahrgäste bleibt das Wichtigste gleich: ein zuverlässiger Service, angenehme Fahrten und ein Team, das sich kümmert. Eco Taxi wird heute unter dem Namen Taxi B&B weitergeführt.",
  sections: [
    {
      h2: "Wir fahren für Sie weiter",
      body: (
        <>
          <p>Viele Menschen in Essen kennen Eco Taxi seit Jahren. Diesen Service führen wir weiter, nun gemeinsam unter dem Namen Taxi B&B. Sie erreichen uns über dieselbe zentrale Anlaufstelle und können sich weiterhin auf eine freundliche, pünktliche und sichere Beförderung verlassen.</p>
          <p>Ob kurze Fahrt durch Essen, Termin im Krankenhaus, regelmäßige Dialysefahrt, Flughafentransfer oder Fahrt mit mehreren Personen: Wir planen die passende Lösung und stimmen besondere Wünsche vorab mit Ihnen ab.</p>
          <p>Unser Anspruch ist einfach. Sie sollen sich von der Buchung bis zur Ankunft gut aufgehoben fühlen.</p>
        </>
      ),
    },
    {
      h2: "Was sich für Sie nicht ändert",
      body: (
        <ul className="list-disc list-inside space-y-2">
          <li>Erreichbarkeit rund um die Uhr für Anfragen und Vorbestellungen</li>
          <li>Fahrten in Essen sowie zu Flughäfen und Zielen außerhalb der Stadt</li>
          <li>Persönliche Abstimmung bei besonderen Anforderungen</li>
        </ul>
      ),
    },
    {
      h2: "Für viele Wege die passende Fahrt",
      body: (
        <>
          <p>Der bekannte Eco-Taxi-Service wird durch das Angebot von Taxi B&B ergänzt. So können wir unterschiedliche Fahrten zuverlässig aus einer Hand organisieren.</p>
          <ul className="list-disc list-inside space-y-2">
            <li><span className="font-bold">Taxifahrten in Essen</span>: Zuverlässig von A nach B, bei Bedarf auch vorbestellt und rund um die Uhr erreichbar.</li>
            <li><span className="font-bold">Flughafentransfer</span>: Entspannt zum Flughafen und wieder zurück, passend zu Ihrer Abflug- oder Ankunftszeit.</li>
            <li><span className="font-bold">Kranken- und Dialysefahrten</span>: Planbare Fahrten zu Arztpraxen, Kliniken, Therapien und regelmäßigen Behandlungen.</li>
            <li><span className="font-bold">Fahrten für mehrere Personen</span>: Für Familien, Gruppen und zusätzliches Gepäck organisieren wir ein passendes Fahrzeug.</li>
          </ul>
        </>
      ),
    },
    {
      h2: "Willkommen bei Taxi B&B",
      body: (
        <p>Sie waren bisher bei Eco Taxi? Dann sind Sie bei uns weiterhin richtig. Rufen Sie uns unter <strong>0201 707060</strong> an oder senden Sie eine <a href="/#anfrage" className="text-primary hover:underline">Online-Anfrage</a>.</p>
      ),
    },
  ],
  faq: [],
};
