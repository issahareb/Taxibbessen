export const SITE_ORIGIN = "https://www.taxibbessen.de";
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;

export const BUSINESS = {
  name: "Taxi B&B GmbH",
  legalName: "Taxi B&B GmbH",
  telephone: "+49-201-707060",
  telephoneDisplay: "0201 707060",
  email: "taxibb@outlook.com",
  foundingYear: "1992",
  register: "HRB 36284 Amtsgericht Essen",
  address: {
    streetAddress: "Menzelstraße 8-10",
    postalCode: "45147",
    addressLocality: "Essen",
    addressRegion: "Nordrhein-Westfalen",
    addressCountry: "DE",
  },
} as const;

export function canonicalUrl(path: string): string {
  if (!path || path === "/") return `${SITE_ORIGIN}/`;
  const normalized = `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `${SITE_ORIGIN}${normalized}/`;
}

export const organizationRef = { "@id": ORGANIZATION_ID } as const;

export function createServiceSchema({
  name,
  path,
  description,
  areaServed,
}: {
  name: string;
  path: string;
  description: string;
  areaServed: string[];
}) {
  const url = canonicalUrl(path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name,
        url,
        description,
        serviceType: name,
        provider: organizationRef,
        areaServed: areaServed.map((place) => ({
          "@type": "Place",
          name: place,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Startseite",
            item: canonicalUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name,
            item: url,
          },
        ],
      },
    ],
  } as const;
}
