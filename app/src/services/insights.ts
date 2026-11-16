import type { CharacterVoice } from '@/i18n/fiCharacters';
import { format, formatMoney, strings } from '@/i18n';
import { lowNutrients, type NutrientReference } from '@/domain/nutrients';
import type { PeriodReport } from '@/domain/periodReport';

/**
 * The character's summary of a report: 2–3 short observations and one
 * concrete suggestion, in the character's own voice.
 *
 * `rules` (now): chosen from the report by fixed rules. Only habits are
 * mentioned (logging, water, protein, cooking, pantry use, quality, budget);
 * never eating less, calories as a target, or weight (CLAUDE.md, gamification
 * and chat safety rules).
 * `live` (backend phase): the `report-insights` Edge Function writes the
 * lines with the model from the same aggregated numbers (no raw diary), then
 * the same safety rules check them (docs/GENERATION.md, section 22).
 */
export type ReportInsights = {
  opening: string;
  observations: string[];
  suggestion: string;
};

export interface InsightsService {
  readonly mode: 'rules' | 'live';
  summarize(report: PeriodReport, voice: CharacterVoice, reference: NutrientReference): Promise<ReportInsights>;
}

const t = strings.reports;

/** Rule-based summary (tested in insights.test.ts). */
export function ruleInsights(report: PeriodReport, voice: CharacterVoice, reference: NutrientReference): ReportInsights {
  if (report.loggedDays === 0) {
    return { opening: voice.report.empty, observations: [], suggestion: format(voice.report.suggest, { tip: t.tips.logging }) };
  }
  const days = Math.max(1, report.elapsedDays);
  const proteinDays = report.goals ? report.days.filter((d) => d.logged && d.proteinG >= report.goals!.proteinG).length : 0;
  const goodQuality = report.grades.A + report.grades.B;
  const candidates: (string | null)[] = [
    format(t.obs.logged, { count: report.loggedDays, days }),
    report.pantry.itemsUsed > 0 ? format(t.obs.pantry, { count: report.pantry.itemsUsed }) : null,
    report.cooked.count > 0 ? format(t.obs.cooked, { count: report.cooked.count }) : null,
    report.water.goalDays > 0 ? format(t.obs.water, { count: report.water.goalDays }) : null,
    goodQuality > 0 ? format(t.obs.quality, { count: goodQuality }) : null,
    proteinDays > 0 ? format(t.obs.protein, { count: proteinDays }) : null,
    report.longestStreak >= 3 ? format(t.obs.streak, { count: report.longestStreak }) : null,
    report.savingsCents > 0 ? format(t.obs.saved, { amount: formatMoney(report.savingsCents) }) : null,
  ];
  const observations = candidates.filter((line): line is string => line !== null).slice(0, 3);

  // One suggestion: the habit with the most room first.
  const low = lowNutrients(report.nutrients, reference)[0];
  const tip =
    report.loggedDays < days / 2
      ? t.tips.logging
      : report.water.daysWithWater > 0 && report.water.goalDays < report.water.daysWithWater / 2
        ? t.tips.water
        : low
          ? strings.nutrientInfo.sources[low]
          : report.cooked.count === 0
            ? t.tips.cooking
            : t.tips.variety;
  return { opening: voice.report.opening, observations, suggestion: format(voice.report.suggest, { tip }) };
}

const rulesService: InsightsService = {
  mode: 'rules',
  summarize: async (report, voice, reference) => ruleInsights(report, voice, reference),
};

/** The active implementation: rules until the backend phase. */
export const insights: InsightsService = rulesService;
