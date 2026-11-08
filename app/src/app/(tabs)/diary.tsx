import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { PanResponder, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sheet } from '@/components/Sheet';
import { SwipeToDelete } from '@/components/SwipeToDelete';
import { useTabBarSpace } from '@/components/TabBar';
import {
  Card,
  Chip,
  FadeInView,
  haptics,
  IconButton,
  OptionRow,
  PressableScale,
  ProgressMeter,
  Ring,
  Text,
} from '@/components/ui';
import { useDiaryStore } from '@/data/stores/diary';
import { useProfileStore } from '@/data/stores/profile';
import type { DiaryEntry, DiaryMeal } from '@/data/types';
import { copyMealEntries, DIARY_MEALS, entriesOn, entryMacros, sumEntries, weekKcal } from '@/domain/diary';
import { entryAmount } from '@/features/diary/entryAmount';
import { WeekChart } from '@/features/diary/WeekChart';
import { format, formatInteger, strings } from '@/i18n';
import { addDays, diaryDayLabel, today, type LocalDate } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing } from '@/theme';

const t = strings.diary;
/** Days a meal can be copied to, relative to the shown day. */
const COPY_OFFSETS = [-1, 1, 2, 3, 4, 5, 6, 7];

export default function DiaryScreen() {
  const tabBarSpace = useTabBarSpace();
  const [date, setDate] = useState<LocalDate>(today());
  const [addFor, setAddFor] = useState<DiaryMeal | null>(null);
  const [copyFor, setCopyFor] = useState<DiaryMeal | null>(null);
  const addMany = useDiaryStore((s) => s.addMany);
  const entries = useDiaryStore((s) => s.entries);
  const removeEntry = useDiaryStore((s) => s.remove);
  const restoreEntry = useDiaryStore((s) => s.restore);
  const goals = useProfileStore((s) => s.goals);
  const hasGoal = useProfileStore((s) => s.hasCalorieGoal);
  const hideCalories = useProfileStore((s) => s.hideCalories);

  const dayEntries = useMemo(() => entriesOn(entries, date), [entries, date]);
  const totals = useMemo(() => sumEntries(dayEntries), [dayEntries]);
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

  const openAdd = (meal: DiaryMeal, method: 'photo' | 'search' | 'recipes') => {
    setAddFor(null);
    if (method === 'photo') router.push({ pathname: '/photo', params: { meal, date } });
    else router.push({ pathname: '/diary-add', params: { meal, date, tab: method } });
  };

  const kcalA11y = hasGoal
    ? format(t.kcalA11y, { value: formatInteger(totals.kcal), goal: formatInteger(goals.kcal) })
    : format(t.kcalA11yNoGoal, { value: formatInteger(totals.kcal) });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
                  {formatInteger(totals.kcal)}
                </Text>
                <Text variant="caption" color="textSubtle">
                  {hasGoal ? format(t.goal, { value: formatInteger(goals.kcal) }) : t.eaten}
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

          {DIARY_MEALS.map((meal) => {
            const mealEntries = dayEntries.filter((entry) => entry.meal === meal);
            const mealKcal = sumEntries(mealEntries).kcal;
            return (
              <Card key={meal} style={styles.meal} padding="flush">
                <View style={styles.mealHeader}>
                  <View style={styles.flex}>
                    <Text variant="heading" accessibilityRole="header">
                      {strings.diaryMeals[meal]}
                    </Text>
                    <Text variant="caption" color="textSubtle">
                      {mealEntries.length === 0
                        ? t.mealEmpty
                        : hideCalories
                          ? format(t.entryCount, { count: mealEntries.length })
                          : format(t.mealTotal, { value: formatInteger(mealKcal) })}
                    </Text>
                  </View>
                  {mealEntries.length > 0 ? (
                    <IconButton
                      icon="copy"
                      variant="plain"
                      accessibilityLabel={format(strings.copyMeal.actionA11y, {
                        meal: strings.diaryMeals[meal].toLowerCase(),
                      })}
                      onPress={() => setCopyFor(meal)}
                    />
                  ) : null}
                  <IconButton
                    icon="plus"
                    variant="accent"
                    accessibilityLabel={format(t.addTo, { meal: strings.diaryMeals[meal] })}
                    onPress={() => setAddFor(meal)}
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
                              ? `${entry.name}, ${entryAmount(entry)}`
                              : format(t.entryA11y, {
                                  name: entry.name,
                                  amount: entryAmount(entry),
                                  kcal: formatInteger(entryMacros(entry).kcal),
                                })
                          }
                          style={styles.entry}
                        >
                          <View style={styles.flex}>
                            <Text variant="body" numberOfLines={1}>
                              {entry.name}
                            </Text>
                            <View style={styles.entryMeta}>
                              <Text variant="caption" color="textSubtle">
                                {entryAmount(entry)}
                              </Text>
                              {entry.estimate ? <Chip label={strings.common.estimate} tone="accent" /> : null}
                            </View>
                          </View>
                          {hideCalories ? null : (
                            <Text variant="label" style={styles.tabular}>
                              {format(strings.common.kcal, { value: formatInteger(entryMacros(entry).kcal) })}
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
            <WeekChart days={week} selected={date} goal={hasGoal ? goals.kcal : null} onSelect={setDate} />
          )}
        </View>
      </ScrollView>

      <Sheet
        visible={addFor !== null}
        onClose={() => setAddFor(null)}
        title={addFor ? format(t.addTo, { meal: strings.diaryMeals[addFor] }) : t.addMethodsTitle}
      >
        {addFor ? (
          <>
            <OptionRow icon="camera" title={t.methodPhoto} hint={t.methodPhotoHint} selected={false} action onPress={() => openAdd(addFor, 'photo')} />
            <OptionRow icon="search" title={t.methodSearch} hint={t.methodSearchHint} selected={false} action onPress={() => openAdd(addFor, 'search')} />
            <OptionRow icon="recipes" title={t.methodRecipe} hint={t.methodRecipeHint} selected={false} action onPress={() => openAdd(addFor, 'recipes')} />
          </>
        ) : null}
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
      ? format(strings.common.grams, { value: formatInteger(value) })
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

const styles = StyleSheet.create({
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
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
