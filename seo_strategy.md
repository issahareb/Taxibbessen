# SEO Strategy

## In scope
- Public marketing homepage (`/`)
- Public service landing pages (`/flughafentransfer-essen-duesseldorf`, `/krankenfahrten-essen`, `/grossraumtaxi-essen`, `/dialysefahrten-essen`, `/kurierdienst-essen`, `/taxi-essen-hbf`)
- Public district landing pages (`/taxi-essen-holsterhausen`, `/taxi-essen-ruettenscheid`, `/taxi-essen-frohnhausen`, `/taxi-essen-suedviertel`)
- Public trust and company pages (`/fahrzeuge`, `/ueber-uns`)
- Public transactional booking landing page (`/book`)
- Public support utility route (`/fahrtstatus`), but it is intentionally noindexed and not treated as a search landing page
- Public legal pages (`/impressum`, `/datenschutz`, `/agb`)

## Out of scope
- Authenticated or internal admin surface (`/admin`)
- API endpoints under `/api/**`

## Target audience
- People in Essen and the surrounding region looking for taxi rides, airport transfers, medical transport, and group transport.

## Primary keywords
- taxi essen
- taxiservice essen
- flughafentransfer essen
- krankenfahrten essen
- großraumtaxi essen

## Notes
- Frontend is a Vite + React + Wouter single-page application.
- Public routes use a shared HTML shell with build-time prerendered head tags and route-specific fallback HTML from `artifacts/taxi-app/prerender.mts`.
- The public routes are still not fully SSR/SSG pages: the visible body content remains React-rendered after hydration unless specifically injected into the static shell.
- `robots.txt`, `llms.txt`, and a generated sitemap are present in the current source, and `robots.txt` explicitly allows major AI crawlers.
- Utility confirmation URLs (`/confirmation?id=...`) are transactional pages, not intended as search landing pages.
- `/fahrtstatus` is intentionally excluded from the sitemap and indexable route set, so scans should not treat it as a page that needs internal-link equity for ranking.

## Dismissed categories
- (None yet)
