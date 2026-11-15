import type { Language } from '@/i18n/languages';

import type { AllergenCode } from '../../types';

/**
 * Free-text allergen keywords per language (`allergen_keywords`). A word
 * matches when it starts with the keyword, so "katkaravut" matches "katkara".
 * Kept narrow on purpose: ingredient data is the primary source.
 *
 * The app's safety check scans the Finnish source text of each recipe
 * (domain/recipes.ts). The English and Swedish lists check translations in
 * catalog.test.ts: a translation may not name an allergen the recipe lacks.
 */
type PerAllergen = Readonly<Partial<Record<AllergenCode, readonly string[]>>>;

export type KeywordSet = {
  keywords: PerAllergen;
  /** Word beginnings that start with a keyword but are not that allergen ("munakoiso" is not egg). */
  exceptions: PerAllergen;
  /** Suffix that says the food is free from it ("soijaton", "glutenfri"). */
  freeFromSuffix: RegExp;
  /** The words before say the food is free from gluten: "gluten-free breadcrumbs". */
  negatesGluten: (previous: string | undefined, beforePrevious: string | undefined) => boolean;
  /** Words right before a keyword that make it something else: "coconut milk". */
  notAfter: PerAllergen;
};

export const ALLERGEN_KEYWORDS: Readonly<Record<Language, KeywordSet>> = {
  fi: {
    keywords: {
      gluten: ['vehnä', 'ruis', 'ohra', 'spelt', 'seitan', 'korppujauho'],
      milk: ['maito', 'kerma', 'juusto', 'jogurtti', 'rahka', 'parmesaani', 'feta', 'mozzarella', 'halloumi'],
      egg: ['kananmun', 'muna'],
      fish: ['kala', 'lohi', 'seiti', 'tonnikala', 'turska', 'silakka', 'muikku', 'anjovis'],
      crustaceans: ['katkara', 'rapu', 'hummeri'],
      molluscs: ['simpuk', 'mustekala', 'kalmari', 'osteri'],
      peanut: ['maapähkinä'],
      nuts: ['pähkinä', 'manteli', 'cashew', 'hasselpähkinä', 'saksanpähkinä', 'pistaasi', 'pekaani'],
      soy: ['soija', 'tofu', 'edamame'],
      sesame: ['seesam', 'tahini'],
      mustard: ['sinappi'],
      celery: ['selleri'],
      lupin: ['lupiini'],
    },
    exceptions: { milk: ['juustokumin', 'kookosmai'], egg: ['munakois'] },
    freeFromSuffix: /^(ton|tön|ttom|ttöm)/,
    // "gluteeniton korppujauho", "gluteenittomat jauhot"
    negatesGluten: (previous) => previous !== undefined && previous.startsWith('gluteenit'),
    notAfter: {},
  },
  en: {
    keywords: {
      gluten: ['wheat', 'rye', 'barley', 'spelt', 'seitan', 'breadcrumb'],
      milk: ['milk', 'cream', 'cheese', 'yogurt', 'yoghurt', 'quark', 'parmesan', 'feta', 'mozzarella', 'halloumi', 'butter'],
      egg: ['egg'],
      fish: ['fish', 'salmon', 'saithe', 'pollock', 'tuna', 'cod', 'herring', 'vendace', 'anchov'],
      crustaceans: ['prawn', 'shrimp', 'crayfish', 'crab', 'lobster'],
      molluscs: ['mussel', 'clam', 'octopus', 'squid', 'calamari', 'oyster'],
      peanut: ['peanut'],
      nuts: ['almond', 'cashew', 'hazelnut', 'walnut', 'pistachio', 'pecan'],
      soy: ['soy', 'tofu', 'edamame'],
      sesame: ['sesame', 'tahini'],
      mustard: ['mustard'],
      celery: ['celery', 'celeriac'],
      lupin: ['lupin'],
    },
    exceptions: { milk: ['creamy', 'butternut'], egg: ['eggplant'] },
    freeFromSuffix: /^-?free/,
    negatesGluten: (previous, beforePrevious) => previous === 'free' && beforePrevious === 'gluten',
    notAfter: { milk: ['coconut', 'oat', 'almond', 'soy', 'rice', 'plant', 'peanut', 'cocoa', 'ice'] },
  },
  sv: {
    keywords: {
      gluten: ['vete', 'råg', 'korn', 'dinkel', 'seitan', 'ströbröd', 'skorpmjöl'],
      milk: ['mjölk', 'grädde', 'ost', 'yoghurt', 'kvarg', 'parmesan', 'feta', 'mozzarella', 'halloumi', 'smör'],
      egg: ['ägg'],
      fish: ['fisk', 'lax', 'sej', 'tonfisk', 'torsk', 'strömming', 'sill', 'siklöja', 'ansjovis'],
      crustaceans: ['räk', 'kräft', 'krabb', 'hummer'],
      molluscs: ['mussl', 'bläckfisk', 'kalmar', 'ostron'],
      peanut: ['jordnöt'],
      nuts: ['nöt', 'mandel', 'cashew', 'hasselnöt', 'valnöt', 'pistage', 'pekan'],
      soy: ['soja', 'tofu', 'edamame'],
      sesame: ['sesam', 'tahini'],
      mustard: ['senap'],
      celery: ['selleri'],
      lupin: ['lupin'],
    },
    exceptions: {
      milk: ['ostron', 'kokosmjölk', 'havremjölk', 'mandelmjölk', 'sojamjölk', 'kokosgrädde', 'havregrädde', 'smörgås', 'ostind', 'smörj'],
      nuts: ['nötkött', 'nötfärs'],
      crustaceans: ['räkn'],
      gluten: ['kornig', 'kornel'],
    },
    freeFromSuffix: /^fri/,
    negatesGluten: (previous) => previous !== undefined && previous.startsWith('glutenfri'),
    notAfter: {},
  },
};
