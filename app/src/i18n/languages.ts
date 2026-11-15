/**
 * Supported UI languages. Adding a language means: its string files
 * (`<lang>.ts`, `<lang>Diary.ts`, `<lang>Fun.ts`, `<lang>Goals.ts`,
 * `<lang>Characters.ts`), recipe, ingredient and food texts under
 * `data/catalog/text/<lang>`, and one entry here and in the two registries
 * (`i18n/index.ts`, `data/catalog/text/index.ts`). Tests fail until every key
 * and every recipe has a translation.
 */
export const LANGUAGES = ['fi', 'en', 'sv'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Used when the phone's language is not supported. */
export const FALLBACK_LANGUAGE: Language = 'en';

/** Each language's own name, shown in the picker in that language. */
export const LANGUAGE_NAMES: Readonly<Record<Language, string>> = {
  fi: 'Suomi',
  en: 'English',
  sv: 'Svenska',
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** The supported language for a phone language code (e.g. "sv"), or English. */
export function languageFor(code: string | null | undefined): Language {
  const lower = code?.toLowerCase();
  return isLanguage(lower) ? lower : FALLBACK_LANGUAGE;
}
