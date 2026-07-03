import { renderToStaticMarkup } from "react-dom/server";
import { getPageMeta } from "../src/page-meta-manifest";
import { PRERENDER_CONTENT } from "../src/content";
import { HOME_FAQ } from "../src/content/home";
import type { FaqItem, PageContent } from "../src/content/types";
import {
  ORGANIZATION_ID,
  ORIGIN,
  WEBSITE_ID,
  canonicalUrl,
  fallbackHeadings,
  fallbackLinks,
  serviceNames,
} from "./prerender-config.mts";

function getRouteFaq(path: string): FaqItem[] | undefined {
  if (path === "/") return HOME_FAQ;
  const faq = PRERENDER_CONTENT[path]?.faq;
  return faq && faq.length > 0 ? faq : undefined;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setTitle(html: string, title: string): string {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

function setMeta(html: string, name: string, content: string): string {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, "i");
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}

function routeSchema(path: string, title: string, description: string) {
  const url = canonicalUrl(path);
  const faq = getRouteFaq(path);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: "de-DE",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORGANIZATION_ID },
    },
  ];

  const serviceName = serviceNames[path];
  if (serviceName) {
    graph.push(
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: serviceName,
        url,
        description,
        serviceType: serviceName,
        provider: { "@id": ORGANIZATION_ID },
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Essen und Ruhrgebiet",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: serviceName, item: url },
        ],
      },
    );
  }

  if (faq) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function createHeadTags(path: string, title: string, description: string): string {
  const url = canonicalUrl(path);
  const schema = JSON.stringify(routeSchema(path, title, description), null, 2);

  return [
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" hreflang="de" href="${url}" />`,
    `<link rel="alternate" hreflang="x-default" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<script type="application/ld+json" data-route-schema>\n${schema}\n</script>`,
  ].map((tag) => `    ${tag}`).join("\n");
}

const STATIC_CONTENT_ID = "prerender-static-content";

function renderFaqHtml(faq: FaqItem[]): string {
  const items = faq
    .map(
      ({ q, a }) =>
        `    <section>\n      <h3>${escapeHtml(q)}</h3>\n      <p>${escapeHtml(a)}</p>\n    </section>`,
    )
    .join("\n");
  return `  <section aria-label="Häufige Fragen">\n    <h2>Häufige Fragen</h2>\n${items}\n  </section>`;
}

function renderNavAndContact(): string {
  const links = fallbackLinks
    .map(([href, label]) => `<a href="${canonicalUrl(href)}">${escapeHtml(label)}</a>`)
    .join(" · ");
  return [
    `  <p>Taxi B&amp;B GmbH · Menzelstraße 8-10 · 45147 Essen · Telefon <a href="tel:+49201707060">0201 707060</a></p>`,
    `  <nav aria-label="Wichtige Seiten">${links}</nav>`,
  ].join("\n");
}

function createStaticContent(path: string): string | null {
  const meta = getPageMeta(path);
  const faq = getRouteFaq(path);
  const content: PageContent | undefined = PRERENDER_CONTENT[path];

  if (!content && path !== "/") return null;

  const h1 = content?.h1 ?? fallbackHeadings[path] ?? meta.title.split("|")[0].trim();
  const intro = content?.intro ?? meta.description;

  const parts: string[] = [
    `  <h1>${escapeHtml(h1)}</h1>`,
    `  <p>${escapeHtml(intro)}</p>`,
  ];

  for (const section of content?.sections ?? []) {
    parts.push(`  <section>\n    <h2>${escapeHtml(section.h2)}</h2>\n${renderToStaticMarkup(section.body)}\n  </section>`);
  }

  if (faq) {
    parts.push(renderFaqHtml(faq));
  }

  parts.push(renderNavAndContact());

  return [
    `<div id="${STATIC_CONTENT_ID}">`,
    `<article>`,
    parts.join("\n"),
    `</article>`,
    `</div>`,
    `<script>document.getElementById(${JSON.stringify(STATIC_CONTENT_ID)}).remove();</script>`,
  ].join("\n");
}

function createFallback(path: string, description: string): string {
  const heading = fallbackHeadings[path] ?? getPageMeta(path).title.split("|")[0].trim();
  const links = fallbackLinks
    .map(([href, label]) => `<a href="${canonicalUrl(href)}">${escapeHtml(label)}</a>`)
    .join(" · ");

  return [
    `<section class="prerender-seo" aria-label="Seiteninhalt ohne JavaScript">`,
    `  <h1>${escapeHtml(heading)}</h1>`,
    `  <p>${escapeHtml(description)}</p>`,
    `  <p>Taxi B&amp;B GmbH · Menzelstraße 8-10 · 45147 Essen · Telefon 0201 707060</p>`,
    `  <nav aria-label="Wichtige Seiten">${links}</nav>`,
    `</section>`,
  ].join("\n");
}

export function renderRoute(template: string, path: string, indexable: boolean): string {
  const meta = getPageMeta(path);
  let html = setTitle(template, meta.title);
  html = setMeta(html, "title", meta.title);
  html = setMeta(html, "description", meta.description);
  html = setMeta(html, "robots", indexable ? "index, follow" : "noindex, nofollow");

  if (indexable) {
    html = html.replace("</head>", `${createHeadTags(path, meta.title, meta.description)}\n  </head>`);
  }

  const staticContent = indexable ? createStaticContent(path) : null;

  return html.replace(
    "<!-- PRERENDER_NOSCRIPT_PLACEHOLDER -->",
    staticContent ?? createFallback(path, meta.description),
  );
}
