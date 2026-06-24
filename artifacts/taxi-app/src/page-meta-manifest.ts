export type PageMetaEntry = {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
};

export const PAGE_META_MANIFEST: PageMetaEntry[] = [
  {
    path: '/',
    title: 'Taxi B&B Essen | Taxiservice seit 1992',
    description: 'Taxi B&B GmbH in Essen: klassische Taxifahrten, Flughafentransfer, Krankenfahrten, Großraumtaxi und Kurierdienst. Rund um die Uhr erreichbar: 0201 707060.',
  },
  {
    path: '/fahrzeuge',
    title: 'Fahrzeuge | Taxi B&B Essen',
    description: 'Unsere Mercedes-Flotte für Taxifahrten, Flughafentransfers und Gruppenfahrten in Essen. Passendes Fahrzeug telefonisch anfragen.',
  },
  {
    path: '/ueber-uns',
    title: 'Über Taxi B&B Essen | Seit 1992',
    description: 'Taxi B&B GmbH ist seit 1992 in Essen tätig. Erfahren Sie mehr über das Unternehmen, die Leistungen und die Kontaktmöglichkeiten.',
  },
  {
    path: '/book',
    title: 'Taxi anfragen | Taxi B&B Essen',
    description: 'Taxifahrt in Essen online anfragen oder Taxi B&B telefonisch unter 0201 707060 erreichen.',
    noindex: true,
  },
  {
    path: '/confirmation',
    title: 'Anfrage übermittelt | Taxi B&B Essen',
    description: 'Ihre Anfrage an Taxi B&B GmbH wurde übermittelt.',
    noindex: true,
  },
  {
    path: '/impressum',
    title: 'Impressum | Taxi B&B GmbH',
    description: 'Impressum und gesetzliche Anbieterkennzeichnung der Taxi B&B GmbH in Essen.',
  },
  {
    path: '/datenschutz',
    title: 'Datenschutz | Taxi B&B GmbH',
    description: 'Datenschutzerklärung der Taxi B&B GmbH mit Informationen zur Verarbeitung personenbezogener Daten.',
  },
  {
    path: '/agb',
    title: 'AGB | Taxi B&B GmbH',
    description: 'Allgemeine Geschäftsbedingungen der Taxi B&B GmbH für Beförderungs- und Serviceleistungen.',
  },
  {
    path: '/admin',
    title: 'Admin | Taxi B&B GmbH',
    description: 'Interner Adminbereich.',
    noindex: true,
  },
  {
    path: '/flughafentransfer-essen-duesseldorf',
    title: 'Flughafentransfer Essen–Düsseldorf | Taxi B&B',
    description: 'Flughafentransfer von Essen nach Düsseldorf sowie zu weiteren Flughäfen. Fahrzeug, Abholzeit und Preis vorab bei Taxi B&B anfragen.',
  },
  {
    path: '/krankenfahrten-essen',
    title: 'Krankenfahrten in Essen | Taxi B&B',
    description: 'Krankenfahrten in Essen für Arzttermine, Therapien und Kliniken. Abrechnungsmöglichkeiten und Voraussetzungen vorab abstimmen.',
  },
  {
    path: '/grossraumtaxi-essen',
    title: 'Großraumtaxi Essen für bis zu 7 Personen | Taxi B&B',
    description: 'Großraumtaxi in Essen für Gruppen, Familien und Flughafentransfers. Verfügbarkeit und Gepäckmenge bei der Buchung angeben.',
  },
  {
    path: '/dialysefahrten-essen',
    title: 'Dialysefahrten in Essen | Taxi B&B',
    description: 'Regelmäßige Dialysefahrten in Essen mit planbaren Abholzeiten. Voraussetzungen und Abrechnung vor Fahrtbeginn abstimmen.',
  },
  {
    path: '/kurierdienst-essen',
    title: 'Kurierdienst in Essen | Taxi B&B',
    description: 'Direkte Kurierfahrten für Dokumente und Sendungen in Essen und Umgebung. Abholung und Ziel telefonisch abstimmen.',
  },
  {
    path: '/taxi-essen-hbf',
    title: 'Taxi am Essen Hauptbahnhof | Taxi B&B',
    description: 'Taxi am Essen Hauptbahnhof vorbestellen. Taxi B&B bringt Sie zu Hotels, Terminen und Adressen in Essen und Umgebung.',
  },
  {
    path: '/taxi-essen-holsterhausen',
    title: 'Taxi in Essen-Holsterhausen | Taxi B&B',
    description: 'Taxi in Essen-Holsterhausen für lokale Fahrten, Flughafentransfers, Krankenfahrten und Gruppenfahrten.',
  },
  {
    path: '/taxi-essen-ruettenscheid',
    title: 'Taxi in Essen-Rüttenscheid | Taxi B&B',
    description: 'Taxi in Essen-Rüttenscheid für lokale Fahrten, Veranstaltungen, Flughafentransfers und Krankenfahrten.',
  },
  {
    path: '/taxi-essen-frohnhausen',
    title: 'Taxi in Essen-Frohnhausen | Taxi B&B',
    description: 'Taxi in Essen-Frohnhausen für lokale Fahrten, Flughafentransfers, Krankenfahrten und Gruppenfahrten.',
  },
  {
    path: '/taxi-essen-suedviertel',
    title: 'Taxi im Essen-Südviertel | Taxi B&B',
    description: 'Taxi im Essener Südviertel für Geschäftstermine, lokale Fahrten, Flughafentransfers und Krankenfahrten.',
  },
];

export function getPageMeta(path: string): PageMetaEntry {
  const entry = PAGE_META_MANIFEST.find((m) => m.path === path);
  if (!entry) {
    throw new Error(
      `Kein Eintrag in page-meta-manifest.ts für Pfad: "${path}". Bitte dort ergänzen.`,
    );
  }
  return entry;
}
