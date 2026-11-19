import { prefersLessMedia } from "./lib/frame-scrubber";

const DESKTOP_QUERY = "(min-width: 768px)";
const HERO_SOURCE = "hero-plates-20261026-desktop.mp4";
const AIRPORT_SOURCE = "transfer-plates-20261026-desktop.mp4";
const CITY_SOURCE = "city-plates-20261026-desktop.mp4";
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const absoluteTop = (element: Element | null) =>
  element ? element.getBoundingClientRect().top + window.scrollY : 0;
const getSourceName = (video: HTMLVideoElement) =>
  (video.querySelector("source")?.getAttribute("src") ?? video.currentSrc ?? video.src)
    .split("?")[0]?.split("/").pop() ?? "";
const findStorySection = () => Array.from(document.images).find((image) =>
  image.currentSrc.includes("story-bg") || image.src.includes("story-bg"),
)?.closest("section") ?? null;

let cleanupActiveController: (() => void) | null = null;

function startDesktopVideoController() {
  cleanupActiveController?.();
  cleanupActiveController = null;
  if (!window.matchMedia(DESKTOP_QUERY).matches || prefersLessMedia()) return;

  const items = Array.from(document.querySelectorAll<HTMLVideoElement>("video"))
    .map((video) => ({ video, name: getSourceName(video), target: 0, loading: false, lastSeekAt: -Infinity }))
    .filter(({ name }) => name === HERO_SOURCE || name === AIRPORT_SOURCE || name === CITY_SOURCE);
  if (!items.length) return;

  let raf = 0;
  let disposed = false;
  let layoutDirty = true;
  let servicesTop = 1;
  let cityStart = 0;
  let cityFinish = 1;
  let appear = 0;
  let finish = 1;

  function schedule() {
    if (!disposed && !raf && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function updateTargets() {
    if (layoutDirty) {
      servicesTop = Math.max(absoluteTop(document.getElementById("leistungen")), 1);
      cityStart = servicesTop + window.innerHeight * 0.4;
      cityFinish = Math.max(absoluteTop(findStorySection()), cityStart + 1);
      appear = absoluteTop(findStorySection()) + window.innerHeight * 0.1;
      finish = Math.max(absoluteTop(document.getElementById("faq")) + window.innerHeight * 0.8, appear + window.innerHeight);
      layoutDirty = false;
    }
    for (const item of items) {
      // Warm the hero before interaction; prebuffer later scenes before their entrance.
      const shouldLoad = item.name === HERO_SOURCE
        ? true
        : window.scrollY > 0 && window.scrollY + window.innerHeight * 2 >= (item.name === CITY_SOURCE ? cityStart : appear);
      if (shouldLoad && !item.loading) {
        item.loading = true;
        if (item.video.preload !== "auto") {
          item.video.preload = "auto";
          item.video.load();
        }
      }
      const progress = item.name === HERO_SOURCE
        ? clamp(window.scrollY / servicesTop)
        : item.name === CITY_SOURCE
          ? clamp((window.scrollY - cityStart) / Math.max(cityFinish - cityStart, 1))
          : clamp((window.scrollY - appear) / Math.max(finish - appear, 1));
      const duration = Number.isFinite(item.video.duration) ? item.video.duration : 0;
      item.target = progress * Math.max(duration - 0.04, 0);
    }
  }
  function frame(timestamp: number) {
    raf = 0;
    if (disposed || document.hidden) return;
    updateTargets();
    // Seeking is not video playback: each currentTime assignment may trigger a
    // costly keyframe decode. Never queue dozens of intermediate seeks while
    // the user scrolls. Keep only the latest target and wait for seeked.
    const minSeekInterval = 1000 / 24;
    const frameTolerance = 1 / 40;
    let waitingForSeekBudget = false;
    for (const item of items) {
      if (!item.loading || item.video.readyState < 1) continue;
      if (Math.abs(item.video.currentTime - item.target) <= frameTolerance) continue;
      if (item.video.seeking) continue;

      if (timestamp - item.lastSeekAt < minSeekInterval) {
        waitingForSeekBudget = true;
        continue;
      }
      item.lastSeekAt = timestamp;
      // Target is calculated from the *latest* scroll position, rather than
      // chasing an outdated eased position after an expensive video seek.
      item.video.currentTime = item.target;
    }
    if (waitingForSeekBudget) schedule();
  }
  const resize = () => { layoutDirty = true; schedule(); };
  const ready = () => { layoutDirty = true; schedule(); };
  const resizeObserver = new ResizeObserver(resize);
  const main = document.querySelector("main");
  if (main) resizeObserver.observe(main);
  for (const { video } of items) {
    video.pause();
    video.addEventListener("loadedmetadata", ready);
    video.addEventListener("loadeddata", ready);
    video.addEventListener("canplay", ready);
    video.addEventListener("seeked", schedule);
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", schedule);
  schedule();
  cleanupActiveController = () => {
    disposed = true;
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", schedule);
    for (const { video } of items) {
      video.removeEventListener("loadedmetadata", ready);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("canplay", ready);
      video.removeEventListener("seeked", schedule);
    }
  };
}

let startFrame = 0;
const scheduleControllerStart = () => {
  cancelAnimationFrame(startFrame);
  startFrame = requestAnimationFrame(startDesktopVideoController);
};
const observer = new MutationObserver((mutations) => {
  const containsVideo = mutations.some((mutation) =>
    [...mutation.addedNodes, ...mutation.removedNodes].some((node) =>
      node instanceof Element && (node.matches("video") || node.querySelector("video")),
    ),
  );
  if (containsVideo) scheduleControllerStart();
});
observer.observe(document.documentElement, { childList: true, subtree: true });
window.matchMedia(DESKTOP_QUERY).addEventListener("change", scheduleControllerStart);
window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", scheduleControllerStart);
window.addEventListener("popstate", scheduleControllerStart);
window.addEventListener("load", scheduleControllerStart, { once: true });
scheduleControllerStart();
