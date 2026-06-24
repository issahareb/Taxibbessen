# Graph Report - artifacts/taxi-app/src  (2026-06-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 262 nodes · 431 edges · 22 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7b070af5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `getPageMeta()` - 21 edges
2. `cn()` - 19 edges
3. `Layout()` - 14 edges
4. `Button` - 6 edges
5. `Card()` - 5 edges
6. `Badge()` - 4 edges
7. `calculateTaxiPrice()` - 4 edges
8. `Language` - 4 edges
9. `Admin()` - 4 edges
10. `Home()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Card()` --calls--> `cn()`  [EXTRACTED]
  components/ui.tsx → lib/utils.ts
- `Badge()` --calls--> `cn()`  [EXTRACTED]
  components/ui.tsx → lib/utils.ts
- `DialogHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `SheetHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (22 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (25): cn(), Button, ButtonProps, buttonVariants, DialogContent, DialogDescription, DialogFooter(), DialogHeader() (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (26): Props, Badge(), Button, ButtonProps, Card(), Input, Label, calculateTaxiPrice() (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (19): LANGUAGES, LanguageSwitcher(), Layout(), DEFAULT_META, PageMeta, AGB(), { title: _agbTitle, description: _agbDesc }, Book() (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (23): Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (10): AppInner(), ComponentType, queryClient, routeComponents, ScrollToTop(), useLenis(), getLenis(), setLenis() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (10): BASE, duplicated, Review, reviews, CtaGlow, ctaGlowContainer, ctaGlowItem, FAQ_ITEMS (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (11): LanguageContextType, LanguageProvider(), Language, languageFlags, languageNames, TranslationKey, ar, de (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (7): AddressSelection, formatForDisplay(), NominatimResult, parseResult(), Props, AddressBase, Props

### Community 8 - "Community 8"
Cohesion: 0.28
Nodes (6): getPageMeta(), PageMetaEntry, { title: _impTitle, description: _impDesc }, schema, sections, { title: _title, description: _desc }

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (5): ContentSection, fadeUp, FAQItem, RelatedLink, ServicePageTemplateProps

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (3): BookingResult, LaterPickup, View

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (4): faq, schema, sections, { title: _title, description: _desc }

### Community 12 - "Community 12"
Cohesion: 0.40
Nodes (4): faq, schema, sections, { title: _title, description: _desc }

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (4): faq, schema, sections, { title: _title, description: _desc }

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (4): faq, schema, sections, { title: _title, description: _desc }

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): faq, schema, sections, { title: _title, description: _desc }

### Community 16 - "Community 16"
Cohesion: 0.40
Nodes (4): faq, schema, sections, { title: _title, description: _desc }

### Community 17 - "Community 17"
Cohesion: 0.40
Nodes (3): schema, sections, { title: _title, description: _desc }

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (3): schema, sections, { title: _title, description: _desc }

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (3): schema, sections, { title: _title, description: _desc }

## Knowledge Gaps
- **125 isolated node(s):** `queryClient`, `ComponentType`, `routeComponents`, `NominatimResult`, `Props` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `getPageMeta()` connect `Community 8` to `Community 1`, `Community 2`, `Community 5`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Toaster()` connect `Community 3` to `Community 4`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `queryClient`, `ComponentType`, `routeComponents` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10416666666666667 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08901515151515152 - nodes in this community are weakly interconnected._