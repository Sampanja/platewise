import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { PanResponder, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { withFreezeOnBlur } from '@/components/freezeOnBlur';
import { QualityBadge } from '@/components/QualityBadge';
import { Sheet } from '@/components/Sheet';
import { SwipeToDelete } from '@/components/SwipeToDelete';
import { useTabBarSpace } from '@/components/TabBar';
import {
  Button,
  Card,
  Chip,
  FadeInView,
  haptics,
  Icon,
  IconButton,
  OptionRow,
  PressableScale,
  ProgressMeter,
  Ring,
  Segmented,
  Text,
  TextField,
} from '@/components/ui';
import { catalogName } from '@/data/catalog';
import { useGoalsFor } from '@/data/hooks';
import { useMyMealsStore } from '@/data/stores/myMeals';
import { useDiaryStore } from '@/data/stores/diary';
import { useProfileStore } from '@/data/stores/profile';
import type { DiaryEntry, DiaryMeal } from '@/data/types';
import {
  copyDayEntries,
  copyMealEntries,
  DIARY_MEALS,
  entriesOn,
  entryMacros,
  savedMealItems,
  sumEntries,
  weekKcal,
} from '@/domain/diary';
import { mealTargets } from '@/domain/macros';
import { entryAmount } from '@/features/diary/entryAmount';
import { WaterCard } from '@/features/diary/WaterCard';
import { DayNutrientsCard } from '@/features/nutrients/DayNutrientsCard';
import { DayQualityRow } from '@/features/quality/DayQualityRow';
import { entryQuality } from '@/features/quality/entryQuality';
import { WeekChart } from '@/features/diary/WeekChart';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { ReportsView } from '@/features/reports/ReportsView';
import { useCharacter } from '@/features/mascot/useCharacter';
import { format, formatInteger, strings } from '@/i18n';
import { formatEnergy, formatEnergyBare, formatNutrientGrams } from '@/lib/amounts';
import { addDays, diaryDayLabel, today, type LocalDate } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.diary;
/** Days a meal can be copied to, relative to the shown day. */
const COPY_OFFSETS = [-1, 1, 2, 3, 4, 5, 6, 7];

type Segment = 'today' | 'reports';
const SEGMENTS: readonly Segment[] = ['today', 'reports'];

function DiaryScreen() {
  const tabBarSpace = useTabBarSpace();
  const [date, setDate] = useState<LocalDate>(today());
  const [segment, setSegment] = useState<Segment>('today');
  // The weekly report notification opens Raportit directly.
  const { segment: requested } = useLocalSearchParams<{ segment?: string }>();
  const [seenRequest, setSeenRequest] = useState<string | undefined>(undefined);
  if (requested !== seenRequest) {
    setSeenRequest(requested);
    if (requested === 'reports' || requested === 'today') setSegment(requested);
  }
  const { voice } = useCharacter();
  const [menuFor, setMenuFor] = useState<DiaryMeal | null>(null);
  const [copyFor, setCopyFor] = useState<DiaryMeal | null>(null);
  const [copyDay, setCopyDay] = useState(false);
  const [saveFor, setSaveFor] = useState<DiaryMeal | null>(null);
  const [mealName, setMealName] = useState('');
  const saveMeal = useMyMealsStore((s) => s.saveMeal);
  const addMany = useDiaryStore((s) => s.addMany);
  const entries = useDiaryStore((s) => s.entries);
  const removeEntry = useDiaryStore((s) => s.remove);
  const restoreEntry = useDiaryStore((s) => s.restore);
  const goals = useGoalsFor(date);
  const hasGoal = useProfileStore((s) => s.hasCalorieGoal);
  const hideCalories = useProfileStore((s) => s.hideCalories);

  const dayEntries = useMemo(() => entriesOn(entries, date), [entries, date]);
  const totals = useMemo(() => sumEntries(dayEntries), [dayEntries]);
  // Per-meal targets when the user split the day over meals (calculator → Meals).
  const mealPlan = useProfileStore((s) => s.weightGoal.mealPlan);
  const mealGoals = useMemo(
    () => (hasGoal && mealPlan.enabled ? new Map(mealTargets(goals.kcal, mealPlan).map((target) => [target.meal, target.kcal])) : null),
    [hasGoal, mealPlan, goals.kcal],
  );
  // The chart shows the last seven days; an older selected day becomes the chart's last day.
  const week = useMemo(() => {
    const now = today();
    return weekKcal(entries, date > addDays(now, -7) && date <= now ? now : date);
  }, [entries, date]);
  const isToday = date === today();

  const changeDay = (delta: number) => {
    haptics.select();
    setDate((d) => addDays(d, delta));
  };

  // Horizontal swipe on the page changes the day; vertical scrolling is untouched.
  const [swipe] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 30 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) < 60) return;
        haptics.select();
        setDate((d) => addDays(d, g.dx > 0 ? -1 : 1));
      },
    }),
  );

  const copyMeal = (target: LocalDate) => {
    if (!copyFor) return;
    addMany(copyMealEntries(entries, { date, meal: copyFor }, { date: target, meal: copyFor }));
    haptics.success();
    showToast(format(strings.copyMeal.done, { meal: strings.diaryMeals[copyFor], day: diaryDayLabel(target) }));
    setCopyFor(null);
  };

  const deleteEntry = (entry: DiaryEntry) => {
    const removed = removeEntry(entry.id);
    if (removed) {
      showToast(t.deleted, { label: strings.common.undo, onPress: () => restoreEntry(removed) });
    }
  };

  const openAdd = (meal: DiaryMeal) => router.push({ pathname: '/diary-add', params: { meal, date } });

  const copyWholeDay = (target: LocalDate) => {
    const copies = copyDayEntries(entries, date, target);
    setCopyDay(false);
    if (copies.length === 0) {
      showToast(strings.copyDay.empty);
      return;
    }
    addMany(copies);
    haptics.success();
    showToast(format(strings.copyDay.done, { count: copies.length, day: diaryDayLabel(target) }));
  };

  const confirmSaveMeal = () => {
    if (!saveFor || !mealName.trim()) return;
    const items = savedMealItems(entries, date, saveFor);
    const saved = saveMeal({ name: mealName.trim(), items });
    haptics.success();
    showToast(format(strings.saveMeal.saved, { name: saved.name }));
    setSaveFor(null);
    setMealName('');
  };

  const kcalA11y = hasGoal
    ? format(t.kcalA11y, { value: formatEnergy(totals.kcal), goal: formatEnergy(goals.kcal) })
    : format(t.kcalA11yNoGoal, { value: formatEnergy(totals.kcal) });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.segments}>
        <Segmented
          value={segment}
          options={SEGMENTS.map((value) => ({ value, label: strings.diarySegments[value] }))}
          onChange={setSegment}
          accessibilityLabel={strings.diarySegments.a11y}
        />
      </View>
      {segment === 'reports' ? (
        <ReportsView bottomSpace={tabBarSpace} />
      ) : (
      <>
      <View style={styles.dayBar}>
        <IconButton icon="chevronLeft" accessibilityLabel={t.prevDay} onPress={() => changeDay(-1)} haptic="none" />
        <View style={styles.dayTitle}>
          <Text variant="title" accessibilityRole="header" accessibilityLiveRegion="polite">
            {diaryDayLabel(date)}
          </Text>
        </View>
        <IconButton icon="chevronRight" accessibilityLabel={t.nextDay} onPress={() => changeDay(1)} haptic="none" />
      </View>
      {!isToday ? (
        <View style={styles.todayRow}>
          <PressableScale
            haptic="select"
            onPress={() => setDate(today())}
            accessibilityRole="button"
            style={styles.todayButton}
          >
            <Text variant="label" color="accentText">
              {t.goToday}
            </Text>
          </PressableScale>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}>
        <View {...swipe.panHandlers} style={styles.swipeArea}>
          {hideCalories ? (
            <Card style={styles.hiddenNote}>
              <Text variant="body" color="textMuted">
                {strings.hideCalories.diaryNote}
              </Text>
            </Card>
          ) : (
          <FadeInView key={date}>
            <Card style={styles.summary}>
              <Ring value={hasGoal ? totals.kcal / goals.kcal : 0} size={128} thickness={12} accessibilityLabel={kcalA11y}>
                <Text variant="title" style={styles.tabular}>
                  {formatEnergyBare(totals.kcal)}
                </Text>
                <Text variant="caption" color="textSubtle">
                  {hasGoal ? format(t.goal, { value: formatEnergy(goals.kcal) }) : t.eaten}
                </Text>
              </Ring>
              <View style={styles.macros}>
                <MacroBar label={strings.macros.protein} value={totals.proteinG} goal={hasGoal ? goals.proteinG : null} />
                <MacroBar label={strings.macros.carbsLong} value={totals.carbsG} goal={hasGoal ? goals.carbsG : null} />
                <MacroBar label={strings.macros.fat} value={totals.fatG} goal={hasGoal ? goals.fatG : null} />
              </View>
            </Card>
          </FadeInView>
          )}

          <View style={styles.tools}>
            <Button
              label={strings.copyDay.action}
              variant="secondary"
              size="compact"
              icon={<Icon name="copy" size={18} />}
              accessibilityLabel={strings.copyDay.a11y}
              disabled={dayEntries.length === 0}
              onPress={() => setCopyDay(true)}
            />
          </View>

          <DayQualityRow entries={dayEntries} />

          {dayEntries.length === 0 ? <MascotSays state="encouraging" message={voice.empty.diary} size={60} /> : null}

          {DIARY_MEALS.map((meal) => {
            const mealEntries = dayEntries.filter((entry) => entry.meal === meal);
            const mealKcal = sumEntries(mealEntries).kcal;
            const mealGoal = hideCalories ? undefined : mealGoals?.get(meal);
            return (
              <Card key={meal} style={styles.meal} padding="flush">
                <View style={styles.mealHeader}>
                  <View style={styles.flex}>
                    <Text variant="heading" accessibilityRole="header">
                      {strings.diaryMeals[meal]}
                    </Text>
                    {mealGoal !== undefined ? (
                      <Text
                        variant="caption"
                        color="textSubtle"
                        accessibilityLabel={format(strings.macroPlan.diaryMealGoalA11y, {
                          meal: strings.diaryMeals[meal],
                          eaten: formatEnergy(mealKcal),
                          goal: formatEnergy(mealGoal),
                        })}
                      >
                        {format(strings.macroPlan.diaryMealGoal, { eaten: formatEnergyBare(mealKcal), goal: formatEnergy(mealGoal) })}
                      </Text>
                    ) : (
                      <Text variant="caption" color="textSubtle">
                        {mealEntries.length === 0
                          ? t.mealEmpty
                          : hideCalories
                            ? format(t.entryCount, { count: mealEntries.length })
                            : format(t.mealTotal, { value: formatEnergy(mealKcal) })}
                      </Text>
                    )}
                  </View>
                  {mealEntries.length > 0 ? (
                    <IconButton
                      icon="more"
                      variant="plain"
                      accessibilityLabel={format(strings.mealMenu.moreA11y, { meal: strings.diaryMeals[meal].toLowerCase() })}
                      onPress={() => setMenuFor(meal)}
                    />
                  ) : null}
                  <IconButton
                    icon="plus"
                    variant="accent"
                    accessibilityLabel={format(t.addTo, { meal: strings.diaryMeals[meal] })}
                    onPress={() => openAdd(meal)}
                  />
                </View>
                {mealEntries.length > 0 ? (
                  <View style={styles.entries}>
                    {mealEntries.map((entry) => (
                      <SwipeToDelete key={entry.id} onDelete={() => deleteEntry(entry)}>
                        <PressableScale
                          onPress={() => router.push({ pathname: '/entry/[id]', params: { id: entry.id } })}
                          accessibilityRole="button"
                          accessibilityHint={t.swipeHint}
                          accessibilityLabel={
                            hideCalories
                              ? `${catalogName(entry.basis, entry.name)}, ${entryAmount(entry)}`
                              : format(t.entryA11y, {
                                  name: catalogName(entry.basis, entry.name),
                                  amount: entryAmount(entry),
                                  kcal: formatEnergy(entryMacros(entry).kcal),
                                })
                          }
                          style={styles.entry}
                        >
                          <View style={styles.flex}>
                            <Text variant="body" numberOfLines={1}>
                              {catalogName(entry.basis, entry.name)}
                            </Text>
                            <View style={styles.entryMeta}>
                              <Text variant="caption" color="textSubtle">
                                {entryAmount(entry)}
                              </Text>
                              {entry.estimate ? <Chip label={strings.common.estimate} tone="accent" /> : null}
                              {hideCalories ? null : <EntryGrade entry={entry} />}
                            </View>
                          </View>
                          {hideCalories ? null : (
                            <Text variant="label" style={styles.tabular}>
                              {formatEnergy(entryMacros(entry).kcal)}
                            </Text>
                          )}
                        </PressableScale>
                      </SwipeToDelete>
                    ))}
                  </View>
                ) : null}
              </Card>
            );
          })}

          {hideCalories ? null : (
            <DayNutrientsCard
              totals={totals}
              entryCount={dayEntries.length}
              partial={dayEntries.some((entry) => entryMacros(entry).vitCMg === undefined)}
            />
          )}

          <WaterCard date={date} />

          {hideCalories ? null : (
            <WeekChart days={week} selected={date} goal={hasGoal ? goals.kcal : null} onSelect={setDate} />
          )}
        </View>
      </ScrollView>
      </>
      )}

      <Sheet
        visible={menuFor !== null}
        onClose={() => setMenuFor(null)}
        title={menuFor ? strings.diaryMeals[menuFor] : ''}
      >
        <OptionRow
          icon="copy"
          title={strings.mealMenu.copy}
          selected={false}
          action
          onPress={() => {
            setCopyFor(menuFor);
            setMenuFor(null);
          }}
        />
        <OptionRow
          icon="bookmark"
          title={strings.mealMenu.saveMeal}
          hint={strings.saveMeal.body}
          selected={false}
          action
          onPress={() => {
            setSaveFor(menuFor);
            setMealName(menuFor ? strings.diaryMeals[menuFor] : '');
            setMenuFor(null);
          }}
        />
      </Sheet>

      <Sheet visible={saveFor !== null} onClose={() => setSaveFor(null)} title={strings.saveMeal.title}>
        <Text variant="body" color="textMuted">
          {strings.saveMeal.body}
        </Text>
        <TextField
          value={mealName}
          onChangeText={setMealName}
          placeholder={strings.saveMeal.placeholder}
          accessibilityLabel={strings.saveMeal.name}
          maxLength={40}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={confirmSaveMeal}
        />
        <Button label={strings.saveMeal.save} onPress={confirmSaveMeal} disabled={!mealName.trim()} />
      </Sheet>

      <Sheet visible={copyDay} onClose={() => setCopyDay(false)} title={strings.copyDay.title}>
        <Text variant="body" color="textMuted">
          {strings.copyDay.body}
        </Text>
        {COPY_OFFSETS.map((offset) => {
          const target = addDays(date, offset);
          return (
            <OptionRow
              key={offset}
              icon="calendar"
              title={diaryDayLabel(target)}
              selected={false}
              action
              onPress={() => copyWholeDay(target)}
            />
          );
        })}
      </Sheet>

      <Sheet
        visible={copyFor !== null}
        onClose={() => setCopyFor(null)}
        title={copyFor ? format(strings.copyMeal.title, { meal: strings.diaryMeals[copyFor].toLowerCase() }) : ''}
      >
        <Text variant="body" color="textMuted">
          {strings.copyMeal.body}
        </Text>
        {COPY_OFFSETS.map((offset) => {
          const target = addDays(date, offset);
          return (
            <OptionRow
              key={offset}
              icon="calendar"
              title={diaryDayLabel(target)}
              selected={false}
              action
              onPress={() => copyMeal(target)}
            />
          );
        })}
      </Sheet>
    </SafeAreaView>
  );
}


function MacroBar({ label, value, goal }: { label: string; value: number; goal: number | null }) {
  const text =
    goal === null
      ? formatNutrientGrams(value)
      : format(strings.home.macroOfGoal, { value: formatInteger(value), goal: formatInteger(goal) });
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroLabels}>
        <Text variant="label" color="textMuted">
          {label}
        </Text>
        <Text variant="label" style={styles.tabular}>
          {text}
        </Text>
      </View>
      {goal ? <ProgressMeter value={value / goal} size="thin" accessibilityLabel={`${label} ${text}`} /> : null}
    </View>
  );
}

/** A small grade next to a logged food (not for quick entries). */
function EntryGrade({ entry }: { entry: DiaryEntry }) {
  const quality = useMemo(() => entryQuality(entry), [entry]);
  return quality ? <QualityBadge grade={quality.grade} /> : null;
}

const styles = themedStyles(() =>
  StyleSheet.create({
    segments: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    tabular: {
      fontVariant: ['tabular-nums'],
    },
    dayBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.sm,
    },
    dayTitle: {
      flex: 1,
      alignItems: 'center',
    },
    todayRow: {
      alignItems: 'center',
    },
    todayButton: {
      minHeight: 36,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: radii.pill,
      backgroundColor: colors.accentSoft,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    swipeArea: {
      gap: spacing.lg,
    },
    hiddenNote: {
      padding: spacing.lg,
    },
    summary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xl,
    },
    macros: {
      flex: 1,
      gap: spacing.md,
    },
    macroRow: {
      gap: spacing.xs,
    },
    macroLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    meal: {
      paddingVertical: spacing.sm,
    },
    mealHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    entries: {
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.xs,
      gap: spacing.xxs,
    },
    entry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 56,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    micros: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    micro: {
      flex: 1,
      gap: spacing.xxs,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
    },
    tools: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    entryMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
  }),
);

export default withFreezeOnBlur(DiaryScreen);
