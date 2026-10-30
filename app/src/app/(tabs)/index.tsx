import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DevScenarioBar } from '@/components/DevScenarioBar';
import { EmptyState, FadeInView, Text } from '@/components/ui';
import type { CurrentPlan } from '@/data/api';
import type { DayNutrition } from '@/data/types';
import { useCurrentPlan, useMonthSavings, useTodayNutrition } from '@/data/queries';
import { lastDinnerDate, upcomingDinners } from '@/domain/plan';
import { BudgetCard } from '@/features/home/BudgetCard';
import { HomeSkeleton } from '@/features/home/HomeSkeleton';
import { NewListCard } from '@/features/home/NewListCard';
import { NutritionCard } from '@/features/home/NutritionCard';
import { TodayMealCard } from '@/features/home/TodayMealCard';
import { UpcomingMeals } from '@/features/home/UpcomingMeals';
import { strings } from '@/i18n';
import { addDays, greeting, longDate, today } from '@/lib/dates';
import { colors, spacing } from '@/theme';

const t = strings.home;
/** Delay between sections as they fade in, top to bottom. */
const STAGGER_MS = 70;

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const planQuery = useCurrentPlan();
  const savingsQuery = useMonthSavings();
  const nutritionQuery = useTodayNutrition();
  const [refreshing, setRefreshing] = useState(false);

  const goToPlan = () => router.navigate('/plan');
  const goToDiary = () => router.navigate('/diary');

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries({ type: 'active' });
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <View style={[styles.padded, styles.header]}>
          <Text variant="overline" color="accentText">
            {longDate(today())}
          </Text>
          <Text variant="displayLarge" accessibilityRole="header">
            {greeting()}
          </Text>
        </View>

        {planQuery.isPending ? (
          <HomeSkeleton />
        ) : planQuery.isError ? (
          <FadeInView style={styles.padded}>
            <EmptyState
              icon="alert"
              tone="danger"
              title={t.errorTitle}
              body={t.errorBody}
              action={{
                label: strings.common.retry,
                variant: 'secondary',
                onPress: () => void planQuery.refetch(),
              }}
            />
          </FadeInView>
        ) : planQuery.data === null ? (
          <NoPlanContent nutrition={nutritionQuery.data} onCreate={goToPlan} onOpenDiary={goToDiary} />
        ) : (
          <PlanContent
            current={planQuery.data}
            monthSavingsCents={savingsQuery.data}
            nutrition={nutritionQuery.data}
            onCreate={goToPlan}
            onOpenDiary={goToDiary}
          />
        )}

        <View style={styles.padded}>
          <DevScenarioBar />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ContentProps = {
  nutrition: DayNutrition | undefined;
  onCreate: () => void;
  onOpenDiary: () => void;
};

function PlanContent({
  current,
  monthSavingsCents,
  nutrition,
  onCreate,
  onOpenDiary,
}: ContentProps & { current: CurrentPlan; monthSavingsCents: number | undefined }) {
  const { plan, recipesById } = current;
  const now = today();
  const [next, ...later] = upcomingDinners(plan, now);
  const endDate = lastDinnerDate(plan);
  // When the list is about to run out, making a new one is the most useful next step.
  const endingSoon = endDate <= addDays(now, 1);
  const nextRecipe = next ? recipesById[next.recipeId] : undefined;

  const newList = <NewListCard endDate={endDate} onPress={onCreate} />;
  let step = 0;
  const delay = () => STAGGER_MS * step++;

  return (
    <>
      {endingSoon ? (
        <FadeInView delay={delay()} style={styles.padded}>
          {newList}
        </FadeInView>
      ) : null}

      {next && nextRecipe ? (
        <FadeInView delay={delay()} style={styles.padded}>
          <TodayMealCard meal={next} recipe={nextRecipe} />
        </FadeInView>
      ) : null}

      {later.length > 0 ? (
        <FadeInView delay={delay()}>
          <UpcomingMeals meals={later} recipesById={recipesById} />
        </FadeInView>
      ) : null}

      {nutrition ? (
        <FadeInView delay={delay()} style={styles.padded}>
          <NutritionCard nutrition={nutrition} onOpenDiary={onOpenDiary} />
        </FadeInView>
      ) : null}

      <FadeInView delay={delay()} style={styles.padded}>
        <BudgetCard plan={plan} monthSavingsCents={monthSavingsCents} />
      </FadeInView>

      {!endingSoon ? (
        <FadeInView delay={delay()} style={styles.padded}>
          {newList}
        </FadeInView>
      ) : null}
    </>
  );
}

function NoPlanContent({ nutrition, onCreate, onOpenDiary }: ContentProps) {
  return (
    <>
      <FadeInView style={styles.padded}>
        <EmptyState
          icon="plate"
          title={t.emptyTitle}
          body={t.emptyBody}
          action={{ label: t.emptyCta, onPress: onCreate }}
        />
      </FadeInView>
      {nutrition ? (
        <FadeInView delay={STAGGER_MS} style={styles.padded}>
          <NutritionCard nutrition={nutrition} onOpenDiary={onOpenDiary} />
        </FadeInView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg + spacing.xs,
  },
});
