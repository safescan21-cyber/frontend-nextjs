// Product search shared by the shop page (?search=) and the search page (/search?q=).
// Menu links send phrases like "Tablet Press Machines" or "Dryers & Sifters".
// Ignore words that only say what *kind* of thing it is (and one-letter words),
// match singular/plural, and look in the name, category and description.
export const GENERIC_WORDS = new Set(['machine', 'machines', 'equipment', 'system', 'systems', 'line', 'lines', 'unit', 'units', 'and', 'the', 'for', 'of', 'with']);
export const stem = (w) => w.replace(/(ss|sh|ch|x)es$/, '$1').replace(/([^s])s$/, '$1');
export const searchWords = (term) => {
  const words = term.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !GENERIC_WORDS.has(w)).map(stem);
  return words.length ? words : [term.toLowerCase().trim()];
};
export const tokens = (text) => String(text || '').replace(/<[^>]+>/g, ' ').replace(/-/g, ' ').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
// A search word matches the start of a word in the text: "press" finds "presses", not "spray"
export const countHits = (words, toks) => words.filter((w) => toks.some((t) => t.startsWith(w))).length;
// Ranking: a match in the category counts most, then the name, then the description
export const scoreProduct = (p, words) => {
  const name = tokens(p.name);
  const category = tokens(p.category);
  const any = countHits(words, [...name, ...category, ...tokens(p.description)]);
  return { any, rank: countHits(words, category) * 3 + countHits(words, name) * 2 + any };
};

// Products matching every word first, best matches first. When nothing matches every
// word, the closest matches instead of an empty page.
export const rankProducts = (list, term) => {
  const words = searchWords(term);
  const scored = list.map((p) => ({ p, s: scoreProduct(p, words) })).filter((x) => x.s.any > 0);
  const exact = scored.filter((x) => x.s.any === words.length);
  return (exact.length ? exact : scored).sort((a, b) => b.s.rank - a.s.rank).map((x) => x.p);
};

// Pharma APIs: name, chemical name, CAS number, composition and category
export const rankApis = (list, term) =>
  rankProducts(
    list.map((a) => ({ ...a, description: [a.chemicalName, a.casNumber, a.composition, a.molecularFormula].filter(Boolean).join(' ') })),
    term,
  );

// 'tablet-press' -> 'Tablet Press'
export const categoryLabel = (slug) => String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
