import type { FaqItem } from "./types";

// Shared by the visible accordion and prerendered FAQ structured data.
export const HOME_FAQ: FaqItem[] = [
  {
    q: "Wie kann ich ein Taxi anfragen?",
    a: "Rund um die Uhr telefonisch unter 0201 707060, per WhatsApp oder über das Formular. Wir fahren in ganz Essen und nach Absprache auch darüber hinaus. Abholzeit und Verfügbarkeit bestätigen wir persönlich.",
  },
  {
    q: "Was kostet ein Taxi in Essen?",
    a: "Nach dem Essener Taxameter-Tarif beginnt die Fahrt bei 4,40 €. Die ersten beiden Kilometer kosten je 2,80 €, der dritte und vierte je 2,70 €, ab dem fünften sind es 2,50 € pro Kilometer. Beispiel für fünf Kilometer im Pflichtfahrgebiet ohne Wartezeit und Zuschläge: 17,90 €. Stand: November 2026.",
    source: {
      label: "Tarifangaben der Stadt Essen",
      url: "https://www.essen.de/meldungen/pressemeldung_1577339.de.html",
    },
  },
  {
    q: "Kann ich einen Flughafentransfer vorbestellen?",
    a: "Ja. Geben Sie Abholort, Flugzeit, Personen und Gepäck an. Wir empfehlen eine Anfrage mindestens 24 Stunden vorher; kurzfristige Fahrten bitte telefonisch abstimmen.",
  },
  {
    q: "Gibt es ein Großraumtaxi für sieben Personen?",
    a: "Unsere Mercedes V-Klasse bietet bis zu sieben Fahrgästen Platz. Teilen Sie uns die Personenzahl und das Gepäck mit, damit wir ein passendes Fahrzeug einplanen können.",
  },
  {
    q: "Bieten Sie Kranken- und Dialysefahrten an?",
    a: "Ja, auch Therapie- und regelmäßige Behandlungsfahrten. Eine direkte Abrechnung mit der Krankenkasse stimmen wir bei entsprechend genehmigten Fahrten vorab ab.",
  },
  {
    q: "Was ist bei Kindersitz, Rollstuhl oder Haustier wichtig?",
    a: "Bitte geben Sie besondere Anforderungen vorab an. Für Kindersitze benötigen wir Alter und Gewicht des Kindes. Bei Mobilitätshilfen, Haustieren oder viel Gepäck prüfen wir das passende Fahrzeug und die Verfügbarkeit.",
  },
  {
    q: "Wie ändere oder storniere ich eine Anfrage?",
    a: "Rufen Sie möglichst früh unter 0201 707060 an. Änderungen, kurzfristige Absagen und gegebenenfalls anfallende Kosten klären wir direkt mit Ihnen.",
  },
  {
    q: "Bekomme ich einen Beleg oder eine Rechnung?",
    a: "Einen Taxibeleg erhalten Sie auf Wunsch beim Fahrer. Für Firmenrechnungen geben Sie bitte Ihre Unternehmensdaten bei der Anfrage an. Monatsabrechnungen sind nach Absprache möglich.",
  },
];
