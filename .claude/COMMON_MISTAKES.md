# Common Mistakes — Taxi B&B Workspace

Bekannte Fallstricke, die bereits >1h gekostet haben. Immer zuerst prüfen.

---

## 1. Domain-Schreibweise

**RICHTIG:** `taxibbessen.de` (KEIN Bindestrich)
**FALSCH:** `taxibb-essen.de` → NXDOMAIN, existiert nicht

Alle canonicals, sameAs-Einträge und og:url müssen `taxibbessen.de` verwenden.

---

## 2. Wouter 3.x — Kein Trailing Slash

**RICHTIG:** `<Route path="/krankenfahrten-essen" />`
**FALSCH:** `<Route path="/krankenfahrten-essen/" />`

Wouter 3.x matcht NICHT auf trailing slashes. Canonical-URLs in usePageMeta ebenfalls ohne trailing slash.

---

## 3. Dateinamen-Typo: DialysefahrtenEssen

**RICHTIG:** `src/pages/DialysefahrtenEssen.tsx`
**FALSCH:** `src/pages/DialsyefahrtenEssen.tsx` (war der ursprüngliche Tippfehler)

Die Funktion im File heißt noch `DialogsefahrtenEssen` (weiterer Tippfehler) — non-blocking weil default export, aber nicht anfassen ohne Test.

---

## 4. aggregateRating — Nur reale Werte

**RICHTIG:** `"ratingValue": "4.0", "ratingCount": "4"` (aktueller Google-Stand)
**FALSCH:** Phantomzahlen wie 4.8/17 — Google kann dies als Spam-Signal werten

Immer den tatsächlichen Google-Stand verwenden. Stand 2026-06: 4.0/5, 4 Reviews.

---

## 5. JSON-LD @graph auf Sub-Pages — Nicht verschachteln

**RICHTIG:**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "TaxiService", ... },
    { "@type": "BreadcrumbList", ... }
  ]
}
```

**FALSCH:** BreadcrumbList als Kind-Objekt innerhalb TaxiService verschachteln.

Beide Nodes sind separate Einträge im `@graph`-Array.

---

## 6. usePageMeta — JSON-LD @id für Provider-Referenz

Alle Sub-Pages referenzieren die Hauptorganisation über:
```json
{ "@id": "https://taxibbessen.de/#organization" }
```

Dieser @id ist in `index.html` definiert. Nie eine andere URL verwenden.

---

## 7. Graphify nach Code-Änderungen updaten

Nach jeder Session mit Code-Änderungen:
```bash
graphify update .
```

Kein LLM-Cost, dauert ~10s. Ohne Update wird der Graph veraltet und Navigation wird ungenau.

---

## 8. Neue Routen — Alle 4 Stellen aktualisieren

Eine neue Route braucht Einträge an 4 Stellen:
1. `src/App.tsx`
2. `public/sitemap.xml`
3. `public/llms.txt`
4. `prerender.mjs`

Wird eine Stelle vergessen, findet Google die Seite nicht (kein prerendering) oder Crawler kennen sie nicht (kein llms.txt).

---

## 9. ServicePageTemplate — Pflichtfelder

`ServicePageTemplate` erwartet zwingend `schemaMarkup` (JSON-LD String). Fehlt das Prop, wird kein strukturiertes Schema gerendert → SEO-Verlust.

---

## 10. Glassmorphism-Style — Konsistente Klassen

Projektweiter Glass-Card-Stil (nicht abweichen):
```
backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]
```
