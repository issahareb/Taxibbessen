# Quick Start — Taxi B&B Workspace

## Dev-Server

Alle Workflows starten automatisch. Manuell neu starten via Replit-UI oder:

```bash
pnpm --filter @workspace/taxi-app run dev
pnpm --filter @workspace/api-server run dev
```

## Häufige Build-Aufgaben

```bash
# Statisches HTML für alle Routen neu bauen (SEO-Prerender)
node artifacts/taxi-app/prerender.mjs

# DB-Schema auf PostgreSQL pushen (nach Schema-Änderungen in lib/db)
pnpm --filter @workspace/db run push

# Alle Packages installieren (nach pnpm-Änderungen)
pnpm install
```

## Graphify (Knowledge Graph)

```bash
# Graph nach Code-Änderungen aktualisieren (kein LLM-Cost, schnell)
graphify update .

# Token-Einsparung messen
graphify benchmark

# Pfad zwischen zwei Nodes abfragen
graphify path "Home" "ServicePageTemplate"
```

## SEO-Checkliste bei neuer Seite/Route

1. Route in `src/App.tsx` eintragen (KEIN trailing slash)
2. `usePageMeta()` im Page-Component aufrufen (title, description, canonical, JSON-LD)
3. URL in `public/sitemap.xml` ergänzen
4. URL in `public/llms.txt` ergänzen
5. Route in `prerender.mjs` ergänzen
6. `node artifacts/taxi-app/prerender.mjs` ausführen
7. `graphify update .` ausführen

## Wichtige URLs

| Ziel | URL |
|---|---|
| Live-Domain | https://taxibbessen.de |
| Google Maps Profil | https://www.google.com/maps/search/Taxi+B%26B+GmbH+Essen |
| Gelbe Seiten | https://www.gelbeseiten.de/gsbiz/07d88c60-db79-4a47-ab69-268c3f710b46 |
