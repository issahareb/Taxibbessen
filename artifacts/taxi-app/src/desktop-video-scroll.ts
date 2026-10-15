import { prefersLessMedia } from "./lib/frame-scrubber";

const DESKTOP_QUERY = "(min-width: 768px)";
const HERO_SOURCE = "hero-desktop.mp4";
const AIRPORT_SOURCE = "airport-desktop.mp4";
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
    .map((video) => ({ video, name: getSourceName(video), current: video.currentTime, target: 0, loading: false }))
    .filter(({ name }) => name === HERO_SOURCE || name === AIRPORT_SOURCE);
  if (!items.length) return;

  let raf = 0;
  let lastTimestamp = 0;
  let disposed = false;
  let layoutDirty = true;
  let servicesTop = 1;
  let appear = 0;
  let finish = 1;

  function schedule() {
    if (!disposed && !raf && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function updateTargets() {
    if (layoutDirty) {
      servicesTop = Math.max(absoluteTop(document.getElementById("leistungen")), 1);
      appear = absoluteTop(findStorySection()) + window.innerHeight * 0.1;
      finish = Math.max(absoluteTop(document.getElementById("faq")) + window.innerHeight * 0.8, appear + window.innerHeight);
      layoutDirty = false;
    }
    for (const item of items) {
      // Keep the initial still until interaction; prebuffer the airport before it appears.
      const shouldLoad = item.name === HERO_SOURCE
        ? window.scrollY > 0
        : window.scrollY > 0 && window.scrollY + window.innerHeight * 2 >= appear;
      if (shouldLoad && !item.loading) {
        item.loading = true;
        item.video.preload = "auto";
        item.video.load();
      }
      const progress = item.name === HERO_SOURCE
        ? clamp(window.scrollY / servicesTop)
        : clamp((window.scrollY - appear) / Math.max(finish - appear, 1));
      const duration = Number.isFinite(item.video.duration) ? item.video.duration : 0;
      item.target = progress * Math.max(duration - 0.04, 0);
    }
  }
  function frame(timestamp: number) {
    raf = 0;
    if (disposed || document.hidden) return;
    updateTargets();
    const delta = Math.min((timestamp - lastTimestamp) / 1000 || 1 / 60, 0.05);
    lastTimestamp = timestamp;
    const smoothing = 1 - Math.exp(-14 * delta);
    let moving = false;
    for (const item of items) {
      if (!item.loading || item.video.readyState < 1) continue;
      const distance = item.target - item.current;
      item.current = Math.abs(distance) < 1 / 60 ? item.target : item.current + distance * smoothing;
      if (!item.video.seeking && Math.abs(item.video.currentTime - item.current) > 1 / 60) {
        item.video.currentTime = item.current;
      }
      if (Math.abs(item.target - item.current) >= 1 / 60) moving = true;
    }
    if (moving) schedule();
  }
  const resize = () => { layoutDirty = true; schedule(); };
  const ready = () => { layoutDirty = true; schedule(); };
  const resizeObserver = new ResizeObserver(resize);
  const main = document.querySelector("main");
  if (main) resizeObserver.observe(main);
  for (const { video } of items) {
    video.pause();
    video.addEventListener("loadedmetadata", ready);
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
