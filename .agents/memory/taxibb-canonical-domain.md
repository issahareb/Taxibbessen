---
name: Taxi B&B canonical domain
description: The one true live domain for the Taxi B&B GmbH site and a past regression to avoid.
---

# Canonical domain: taxibbessen.de (NO hyphen)

The live, resolving domain is **https://taxibbessen.de** (no hyphen, no www).

- `taxibbessen.de` → resolves (A record present).
- `taxibb-essen.de` (WITH hyphen) → **NXDOMAIN, does not exist.**

**Why:** A previous task "corrected" every SEO surface (canonical, sitemap.xml,
JSON-LD, OG/Twitter tags, robots.txt, llms.txt, prerender.mjs,
src/hooks/use-page-meta.ts) to the hyphenated `taxibb-essen.de`, which does not
resolve. That points all canonicals/sitemap URLs at a dead host — catastrophic
for indexing. It was reverted to `taxibbessen.de`.

**How to apply:** Before writing any domain into canonical/sitemap/OG/JSON-LD,
confirm it actually resolves (e.g. `getent hosts <domain>`). Do not reintroduce
the hyphenated variant unless the user explicitly registers it and asks to migrate.
Canonical form is non-www, no trailing slash on the homepage.
