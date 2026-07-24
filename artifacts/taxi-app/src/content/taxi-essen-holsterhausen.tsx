import React from "react";
import type { PageContent } from "./types";

export const content: PageContent = {
  path: "/taxi-essen-holsterhausen",
  h1: "Taxi in Essen-Holsterhausen – Abholung im Stadtteil",
  badge: "Unternehmenssitz in Essen-Holsterhausen",
  intro: "Taxifahrten in Holsterhausen mit Abholung an Wohnadressen, Praxen, dem Universitätsklinikum und vereinbarten Treffpunkten im Stadtteil.",
  sections: [
    {
      h2: "Taxi direkt in Essen-Holsterhausen",
      body: (
        <>
          <p>Taxi B&B GmbH hat seinen Unternehmenssitz in der <strong>Menzelstraße 8-10 in Essen-Holsterhausen</strong>. Abholungen können an Wohnadressen, Praxen, Geschäften und vereinbarten Treffpunkten im Stadtteil geplant werden.</p>
          <p>Bitte nennen Sie bei der Anfrage die vollständige Hausnummer und eine erreichbare Telefonnummer. Bei größeren Gebäudekomplexen sollte zusätzlich ein konkreter Eingang oder Treffpunkt vereinbart werden.</p>
        </>
      ),
    },
    {
      h2: "Häufig angefragte Ziele aus Holsterhausen",
      body: (
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Universitätsklinikum Essen</strong> – Abholung an einem vorher vereinbarten Eingang</li>
          <li><strong>Gemarkenstraße und Stadtteilzentrum</strong> – für Einkäufe, Termine und Besuche</li>
          <li><strong>Essen Hauptbahnhof</strong> – als Anschluss an Bahnreisen</li>
          <li><strong>Messe Essen und Rüttenscheid</strong> – für Veranstaltungen und Geschäftstermine</li>
          <li><strong>Flughafen Düsseldorf</strong> – nach Vorbestellung mit Gepäckangabe</li>
        </ul>
      ),
    },
    {
      h2: "Kranken- und Dialysefahrten aus Holsterhausen",
      body: (
        <>
          <p><a href="/krankenfahrten-essen/" className="text-primary hover:underline">Krankenfahrten</a> und <a href="/dialysefahrten-essen/" className="text-primary hover:underline">Dialysefahrten</a> können regelmäßig oder für einzelne Termine angefragt werden. Verordnung, Genehmigung und Abrechnungsmöglichkeiten werden vor der ersten Fahrt geprüft.</p>
          <p>Bei einer Abholung am Universitätsklinikum oder einer Praxis sollte der genaue Eingang beziehungsweise Gebäudeteil angegeben werden.</p>
        </>
      ),
    },
    {
      h2: "Taxi in Holsterhausen anfragen",
      body: (
        <>
          <p>Rufen Sie unter <strong>0201 707060</strong> an oder senden Sie eine <a href="/book/" className="text-primary hover:underline">Online-Anfrage</a>. Abholzeit und Verfügbarkeit werden anschließend bestätigt.</p>
        </>
      ),
    },
  ],
  faq: [
    {
      q: "Welche Angaben benötigen Sie für eine Abholung in Holsterhausen?",
      a: "Bitte nennen Sie Straße, Hausnummer, gewünschten Zeitpunkt, Ziel, Personenzahl und eine erreichbare Telefonnummer. Bei Kliniken oder größeren Gebäuden ist ein genauer Eingang hilfreich.",
    },
    {
      q: "Kann ich aus Holsterhausen einen Flughafentransfer buchen?",
      a: "Ja, Flughafentransfers können vorbestellt werden. Geben Sie Flugzeit, Personenzahl und Gepäckmenge an; Preis und Fahrzeug werden vorab bestätigt.",
    },
    {
      q: "Sind regelmäßige Krankenfahrten aus Holsterhausen möglich?",
      a: "Regelmäßige Fahrten können nach Abstimmung eingerichtet werden. Erforderliche Unterlagen und Abrechnungsmöglichkeiten sollten vor der ersten Fahrt geklärt werden.",
    },
  ],
};
