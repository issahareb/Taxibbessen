const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

if (isIOS) {
  const ROOT_CLASS = "ios-scroll-stability";
  const HEADER_CLASS = "ios-stable-header";
  const HERO_SECTION_CLASS = "ios-stable-hero-section";

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
  `;
  document.head.appendChild(style);

  let scheduled = false;

  const refresh = () => {
    scheduled = false;

    const header = document.querySelector<HTMLElement>("header");
    header?.classList.add(HEADER_CLASS);

    const heroLogo = document.getElementById("hero-logo");
    heroLogo?.closest("section")?.classList.add(HERO_SECTION_CLASS);
  };

  const scheduleRefresh = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(refresh);
  };

  window.addEventListener("resize", scheduleRefresh, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleRefresh, { passive: true });

  // Only observe DOM insertions (React mount / route changes). Watching every
  // `src` and `style` mutation made this observer fire continuously while the
  // hero image sequence was scrubbing and added unnecessary work on iOS.
  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleRefresh, { once: true });
  } else {
    scheduleRefresh();
  }
}
