/**
 * Safety rules and test-data answers for the assistant chat. The real
 * implementation (Edge Function + Claude, docs/GENERATION.md) applies the
 * same safety classification before and after the model; these rules are
 * the deterministic floor that never depends on a prompt. The answers come
 * from the string tables (i18n `assistant`) in the active language.
 */

import { format, intlLocale, strings } from '@/i18n';
import { formatWater } from '@/lib/amounts';

export type SafetyTopic = 'eatingDisorder' | 'extremeDiet' | 'medical' | null;

/*
 * Patterns for every supported language are always checked, whatever the UI
 * language: people may write in another language than the app shows, and a
 * missed safety signal is worse than a stray match.
 */
const ED_PATTERNS = [
  // fi
  /oksen(n|t)/,
  /en (ole )?syönyt (mitään|koko päivänä|päivään|kahteen|kolmeen)/,
  /en syö mitään/,
  /\bpaast/,
  /ahmi/,
  /kompensoi/,
  /laksatiiv|ulostuslääk/,
  /inhoan (kehoani|itseäni)/,
  /liian lihava/,
  /pelkään syö/,
  /syömishäiriö/,
  // en
  /\b(throw(ing)? up|vomit|purg(e|ing))/,
  /\b(haven'?t|have not|didn'?t|did not|not) eaten (anything|all day|in (two|three|\d+) days)/,
  /\bnot eating (anything|at all)/,
  /\bstarv(e|ing) myself/,
  /\bbing(e|ing)/,
  /\blaxative/,
  /\bhate (my body|myself)/,
  /\b(too|so) fat\b/,
  /\bafraid (to|of) eat/,
  /\beating disorder|anorexi|bulimi/,
  // sv
  /\bkräk(s|as|er|t)|\bspyr/,
  /\binte ätit (något|på hela dagen|på (två|tre|\d+) dagar)/,
  /\bäter ingenting/,
  /\bsvälter mig/,
  /\bhetsät/,
  /\blaxer/,
  /\bhatar (min kropp|mig själv)/,
  /\bför tjock/,
  /\brädd (för )?att äta/,
  /\bätstörning/,
];
const EXTREME_PATTERNS = [
  /\b([1-9]\d{2}|[1-9]\d)\s*(kcal|calories|kalorier)/, // under 1000 kcal
  /\b(alle|vain|under|only|bara|endast) (1000|1 000|tuhat|thousand|tusen|800|500)/,
  /vesipaasto|mehupaasto|nestepaasto|water fast|juice (fast|cleanse)|vattenfasta|juicefasta/,
  /\d+\s*(kg|kiloa|kilos?|lbs?|pounds?)\s*(viikossa|kuukaudessa|a week|per week|a month|per month|in a month|i veckan|per vecka|i månaden|på en månad)/,
  /nopeasti laihdu|laihtua nopeasti|lose weight (fast|quickly)|gå ner i vikt snabbt|snabb viktnedgång/,
];
const MEDICAL_PATTERNS = [
  /diagno/,
  /lääk(e|keet|kkeet|kitys)|\bmedication|\bmedicine|läkemedel|\bmedicin/,
  /sairau|sairas|\bdisease|\billness|\bsjukdom|\bsjuk\b/,
  /diabet|verenpain|blood pressure|blodtryck|kolesterol|cholesterol|keliak|coeliac|celiac|celiaki|\bibs\b|refluks|reflux/,
  /oire|kipu|kipua|särk|\bsymptom|\bpain\b|\bache|\bont i\b|\bvärk/,
  /allerginen reaktio|anafyl|anaphyla|allergic reaction|allergisk reaktion/,
  /onko minulla|do i have|have i got|har jag /,
];

export function classifySafety(message: string): SafetyTopic {
  const text = message.toLowerCase();
  if (ED_PATTERNS.some((p) => p.test(text))) return 'eatingDisorder';
  if (EXTREME_PATTERNS.some((p) => p.test(text))) return 'extremeDiet';
  if (MEDICAL_PATTERNS.some((p) => p.test(text))) return 'medical';
  return null;
}

export type AssistantContext = {
  eaten: { kcal: number; proteinG: number; entries: string[] };
  goals: { kcal: number; proteinG: number } | null;
  waterMl: number;
  waterGoalMl: number;
  /** "Hide calories": the assistant must not mention numbers. */
  hideCalories: boolean;
} | null;

/**
 * A recipe the assistant may suggest. The caller passes only recipes that
 * passed isRecipeAllowed for the user, so a suggestion can never break their
 * allergies or diets (the backend applies the same gate server-side).
 */
export type RecipeHint = { id: string; title: string; proteinG: number; dinner: boolean; legumes: boolean };

export type Intent = 'proteinDinner' | 'weightSwings' | 'moreVeg' | 'leftovers' | 'water' | 'greeting' | 'unknown';

export function detectIntent(message: string): Intent {
  const text = message.toLowerCase();
  if (/proteiin|protein/.test(text)) return 'proteinDinner';
  if (
    /paino.*(heiluu|vaihtelee|nousi|nousee)|heiluu|weight.*(up and down|fluctuat|swing|jump)|vikt.*(svänger|varierar|ökade|ökar)|svänger/.test(text)
  ) {
    return 'weightSwings';
  }
  if (/kasvi|vihannes|hedelm|vegetable|veggie|\bfruit|grönsak|\bfrukt/.test(text) && /lisää|enemmän|saisin|\bmore\b|\bmer\b|få in/.test(text)) {
    return 'moreVeg';
  }
  if (/jää|tähtee|ylijää|hävik|leftover|left over|\bwaste|överbliv|\brester\b|matsvinn/.test(text)) return 'leftovers';
  if (/vet(tä|ta|ä)|juo|\bwater\b|\bdrink|vatten|dricka/.test(text)) return 'water';
  if (/^(hei|moi|terve|huomenta|iltaa|hi|hello|hey|good (morning|evening)|hej|tjena|god (morgon|kväll))\b/.test(text)) return 'greeting';
  return 'unknown';
}

/** Up to three allowed recipes that fit the question; none for safety topics. */
export function suggestRecipes(message: string, recipes: readonly RecipeHint[]): RecipeHint[] {
  if (classifySafety(message)) return [];
  switch (detectIntent(message)) {
    case 'proteinDinner':
      return recipes
        .filter((r) => r.dinner)
        .sort((a, b) => b.proteinG - a.proteinG)
        .slice(0, 3);
    case 'moreVeg':
      return recipes.filter((r) => r.legumes && r.dinner).slice(0, 3);
    default:
      return [];
  }
}

function titles(list: readonly RecipeHint[]): string {
  const names = list.map((r) => r.title.toLocaleLowerCase(intlLocale()));
  if (names.length <= 1) return names.join('');
  return format(strings.assistant.orList, { items: names.slice(0, -1).join(', '), last: names[names.length - 1] });
}

/** Rule-based test answer (neutral voice, same for every character). Safety topics always win. */
export function testAnswer(message: string, context: AssistantContext, recipes: readonly RecipeHint[] = []): string {
  const a = strings.assistant;
  const safety = classifySafety(message);
  if (safety) return a.safety[safety];
  const numbers = context !== null && !context.hideCalories;
  switch (detectIntent(message)) {
    case 'proteinDinner': {
      const left =
        numbers && context?.goals ? Math.max(0, Math.round(context.goals.proteinG - context.eaten.proteinG)) : null;
      const start = left !== null && left > 0 ? `${format(a.proteinLeft, { grams: format(strings.units.g, { value: left }).replace(' ', ' ') })} ` : '';
      const picks = suggestRecipes(message, recipes);
      const idea = picks.length > 0 ? format(a.proteinIdeas, { titles: titles(picks) }) : a.proteinFilter;
      return `${start}${idea}`;
    }
    case 'weightSwings':
      return a.weightSwings;
    case 'moreVeg':
      return a.moreVeg;
    case 'leftovers':
      return a.leftovers;
    case 'water': {
      const status = context !== null ? ` ${format(a.waterToday, { amount: formatWater(context.waterMl) })}` : '';
      return format(a.water, { status });
    }
    case 'greeting':
      return a.greeting;
    case 'unknown':
    default:
      return a.unknown;
  }
}

/** Messages per day before the chat pauses (cost control; app_config in production). */
export const DAILY_MESSAGE_LIMIT = 20;
