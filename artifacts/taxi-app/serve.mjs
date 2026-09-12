import express from "express";
import compression from "compression";
import { fileURLToPath } from "url";
import { dirname, extname, join } from "path";
import { readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = join(__dirname, "dist/public");
const CANONICAL_HOST = "www.taxibbessen.de";

let knownPaths = null;
const routesJsonPath = join(DIST, "_routes.json");
if (existsSync(routesJsonPath)) {
  knownPaths = new Set(JSON.parse(readFileSync(routesJsonPath, "utf-8")));
}

/* ---------------------------------------------------------------------------
 * Zustimmungsfreie Reichweitenmessung, serverseitig.
 *
 * Die clientseitige Messung in src/lib/analytics.ts zaehlt nur Besucher, die
 * dem Cookie-Banner zustimmen und kein Do-Not-Track senden. Damit fehlen in
 * der Auswertung alle Ablehnenden, alle mit blockiertem JavaScript und
 * saemtliche Suchmaschinen-Crawler, die kein JavaScript ausfuehren.
 *
 * Hier wird deshalb nur gezaehlt, nicht beobachtet: Pfad, Stunde, Host der
 * verweisenden Seite und ein Bot-Kennzeichen wandern in einen Zaehler im
 * Speicher, der einmal pro Minute als Zuwachs an den API-Server geht. Es
 * entsteht keine Zeile pro Besucher, keine IP, kein User-Agent, keine
 * Kennung und kein Cookie - nichts davon kann eine Person herausgreifen.
 *
 * Die Messung ist strikt nachrangig: sie laeuft ausschliesslich in
 * res.on("finish"), also nachdem die Antwort das Haus verlassen hat, und
 * jeder Fehler darin bleibt gekapselt. Fehlt die Konfiguration, zaehlt der
 * Server gar nicht erst.
 * ------------------------------------------------------------------------- */

const SINK_URL = (process.env.PAGEVIEW_SINK_URL || "").trim();
const SINK_TOKEN = (process.env.PAGEVIEW_SINK_TOKEN || "").trim();
const COUNTING_ENABLED = Boolean(SINK_URL && SINK_TOKEN);

const FLUSH_INTERVAL_MS = Number(process.env.PAGEVIEW_FLUSH_INTERVAL_MS) || 60_000;
// Obergrenze gegen unbegrenztes Wachstum. Crawler und Scanner probieren
// beliebige URLs aus; ohne Deckel koennte die Map den Prozess auffressen.
const MAX_KEYS = 5_000;
// Ein Stapel passt in das 100kb-Limit des API-Servers und in das
// Zod-Maximum von 500 Zeilen.
const MAX_BATCH = 500;

const BOT_PATTERN = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|outbrain|pinterest|vkshare|w3c_validator|whatsapp|telegrambot|discordbot|semrush|ahrefs|mj12|dotbot|petalbot|yandex|baidu|duckduck|applebot|googleother|gptbot|claudebot|ccbot|perplexity|headlesschrome|lighthouse|pagespeed|monitoring|uptime|curl|wget|python-requests|go-http-client|axios|okhttp/i;

/** Zaehlerschluessel -> Anzahl. Wird beim Flush geleert. */
let counters = new Map();
let droppedKeys = 0;

function hourBucketIso(now) {
  return new Date(Math.floor(now / 3_600_000) * 3_600_000).toISOString();
}

/** Nur der Host der verweisenden Seite, niemals eine vollstaendige URL. */
function referrerHost(req) {
  const raw = req.get("referer") || req.get("referrer") || "";
  if (!raw) return "";
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
    // Navigation innerhalb der eigenen Seite ist kein Verweis.
    if (host === CANONICAL_HOST.replace(/^www\./, "") || host === "taxibbessen.de") return "";
    return host.slice(0, 120);
  } catch {
    return "";
  }
}

function countRequest(req, res) {
  // Nur ausgelieferte HTML-Seiten. Bilder, Skripte, Weiterleitungen und
  // 404er zaehlen nicht: gezaehlt werden Seitenaufrufe, nicht Requests.
  if (res.statusCode !== 200) return;
  if (!(res.getHeader("Content-Type") || "").toString().includes("text/html")) return;

  const path = req.path === "/" ? "/" : req.path.replace(/\/$/, "");
  // Nur bekannte Routen. Sonst traegt jede erfundene URL eines Scanners eine
  // eigene Zeile in die Datenbank.
  if (path !== "/" && knownPaths && !knownPaths.has(path)) return;
  if (path.length > 200) return;

  const isBot = BOT_PATTERN.test(req.get("user-agent") || "");
  const key = [hourBucketIso(Date.now()), path, referrerHost(req), isBot ? "1" : "0"].join("\u0000");

  const existing = counters.get(key);
  if (existing !== undefined) {
    counters.set(key, existing + 1);
    return;
  }
  if (counters.size >= MAX_KEYS) {
    droppedKeys += 1;
    return;
  }
  counters.set(key, 1);
}

function drainBatch() {
  const batch = [];
  for (const [key, views] of counters) {
    const [bucketHour, path, referrerHost, botFlag] = key.split("\u0000");
    batch.push({ bucketHour, path, referrerHost, isBot: botFlag === "1", views });
    counters.delete(key);
    if (batch.length >= MAX_BATCH) break;
  }
  return batch;
}

/** Legt einen fehlgeschlagenen Stapel zurueck, damit nichts verloren geht. */
function restoreBatch(batch) {
  for (const row of batch) {
    const key = [row.bucketHour, row.path, row.referrerHost, row.isBot ? "1" : "0"].join("\u0000");
    if (counters.size >= MAX_KEYS && !counters.has(key)) continue;
    counters.set(key, (counters.get(key) || 0) + row.views);
  }
}

async function flushCounters() {
  if (!COUNTING_ENABLED || counters.size === 0) return;

  const batch = drainBatch();
  if (batch.length === 0) return;

  try {
    const response = await fetch(SINK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Pageview-Token": SINK_TOKEN },
      body: JSON.stringify({ counters: batch }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) {
      // 4xx wiederholen bringt nichts - fehlerhafte Zeilen wuerden ewig
      // kreisen. Nur bei Server- und Netzfehlern erneut versuchen.
      if (response.status >= 500) restoreBatch(batch);
      else console.warn(`Pageview-Flush verworfen: HTTP ${response.status}`);
      return;
    }
    if (droppedKeys > 0) {
      console.warn(`Pageview-Zaehler: ${droppedKeys} Schluessel wegen Obergrenze verworfen`);
      droppedKeys = 0;
    }
  } catch (error) {
    restoreBatch(batch);
    console.warn(`Pageview-Flush fehlgeschlagen: ${error instanceof Error ? error.message : error}`);
  }
}

const app = express();
app.set("trust proxy", true);

const longCacheExtensions = new Set([
  ".avif",
  ".css",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".mp4",
  ".png",
  ".svg",
  ".webm",
  ".webp",
  ".woff",
  ".woff2",
]);

app.use(compression({ level: 6 }));

app.use((_req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

if (COUNTING_ENABLED) {
  app.use((req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD") {
      res.on("finish", () => {
        try {
          countRequest(req, res);
        } catch {
          // Die Messung darf die Auslieferung unter keinen Umstaenden stoeren.
        }
      });
    }
    next();
  });
}

app.use((req, res, next) => {
  const host = (req.get("host") || "").split(":")[0].toLowerCase();
  const forwardedProto = (req.get("x-forwarded-proto") || req.protocol)
    .split(",")[0]
    .trim();
  const isPublicHost = host === "taxibbessen.de" || host === CANONICAL_HOST;

  if (isPublicHost && (host !== CANONICAL_HOST || forwardedProto !== "https")) {
    return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  }

  const normalizedPath = req.path === "/" ? "/" : req.path.replace(/\/$/, "");

  if (normalizedPath === "/book") {
    return res.redirect(301, "/#anfrage");
  }

  const isKnownRoute = Boolean(knownPaths?.has(normalizedPath));
  const hasFileExtension = extname(req.path) !== "";

  if (
    isKnownRoute &&
    req.path !== "/" &&
    !req.path.endsWith("/") &&
    !hasFileExtension
  ) {
    const query = req.originalUrl.includes("?")
      ? req.originalUrl.slice(req.originalUrl.indexOf("?"))
      : "";
    return res.redirect(301, `${req.path}/${query}`);
  }

  next();
});

app.use(express.static(DIST, {
  index: "index.html",
  etag: true,
  lastModified: true,
  redirect: true,
  setHeaders(res, filePath) {
    const extension = extname(filePath).toLowerCase();

    if (extension === ".html") {
      res.setHeader("Cache-Control", "no-cache, must-revalidate");
      return;
    }

    if (longCacheExtensions.has(extension)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return;
    }

    res.setHeader("Cache-Control", "public, max-age=3600");
  },
}));

app.use((req, res) => {
  const normalizedPath = req.path === "/" ? "/" : req.path.replace(/\/$/, "");
  const isKnown = !knownPaths || knownPaths.has(normalizedPath);

  res.setHeader("Cache-Control", "no-cache, must-revalidate");

  if (isKnown) {
    const routeFile = normalizedPath === "/"
      ? join(DIST, "index.html")
      : join(DIST, normalizedPath.slice(1), "index.html");

    if (existsSync(routeFile)) {
      return res.sendFile(routeFile);
    }
  }

  return res.status(404).sendFile(join(DIST, "index.html"));
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Taxi B&B static server on :${PORT} (canonical redirects + HSTS + cache headers enabled, ` +
      `serverseitige Zaehlung ${COUNTING_ENABLED ? "aktiv" : "aus - PAGEVIEW_SINK_URL/PAGEVIEW_SINK_TOKEN fehlen"})`,
  );
});

if (COUNTING_ENABLED) {
  const flushTimer = setInterval(() => {
    void flushCounters();
  }, FLUSH_INTERVAL_MS);
  flushTimer.unref();

  // Railway schickt SIGTERM vor jedem Neustart. Ohne diesen letzten Flush
  // waere die angefangene Minute bei jedem Deploy verloren.
  let shuttingDown = false;
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      if (shuttingDown) return;
      shuttingDown = true;
      clearInterval(flushTimer);
      void flushCounters().finally(() => {
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(0), 3_000).unref();
      });
    });
  }
}
