import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "dist", "public");
const origin = "https://www.taxibbessen.de";
const organizationId = `${origin}/#organization`;
const websiteId = `${origin}/#website`;

const routes = [
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
];

const removedKeys = new Set([
  "aggregateRating",
  "review",
  "geo",
  "paymentAccepted",
  "currenciesAccepted",
  "medicalSpecialty",
  "datePublished",
  "dateModified",
  "numberOfEmployees",
  "priceRange",
  "offers",
  "priceSpecification",
  "sameAs",
]);

function normalizeLocalUrl(value) {
  if (typeof value !== "string") return value;

  let normalized = value.replaceAll("https://taxibbessen.de", origin);
  normalized = normalized.replaceAll(`${origin}/#localbusiness`, organizationId);
  normalized = normalized.replaceAll(`${origin}/#organization`, organizationId);
  normalized = normalized.replaceAll(`${origin}/#website`, websiteId);

  if (!normalized.startsWith(origin)) return normalized;
  if (normalized.includes("#") || normalized.includes("?")) return normalized;
  if (/\.[a-z0-9]{2,5}$/i.test(normalized)) return normalized;
  if (normalized === origin) return `${origin}/`;
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function normalizeType(value) {
  if (typeof value === "string") {
    if (value === "MedicalBusiness" || value === "MedicalTherapy") {
      return "Service";
    }
    return value;
  }

  if (Array.isArray(value)) {
    return [...new Set(value.map(normalizeType))];
  }

  return value;
}

function dedupeGraph(items) {
  const seenIds = new Set();
  return items.filter((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return true;
    const id = item["@id"];
    if (typeof id !== "string") return true;
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });
}

function sanitize(value, parentKey = "") {
  if (Array.isArray(value)) {
    const filtered = value.filter((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return true;
      return !(
        item["@type"] === "Question" &&
        item.name === "Muss ich die Fahrt vorab bezahlen?"
      );
    });
    const sanitized = filtered.map((item) => sanitize(item, parentKey)).filter(Boolean);
    return parentKey === "@graph" ? dedupeGraph(sanitized) : sanitized;
  }

  if (!value || typeof value !== "object") {
    return normalizeLocalUrl(value);
  }

  const currentId = normalizeLocalUrl(value["@id"]);
  if (typeof currentId === "string" && currentId.endsWith("#founder")) {
    return null;
  }

  const result = {};

  for (const [key, child] of Object.entries(value)) {
    if (removedKeys.has(key)) continue;

    if (key === "@id") {
      result[key] = currentId;
      continue;
    }

    if (key === "@type") {
      result[key] = normalizeType(child);
      continue;
    }

    if ((key === "provider" || key === "seller") && child && typeof child === "object") {
      result[key] = { "@id": organizationId };
      continue;
    }

    const cleaned = sanitize(child, key);
    if (cleaned !== null && cleaned !== undefined) {
      result[key] = cleaned;
    }
  }

  return result;
}

function sanitizeHtml(html) {
  return html.replace(
    /(<script[^>]+type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
    (block, open, body, close) => {
      try {
        const data = JSON.parse(body.trim());
        const cleaned = sanitize(data);
        if (!cleaned) return "";
        return `${open}\n${JSON.stringify(cleaned, null, 2)}\n${close}`;
      } catch {
        return block;
      }
    },
  );
}

for (const relativePath of routes) {
  const path = join(root, relativePath);
  if (!existsSync(path)) continue;
  writeFileSync(path, sanitizeHtml(readFileSync(path, "utf8")), "utf8");
}

console.log("Structured data normalized to one verified organization entity");
