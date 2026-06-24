---
name: iOS Safari header scroll stability
description: How the taxi-app header is stabilized on iOS Safari and the feedback-loop bug to never reintroduce
---
# iOS Safari fixed-header stabilization (taxi-app)

`artifacts/taxi-app/src/ios-scroll-stability.ts` (imported in `main.tsx`) handles iOS-only header/scroll fixes. It injects CSS that adds `.ios-stable-header` to the `<header>` and pins it with `position:fixed; top:0; translate3d` + GPU layer, gives it a solid bg (backdrop-filter is janky on iOS), forces hero section `min-height:100lvh`, and locks the hero poster.

**Why the header jumped to the MIDDLE of the screen (do NOT reintroduce):**
An earlier "lock header to constant viewport position" version measured the header's own (already-transformed) `getBoundingClientRect().top`, derived a "drift", and ACCUMULATED it into `manualCorrection += drift` (clamped ±80). Because the applied transform changed the very thing being measured, it was a positive feedback loop that ran away to the +80px clamp → header dropped into mid-screen. The user reverted that whole series.

**Correct approach:** read `window.visualViewport.offsetTop` DIRECTLY each frame (no accumulation), clamp [0,120], write to `--ios-header-shift`. Self-correcting + bounded → cannot drift.

**Why:** iOS Safari's address/tool bar animation shifts `position:fixed` elements; GPU promotion + visualViewport pinning mitigates but cannot 100% eliminate native bar behavior. Keep the mobile call-button glow (`animate-call-glow`) — a past version disabled it and the user wanted it back.

**How to apply:** any change here must keep the shift read directly from offsetTop (never measure the transformed header and feed it back). Test on a real iPhone; the dev preview is a desktop proxy and cannot reproduce the bar behavior.
