/**
 * Safety rules and test-data answers for the assistant chat. The real
 * implementation (Edge Function + Claude, docs/GENERATION.md) applies the
 * same safety classification before and after the model; these rules are
 * the deterministic floor that never depends on a prompt.
 */

export type SafetyTopic = 'eatingDisorder' | 'extremeDiet' | 'medical' | null;

const ED_PATTERNS = [
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
];
const EXTREME_PATTERNS = [
  /\b([1-9]\d{2}|[1-9]\d)\s*kcal/, // under 1000 kcal
  /\b(alle|vain) (1000|tuhat|800|500)/,
  /vesipaasto|mehupaasto|nestepaasto/,
  /\d+\s*(kg|kiloa)\s*(viikossa|kuukaudessa)/,
  /nopeasti laihdu|laihtua nopeasti/,
];
const MEDICAL_PATTERNS = [
  /diagno/,
  /lääk(e|keet|kkeet|kitys)/,
  /sairau|sairas/,
  /diabet|verenpain|kolesterol|keliak|ibs|refluks/,
  /oire|kipu|kipua|särk/,
  /allerginen reaktio|anafyl/,
  /onko minulla/,
];

export function classifySafety(message: string): SafetyTopic {
  const text = message.toLocaleLowerCase('fi');
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
  /** "Piilota kalorit": the assistant must not mention numbers. */
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
  const text = message.toLocaleLowerCase('fi');
  if (/proteiin/.test(text)) return 'proteinDinner';
  if (/paino.*(heiluu|vaihtelee|nousi|nousee)|heiluu/.test(text)) return 'weightSwings';
  if (/kasvi|vihannes|hedelm/.test(text) && /lisää|enemmän|saisin/.test(text)) return 'moreVeg';
  if (/jää|tähtee|ylijää|hävik/.test(text)) return 'leftovers';
  if (/vet(tä|ta|ä)|juo/.test(text)) return 'water';
  if (/^(hei|moi|terve|huomenta|iltaa)\b/.test(text)) return 'greeting';
  return 'unknown';
}

const SAFETY_ANSWERS: Record<Exclude<SafetyTopic, null>, string> = {
  eatingDisorder:
    'Kiitos, että kerroit. Kuulostaa siltä, että syöminen tuntuu nyt raskaalta, ja se on tärkeää ottaa vakavasti. En ole oikea apu tähän, mutta sinun ei tarvitse olla asian kanssa yksin: juttele terveydenhoitajan tai lääkärin kanssa, tai soita Syömishäiriöliiton SYLIn tukipuhelimeen. Voit halutessasi ottaa kalorit piiloon Profiilista – päiväkirjaa voi käyttää ilman numeroita.',
  extremeDiet:
    'Ymmärrän halun nähdä tuloksia nopeasti, mutta hyvin pieni energiamäärä tai nopea pudotus ei ole turvallista eikä kestävää. Platewise ei suosittele alle 1\u00a0200\u00a0kcal (naiset) tai 1\u00a0500\u00a0kcal (miehet) päivässä, ja vauhti on enintään noin 0,75 kg viikossa. Tehdäänkö yhdessä rauhallisempi suunnitelma, joka tuntuu hyvältä arjessa?',
  medical:
    'Tähän en voi antaa lääketieteellistä arviota – en tunne terveydentilaasi enkä voi tehdä diagnooseja. Kysy asiasta lääkäriltä, terveydenhoitajalta tai ravitsemusterapeutilta. Voin kyllä auttaa yleisissä ruokavinkeissä, reseptien valinnassa ja ostoslistassa!',
};

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
  const names = list.map((r) => r.title.toLocaleLowerCase('fi'));
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} tai ${names[names.length - 1]}`;
}

/** Rule-based test answer (neutral voice, same for every character). Safety topics always win. */
export function testAnswer(message: string, context: AssistantContext, recipes: readonly RecipeHint[] = []): string {
  const safety = classifySafety(message);
  if (safety) return SAFETY_ANSWERS[safety];
  const numbers = context !== null && !context.hideCalories;
  switch (detectIntent(message)) {
    case 'proteinDinner': {
      const left =
        numbers && context?.goals ? Math.max(0, Math.round(context.goals.proteinG - context.eaten.proteinG)) : null;
      const start = left !== null && left > 0 ? `Tänään proteiinia on vielä noin ${left}\u00a0g jäljellä tavoitteesta. ` : '';
      const picks = suggestRecipes(message, recipes);
      const idea =
        picks.length > 0
          ? `Illaksi sopisi esimerkiksi ${titles(picks)}. Napauta alta, niin näet reseptin.`
          : 'Reseptit-välilehden Proteiinipitoinen-suodatin näyttää sinulle sopivat vaihtoehdot.';
      return `${start}${idea}`;
    }
    case 'weightSwings':
      return 'Paino heiluu päivästä toiseen ihan normaalisti – yleensä 0,5–2 kg. Syynä ovat nesteet, suola, hiilihydraatit, vatsan sisältö ja vaikka unen määrä. Siksi Platewise näyttää 7 päivän keskiarvon: se kertoo suunnan paremmin kuin yksittäinen punnitus. Katso viikkojen trendiä, älä yksittäistä aamua. 🌱';
    case 'moreVeg':
      return 'Helppoja tapoja: lisää kourallinen pakastekasviksia keittoon tai pataan, pidä porkkanaa ja kurkkua välipalana ja valitse välillä resepti, jossa on palkokasveja. Tavoitteeksi riittää aluksi yksi kasvisannos lisää päivään!';
    case 'leftovers':
      return 'Jääneet kasvikset sopivat mainiosti uunipellille, keittoon tai wokkiin, ja puolikkaan kaalin saa raikkaaksi salaatiksi. Ostoslista yrittää jo jakaa samat ainekset useampaan ruokaan, ettei mitään jää yli.';
    case 'water': {
      const status =
        context !== null
          ? ` Tänään olet juonut ${(context.waterMl / 1000).toFixed(1).replace('.', ',')} litraa.`
          : '';
      return `Juomasuositus on noin 1–1,5 litraa päivässä ruoan lisäksi, enemmän liikkuessa ja helteellä.${status} Lasillinen aterian kanssa on helppo tapa.`;
    }
    case 'greeting':
      return 'Hei! Mukava jutella. Kysy vaikka iltaruokavinkkiä, reseptiä tai apua kirjauksiin. 🥕';
    case 'unknown':
    default:
      return 'Hyvä kysymys! Testiversiossa osaan vastata vasta muutamaan aiheeseen: proteiinipitoiset ruoat, painon vaihtelu, kasvikset, ylijäämät ja juominen. Oikea tekoälyvastaus tulee myöhemmin.';
  }
}

/** Messages per day before the chat pauses (cost control; app_config in production). */
export const DAILY_MESSAGE_LIMIT = 20;
