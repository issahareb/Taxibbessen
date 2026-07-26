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

      // Die früheren Patches an den Bildsequenzen sind entfallen: Scroll-
      // Steuerung auf allen Viewports, das Entfernen der Autoplay-Videos,
      // die Rücksicht auf prefers-reduced-motion/saveData und der
      // IntersectionObserver-Vorlauf stehen jetzt direkt in
      // src/pages/Home.tsx bzw. src/lib/frame-scrubber.ts. Ein Patch, der ins
      // Leere greift, fällt still aus und hinterlässt keinen Hinweis - der
      // vorherige lastFrame-Patch verwies nach einem Refactor auf eine
      // gelöschte Variable und ließ die Startseite zur Laufzeit abbrechen.

      return { code: output, map: null };
    },
  };
}
