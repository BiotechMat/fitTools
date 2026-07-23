import type { FaqEntry, ToolConfig } from "@/registry/types";
import { toolPath } from "@/registry/tools";
import { SITE_URL } from "@/lib/site";

/**
 * JSON-LD generators (SPEC §9). Output is validated by unit tests against
 * Google's structured-data requirements for each type.
 */

export interface WebApplicationJsonLd {
  "@context": "https://schema.org";
  "@type": "WebApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: "HealthApplication";
  operatingSystem: "Any";
  offers: {
    "@type": "Offer";
    price: "0";
    priceCurrency: "GBP";
  };
}

export function webApplicationJsonLd(tool: ToolConfig): WebApplicationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    description: tool.metaDescription,
    url: `${SITE_URL}${toolPath(tool)}`,
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
  };
}

export interface FaqPageJsonLd {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }[];
}

export function faqPageJsonLd(source: { faq: FaqEntry[] }): FaqPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: source.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export interface PersonJsonLd {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  url: string;
  description: string;
  alumniOf: string;
  knowsAbout: string[];
}

/** Person JSON-LD for the author page (SPEC §9, §11 — accurate credentials only). */
export function personJsonLd(author: {
  name: string;
  path: string;
  credentials: string;
}): PersonJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${SITE_URL}${author.path}`,
    description: `Author and reviewer of FitTools calculators. ${author.credentials}.`,
    alumniOf: "University of Reading",
    knowsAbout: ["fitness calculators", "nutrition science", "exercise physiology"],
  };
}

export interface ArticleJsonLd {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: { "@type": "Person"; name: string; url: string };
  publisher: { "@type": "Organization"; name: string };
}

/** Article + Person JSON-LD for editorial/reference pages (SPEC §9). */
export function articleJsonLd(article: {
  title: string;
  description: string;
  path: string;
  lastReviewed: string;
  author: { name: string; path: string };
}): ArticleJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}${article.path}`,
    datePublished: article.lastReviewed,
    dateModified: article.lastReviewed,
    author: {
      "@type": "Person",
      name: article.author.name,
      url: `${SITE_URL}${article.author.path}`,
    },
    publisher: { "@type": "Organization", name: "FitTools" },
  };
}

export interface HowToJsonLd {
  "@context": "https://schema.org";
  "@type": "HowTo";
  name: string;
  description: string;
  step: { "@type": "HowToStep"; position: number; text: string }[];
}

/** HowTo JSON-LD for exercise "how to perform it" steps (CONTENT-reference §3). */
export function howToJsonLd(source: {
  name: string;
  description: string;
  steps: string[];
}): HowToJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: source.name,
    description: source.description,
    step: source.steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };
}

export interface BreadcrumbJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
}

export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
): BreadcrumbJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(({ name, path }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}${path === "/" ? "" : path}` || SITE_URL,
    })),
  };
}
