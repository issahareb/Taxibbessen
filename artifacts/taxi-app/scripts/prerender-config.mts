export const ORIGIN = "https://www.taxibbessen.de";
export const ORGANIZATION_ID = `${ORIGIN}/#organization`;
export const WEBSITE_ID = `${ORIGIN}/#website`;

export const serviceNames: Record<string, string> = {
  "/flughafentransfer-essen-duesseldorf": "Flughafentransfer Essen–Düsseldorf",
  "/krankenfahrten-essen": "Krankenfahrten in Essen",
  "/grossraumtaxi-essen": "Großraumtaxi in Essen",
  "/dialysefahrten-essen": "Dialysefahrten in Essen",
  "/kurierdienst-essen": "Kurierdienst in Essen",
  "/taxi-essen-hbf": "Taxi am Essen Hauptbahnhof",
  "/taxi-essen-holsterhausen": "Taxi in Essen-Holsterhausen",
  "/taxi-essen-ruettenscheid": "Taxi in Essen-Rüttenscheid",
  "/taxi-essen-frohnhausen": "Taxi in Essen-Frohnhausen",
  "/taxi-essen-suedviertel": "Taxi im Essen-Südviertel",
};

export const fallbackHeadings: Record<string, string> = {
  "/": "Taxi B&B GmbH in Essen",
  "/fahrzeuge": "Fahrzeuge von Taxi B&B GmbH",
  "/ueber-uns": "Über Taxi B&B GmbH",
  "/impressum": "Impressum",
  "/datenschutz": "Datenschutz",
  "/agb": "Allgemeine Geschäftsbedingungen",
  "/book": "Fahrt anfragen",
  "/confirmation": "Anfrage übermittelt",
  "/admin": "Interner Adminbereich",
  ...serviceNames,
};

export const fallbackLinks = [
  ["/", "Startseite"],
  ["/flughafentransfer-essen-duesseldorf", "Flughafentransfer"],
  ["/krankenfahrten-essen", "Krankenfahrten"],
  ["/grossraumtaxi-essen", "Großraumtaxi"],
  ["/dialysefahrten-essen", "Dialysefahrten"],
  ["/kurierdienst-essen", "Kurierdienst"],
  ["/taxi-essen-hbf", "Taxi Essen HBF"],
  ["/fahrzeuge", "Fahrzeuge"],
  ["/ueber-uns", "Über uns"],
] as const;

export function canonicalUrl(path: string): string {
  if (path === "/") return `${ORIGIN}/`;
  return `${ORIGIN}${path.replace(/\/$/, "")}/`;
}
