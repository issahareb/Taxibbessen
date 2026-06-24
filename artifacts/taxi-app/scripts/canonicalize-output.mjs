import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "dist", "public");
const from = "https://taxibbessen.de";
const to = "https://www.taxibbessen.de";

const files = [
  "index.html",
  "book/index.html",
  "flughafentransfer-essen-duesseldorf/index.html",
  "krankenfahrten-essen/index.html",
  "grossraumtaxi-essen/index.html",
  "dialysefahrten-essen/index.html",
  "kurierdienst-essen/index.html",
  "taxi-essen-hbf/index.html",
  "fahrzeuge/index.html",
  "ueber-uns/index.html",
  "taxi-essen-holsterhausen/index.html",
  "taxi-essen-ruettenscheid/index.html",
  "taxi-essen-frohnhausen/index.html",
  "taxi-essen-suedviertel/index.html",
  "impressum/index.html",
  "agb/index.html",
  "datenschutz/index.html",
  "confirmation/index.html",
  "admin/index.html",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
];

function wrapPrerenderFallback(content) {
  const start = content.indexOf('<section class="prerender-seo"');
  if (start < 0) return content;

  const closingTag = "</section>";
  const end = content.indexOf(closingTag, start);
  if (end < 0) return content;

  const sectionEnd = end + closingTag.length;
  const section = content.slice(start, sectionEnd);
  return `${content.slice(0, start)}<noscript>${section}</noscript>${content.slice(sectionEnd)}`;
}

for (const relativePath of files) {
  const path = join(root, relativePath);
  if (!existsSync(path)) continue;

  let content = readFileSync(path, "utf8");
  content = content.replaceAll(from, to);

  if (relativePath.endsWith("index.html")) {
    content = wrapPrerenderFallback(content);
  }

  if (relativePath === "sitemap.xml") {
    content = content.replace(/^\s*<lastmod>[^<]*<\/lastmod>\s*\r?\n/gm, "");
  }

  writeFileSync(path, content, "utf8");
}

await import("./sanitize-schema-output.mjs");
await import("./validate-seo-output.mjs");
console.log(`Canonical URLs and no-script fallbacks normalized to ${to}`);
