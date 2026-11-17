import { SITUATION_LEVEL, SITUATIONS, type ActivityLevel, type Situation } from '@/domain/activity';
import { bestMatches } from '@/domain/fuzzy';
import { OCCUPATION_IDS, OCCUPATION_LEVELS, type OccupationId } from '@/domain/occupations';
import { strings } from '@/i18n';
import { LANGUAGES } from '@/i18n/languages';
import { STRING_TABLES } from '@/i18n/registry';

/** One answer to "what do you do most of the day": a job or a life situation. */
export type OccupationHit =
  | { kind: 'occupation'; id: OccupationId; level: ActivityLevel }
  | { kind: 'situation'; id: Situation; level: ActivityLevel };

const ITEMS: readonly OccupationHit[] = [
  ...OCCUPATION_IDS.map((id): OccupationHit => ({ kind: 'occupation', id, level: OCCUPATION_LEVELS[id] })),
  ...SITUATIONS.map((id): OccupationHit => ({ kind: 'situation', id, level: SITUATION_LEVEL[id] })),
];

/** Every name and search word of an item in every language ("nurse" finds it in a Finnish UI too). */
const names = new Map<string, readonly string[]>();
function namesOf(hit: OccupationHit): readonly string[] {
  const key = `${hit.kind}:${hit.id}`;
  let list = names.get(key);
  if (!list) {
    const all = new Set<string>();
    for (const language of LANGUAGES) {
      const table = STRING_TABLES[language];
      const text = hit.kind === 'occupation' ? table.occupations[hit.id] : table.activity.situations[hit.id];
      for (const name of text.split('|')) if (name.trim()) all.add(name.trim());
    }
    list = [...all];
    names.set(key, list);
  }
  return list;
}

/** Occupations and situations matching what the user typed, best first. */
export function searchOccupations(query: string, limit = 6): OccupationHit[] {
  return bestMatches(ITEMS, namesOf, query, { limit, min: 0.6 }).map((scored) => scored.item);
}

/** The display name in the active language (the first of its names). */
export function occupationName(hit: Pick<OccupationHit, 'kind' | 'id'>): string {
  const text = hit.kind === 'occupation' ? strings.occupations[hit.id as OccupationId] : strings.activity.situations[hit.id as Situation];
  return text.split('|')[0];
}
