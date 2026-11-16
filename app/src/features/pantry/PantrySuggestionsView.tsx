import { router } from 'expo-router';
import { memo, useCallback, useMemo, useState, type ReactElement } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, View, type SectionListRenderItem } from 'react-native';

import { openRecipe } from '@/components/RecipeCard';
import { RecipeImage } from '@/components/RecipeImage';
import { TestModeBanner } from '@/components/TestModeBanner';
import { Button, Card, EmptyState, haptics, Icon, PressableScale, Skeleton, Text } from '@/components/ui';
import { useActivePlan, useUserRules } from '@/data/hooks';
import { useAllowedRecipesQuery } from '@/data/queries';
import { usePantryStore } from '@/data/stores/pantry';
import { STANDALONE_LIST, usePlansStore } from '@/data/stores/plans';
import type { Recipe } from '@/data/types';
import { expiringItems, pantrySuggestions, type PantrySuggestion } from '@/domain/pantry';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { useCharacter } from '@/features/mascot/useCharacter';
import { format, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { recipeGeneration } from '@/services/recipeGeneration';
import { colors, radii, spacing, themedStyles } from '@/theme';

import { ingredientName } from './format';

const t = strings.pantrySuggest;
/** Below this many "ready" recipes the view offers to create one from the pantry. */
const FEW_READY = 3;

type Section = { key: 'ready' | 'almost'; title: string; data: PantrySuggestion[] };

export type PantrySuggestionsViewProps = {
  /** The tab's title and segments, scrolled with the list. */
  header: ReactElement;
  bottomSpace: number;
};

/**
 * Reseptit → Varastosta ("Mitä voin tehdä nyt"): library recipes that can be
 * made from the pantry, the ones using soon-expiring food first. Only the
 * user's allowed recipes are considered (isRecipeAllowed via the query).
 */
export function PantrySuggestionsView({ header, bottomSpace }: PantrySuggestionsViewProps) {
  const recipesQuery = useAllowedRecipesQuery();
  const items = usePantryStore((s) => s.items);
  const rules = useUserRules();
  const { voice } = useCharacter();
  const plan = useActivePlan();
  const addItems = usePlansStore((s) => s.addItems);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Recipe | null | 'none'>(null);
  const now = today();

  const suggestions = useMemo(
    () => pantrySuggestions(recipesQuery.data ?? [], items, rules.pantry, now),
    [recipesQuery.data, items, rules.pantry, now],
  );
  const sections = useMemo<Section[]>(
    () =>
      [
        { key: 'ready' as const, title: t.readyTitle, data: suggestions.ready },
        { key: 'almost' as const, title: t.almostTitle, data: suggestions.almost },
      ].filter((section) => section.data.length > 0),
    [suggestions],
  );

  const addMissing = useCallback(
    (suggestion: PantrySuggestion) => {
      const grams = (id: string) =>
        suggestion.recipe.ingredients.filter((i) => i.ingredientId === id).reduce((sum, i) => sum + i.grams, 0);
      addItems(plan?.id ?? STANDALONE_LIST, suggestion.missing.map((id) => ({ ingredientId: id, grams: grams(id) })));
      haptics.success();
      showToast(format(t.addedMissing, { items: suggestion.missing.map(ingredientName).join(', ') }), {
        label: strings.plan.openList,
        onPress: () => router.push('/shopping-list'),
      });
    },
    [addItems, plan?.id],
  );

  const generate = async () => {
    if (!recipesQuery.data || generating) return;
    setGenerating(true);
    try {
      const expiringFirst = [...new Set([...expiringItems(items, now, 3).map((i) => i.ingredientId), ...items.map((i) => i.ingredientId)])];
      const shown = new Set([...suggestions.ready, ...suggestions.almost].map((s) => s.recipe.id));
      const result = await recipeGeneration.fromIngredients({
        ingredientIds: expiringFirst,
        allowed: recipesQuery.data,
        exclude: shown,
        staples: rules.pantry,
      });
      setGenerated(result ? result.recipe : 'none');
    } catch {
      showToast(t.generateError);
    } finally {
      setGenerating(false);
    }
  };

  const renderItem = useCallback<SectionListRenderItem<PantrySuggestion, Section>>(
    ({ item }) => <SuggestionRow suggestion={item} onAddMissing={addMissing} />,
    [addMissing],
  );

  const pantryHeader = (
    <View style={styles.header}>
      {header}
      {items.length > 0 ? (
        <>
          <MascotSays state="cooking" message={voice.pantry.suggest} size={56} />
          <PressableScale onPress={() => router.push('/pantry')} accessibilityRole="button" style={styles.manage}>
            <Icon name="fridge" size={22} color="accentText" />
            <Text variant="bodyStrong" style={styles.flex}>
              {format(t.summary, { count: items.length })}
            </Text>
            <Text variant="label" color="accentText">
              {t.manage}
            </Text>
            <Icon name="chevronRight" size={16} color="accentText" />
          </PressableScale>
        </>
      ) : null}
    </View>
  );

  if (recipesQuery.isPending) {
    return (
      <View style={[styles.list, styles.flex]}>
        {pantryHeader}
        <View style={styles.skeletons} accessible accessibilityLabel={strings.common.loading}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={88} radius={radii.lg} />
          ))}
        </View>
      </View>
    );
  }

  const fewReady = suggestions.ready.length < FEW_READY;
  const footer =
    items.length > 0 && fewReady ? (
      <View style={styles.footer}>
        {generated && generated !== 'none' ? (
          <Card style={styles.generated}>
            <Text variant="overline" color="accentText">
              {t.generatedTitle}
            </Text>
            {recipeGeneration.mode === 'test' ? <TestModeBanner title={t.testModeTitle} body={t.testModeBody} /> : null}
            <PressableScale onPress={() => openRecipe(generated.id)} accessibilityRole="button" style={styles.row}>
              <RecipeImage recipe={generated} style={styles.thumb} />
              <Text variant="bodyStrong" style={styles.flex} numberOfLines={2}>
                {generated.title}
              </Text>
              <Icon name="chevronRight" size={18} color="textSubtle" />
            </PressableScale>
          </Card>
        ) : null}
        {generated === 'none' ? (
          <Text variant="body" color="textMuted">
            {t.generatedNone}
          </Text>
        ) : null}
        <Button
          label={generating ? t.generating : t.generate}
          variant="secondary"
          disabled={generating}
          icon={generating ? <ActivityIndicator color={colors.accentText} /> : <Icon name="sparkles" size={20} />}
          onPress={() => void generate()}
        />
      </View>
    ) : null;

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.recipe.id}
      renderItem={renderItem}
      renderSectionHeader={({ section }) => (
        <Text variant="heading" accessibilityRole="header" style={styles.sectionTitle}>
          {section.title}
        </Text>
      )}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={[styles.list, { paddingBottom: bottomSpace }]}
      ListHeaderComponent={pantryHeader}
      ListFooterComponent={footer ?? undefined}
      ListEmptyComponent={
        items.length === 0 ? (
          <EmptyState
            icon="fridge"
            mascot="cooking"
            title={t.emptyTitle}
            body={t.emptyBody}
            action={{ label: strings.quick.scanPantry, onPress: () => router.push('/pantry-scan') }}
          />
        ) : (
          <EmptyState icon="chef" mascot="thinking" title={t.noneTitle} body={t.noneBody} />
        )
      }
      initialNumToRender={6}
      windowSize={5}
    />
  );
}

type RowProps = { suggestion: PantrySuggestion; onAddMissing: (suggestion: PantrySuggestion) => void };

const SuggestionRow = memo(function SuggestionRow({ suggestion, onAddMissing }: RowProps) {
  const { recipe, used, missing, expiring } = suggestion;
  // Expiring ingredients first in "Käyttää".
  const usedNames = [...expiring, ...used.filter((id) => !expiring.includes(id))].map(ingredientName);
  return (
    <View style={styles.card}>
      <PressableScale
        onPress={() => openRecipe(recipe.id)}
        accessibilityRole="button"
        accessibilityLabel={`${recipe.title}. ${format(t.uses, { items: usedNames.join(', ') })}`}
        style={styles.row}
      >
        <RecipeImage recipe={recipe} style={styles.thumb} />
        <View style={styles.flex}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text variant="caption" color={expiring.length > 0 ? 'accentText' : 'textSubtle'} numberOfLines={2}>
            {format(t.uses, { items: usedNames.join(', ') })}
          </Text>
        </View>
        <Icon name="chevronRight" size={18} color="textSubtle" />
      </PressableScale>
      {missing.length > 0 ? (
        <View style={styles.missing}>
          <Text variant="caption" color="textMuted" style={styles.flex}>
            {format(t.missing, { items: missing.map(ingredientName).join(', ') })}
          </Text>
          <Button label={t.addMissing} size="compact" variant="secondary" icon={<Icon name="basket" size={16} />} onPress={() => onAddMissing(suggestion)} />
        </View>
      ) : null}
    </View>
  );
});

const styles = themedStyles(() =>
  StyleSheet.create({
    list: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    flex: {
      flex: 1,
    },
    header: {
      gap: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    manage: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 52,
      paddingHorizontal: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.accentSoft,
    },
    skeletons: {
      gap: spacing.sm,
    },
    sectionTitle: {
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    card: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: radii.md,
    },
    missing: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    footer: {
      gap: spacing.md,
      paddingTop: spacing.lg,
    },
    generated: {
      gap: spacing.md,
    },
  }),
);
