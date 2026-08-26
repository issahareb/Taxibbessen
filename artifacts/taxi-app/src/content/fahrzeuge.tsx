import React from "react";
import type { PageContent } from "./types";

export const content: PageContent = {
  path: "/fahrzeuge",
  h1: "Unsere Fahrzeugflotte in Essen",
  badge: "Taxi B&B GmbH · Essen",
  intro: "Die Fahrzeugflotte von Taxi B&B in Essen umfasst unterschiedliche Fahrzeuggrößen für klassische Taxifahrten, Gruppen und Flughafentransfers. Teilen Sie uns Personenzahl, Gepäck und besondere Anforderungen mit; das passende verfügbare Fahrzeug wird anschließend bestätigt.",
  sections: [
    {
      h2: "Mercedes E-Klasse T-Modell (Kombi)",
      body: (
        <>
          <p>Geeignet für klassische Taxifahrten, Geschäftstermine und Flughafentransfers mit normaler Personenzahl und Gepäck.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Bis zu 4 Fahrgäste</li>
            <li>Kofferraum für übliches Reisegepäck</li>
            <li>Klimatisierter Fahrgastraum</li>
            <li>Fahrzeugverfügbarkeit wird bestätigt</li>
          </ul>
        </>
      ),
    },
    {
      h2: "Mercedes V-Klasse (Großraumtaxi)",
      body: (
        <>
          <p>Für Familien, Gruppen und Firmenteams. Die mögliche Gepäckmenge hängt von der tatsächlichen Zahl der Fahrgäste ab.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Bis zu 7 Fahrgäste</li>
            <li>Für Gruppen- und Flughafenfahrten</li>
            <li>Zusätzliche Anforderungen vorab angeben</li>
            <li>Kindersitz nur nach Bestätigung</li>
          </ul>
        </>
      ),
    },
    {
      h2: "Mercedes E 300 e (Hybrid)",
      body: (
        <>
          <p>Plug-in-Hybrid-Fahrzeug für komfortable Fahrten in Essen und der Region. Der konkrete Fahrzeugeinsatz hängt von der Verfügbarkeit ab.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Plug-in-Hybrid-Antrieb</li>
            <li>Bis zu 4 Fahrgäste</li>
            <li>Klimatisierter Fahrgastraum</li>
            <li>Einsatz nach Verfügbarkeit</li>
          </ul>
        </>
      ),
    },
    {
      h2: "Welches Fahrzeug wird benötigt?",
      body: (
        <p>Geben Sie Personenzahl, Anzahl und Größe der Gepäckstücke, Kinderwagen, Rollator oder weitere Anforderungen an. Wir prüfen anschließend, welches Fahrzeug verfügbar und geeignet ist. Rufen Sie uns unter <strong>0201 707060</strong> an.</p>
      ),
    },
  ],
  faq: [],
};
