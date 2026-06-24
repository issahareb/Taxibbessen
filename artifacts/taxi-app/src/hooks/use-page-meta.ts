import { useEffect } from "react";
import { canonicalUrl } from "@/seo/business";

interface PageMeta {
  title: string;
  description: string;
  schemaOrg?: Record<string, unknown>;
  noindex?: boolean;
}

const DEFAULT_META = {
  title: "Taxi B&B Essen | Taxiservice seit 1992",
  description: "Taxi B&B GmbH in Essen: klassische Taxifahrten, Flughafentransfer, Krankenfahrten, Großraumtaxi und Kurierdienst. Rund um die Uhr erreichbar: 0201 707060.",
};

function setMetaContent(selector: string, createAttrs: [string, string], content: string) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(createAttrs[0], createAttrs[1]);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function serializeSchema(schemaOrg: Record<string, unknown>): string {
  return JSON.stringify(schemaOrg);
}

function hasPrerenderedSchemaForUrl(url: string): boolean {
  const withoutTrailingSlash = url.replace(/\/$/, "");

  return Array.from(
    document.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]:not([data-schema])',
    ),
  ).some((script) => {
    const text = script.textContent ?? "";
    return text.includes(`"${url}"`) || text.includes(`"${withoutTrailingSlash}"`);
  });
}

export function usePageMeta({ title, description, schemaOrg, noindex }: PageMeta) {
  useEffect(() => {
    const url = canonicalUrl(window.location.pathname);

    document.title = title;
    setMetaContent('meta[name="description"]', ["name", "description"], description);
    setMetaContent(
      'meta[name="robots"]',
      ["name", "robots"],
      noindex ? "noindex, nofollow" : "index, follow",
    );

    if (noindex) {
      document.querySelector('link[rel="canonical"]')?.remove();
      document
        .querySelectorAll('link[rel="alternate"][hreflang]')
        .forEach((element) => element.remove());
      document.querySelector<HTMLScriptElement>('script[data-schema="page-specific"]')?.remove();

      return () => {
        document.title = DEFAULT_META.title;
        setMetaContent('meta[name="description"]', ["name", "description"], DEFAULT_META.description);
        setMetaContent('meta[name="robots"]', ["name", "robots"], "index, follow");
      };
    }

    let canonicalElement = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement("link");
      canonicalElement.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute("href", url);

    for (const language of ["de", "x-default"] as const) {
      let alternate = document.querySelector<HTMLLinkElement>(
        `link[rel="alternate"][hreflang="${language}"]`,
      );
      if (!alternate) {
        alternate = document.createElement("link");
        alternate.setAttribute("rel", "alternate");
        alternate.setAttribute("hreflang", language);
        document.head.appendChild(alternate);
      }
      alternate.setAttribute("href", url);
    }

    setMetaContent('meta[property="og:url"]', ["property", "og:url"], url);
    setMetaContent('meta[property="og:title"]', ["property", "og:title"], title);
    setMetaContent('meta[property="og:description"]', ["property", "og:description"], description);
    setMetaContent('meta[name="twitter:title"]', ["name", "twitter:title"], title);
    setMetaContent('meta[name="twitter:description"]', ["name", "twitter:description"], description);

    let scriptElement = document.querySelector<HTMLScriptElement>(
      'script[data-schema="page-specific"]',
    );
    const hasPrerenderedSchema = hasPrerenderedSchemaForUrl(url);

    if (schemaOrg && !hasPrerenderedSchema) {
      if (!scriptElement) {
        scriptElement = document.createElement("script");
        scriptElement.setAttribute("type", "application/ld+json");
        scriptElement.setAttribute("data-schema", "page-specific");
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = serializeSchema(schemaOrg);
    } else {
      scriptElement?.remove();
    }

    return () => {
      document.title = DEFAULT_META.title;
      setMetaContent('meta[name="description"]', ["name", "description"], DEFAULT_META.description);
      setMetaContent('meta[name="robots"]', ["name", "robots"], "index, follow");
      setMetaContent('meta[property="og:title"]', ["property", "og:title"], DEFAULT_META.title);
      setMetaContent('meta[property="og:description"]', ["property", "og:description"], DEFAULT_META.description);
      setMetaContent('meta[name="twitter:title"]', ["name", "twitter:title"], DEFAULT_META.title);
      setMetaContent('meta[name="twitter:description"]', ["name", "twitter:description"], DEFAULT_META.description);
      document.querySelector<HTMLScriptElement>('script[data-schema="page-specific"]')?.remove();
    };
  }, [title, description, schemaOrg, noindex]);
}
