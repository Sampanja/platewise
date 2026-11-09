import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeCard } from '@/components/RecipeCard';
import { useTabBarSpace } from '@/components/TabBar';
import {
  EmptyState,
  Icon,
  IconButton,
  PressableScale,
  SelectChip,
  Skeleton,
  Text,
  TextField,
} from '@/components/ui';
import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { useServingPrice, useUserRules } from '@/data/hooks';
import { useRecipesQuery } from '@/data/queries';
import { useFavoritesStore } from '@/data/stores/favorites';
import {
  filterRecipes,
  RECIPE_FILTERS,
  type RecipeFilter,
  type RecipeSort,
} from '@/domain/recipeFilters';
import { checkRecipe } from '@/domain/recipes';
import { format, strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.recipes;
const SORTS: readonly RecipeSort[] = ['recommended', 'price', 'time', 'kcal'];

export default function RecipesScreen() {
  const tabBarSpace = useTabBarSpace();
  const { width } = useWindowDimensions();
  // Two columns; a lone last card keeps its column width instead of stretching.
  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;
  const recipesQuery = useRecipesQuery();
  const rules = useUserRules();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const servingPrice = useServingPrice();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilter[]>([]);
  const [sort, setSort] = useState<RecipeSort>('recommended');

  // Allergies and diets are applied before anything else, with the same check as plans.
  const { allowed, hiddenCount } = useMemo(() => {
    const all = recipesQuery.data ?? [];
    const ok = all.filter((recipe) => checkRecipe(recipe, INGREDIENTS_BY_ID, rules).ok);
    return { allowed: ok, hiddenCount: all.length - ok.length };
  }, [recipesQuery.data, rules]);

  const visible = useMemo(
    () =>
      filterRecipes(allowed, {
        query,
        filters,
        sort,
        context: { favoriteIds, servingPrice },
        index: INGREDIENTS_BY_ID,
      }),
    [allowed, query, filters, sort, favoriteIds, servingPrice],
  );

  const toggleFilter = (filter: RecipeFilter) =>
    setFilters((current) =>
      current.includes(filter) ? current.filter((f) => f !== filter) : [...current, filter],
    );
  const clearAll = () => {
    setQuery('');
    setFilters([]);
  };
  const onlyFavorites = filters.length === 1 && filters[0] === 'favorites' && query === '';

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text variant="displayLarge" accessibilityRole="header">
          {t.title}
        </Text>
        {recipesQuery.data ? (
          <Text variant="label" color="textSubtle">
            {visible.length === 1 ? t.countOne : format(t.count, { count: visible.length })}
          </Text>
        ) : null}
      </View>

      <TextField
        icon="search"
        value={query}
        onChangeText={setQuery}
        placeholder={t.searchPlaceholder}
        accessibilityLabel={t.searchA11y}
        returnKeyType="search"
        autoCorrect={false}
        trailing={
          query ? (
            <IconButton
              icon="close"
              variant="plain"
              size={32}
              accessibilityLabel={t.clearSearch}
              onPress={() => setQuery('')}
            />
          ) : null
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.bleed}
      >
        {RECIPE_FILTERS.map((filter) => (
          <SelectChip
            key={filter}
            label={t.filters[filter]}
            icon={filter === 'favorites' ? 'heart' : undefined}
            selected={filters.includes(filter)}
            onPress={() => toggleFilter(filter)}
          />
        ))}
      </ScrollView>

      <View style={styles.sortRow} accessibilityRole="radiogroup" accessibilityLabel={t.sort.label}>
        <Icon name="sort" size={18} color="textSubtle" />
        {SORTS.map((value) => {
          const selected = sort === value;
          return (
            <PressableScale
              key={value}
              haptic="select"
              onPress={() => setSort(value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={format(t.sortA11y, { value: t.sort[value] })}
              style={[styles.sortOption, selected && styles.sortSelected]}
            >
              <Text variant="label" color={selected ? 'accentText' : 'textMuted'}>
                {t.sort[value]}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {hiddenCount > 0 ? (
        <PressableScale
          onPress={() => router.push({ pathname: '/profile-edit/[section]', params: { section: 'allergies' } })}
          accessibilityRole="button"
          style={styles.hidden}
        >
          <Icon name="shield" size={18} color="textSubtle" />
          <Text variant="caption" color="textSubtle" style={styles.flex}>
            {hiddenCount === 1 ? t.hiddenByAllergiesOne : format(t.hiddenByAllergies, { count: hiddenCount })}
          </Text>
          <Icon name="chevronRight" size={16} color="textSubtle" />
        </PressableScale>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {recipesQuery.isPending ? (
        <ScrollView contentContainerStyle={styles.list}>
          {header}
          <View style={styles.skeletonGrid} accessible accessibilityLabel={strings.common.loading}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <Skeleton height={150} radius={radii.lg} />
                <Skeleton height={16} width="80%" />
                <Skeleton height={14} width="50%" />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(recipe) => recipe.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarSpace }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={header}
          renderItem={({ item }) => <RecipeCard recipe={item} style={{ width: cardWidth }} />}
          ListEmptyComponent={
            onlyFavorites ? (
              <EmptyState icon="heart" mascot="happy" title={t.favoritesEmptyTitle} body={t.favoritesEmptyBody} />
            ) : (
              <EmptyState
                icon="search"
                mascot="thinking"
                title={t.emptyTitle}
                body={t.emptyBody}
                action={{ label: t.emptyCta, onPress: clearAll, variant: 'secondary' }}
              />
            )
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
    list: {
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    header: {
      gap: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.xs,
    },
    bleed: {
      marginHorizontal: -spacing.lg,
    },
    chips: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    sortOption: {
      minHeight: 36,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radii.pill,
    },
    sortSelected: {
      backgroundColor: colors.accentSoft,
    },
    hidden: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 44,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.surface,
    },
    flex: {
      flex: 1,
    },
    column: {
      gap: spacing.md,
    },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    skeletonCard: {
      width: '47%',
      gap: spacing.sm,
    },
  }),
);
