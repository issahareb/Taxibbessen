# Architecture Map — Taxi B&B GmbH Workspace

## Monorepo (pnpm workspaces)

| Artifact | Pfad | Port | Zweck |
|---|---|---|---|
| Web-App | `artifacts/taxi-app/` | $PORT | React+Vite Kundenwebsite |
| API-Server | `artifacts/api-server/` | $PORT | Express REST-API (Buchungen, Admin) |
| DB | `lib/db/` | — | Drizzle ORM + PostgreSQL Schema |

---

## taxi-app — Schlüsseldateien

| Datei | Zweck |
|---|---|
| `src/App.tsx` | Router (wouter 3.x) — alle 19 Routen, KEIN trailing slash |
| `src/components/Layout.tsx` | Nav + Footer (Zahlungsicons, Regionen-Links) |
| `index.html` | Site-weites JSON-LD (LocalBusiness, aggregateRating), Preloads |
| `src/hooks/usePageMeta.ts` | Setzt title, description, canonical, OG, schema dynamisch |
| `src/i18n/LanguageContext.tsx` | DE/EN Übersetzungen |
| `prerender.mjs` | Statisches HTML für alle Routen (SEO-Crawler) |
| `public/sitemap.xml` | 17 URLs — bei neuen Routen manuell ergänzen |
| `public/llms.txt` | AI-Crawler-Sitemap — bei neuen Routen ergänzen |

### Routen

| Path | Komponente |
|---|---|
| `/` | Home |
| `/book` | Book |
| `/fahrzeuge` | Fahrzeuge |
| `/ueber-uns` | UeberUns |
| `/flughafentransfer-essen-duesseldorf` | FlughafentransferEssen |
| `/krankenfahrten-essen` | KrankenfahrtenEssen |
| `/grossraumtaxi-essen` | GrossraumtaxiEssen |
| `/dialysefahrten-essen` | DialysefahrtenEssen |
| `/kurierdienst-essen` | KurierdienstEssen |
| `/taxi-essen-hbf` | TaxiEssenHbf |
| `/taxi-essen-holsterhausen` | TaxiHolsterhausen |
| `/taxi-essen-ruettenscheid` | TaxiRuettenscheid |
| `/taxi-essen-frohnhausen` | TaxiFrohnhausen |
| `/taxi-essen-suedviertel` | TaxiSuedviertel |
| `/impressum` | Impressum |
| `/agb` | AGB |
| `/datenschutz` | Datenschutz |
| `/admin` | Admin |
| `/confirmation` | Confirmation |

### Shared-Komponenten

| Komponente | Zweck |
|---|---|
| `ServicePageTemplate.tsx` | Vorlage für alle 10 Leistungs-/Stadtteil-Seiten |
| `HeroBookingWidget.tsx` | Buchungsformular auf der Startseite |
| `ReviewCarousel.tsx` | Bewertungs-Karussell |
| `AddressAutocomplete.tsx` | Adress-Eingabe mit Autocomplete |

---

## api-server — Schlüsseldateien

| Datei | Zweck |
|---|---|
| `src/app.ts` | Express-App, Middleware, Route-Einbindung |
| `src/routes/bookings.ts` | CRUD Buchungen |
| `src/routes/stats.ts` | Admin-Statistiken |
| `src/routes/health.ts` | Health-Check |

---

## lib/db — Schema

| Datei | Zweck |
|---|---|
| `src/schema/` | Drizzle-Tabellen (bookings, etc.) |
| `drizzle.config.ts` | DB-Konfiguration |
