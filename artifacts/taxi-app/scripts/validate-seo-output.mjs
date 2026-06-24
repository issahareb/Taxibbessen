import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "public");
const canonicalOrigin = "https://www.taxibbessen.de";

const bannedText = [
  "https://taxibbessen.de",
  '"MedicalBusiness"',
  '"MedicalTherapy"',
  "#localbusiness",
  '"aggregateRating"',
  '"paymentAccepted"',
  "Muss ich die Fahrt vorab bezahlen?",
  "EC-Karte",
  "Visa/Mastercard",
  "4,8 von 5 Sternen",
  "Gründerfamilie Barger & Beige",
  "Info@taxi-beige.de",
];

function collectFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? collectFiles(path) : [path];
  });
}

function validateCanonicalLinks(file, content, errors) {
  if (extname(file) !== ".html") return;

  const canonicalMatches = [
    ...content.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi),
  ];

  if (canonicalMatches.length > 1) {
    errors.push(`${relative(root, file)}: more than one canonical link`);
  }

  for (const match of canonicalMatches) {
    const url = match[1];
    if (!url.startsWith(`${canonicalOrigin}/`)) {
      errors.push(`${relative(root, file)}: invalid canonical host ${url}`);
    }
    if (!url.endsWith("/")) {
      errors.push(`${relative(root, file)}: canonical lacks trailing slash ${url}`);
    }
  }
}

function validatePrerenderFallback(file, content, errors) {
  if (extname(file) !== ".html") return;

  let position = content.indexOf('<section class="prerender-seo"');
  while (position >= 0) {
    const prefix = content.slice(Math.max(0, position - 30), position).trimEnd();
    if (!prefix.endsWith("<noscript>")) {
      errors.push(`${relative(root, file)}: prerender SEO section is visible outside noscript`);
    }
    position = content.indexOf('<section class="prerender-seo"', position + 1);
  }
}

function validateSitemap(file, content, errors) {
  if (!file.endsWith("sitemap.xml")) return;

  for (const match of content.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = match[1];
    if (!url.startsWith(`${canonicalOrigin}/`) || !url.endsWith("/")) {
      errors.push(`sitemap.xml: invalid URL ${url}`);
    }
  }

  if (content.includes("<lastmod>")) {
    errors.push("sitemap.xml: unreliable build-date lastmod must remain omitted");
  }
}

if (!existsSync(root)) {
  console.error(`SEO validation failed: build output missing at ${root}`);
  process.exit(1);
}

const errors = [];
const checkedExtensions = new Set([".html", ".xml", ".txt", ".js"]);

for (const file of collectFiles(root)) {
  if (!checkedExtensions.has(extname(file))) continue;
  const content = readFileSync(file, "utf8");
  const shortName = relative(root, file);

  for (const banned of bannedText) {
    if (content.includes(banned)) {
      errors.push(`${shortName}: contains banned SEO content: ${banned}`);
    }
  }

  validateCanonicalLinks(file, content, errors);
  validatePrerenderFallback(file, content, errors);
  validateSitemap(file, content, errors);
}

if (errors.length > 0) {
  console.error("\nSEO output validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error("");
  process.exit(1);
}

console.log("SEO output validation passed: canonical, schema, payment and trust signals are consistent");
