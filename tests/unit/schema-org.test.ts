import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webApplicationJsonLd,
} from "@/lib/schema-org";
import { tdeeConfig } from "@/registry/configs/tdee";
import { SITE_URL } from "@/lib/site";

/**
 * SPEC §9: JSON-LD per tool — WebApplication (+ offers: free), FAQPage from
 * config FAQ, BreadcrumbList. These tests assert the fields Google's
 * structured-data documentation requires for each type.
 */

describe("webApplicationJsonLd", () => {
  const jsonLd = webApplicationJsonLd(tdeeConfig);

  it("declares a schema.org WebApplication", () => {
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("WebApplication");
    expect(jsonLd.name).toBe(tdeeConfig.title);
    expect(jsonLd.description).toBe(tdeeConfig.metaDescription);
  });

  it("uses an absolute canonical URL", () => {
    expect(jsonLd.url).toBe(`${SITE_URL}/${tdeeConfig.slug}`);
    expect(jsonLd.url.startsWith("http")).toBe(true);
  });

  it("includes the Google-required SoftwareApplication fields", () => {
    // Rich results for software require applicationCategory and
    // operatingSystem alongside offers.
    expect(jsonLd.applicationCategory).toBe("HealthApplication");
    expect(jsonLd.operatingSystem).toBe("Any");
  });

  it("declares a free offer", () => {
    expect(jsonLd.offers).toEqual({
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    });
  });

  it("serialises without undefined values", () => {
    expect(JSON.parse(JSON.stringify(jsonLd))).toEqual(jsonLd);
  });
});

describe("faqPageJsonLd", () => {
  const jsonLd = faqPageJsonLd(tdeeConfig);

  it("declares a schema.org FAQPage", () => {
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("FAQPage");
  });

  it("maps every config FAQ entry to a Question with an accepted answer", () => {
    expect(jsonLd.mainEntity).toHaveLength(tdeeConfig.faq.length);
    for (const [i, question] of jsonLd.mainEntity.entries()) {
      expect(question["@type"]).toBe("Question");
      expect(question.name).toBe(tdeeConfig.faq[i].q);
      expect(question.acceptedAnswer["@type"]).toBe("Answer");
      expect(question.acceptedAnswer.text).toBe(tdeeConfig.faq[i].a);
    }
  });
});

describe("breadcrumbJsonLd", () => {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Nutrition", path: "/nutrition" },
    { name: "TDEE Calculator", path: "/tdee-calculator" },
  ]);

  it("declares a schema.org BreadcrumbList", () => {
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
  });

  it("numbers positions sequentially from 1 with absolute item URLs", () => {
    expect(jsonLd.itemListElement).toHaveLength(3);
    for (const [i, item] of jsonLd.itemListElement.entries()) {
      expect(item["@type"]).toBe("ListItem");
      expect(item.position).toBe(i + 1);
      expect(item.item.startsWith("http")).toBe(true);
    }
    expect(jsonLd.itemListElement[2].name).toBe("TDEE Calculator");
    expect(jsonLd.itemListElement[2].item).toBe(`${SITE_URL}/tdee-calculator`);
  });
});
