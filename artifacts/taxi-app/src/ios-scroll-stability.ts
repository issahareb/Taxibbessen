const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

if (isIOS) {
  const ROOT_CLASS = "ios-scroll-stability";
  const HEADER_CLASS = "ios-stable-header";
  const HERO_SECTION_CLASS = "ios-stable-hero-section";
  const POSTER_CLASS = "ios-hero-poster-locked";

  document.documentElement.classList.add(ROOT_CLASS);

  const style = document.createElement("style");
  style.dataset.iosScrollStability = "true";
  style.textContent = `
    html.${ROOT_CLASS} header.${HEADER_CLASS} {
      position: fixed !important;
      top: 0 !important;
      transform: translate3d(0, 0, 0) !important;
      -webkit-transform: translate3d(0, 0, 0) !important;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      will-change: transform;
      isolation: isolate;
    }

    html.${ROOT_CLASS} header.${HEADER_CLASS} > div.absolute {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      background-color: rgba(0, 0, 0, 0.56) !important;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }

    html.${ROOT_CLASS} .${HERO_SECTION_CLASS} {
      min-height: 100lvh !important;
    }

    html.${ROOT_CLASS} img.${POSTER_CLASS} {
      opacity: 0 !important;
      transition: none !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);

  let hasScrolled = window.scrollY > 0;
  let posterLocked = false;
  let scheduled = false;

  const findImage = (fragment: string) =>
    Array.from(document.images).find(
      (image) => image.currentSrc.includes(fragment) || image.src.includes(fragment),
    );

  const refresh = () => {
    scheduled = false;

    const header = document.querySelector<HTMLElement>("header");
    header?.classList.add(HEADER_CLASS);

    const heroLogo = document.getElementById("hero-logo");
    heroLogo?.closest("section")?.classList.add(HERO_SECTION_CLASS);

    if (!hasScrolled || posterLocked) return;

    const poster = findImage("hero-sharp");
    const sequence = findImage("hero-frames/");
    if (!poster || !sequence || !sequence.complete || sequence.naturalWidth === 0) return;

    const posterOpacity = Number.parseFloat(poster.style.opacity || "1");
    if (!Number.isFinite(posterOpacity) || posterOpacity > 0.05) return;

    sequence.decoding = "sync";
    void sequence.decode().catch(() => undefined).finally(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          poster.classList.add(POSTER_CLASS);
          posterLocked = true;
        });
      });
    });
  };

  const scheduleRefresh = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(refresh);
  };

  window.addEventListener(
    "scroll",
    () => {
      hasScrolled = true;
      scheduleRefresh();
    },
    { passive: true },
  );
  window.addEventListener("resize", scheduleRefresh, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleRefresh, { passive: true });
  window.visualViewport?.addEventListener("scroll", scheduleRefresh, { passive: true });

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "style"],
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleRefresh, { once: true });
  } else {
    scheduleRefresh();
  }
}
