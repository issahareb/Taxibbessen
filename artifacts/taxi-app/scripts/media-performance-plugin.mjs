function removeBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const end = source.indexOf(endMarker, start);
  if (end < 0) return source;
  return source.slice(0, start) + source.slice(end);
}

function replaceWithin(source, startMarker, endMarker, replacements) {
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const end = source.indexOf(endMarker, start);
  if (end < 0) return source;

  let segment = source.slice(start, end);
  for (const [from, to] of replacements) {
    segment = segment.replaceAll(from, to);
  }

  return source.slice(0, start) + segment + source.slice(end);
}

export function mediaPerformancePlugin() {
  return {
    name: "taxi-content-and-media-normalization",
    enforce: "pre",
    transform(code, id) {
      if (id.endsWith("/src/components/Layout.tsx")) {
        const output = removeBetween(
          code,
          "          {/* Zahlungsarten */}",
          '          <div className="mt-6 pt-5 border-t border-white/5',
        );
        return output === code ? null : { code: output, map: null };
      }

      if (!id.endsWith("/src/pages/Home.tsx")) return null;

      let output = code;

      output = output
        .replace('import { ReviewCarousel } from "@/components/ReviewCarousel";\n', "")
        .replace('import brushStroke from "@assets/brush-stroke.png";\n', "");

      output = removeBetween(
        output,
        "        {/* ─── BEWERTUNGS-CTA ─── */}",
        "        {/* ─── STORY SECTION ─── */}",
      );
      output = removeBetween(
        output,
        "        {/* ─── REVIEWS ─── */}",
        "        {/* ─── CTA / KONTAKT ─── */}",
      );

      // Die Startseiten-FAQ liegt inzwischen bereinigt in src/content/home.ts;
      // frühere FAQ-Textersetzungen an dieser Stelle sind daher entfallen.
      const contentReplacements = new Map([
        ["taxibbessen.de", "www.taxibbessen.de"],
      ]);

      for (const [from, to] of contentReplacements) {
        output = output.replaceAll(from, to);
      }

      output = output
        .replace(
          '{ src: "geschaeftsfahrten.webp", titleKey: "hero_service1_title", descKey: "hero_service1_desc", href: "/grossraumtaxi-essen" }',
          '{ src: "geschaeftsfahrten.webp", titleKey: "hero_service1_title", descKey: "hero_service1_desc", href: "/book" }',
        )
        .replace(
          '{ src: "kurierdokumente.webp",   titleKey: "hero_service4_title", descKey: "hero_service4_desc", href: "/dialysefahrten-essen" }',
          '{ src: "kurierdokumente.webp",   titleKey: "hero_service4_title", descKey: "hero_service4_desc", href: "/kurierdienst-essen" }',
        )
        .replace(
          '{ src: "hauszuhaus.webp",        titleKey: "hero_service6_title", descKey: "hero_service6_desc", href: "/taxi-essen-hbf" }',
          '{ src: "hauszuhaus.webp",        titleKey: "hero_service6_title", descKey: "hero_service6_desc", href: "/book" }',
        );

      output = replaceWithin(
        output,
        "  // ─── Third image-sequence",
        "  return (\n    <Layout>",
        [
          [
            "    // CTA frames are only shown on mobile (img has md:hidden); skip on desktop\n    const isMobile = window.matchMedia('(max-width: 767px)').matches;",
            "    // Use one deterministic scroll-controlled frame sequence on every viewport.",
          ],
          ["if (isMobile && img && frames.length > 0)", "if (img && frames.length > 0)"],
          ["            lastFrame = idx;", "            lastFrame = ready;"],
          ["    if (isMobile && img) {", "    if (img) {"],
          ["      observer.observe(sectionEl);", "      observer.observe(storySectionRef.current ?? sectionEl);"],
        ],
      );

      output = replaceWithin(
        output,
        "        {/* ─── CTA/AIRPORT BACKGROUND ─── */}",
        "        {/* ─── HERO ─── */}",
        [
          ['className="md:hidden w-full h-full object-cover"', 'className="w-full h-full object-cover"'],
          ['className="md:hidden absolute inset-0"', 'className="absolute inset-0"'],
          ['decoding="async"', 'decoding="sync"'],
          [
            'style={{ height: "100lvh", zIndex: 1, opacity: 0, backgroundColor: "#100a0a" }}',
            'style={{ height: "100lvh", zIndex: 1, opacity: 0, backgroundColor: "#100a0a", willChange: "opacity", transform: "translateZ(0)" }}',
          ],
        ],
      );

      output = removeBetween(
        output,
        "          {/* Desktop: looping autoplay airport video (16:9) */}",
        '          <div\n            className="absolute inset-0"',
      );

      output = output.replace(
        "const loadFrames = () => {\n      if (framesLoaded) return;",
        `const shouldReduceMedia =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator).connection?.saveData === true;

    const loadFrames = () => {
      if (framesLoaded || shouldReduceMedia) return;`,
      );

      output = output.replaceAll(
        "      observer.disconnect();\n      for (let i = 1; i <=",
        `      observer.disconnect();
      const shouldReduceMedia =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        (navigator).connection?.saveData === true;
      if (shouldReduceMedia) return;
      for (let i = 1; i <=`,
      );

      output = output.replace(
        "{ rootMargin: '500% 0px' }",
        "{ rootMargin: '100% 0px' }",
      );

      return { code: output, map: null };
    },
  };
}
