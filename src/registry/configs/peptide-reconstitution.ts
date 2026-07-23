import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  PEPTIDE_DEFAULTS,
  PEPTIDE_LIMITS,
  PEPTIDE_SLUG,
} from "@/registry/configs/peptide-reconstitution.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const peptideInputsSchema = z.object({
  vialMg: limit(PEPTIDE_LIMITS.vialMg),
  diluentMl: limit(PEPTIDE_LIMITS.diluentMl),
  doseMcg: limit(PEPTIDE_LIMITS.doseMcg),
});

export const peptideConfig: ToolConfig = {
  slug: PEPTIDE_SLUG,
  title: "Peptide Reconstitution Calculator",
  valueLine:
    "Arithmetic only: concentration, draw volume and U-100 syringe units from values you supply.",
  metaDescription:
    "Reconstitution calculator for research and prescribed peptides: concentration from vial and diluent, draw volume and U-100 units from your prescribed dose. Arithmetic only, with no dosing guidance.",
  hub: "nutrition",
  tier: 4,
  inputsSchema: peptideInputsSchema,
  defaults: { ...PEPTIDE_DEFAULTS },
  faq: [
    {
      q: "How do I calculate peptide reconstitution?",
      a: "Concentration = vial contents (mg) ÷ diluent added (ml). Draw volume = your prescribed dose ÷ that concentration, and a U-100 syringe reads 100 units per ml. This tool performs exactly that arithmetic on numbers you supply.",
    },
    {
      q: "Why doesn't this tool suggest doses?",
      a: "Deliberately. Dosing belongs to your prescriber, so the calculator carries no compound presets and no dose suggestions, and only converts values you already have into volumes and syringe units.",
    },
    {
      q: "What is a U-100 syringe?",
      a: "A syringe calibrated so that 100 units equal 1 ml. The unit markings measure volume, not drug amount, so the same unit count contains different amounts depending on your concentration, which is why this arithmetic matters.",
    },
    {
      q: "Does the diluent amount change the dose?",
      a: "No, it changes the concentration, and therefore the volume you draw for the same dose. More diluent means larger, easier-to-measure draw volumes; the drug amount per dose stays whatever your prescriber set.",
    },
  ],
  related: [],
  monetization: { ads: false, affiliates: false },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "NHS: injection technique and medicines guidance (general reference)",
      url: "https://www.nhs.uk/medicines/",
    },
    {
      label: "U-100 syringe standard: 100 units = 1 ml (ISO 8537 insulin syringes)",
      url: "https://www.iso.org/standard/64386.html",
    },
  ],
};
