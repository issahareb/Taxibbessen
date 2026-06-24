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

      output = output.replace(
        `  {
    q: "Muss ich die Fahrt vorab bezahlen?",
    a: "Nein – Sie bezahlen bequem nach der Fahrt. Wir akzeptieren Bargeld, EC-Karte und Kreditkarte (Visa/Mastercard). Bei Krankenfahrten rechnen wir direkt mit Ihrer Krankenkasse ab.",
  },
`,
        "",
      );

      const contentReplacements = new Map([
        [
          "Taxi B&B GmbH ist seit 1992 für Pünktlichkeit und Zuverlässigkeit bekannt – mit 5-Sterne-Bewertungen und 30+ Jahren Erfahrung. Wir sind 24/7 für Sie da: 0201 707060.",
          "Taxi B&B GmbH ist seit 1992 in Essen tätig und rund um die Uhr unter 0201 707060 erreichbar. Abholzeit und Fahrzeugverfügbarkeit werden bei der Anfrage bestätigt.",
        ],
        [
          "Wir berechnen transparente Festpreise ohne böse Überraschungen. Die Strecke Essen–Flughafen Düsseldorf beträgt ca. 35–40 km. Rufen Sie uns für ein konkretes Angebot an: 0201 707060.",
          "Der Preis hängt von Abholort, Abholzeit und Fahrzeug ab. Die Strecke Essen–Flughafen Düsseldorf beträgt je nach Startpunkt ungefähr 35–40 km. Rufen Sie für eine konkrete Auskunft an: 0201 707060.",
        ],
        [
          "Ja! Für viele Strecken – besonders Flughafentransfers und regelmäßige Fahrten – bieten wir Festpreise an. So wissen Sie vorab genau, was Ihre Fahrt kostet. Anfragen unter 0201 707060.",
          "Für bestimmte vorbestellte Strecken kann vorab eine Preisangabe vereinbart werden. Fragen Sie unter 0201 707060 nach und lassen Sie sich den Preis vor der Fahrt bestätigen.",
        ],
        [
          "Ja, wir unterstützen mobilitätseingeschränkte Fahrgäste und bieten barrierefreie Fahrten an. Bitte teilen Sie uns Ihre Anforderungen bei der Buchung mit: 0201 707060.",
          "Bitte teilen Sie uns Mobilitätshilfen und benötigte Unterstützung bereits bei der Anfrage mit. Wir prüfen anschließend, ob ein geeignetes Fahrzeug verfügbar ist.",
        ],
        [
          "Für Langstrecken berechnen wir Festpreise, die Sie vorab kennen. Essen–Köln sind ca. 75 km, Essen–Dortmund ca. 40 km. Rufen Sie uns für ein konkretes Angebot an: 0201 707060.",
          "Der Preis für Langstrecken hängt von Start, Ziel, Zeit und Fahrzeug ab. Rufen Sie unter 0201 707060 an und lassen Sie sich vor der Fahrt eine konkrete Auskunft geben.",
        ],
        [
          "Der Fahrpreis besteht aus Grundgebühr, Kilometerpreis und ggf. Zeittarif (Stau, Warten). Für viele Strecken bieten wir Festpreise an – so gibt es keine Überraschungen. Alle Preise nach offizieller Essener Taxitarifordnung.",
          "Der reguläre Taxipreis richtet sich nach der geltenden örtlichen Tarifordnung. Bei vorbestellten Sonder- oder Fernfahrten kann eine individuelle Preisabsprache möglich sein; lassen Sie diese vorher bestätigen.",
        ],
        [
          "Ja! Unser Kurierdienst ist besonders bei Firmen in Essen gefragt – Vertragsdokumente, Musterteile, dringende Unterlagen. Diskret, schnell und zuverlässig. Regelmäßige Firmenkunden erhalten Vorzugskonditionen: 0201 707060.",
          "Kurierfahrten für Dokumente und kleinere Sendungen können angefragt werden. Inhalt, Abholung, Ziel, Übergabe, Verfügbarkeit und Preis werden vorab abgestimmt.",
        ],
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
