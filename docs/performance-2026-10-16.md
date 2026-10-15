# Startup performance and shorter FAQ

Baseline: three serial Lighthouse 13.5.0 runs per device against the live canonical homepage, Chromium 134, default mobile and desktop preset, simulated throttling, fresh browser profiles through the workspace network proxy. TaxiBB median performance: 82 mobile, 91 desktop. Median mobile LCP: 3.150 s. Source revision: 9af3270.

Changes:
- Keep the approved TAXI / B&B / ESSEN logo, serve 160/320/480/640/960 px WebP variants with matching responsive preload. The mobile Lighthouse viewport selects 480 px (30,058 bytes) instead of the 960 px original (81,636 bytes). Smaller header/menu sizes are independent.
- Download English, French, Turkish and Arabic dictionaries only when selected. Preserve German initial content, cached dictionaries and last-selected-language ordering. Initial application chunk decreases from 80.84 KB gzip in the previous local build to 66.67 KB gzip; React and Motion chunks remain unchanged.
- Prepare 96 pickup-time choices only on first opening the ride tab. Reuse two Intl formatters and retain selection when switching tabs.
- Consolidate 24 homepage FAQs into eight concise answers. Visible content and FAQ structured data share the same source; detailed service pages remain available.

Production build, types, prerender/schema/SEO/local-font validations passed. Browser checks at 390 and 1440 px passed for responsive logo loading, eight FAQ/schema entries, accordion interaction, 98 pickup choices (96 times plus two other choices), retained selection, all five languages including RTL, and forward/reverse Hareb scroll frames. End-to-end form requests use mocked responses to avoid sending real customer notifications.

Final production measurements are recorded separately after successful deployment. No Lighthouse score, delivery count or third-party comparison is inferred from these implementation changes.
