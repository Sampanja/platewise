import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeImage } from '@/components/RecipeImage';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  Chip,
  EmptyState,
  haptics,
  Icon,
  IconButton,
  PressableScale,
  Skeleton,
  Text,
  TextField,
  type IconName,
} from '@/components/ui';
import { RECIPES_BY_ID } from '@/data/catalog';
import { useSearchableFoods } from '@/data/foods';
import { useActivePlan } from '@/data/hooks';
import { useDiaryStore } from '@/data/stores/diary';
import { useFavoritesStore } from '@/data/stores/favorites';
import { useMyMealsStore } from '@/data/stores/myMeals';
import type { DiaryMeal, Food, OwnRecipe, Recipe, SavedMeal } from '@/data/types';
import { ownRecipeId, ownRecipePerServing, savedMealEntries, savedMealMacros } from '@/domain/diary';
import { searchFoods } from '@/features/diary/searchFoods';
import { format, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.diaryAdd;
type Tab = 'search' | 'mine' | 'recipes';
const TABS: readonly Tab[] = ['search', 'mine', 'recipes'];

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
  | { type: 'heading'; key: string; title: string }
  | { type: 'food'; key: string; food: Food }
  | { type: 'recipe'; key: string; recipe: Recipe }
  | { type: 'savedMeal'; key: string; meal: SavedMeal }
  | { type: 'ownRecipe'; key: string; recipe: OwnRecipe }
  | { type: 'action'; key: string; icon: IconName; title: string; href: Href };

export default function DiaryAddScreen() {
  const params = useLocalSearchParams<{ meal?: DiaryMeal; date?: string; tab?: Tab }>();
  const meal: DiaryMeal = params.meal ?? 'snack';
  const date = params.date ?? today();
  const [tab, setTab] = useState<Tab>(params.tab && TABS.includes(params.tab) ? params.tab : 'search');
  const [query, setQuery] = useState('');
  const { foods, isPending } = useSearchableFoods();
  const recentIds = useDiaryStore((s) => s.recentFoodIds);
  const favoriteFoodIds = useDiaryStore((s) => s.favoriteFoodIds);
  const addEntry = useDiaryStore((s) => s.add);
  const addMany = useDiaryStore((s) => s.addMany);
  const removeEntry = useDiaryStore((s) => s.remove);
  const savedMeals = useMyMealsStore((s) => s.meals);
  const ownRecipes = useMyMealsStore((s) => s.recipes);
  const plan = useActivePlan();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const context = { meal, date };

  const searchRows = useMemo<Row[]>(() => {
    const byId = new Map(foods.map((food) => [food.id, food]));
    if (query.trim()) {
      return searchFoods(foods, query).map((food) => ({ type: 'food', key: food.id, food }));
    }
    const rows: Row[] = [];
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
  }, [foods, query, recentIds, favoriteFoodIds]);

  const mineRows = useMemo<Row[]>(() => {
    const rows: Row[] = [
      { type: 'action', key: 'new-food', icon: 'plus', title: strings.mine.newFood, href: { pathname: '/custom-food', params: { mode: 'own', ...context } } },
      { type: 'action', key: 'new-recipe', icon: 'chef', title: strings.mine.newRecipe, href: '/my-recipe' },
    ];
    if (savedMeals.length > 0) {
      rows.push({ type: 'heading', key: 'h-meals', title: strings.mine.meals });
      savedMeals.forEach((saved) => rows.push({ type: 'savedMeal', key: `m-${saved.id}`, meal: saved }));
    }
    if (ownRecipes.length > 0) {
      rows.push({ type: 'heading', key: 'h-recipes', title: strings.mine.recipes });
      ownRecipes.forEach((recipe) => rows.push({ type: 'ownRecipe', key: `o-${recipe.id}`, recipe }));
    }
    const ownFoods = foods.filter((food) => food.source && food.source !== 'fineli');
    if (ownFoods.length > 0) {
      rows.push({ type: 'heading', key: 'h-foods', title: strings.mine.foods });
      ownFoods.forEach((food) => rows.push({ type: 'food', key: `c-${food.id}`, food }));
    }
    return rows;
    // context is derived from meal and date
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedMeals, ownRecipes, foods, meal, date]);

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

  const confirmAdded = (message: string, undo: () => void) => {
    haptics.success();
    showToast(message, { label: strings.common.undo, onPress: undo });
    router.back();
  };

  const addRecipe = (recipe: Recipe) => {
    const entry = addEntry({
      date,
      meal,
      name: recipe.title,
      basis: { kind: 'recipe', recipeId: recipe.id, perServing: recipe.perServing },
      quantity: 1,
      estimate: false,
    });
    confirmAdded(format(t.added, { name: recipe.title }), () => removeEntry(entry.id));
  };

  const addOwnRecipe = (recipe: OwnRecipe) => {
    const entry = addEntry({
      date,
      meal,
      name: recipe.name,
      basis: { kind: 'recipe', recipeId: ownRecipeId(recipe.id), perServing: ownRecipePerServing(recipe) },
      quantity: 1,
      estimate: false,
    });
    confirmAdded(format(strings.mine.addedRecipe, { name: recipe.name }), () => removeEntry(entry.id));
  };

  const addSavedMeal = (saved: SavedMeal) => {
    const before = new Set(useDiaryStore.getState().entries.map((e) => e.id));
    addMany(savedMealEntries(saved, date, meal));
    const added = useDiaryStore.getState().entries.filter((e) => !before.has(e.id));
    confirmAdded(format(strings.mine.addedMeal, { name: saved.name, count: saved.items.length }), () =>
      added.forEach((e) => removeEntry(e.id)),
    );
  };

  const rows = tab === 'search' ? searchRows : tab === 'mine' ? mineRows : recipeRows;
  const tabLabel = (value: Tab) => (value === 'search' ? t.tabSearch : value === 'mine' ? strings.mine.tab : t.tabRecipes);

  const METHODS: { icon: IconName; label: string; a11y: string; href: Href }[] = [
    { icon: 'camera', label: strings.methods.photo, a11y: strings.methods.photoA11y, href: { pathname: '/camera', params: { mode: 'photo', ...context } } },
    { icon: 'barcode', label: strings.methods.barcode, a11y: strings.methods.barcodeA11y, href: { pathname: '/camera', params: { mode: 'barcode', ...context } } },
    { icon: 'label', label: strings.methods.label, a11y: strings.methods.labelA11y, href: { pathname: '/camera', params: { mode: 'label', ...context } } },
    { icon: 'flame', label: strings.methods.quick, a11y: strings.methods.quickA11y, href: { pathname: '/quick-add', params: context } },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader variant="close" title={format(t.title, { meal: strings.diaryMeals[meal] })} />
      <View style={styles.methods}>
        {METHODS.map((method) => (
          <PressableScale
            key={method.label}
            onPress={() => router.push(method.href)}
            accessibilityRole="button"
            accessibilityLabel={method.a11y}
            style={styles.method}
          >
            <View style={styles.methodIcon}>
              <Icon name={method.icon} size={22} color="accentText" />
            </View>
            <Text variant="label" numberOfLines={1}>
              {method.label}
            </Text>
          </PressableScale>
        ))}
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((value) => {
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
                {tabLabel(value)}
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

      {tab === 'search' && isPending ? (
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
            switch (item.type) {
              case 'heading':
                return (
                  <Text variant="overline" color="textSubtle" accessibilityRole="header" style={styles.heading}>
                    {item.title}
                  </Text>
                );
              case 'action':
                return (
                  <PressableScale onPress={() => router.push(item.href)} accessibilityRole="button" style={styles.action}>
                    <View style={styles.methodIcon}>
                      <Icon name={item.icon} size={20} color="accentText" />
                    </View>
                    <Text variant="bodyStrong" style={styles.flex}>
                      {item.title}
                    </Text>
                    <Icon name="chevronRight" size={18} color="textSubtle" />
                  </PressableScale>
                );
              case 'food': {
                const custom = item.food.source && item.food.source !== 'fineli';
                return (
                  <PressableScale
                    onPress={() => router.push({ pathname: '/food/[id]', params: { id: item.food.id, meal, date } })}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.food.name}, ${format(t.per100, { kcal: formatInteger(item.food.per100g.kcal) })}`}
                    style={styles.row}
                  >
                    <View style={styles.flex}>
                      <Text variant="body">{item.food.brand ? `${item.food.name} · ${item.food.brand}` : item.food.name}</Text>
                      <Text variant="caption" color="textSubtle">
                        {format(t.per100, { kcal: formatInteger(item.food.per100g.kcal) })}
                      </Text>
                    </View>
                    {custom && item.food.source ? <Chip label={strings.source[item.food.source]} /> : null}
                    <Icon name="chevronRight" size={18} color="textSubtle" />
                  </PressableScale>
                );
              }
              case 'savedMeal': {
                const kcal = savedMealMacros(item.meal).kcal;
                return (
                  <PressableScale
                    onPress={() => addSavedMeal(item.meal)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.meal.name}, ${format(strings.mine.mealItems, {
                      count: item.meal.items.length,
                      kcal: formatInteger(kcal),
                    })}`}
                    style={styles.row}
                  >
                    <Icon name="layers" size={22} color="accentText" />
                    <View style={styles.flex}>
                      <Text variant="body">{item.meal.name}</Text>
                      <Text variant="caption" color="textSubtle">
                        {format(strings.mine.mealItems, { count: item.meal.items.length, kcal: formatInteger(kcal) })}
                      </Text>
                    </View>
                    <Icon name="plus" size={20} color="accentText" />
                  </PressableScale>
                );
              }
              case 'ownRecipe': {
                const perServing = ownRecipePerServing(item.recipe);
                return (
                  <View style={styles.row}>
                    <PressableScale
                      onPress={() => addOwnRecipe(item.recipe)}
                      accessibilityRole="button"
                      accessibilityLabel={format(t.recipeQuickAdd, { title: item.recipe.name })}
                      style={[styles.flex, styles.inlineRow]}
                    >
                      <Icon name="chef" size={22} color="accentText" />
                      <View style={styles.flex}>
                        <Text variant="body">{item.recipe.name}</Text>
                        <Text variant="caption" color="textSubtle">
                          {format(strings.mine.recipeServing, {
                            kcal: formatInteger(perServing.kcal),
                            servings: item.recipe.servings,
                          })}
                        </Text>
                      </View>
                      <Icon name="plus" size={20} color="accentText" />
                    </PressableScale>
                    <IconButton
                      icon="pencil"
                      variant="plain"
                      size={40}
                      accessibilityLabel={`${strings.common.edit}: ${item.recipe.name}`}
                      onPress={() => router.push({ pathname: '/my-recipe', params: { id: item.recipe.id } })}
                    />
                  </View>
                );
              }
              case 'recipe':
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
            }
          }}
          ListFooterComponent={
            tab === 'mine' && savedMeals.length === 0 && ownRecipes.length === 0 ? (
              <EmptyState icon="layers" title={strings.mine.emptyTitle} body={strings.mine.emptyBody} />
            ) : undefined
          }
          ListEmptyComponent={
            tab === 'search' ? (
              <EmptyState icon="search" title={t.noResultsTitle} body={t.noResultsBody} />
            ) : tab === 'recipes' ? (
              <EmptyState icon="recipes" title={t.noRecipesTitle} body={t.noRecipesBody} />
            ) : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    methods: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    method: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
      minHeight: 76,
      justifyContent: 'center',
    },
    methodIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
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
    inlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 60,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
    },
    thumb: {
      width: 48,
      height: 48,
      borderRadius: radii.sm,
    },
  }),
);
