const DESKTOP_QUERY = "(min-width: 768px)";
const HERO_SOURCE = "hero-desktop.mp4";
const AIRPORT_SOURCE = "airport-desktop.mp4";

type ScrollVideo = {
  video: HTMLVideoElement;
  sourceName: string;
  currentTime: number;
  targetTime: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const absoluteTop = (element: Element | null) =>
  element ? element.getBoundingClientRect().top + window.scrollY : 0;

const getSourceName = (video: HTMLVideoElement) => {
  const source = video.querySelector("source")?.getAttribute("src") ?? video.currentSrc ?? video.src;
  return source.split("?")[0]?.split("/").pop() ?? "";
};

const prepareVideo = (video: HTMLVideoElement) => {
  video.pause();
  video.autoplay = false;
  video.loop = false;
  video.removeAttribute("autoplay");
  video.removeAttribute("loop");
  video.preload = "auto";
};

const findStorySection = () => {
  const storyImage = Array.from(document.images).find((image) =>
    image.currentSrc.includes("story-bg.webp") || image.src.includes("story-bg.webp"),
  );
  return storyImage?.closest("section") ?? null;
};

const progressFor = (sourceName: string) => {
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;

  if (sourceName === HERO_SOURCE) {
    const servicesTop = absoluteTop(document.getElementById("leistungen"));
    return clamp(scrollY / Math.max(servicesTop, 1));
  }

  if (sourceName === AIRPORT_SOURCE) {
    const storyTop = absoluteTop(findStorySection());
    const faqTop = absoluteTop(document.getElementById("faq"));
    const appear = storyTop + viewportHeight * 0.1;
    const finish = Math.max(faqTop + viewportHeight * 0.8, appear + viewportHeight);
    return clamp((scrollY - appear) / Math.max(finish - appear, 1));
  }

  return 0;
};

let cleanupActiveController: (() => void) | null = null;

const startDesktopVideoController = () => {
  cleanupActiveController?.();
  cleanupActiveController = null;

  if (!window.matchMedia(DESKTOP_QUERY).matches) return;

  const scrollVideos: ScrollVideo[] = Array.from(document.querySelectorAll<HTMLVideoElement>("video"))
    .map((video) => ({ video, sourceName: getSourceName(video) }))
    .filter(({ sourceName }) => sourceName === HERO_SOURCE || sourceName === AIRPORT_SOURCE)
    .map(({ video, sourceName }) => {
      prepareVideo(video);
      return { video, sourceName, currentTime: 0, targetTime: 0 };
    });

  if (scrollVideos.length === 0) return;

  let rafId = 0;
  let lastTimestamp = performance.now();
  let layoutDirty = true;

  const updateTargets = () => {
    for (const item of scrollVideos) {
      const duration = Number.isFinite(item.video.duration) ? item.video.duration : 0;
      if (duration <= 0) continue;
      const safeDuration = Math.max(duration - 0.04, 0);
      item.targetTime = progressFor(item.sourceName) * safeDuration;
    }
    layoutDirty = false;
  };

  const frame = (timestamp: number) => {
    const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    if (layoutDirty) updateTargets();

    // Frame-rate-independent damping: direct enough for wheel/trackpad input,
    // but smooth when the browser delivers uneven scroll events.
    const smoothing = 1 - Math.exp(-14 * deltaSeconds);

    for (const item of scrollVideos) {
      prepareVideo(item.video);
      if (!Number.isFinite(item.video.duration) || item.video.duration <= 0) continue;

      item.currentTime += (item.targetTime - item.currentTime) * smoothing;
      if (Math.abs(item.video.currentTime - item.currentTime) > 1 / 120) {
        item.video.currentTime = item.currentTime;
      }
    }

    rafId = requestAnimationFrame(frame);
  };

  const markDirty = () => {
    layoutDirty = true;
  };

  const syncMetadata = (item: ScrollVideo) => {
    const duration = Number.isFinite(item.video.duration) ? item.video.duration : 0;
    if (duration <= 0) return;
    item.currentTime = progressFor(item.sourceName) * Math.max(duration - 0.04, 0);
    item.targetTime = item.currentTime;
    item.video.currentTime = item.currentTime;
  };

  for (const item of scrollVideos) {
    if (item.video.readyState >= HTMLMediaElement.HAVE_METADATA) syncMetadata(item);
    item.video.addEventListener("loadedmetadata", () => syncMetadata(item), { once: true });
  }

  window.addEventListener("scroll", markDirty, { passive: true });
  window.addEventListener("resize", markDirty);
  window.addEventListener("orientationchange", markDirty);
  rafId = requestAnimationFrame(frame);

  cleanupActiveController = () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("scroll", markDirty);
    window.removeEventListener("resize", markDirty);
    window.removeEventListener("orientationchange", markDirty);
  };
};

const scheduleControllerStart = () => requestAnimationFrame(startDesktopVideoController);

const observer = new MutationObserver((mutations) => {
  const containsRelevantVideo = mutations.some((mutation) =>
    Array.from(mutation.addedNodes).some((node) => {
      if (!(node instanceof Element)) return false;
      const videos = node.matches("video") ? [node] : Array.from(node.querySelectorAll("video"));
      return videos.some((candidate) => {
        const sourceName = getSourceName(candidate as HTMLVideoElement);
        return sourceName === HERO_SOURCE || sourceName === AIRPORT_SOURCE;
      });
    }),
  );

  if (containsRelevantVideo) scheduleControllerStart();
});

observer.observe(document.documentElement, { childList: true, subtree: true });
window.matchMedia(DESKTOP_QUERY).addEventListener("change", scheduleControllerStart);
window.addEventListener("popstate", scheduleControllerStart);
window.addEventListener("hashchange", scheduleControllerStart);
window.addEventListener("load", scheduleControllerStart, { once: true });
scheduleControllerStart();
