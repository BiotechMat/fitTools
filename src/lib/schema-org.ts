import type { ToolConfig } from "@/registry/types";
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
    url: `${SITE_URL}/${tool.slug}`,
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

export function faqPageJsonLd(tool: ToolConfig): FaqPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map(({ q, a }) => ({
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
