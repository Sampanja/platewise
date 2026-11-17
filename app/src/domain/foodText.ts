import { foldText } from './fuzzy';

/**
 * Local free-text meal parsing ("kaksi ruisleipää juustolla ja kahvi
 * maidolla", "2 dl milk", "två skivor rågbröd med ost") for the UI phase.
 * Pure and unit tested (foodText.test.ts). It finds amounts, common units and
 * food words in Finnish, English and Swedish; the food words are matched to
 * the closed food list by the caller. The backend phase can replace or add to
 * this through services/foodTextParser.ts, but foods still come from the list
 * and nutrients from the food table.
 */

export type UnitKind = 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'dl' | 'l' | 'tbsp' | 'tsp' | 'slice' | 'piece' | 'glass' | 'cup' | 'serving';

/** One food mentioned in the text. */
export type FoodPhrase = {
  /** The words as typed, for showing what was understood. */
  text: string;
  /** Words to match against food names. */
  query: string;
  quantity: number;
  unit: UnitKind | null;
  /** Size word ("iso", "small", "liten"): multiplies a portion. */
  size: number;
  /**
   * When an adessive split this part into several foods ("kahvi maidolla"), the
   * first of them carries the unsplit phrase and how many phrases it would
   * replace: a food named exactly so ("Kahvi maidolla") wins over the split.
   */
  whole?: { phrase: FoodPhrase; replaces: number };
};

const NUMBER_WORDS: Readonly<Record<string, number>> = {
  // Finnish
  yksi: 1, yhden: 1, yhta: 1, kaksi: 2, kahden: 2, kahta: 2, kolme: 3, kolmen: 3, nelja: 4, viisi: 5, kuusi: 6,
  seitseman: 7, kahdeksan: 8, yhdeksan: 9, kymmenen: 10, puoli: 0.5, puolikas: 0.5, puolikkaan: 0.5, pari: 2,
  // English
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  half: 0.5, couple: 2,
  // Swedish
  en: 1, ett: 1, tva: 2, tre: 3, fyra: 4, fem: 5, sex: 6, sju: 7, atta: 8, nio: 9, tio: 10, halv: 0.5, halva: 0.5,
};

const UNIT_WORDS: Readonly<Record<string, UnitKind>> = Object.fromEntries(
  (
    [
      ['g', ['g', 'gr', 'gramma', 'grammaa', 'gram', 'grams', 'gramm', 'grammes']],
      ['kg', ['kg', 'kilo', 'kiloa', 'kilos']],
      // Ounces and pounds: people who use US units say them out loud too.
      ['oz', ['oz', 'ounce', 'ounces', 'unssi', 'unssia', 'uns']],
      ['lb', ['lb', 'lbs', 'pound', 'pounds', 'pauna', 'paunaa', 'pund']],
      ['ml', ['ml']],
      ['dl', ['dl', 'desi', 'desia', 'desilitra', 'desilitraa', 'deciliter', 'decilitre']],
      ['l', ['l', 'litra', 'litraa', 'liter', 'litre', 'litres', 'liters']],
      ['tbsp', ['rkl', 'ruokalusikka', 'ruokalusikallinen', 'ruokalusikallista', 'tbsp', 'tablespoon', 'tablespoons', 'msk', 'matsked']],
      ['tsp', ['tl', 'teelusikka', 'teelusikallinen', 'teelusikallista', 'tsp', 'teaspoon', 'teaspoons', 'tsk', 'tesked']],
      ['slice', ['viipale', 'viipaletta', 'viipaleen', 'siivu', 'siivua', 'slice', 'slices', 'skiva', 'skivor']],
      ['piece', ['kpl', 'kappale', 'kappaletta', 'pcs', 'piece', 'pieces', 'st', 'styck', 'stycken', 'pala', 'palaa']],
      ['glass', ['lasi', 'lasia', 'lasillinen', 'lasillista', 'glass', 'glasses', 'glas']],
      ['cup', ['kuppi', 'kuppia', 'kupillinen', 'kupillista', 'muki', 'mukillinen', 'mukillista', 'cup', 'cups', 'mug', 'mugs', 'kopp', 'koppar', 'mugg']],
      ['serving', ['annos', 'annosta', 'annoksen', 'kulho', 'kulhollinen', 'kulhollista', 'lautasellinen', 'lautasellista', 'portion', 'portions', 'serving', 'servings', 'bowl', 'bowls', 'portioner', 'skal', 'tallrik']],
    ] as [UnitKind, string[]][]
  ).flatMap(([unit, words]) => words.map((word) => [word, unit])),
);

/** Grams (or ml, density ~1) of one unit, when the food has no matching portion. */
const UNIT_GRAMS: Partial<Record<UnitKind, number>> = { g: 1, kg: 1000, oz: 28.35, lb: 453.6, ml: 1, dl: 100, l: 1000, tbsp: 15, tsp: 5, glass: 200, cup: 200 };

/** Words in portion labels that mean the same unit, in every language. */
export const UNIT_LABEL_WORDS: Partial<Record<UnitKind, readonly string[]>> = {
  slice: ['viipale', 'slice', 'skiva'],
  glass: ['lasi', 'glass', 'glas'],
  cup: ['kuppi', 'muki', 'cup', 'mug', 'kopp', 'mugg'],
  serving: ['annos', 'serving', 'portion', 'kulho', 'bowl', 'skal'],
};

const SIZE_WORDS: Readonly<Record<string, number>> = {
  iso: 1.5, ison: 1.5, isoa: 1.5, suuri: 1.5, large: 1.5, big: 1.5, stor: 1.5, stora: 1.5, stort: 1.5,
  pieni: 0.7, pienen: 0.7, pienta: 0.7, small: 0.7, little: 0.7, liten: 0.7, lilla: 0.7, litet: 0.7,
};

/** Words that carry no food meaning. */
const FILLER = new Set(['of', 'the', 'a', 'an', 'some', 'av', 'lite', 'vahan', 'noin', 'about', 'ca', 'n', 'my', 'min', 'mitt', 'jotain', 'joku']);

/** Words that separate foods. "with/med" and Finnish "-lla/-llä" (adessive) add a food. */
const SEPARATORS = /\s*(,|;|\+|&|\band\b|\bja\b|\bseka\b|\bplus\b|\boch\b|\bsamt\b|\bwith\b|\bmed\b)\s*/;
/** Separators after which the food goes with the previous one ("leipä with cheese"). */
const TOPPING_SEPARATORS = new Set(['with', 'med']);

/** Finnish adessive ("juustolla", "maidolla"): a food on or with the previous one. */
function isAdessive(word: string): boolean {
  return word.length > 5 && /(lla|lle)$/.test(word);
}

function parseNumber(word: string): number | null {
  const normalized = word.replace(',', '.');
  if (/^\d+(\.\d+)?$/.test(normalized)) return Number(normalized);
  const fraction = /^(\d+)\/(\d+)$/.exec(normalized);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  return NUMBER_WORDS[word] ?? null;
}

/** "100g", "2dl": a number glued to a unit. */
function splitGlued(word: string): string[] {
  const match = /^(\d+(?:[.,]\d+)?)([a-z]+)$/.exec(word);
  return match && UNIT_WORDS[match[2]] ? [match[1], match[2]] : [word];
}

function phraseFrom(words: readonly string[], original: string): FoodPhrase | null {
  let quantity: number | null = null;
  let unit: UnitKind | null = null;
  let size = 1;
  const rest: string[] = [];
  for (const word of words) {
    const number = parseNumber(word);
    if (number !== null && rest.length === 0 && quantity === null) {
      quantity = number;
      continue;
    }
    if (number !== null && quantity !== null && rest.length === 0 && number < 1) {
      // "1 1/2" or "yksi puoli"
      quantity += number;
      continue;
    }
    if (UNIT_WORDS[word] && unit === null && rest.length === 0) {
      unit = UNIT_WORDS[word];
      continue;
    }
    if (SIZE_WORDS[word] && rest.length === 0) {
      size = SIZE_WORDS[word];
      continue;
    }
    if (FILLER.has(word)) continue;
    rest.push(word);
  }
  if (rest.length === 0) return null;
  return { text: original.trim(), query: rest.join(' '), quantity: quantity ?? 1, unit, size };
}

/** Splits free text into food phrases with amounts. */
export function splitFoodText(text: string): FoodPhrase[] {
  const phrases: FoodPhrase[] = [];
  // Accents folded first (word boundaries are ASCII); a decimal comma is not a separator.
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/(\d),(\d)/g, '$1.$2');
  // split() with a capture group alternates parts and the separators between them.
  const pieces = normalized.split(SEPARATORS);
  for (let index = 0; index < pieces.length; index += 2) {
    const part = pieces[index];
    const topping = index > 0 && TOPPING_SEPARATORS.has(pieces[index - 1]);
    if (!part || !part.trim()) continue;
    // Like foldText, but a decimal point or a fraction slash inside a number survives ("1.5", "1/2").
    const words = part
      .replace(/[^a-z0-9./]+/g, ' ')
      .split(' ')
      .map((word) => word.replace(/^[./]+|[./]+$/g, ''))
      .filter(Boolean)
      .flatMap(splitGlued);
    const before = phrases[phrases.length - 1] ?? null;
    const start = phrases.length;
    // "ruisleipää juustolla": split before each adessive word, which becomes its own food.
    let current: string[] = [];
    let first = true;
    const flush = (inheritFrom: FoodPhrase | null) => {
      const phrase = phraseFrom(current, current.join(' '));
      current = [];
      if (!phrase) return;
      const from = inheritFrom ?? (first && topping ? before : null);
      first = false;
      // A topping counts once per piece of the food it is on ("two breads with cheese" → two cheese slices).
      if (from && phrase.quantity === 1 && phrase.unit === null && (from.unit === null || from.unit === 'slice' || from.unit === 'piece')) {
        phrase.quantity = from.quantity;
      }
      phrases.push(phrase);
    };
    for (const word of words) {
      if (isAdessive(word) && current.length > 0) {
        flush(null);
        const main = phrases[phrases.length - 1] ?? null;
        current = [word];
        flush(main);
        continue;
      }
      current.push(word);
    }
    flush(null);
    const whole = phrases.length - start > 1 ? phraseFrom(words, words.join(' ')) : null;
    if (whole) phrases[start].whole = { phrase: whole, replaces: phrases.length - start };
  }
  return phrases;
}

/**
 * Query variants for a Finnish, English or Swedish food word: the word itself
 * and the base form after common endings and consonant gradation
 * ("maidolla" → "maito", "ruisleipää" → "ruisleipa", "tomatoes" → "tomato").
 */
export function queryVariants(query: string): string[] {
  const words = query.split(' ');
  const last = words[words.length - 1];
  const head = words.slice(0, -1);
  const stems = new Set<string>([last]);
  const strip = [/(lla|lle|lta|ssa|sta|aan)$/, /(ta|na|ksi|ja|ia|ua|ya|ea)$/, /(a|n|t)$/, /(ies)$/, /(es|s)$/, /(er|or|ar|en|et)$/];
  for (const pattern of strip) {
    const stem = last.replace(pattern, '');
    if (stem.length >= 3 && stem !== last) stems.add(stem);
  }
  // Finnish consonant gradation back to the base form.
  for (const stem of [...stems]) {
    if (/d[aeiouy]?$/.test(stem)) stems.add(stem.replace(/d([aeiouy]?)$/, 't$1'));
    if (/v[aeiouy]?$/.test(stem)) stems.add(stem.replace(/v([aeiouy]?)$/, 'p$1'));
    if (stem.endsWith('ie')) stems.add(`${stem.slice(0, -1)}`);
  }
  return [...stems].map((stem) => [...head, stem].join(' '));
}

export type PortionInfo = { grams: number; labels: readonly string[] };

/**
 * Grams for a phrase: weights and volumes directly, otherwise the food's
 * portion that names the unit (slice, glass…), else its first portion.
 */
/** Units that are an amount by themselves (no portion needed). */
const MEASURED: ReadonlySet<UnitKind> = new Set(['g', 'kg', 'oz', 'lb', 'ml', 'dl', 'l', 'tbsp', 'tsp']);

export function phraseGrams(phrase: FoodPhrase, portions: readonly PortionInfo[]): number {
  const { quantity, unit, size } = phrase;
  if (unit && MEASURED.has(unit)) {
    return Math.round(quantity * (UNIT_GRAMS[unit] ?? 1));
  }
  const words = unit ? (UNIT_LABEL_WORDS[unit] ?? []) : [];
  const named = words.length > 0 ? portions.find((p) => p.labels.some((label) => words.some((w) => foldText(label).includes(w)))) : undefined;
  const portion = named ?? portions[0];
  const base = portion ? portion.grams : unit ? (UNIT_GRAMS[unit] ?? 100) : 100;
  return Math.max(1, Math.round(quantity * base * size));
}
