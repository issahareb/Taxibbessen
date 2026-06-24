---
name: Scroll reveal & image-sequence hero pitfalls
description: Reliable patterns for framer-motion scroll reveals and scroll-scrubbed image-sequence backgrounds, especially on mobile
---

# Scroll-triggered word reveal (framer-motion)

**Rule:** For multi-word/line reveals, drive the animation from ONE parent observer using `variants` + `staggerChildren`, not a separate `whileInView` on each word.

**Why:** Per-element `whileInView` (each word its own IntersectionObserver) is flaky on mobile during fast scroll — some observers don't fire, leaving words stuck at `opacity:0`/`y:110%` permanently. This bit the Taxi B&B CTA heading ("Fragen Sie jetzt Ihre nächste Fahrt AN!") repeatedly: only partial text ("IHRE NÄCHSTE") showed.

**How to apply:** Parent `motion.h2` with `initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.25 }}` and `variants={{ visible:{ transition:{ staggerChildren } } }}`. Children are `motion.span` with `hidden`/`visible` variants. Also: never nest `<div>` inside `<h2>` (invalid) — use `<span>` with flex.

# Scroll-scrubbed image-sequence hero background

**Rule:** When swapping frames by scroll progress, if the target frame isn't loaded yet, show the NEAREST already-loaded frame instead of skipping. And keep total asset payload small.

**Why:** The hero uses 77 JPEG frames (~12 MB). On mobile they load slowly; the scrubber only set `img.src` when `frame.complete` was true, so it jumped straight from frame 1 to the end frame ("only start and end frame, nothing between"). Separately, large competing assets made it worse: switching 3 service icons from JPEG (~205 KB total) to transparent PNG (~1.2 MB total) starved the frames of bandwidth. Compressing the PNGs with `pngquant` (nix-shell -p pngquant, --quality=55-80) brought them back to ~184 KB total with no visible quality loss.

**How to apply:** Add a `nearestReady(idx)` fallback in the rAF loop. Keep decorative PNGs compressed. The animation code itself was correct — verify with `git diff <checkpoint> HEAD` before "restoring" logic that didn't actually change.

# Stacking a SECOND scroll-scrubbed background below the hero

**Rule:** To add a second image-sequence bg that takes over lower on the page, give it its own fixed full-screen layer and DRIVE BOTH its frame index AND its opacity from scroll. The sections it sits behind must be made transparent — they almost always had solid dark backgrounds that were the only reason the hero bg "stopped" at them.

**Why:** On Taxi B&B the story/reviews/CTA sections looked empty/flat-black below the services because they had opaque `background: hsl(220 18% 6%)` / `bg-background` covering the fixed hero layer. A second clip (97 frames, ~1.9 MB at 600px q7 via ffmpeg `scale=600:-2 -q:v 7`) was anchored: frame 0 at the story section top, last frame at the CTA section top, mapped by `(scrollY - storyTop)/(ctaTop - storyTop)`. Opacity eases in via lerp as the story section enters; a built-in dark gradient scrim keeps text readable.

**How to apply:** Both fixed layers share `zIndex:1`; the later one in DOM paints on top, so keep its opacity 0 above its range so the hero shows through. Reuse the hero's rAF + lerp(0.12) + nearestReady + priority-decode pattern. Anchor scroll range with section refs measured via `getBoundingClientRect().top + scrollY` (re-measure on resize). Extract frames with ffmpeg in one pass (no `<video>` — same iOS black-frame reason as the hero).

# Crossfade timing: finish the swap BEFORE the next section reaches the top

**Rule:** When layer B's opacity drives layer A via `A.opacity = 1 - B.opacity`, layer B must reach opacity 1 *just before* the next section's top scrolls to the viewport top — NOT starting at that point.

**Why:** A `min-h-screen` hero is ~1 viewport tall, so the next section's content (e.g. service cards just under the heading) is already on screen the instant the heading reaches the top. If B's fade only *begins* at `sectionTop`, the old clip (silver taxi) bleeds through behind the new section's content. User reported this angrily ("ich sehe immernoch das taxi"). Fix: `opacity = clamp((scrollY - (sectionTop - 0.22*vh)) / (0.18*vh), 0, 1)` so it completes ~`sectionTop`, hidden inside the previous section's dark bottom gradient (so the crossfade itself isn't visible).

**How to apply:** Keep opacity (crossfade) and frame-progress (scrub) on SEPARATE anchors — opacity finishes by `sectionTop`; scrub can start later (e.g. `sectionTop + 0.4*vh`, once a black band behind the heading has scrolled off). To black out only the heading (not the whole section), use a top-anchored band `absolute top-0 h-[55vh]` with a gradient that fades to transparent at its bottom so the next clip is revealed below it.

# Aligning an absolutely-positioned overlay to content INSIDE a scroll-scrubbed background

**Rule:** Don't guess `bottom-[%]` values to line an overlay (e.g. hero service icons) up with a feature painted in the background image sequence (e.g. a car's license plate). Take an `app_preview` screenshot at the page-load state (scroll 0 = frame 1) and measure pixel positions, then convert to % of the hero height.

**Why:** The background feature MOVES with scroll because the image sequence scrubs by scroll progress, so there is no single % that aligns across frames — only the page-load frame is stable and that is the one the user judges. Blind tweaking caused many back-and-forth rounds and an angry user. Also: a framer-motion `initial={{ y: 20 }} → animate={{ y: 0 }}` makes the icons settle at a different spot than where they appear mid-animation, so the "calibrated" value was wrong once it settled — drop the `y` offset (keep opacity-only) so the resting position is what you see.

**How to apply:** Hero is `min-h-screen` (≈ viewport height). Screenshot, read off icon-top y and feature y, gap_px / heroHeight_px = % to subtract from current `bottom-[%]`. Re-screenshot to confirm before replying.

# iOS Safari: fixed full-screen background layers jump/shift on scroll

**Rule:** A `position: fixed; inset-0` full-screen background layer visibly jumps/shifts on iOS Safari every time the dynamic address bar shows/hides during scroll. Fix: anchor to top only (`fixed top-0 left-0 w-full`) and give a CONSTANT height of `100lvh` (largest viewport height), not `inset-0`. Keep a `h-screen` (100vh) class as fallback so old browsers that don't parse `lvh` still get a height.

**Why:** `inset-0` ties the layer's bottom to the *visual* viewport, which changes height as the iOS toolbar collapses/expands — so the layer (and its `object-cover` crop) slides while scrolling. User reported "der header verschiebt sich / das ganze hero video verschiebt sich beim scrollen" with the car image sitting at different heights between frames. A constant `100lvh` top-anchored layer never changes geometry, so it stays put. Applied to all 3 stacked bg layers (hero, story, cta) on Taxi B&B Home.tsx.

**How to apply:** `className="fixed top-0 left-0 w-full h-screen overflow-hidden ..."` + inline `style={{ height: "100lvh", ... }}` (inline `100lvh` wins when supported; invalid value falls back to `h-screen`). For per-frame `img.src` swap flicker, add `transform: translateZ(0); backface-visibility: hidden` to the swapping `<img>` for stable GPU compositing — additive only; the nearest-loaded-frame preload is the real anti-flicker. If flicker persists on real devices, the robust fix is a single `<canvas>` + `drawImage` instead of img.src swaps.
