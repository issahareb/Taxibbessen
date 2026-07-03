import type { ReactNode } from "react";

export type ContentSection = { h2: string; body: ReactNode };
export type FaqItem = { q: string; a: string };

export type PageContent = {
  path: string;
  h1: string;
  badge: string;
  intro: string;
  sections: ContentSection[];
  faq: FaqItem[];
};
