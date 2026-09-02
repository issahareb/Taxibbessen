import React from "react";
import type { PageContent } from "./types";

export const content: PageContent = {
  path: "/",
  h1: "Taxi B&B GmbH in Essen",
  badge: "Taxi B&B GmbH · Seit 1992",
  intro: "Taxi in Essen rund um die Uhr bestellen: Taxifahrten, Flughafentransfer, Krankenfahrten, Großraumtaxi und Kurierdienst. Jetzt anrufen: 0201 707060.",
  sections: [
    {
      h2: "Unsere Leistungen",
      body: (
        <ul className="list-disc list-inside space-y-2">
          <li><span className="font-bold">Privat- und Geschäftsfahrten</span>: Ob Geschäftsreise, privater Ausflug oder Langstrecke, wir fahren Sie bequem und pünktlich ans Ziel. Unser Service gilt in Essen, im gesamten Bundesgebiet und auf Anfrage auch ins europäische Ausland.</li>
          <li><span className="font-bold">Krankenfahrten</span>: Wir übernehmen Krankenfahrten, Dialysefahrten und Fahrten zur Strahlentherapie. Bei entsprechend genehmigten Fahrten kann eine direkte Abrechnung mit Ihrer Krankenkasse vereinbart werden.</li>
          <li><span className="font-bold">Flughafentransfer</span>: Wir bringen Sie komfortabel zu allen großen Flughäfen, darunter Düsseldorf, Köln/Bonn, Frankfurt und Dortmund, mit ausreichend Kofferraumplatz und klimatisierten Fahrzeugen.</li>
          <li><span className="font-bold">Dokumenttransport</span>: Vertragsdokumente, Unternehmenspakete oder vertrauliche Unterlagen übergeben wir sicher und diskret, auch als Express-Lieferung innerhalb von Essen und der Region.</li>
          <li><span className="font-bold">Kurierdienst</span>: Schnelle, zuverlässige Kurierfahrten in Essen und der gesamten Region, persönlich und pünktlich direkt von Absender zu Empfänger.</li>
          <li><span className="font-bold">Großraumtaxi</span>: Für Familien, Gruppen und Firmenteams steht auf Anfrage eine Mercedes V-Klasse mit Platz für bis zu 7 Personen zur Verfügung.</li>
        </ul>
      ),
    },
    {
      h2: "Über Taxi B&B",
      body: (
        <>
          <p>Taxi B&B GmbH ist seit 1992 in Essen tätig, mit Sitz in der Menzelstraße 8-10 in Essen-Holsterhausen. Die Gesellschaft ist beim Amtsgericht Essen unter HRB 36284 eingetragen.</p>
          <p>Anfragen und Vorbestellungen werden telefonisch rund um die Uhr entgegengenommen. Je nach Personenzahl und Gepäck kann ein passendes Fahrzeug aus unserer Mercedes-Flotte angefragt werden.</p>
        </>
      ),
    },
  ],
  faq: [],
};
