import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { routeConfigs, indexableRoutes } from './src/routes.ts';
import { PAGE_META_MANIFEST } from './src/page-meta-manifest.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist/public');
const CANONICAL_DOMAIN = 'https://taxibbessen.de';
const BUILD_DATE = new Date().toISOString().split('T')[0];

type PrerenderRoute = {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  noscriptBody?: string;
  schemaOrg?: Record<string, unknown> | Record<string, unknown>[];
  extraHeadTags?: string;
};

function meta(path: string): Pick<PrerenderRoute, 'path' | 'title' | 'description' | 'noindex'> {
  const m = PAGE_META_MANIFEST.find((e) => e.path === path);
  if (!m) throw new Error(`Kein Manifest-Eintrag für "${path}" – bitte in page-meta-manifest.ts ergänzen.`);
  return m;
}

const HOMEPAGE_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "de",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Welches Taxiunternehmen ist in Essen am zuverlässigsten?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Taxi B&B GmbH ist seit 1992 für Pünktlichkeit und Zuverlässigkeit bekannt – mit 5-Sterne-Bewertungen und 30+ Jahren Erfahrung. Wir sind 24/7 für Sie da: 0201 707060."
      }
    },
    {
      "@type": "Question",
      "name": "Wie viel kostet ein Taxi zum Flughafen Düsseldorf aus Essen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wir berechnen transparente Festpreise ohne böse Überraschungen. Die Strecke Essen–Flughafen Düsseldorf beträgt ca. 35–40 km. Rufen Sie uns für ein konkretes Angebot an: 0201 707060."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich ein Großraumtaxi für 7 Personen buchen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja! Unsere Mercedes V-Klasse bietet Platz für bis zu 7 Personen – ideal für Gruppen, Familien und Firmenausflüge. Kindersitze auf Anfrage. Jetzt buchen: 0201 707060."
      }
    },
    {
      "@type": "Question",
      "name": "Bieten Sie Krankenfahrten und Dialysefahrten an?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, wir führen Krankenfahrten, Dialysefahrten und Therapiefahrten in Essen und Umgebung durch. Wir arbeiten mit Krankenkassen zusammen und holen Sie pünktlich ab."
      }
    },
    {
      "@type": "Question",
      "name": "Ist Taxi B&B GmbH wirklich 24 Stunden erreichbar?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolut – 24 Stunden, 7 Tage die Woche, 365 Tage im Jahr. Egal ob Nachtflug oder Frühschicht: Wir sind da. Rufen Sie einfach an: 0201 707060."
      }
    },
    {
      "@type": "Question",
      "name": "Fahren Sie auch ins Ausland oder bundesweit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja! Wir fahren bundesweit und ins europäische Ausland. Amsterdam, Zürich, Wien – kein Problem. Festpreise auf Anfrage."
      }
    },
    {
      "@type": "Question",
      "name": "Welche Fahrzeuge hat Taxi B&B GmbH?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Unsere Flotte umfasst den Mercedes E-Klasse Kombi, den Mercedes E 300 e Hybrid (elektrisch) und die Mercedes V-Klasse für Gruppen. Alle Fahrzeuge sind klimatisiert und regelmäßig gewartet."
      }
    },
    {
      "@type": "Question",
      "name": "Wie schnell kommt das Taxi nach meiner Bestellung?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In der Regel sind wir innerhalb weniger Minuten bei Ihnen in Essen. Rufen Sie uns an oder buchen Sie direkt über das Formular auf dieser Seite."
      }
    }
  ]
};

const UEBER_UNS_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://taxibbessen.de/#localbusiness",
      "name": "Taxi B&B GmbH",
      "legalName": "Taxi B&B GmbH",
      "foundingDate": "1992",
      "description": "Inhabergeführtes Taxiunternehmen in Essen seit 1992. Flughafentransfers, Krankenfahrten, Großraumtaxi und Kurierdienst – 24/7 erreichbar.",
      "url": "https://taxibbessen.de",
      "telephone": "+492017070600",
      "email": "taxibb@outlook.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Menzelstraße 8-10",
        "addressLocality": "Essen",
        "postalCode": "45147",
        "addressCountry": "DE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 51.4439,
        "longitude": 7.0026
      },
      "areaServed": [
        { "@type": "City", "name": "Essen" },
        { "@type": "State", "name": "Nordrhein-Westfalen" }
      ],
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      },
      "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 5, "maxValue": 20 },
      "sameAs": [
        "https://www.taxi.de",
        "https://taxibbessen.de"
      ],
      "identifier": {
        "@type": "PropertyValue",
        "name": "Handelsregister",
        "value": "HRB 36284 Amtsgericht Essen"
      },
      "priceRange": "€€"
    },
    {
      "@type": "Organization",
      "@id": "https://taxibbessen.de/#organization",
      "name": "Taxi B&B GmbH",
      "legalName": "Taxi B&B GmbH",
      "foundingDate": "1992",
      "url": "https://taxibbessen.de",
      "telephone": "+492017070600",
      "email": "taxibb@outlook.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Menzelstraße 8-10",
        "addressLocality": "Essen",
        "postalCode": "45147",
        "addressCountry": "DE"
      },
      "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 5, "maxValue": 20 },
      "areaServed": "Essen, Ruhrgebiet, Nordrhein-Westfalen",
      "sameAs": [
        "https://www.taxi.de",
        "https://taxibbessen.de"
      ]
    }
  ]
};

const FAHRZEUGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Fahrzeugflotte – Taxi B&B GmbH Essen",
  "description": "Die Fahrzeugflotte von Taxi B&B GmbH: Mercedes E-Klasse Kombi, Mercedes V-Klasse Großraumtaxi und Mercedes E 300 e Hybrid.",
  "url": "https://taxibbessen.de/fahrzeuge",
  "numberOfItems": 3,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Mercedes E-Klasse T-Modell – Kombi",
        "description": "Businessklasse-Komfort mit großzügigem Kofferraumvolumen. Bis zu 4 Passagiere, Klimaanlage, Executive-Sitze und USB-Ladeanschlüsse. Ideal für Flughafentransfers und Geschäftsreisen.",
        "brand": { "@type": "Brand", "name": "Mercedes-Benz" },
        "category": "Taxi / Personenbeförderung",
        "offers": {
          "@type": "Offer",
          "seller": { "@id": "https://taxibbessen.de/#localbusiness" },
          "areaServed": "Essen, Nordrhein-Westfalen",
          "availability": "https://schema.org/InStock",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "priceCurrency": "EUR",
            "description": "Festpreis auf Anfrage"
          }
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Product",
        "name": "Mercedes V-Klasse – Großraumtaxi",
        "description": "Großraumtaxi für bis zu 7 Personen mit WLAN, Klimaanlage und Einzelsitzen. Kindersitze auf Anfrage. Ideal für Gruppen, Familien und Firmendelegationen.",
        "brand": { "@type": "Brand", "name": "Mercedes-Benz" },
        "category": "Großraumtaxi / Personenbeförderung",
        "offers": {
          "@type": "Offer",
          "seller": { "@id": "https://taxibbessen.de/#localbusiness" },
          "areaServed": "Essen, Nordrhein-Westfalen",
          "availability": "https://schema.org/InStock",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "priceCurrency": "EUR",
            "description": "Festpreis auf Anfrage"
          }
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Product",
        "name": "Mercedes E 300 e – Hybrid & Elektro",
        "description": "Emissionsarmer Hybridantrieb, im Stadtbereich rein elektrisch. Geräuschlos und umweltschonend – ideal für Fahrten zu Kliniken, Hotels und Praxen sowie Nachtfahrten.",
        "brand": { "@type": "Brand", "name": "Mercedes-Benz" },
        "category": "Hybridtaxi / Personenbeförderung",
        "offers": {
          "@type": "Offer",
          "seller": { "@id": "https://taxibbessen.de/#localbusiness" },
          "areaServed": "Essen, Nordrhein-Westfalen",
          "availability": "https://schema.org/InStock",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "priceCurrency": "EUR",
            "description": "Festpreis auf Anfrage"
          }
        }
      }
    }
  ]
};

const PROVIDER = {
  "@type": "LocalBusiness",
  "@id": "https://taxibbessen.de/#localbusiness",
  "name": "Taxi B&B GmbH",
  "telephone": "+492017070600",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Menzelstraße 8-10",
    "addressLocality": "Essen",
    "postalCode": "45147",
    "addressCountry": "DE"
  }
} as const;

const FLUGHAFENTRANSFER_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Flughafentransfer Essen – Düsseldorf, Köln/Bonn, Frankfurt",
  "alternateName": "Taxi Flughafentransfer Essen",
  "description": "Komfortabler Flughafentransfer von Essen zu allen Flughäfen der Region: Düsseldorf (DUS), Köln/Bonn (CGN), Dortmund (DTM) und Frankfurt (FRA). Festpreise, Flugverfolgung, kostenlose Wartezeit bei Verspätungen. 24/7 erreichbar.",
  "url": "https://taxibbessen.de/flughafentransfer-essen-duesseldorf",
  "serviceType": "Flughafentransfer",
  "category": "Personenbeförderung",
  "provider": PROVIDER,
  "areaServed": [
    { "@type": "City", "name": "Essen" },
    { "@type": "Airport", "name": "Flughafen Düsseldorf", "iataCode": "DUS" },
    { "@type": "Airport", "name": "Flughafen Köln/Bonn", "iataCode": "CGN" },
    { "@type": "Airport", "name": "Flughafen Dortmund", "iataCode": "DTM" },
    { "@type": "Airport", "name": "Flughafen Frankfurt", "iataCode": "FRA" }
  ],
  "availableChannel": {
    "@type": "ServiceChannel",
    "servicePhone": { "@type": "ContactPoint", "telephone": "+492017070600", "contactType": "reservations", "availableLanguage": "de", "hoursAvailable": "Mo-Su 00:00-23:59" }
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "description": "Festpreis auf Anfrage – kein Taxameter-Risiko",
    "seller": PROVIDER
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Flughafentransfer-Leistungen",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Flughafentransfer Essen – Düsseldorf (DUS)" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Flughafentransfer Essen – Köln/Bonn (CGN)" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Flughafentransfer Essen – Frankfurt (FRA)" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Großraumtaxi-Flughafentransfer bis 7 Personen" } }
    ]
  }
};

const KRANKENFAHRTEN_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "Krankenfahrten Essen – Taxi B&B GmbH",
  "description": "Zugelassene Krankenfahrten in Essen mit direkter Abrechnung bei gesetzlichen Krankenkassen. Für Dialyse, Strahlentherapie, Arzttermine, Rehakliniken und Krankenhausaufnahmen. Einfühlsame, erfahrene Fahrer. 24/7 erreichbar.",
  "url": "https://taxibbessen.de/krankenfahrten-essen",
  "medicalSpecialty": "Personenbeförderung im Gesundheitswesen",
  "availableService": [
    { "@type": "MedicalTherapy", "name": "Dialysefahrten Essen" },
    { "@type": "MedicalTherapy", "name": "Strahlentherapie-Fahrten" },
    { "@type": "MedicalTherapy", "name": "Chemotherapie-Fahrten" },
    { "@type": "MedicalTherapy", "name": "Arzttermin-Fahrten" },
    { "@type": "MedicalTherapy", "name": "Rehabilitationsfahrten" }
  ],
  "provider": PROVIDER,
  "areaServed": { "@type": "City", "name": "Essen" },
  "availableChannel": {
    "@type": "ServiceChannel",
    "servicePhone": { "@type": "ContactPoint", "telephone": "+492017070600", "contactType": "reservations", "availableLanguage": "de", "hoursAvailable": "Mo-Su 00:00-23:59" }
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "description": "Direkte Kassenabrechnung – kein Vorschuss erforderlich",
    "seller": PROVIDER
  }
};

const DIALYSEFAHRTEN_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "Dialysefahrten Essen – Taxi B&B GmbH",
  "description": "Regelmäßige, pünktliche Dialysefahrten in Essen, Bochum, Gelsenkirchen und Duisburg. Direkte Abrechnung mit gesetzlichen Krankenkassen. Fester Fahrplan auf Wunsch, einfühlsame Fahrer, Haustür-zu-Haustür-Service.",
  "url": "https://taxibbessen.de/dialysefahrten-essen",
  "medicalSpecialty": "Dialyse-Patientenbeförderung",
  "availableService": [
    { "@type": "MedicalTherapy", "name": "Dialysefahrten Essen" },
    { "@type": "MedicalTherapy", "name": "Dialysefahrten Bochum" },
    { "@type": "MedicalTherapy", "name": "Dialysefahrten Gelsenkirchen" },
    { "@type": "MedicalTherapy", "name": "Dialysefahrten Duisburg" }
  ],
  "provider": PROVIDER,
  "areaServed": [
    { "@type": "City", "name": "Essen" },
    { "@type": "City", "name": "Bochum" },
    { "@type": "City", "name": "Gelsenkirchen" },
    { "@type": "City", "name": "Duisburg" }
  ],
  "availableChannel": {
    "@type": "ServiceChannel",
    "servicePhone": { "@type": "ContactPoint", "telephone": "+492017070600", "contactType": "reservations", "availableLanguage": "de", "hoursAvailable": "Mo-Su 00:00-23:59" }
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "description": "Direkte Kassenabrechnung – kein Vorschuss erforderlich",
    "seller": PROVIDER
  }
};

const GROSSRAUMTAXI_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Großraumtaxi Essen – Mercedes V-Klasse bis 7 Personen",
  "alternateName": "Gruppenfahrt Taxi Essen",
  "description": "Großraumtaxi in Essen mit der Mercedes V-Klasse – Platz für bis zu 7 Personen, WLAN, Klimaanlage, Kindersitze auf Anfrage. Ideal für Flughafentransfers, Familienausflüge, Firmenfahrten, Hochzeiten und Gruppenreisen.",
  "url": "https://taxibbessen.de/grossraumtaxi-essen",
  "serviceType": "Großraumtaxi / Gruppenbeförderung",
  "category": "Personenbeförderung",
  "provider": PROVIDER,
  "areaServed": [
    { "@type": "City", "name": "Essen" },
    { "@type": "State", "name": "Nordrhein-Westfalen" }
  ],
  "availableChannel": {
    "@type": "ServiceChannel",
    "servicePhone": { "@type": "ContactPoint", "telephone": "+492017070600", "contactType": "reservations", "availableLanguage": "de", "hoursAvailable": "Mo-Su 00:00-23:59" }
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "description": "Festpreis auf Anfrage",
    "seller": PROVIDER
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Großraumtaxi-Leistungen",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Gruppenflughafentransfer Essen bis 7 Personen" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Familienfahrt mit Kindersitzen" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Firmentransfer und Delegationsfahrten" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Hochzeitsfahrt und Event-Transfer" } }
    ]
  },
  "vehicle": {
    "@type": "Vehicle",
    "name": "Mercedes V-Klasse",
    "brand": { "@type": "Brand", "name": "Mercedes-Benz" },
    "vehicleSeatingCapacity": 7,
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "WLAN", "value": "inklusive" },
      { "@type": "PropertyValue", "name": "Klimaanlage", "value": "inklusive" },
      { "@type": "PropertyValue", "name": "Kindersitz", "value": "auf Anfrage" }
    ]
  }
};

const FLUGHAFENTRANSFER_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "de",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Wie viel kostet ein Flughafentransfer von Essen nach Düsseldorf?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wir berechnen Festpreise ohne Taxameter-Risiko. Die Strecke Essen–Düsseldorf (DUS) beträgt ca. 35–40 km. Rufen Sie uns für ein konkretes Angebot an: 0201 707060 – 24/7 erreichbar."
      }
    },
    {
      "@type": "Question",
      "name": "Zu welchen Flughäfen fahren Sie von Essen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wir fahren Sie zu allen Flughäfen der Region: Düsseldorf (DUS), Köln/Bonn (CGN), Dortmund (DTM) und Frankfurt (FRA). Bundesweit auf Anfrage."
      }
    },
    {
      "@type": "Question",
      "name": "Was passiert, wenn mein Flug Verspätung hat?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wir verfolgen Ihren Flug in Echtzeit und passen die Abholzeit automatisch an. Wartezeit durch Flugverspätungen ist für Sie kostenlos – wir sind da, wenn Sie ankommen."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich den Flughafentransfer auch für eine Gruppe buchen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja! Unsere Mercedes V-Klasse bietet Platz für bis zu 7 Personen – ideal für Familien, Reisegruppen und Firmenteams. Kindersitze auf Anfrage. Anrufen: 0201 707060."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich den Flughafentransfer auch nachts oder früh morgens buchen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolut. Wir sind 24 Stunden täglich, 7 Tage die Woche erreichbar – egal ob Nachtflug um 3 Uhr oder Frühschicht um 4:30 Uhr. Einfach anrufen: 0201 707060."
      }
    }
  ]
};

const KRANKENFAHRTEN_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "de",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Übernimmt die Krankenkasse die Kosten für Krankenfahrten mit Taxi B&B?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, wir rechnen direkt mit gesetzlichen Krankenkassen ab – kein bürokratischer Aufwand für Sie. Sie benötigen lediglich eine gültige ärztliche Verordnung. Wir sind für alle gesetzlichen Krankenversicherungen zugelassen."
      }
    },
    {
      "@type": "Question",
      "name": "Für welche medizinischen Fahrten sind Sie zugelassen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wir führen alle genehmigungspflichtigen Krankenfahrten durch: Dialyse, Strahlentherapie, Chemotherapie, Arzttermine, Rehakliniken, Krankenhausaufnahmen und -entlassungen sowie Physiotherapie."
      }
    },
    {
      "@type": "Question",
      "name": "Holt ihr uns direkt an der Haustür ab?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, wir bieten Haustür-zu-Haustür-Service. Auf Wunsch begleiten wir Sie auch bis zur Eingangstür der Klinik oder Praxis. Pünktlichkeit und Einfühlsamkeit stehen bei uns an erster Stelle."
      }
    },
    {
      "@type": "Question",
      "name": "Wie buche ich eine Krankenfahrt?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rufen Sie uns an: 0201 707060 – 24/7 erreichbar. Für regelmäßige Fahrten (z. B. wöchentliche Dialyse) richten wir gerne einen festen Fahrplan ein. Alternativ können Sie auch online vorbuchen."
      }
    },
    {
      "@type": "Question",
      "name": "Fahren Sie auch zu Kliniken außerhalb von Essen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, wir fahren zu Kliniken, Praxen und Rehazentren in Essen und der gesamten Region – auch nach Bochum, Gelsenkirchen, Duisburg und auf Anfrage bundesweit."
      }
    }
  ]
};

const DIALYSEFAHRTEN_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "de",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Rechnen Sie Dialysefahrten direkt mit der Krankenkasse ab?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, wir rechnen Dialysefahrten direkt mit gesetzlichen Krankenkassen ab. Sie benötigen eine ärztliche Verordnung. Es entstehen Ihnen keine Vorkosten – wir kümmern uns um die Abrechnung."
      }
    },
    {
      "@type": "Question",
      "name": "Können wir einen festen Fahrplan für regelmäßige Dialysefahrten vereinbaren?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, für Patienten mit regelmäßiger Dialyse (z. B. dreimal pro Woche) richten wir gerne einen festen Fahrplan ein. So müssen Sie sich um nichts kümmern – wir sind verlässlich pünktlich."
      }
    },
    {
      "@type": "Question",
      "name": "In welchen Städten bieten Sie Dialysefahrten an?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wir fahren zu Dialysezentren in Essen, Bochum, Gelsenkirchen und Duisburg. Weitere Orte auf Anfrage. Rufen Sie uns an: 0201 707060."
      }
    },
    {
      "@type": "Question",
      "name": "Sind Ihre Fahrer im Umgang mit Dialysepatienten erfahren?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja. Unsere Fahrer sind einfühlsam und kennen die besonderen Bedürfnisse von Dialysepatienten. Wir holen Sie pünktlich ab und bringen Sie sicher nach Hause – Haustür zu Haustür."
      }
    },
    {
      "@type": "Question",
      "name": "Was benötige ich, um Dialysefahrten über die Krankenkasse abzurechnen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sie benötigen eine ärztliche Verordnung für Krankenfahrten (Muster 4). Diese legen Sie uns einmalig vor – danach übernehmen wir die Abrechnung direkt mit Ihrer gesetzlichen Krankenkasse."
      }
    }
  ]
};

const GROSSRAUMTAXI_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "de",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Wie viele Personen passen in das Großraumtaxi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Unsere Mercedes V-Klasse bietet Platz für bis zu 7 Personen plus Gepäck. Ideal für Familien, Reisegruppen und Firmendelegationen."
      }
    },
    {
      "@type": "Question",
      "name": "Sind Kindersitze im Großraumtaxi verfügbar?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, Kindersitze stehen auf Anfrage für alle Altersgruppen bereit. Bitte geben Sie bei der Buchung Alter und Gewicht der Kinder an, damit wir den passenden Sitz vorbereiten können."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich das Großraumtaxi für einen Flughafentransfer buchen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, der Flughafentransfer mit dem Großraumtaxi ist unsere häufigste Buchung. Wir fahren Sie und Ihre Gruppe komfortabel und zum Festpreis zu den Flughäfen Düsseldorf, Köln/Bonn, Dortmund und Frankfurt."
      }
    },
    {
      "@type": "Question",
      "name": "Was kostet das Großraumtaxi in Essen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wir berechnen Festpreise ohne Taxameter-Risiko. Rufen Sie uns an für ein konkretes Angebot: 0201 707060. Oft günstiger als zwei getrennte Taxis!"
      }
    },
    {
      "@type": "Question",
      "name": "Fahren Sie auch Hochzeiten und Events mit dem Großraumtaxi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja! Die Mercedes V-Klasse eignet sich perfekt für Hochzeiten, Geburtstage, Konzerte und Firmenevents. Stilvoll, pünktlich und komfortabel. Jetzt buchen: 0201 707060."
      }
    }
  ]
};

const KURIERDIENST_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "de",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Was transportiert Taxi B&B im Kurierdienst?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wir transportieren Dokumente, Akten, Pakete, medizinische Proben und Unterlagen sowie persönliche Gegenstände – diskret, direkt und zuverlässig. Für Unternehmen, Kanzleien, Arztpraxen und Privatpersonen."
      }
    },
    {
      "@type": "Question",
      "name": "Wie schnell liefert der Kurierdienst in Essen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Als Express-Kurierdienst sind wir in der Regel innerhalb kürzester Zeit abholbereit. Wir fahren direkt von A nach B – ohne Umwege und ohne Zwischenstopps. Anrufen: 0201 707060."
      }
    },
    {
      "@type": "Question",
      "name": "Fahren Sie auch bundesweit als Kurierdienst?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, auf Anfrage fahren wir bundesweit. Für Fernstrecken-Kurierfahrten rufen Sie uns einfach an und wir machen Ihnen ein Festpreisangebot: 0201 707060."
      }
    },
    {
      "@type": "Question",
      "name": "Ist der Kurierdienst auch für medizinische Proben geeignet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, wir transportieren medizinische Proben, Laborunterlagen und Rezepte für Arztpraxen, Kliniken und Apotheken – schnell, diskret und zuverlässig in Essen und Umgebung."
      }
    },
    {
      "@type": "Question",
      "name": "Wann ist der Kurierdienst erreichbar?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Unser Kurierdienst ist 24 Stunden täglich, 7 Tage die Woche erreichbar. Rufen Sie uns einfach an: 0201 707060. Wir sind auch nachts und an Wochenenden für Sie da."
      }
    }
  ]
};

const KURIERDIENST_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Kurierdienst Essen – Schnell, Diskret & Zuverlässig",
  "alternateName": "Express-Kurierfahrten Essen",
  "description": "Express-Kurierfahrten in Essen und Region: diskret, direkt, 24/7. Für Unternehmen, Kanzleien, Arztpraxen und Privatpersonen. Transport von Dokumenten, Paketen, medizinischen Proben und persönlichen Gegenständen. Bundesweit auf Anfrage.",
  "url": "https://taxibbessen.de/kurierdienst-essen",
  "serviceType": "Kurierdienst / Express-Transport",
  "category": "Güterbeförderung / Kurierfahrten",
  "provider": PROVIDER,
  "areaServed": [
    { "@type": "City", "name": "Essen" },
    { "@type": "City", "name": "Bochum" },
    { "@type": "City", "name": "Gelsenkirchen" },
    { "@type": "City", "name": "Duisburg" },
    { "@type": "City", "name": "Dortmund" },
    { "@type": "Country", "name": "Deutschland" }
  ],
  "availableChannel": {
    "@type": "ServiceChannel",
    "servicePhone": { "@type": "ContactPoint", "telephone": "+492017070600", "contactType": "customer service", "availableLanguage": "de", "hoursAvailable": "Mo-Su 00:00-23:59" }
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "description": "Festpreis auf Anfrage",
    "seller": PROVIDER
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Kurierdienst-Leistungen",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Dokumenten- und Aktentransport" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Medizinische Proben und Unterlagen" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Unternehmenspaket-Lieferung" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Bundesweite Kurierfahrten auf Anfrage" } }
    ]
  }
};

function makeDistrictSchema(district: string, districtSlug: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Taxi ${district} Essen – Taxi B&B GmbH`,
    "description": `Taxiservice in Essen-${district}: 24/7 erreichbar, Festpreise, klimatisierte Mercedes-Fahrzeuge. Flughafentransfers, Krankenfahrten und Großraumtaxi. Schnelle Abholung in ${district}.`,
    "url": `https://taxibbessen.de/${districtSlug}`,
    "serviceType": "Taxiservice",
    "category": "Personenbeförderung",
    "provider": PROVIDER,
    "areaServed": { "@type": "Place", "name": `Essen-${district}`, "containedInPlace": { "@type": "City", "name": "Essen" } },
    "availableChannel": {
      "@type": "ServiceChannel",
      "servicePhone": { "@type": "ContactPoint", "telephone": "+492017070600", "contactType": "reservations", "availableLanguage": "de", "hoursAvailable": "Mo-Su 00:00-23:59" }
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "description": "Festpreis auf Anfrage",
      "seller": PROVIDER
    }
  };
}

const TAXI_HBF_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Taxi Essen Hauptbahnhof – Taxi B&B GmbH",
  "description": "Taxiservice am Essen Hauptbahnhof: 24/7 erreichbar, schnelle Abholung, Festpreise. Zuverlässiger Transfer zu Hotels, Messe Essen, Flughafen Düsseldorf und allen Stadtteilen Essens.",
  "url": "https://taxibbessen.de/taxi-essen-hbf",
  "serviceType": "Taxiservice / Bahnhofstransfer",
  "category": "Personenbeförderung",
  "provider": PROVIDER,
  "areaServed": {
    "@type": "CivicStructure",
    "name": "Essen Hauptbahnhof",
    "containedInPlace": { "@type": "City", "name": "Essen" }
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "servicePhone": { "@type": "ContactPoint", "telephone": "+492017070600", "contactType": "reservations", "availableLanguage": "de", "hoursAvailable": "Mo-Su 00:00-23:59" }
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "description": "Festpreis auf Anfrage",
    "seller": PROVIDER
  }
};

function breadcrumbLabel(title: string): string {
  return title.split(/ [|–] /)[0].trim();
}

function makeBreadcrumb(path: string, title: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Startseite",
        "item": `${CANONICAL_DOMAIN}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": breadcrumbLabel(title),
        "item": `${CANONICAL_DOMAIN}${path}/`
      }
    ]
  };
}

const NOSCRIPT_STYLE = 'font-family:system-ui,sans-serif;max-width:820px;margin:0 auto';
const CONTACT_BLOCK = `
        <h2>Kontakt</h2>
        <address>
          Taxi B&amp;B GmbH · Menzelstraße 8-10 · 45147 Essen<br>
          Telefon: <a href="tel:+4920170706">0201 707060</a><br>
          E-Mail: <a href="mailto:taxibb@outlook.com">taxibb@outlook.com</a>
        </address>`;

const HOMEPAGE_NOSCRIPT_BODY = `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>24/7 Taxiservice in Essen – Krankenfahrten, Flughafentransfer und Großraumtaxi</h1>
        <p>Taxi B&amp;B GmbH ist <a href="/ueber-uns">seit 1992</a> Ihr zuverlässiger Taxiservice in Essen. Wir bieten Krankenfahrten, Flughafentransfer nach <a href="https://www.dus.com">Düsseldorf</a> und Dortmund, Privat- und Geschäftsfahrten, Kurierdienst sowie Großraumtaxis für bis zu 7 Personen. Rund um die Uhr erreichbar unter <strong>0201 707060</strong> – 24 Stunden am Tag, 7 Tage die Woche, 365 Tage im Jahr.</p>

        <h2>Offizielle Informationen zur Taxi B&amp;B GmbH</h2>
        <p>Taxi B&amp;B GmbH ist ein Taxiunternehmen mit Sitz in Essen-Holsterhausen. Die offizielle Website ist <strong>taxibbessen.de</strong>. Die offizielle Telefonnummer lautet <strong>0201 707060</strong>. Die Adresse lautet Menzelstraße 8–10, 45147 Essen. Das Unternehmen wurde 1992 gegründet und ist im Handelsregister Essen unter HRB 36284 eingetragen. Taxi B&amp;B GmbH bietet 24h-Taxiservice, Krankenfahrten, Dialysefahrten, Flughafentransfer Düsseldorf, Kurierfahrten, Geschäftsfahrten und Großraumtaxis für bis zu 7 Personen an.</p>

        <h2>Unsere Leistungen</h2>
        <p><a href="/book">Jetzt Fahrt online buchen</a> oder direkt anrufen: 0201 707060.</p>
        <ul>
          <li><strong>Krankenfahrten Essen:</strong> Wir übernehmen alle gesetzlich genehmigten Krankenfahrten, Dialysefahrten und Fahrten zur Strahlentherapie. Direkte Abrechnung mit Ihrer Krankenkasse – kein Aufwand für Sie.</li>
          <li><strong>Flughafentransfer Düsseldorf:</strong> Komfortabler Transfer zu allen Flughäfen – <a href="https://www.dus.com">Düsseldorf</a>, Köln/Bonn, Frankfurt und mehr. Mit Flugverfolgung und Wartezeit inklusive. Festpreis auf Anfrage.</li>
          <li><strong>Privat- und Geschäftsfahrten:</strong> Ob privat oder geschäftlich – wir fahren Sie bequem und pünktlich in Essen, bundesweit oder auf Anfrage auch ins europäische Ausland.</li>
          <li><strong>Großraumtaxi für 7 Personen:</strong> Unsere <a href="/fahrzeuge">Mercedes V-Klasse</a> bietet Platz für bis zu 7 Personen mit Gepäck – ideal für Familien, Gruppen und Firmendelegationen.</li>
          <li><strong>Kurierdienst Essen:</strong> Schnelle, zuverlässige Kurierfahrten in Essen und der gesamten Region. Vertragsdokumente, Pakete oder sensible Unterlagen – diskret und pünktlich.</li>
          <li><strong>Haus-zu-Haus Service:</strong> Wir holen Sie direkt an Ihrer Haustür ab und bringen Sie zu Ihrem Ziel – ganz ohne Stress. Gepäckhilfe inklusive.</li>
        </ul>

        <h2>Häufige Fragen</h2>
        <dl>
          <dt>Wie viel kostet ein Taxi zum Flughafen Düsseldorf aus Essen?</dt>
          <dd>Die Strecke Essen–Flughafen Düsseldorf beträgt ca. 35–40 km. Wir berechnen transparente Festpreise ohne böse Überraschungen. Rufen Sie uns für ein konkretes Angebot an: 0201 707060.</dd>
          <dt>Kann ich ein Taxi per WhatsApp buchen?</dt>
          <dd>Ja! Schreiben Sie uns unter +49 171 1111535 – wir antworten schnell und bestätigen Ihre Buchung direkt per WhatsApp.</dd>
          <dt>Bieten Sie Kindersitze an?</dt>
          <dd>Ja, Kindersitze sind auf Anfrage erhältlich. Bitte Alter und Gewicht des Kindes bei der Buchung angeben.</dd>
          <dt>Wie läuft eine Geschäftsfahrt mit Rechnung ab?</dt>
          <dd>Für Firmenkunden stellen wir auf Wunsch eine Rechnung mit allen steuerlich relevanten Angaben aus. Regelmäßige Kunden erhalten auf Anfrage Monatsabrechnungen.</dd>
          <dt>In welchen Stadtteilen in Essen fahren Sie?</dt>
          <dd>Wir fahren in ganz Essen – von Holsterhausen und Rüttenscheid über den Hauptbahnhof, Südviertel, Frohnhausen, Altenessen, Steele bis nach Kettwig und Werden.</dd>
          <dt>Ist Taxi B&amp;B GmbH wirklich 24 Stunden erreichbar?</dt>
          <dd>Absolut – 24 Stunden, 7 Tage die Woche, 365 Tage im Jahr. Egal ob Nachtflug oder Frühschicht: Wir sind immer für Sie da.</dd>
          <dt>Fahren Sie auch ins Ausland oder bundesweit?</dt>
          <dd>Ja, wir fahren bundesweit und ins europäische Ausland. Amsterdam, Wien, Zürich – kein Problem. Festpreise auf Anfrage unter 0201 707060.</dd>
          <dt>Wie setzt sich der Taxipreis zusammen?</dt>
          <dd>Der Fahrpreis besteht aus Grundgebühr, Kilometerpreis und ggf. Zeittarif. Für viele Strecken bieten wir Festpreise an. Alle Preise nach offizieller Essener Taxitarifordnung.</dd>
        </dl>

        <h2>Kontakt</h2>
        <p>Kundenbewertungen auf <a href="https://www.provenexpert.com/de-de/taxi-bb-gmbh/">ProvenExpert</a>. Eintrag auf <a href="https://www.gelbeseiten.de/gsbiz/07d88c60-db79-4a47-ab69-268c3f710b46">Gelbe Seiten</a>.</p>
        <address>
          Taxi B&amp;B GmbH · Menzelstraße 8-10 · 45147 Essen<br>
          Telefon: <a href="tel:+492017 07060">0201 707060</a><br>
          E-Mail: <a href="mailto:taxibb@outlook.com">taxibb@outlook.com</a>
        </address>
      </article>`;

const routes: PrerenderRoute[] = [
  {
    ...meta('/'),
    schemaOrg: HOMEPAGE_FAQ_SCHEMA,
    noscriptBody: HOMEPAGE_NOSCRIPT_BODY,
  },
  {
    ...meta('/fahrzeuge'),
    schemaOrg: FAHRZEUGE_SCHEMA,
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Unsere Fahrzeugflotte – Taxi &amp; Großraumtaxi in Essen</h1>
        <p>Taxi B&amp;B GmbH betreibt eine moderne, gepflegte Fahrzeugflotte aus dem Hause Mercedes-Benz. Alle Fahrzeuge sind klimatisiert, regelmäßig von zertifizierten Fachbetrieben gewartet und bieten höchsten Fahrkomfort. Ob Einzel- oder Gruppenfahrt, ob Flughafentransfer oder medizinischer Transport – wir haben das richtige Fahrzeug für jeden Anlass. <a href="/book">Jetzt Fahrt buchen</a> oder <a href="/ueber-uns">mehr über uns erfahren</a>.</p>

        <h2>Mercedes E-Klasse T-Modell – Kombi</h2>
        <p>Unser meistgebuchtes Fahrzeug: Der Mercedes E-Klasse Kombi verbindet Businessklasse-Komfort mit großzügigem Kofferraumvolumen. Bis zu 4 Personen reisen entspannt in Executive-Sitzen mit Klimaanlage und USB-Ladeanschluss. Der Kombi ist die erste Wahl für Geschäftsreisen, <a href="/flughafentransfer-essen-duesseldorf">Flughafentransfers nach Düsseldorf</a>, Alltagsfahrten und Fahrten zu medizinischen Einrichtungen. Die Kombikonfiguration erlaubt auch den bequemen Transport von Rollkoffern, Sporttaschen und umfangreichem Gepäck. Dank modernster Sicherheitstechnik und regelmäßiger Wartung ist der E-Klasse Kombi zuverlässig und pannensicher auf jeder Strecke.</p>
        <ul>
          <li>Bis zu 4 Passagiere</li>
          <li>Großer Kofferraum – ideal für Flughafengepäck</li>
          <li>Klimaanlage, Executive-Sitze, USB-Ladeanschlüsse</li>
          <li>Ideal für Geschäftsreisen und Flughafentransfers</li>
        </ul>

        <h2>Mercedes V-Klasse – Großraumtaxi für bis zu 7 Personen</h2>
        <p>Die Mercedes V-Klasse ist das perfekte Großraumtaxi in Essen für Familien, Reisegruppen und Firmenteams. Mit Platz für bis zu 7 Passagiere und reichlich Kofferraumvolumen meistert dieses Fahrzeug jede Gruppenreise: Familienurlaub-Anreise zum Flughafen Düsseldorf, Firmendelegationen, Hochzeiten, Gruppenausflüge oder Transfers zum Essener Hauptbahnhof. Kindersitze stehen auf Anfrage für alle Altersgruppen bereit. Das Fahrzeug verfügt über WLAN, Klimaanlage und bequeme Einzelsitze für alle Passagiere. Statt mehrerer Einzeltaxis reisen alle gemeinsam – zum günstigeren Gesamtpreis und ohne Koordinationsaufwand. Ideal auch für <a href="/kurierdienst-essen">Kurierfahrten mit sperrigen Gütern</a> oder umfangreichem Gepäck.</p>
        <ul>
          <li>Bis zu 7 Passagiere</li>
          <li>Kindersitze auf Anfrage</li>
          <li>WLAN, Klimaanlage, Einzelsitze</li>
          <li>Ideal für Gruppen, Familien, Firmendelegationen</li>
          <li>Günstig im Vergleich zu mehreren Einzeltaxis</li>
        </ul>

        <h2>Mercedes E 300 e – Hybrid &amp; Elektro</h2>
        <p>Modernste Antriebstechnik für emissionsarme Fahrten in Essen und der Region: Der Mercedes E 300 e fährt im Stadtbereich rein elektrisch – geräuschlos, umweltschonend und ohne Reichweitenangst dank leistungsstarkem Hybridantrieb. Ideal für Fahrgäste, die Wert auf Nachhaltigkeit legen, ohne auf Businessklasse-Komfort zu verzichten. Besonders beliebt für ruhige Fahrten zu Kliniken, Hotels und Praxen, wo ein geräuscharmes Fahrzeug willkommen ist. Auch für Nachtfahrten und frühe Abholungen schätzen Fahrgäste den leisen Elektroantrieb. Gleicher Komfort, gleiche Sicherheit – aber deutlich weniger Emissionen.</p>
        <ul>
          <li>Emissionsarmer Hybridantrieb</li>
          <li>Im Stadtbereich rein elektrisch</li>
          <li>Geräuschlos – ideal für Kliniken und Hotels</li>
          <li>Modernste Sicherheits- und Bordtechnik</li>
        </ul>

        <h2>Welches Fahrzeug passt zu Ihnen?</h2>
        <p><strong>Allein oder zu zweit:</strong> Wählen Sie den Mercedes E-Klasse Kombi – komfortabel, gepflegt, für Gepäck bestens geeignet.</p>
        <p><strong>3 bis 7 Personen:</strong> Das Großraumtaxi Mercedes V-Klasse ist die richtige Wahl – alle kommen gemeinsam ans Ziel.</p>
        <p><strong>Umweltbewusst:</strong> Der Mercedes E 300 e Hybrid fährt emissionsarm und leise durch Essen.</p>
        <p><strong>Unsicher?</strong> Rufen Sie uns an – wir beraten Sie kostenlos: <a href="tel:+4920170706">0201 707060</a>. <a href="/book">Online buchen</a>.</p>

        <h2>Qualität ohne Kompromisse</h2>
        <p>Alle Fahrzeuge werden regelmäßig von zertifizierten Kfz-Fachbetrieben gewartet und nach jeder Schicht professionell gereinigt und desinfiziert. Strikte Einhaltung aller Service-Intervalle, modernste Sensorik und lückenlose Technik-Checks garantieren maximale Zuverlässigkeit auf jeder Strecke. Für unsere Kunden bedeutet das: kein Stehen bleiben, keine Verspätungen durch Fahrzeugprobleme – nur pünktliche, sichere und komfortable Fahrten durch Essen und das Ruhrgebiet.</p>

        <h2>Weitere Leistungen</h2>
        <p><a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen–Düsseldorf</a> · <a href="/krankenfahrten-essen">Krankenfahrten Essen</a> · <a href="/grossraumtaxi-essen">Großraumtaxi Essen</a> · <a href="/kurierdienst-essen">Kurierdienst Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/ueber-uns'),
    schemaOrg: UEBER_UNS_SCHEMA,
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Über Taxi B&amp;B GmbH in Essen</h1>
        <p>Taxi B&amp;B GmbH ist ein inhabergeführtes Taxiunternehmen in Essen mit über 30 Jahren Erfahrung in der Personenbeförderung. Gegründet 1992 als Familienbetrieb im Herzen des Ruhrgebiets, zählen wir heute zu den etablierten Taxiunternehmen in Essen und der gesamten Region. Unser Standort: Menzelstraße 8–10, 45147 Essen. Erreichbar rund um die Uhr: <a href="tel:+4920170706">0201 707060</a>.</p>

        <h2>Unsere Geschichte seit 1992</h2>
        <p>Die Gründerfamilie Barger &amp; Beige startete Taxi B&amp;B GmbH 1992 in Essen mit einem klaren Versprechen: Pünktlichkeit, Verlässlichkeit und ein persönliches Lächeln bei jeder Fahrt. Was damals mit einem Fahrzeug begann, ist heute ein eingespieltes Team aus erfahrenen Fahrern und einer gepflegten Mercedes-Flotte. Im Laufe der Jahrzehnte wurde die Flotte kontinuierlich modernisiert: 2003 folgten klimatisierte Komfort-Limousinen, 2008 die Einführung des Großraumtaxis für bis zu 7 Personen und 2012 die Aufnahme der genehmigungspflichtigen Kranken- und Dialysefahrten mit direkter Kassenabrechnung.</p>
        <p>Viele unserer Fahrgäste sind keine Kunden mehr – sie sind Stammgäste. Familien, die ihre Kinder zum Flughafen schicken. Senioren, die uns für ihre Arzttermine vertrauen. Geschäftsleute, die uns anrufen, bevor sie überhaupt den Termin eingetragen haben. Dieses Vertrauen ist das Ergebnis von über drei Jahrzehnten gelebter Verlässlichkeit.</p>

        <h2>Unser Team und unsere Werte</h2>
        <ul>
          <li><strong>Pünktlichkeit:</strong> Wir holen Sie zur vereinbarten Zeit ab – ohne Ausreden und ohne Wartezeiten.</li>
          <li><strong>Festpreise:</strong> Transparente Preise ohne böse Überraschungen – kein Taxameter-Risiko bei Stau oder Umleitung.</li>
          <li><strong>Persönlicher Service:</strong> Kein Algorithmus, kein anonymes Portal – ein echter Mensch spricht mit Ihnen.</li>
          <li><strong>24/7 Erreichbarkeit:</strong> Tag und Nacht, 365 Tage im Jahr für Sie da: <a href="tel:+4920170706">0201 707060</a>.</li>
          <li><strong>Lokale Ortskenntnis:</strong> Unsere Fahrer kennen jeden Stadtteil in Essen – Rüttenscheid, Holsterhausen, Frohnhausen, Steele und mehr.</li>
          <li><strong>Professionelle Flotte:</strong> Gepflegte Mercedes-Fahrzeuge – Kombi, Großraumtaxi und Hybrid – regelmäßig gewartet.</li>
        </ul>

        <h2>Standort in Essen</h2>
        <p>Unser Betrieb ist in der Menzelstraße 8–10, 45147 Essen ansässig – zentral im Ruhrgebiet, gut erreichbar aus allen Essener Stadtteilen und der gesamten Region. Wir sind 24 Stunden täglich, 7 Tage die Woche, 365 Tage im Jahr für Sie erreichbar.</p>

        <h2>Lizenzen und Zertifizierungen</h2>
        <ul>
          <li>Konzession gemäß Personenbeförderungsgesetz (PBefG)</li>
          <li>Zulassung für Krankenfahrten und Dialysefahrten mit Kassenabrechnung</li>
          <li>Mitglied bei taxi.de – Deutsches Taxi- und Mietwagengewerbe</li>
          <li>Handelsregistereintrag: HRB 36284 Amtsgericht Essen</li>
          <li>Regelmäßige TÜV-Hauptuntersuchungen aller Fahrzeuge</li>
          <li>Alle Fahrer mit amtlichem Personenbeförderungsschein (P-Schein)</li>
        </ul>

        <h2>Warum Kunden wiederkommen</h2>
        <p>In einer Welt, in der Fahrdienste oft austauschbar sind, setzen wir auf Kontinuität. Unsere Fahrer kennen die Stadt, kennen die Staus, kennen die Abkürzungen – und oft kennen sie auch Sie. Wir haben keine Algorithmen, die Sie in eine Warteschlange einreihen. Vertrauen entsteht durch Verlässlichkeit, durch Respekt und durch die kleinen Dinge: das aufgehaltene Gepäck, der freundliche Morgengruß, die Route, die wir kennen, ohne dass Sie sie erklären müssen.</p>

        <h2>Unsere Leistungen</h2>
        <p><a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen–Düsseldorf</a> · <a href="/krankenfahrten-essen">Krankenfahrten Essen</a> · <a href="/dialysefahrten-essen">Dialysefahrten Essen</a> · <a href="/grossraumtaxi-essen">Großraumtaxi Essen</a> · <a href="/kurierdienst-essen">Kurierdienst Essen</a> · <a href="/fahrzeuge">Unsere Fahrzeuge</a></p>
        <p><a href="/book">Jetzt Fahrt buchen</a> oder telefonisch unter <a href="tel:+4920170706">0201 707060</a>.</p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/book'),
    extraHeadTags: `    <meta http-equiv="refresh" content="0;url=/#anfrage" />`,
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Taxi in Essen buchen</h1>
        <p>Sie werden zum Buchungsformular weitergeleitet. Falls die Weiterleitung nicht funktioniert, <a href="/#anfrage">klicken Sie hier</a> oder rufen Sie uns an: <a href="tel:+4920170706">0201 707060</a>.</p>
      </article>`,
  },
  {
    ...meta('/confirmation'),
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Buchungsbestätigung – Taxi B&amp;B GmbH Essen</h1>
        <p>Ihre Buchungsanfrage wurde erfolgreich übermittelt. Sie erhalten in Kürze eine Bestätigung.</p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/impressum'),
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Impressum</h1>
        <p>Angaben gemäß § 5 TMG</p>
        <h2>Unternehmensangaben</h2>
        <address>
          Taxi B&amp;B GmbH<br>
          Vertreten durch: Lukman AL-Dlemy<br>
          Menzelstraße 8-10<br>
          45147 Essen<br>
          Telefon: <a href="tel:+4920170706">0201 707060</a><br>
          E-Mail: <a href="mailto:taxibb@outlook.com">taxibb@outlook.com</a>
        </address>
        <h2>Registereintrag</h2>
        <p>Eingetragen im Handelsregister. Registergericht: Amtsgericht Essen.</p>
        <h2>Aufsichtsbehörde</h2>
        <p>Stadt Essen, Ordnungsamt – Taxikonzession gemäß PBefG.</p>
        <h2>Haftungshinweis</h2>
        <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
      </article>`,
  },
  {
    ...meta('/datenschutz'),
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Datenschutzerklärung</h1>
        <p>Taxi B&amp;B GmbH – Essen · Gemäß DSGVO &amp; TDDDG</p>
        <h2>Verantwortlicher</h2>
        <address>
          Taxi B&amp;B GmbH<br>
          Menzelstraße 8-10, 45147 Essen<br>
          Telefon: <a href="tel:+4920170706">0201 707060</a><br>
          E-Mail: <a href="mailto:taxibb@outlook.com">taxibb@outlook.com</a>
        </address>
        <h2>Erhebung und Verarbeitung personenbezogener Daten</h2>
        <p>Wir erheben personenbezogene Daten nur, soweit dies zur Erbringung unserer Dienstleistungen erforderlich ist (z. B. Name, Adresse, Telefonnummer für Buchungen). Die Daten werden nicht an Dritte weitergegeben, es sei denn, dies ist zur Vertragserfüllung notwendig.</p>
        <h2>Ihre Rechte</h2>
        <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten sowie das Recht auf Datenübertragbarkeit. Wenden Sie sich dazu an: <a href="mailto:taxibb@outlook.com">taxibb@outlook.com</a>.</p>
        <h2>Cookies</h2>
        <p>Diese Website verwendet ausschließlich technisch notwendige Cookies und keine Tracking- oder Analyse-Cookies von Drittanbietern.</p>
      </article>`,
  },
  {
    ...meta('/agb'),
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Allgemeine Geschäftsbedingungen</h1>
        <p>Taxi B&amp;B GmbH – Essen</p>
        <h2>§ 1 Geltungsbereich</h2>
        <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Beförderungsleistungen der Taxi B&amp;B GmbH, Menzelstraße 8-10, 45147 Essen.</p>
        <h2>§ 2 Vertragsschluss</h2>
        <p>Der Beförderungsvertrag kommt durch die Bestellung des Fahrgastes und die Annahme durch Taxi B&amp;B GmbH zustande. Die Buchung kann telefonisch, schriftlich oder über das Online-Formular erfolgen.</p>
        <h2>§ 3 Preise und Zahlung</h2>
        <p>Es gelten die jeweils gültigen Festpreise oder Tarifpreise gemäß dem amtlichen Taxitarif der Stadt Essen. Zahlungen sind in bar, per EC-Karte oder Kreditkarte möglich.</p>
        <h2>§ 4 Stornierung</h2>
        <p>Stornierungen sind bis 2 Stunden vor der vereinbarten Abholzeit kostenfrei. Bei kurzfristigeren Absagen können Stornogebühren anfallen.</p>
        <h2>§ 5 Haftung</h2>
        <p>Taxi B&amp;B GmbH haftet für Schäden im Rahmen der gesetzlichen Vorschriften des Personenbeförderungsgesetzes (PBefG). Für Gegenstände, die im Fahrzeug vergessen werden, übernehmen wir keine Haftung.</p>
        ${CONTACT_BLOCK}
      </article>`,
  },

  // ── Service-Unterseiten ──────────────────────────────────────────────────
  {
    ...meta('/flughafentransfer-essen-duesseldorf'),
    schemaOrg: [FLUGHAFENTRANSFER_SCHEMA, FLUGHAFENTRANSFER_FAQ_SCHEMA],
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Flughafentransfer Essen Düsseldorf – Pünktlich &amp; Komfortabel</h1>
        <p>Taxi B&amp;B GmbH bringt Sie bequem und pünktlich von Essen zu allen wichtigen Flughäfen der Region. Die beliebteste Strecke ist der Flughafentransfer Essen–Düsseldorf (DUS) mit ca. 35–40 km Entfernung. Wir fahren Sie auch zum Flughafen Köln/Bonn (CGN), Dortmund (DTM) und Frankfurt (FRA). Festpreise, keine bösen Überraschungen. Einfach anrufen oder <a href="/book">online buchen</a>.</p>
        <h2>Von Essen zu allen großen Flughäfen</h2>
        <p>Ob Düsseldorf, Köln/Bonn, Frankfurt oder Dortmund – wir fahren Sie zu jedem Flughafen in der Region. Unsere klimatisierte Mercedes-Flotte sorgt für maximalen Komfort auf jeder Strecke. Für Gruppen steht unsere <a href="/grossraumtaxi-essen">Mercedes V-Klasse</a> mit bis zu 7 Sitzplätzen bereit.</p>
        <h2>Flugverfolgung &amp; kostenlose Wartezeit</h2>
        <p>Ihr Flug hat Verspätung? Kein Problem. Wir verfolgen Ihren Flug in Echtzeit und passen die Abholzeit automatisch an. Wartezeit durch Flugverspätungen ist kostenlos – wir sind da, wenn Sie ankommen. Bei der Ankunft stehen wir mit Ihrem Namen am Terminal.</p>
        <h2>Warum Taxi B&amp;B für den Flughafentransfer?</h2>
        <ul>
          <li>Festpreis: Kein Taxameter, kein Staurisiko – Preis ist vorher bekannt.</li>
          <li>24/7 erreichbar: Früher Abflug um 4 Uhr oder Spätlandung um Mitternacht – wir sind da.</li>
          <li>Seit 1992: Über 30 Jahre Erfahrung in Essen und der gesamten Region.</li>
          <li>Mercedes-Flotte: Klimatisiert, gepflegt, komfortabel für jede Strecke.</li>
          <li>Kindersitze auf Anfrage für Familien mit Kindern.</li>
        </ul>
        <h2>Großraumtaxi für Gruppen &amp; viel Gepäck</h2>
        <p>Reisen Sie mit Familie, Kollegen oder viel Gepäck? Unsere Mercedes V-Klasse fasst bis zu 7 Personen und hat reichlich Kofferraumplatz. Ideal für Gruppenreisen, Firmendelegationen oder Familien mit Kinderwagen. Jetzt <a href="/book">online buchen</a> oder anrufen: 0201 707060.</p>
        <h2>Weitere Leistungen</h2>
        <p><a href="/krankenfahrten-essen">Krankenfahrten Essen</a> · <a href="/grossraumtaxi-essen">Großraumtaxi Essen</a> · <a href="/kurierdienst-essen">Kurierdienst Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/krankenfahrten-essen'),
    schemaOrg: [KRANKENFAHRTEN_SCHEMA, KRANKENFAHRTEN_FAQ_SCHEMA],
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Krankenfahrten Essen – Zuverlässig &amp; mit Krankenkassenabrechnung</h1>
        <p>Taxi B&amp;B GmbH führt alle gesetzlich genehmigten Krankenfahrten in Essen und Umgebung durch. Wir rechnen direkt mit Ihrer Krankenkasse ab – kein bürokratischer Aufwand für Sie. Sie benötigen lediglich eine gültige Verordnung Ihres Arztes. Wir sind für alle gesetzlichen Krankenversicherungen zugelassen und kennen die Abrechnungsprozesse genau.</p>
        <h2>Für welche Fahrten eignet sich unser Service?</h2>
        <ul>
          <li>Dialysefahrten – regelmäßig, pünktlich, verlässlich</li>
          <li>Strahlentherapie und Chemotherapie – einfühlsam und diskret</li>
          <li>Arzttermine und Facharztkliniken – in Essen und Umgebung</li>
          <li>Rehakliniken und Physiotherapie – bequem Tür zu Tür</li>
          <li>Krankenhausaufnahme und Entlassung – wir sind pünktlich da</li>
        </ul>
        <h2>Unsere Fahrer – einfühlsam und erfahren</h2>
        <p>Unsere Fahrer kennen die Kliniken, Dialysezentren und Arztpraxen in Essen und der gesamten Region. Pünktlichkeit und Einfühlsamkeit stehen bei uns an erster Stelle – gerade bei Patienten, die auf regelmäßige Fahrten angewiesen sind. Wir holen Sie direkt an Ihrer Haustür ab und begleiten Sie auf Wunsch bis zur Eingangstür.</p>
        <h2>Krankenfahrten in Essen buchen</h2>
        <p>Rufen Sie uns einfach an unter 0201 707060 – wir sind 24/7 erreichbar. Sie können Ihre Krankenfahrt auch <a href="/book">online vorbuchen</a>. Für regelmäßige Fahrten (z. B. wöchentliche Dialyse) richten wir gerne einen festen Fahrplan ein. Weitere Informationen: <a href="/dialysefahrten-essen">Dialysefahrten Essen</a>.</p>
        <h2>Weitere Leistungen</h2>
        <p><a href="/dialysefahrten-essen">Dialysefahrten Essen</a> · <a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen</a> · <a href="/grossraumtaxi-essen">Großraumtaxi Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/grossraumtaxi-essen'),
    schemaOrg: [GROSSRAUMTAXI_SCHEMA, GROSSRAUMTAXI_FAQ_SCHEMA],
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Großraumtaxi Essen – Mercedes V-Klasse für bis zu 7 Personen</h1>
        <p>Unser Großraumtaxi in Essen ist die Mercedes V-Klasse – mit Platz für bis zu 7 Personen und reichlich Kofferraumplatz. Ob Familie mit Kindern, Reisegruppe oder Firmenteam: Sie reisen bequem, klimatisiert und ohne Stress. Das Fahrzeug ist regelmäßig gewartet und gepflegt. Einfach anrufen: 0201 707060 oder <a href="/book">online buchen</a>.</p>
        <h2>Wann brauchen Sie ein Großraumtaxi?</h2>
        <ul>
          <li>Flughafentransfer für Gruppen – alle kommen gemeinsam an</li>
          <li>Familienausflüge – mit Kindersitzen und Kinderwagen</li>
          <li>Firmenfahrten und Delegationen – professionell und diskret</li>
          <li>Hochzeiten und Events – stilvoll und pünktlich</li>
          <li>Gruppenreisen – gemeinsam zum Bahnhof, Konzert oder Hotel</li>
        </ul>
        <h2>Kindersitze &amp; Sonderausstattung</h2>
        <p>Für Familien mit kleinen Kindern stellen wir auf Anfrage Kindersitze bereit. Bitte geben Sie bei der Buchung Alter und Gewicht der Kinder an. Haben Sie besondere Anforderungen – zum Beispiel Platz für einen Rollator oder Sportgeräte? Sprechen Sie uns an – wir finden eine Lösung.</p>
        <h2>Großraumtaxi für den Flughafentransfer</h2>
        <p>Der häufigste Buchungswunsch: <a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer nach Düsseldorf</a> mit der ganzen Gruppe. Wir fahren komfortabel, pünktlich und zum Festpreis – egal ob früh morgens oder spät nachts. Kindersitze auf Anfrage verfügbar.</p>
        <h2>Weitere Leistungen</h2>
        <p><a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen</a> · <a href="/krankenfahrten-essen">Krankenfahrten Essen</a> · <a href="/kurierdienst-essen">Kurierdienst Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/dialysefahrten-essen'),
    schemaOrg: [DIALYSEFAHRTEN_SCHEMA, DIALYSEFAHRTEN_FAQ_SCHEMA],
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Dialysefahrten Essen – Regelmäßig, Pünktlich &amp; Zuverlässig</h1>
        <p>Dialysepatienten sind auf zuverlässige, regelmäßige Fahrten angewiesen – meist dreimal pro Woche, immer zur gleichen Zeit. Taxi B&amp;B GmbH übernimmt diese Verantwortung mit Sorgfalt und Pünktlichkeit. Wir kennen die Dialysezentren und Kliniken in Essen und Umgebung genau. Anrufen: 0201 707060 oder <a href="/book">online buchen</a>.</p>
        <h2>Direkte Abrechnung mit der Krankenkasse</h2>
        <p>Dialysefahrten werden in der Regel von der gesetzlichen Krankenversicherung übernommen. Wir rechnen direkt mit Ihrer Krankenkasse ab – kein Vorschuss, keine Erstattungsanträge für Sie. Sie benötigen eine gültige ärztliche Verordnung zur Krankenbeförderung. Sprechen Sie uns an, wenn Sie Fragen zum Ablauf oder zur Genehmigung haben.</p>
        <h2>Fester Fahrplan &amp; persönlicher Fahrer</h2>
        <p>Für regelmäßige Dialysefahrten richten wir gerne einen festen Fahrplan für Sie ein. So wissen Sie immer, wann wir kommen – ohne jedes Mal neu anrufen zu müssen. Viele unserer Dialysepatienten werden seit Jahren von denselben Fahrern betreut. Unsere Fahrer sind einfühlsam, geduldig und helfen beim Ein- und Aussteigen.</p>
        <h2>Dialysefahrten in Essen, Bochum und Gelsenkirchen</h2>
        <p>Wir fahren in alle Dialysezentren in Essen und der gesamten Region – auch in Bochum, Gelsenkirchen und Duisburg. Rufen Sie uns an: 0201 707060. Weitere Informationen: <a href="/krankenfahrten-essen">Krankenfahrten Essen</a>.</p>
        <h2>Weitere Leistungen</h2>
        <p><a href="/krankenfahrten-essen">Krankenfahrten Essen</a> · <a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen</a> · <a href="/grossraumtaxi-essen">Großraumtaxi Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/kurierdienst-essen'),
    schemaOrg: [KURIERDIENST_SCHEMA, KURIERDIENST_FAQ_SCHEMA],
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Kurierdienst Essen – Schnell, Diskret &amp; Zuverlässig</h1>
        <p>Taxi B&amp;B GmbH übernimmt für Sie Express-Kurierfahrten in Essen und der gesamten Region. Wir liefern direkt von Absender zu Empfänger – ohne Umwege, ohne Wartezeiten. Ideal für Unternehmen, Kanzleien, Arztpraxen und Privatpersonen mit zeitkritischen Sendungen. Wir sind 24/7 erreichbar. Rufen Sie an: 0201 707060 oder <a href="/book">online buchen</a>.</p>
        <h2>Was wir transportieren</h2>
        <ul>
          <li>Vertragsdokumente und Rechtsakten – diskret und sicher</li>
          <li>Unternehmenspakete und Muster – pünktlich beim Empfänger</li>
          <li>Medizinische Proben und Unterlagen – mit Sorgfalt</li>
          <li>Schlüssel, Ersatzteile, Kleinlieferungen – schnell und direkt</li>
          <li>Persönliche Gegenstände – diskret und vertraulich</li>
        </ul>
        <h2>Diskretion &amp; Verlässlichkeit</h2>
        <p>Vertraulichkeit steht bei uns an erster Stelle. Alle Kurierfahrten werden diskret und professionell durchgeführt. Wir unterzeichnen auf Wunsch Verschwiegenheitserklärungen für sensible Sendungen. Jede Sendung wird persönlich übergeben – keine Paketautomaten, keine anonymen Abgaben.</p>
        <h2>Kurierdienst in Essen und Region</h2>
        <p>Wir liefern auch in Bochum, Gelsenkirchen, Duisburg, Dortmund und der gesamten Region. Bundesweite Kurierfahrten auf Anfrage. Für regelmäßige Kurierfahrten bieten wir auch Rahmenverträge an. Anrufen: 0201 707060.</p>
        <h2>Weitere Leistungen</h2>
        <p><a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen</a> · <a href="/grossraumtaxi-essen">Großraumtaxi Essen</a> · <a href="/krankenfahrten-essen">Krankenfahrten Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/taxi-essen-hbf'),
    schemaOrg: TAXI_HBF_SCHEMA,
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Taxi Essen Hauptbahnhof – Immer da wenn Sie ankommen</h1>
        <p>Der Essen Hauptbahnhof ist einer der wichtigsten Verkehrsknotenpunkte im Ruhrgebiet – hier kommen täglich tausende Reisende an. Taxi B&amp;B GmbH ist 24 Stunden am Tag erreichbar und bringt Sie vom Essen HBF schnell und bequem zu Ihrem Ziel. Ob Hotel, Geschäftstermin, Messe oder Privatadresse – wir kennen Essen und bringen Sie ohne Umwege dorthin. Rufen Sie an: 0201 707060 oder <a href="/book">online vorbestellen</a>.</p>
        <h2>Vom Essen HBF zu allen Zielen</h2>
        <ul>
          <li>Hotels in Essen – z. B. Mövenpick, Sheraton, ATLANTIC</li>
          <li>Messe Essen – direkte Fahrt zur Messe und zurück</li>
          <li>Flughafen Düsseldorf – komfortabler Weiterflug-Transfer</li>
          <li>Stadtteile Essen – Rüttenscheid, Holsterhausen, Frohnhausen und mehr</li>
          <li>Kliniken und Arztpraxen – Universitätsklinikum, St. Josef-Krankenhaus</li>
        </ul>
        <h2>Vorbestellung – Ihr Taxi wartet auf Sie</h2>
        <p>Reisen Sie mit dem ICE oder RE nach Essen? Bestellen Sie Ihr Taxi einfach im Voraus – rufen Sie uns an oder buchen Sie online. Wir stehen pünktlich bei Ihrer Ankunft bereit. Mit Angabe Ihrer Zugnummer können wir Verspätungen einkalkulieren. Kein Warten, kein Suchen – Ihr Fahrer erwartet Sie direkt am Ausgang.</p>
        <h2>Auch mit Gepäck kein Problem</h2>
        <p>Großer Koffer, Sporttasche oder Kinderwagen? Unser Fahrer hilft Ihnen gerne beim Verladen. Für Gruppen steht unsere <a href="/grossraumtaxi-essen">Mercedes V-Klasse</a> mit bis zu 7 Sitzplätzen bereit. Weitere Stadtteile: <a href="/taxi-essen-ruettenscheid">Rüttenscheid</a> · <a href="/taxi-essen-holsterhausen">Holsterhausen</a>.</p>
        <h2>Weitere Leistungen</h2>
        <p><a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen</a> · <a href="/grossraumtaxi-essen">Großraumtaxi Essen</a> · <a href="/krankenfahrten-essen">Krankenfahrten Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },

  // ── Stadtteil-Unterseiten ────────────────────────────────────────────────
  {
    ...meta('/taxi-essen-holsterhausen'),
    schemaOrg: makeDistrictSchema('Holsterhausen', 'taxi-essen-holsterhausen'),
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Taxi Holsterhausen – Ihr Taxiservice in Essen-Holsterhausen</h1>
        <p>Taxi B&amp;B GmbH ist Ihr zuverlässiger Taxiservice direkt in Essen-Holsterhausen. Unser Unternehmen sitzt in der Menzelstraße 8–10 – mitten im Stadtgebiet und damit schnell bei Ihnen. Wir kennen Holsterhausen und die umliegenden Straßen wie unsere Westentasche. Von der Abholung an der Haustür bis zur Ankunft am Ziel – wir bringen Sie komfortabel und pünktlich dorthin. 24 Stunden am Tag, 7 Tage die Woche. Rufen Sie an: 0201 707060 oder <a href="/book">online buchen</a>.</p>
        <h2>Typische Fahrtziele aus Holsterhausen</h2>
        <ul>
          <li>Flughafen Düsseldorf (DUS) – ca. 35–40 km, Festpreis auf Anfrage</li>
          <li>Essen Hauptbahnhof – schnelle Verbindung in die Innenstadt</li>
          <li>Universitätsklinikum Essen – für Arzttermine und Behandlungen</li>
          <li>Messe Essen – für Besucher und Aussteller</li>
          <li>Rüttenscheid, Frohnhausen, Stadtmitte – alle Stadtteile erreichbar</li>
        </ul>
        <h2>Krankenfahrten &amp; Dialyse in Holsterhausen</h2>
        <p>Wir übernehmen <a href="/krankenfahrten-essen">Krankenfahrten</a> und <a href="/dialysefahrten-essen">Dialysefahrten</a> aus Holsterhausen mit direkter Abrechnung bei Ihrer Krankenkasse. Gerne richten wir auch einen festen Fahrplan für regelmäßige Termine ein. Für Gruppen steht unsere <a href="/grossraumtaxi-essen">Mercedes V-Klasse</a> mit bis zu 7 Sitzplätzen bereit.</p>
        <h2>Weitere Stadtteile &amp; Leistungen</h2>
        <p><a href="/taxi-essen-ruettenscheid">Taxi Rüttenscheid</a> · <a href="/taxi-essen-frohnhausen">Taxi Frohnhausen</a> · <a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/taxi-essen-ruettenscheid'),
    schemaOrg: makeDistrictSchema('Rüttenscheid', 'taxi-essen-ruettenscheid'),
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Taxi Rüttenscheid – Ihr Taxiservice in Essen-Rüttenscheid</h1>
        <p>Essen-Rüttenscheid ist eines der beliebtesten Viertel der Stadt – bekannt für seine Restaurants, Cafés und das lebhafte Nachtleben auf der Rüttenscheider Straße. Taxi B&amp;B GmbH ist Ihr verlässlicher Partner für alle Fahrten im und aus dem Rü. Ob nach dem Restaurantbesuch nach Hause, zum Flughafen oder zum Arzttermin – wir sind rund um die Uhr für Sie erreichbar. Rufen Sie an: 0201 707060 oder <a href="/book">online buchen</a>.</p>
        <h2>Beliebte Fahrtziele aus Rüttenscheid</h2>
        <ul>
          <li>Flughafen Düsseldorf – ca. 35 km, Festpreis auf Anfrage</li>
          <li>Essen Hauptbahnhof – schnelle Verbindung</li>
          <li>Museum Folkwang – für Kulturbegeisterte</li>
          <li>Universitätsklinikum Essen – für Behandlungen und Arzttermine</li>
          <li>Holsterhausen, Frohnhausen, Stadtmitte – alle Stadtteile erreichbar</li>
        </ul>
        <h2>Nachttaxi &amp; Abholservice in Rüttenscheid</h2>
        <p>Genießen Sie das Nachtleben auf der Rüttenscheider Straße und kommen Sie sicher nach Hause? Wir fahren 24 Stunden, auch nachts und am Wochenende. Ein kurzer Anruf genügt – wir sind schnell bei Ihnen. Für Gruppen steht unsere <a href="/grossraumtaxi-essen">Mercedes V-Klasse</a> mit bis zu 7 Sitzplätzen bereit – perfekt nach einem gemeinsamen Abend im Restaurant.</p>
        <h2>Weitere Stadtteile &amp; Leistungen</h2>
        <p><a href="/taxi-essen-holsterhausen">Taxi Holsterhausen</a> · <a href="/taxi-essen-frohnhausen">Taxi Frohnhausen</a> · <a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/taxi-essen-frohnhausen'),
    schemaOrg: makeDistrictSchema('Frohnhausen', 'taxi-essen-frohnhausen'),
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Taxi Frohnhausen – Ihr Taxiservice in Essen-Frohnhausen</h1>
        <p>Taxi B&amp;B GmbH ist Ihr verlässlicher Taxiservice in Essen-Frohnhausen. Wir kennen den Stadtteil und seine Straßen genau und sind schnell bei Ihnen – egal ob tagsüber oder nachts. Von Frohnhausen aus fahren wir Sie zu allen Zielen in Essen und darüber hinaus – zum Flughafen, zum Arzt, zum Bahnhof oder einfach nach Hause. 24/7 erreichbar. Rufen Sie an: 0201 707060 oder <a href="/book">online buchen</a>.</p>
        <h2>Häufige Fahrtziele aus Frohnhausen</h2>
        <ul>
          <li>Flughafen Düsseldorf – Festpreis, komfortabel und pünktlich</li>
          <li>Essen Hauptbahnhof – schnelle Verbindung für Zugreisende</li>
          <li>Holsterhausen und Stadtmitte – kurze Wege in der Nachbarschaft</li>
          <li>Kliniken und Arztpraxen – für Krankenfahrten und Therapietermine</li>
          <li>Einkaufszentren – Limbecker Platz, Shoppingcenter West</li>
        </ul>
        <h2>Krankenfahrten &amp; Dialyse aus Frohnhausen</h2>
        <p>Wir übernehmen <a href="/krankenfahrten-essen">Krankenfahrten</a> und <a href="/dialysefahrten-essen">Dialysefahrten</a> mit direkter Abrechnung bei Ihrer Krankenkasse. Gerne richten wir auch einen festen Fahrplan für regelmäßige Termine ein. Für Gruppen: <a href="/grossraumtaxi-essen">Großraumtaxi</a> mit bis zu 7 Sitzplätzen.</p>
        <h2>Weitere Stadtteile &amp; Leistungen</h2>
        <p><a href="/taxi-essen-holsterhausen">Taxi Holsterhausen</a> · <a href="/taxi-essen-ruettenscheid">Taxi Rüttenscheid</a> · <a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
  {
    ...meta('/taxi-essen-suedviertel'),
    schemaOrg: makeDistrictSchema('Südviertel', 'taxi-essen-suedviertel'),
    noscriptBody: `<article lang="de" style="${NOSCRIPT_STYLE}">
        <h1>Taxi Südviertel Essen – Ihr Taxiservice im Essener Südviertel</h1>
        <p>Das Essener Südviertel liegt zentral und gut angebunden – und Taxi B&amp;B GmbH ist schnell bei Ihnen. Ob morgens zum Termin, mittags zum Einkaufen oder abends sicher nach Hause – wir fahren Sie 24/7. Als alteingesessenes Taxiunternehmen aus Essen kennen wir das Südviertel und die gesamte Stadt genau. Kurze Wartezeiten, Festpreise, klimatisierte Fahrzeuge. Rufen Sie an: 0201 707060 oder <a href="/book">online buchen</a>.</p>
        <h2>Wohin fahren wir Sie aus dem Südviertel?</h2>
        <ul>
          <li>Flughafen Düsseldorf, Köln/Bonn, Frankfurt – Festpreis, Flugverfolgung inklusive</li>
          <li>Essen Hauptbahnhof – kurze, direkte Verbindung</li>
          <li>Rüttenscheid und Holsterhausen – Nachbarstadtteile in Minuten</li>
          <li>Universitätsklinikum und St. Josef-Krankenhaus – für Arzttermine</li>
          <li>Messe Essen und Hotels – für Geschäftsreisende</li>
        </ul>
        <h2>Flughafentransfer aus dem Südviertel</h2>
        <p>Der beliebteste Fahrtwunsch aus dem Südviertel: <a href="/flughafentransfer-essen-duesseldorf">Flughafentransfer nach Düsseldorf</a>. Wir fahren Sie komfortabel, pünktlich und zum Festpreis. Für Gruppen steht unsere <a href="/grossraumtaxi-essen">Mercedes V-Klasse</a> mit bis zu 7 Sitzplätzen bereit.</p>
        <h2>Weitere Stadtteile &amp; Leistungen</h2>
        <p><a href="/taxi-essen-ruettenscheid">Taxi Rüttenscheid</a> · <a href="/taxi-essen-holsterhausen">Taxi Holsterhausen</a> · <a href="/krankenfahrten-essen">Krankenfahrten Essen</a></p>
        ${CONTACT_BLOCK}
      </article>`,
  },
];

// ── BreadcrumbList-Injektion: alle nicht-Root, nicht-noindex Seiten erhalten
//    automatisch ein BreadcrumbList-Schema als zusätzlichen JSON-LD Block. ──
for (const route of routes) {
  if (route.path === '/' || route.noindex) continue;
  const crumb = makeBreadcrumb(route.path, route.title);
  if (route.schemaOrg) {
    const existing = Array.isArray(route.schemaOrg) ? route.schemaOrg : [route.schemaOrg];
    route.schemaOrg = [...existing, crumb];
  } else {
    route.schemaOrg = crumb;
  }
}

// ── Validation: alle indexierbaren Routen aus routes.ts müssen einen
//    Prerender-Eintrag haben. So wird prerender.mts automatisch aktuell
//    gehalten, sobald neue Routen in routes.ts hinzugefügt werden. ─────────
function validateAgainstRouteManifest(): void {
  const prerenderPaths = new Set(routes.map((r) => r.path));

  // Jede indexierbare Route braucht einen Prerender-Eintrag
  const missing = indexableRoutes
    .filter((r) => !prerenderPaths.has(r.path))
    .map((r) => r.path);

  if (missing.length > 0) {
    console.error('\n❌  Prerender aborted: Fehlende Einträge für indexierbare Routen:');
    missing.forEach((p) => console.error(`   ${p}`));
    console.error('\nFüge diese Routen in prerender.mts hinzu, um SEO-Abdeckung sicherzustellen.\n');
    process.exit(1);
  }

  // Alle nicht-indizierbaren Pfade in routes müssen als noindex markiert sein
  const indexablePaths = new Set(indexableRoutes.map((r) => r.path));
  const shouldBeNoindex = routes
    .filter((r) => !indexablePaths.has(r.path) && !r.noindex)
    .map((r) => r.path);

  if (shouldBeNoindex.length > 0) {
    console.warn('\n⚠️   Nicht-indexierbare Routen ohne noindex-Flag:');
    shouldBeNoindex.forEach((p) => console.warn(`   ${p}`));
  }
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHeadTags(route: PrerenderRoute): string {
  const canonicalUrl =
    route.path === '/'
      ? `${CANONICAL_DOMAIN}/`
      : `${CANONICAL_DOMAIN}${route.path}/`;
  const title = escapeAttr(route.title);
  const desc = escapeAttr(route.description);

  const tags: string[] = [];

  if (!route.noindex) {
    tags.push(
      `    <link rel="canonical" href="${canonicalUrl}" />`,
      `    <meta property="og:url" content="${canonicalUrl}" />`,
      `    <meta property="og:title" content="${title}" />`,
      `    <meta property="og:description" content="${desc}" />`,
      `    <meta name="twitter:title" content="${title}" />`,
      `    <meta name="twitter:description" content="${desc}" />`,
    );
  }

  if (!route.noindex) {
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "url": canonicalUrl,
      "name": route.title,
      "description": route.description,
      "inLanguage": "de",
      "datePublished": "2024-01-01",
      "dateModified": BUILD_DATE,
      "isPartOf": { "@id": "https://taxibbessen.de/#website" },
      "author": { "@id": "https://taxibbessen.de/#organization" },
    };
    tags.push(
      `    <script type="application/ld+json">\n    ${JSON.stringify(webPageSchema, null, 2).replace(/\n/g, '\n    ')}\n    </script>`,
    );
  }

  if (route.schemaOrg) {
    const schemas = Array.isArray(route.schemaOrg) ? route.schemaOrg : [route.schemaOrg];
    for (const schema of schemas) {
      const enriched = { ...schema, datePublished: '2024-01-01', dateModified: BUILD_DATE };
      tags.push(
        `    <script type="application/ld+json">\n    ${JSON.stringify(enriched, null, 2).replace(/\n/g, '\n    ')}\n    </script>`,
      );
    }
  }

  if (route.extraHeadTags) {
    tags.push(route.extraHeadTags);
  }

  return tags.join('\n');
}

function renderRoute(shellHtml: string, route: PrerenderRoute): string {
  let html = shellHtml;

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeAttr(route.title)}</title>`,
  );

  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${escapeAttr(route.description)}$2`,
  );

  html = html.replace(
    /(<meta name="title" content=")[^"]*(")/,
    `$1${escapeAttr(route.title)}$2`,
  );

  // Replace existing robots meta for noindex pages to avoid duplicate directives
  if (route.noindex) {
    html = html.replace(
      /<meta name="robots" content="[^"]*"\s*\/>/,
      `<meta name="robots" content="noindex, nofollow" />`,
    );
  }

  const injection = buildHeadTags(route);
  html = html.replace('  </head>', `${injection}\n  </head>`);

  // Replace the deterministic placeholder in the body with route-specific
  // noscript fallback content.  Using a plain string marker avoids fragile
  // regex matching against the built HTML and guarantees only the body
  // placeholder is ever touched — never the head <noscript> font fallback.
  if (route.noscriptBody) {
    const seoBody = route.noscriptBody;
    html = html.replace(
      '<!-- PRERENDER_NOSCRIPT_PLACEHOLDER -->',
      `<section class="prerender-seo" style="background:#0c0b09;color:rgba(255,255,255,.78);font-family:system-ui,-apple-system,sans-serif;font-size:.95rem;line-height:1.75;padding:3rem 1.5rem 4rem;border-top:1px solid rgba(255,255,255,.1)" aria-label="Ergänzende Informationen"><style>.prerender-seo h2{font-size:1.15rem;font-weight:700;margin:1.5rem 0 .4rem;color:rgba(255,193,7,.9)}.prerender-seo a{color:rgba(255,193,7,.85);text-decoration:underline}.prerender-seo address{font-style:normal;margin:.5rem 0}.prerender-seo ul{padding-left:1.25rem;margin:.5rem 0}.prerender-seo li{margin:.25rem 0}.prerender-seo dl{margin:.5rem 0}.prerender-seo dt{font-weight:700;color:rgba(255,193,7,.8);margin-top:.75rem}.prerender-seo dd{margin:.1rem 0 .5rem 1rem}</style>\n      ${seoBody}\n    </section>`,
    );
  } else {
    html = html.replace('<!-- PRERENDER_NOSCRIPT_PLACEHOLDER -->', '');
  }

  return html;
}

function main(): void {
  validateAgainstRouteManifest();

  const shellPath = join(DIST, 'index.html');
  if (!existsSync(shellPath)) {
    console.error(`Build output not found: ${shellPath}`);
    console.error('Run `pnpm build` before prerendering.');
    process.exit(1);
  }

  const shell = readFileSync(shellPath, 'utf-8');

  for (const route of routes) {
    const rendered = renderRoute(shell, route);

    if (route.path === '/') {
      writeFileSync(shellPath, rendered, 'utf-8');
      console.log(`✓ /  →  dist/public/index.html`);
    } else {
      const dir = join(DIST, route.path.slice(1));
      mkdirSync(dir, { recursive: true });
      const outPath = join(dir, 'index.html');
      writeFileSync(outPath, rendered, 'utf-8');
      console.log(`✓ ${route.path}  →  dist/public${route.path}/index.html`);
    }
  }

  // Generate sitemap.xml from the route manifest — single source of truth.
  // All URLs use trailing-slash form to match the canonical and OG URLs emitted
  // by prerender (buildHeadTags) and the client-side hook (use-page-meta.ts).
  const sitemapEntries = indexableRoutes.map((r) => {
    const loc = r.path === '/' ? `${CANONICAL_DOMAIN}/` : `${CANONICAL_DOMAIN}${r.path}/`;
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${BUILD_DATE}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority.toFixed(1)}</priority>`,
      '  </url>',
    ].join('\n');
  });
  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries,
    '</urlset>',
    '',
  ].join('\n');
  writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`✓ sitemap.xml → ${indexableRoutes.length} URLs (trailing-slash, priority+changefreq from routes.ts)`);

  // Write a manifest of all known SPA paths so the Express server can gate 404s.
  const knownPaths = routeConfigs.map((r) => r.path);
  writeFileSync(join(DIST, '_routes.json'), JSON.stringify(knownPaths), 'utf-8');
  console.log(`✓ _routes.json → ${knownPaths.length} known SPA paths`);

  console.log(`\n✅  Prerendered ${routes.length} routes (${indexableRoutes.length} indexable from routes.ts).`);
}

main();
