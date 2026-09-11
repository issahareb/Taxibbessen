/**
 * First-party reach measurement.
 *
 * Design constraints that shape everything below:
 * - Nothing is sent before the visitor accepted the cookie notice, and
 *   nothing is sent when the browser asks not to be tracked.
 * - The session id lives in sessionStorage, so it is gone when the tab
 *   closes. There is deliberately no way to recognise a returning visitor.
 * - No personal data is collected: no IP (the server does not store it), no
 *   raw user agent, and only the *host* of the referrer, never its path.
 * - Delivery uses sendBeacon so a page can unload without losing the last
 *   engagement ping, and a failed send is silently dropped rather than
 *   retried forever.
 */

const CONSENT_KEY = "taxi-bb-cookie-consent";
const SESSION_KEY = "taxi-bb-analytics-session";
// Same base resolution as the other API callers: the API can live on its own
// domain, in which case a relative path would post to the static site instead.
const API_BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");
const ENDPOINT = `${API_BASE}/api/track`;
const FLUSH_INTERVAL_MS = 15_000;
const MAX_BATCH = 20;

export type AnalyticsEventType =
  | "pageview"
  | "engagement"
  | "scroll"
  | "click"
  | "form_start"
  | "form_submit";

type SourceCategory = "direct" | "search" | "social" | "referral";
type DeviceType = "mobile" | "tablet" | "desktop";

type AnalyticsEvent = {
  sessionId: string;
  eventType: AnalyticsEventType;
  path: string;
  referrerHost: string | null;
  sourceCategory: SourceCategory | null;
  deviceType: DeviceType | null;
  browser: string | null;
  language: string | null;
  viewportWidth: number | null;
  target: string | null;
  scrollDepth: number | null;
  activeMs: number | null;
};

const SEARCH_HOST_PATTERN = /(google|bing|duckduckgo|ecosia|yahoo|yandex|startpage|qwant|brave)\./i;
const SOCIAL_HOST_PATTERN = /(facebook|instagram|twitter|x\.com|tiktok|linkedin|pinterest|youtube|whatsapp|t\.co)\./i;

let queue: AnalyticsEvent[] = [];
let flushTimer: number | null = null;
let started = false;
let teardown: (() => void) | null = null;

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

function tracksDisallowed(): boolean {
  const navigatorWithDnt = navigator as Navigator & { msDoNotTrack?: string };
  const windowWithDnt = window as Window & { doNotTrack?: string };
  const signal =
    navigator.doNotTrack ?? navigatorWithDnt.msDoNotTrack ?? windowWithDnt.doNotTrack;
  return signal === "1" || signal === "yes";
}

function isEnabled(): boolean {
  return hasConsent() && !tracksDisallowed();
}

function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = randomId();
    sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // Private mode with storage blocked: fall back to a per-page-load id.
    return randomId();
  }
}

function referrerHost(): string | null {
  if (!document.referrer) return null;
  try {
    const host = new URL(document.referrer).hostname.toLowerCase();
    return host === window.location.hostname ? null : host;
  } catch {
    return null;
  }
}

function sourceCategory(host: string | null): SourceCategory {
  if (!host) return "direct";
  if (SEARCH_HOST_PATTERN.test(host)) return "search";
  if (SOCIAL_HOST_PATTERN.test(host)) return "social";
  return "referral";
}

function deviceType(): DeviceType {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/** Coarse browser family. Enough for a compatibility overview, not a fingerprint. */
function browserFamily(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/SamsungBrowser\//.test(ua)) return "Samsung Internet";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Andere";
}

function baseEvent(eventType: AnalyticsEventType): AnalyticsEvent {
  const host = referrerHost();
  return {
    sessionId: sessionId(),
    eventType,
    path: window.location.pathname || "/",
    referrerHost: host,
    sourceCategory: sourceCategory(host),
    deviceType: deviceType(),
    browser: browserFamily(),
    language: (navigator.language || "").slice(0, 12) || null,
    viewportWidth: window.innerWidth,
    target: null,
    scrollDepth: null,
    activeMs: null,
  };
}

function send(events: AnalyticsEvent[]): void {
  if (events.length === 0) return;
  const body = JSON.stringify({ events });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Measurement must never surface an error to the visitor.
  }
}

function flush(): void {
  if (flushTimer !== null) {
    window.clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;
  const batch = queue.slice(0, MAX_BATCH);
  queue = queue.slice(MAX_BATCH);
  send(batch);
  if (queue.length > 0) scheduleFlush();
}

function scheduleFlush(): void {
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(flush, FLUSH_INTERVAL_MS);
}

function enqueue(event: AnalyticsEvent, immediate = false): void {
  if (!isEnabled()) return;
  queue.push(event);
  if (immediate || queue.length >= MAX_BATCH) {
    flush();
    return;
  }
  scheduleFlush();
}

/** Accumulates time the page was actually visible, not just open in a tab. */
function createEngagementTracker() {
  let activeMs = 0;
  let lastTick = Date.now();
  let visible = document.visibilityState === "visible";

  const accumulate = () => {
    if (visible) activeMs += Date.now() - lastTick;
    lastTick = Date.now();
  };

  return {
    onVisibilityChange() {
      accumulate();
      visible = document.visibilityState === "visible";
    },
    /** Milliseconds of visible time since the last reset. */
    take(): number {
      accumulate();
      const value = activeMs;
      activeMs = 0;
      return value;
    },
    reset() {
      accumulate();
      activeMs = 0;
    },
  };
}

let engagement = createEngagementTracker();
let reachedDepths = new Set<number>();
let currentPath = "";

const SCROLL_MILESTONES = [25, 50, 75, 100];

function checkScrollDepth(): void {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return;
  const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));

  for (const milestone of SCROLL_MILESTONES) {
    if (percent >= milestone && !reachedDepths.has(milestone)) {
      reachedDepths.add(milestone);
      enqueue({ ...baseEvent("scroll"), scrollDepth: milestone });
    }
  }
}

/** Reports how long the page just left behind was actually looked at. */
function reportEngagement(path: string): void {
  const activeMs = engagement.take();
  if (activeMs < 1000) return;
  enqueue({ ...baseEvent("engagement"), path, activeMs });
}

/**
 * Maps a clicked element to a stable label. An explicit `data-track` wins;
 * otherwise the common conversion links (phone, WhatsApp, mail) are
 * recognised by their href so no component needs to be touched.
 */
function clickTarget(element: Element): string | null {
  const tracked = element.closest<HTMLElement>("[data-track]");
  if (tracked?.dataset.track) return tracked.dataset.track.slice(0, 60);

  const link = element.closest<HTMLAnchorElement>("a[href]");
  if (!link) return null;

  const href = link.getAttribute("href") ?? "";
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "email";
  if (/wa\.me|whatsapp/i.test(href)) return "whatsapp";
  if (/google\.[a-z.]+\/maps/i.test(href)) return "google_maps";
  return null;
}

export function trackPageview(path: string): void {
  if (!isEnabled()) return;

  if (currentPath && currentPath !== path) reportEngagement(currentPath);

  currentPath = path;
  reachedDepths = new Set();
  engagement.reset();
  enqueue({ ...baseEvent("pageview"), path }, true);
  checkScrollDepth();
}

let formStarted = false;

export function trackFormStart(): void {
  if (formStarted) return;
  formStarted = true;
  enqueue(baseEvent("form_start"));
}

export function trackFormSubmit(): void {
  enqueue(baseEvent("form_submit"), true);
}

export function trackClick(target: string): void {
  enqueue({ ...baseEvent("click"), target: target.slice(0, 60) }, true);
}

/**
 * Wires up the listeners that run for the whole visit. Safe to call more
 * than once; only the first call attaches anything.
 */
export function initAnalytics(): void {
  if (started) return;
  started = true;

  engagement = createEngagementTracker();

  const onScroll = () => checkScrollDepth();
  const onVisibility = () => {
    engagement.onVisibilityChange();
    if (document.visibilityState === "hidden") {
      reportEngagement(currentPath || window.location.pathname);
      flush();
    }
  };
  const onPageHide = () => {
    reportEngagement(currentPath || window.location.pathname);
    flush();
  };
  const onClick = (event: MouseEvent) => {
    const element = event.target instanceof Element ? event.target : null;
    if (!element) return;
    const target = clickTarget(element);
    if (target) trackClick(target);
  };
  // First interaction with any form field counts as "started filling in",
  // which is what makes the funnel step meaningful without every form
  // component having to report it itself.
  const onFocusIn = (event: FocusEvent) => {
    const element = event.target instanceof Element ? event.target : null;
    if (!element?.closest("form")) return;
    if (!element.matches("input, textarea, select")) return;
    trackFormStart();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);
  document.addEventListener("click", onClick, { capture: true, passive: true });
  document.addEventListener("focusin", onFocusIn, { passive: true });

  teardown = () => {
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
    document.removeEventListener("click", onClick, { capture: true });
    document.removeEventListener("focusin", onFocusIn);
    started = false;
    teardown = null;
  };
}

/** Called when the visitor declines or withdraws consent. */
export function stopAnalytics(): void {
  queue = [];
  if (flushTimer !== null) {
    window.clearTimeout(flushTimer);
    flushTimer = null;
  }
  teardown?.();
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clear.
  }
}

/**
 * Starts measurement once consent exists. The cookie banner calls this after
 * the visitor accepts, so the first pageview of that visit is not lost.
 */
export function startAnalyticsIfAllowed(path: string): void {
  if (!isEnabled()) return;
  initAnalytics();
  if (currentPath !== path) trackPageview(path);
}
