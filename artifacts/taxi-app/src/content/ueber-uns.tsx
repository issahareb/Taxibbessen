import React from "react";
import type { PageContent } from "./types";

export const content: PageContent = {
  path: "/ueber-uns",
  h1: "Über Taxi B&B GmbH",
  badge: "Taxi B&B GmbH · Seit 1992",
  intro: "Taxi B&B GmbH ist ein Essener Taxiunternehmen mit Sitz in Holsterhausen. Seit 1992 werden Fahrten innerhalb der Stadt sowie vorbestellte Flughafen-, Kranken-, Gruppen- und Kurierfahrten angeboten.",
  sections: [
    {
      h2: "Das Unternehmen",
      body: (
        <>
          <p>Taxi B&B GmbH wurde 1992 in Essen gegründet. Der heutige Unternehmenssitz liegt in der Menzelstraße 8-10 in Essen-Holsterhausen. Die Gesellschaft ist beim Amtsgericht Essen unter HRB 36284 eingetragen.</p>
          <p>Zum Leistungsangebot gehören klassische Taxifahrten, Flughafentransfers, Kranken- und Dialysefahrten, Großraumfahrten und Kurierdienste. Welche Fahrt möglich ist, welches Fahrzeug eingesetzt wird und welcher Preis gilt, wird bei der Anfrage individuell bestätigt.</p>
          <p>Bei Kranken- und Dialysefahrten hängen Kostenübernahme und direkte Abrechnung von einer gültigen Verordnung, einer gegebenenfalls erforderlichen Genehmigung und den Vorgaben der jeweiligen Krankenkasse ab. Diese Voraussetzungen werden vor Fahrtbeginn abgestimmt.</p>
        </>
      ),
    },
    {
      h2: "Verbindliche Unternehmensdaten",
      body: (
        <ul className="list-disc list-inside space-y-2">
          <li><span className="font-bold">Unternehmen</span>: Taxi B&B GmbH</li>
          <li><span className="font-bold">Gegründet</span>: 1992</li>
          <li><span className="font-bold">Adresse</span>: Menzelstraße 8-10, 45147 Essen</li>
          <li><span className="font-bold">Handelsregister</span>: HRB 36284, Amtsgericht Essen</li>
          <li><span className="font-bold">Telefon</span>: 0201 707060</li>
          <li><span className="font-bold">E-Mail</span>: taxibb@outlook.com</li>
        </ul>
      ),
    },
    {
      h2: "Was Taxi B&B anbietet",
      body: (
        <ul className="list-disc list-inside space-y-2">
          <li><span className="font-bold">Seit 1992 in Essen</span>: Taxi B&B GmbH ist seit 1992 in Essen tätig. Das Gründungsjahr ist Bestandteil der offiziellen Unternehmensangaben.</li>
          <li><span className="font-bold">Sitz in Holsterhausen</span>: Der Unternehmenssitz befindet sich in der Menzelstraße 8-10, 45147 Essen-Holsterhausen.</li>
          <li><span className="font-bold">Rund um die Uhr erreichbar</span>: Anfragen und Vorbestellungen werden telefonisch rund um die Uhr entgegengenommen. Die konkrete Verfügbarkeit wird bei der Anfrage bestätigt.</li>
          <li><span className="font-bold">Unterschiedliche Fahrzeuggrößen</span>: Je nach Personenzahl und Gepäck kann ein passendes Fahrzeug angefragt werden. Für Gruppen steht auf Anfrage eine Mercedes V-Klasse zur Verfügung.</li>
          <li><span className="font-bold">Fahrten in Essen und darüber hinaus</span>: Neben Fahrten innerhalb Essens können Flughafen-, Fern- und Kurierfahrten nach vorheriger Abstimmung geplant werden.</li>
          <li><span className="font-bold">Eingetragene GmbH</span>: Taxi B&B GmbH ist beim Amtsgericht Essen unter der Handelsregisternummer HRB 36284 eingetragen.</li>
        </ul>
      ),
    },
    {
      h2: "Fahrt oder Leistung anfragen",
      body: (
        <>
          <p>Nennen Sie Abholort, Ziel, gewünschten Zeitpunkt, Personenzahl und besondere Anforderungen. Verfügbarkeit, Fahrzeug und Preis werden anschließend bestätigt. Rufen Sie uns unter <strong>0201 707060</strong> an oder senden Sie eine <a href="/#anfrage" className="text-primary hover:underline">Online-Anfrage</a>.</p>
        </>
      ),
    },
  ],
  faq: [],
};
