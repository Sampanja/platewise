import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { SwipeToDelete } from '@/components/SwipeToDelete';
import {
  Card,
  FadeInView,
  haptics,
  Icon,
  IconButton,
  PressableScale,
  SelectChip,
  Stepper,
  SwitchRow,
  Text,
  useReducedMotion,
} from '@/components/ui';
import { useRecommendedWaterGoal, useWaterGoal, useWaterGoalFor } from '@/data/hooks';
import { useWaterStore } from '@/data/stores/water';
import {
  DRINK_TYPES,
  DRINKS_WITH_ENERGY,
  isAboveCaution,
  MAX_GOAL_ML,
  MIN_GOAL_ML,
  NO_EXTRAS,
  reminderHours,
  SERVING_SIZES_ML,
  waterStreak,
  type DrinkType,
  type WaterEntry,
} from '@/domain/hydration';
import { BarChart } from '@/features/diary/BarChart';
import { decilitres, litres } from '@/features/diary/WaterCard';
import { useCharacter } from '@/features/mascot/useCharacter';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { format, formatDecimal, strings } from '@/i18n';
import { addDays, diaryDayLabel, parseLocalDate, today, type LocalDate } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { ensurePermission, scheduleWaterReminders } from '@/services/reminders';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.water;
const WEEKDAY = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];

/**
 * Drinks: the day's progress, quick adding by drink and size, the day's log,
 * the personal goal with its breakdown, exercise and heat for the day,
 * reminders and the last seven days. Health data, on the device only.
 */
export default function WaterScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const date: LocalDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today();
  const { voice } = useCharacter();

  const entries = useWaterStore((s) => s.entries);
  const byDate = useWaterStore((s) => s.byDate);
  const lastDrink = useWaterStore((s) => s.lastDrink);
  const glassMl = useWaterStore((s) => s.glassMl);
  const goalMode = useWaterStore((s) => s.goalMode);
  const manualGoalMl = useWaterStore((s) => s.manualGoalMl);
  const extras = useWaterStore((s) => s.dayExtras[date]) ?? NO_EXTRAS;
  const reminders = useWaterStore((s) => s.reminders);
  const store = useWaterStore.getState;

  const goal = useWaterGoal(date);
  const goalFor = useWaterGoalFor();
  const recommended = useRecommendedWaterGoal();
  const ml = byDate[date] ?? 0;
  const [drink, setDrink] = useState<DrinkType>(lastDrink);
  const [custom, setCustom] = useState(300);

  const dayEntries = useMemo(
    () =>
      entries
        .filter((e) => e.date === date)
        .sort((a, b) => (b.time ?? '').localeCompare(a.time ?? '')),
    [entries, date],
  );

  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const day = addDays(date, i - 6);
        const value = byDate[day] ?? 0;
        const dayGoal = goalFor(day).totalMl;
        return {
          key: day,
          label: WEEKDAY[parseLocalDate(day).getDay()],
          value,
          muted: day > today(),
          a11y: format(t.historyA11y, { day: diaryDayLabel(day), value: litres(value), goal: litres(dayGoal) }),
        };
      }),
    [byDate, date, goalFor],
  );
  const loggedDays = week.filter((d) => d.value > 0);
  const average = loggedDays.length > 0 ? loggedDays.reduce((sum, d) => sum + d.value, 0) / loggedDays.length : 0;
  const streak = waterStreak(byDate, (d) => goalFor(d).totalMl, today(), (d) => addDays(d, -1));

  const addDrink = (amount: number) => {
    const entry = store().add(date, amount, drink);
    if (!entry) return;
    haptics.tap();
    if (ml < goal.totalMl && ml + entry.ml >= goal.totalMl) haptics.success();
    showToast(format(t.added, { drink: t.drinks[drink], amount: decilitres(entry.ml) }), {
      label: strings.common.undo,
      onPress: () => store().remove(entry.id),
    });
  };
  const removeEntry = (entry: WaterEntry) => {
    store().remove(entry.id);
    haptics.tap();
    showToast(t.deleted, { label: strings.common.undo, onPress: () => store().restore(entry) });
  };

  const updateReminders = async (patch: Partial<typeof reminders>) => {
    const next = { ...reminders, ...patch };
    if (patch.on && !(await ensurePermission())) {
      showToast(t.remindersDenied);
      return;
    }
    store().setReminders(patch);
    void scheduleWaterReminders(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={date === today() ? t.screenTitle : `${t.screenTitle} · ${diaryDayLabel(date)}`} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Progress */}
        <Card style={styles.hero}>
          <WaterGlass progress={ml / goal.totalMl} />
          <View style={styles.heroText}>
            <Text variant="overline" color="textSubtle">
              {date === today() ? t.drunkToday : t.drunk}
            </Text>
            <Text
              variant="displayLarge"
              color="water"
              style={styles.tabular}
              accessibilityLabel={format(t.a11y, { value: litres(ml), goal: litres(goal.totalMl) })}
            >
              {`${litres(ml)} l`}
            </Text>
            <Text variant="label" color="textMuted">
              {`/ ${litres(goal.totalMl)} l`}
            </Text>
            <Text variant="caption" color={ml >= goal.totalMl ? 'success' : 'textSubtle'}>
              {ml >= goal.totalMl ? t.reached : format(t.left, { value: litres(goal.totalMl - ml) })}
            </Text>
          </View>
        </Card>

        {ml >= goal.totalMl ? <MascotSays state="happy" message={voice.notify.water} size={56} /> : null}

        {isAboveCaution(ml) ? (
          <Card style={styles.caution}>
            <Icon name="info" size={20} color="textMuted" />
            <Text variant="caption" color="textMuted" style={styles.flex}>
              {t.caution}
            </Text>
          </Card>
        ) : null}

        {/* Quick add */}
        <Section title={t.drinkLabel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
            {DRINK_TYPES.map((type) => (
              <SelectChip
                key={type}
                role="radio"
                label={t.drinks[type]}
                selected={drink === type}
                onPress={() => setDrink(type)}
              />
            ))}
          </ScrollView>
          {DRINKS_WITH_ENERGY.has(drink) ? (
            <Text variant="caption" color="textSubtle">
              {format(t.energyHint, { drink: t.drinks[drink] })}
            </Text>
          ) : null}
          <Text variant="label" color="textMuted">
            {t.sizeLabel}
          </Text>
          <View style={styles.sizes}>
            {SERVING_SIZES_ML.map((size) => (
              <PressableScale
                key={size}
                onPress={() => addDrink(size)}
                accessibilityRole="button"
                accessibilityLabel={format(t.add, { amount: `${t.drinks[drink]} ${decilitres(size)}` })}
                style={styles.size}
              >
                <Icon name="plus" size={16} color="water" />
                <Text variant="bodyStrong">{decilitres(size)}</Text>
              </PressableScale>
            ))}
          </View>
          <View style={styles.customRow}>
            <Text variant="label" color="textMuted" style={styles.flex}>
              {t.customAmount}
            </Text>
            <Stepper
              value={custom}
              min={50}
              max={1500}
              step={50}
              onChange={setCustom}
              format={(v) => decilitres(v)}
              accessibilityLabel={t.customTitle}
            />
            <IconButton icon="plus" variant="accent" accessibilityLabel={t.addCustom} onPress={() => addDrink(custom)} haptic="none" />
          </View>
        </Section>

        {/* Today's log */}
        <Section title={date === today() ? t.todayTitle : diaryDayLabel(date)}>
          {dayEntries.length === 0 ? (
            <Text variant="body" color="textMuted">
              {t.todayEmpty}
            </Text>
          ) : (
            <Card padding="flush">
              {dayEntries.map((entry, i) => (
                <SwipeToDelete key={entry.id} onDelete={() => removeEntry(entry)}>
                  <View
                    style={[styles.entry, i > 0 && styles.entryBorder]}
                    accessible
                    accessibilityLabel={format(t.entryA11y, {
                      time: entry.time ?? t.earlier,
                      drink: t.drinks[entry.drink],
                      amount: decilitres(entry.ml),
                    })}
                    accessibilityActions={[{ name: 'delete', label: t.deleteEntry }]}
                    onAccessibilityAction={() => removeEntry(entry)}
                  >
                    <Text variant="label" color="textSubtle" style={styles.time}>
                      {entry.time ?? t.earlier}
                    </Text>
                    <Text variant="body" style={styles.flex}>
                      {t.drinks[entry.drink]}
                    </Text>
                    <Text variant="bodyStrong" style={styles.tabular}>
                      {decilitres(entry.ml)}
                    </Text>
                    <IconButton icon="close" variant="plain" size={36} accessibilityLabel={t.deleteEntry} onPress={() => removeEntry(entry)} />
                  </View>
                </SwipeToDelete>
              ))}
            </Card>
          )}
        </Section>

        {/* The day's need */}
        <Section title={t.extrasTitle}>
          <Card style={styles.gap}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text variant="bodyStrong">{t.exercise}</Text>
                <Text variant="caption" color="textSubtle">
                  {t.exerciseHint}
                </Text>
              </View>
              <Stepper
                value={extras.exerciseMin}
                min={0}
                max={240}
                step={15}
                onChange={(exerciseMin) => store().setDayExtras(date, { exerciseMin })}
                format={(v) => format(t.minutes, { count: v })}
                accessibilityLabel={t.exercise}
              />
            </View>
            <SwitchRow
              label={t.hot}
              hint={t.hotHint}
              value={extras.hot}
              onValueChange={(hot) => store().setDayExtras(date, { hot })}
            />
          </Card>
        </Section>

        {/* Goal */}
        <Section title={t.goalTitle}>
          <Card style={styles.gap}>
            <View style={styles.segment} accessibilityRole="radiogroup">
              {(['auto', 'manual'] as const).map((mode) => {
                const selected = goalMode === mode;
                const label = mode === 'auto' ? t.goalAuto : t.goalManual;
                return (
                  <PressableScale
                    key={mode}
                    haptic="select"
                    onPress={() => (mode === 'manual' ? store().setManualGoal(manualGoalMl) : store().setGoalMode('auto'))}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={format(t.goalModeA11y, { value: label })}
                    style={[styles.segmentOption, selected && styles.segmentSelected]}
                  >
                    <Text variant="label" color={selected ? 'textOnAccent' : 'textMuted'}>
                      {label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>

            {goalMode === 'manual' ? (
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text variant="bodyStrong">{t.goalManualLabel}</Text>
                  <Text variant="caption" color="textSubtle">
                    {format(t.manualHint, { value: litres(recommended.totalMl) })}
                  </Text>
                </View>
                <Stepper
                  value={manualGoalMl}
                  min={MIN_GOAL_ML}
                  max={MAX_GOAL_ML}
                  step={100}
                  onChange={(value) => store().setManualGoal(value)}
                  format={(v) => `${formatDecimal(v / 1000, 1)} l`}
                  accessibilityLabel={t.goalManualLabel}
                />
              </View>
            ) : null}

            <Text variant="label" color="textMuted">
              {t.goalHow}
            </Text>
            <View style={styles.parts}>
              {goal.parts.map((part) => (
                <View key={part.key} style={styles.partRow}>
                  <View style={styles.flex}>
                    <Text variant="body">{t.parts[part.key]}</Text>
                    {part.key === 'base' ? (
                      <Text variant="caption" color="textSubtle">
                        {goal.basis === 'weight'
                          ? format(t.basis.weight, { kg: formatDecimal(Math.round(goal.parts[0].ml / 24), 0) })
                          : t.basis[goal.basis]}
                      </Text>
                    ) : null}
                  </View>
                  <Text variant="bodyStrong" style={styles.tabular}>
                    {part.key === 'base' ? `${litres(part.ml)} l` : `+ ${decilitres(part.ml)}`}
                  </Text>
                </View>
              ))}
              <View style={[styles.partRow, styles.totalRow]}>
                <Text variant="bodyStrong" style={styles.flex}>
                  {t.goalTotal}
                </Text>
                <Text variant="bodyStrong" color="water" style={styles.tabular}>
                  {`${litres(goal.totalMl)} l`}
                </Text>
              </View>
            </View>
            {goalMode === 'auto' && goal.basis !== 'weight' ? (
              <Text variant="caption" color="textSubtle">
                {t.goalMissingData}
              </Text>
            ) : null}
            <Text variant="caption" color="textSubtle">
              {t.goalSource}
            </Text>
          </Card>
        </Section>

        {/* History */}
        <Section title={t.historyTitle}>
          <Card style={styles.gap}>
            <BarChart
              bars={week}
              reference={goal.totalMl}
              tone="water"
              height={110}
              format={(v) => formatDecimal(v / 1000, 1)}
            />
            <View style={styles.row}>
              <Icon name="flame" size={18} color={streak > 0 ? 'accentText' : 'textSubtle'} />
              <Text variant="label" style={styles.flex}>
                {streak === 0 ? t.streakNone : streak === 1 ? t.streakOne : format(t.streak, { count: streak })}
              </Text>
            </View>
            {average > 0 ? (
              <Text variant="caption" color="textSubtle">
                {format(t.average, { value: litres(average) })}
              </Text>
            ) : null}
          </Card>
        </Section>

        {/* Settings */}
        <Section title={t.glassTitle}>
          <Card style={styles.gap}>
            <View style={styles.sizes}>
              {SERVING_SIZES_ML.map((size) => (
                <SelectChip
                  key={size}
                  role="radio"
                  label={decilitres(size)}
                  selected={glassMl === size}
                  onPress={() => store().setGlassMl(size)}
                />
              ))}
            </View>
            <Text variant="caption" color="textSubtle">
              {t.glassHint}
            </Text>
          </Card>
        </Section>

        <Section title={t.remindersTitle}>
          <Card style={styles.gap}>
            <SwitchRow
              label={t.remindersOn}
              hint={t.remindersHint}
              value={reminders.on}
              onValueChange={(on) => void updateReminders({ on })}
            />
            {reminders.on ? (
              <>
                <ReminderStepper
                  label={t.remindersStart}
                  value={reminders.startHour}
                  min={6}
                  max={Math.min(14, reminders.endHour - 1)}
                  format={(v) => format(t.hourValue, { hour: v })}
                  onChange={(startHour) => void updateReminders({ startHour })}
                />
                <ReminderStepper
                  label={t.remindersEnd}
                  value={reminders.endHour}
                  min={Math.max(15, reminders.startHour + 1)}
                  max={22}
                  format={(v) => format(t.hourValue, { hour: v })}
                  onChange={(endHour) => void updateReminders({ endHour })}
                />
                <ReminderStepper
                  label={t.remindersEvery}
                  value={reminders.everyHours}
                  min={1}
                  max={4}
                  format={(v) => format(t.everyValue, { count: v })}
                  onChange={(everyHours) => void updateReminders({ everyHours })}
                />
                <Text variant="caption" color="textSubtle">
                  {format(t.remindersSummary, {
                    count: reminderHours(reminders.startHour, reminders.endHour, reminders.everyHours).length,
                  })}
                </Text>
              </>
            ) : null}
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <FadeInView style={styles.section}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </FadeInView>
  );
}

function ReminderStepper(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.row}>
      <Text variant="body" style={styles.flex}>
        {props.label}
      </Text>
      <Stepper
        value={props.value}
        min={props.min}
        max={props.max}
        onChange={props.onChange}
        format={props.format}
        accessibilityLabel={props.label}
      />
    </View>
  );
}

/** A glass that fills with the day's progress. Respects reduced motion. */
function WaterGlass({ progress }: { progress: number }) {
  const reducedMotion = useReducedMotion();
  const target = Math.min(1, Math.max(0, progress));
  const [fill] = useState(() => new Animated.Value(target));
  useEffect(() => {
    if (reducedMotion) {
      fill.setValue(target);
      return;
    }
    Animated.timing(fill, { toValue: target, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [fill, target, reducedMotion]);
  const height = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.glassOuter} accessible={false} importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.glassFill, { height }]}>
        <View style={styles.glassShine} />
      </Animated.View>
      {[0.25, 0.5, 0.75].map((mark) => (
        <View key={mark} style={[styles.glassMark, { bottom: `${mark * 100}%` }]} />
      ))}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    flex: {
      flex: 1,
    },
    gap: {
      gap: spacing.md,
    },
    tabular: {
      fontVariant: ['tabular-nums'],
    },
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xl,
    },
    heroText: {
      flex: 1,
      gap: spacing.xxs,
    },
    caution: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    section: {
      gap: spacing.md,
    },
    bleed: {
      marginHorizontal: -spacing.lg,
    },
    chips: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    sizes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    size: {
      flexGrow: 1,
      flexBasis: '28%',
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderRadius: radii.md,
      backgroundColor: colors.waterSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    customRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    entry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 52,
      paddingLeft: spacing.lg,
      paddingRight: spacing.sm,
      backgroundColor: colors.surface,
    },
    entryBorder: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    time: {
      width: 56,
      fontVariant: ['tabular-nums'],
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    segment: {
      flexDirection: 'row',
      padding: spacing.xs,
      gap: spacing.xs,
      borderRadius: radii.pill,
      backgroundColor: colors.surfaceRaised,
    },
    segmentOption: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.pill,
    },
    segmentSelected: {
      backgroundColor: colors.accent,
    },
    parts: {
      gap: spacing.sm,
    },
    partRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    totalRow: {
      paddingTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    glassOuter: {
      width: 96,
      height: 132,
      borderWidth: 3,
      borderTopWidth: 0,
      borderColor: colors.water,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
      overflow: 'hidden',
      justifyContent: 'flex-end',
      backgroundColor: colors.waterSoft,
    },
    glassFill: {
      width: '100%',
      backgroundColor: colors.water,
      opacity: 0.85,
    },
    glassShine: {
      position: 'absolute',
      left: 10,
      top: 8,
      bottom: 8,
      width: 8,
      borderRadius: 4,
      backgroundColor: colors.surface,
      opacity: 0.3,
    },
    glassMark: {
      position: 'absolute',
      left: 0,
      width: 14,
      height: 2,
      backgroundColor: colors.water,
      opacity: 0.5,
    },
  }),
);
