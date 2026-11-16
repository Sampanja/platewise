import { router } from 'expo-router';
import { memo, useCallback, useMemo, type ReactElement } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { RecipeImage } from '@/components/RecipeImage';
import { Button, Chip, EmptyState, Icon, PressableScale, Text } from '@/components/ui';
import { importedAsRecipe } from '@/data/catalog/imported';
import { useImportedRecipesStore } from '@/data/stores/importedRecipes';
import { useMyMealsStore } from '@/data/stores/myMeals';
import type { ImportedRecipe, OwnRecipe } from '@/data/types';
import { ownRecipePerServing } from '@/domain/diary';
import { format, formatInteger, strings } from '@/i18n';
import { sourceHost } from '@/services/recipeImport';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.myRecipes;

type Item = { kind: 'imported'; recipe: ImportedRecipe } | { kind: 'own'; recipe: OwnRecipe };

export type MyRecipesListProps = {
  /** The tab's title and segments, scrolled with the list. */
  header: ReactElement;
  bottomSpace: number;
};

/** Reseptit → Omat: imported recipes and the user's own diary recipes. Visible only to them. */
export function MyRecipesList({ header, bottomSpace }: MyRecipesListProps) {
  const own = useMyMealsStore((s) => s.recipes);
  const imported = useImportedRecipesStore((s) => s.recipes);
  const items = useMemo<Item[]>(
    () => [...imported.map((recipe) => ({ kind: 'imported' as const, recipe })), ...own.map((recipe) => ({ kind: 'own' as const, recipe }))],
    [imported, own],
  );
  const renderItem = useCallback<ListRenderItem<Item>>(
    ({ item }) => (item.kind === 'imported' ? <ImportedRow recipe={item.recipe} /> : <OwnRecipeRow recipe={item.recipe} />),
    [],
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `${item.kind}:${item.recipe.id}`}
      renderItem={renderItem}
      contentContainerStyle={[styles.list, { paddingBottom: bottomSpace }]}
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          <Text variant="body" color="textMuted">
            {t.intro}
          </Text>
          <Button label={strings.recipeImport.fromLink} icon={<Icon name="link" size={20} color="textOnAccent" />} onPress={() => router.push('/import-recipe')} />
          <Button label={t.create} variant="secondary" icon={<Icon name="chef" size={20} />} onPress={() => router.push('/my-recipe')} />
        </View>
      }
      ListEmptyComponent={<EmptyState icon="chef" mascot="cooking" title={t.emptyTitle} body={t.emptyBody} />}
    />
  );
}

const ImportedRow = memo(function ImportedRow({ recipe }: { recipe: ImportedRecipe }) {
  const asRecipe = importedAsRecipe(recipe);
  const kcal = format(t.perServing, { kcal: formatInteger(asRecipe.perServing.kcal) });
  const source = recipe.sourceUrl ? sourceHost(recipe.sourceUrl) : strings.recipeImport.manualTitle;
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/imported/[id]', params: { id: recipe.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${recipe.title}, ${source}, ${kcal}`}
      style={styles.row}
    >
      <RecipeImage recipe={asRecipe} style={styles.thumb} />
      <View style={styles.texts}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.meta}>
          <Chip label={strings.recipeImport.importedChip} tone="accent" />
          <Text variant="caption" color="textSubtle" numberOfLines={1} style={styles.flex}>
            {`${source} · ${kcal}`}
          </Text>
        </View>
      </View>
      <Icon name="chevronRight" size={18} color="textSubtle" />
    </PressableScale>
  );
});

const OwnRecipeRow = memo(function OwnRecipeRow({ recipe }: { recipe: OwnRecipe }) {
  const kcal = formatInteger(ownRecipePerServing(recipe).kcal);
  const servings = format(t.servings, { count: recipe.servings });
  const perServing = format(t.perServing, { kcal });
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/my-recipe', params: { id: recipe.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${recipe.name}, ${servings}, ${perServing}`}
      style={styles.row}
    >
      <View style={styles.icon}>
        <Icon name="chef" size={22} color="accentText" />
      </View>
      <View style={styles.texts}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {recipe.name}
        </Text>
        <Text variant="caption" color="textSubtle">
          {`${servings} · ${perServing}`}
        </Text>
      </View>
      <Icon name="chevronRight" size={18} color="textSubtle" />
    </PressableScale>
  );
});

const styles = themedStyles(() =>
  StyleSheet.create({
    list: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    header: {
      gap: spacing.md,
      paddingBottom: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 64,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    icon: {
      width: 52,
      height: 52,
      borderRadius: radii.md,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    thumb: {
      width: 52,
      height: 52,
      borderRadius: radii.md,
    },
    texts: {
      flex: 1,
      gap: 2,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    flex: {
      flex: 1,
    },
  }),
);
