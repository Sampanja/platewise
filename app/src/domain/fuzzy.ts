/**
 * Small fuzzy text matching for the closed ingredient and food lists: the
 * pantry, free-text logging and recipe import all map words to catalog ids
 * with it. Deterministic and language-neutral; the AI step in the backend
 * phase only adds candidates, the final id always comes from the catalog.
 */

/** Lower case, accents folded (ä → a, é → e), punctuation to spaces. */
export function foldText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokens(text: string): string[] {
  const folded = foldText(text);
  return folded ? folded.split(' ') : [];
}

/** Levenshtein distance with an early exit above `max`. */
export function editDistance(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current.push(value);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > max) return max + 1;
    previous = current;
  }
  return previous[b.length];
}

/** Typos allowed for a word of this length. */
function allowedTypos(length: number): number {
  if (length <= 3) return 0;
  if (length <= 6) return 1;
  return 2;
}

/**
 * How well a query word matches one word of a name (0–1): exact 1, a prefix
 * 0.85 (Finnish and Swedish inflect and compound: "kerman" → "kerma"), a
 * word inside a compound 0.7 ("ruisleipä" contains "leipa"), a typo 0.6.
 */
function wordScore(query: string, word: string): number {
  if (query === word) return 1;
  let best = 0;
  const shorter = Math.min(query.length, word.length);
  const longer = Math.max(query.length, word.length);
  if (shorter >= 3 && (word.startsWith(query) || query.startsWith(word))) {
    if (shorter / longer >= 0.6) best = 0.85;
    // The user is still typing: a short prefix of a long word.
    else if (word.length > query.length) best = 0.75;
  }
  // The query inside a compound word ('leipa' in 'ruisleipa'), or a long word inside the query.
  if (query.length >= 4 && word.includes(query)) best = Math.max(best, 0.7);
  else if (word.length >= 5 && query.includes(word)) best = Math.max(best, 0.5);
  const typos = allowedTypos(shorter);
  if (typos > 0 && editDistance(query, word, typos) <= typos) best = Math.max(best, 0.6);
  // Inflected typo: compare the stems ('kanaa' vs 'kana', 'tomaatit' vs 'tomaatti').
  const stem = shorter - 1;
  if (stem >= 4 && editDistance(query.slice(0, stem), word.slice(0, stem), 1) <= 1) best = Math.max(best, 0.55);
  return best;
}

/**
 * Score (0–1) of a query against a name. Every query word must match some
 * word of the name; the score is their average, with a small bonus when the
 * name has no extra words (so "maito" prefers "Maito" to "Kaurajuoma, maito…").
 */
export function matchScore(query: string, name: string): number {
  const q = tokens(query);
  const n = tokens(name);
  if (q.length === 0 || n.length === 0) return 0;
  const whole = foldText(name);
  const phrase = foldText(query);
  if (whole === phrase) return 1;
  let total = 0;
  for (const word of q) {
    let best = 0;
    for (const candidate of n) best = Math.max(best, wordScore(word, candidate));
    // A query word may also sit inside a compound name ("leipä" in "ruisleipä").
    if (best === 0 && word.length >= 4 && whole.replace(/ /g, '').includes(word)) best = 0.65;
    if (best === 0) return 0;
    total += best;
  }
  const coverage = Math.min(1, q.length / n.length);
  return Math.min(0.99, (total / q.length) * (0.85 + 0.15 * coverage));
}

export type Scored<T> = { item: T; score: number };

/** The best matches of a query over items with several names each (e.g. one per language). */
export function bestMatches<T>(
  items: readonly T[],
  namesOf: (item: T) => readonly string[],
  query: string,
  { limit = 20, min = 0.5 }: { limit?: number; min?: number } = {},
): Scored<T>[] {
  if (!foldText(query)) return [];
  const out: Scored<T>[] = [];
  for (const item of items) {
    let score = 0;
    for (const name of namesOf(item)) score = Math.max(score, matchScore(query, name));
    if (score >= min) out.push({ item, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}
