import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Icon, IconButton, OptionRow, PressableScale, SelectChip, Stepper, Text, TextField, type IconName } from '@/components/ui';
import {
  ACTIVITY_LEVELS,
  COMMUTE_MINUTES,
  COMMUTE_MODES,
  DEFAULT_ACTIVITY_LEVEL,
  INTENSITIES,
  LEISURE,
  NO_COMMUTE,
  SITUATION_LEVEL,
  SITUATIONS,
  STEP_BANDS,
  WORKOUT_TYPES,
  type ActivityLevel,
  type Commute,
  type Leisure,
  type Situation,
  type StepBand,
  type Workout,
  type WorkoutType,
} from '@/domain/activity';
import type { Expenditure } from '@/domain/energy';
import type { OccupationId } from '@/domain/occupations';
import { format, strings } from '@/i18n';
import { formatEnergy } from '@/lib/amounts';
import { colors, radii, spacing, themedStyles } from '@/theme';

import { occupationName, searchOccupations } from './occupationSearch';

/** Question 1: the main thing the day is about. */
export type WorkAnswer = {
  level: ActivityLevel;
  occupation: OccupationId | null;
  situation: Situation | null;
  skipped: boolean;
};

/** Question 2: everyday movement. */
export type EverydayAnswer = {
  commute: Commute;
  stepBand: StepBand;
  leisure: Leisure[];
  skipped: boolean;
};

/** Question 3: workouts. */
export type WorkoutsAnswer = {
  workouts: Workout[];
  skipped: boolean;
};

const levelTitle = (level: ActivityLevel) => strings.activity.levels[level].title;

const WORKOUT_ICONS: Record<WorkoutType, IconName> = {
  gym: 'dumbbell',
  run: 'zap',
  cycle: 'repeat',
  swim: 'water',
  team: 'users',
  dance: 'sparkles',
  yoga: 'leaf',
  walk: 'steps',
  martial: 'shield',
  other: 'star',
};

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.gapSm}>
      <Text variant="overline" color="textSubtle" accessibilityRole="header">
        {title}
      </Text>
      {hint ? (
        <Text variant="caption" color="textSubtle">
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** "En tiedä tai haluan ohittaa" with the default it uses, shown under every question. */
function SkipRow({ selected, uses, onPress }: { selected: boolean; uses: string; onPress: () => void }) {
  return (
    <View style={styles.gapSm}>
      <OptionRow icon="info" title={strings.activity.skip} selected={selected} onPress={onPress} />
      {selected ? (
        <Text variant="caption" color="textMuted">
          {uses}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Work, school or situation: a search over ~100 occupations in every
 * language, five levels with everyday examples (pupils and students are
 * named in the first one), four situations and a skip.
 */
export function WorkStep({ value, onChange }: { value: WorkAnswer; onChange: (next: WorkAnswer) => void }) {
  const t = strings.activity;
  const [query, setQuery] = useState('');
  const hits = useMemo(() => searchOccupations(query), [query]);
  const chosenName = value.occupation ? occupationName({ kind: 'occupation', id: value.occupation }) : null;

  return (
    <View style={styles.gap}>
      <Section title={t.searchLabel}>
        <TextField
          icon="search"
          value={query}
          onChangeText={setQuery}
          placeholder={t.searchPlaceholder}
          accessibilityLabel={t.searchLabel}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.trim().length > 0 ? (
          hits.length > 0 ? (
            <View style={styles.gapSm} accessibilityRole="radiogroup">
              {hits.map((hit) => (
                <OptionRow
                  key={`${hit.kind}-${hit.id}`}
                  title={occupationName(hit)}
                  hint={levelTitle(hit.level)}
                  selected={hit.kind === 'occupation' ? value.occupation === hit.id : value.situation === hit.id}
                  onPress={() => {
                    onChange(
                      hit.kind === 'occupation'
                        ? { level: hit.level, occupation: hit.id, situation: null, skipped: false }
                        : { level: hit.level, occupation: null, situation: hit.id, skipped: false },
                    );
                    setQuery('');
                  }}
                />
              ))}
            </View>
          ) : (
            <Text variant="caption" color="textMuted">
              {t.searchNoMatch}
            </Text>
          )
        ) : null}
        {chosenName && !query ? (
          <View style={styles.chosen}>
            <Icon name="checkCircle" size={18} color="accentText" />
            <Text variant="label" color="accentText" style={styles.flex}>
              {format(t.chosenOccupation, { name: chosenName })}
            </Text>
          </View>
        ) : null}
      </Section>

      <View style={styles.gapSm} accessibilityRole="radiogroup">
        {ACTIVITY_LEVELS.map((level) => (
          <OptionRow
            key={level}
            title={t.levels[level].title}
            hint={t.levels[level].examples}
            selected={!value.skipped && value.situation === null && value.level === level}
            onPress={() =>
              onChange({ level, occupation: value.occupation && value.level === level ? value.occupation : null, situation: null, skipped: false })
            }
          />
        ))}
      </View>

      <Section title={t.situationsTitle}>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {SITUATIONS.map((situation) => (
            <SelectChip
              key={situation}
              role="radio"
              label={t.situations[situation]}
              selected={value.situation === situation}
              onPress={() => onChange({ level: SITUATION_LEVEL[situation], occupation: null, situation, skipped: false })}
            />
          ))}
        </View>
        {value.situation ? (
          <Text variant="caption" color="textMuted">
            {format(t.countsAs, { level: levelTitle(SITUATION_LEVEL[value.situation]) })}
          </Text>
        ) : null}
      </Section>

      <SkipRow
        selected={value.skipped}
        uses={format(t.skipUses, { level: levelTitle(DEFAULT_ACTIVITY_LEVEL) })}
        onPress={() => onChange({ level: DEFAULT_ACTIVITY_LEVEL, occupation: null, situation: null, skipped: true })}
      />
    </View>
  );
}

/** Trips to work or school, daily steps and everyday chores. */
export function EverydayStep({ value, onChange }: { value: EverydayAnswer; onChange: (next: EverydayAnswer) => void }) {
  const t = strings.activity;
  const set = (patch: Partial<EverydayAnswer>) => onChange({ ...value, ...patch, skipped: false });
  const moving = value.commute.mode !== 'none';

  return (
    <View style={styles.gap}>
      <Section title={t.commuteTitle}>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {COMMUTE_MODES.map((mode) => (
            <SelectChip
              key={mode}
              role="radio"
              label={t.commuteModes[mode]}
              selected={!value.skipped && value.commute.mode === mode}
              onPress={() =>
                set({ commute: mode === 'none' ? NO_COMMUTE : { mode, minutesPerDay: value.commute.minutesPerDay || 30 } })
              }
            />
          ))}
        </View>
        {moving && !value.skipped ? (
          <View style={styles.gapSm}>
            <Text variant="label" color="textMuted">
              {t.commuteMinutes}
            </Text>
            <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={t.commuteMinutes}>
              {COMMUTE_MINUTES.map((minutes) => (
                <SelectChip
                  key={minutes}
                  role="radio"
                  label={format(t.minutesValue, { value: minutes })}
                  selected={value.commute.minutesPerDay === minutes}
                  onPress={() => set({ commute: { ...value.commute, minutesPerDay: minutes } })}
                />
              ))}
            </View>
          </View>
        ) : null}
      </Section>

      <Section title={t.stepsTitle} hint={t.stepsHint}>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {STEP_BANDS.map((band) => (
            <SelectChip
              key={band}
              role="radio"
              label={t.stepBands[band]}
              selected={!value.skipped && value.stepBand === band}
              onPress={() => set({ stepBand: band })}
            />
          ))}
        </View>
        {value.stepBand !== 'unknown' && !value.skipped ? (
          <Text variant="caption" color="textMuted">
            {t.stepsCounted}
          </Text>
        ) : null}
      </Section>

      <Section title={t.leisureTitle}>
        <View style={styles.chips}>
          {LEISURE.map((item) => {
            const on = !value.skipped && value.leisure.includes(item);
            return (
              <SelectChip
                key={item}
                role="checkbox"
                label={t.leisure[item]}
                selected={on}
                onPress={() => set({ leisure: on ? value.leisure.filter((l) => l !== item) : [...value.leisure, item] })}
              />
            );
          })}
        </View>
      </Section>

      <SkipRow
        selected={value.skipped}
        uses={t.everydaySkipUses}
        onPress={() => onChange({ commute: NO_COMMUTE, stepBand: 'unknown', leisure: [], skipped: true })}
      />
    </View>
  );
}

/** Workouts by type, times a week, duration and intensity. */
export function WorkoutsStep({ value, onChange }: { value: WorkoutsAnswer; onChange: (next: WorkoutsAnswer) => void }) {
  const t = strings.activity;
  const setWorkouts = (workouts: Workout[]) => onChange({ workouts, skipped: false });
  const update = (index: number, patch: Partial<Workout>) =>
    setWorkouts(value.workouts.map((w, i) => (i === index ? { ...w, ...patch } : w)));

  return (
    <View style={styles.gap}>
      {value.workouts.length === 0 && !value.skipped ? (
        <Text variant="body" color="textMuted">
          {t.noWorkouts}
        </Text>
      ) : null}
      {value.workouts.map((workout, index) => (
        <Card key={workout.type} style={styles.gapSm}>
          <View style={styles.row}>
            <Icon name={WORKOUT_ICONS[workout.type]} size={20} color="accentText" />
            <Text variant="bodyStrong" style={styles.flex}>
              {t.workoutTypes[workout.type]}
            </Text>
            <IconButton
              icon="close"
              variant="plain"
              size={40}
              accessibilityLabel={format(t.removeWorkout, { type: t.workoutTypes[workout.type] })}
              onPress={() => setWorkouts(value.workouts.filter((_, i) => i !== index))}
            />
          </View>
          <View style={styles.row}>
            <Text variant="body" style={styles.flex}>
              {t.perWeek}
            </Text>
            <Stepper value={workout.perWeek} min={1} max={14} onChange={(perWeek) => update(index, { perWeek })} accessibilityLabel={t.perWeek} />
          </View>
          <View style={styles.row}>
            <Text variant="body" style={styles.flex}>
              {t.duration}
            </Text>
            <Stepper
              value={workout.minutes}
              min={10}
              max={240}
              step={5}
              onChange={(minutes) => update(index, { minutes })}
              format={(v) => format(t.minutesValue, { value: v })}
              accessibilityLabel={t.duration}
            />
          </View>
          <Text variant="label" color="textMuted">
            {t.intensity}
          </Text>
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={t.intensity}>
            {INTENSITIES.map((intensity) => (
              <SelectChip
                key={intensity}
                role="radio"
                label={t.intensities[intensity]}
                selected={workout.intensity === intensity}
                accessibilityHint={t.intensityHints[intensity]}
                onPress={() => update(index, { intensity })}
              />
            ))}
          </View>
          <Text variant="caption" color="textSubtle">
            {t.intensityHints[workout.intensity]}
          </Text>
        </Card>
      ))}
      <Section title={t.addWorkout}>
        <View style={styles.chips}>
          {WORKOUT_TYPES.filter((type) => !value.workouts.some((w) => w.type === type)).map((type) => (
            <SelectChip
              key={type}
              icon="plus"
              label={t.workoutTypes[type]}
              selected={false}
              onPress={() => setWorkouts([...value.workouts, { type, perWeek: 2, minutes: 45, intensity: 'moderate' }])}
            />
          ))}
        </View>
      </Section>
      <SkipRow selected={value.skipped} uses={t.workoutsSkipUses} onPress={() => onChange({ workouts: [], skipped: true })} />
    </View>
  );
}

/**
 * "Arvioitu kulutuksesi on noin X kcal/päivä"; tapping explains the parts:
 * basal metabolic rate + everyday activity + workouts, and which questions
 * were skipped (and what was used instead).
 */
export function ExpenditureSummary({ spend, skippedNotes }: { spend: Expenditure; skippedNotes: readonly string[] }) {
  const t = strings.activity;
  const b = t.breakdown;
  const [open, setOpen] = useState(false);
  const rows: [string, string, number][] = [
    [b.bmr, b.bmrHint, spend.bmr],
    [b.everyday, b.everydayHint, spend.everydayKcal],
    [b.workouts, b.workoutsHint, spend.exerciseKcal],
  ];
  return (
    <Card style={[styles.gapSm, styles.highlight]}>
      <Text variant="overline" color="accentText">
        {t.summaryTitle}
      </Text>
      <Text variant="display" color="accentText" style={styles.tabular}>
        {format(t.summaryValue, { value: formatEnergy(spend.tdee) })}
      </Text>
      <PressableScale
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={t.summaryExplain}
        style={styles.explain}
      >
        <Icon name="info" size={18} color="accentText" />
        <Text variant="label" color="accentText" style={styles.flex}>
          {t.summaryExplain}
        </Text>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={18} color="accentText" />
      </PressableScale>
      {open ? (
        <View style={styles.gapSm}>
          {rows.map(([label, hint, kcal]) => (
            <View key={label} style={styles.breakdownRow}>
              <View style={styles.flex}>
                <Text variant="bodyStrong">{label}</Text>
                <Text variant="caption" color="textSubtle">
                  {hint}
                </Text>
              </View>
              <Text variant="bodyStrong" style={styles.tabular}>
                {formatEnergy(kcal)}
              </Text>
            </View>
          ))}
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text variant="bodyStrong" style={styles.flex}>
              {b.total}
            </Text>
            <Text variant="bodyStrong" color="accentText" style={styles.tabular}>
              {formatEnergy(spend.tdee)}
            </Text>
          </View>
          {skippedNotes.length > 0 ? (
            <View style={styles.gapXs}>
              <Text variant="label" color="textMuted">
                {t.defaultsTitle}
              </Text>
              {skippedNotes.map((note) => (
                <Text key={note} variant="caption" color="textSubtle">
                  {note}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    gap: {
      gap: spacing.lg,
    },
    gapSm: {
      gap: spacing.sm,
    },
    gapXs: {
      gap: spacing.xs,
    },
    flex: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chosen: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    // A solid surface: a translucent fill would show the Android elevation shadow through it.
    highlight: {
      borderColor: colors.accent,
    },
    tabular: {
      fontVariant: ['tabular-nums'],
    },
    explain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      borderRadius: radii.sm,
    },
    breakdownRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    totalRow: {
      paddingTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  }),
);
