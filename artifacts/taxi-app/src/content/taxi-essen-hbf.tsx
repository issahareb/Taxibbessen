import React from "react";
import type { PageContent } from "./types";

export const content: PageContent = {
  path: "/taxi-essen-hbf",
  h1: "Taxi Essen Hauptbahnhof",
  badge: "24/7 erreichbar · Vorbestellung möglich",
  intro: "Taxifahrten vom und zum Essen Hauptbahnhof. Treffpunkt, Zugankunft, Ziel und Gepäck stimmen wir bei der Anfrage mit Ihnen ab.",
  sections: [
    {
      h2: "Taxi am Essen Hauptbahnhof vorbestellen",
      body: (
        <>
          <p>Taxi B&B GmbH ist rund um die Uhr erreichbar und kann Fahrten vom oder zum Essen Hauptbahnhof vorplanen. Eine Vorbestellung ist besonders bei festen Anschlusszeiten oder größerem Gepäck sinnvoll.</p>
          <p>Geben Sie bei der Anfrage Zugankunft, erreichbare Telefonnummer, Zieladresse und den gewünschten Treffpunkt an. Die Abholung wird anschließend bestätigt.</p>
        </>
      ),
    },
    {
      h2: "Ziele ab Essen Hauptbahnhof",
      body: (
        <ul className="list-disc list-inside space-y-2">
          <li><span className="font-bold">Hotels und Geschäftstermine</span>: in der Innenstadt und den Stadtteilen</li>
          <li><span className="font-bold">Messe Essen</span>: direkte Weiterfahrt nach Rüttenscheid</li>
          <li><span className="font-bold">Flughafen Düsseldorf</span>: als vorbestellter Anschluss-Transfer</li>
          <li><span className="font-bold">Essener Stadtteile</span>: unter anderem Rüttenscheid, Holsterhausen und Frohnhausen</li>
          <li><span className="font-bold">Kliniken und Arztpraxen</span>: nach vollständiger Zielangabe</li>
        </ul>
      ),
    },
    {
      h2: "Abholpunkt und Zugankunft abstimmen",
      body: (
        <>
          <p>Bei einer Vorbestellung können Zugnummer und geplante Ankunft angegeben werden. Änderungen oder Verspätungen sollten zusätzlich telefonisch mitgeteilt werden.</p>
          <p>Der konkrete Treffpunkt am Hauptbahnhof wird vor der Fahrt vereinbart. So wissen beide Seiten, an welchem Ausgang oder Haltepunkt die Abholung stattfindet.</p>
        </>
      ),
    },
    {
      h2: "Fahrten mit Gepäck oder als Gruppe",
      body: (
        <>
          <p>Bitte geben Sie größere Koffer, Kinderwagen oder Sportausrüstung bei der Anfrage an. Für Gruppen kann eine <a href="/grossraumtaxi-essen/" className="text-primary hover:underline">Mercedes V-Klasse für bis zu 7 Fahrgäste</a> angefragt werden.</p>
        </>
      ),
    },
  ],
  faq: [
    {
      q: "Wie bestelle ich ein Taxi am Essen Hauptbahnhof?",
      a: "Rufen Sie unter 0201 707060 an oder senden Sie eine Online-Anfrage. Geben Sie Zugankunft, Treffpunkt, Ziel, Personenzahl und Gepäck an.",
    },
    {
      q: "Wie lange dauert die Fahrt vom Essen HBF zum Flughafen Düsseldorf?",
      a: "Die Fahrzeit hängt von Tageszeit, Verkehr und Abholpunkt ab. Häufig liegt sie ungefähr zwischen 35 und 50 Minuten; eine verbindliche Fahrzeit kann nicht garantiert werden.",
    },
    {
      q: "Kann ich auch nachts eine Fahrt vom Hauptbahnhof anfragen?",
      a: "Taxi B&B ist rund um die Uhr erreichbar. Eine Vorbestellung erhöht die Planungssicherheit, besonders bei späten oder frühen Zugverbindungen.",
    },
  ],
};
