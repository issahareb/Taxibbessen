function removeBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const end = source.indexOf(endMarker, start);
  if (end < 0) return source;
  return source.slice(0, start) + source.slice(end);
}

function insertBeforeAfterMarker(source, marker, target, insertion) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return source;
  const targetIndex = source.indexOf(target, markerIndex);
  if (targetIndex < 0) return source;
  return source.slice(0, targetIndex) + insertion + source.slice(targetIndex);
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

      output = output.replace('import brushStroke from "@assets/brush-stroke.png";\n', "");

      output = removeBetween(
        output,
        "        {/* ─── BEWERTUNGS-CTA ─── */}",
        "        {/* ─── STORY SECTION ─── */}",
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
          "Taxi B&B GmbH ist in Essen tätig und rund um die Uhr unter 0201 707060 erreichbar. Abholzeit und Fahrzeugverfügbarkeit werden bei der Anfrage bestätigt.",
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

      output = output
        .replace(
          "  const heroLayerRef = useRef<HTMLDivElement>(null);\n",
          "  const heroLayerRef = useRef<HTMLDivElement>(null);\n  const heroVideoRef = useRef<HTMLVideoElement>(null);\n",
        )
        .replace(
          "  const ctaLayerRef = useRef<HTMLDivElement>(null);\n",
          "  const ctaLayerRef = useRef<HTMLDivElement>(null);\n  const ctaVideoRef = useRef<HTMLVideoElement>(null);\n",
        );

      output = output.replace(
        `    const img = imgRef.current;
    const heroLayer = heroLayerRef.current;
    if (!img) return;
    // Desktop uses the autoplay video — skip loading all 97 frames
    if (!window.matchMedia('(max-width: 767px)').matches) return;`,
        `    const img = imgRef.current;
    const heroLayer = heroLayerRef.current;
    const heroVideo = heroVideoRef.current;
    if (!img || !heroLayer) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (!isMobile && heroVideo) heroVideo.pause();`,
      );

      output = output.replace(
        "const loadFrames = () => {\n      if (framesLoaded) return;",
        `const shouldReduceMedia =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator).connection?.saveData === true;

    const loadFrames = () => {
      if (!isMobile || framesLoaded || shouldReduceMedia) return;`,
      );

      output = output.replace(
        "      if (sharpOverlayRef.current) {",
        `      if (!isMobile && heroVideo && heroVideo.readyState >= 2 && Number.isFinite(heroVideo.duration) && heroVideo.duration > 0) {
        const nextTime = currentProgress * Math.max(heroVideo.duration - 0.05, 0);
        if (Math.abs(heroVideo.currentTime - nextTime) > 0.025) heroVideo.currentTime = nextTime;
      }
      if (sharpOverlayRef.current) {`,
      );

      output = output.replace(
        `    const img = ctaImgRef.current;
    const layer = ctaLayerRef.current;
    const sectionEl = ctaSectionRef.current;
    if (!layer || !sectionEl) return;

    // CTA frames are only shown on mobile (img has md:hidden); skip on desktop
    const isMobile = window.matchMedia('(max-width: 767px)').matches;`,
        `    const img = ctaImgRef.current;
    const layer = ctaLayerRef.current;
    const sectionEl = ctaSectionRef.current;
    const ctaVideo = ctaVideoRef.current;
    if (!layer || !sectionEl) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (!isMobile && ctaVideo) ctaVideo.pause();`,
      );

      output = insertBeforeAfterMarker(
        output,
        "      if (isMobile && img && frames.length > 0) {",
        "      layer.style.opacity = String(currentOpacity);",
        `      if (!isMobile && ctaVideo && ctaVideo.readyState >= 2 && Number.isFinite(ctaVideo.duration) && ctaVideo.duration > 0) {
        const nextTime = currentProgress * Math.max(ctaVideo.duration - 0.05, 0);
        if (Math.abs(ctaVideo.currentTime - nextTime) > 0.025) ctaVideo.currentTime = nextTime;
      }
`,
      );

      output = output.replaceAll("            lastFrame = idx;", "            lastFrame = ready;");

      output = output.replace(
        `          <video
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            style={{ objectPosition: "center" }}
          >
            <source src={\`${import.meta.env.BASE_URL}hero-desktop.mp4\`} type="video/mp4" />
          </video>`,
        `          <video
            ref={heroVideoRef}
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            preload="auto"
            poster={\`${import.meta.env.BASE_URL}hero-sharp.webp\`}
            style={{ objectPosition: "center", transform: "translateZ(0)", backfaceVisibility: "hidden" }}
          >
            <source src={\`${import.meta.env.BASE_URL}hero-desktop.mp4\`} type="video/mp4" />
          </video>`,
      );

      output = output.replace(
        `          <video
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            style={{ objectPosition: "center" }}
          >
            <source src={\`${import.meta.env.BASE_URL}airport-desktop.mp4\`} type="video/mp4" />
          </video>`,
        `          <video
            ref={ctaVideoRef}
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            preload="auto"
            poster={ctaFramePath(1)}
            style={{ objectPosition: "center", transform: "translateZ(0)", backfaceVisibility: "hidden" }}
          >
            <source src={\`${import.meta.env.BASE_URL}airport-desktop.mp4\`} type="video/mp4" />
          </video>`,
      );

      output = output.replaceAll(
        'style={{ height: "100lvh", zIndex: 1,',
        'style={{ height: "100lvh", zIndex: 1, willChange: "opacity", transform: "translateZ(0)",',
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

      output = output
        .replace("{ rootMargin: '500% 0px' }", "{ rootMargin: '100% 0px' }")
        .replace("{ rootMargin: '300% 0px' }", "{ rootMargin: '100% 0px' }");

      return { code: output, map: null };
    },
  };
}
