import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeImage } from '@/components/RecipeImage';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  EmptyState,
  haptics,
  Icon,
  IconButton,
  PressableScale,
  Skeleton,
  Text,
  TextField,
} from '@/components/ui';
import { RECIPES_BY_ID } from '@/data/catalog';
import { useActivePlan } from '@/data/hooks';
import { useFoodsQuery } from '@/data/queries';
import { useDiaryStore } from '@/data/stores/diary';
import { useFavoritesStore } from '@/data/stores/favorites';
import type { DiaryMeal, Food, Recipe } from '@/data/types';
import { format, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { searchFoods } from '@/features/diary/searchFoods';
import { colors, radii, spacing } from '@/theme';

const t = strings.diaryAdd;

/** Common foods shown before the user types anything. */
const POPULAR_IDS = [
  'oat-porridge-milk',
  'rye-bread',
  'banana',
  'apple',
  'coffee-milk',
  'egg-boiled',
  'yogurt-plain',
  'chicken-breast',
  'potato-boiled',
  'rice-cooked',
  'mixed-salad',
  'edam',
];

type Row =
  | { type: 'quick'; key: string }
  | { type: 'heading'; key: string; title: string }
  | { type: 'food'; key: string; food: Food }
  | { type: 'recipe'; key: string; recipe: Recipe };

export default function DiaryAddScreen() {
  const params = useLocalSearchParams<{ meal?: DiaryMeal; date?: string; tab?: 'search' | 'recipes' }>();
  const meal: DiaryMeal = params.meal ?? 'snack';
  const date = params.date ?? today();
  const [tab, setTab] = useState<'search' | 'recipes'>(params.tab === 'recipes' ? 'recipes' : 'search');
  const [query, setQuery] = useState('');
  const foodsQuery = useFoodsQuery();
  const recentIds = useDiaryStore((s) => s.recentFoodIds);
  const favoriteFoodIds = useDiaryStore((s) => s.favoriteFoodIds);
  const addEntry = useDiaryStore((s) => s.add);
  const removeEntry = useDiaryStore((s) => s.remove);
  const plan = useActivePlan();
  const favoriteIds = useFavoritesStore((s) => s.ids);

  const searchRows = useMemo<Row[]>(() => {
    const foods = foodsQuery.data ?? [];
    const byId = new Map(foods.map((food) => [food.id, food]));
    if (query.trim()) {
      return searchFoods(foods, query).map((food) => ({ type: 'food', key: food.id, food }));
    }
    const rows: Row[] = [{ type: 'quick', key: 'quick' }];
    const favorites = favoriteFoodIds.map((id) => byId.get(id)).filter((f): f is Food => f !== undefined);
    if (favorites.length > 0) {
      rows.push({ type: 'heading', key: 'h-fav-foods', title: strings.foodFavorites.title });
      favorites.forEach((food) => rows.push({ type: 'food', key: `f-${food.id}`, food }));
    }
    const recent = recentIds
      .filter((id) => !favoriteFoodIds.includes(id))
      .map((id) => byId.get(id))
      .filter((f): f is Food => f !== undefined);
    if (recent.length > 0) {
      rows.push({ type: 'heading', key: 'h-recent', title: t.recent });
      recent.forEach((food) => rows.push({ type: 'food', key: `r-${food.id}`, food }));
    }
    rows.push({ type: 'heading', key: 'h-popular', title: t.popular });
    POPULAR_IDS.map((id) => byId.get(id))
      .filter((f): f is Food => f !== undefined && !recentIds.includes(f.id) && !favoriteFoodIds.includes(f.id))
      .forEach((food) => rows.push({ type: 'food', key: `p-${food.id}`, food }));
    return rows;
  }, [foodsQuery.data, query, recentIds, favoriteFoodIds]);

  const recipeRows = useMemo<Row[]>(() => {
    const rows: Row[] = [];
    const planIds = [...new Set(plan?.meals.map((m) => m.recipeId) ?? [])];
    if (planIds.length > 0) {
      rows.push({ type: 'heading', key: 'h-plan', title: t.fromPlan });
      planIds
        .map((id) => RECIPES_BY_ID[id])
        .filter(Boolean)
        .forEach((recipe) => rows.push({ type: 'recipe', key: `plan-${recipe.id}`, recipe }));
    }
    const favorites = favoriteIds.map((id) => RECIPES_BY_ID[id]).filter(Boolean);
    if (favorites.length > 0) {
      rows.push({ type: 'heading', key: 'h-fav', title: t.fromFavorites });
      favorites.forEach((recipe) => rows.push({ type: 'recipe', key: `fav-${recipe.id}`, recipe }));
    }
    return rows;
  }, [plan, favoriteIds]);

  const addRecipe = (recipe: Recipe) => {
    const entry = addEntry({
      date,
      meal,
      name: recipe.title,
      basis: { kind: 'recipe', recipeId: recipe.id, perServing: recipe.perServing },
      quantity: 1,
      estimate: false,
    });
    haptics.success();
    showToast(format(t.added, { name: recipe.title }), {
      label: strings.common.undo,
      onPress: () => removeEntry(entry.id),
    });
    router.back();
  };

  const rows = tab === 'search' ? searchRows : recipeRows;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader variant="close" title={format(t.title, { meal: strings.diaryMeals[meal] })} />
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['search', 'recipes'] as const).map((value) => {
          const selected = tab === value;
          return (
            <PressableScale
              key={value}
              haptic="select"
              onPress={() => setTab(value)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <Text variant="bodyStrong" color={selected ? 'textOnAccent' : 'textMuted'}>
                {value === 'search' ? t.tabSearch : t.tabRecipes}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {tab === 'search' ? (
        <View style={styles.search}>
          <TextField
            icon="search"
            value={query}
            onChangeText={setQuery}
            placeholder={t.searchPlaceholder}
            accessibilityLabel={t.searchPlaceholder}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            trailing={
              query ? (
                <IconButton
                  icon="close"
                  variant="plain"
                  size={32}
                  accessibilityLabel={strings.recipes.clearSearch}
                  onPress={() => setQuery('')}
                />
              ) : null
            }
          />
        </View>
      ) : null}

      {tab === 'search' && foodsQuery.isPending ? (
        <View style={styles.skeletons} accessible accessibilityLabel={strings.common.loading}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={56} radius={radii.md} />
          ))}
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.key}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if (item.type === 'quick') {
              return (
                <PressableScale
                  onPress={() => router.push({ pathname: '/quick-add', params: { meal, date } })}
                  accessibilityRole="button"
                  accessibilityHint={strings.quickAdd.actionHint}
                  style={styles.quick}
                >
                  <View style={styles.quickIcon}>
                    <Icon name="flame" size={20} color="accentText" />
                  </View>
                  <View style={styles.flex}>
                    <Text variant="bodyStrong">{strings.quickAdd.action}</Text>
                    <Text variant="caption" color="textSubtle">
                      {strings.quickAdd.actionHint}
                    </Text>
                  </View>
                  <Icon name="chevronRight" size={18} color="textSubtle" />
                </PressableScale>
              );
            }
            if (item.type === 'heading') {
              return (
                <Text variant="overline" color="textSubtle" accessibilityRole="header" style={styles.heading}>
                  {item.title}
                </Text>
              );
            }
            if (item.type === 'food') {
              return (
                <PressableScale
                  onPress={() =>
                    router.push({ pathname: '/food/[id]', params: { id: item.food.id, meal, date } })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${item.food.name}, ${format(t.per100, { kcal: formatInteger(item.food.per100g.kcal) })}`}
                  style={styles.row}
                >
                  <View style={styles.flex}>
                    <Text variant="body">{item.food.name}</Text>
                    <Text variant="caption" color="textSubtle">
                      {format(t.per100, { kcal: formatInteger(item.food.per100g.kcal) })}
                    </Text>
                  </View>
                  <Icon name="chevronRight" size={18} color="textSubtle" />
                </PressableScale>
              );
            }
            return (
              <PressableScale
                onPress={() => addRecipe(item.recipe)}
                accessibilityRole="button"
                accessibilityLabel={format(t.recipeQuickAdd, { title: item.recipe.title })}
                style={styles.row}
              >
                <RecipeImage recipe={item.recipe} style={styles.thumb} />
                <View style={styles.flex}>
                  <Text variant="body" numberOfLines={2}>
                    {item.recipe.title}
                  </Text>
                  <Text variant="caption" color="textSubtle">
                    {`${format(strings.common.kcal, { value: formatInteger(item.recipe.perServing.kcal) })} ${strings.common.perServing}`}
                  </Text>
                </View>
                <Icon name="plus" size={20} color="accentText" />
              </PressableScale>
            );
          }}
          ListEmptyComponent={
            tab === 'search' ? (
              <EmptyState icon="search" title={t.noResultsTitle} body={t.noResultsBody} />
            ) : (
              <EmptyState icon="recipes" title={t.noRecipesTitle} body={t.noRecipesBody} />
            )
          }
        />
      )}
    </SafeAreaView>
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    padding: spacing.xs,
    gap: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  tabSelected: {
    backgroundColor: colors.accent,
  },
  search: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skeletons: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  heading: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 60,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  quick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
  },
});
