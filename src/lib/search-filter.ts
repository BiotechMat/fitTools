/**
 * Matching logic for the type-to-filter card search on hub pages
 * (src/components/CardSearch.tsx). Word-prefix semantics: a query matches
 * when it starts at a word boundary of the card's text, so "c" narrows to
 * Creatine and Vitamin C rather than every card containing a "c".
 */

/** Lowercase, fold diacritics/unicode digits, collapse punctuation to spaces. */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** True when the query starts at a word boundary of the text (or is blank). */
export function matchesSearch(text: string, query: string): boolean {
  const q = normalizeSearchText(query);
  if (q === "") return true;
  return ` ${normalizeSearchText(text)}`.includes(` ${q}`);
}
