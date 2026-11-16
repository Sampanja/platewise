import { router } from 'expo-router';
import { memo, useCallback, type ReactElement } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { Button, EmptyState, Icon, PressableScale, Text } from '@/components/ui';
import { useMyMealsStore } from '@/data/stores/myMeals';
import type { OwnRecipe } from '@/data/types';
import { ownRecipePerServing } from '@/domain/diary';
import { format, formatInteger, strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.myRecipes;

export type MyRecipesListProps = {
  /** The tab's title and segments, scrolled with the list. */
  header: ReactElement;
  bottomSpace: number;
};

/** Reseptit → Omat: the user's own recipes. Visible only to them. */
export function MyRecipesList({ header, bottomSpace }: MyRecipesListProps) {
  const recipes = useMyMealsStore((s) => s.recipes);
  const create = () => router.push('/my-recipe');
  const renderItem = useCallback<ListRenderItem<OwnRecipe>>(({ item }) => <OwnRecipeRow recipe={item} />, []);

  return (
    <FlatList
      data={recipes}
      keyExtractor={(recipe) => recipe.id}
      renderItem={renderItem}
      contentContainerStyle={[styles.list, { paddingBottom: bottomSpace }]}
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          <Text variant="body" color="textMuted">
            {t.intro}
          </Text>
          <Button label={t.create} variant="secondary" icon={<Icon name="chef" size={20} />} onPress={create} />
        </View>
      }
      ListEmptyComponent={<EmptyState icon="chef" mascot="cooking" title={t.emptyTitle} body={t.emptyBody} />}
    />
  );
}

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
      width: 44,
      height: 44,
      borderRadius: radii.md,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    texts: {
      flex: 1,
      gap: 2,
    },
  }),
);
