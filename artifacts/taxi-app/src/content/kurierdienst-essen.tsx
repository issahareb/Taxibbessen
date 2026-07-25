import React from "react";
import type { PageContent } from "./types";

export const content: PageContent = {
  path: "/kurierdienst-essen",
  h1: "Kurierdienst Essen für Dokumente und Sendungen",
  badge: "Direkt · Persönlich · Planbar",
  intro: "Der Kurierdienst von Taxi B&B übernimmt direkte Kurierfahrten für Dokumente und kleinere Sendungen in Essen und der Region. Inhalt, Übergabe, Verfügbarkeit und Preis werden vorab abgestimmt.",
  sections: [
    {
      h2: "Direkte Kurierfahrten in Essen und der Region",
      body: (
        <>
          <p>Taxi B&B GmbH übernimmt direkte Kurierfahrten für Dokumente und kleinere Sendungen. Abholung und Ziel werden vorab vereinbart; anschließend wird die Sendung ohne reguläres Paketnetz zum Empfänger gebracht.</p>
          <p>Teilen Sie uns Inhalt, Größe, Gewicht, gewünschte Abholzeit und besondere Übergabehinweise bereits bei der Anfrage mit.</p>
        </>
      ),
    },
    {
      h2: "Welche Sendungen können angefragt werden?",
      body: (
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Vertragsdokumente und Akten</strong>: nach vorheriger Abstimmung</li>
          <li><strong>Unternehmensunterlagen und Muster</strong>: direkte Zustellung</li>
          <li><strong>Schlüssel, Ersatzteile und Kleinlieferungen</strong>: passend zum verfügbaren Fahrzeug</li>
          <li><strong>Persönliche Gegenstände</strong>: mit vereinbartem Empfänger</li>
          <li><strong>Wiederkehrende Fahrten</strong>: nach individueller Planung</li>
        </ul>
      ),
    },
    {
      h2: "Übergabe und besondere Anforderungen",
      body: (
        <>
          <p>Absender, Empfänger und gewünschte Übergabeart sollten eindeutig angegeben werden. Eine persönliche Übergabe oder Empfangsbestätigung kann vor der Fahrt vereinbart werden.</p>
          <p>Gefahrgut, verbotene Waren, kühlpflichtige Produkte und Sendungen mit besonderen gesetzlichen Transportanforderungen werden nicht ohne vorherige ausdrückliche Prüfung angenommen.</p>
        </>
      ),
    },
    {
      h2: "Kurierfahrt anfragen",
      body: (
        <>
          <p>Rufen Sie uns unter <strong>0201 707060</strong> an. Nach Angabe von Abholort, Ziel, Sendungsart und gewünschter Zeit bestätigen wir Verfügbarkeit und Preis.</p>
          <p>Auch regelmäßig wiederkehrende Fahrten können individuell besprochen werden.</p>
        </>
      ),
    },
  ],
  faq: [
    {
      q: "Wie schnell kann eine Kurierfahrt beginnen?",
      a: "Das hängt von Abholort, Ziel und aktueller Fahrzeugverfügbarkeit ab. Nach Ihrer Anfrage erhalten Sie eine konkrete Rückmeldung.",
    },
    {
      q: "Fahren Sie auch außerhalb von Essen?",
      a: "Kurierfahrten in umliegende Städte und weitere Ziele können angefragt werden. Verfügbarkeit und Preis werden vorab bestätigt.",
    },
    {
      q: "Kann ich eine Kurierfahrt abends oder nachts anfragen?",
      a: "Taxi B&B ist rund um die Uhr erreichbar. Ob die gewünschte Kurierfahrt zu diesem Zeitpunkt möglich ist, wird bei der Anfrage bestätigt.",
    },
    {
      q: "Welche Sendungen werden nicht transportiert?",
      a: "Gefahrgut, illegale Waren, unzureichend verpackte Sendungen und Produkte mit besonderen Kühl- oder Transportpflichten werden nicht ohne vorherige Prüfung angenommen.",
    },
  ],
};
