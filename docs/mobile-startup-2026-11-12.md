# Mobile startup without changing the animations

The production homepage was checked with PageSpeed Insights on 12 November 2026. Two mobile runs returned 72 Performance, 100 Accessibility, 100 Best Practices and 100 SEO, with an LCP of 9.752 s and 9.753 s (slow 4G, emulated Moto G Power, Lighthouse 13.6.0). The first desktop run returned 100 / 97 / 100 / 100, with LCP 0.523 s. These are lab results, not real-user percentiles.

Baseline reports:
- https://pagespeed.web.dev/analysis/https-www-taxibbessen-de/tazrvgsgj7?form_factor=mobile
- https://pagespeed.web.dev/analysis/https-www-taxibbessen-de/ai5w1m90w5?form_factor=mobile

## Change

The hero still warms its first two original frames immediately. The rest of the normal buffer is filled after the existing 0.8 s logo entrance has painted. An early scroll immediately expands the buffer, and restored scroll positions start with the full buffer. All sequence requests use low fetch priority so the foreground can load first. The original images, frame count, positions, smoothing, transition durations and all booking/contact handlers are retained. The desktop preload now points to the poster actually used by the current hero video.

## Verification

- Production build, TypeScript, metadata, schema, SEO output and local-font checks pass.
- Three automated tests cover the initial two-frame buffer, expansion around an early scroll position, idempotence/disposal and reduced-motion behavior.
- Browser checks at 390 × 844 and 1440 × 900: four scroll positions per viewport, including reverse scrolling; all eight before/after screenshots have 0% pixel difference at the same settled positions. All three mobile canvas layers retain their dimensions and opacity behavior.
- Text inquiry, guided ride inquiry and contact form succeed with mocked local API responses at both viewports. Phone, email and WhatsApp link targets are identical. No real booking or customer notification was sent; actual email delivery is not asserted by these mocks. The API service and notification code are not changed.
- Three serial local Lighthouse runs per version, using fresh Chromium 153 profiles and the same static server/compression, produce median mobile LCP 12.466 s before and 6.236 s after, a reduction of approximately 50%. FCP remains approximately 0.906 s, TBT 0 ms and CLS 0. The local browser intermittently lacks trace screenshots, so no comparable local Performance score is claimed. These local values must not be mixed with the Google production results or presented as historical performance of the old website.

The target of LCP ≤ 2.5 s is not established by these local tests. Production results must be measured after deployment and reported separately.
