import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { routeConfigs, indexableRoutes } from "../src/routes";
import { canonicalUrl } from "./prerender-config.mts";
import { renderRoute } from "./prerender-html.mts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist", "public");
const TEMPLATE_PATH = join(DIST, "index.html");
const template = readFileSync(TEMPLATE_PATH, "utf8");

for (const route of routeConfigs) {
  const outputPath = route.path === "/"
    ? TEMPLATE_PATH
    : join(DIST, route.path.slice(1), "index.html");

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    renderRoute(template, route.path, route.indexable),
    "utf8",
  );
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...indexableRoutes.map(({ path }) => [
    "  <url>",
    `    <loc>${canonicalUrl(path)}</loc>`,
    "  </url>",
  ].join("\n")),
  "</urlset>",
  "",
].join("\n");

writeFileSync(join(DIST, "sitemap.xml"), sitemap, "utf8");
writeFileSync(
  join(DIST, "_routes.json"),
  JSON.stringify(routeConfigs.map(({ path }) => path), null, 2),
  "utf8",
);

console.log(
  `Prerendered ${routeConfigs.length} routes with one organization entity and ${indexableRoutes.length} sitemap URLs`,
);
