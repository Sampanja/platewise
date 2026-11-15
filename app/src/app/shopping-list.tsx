import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import {
  Button,
  Card,
  CheckRow,
  EmptyState,
  haptics,
  Icon,
  IconButton,
  ProgressMeter,
  Text,
} from '@/components/ui';
import { INGREDIENTS_BY_ID, RECIPES_BY_ID } from '@/data/catalog';
import { useCurrentShoppingList } from '@/data/hooks';
import type { PriceRegionCode } from '@/domain/priceRegion';
import { PriceRegionNote } from '@/features/shared/PriceRegionNote';
import { usePlansStore } from '@/data/stores/plans';
import { groupByAisle, type ShoppingItem } from '@/domain/shoppingList';
import { format, formatMoney, strings } from '@/i18n';
import { formatAmount, formatPackage } from '@/lib/amounts';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.shopping;

function itemDetail(item: ShoppingItem): string {
  const ingredient = INGREDIENTS_BY_ID[item.ingredientId];
  const packages = format(t.packages, { count: item.packages, size: formatPackage(ingredient) });
  return `${packages} · ${format(t.need, { amount: formatAmount(ingredient, item.grams) })}`;
}

/** Plain-text list for sharing: aisle headings and one line per item. */
function listAsText(groups: ReturnType<typeof groupByAisle>, totalCents: number, region: PriceRegionCode): string {
  const lines = [t.shareTitle, ''];
  for (const group of groups) {
    lines.push(strings.aisles[group.aisle].toUpperCase());
    for (const item of group.items) {
      const ingredient = INGREDIENTS_BY_ID[item.ingredientId];
      lines.push(`☐ ${ingredient.name} – ${format(t.packages, { count: item.packages, size: formatPackage(ingredient) })}`);
    }
    lines.push('');
  }
  lines.push(`${t.total}: ${formatMoney(totalCents, region)} (${strings.common.priceEstimate})`);
  return lines.join('\n');
}

export default function ShoppingListScreen() {
  const { listId, plan, state, list, region } = useCurrentShoppingList();
  const toggleChecked = usePlansStore((s) => s.toggleChecked);
  const clearChecked = usePlansStore((s) => s.clearChecked);
  const removeExtra = usePlansStore((s) => s.removeExtra);

  const groups = useMemo(() => groupByAisle(list.items, INGREDIENTS_BY_ID), [list.items]);
  const checked = new Set(state.checked);
  const done = list.items.filter((item) => checked.has(item.ingredientId)).length;
  const total = list.items.length;
  const remainingCents = list.items
    .filter((item) => !checked.has(item.ingredientId))
    .reduce((sum, item) => sum + item.costCents, 0);

  const share = async () => {
    try {
      await Share.share({ message: listAsText(groups, list.totalCents, region), title: t.shareTitle });
    } catch {
      // The share sheet was dismissed or is unavailable; nothing to do.
    }
  };
  const copy = async () => {
    await Clipboard.setStringAsync(listAsText(groups, list.totalCents, region));
    haptics.success();
    showToast(t.copied);
  };

  if (total === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title={t.title} />
        <EmptyState
          icon="basket"
          mascot="idle"
          voice="shopping"
          title={t.emptyTitle}
          body={t.emptyBody}
          action={{ label: t.emptyCta, onPress: () => router.replace('/questionnaire') }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t.title}
        trailing={<IconButton icon="share" variant="plain" accessibilityLabel={t.share} onPress={share} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summary}>
          <View style={styles.summaryRow}>
            <View style={styles.flex}>
              <Text variant="overline" color="textSubtle">
                {t.total}
              </Text>
              <Text variant="display" color="accentText" style={styles.tabular}>
                {formatMoney(list.totalCents, region)}
              </Text>
              {plan ? (
                <Text variant="caption" color="textSubtle">
                  {format(t.budgetLine, { budget: formatMoney(plan.budgetCents, region) })} ·{' '}
                  {strings.priceRegions.names[region]}
                </Text>
              ) : null}
            </View>
            <Text variant="heading" style={styles.tabular}>
              {format(t.progress, { done, total })}
            </Text>
          </View>
          <ProgressMeter
            value={done / total}
            tone="success"
            celebrateOnComplete
            accessibilityLabel={format(t.progress, { done, total })}
          />
          {done === total ? (
            <Text variant="bodyStrong" color="success">
              {t.allDone}
            </Text>
          ) : (
            <Text variant="caption" color="textSubtle">
              {`${formatMoney(remainingCents, region)} · ${strings.budget.explainer}`}
            </Text>
          )}
          <View style={styles.actions}>
            <Button
              label={t.copy}
              size="compact"
              variant="secondary"
              icon={<Icon name="copy" size={18} />}
              onPress={copy}
              style={styles.flex}
            />
            <Button
              label={t.share}
              size="compact"
              variant="secondary"
              icon={<Icon name="share" size={18} />}
              onPress={share}
              style={styles.flex}
            />
          </View>
        </Card>

        <PriceRegionNote region={region} />

        {groups.map((group) => (
          <View key={group.aisle} style={styles.group}>
            <Text variant="overline" color="accentText" accessibilityRole="header">
              {strings.aisles[group.aisle]}
            </Text>
            <Card padding="flush" style={styles.groupCard}>
              {group.items.map((item) => (
                <View key={item.ingredientId} style={styles.itemRow}>
                  <View style={styles.flex}>
                    <CheckRow
                      label={INGREDIENTS_BY_ID[item.ingredientId].name}
                      detail={itemDetail(item)}
                      checked={checked.has(item.ingredientId)}
                      onToggle={() => toggleChecked(listId, item.ingredientId)}
                    />
                  </View>
                  <Text variant="label" color="textMuted" style={styles.tabular}>
                    {formatMoney(item.costCents, region)}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        ))}

        {list.pantryItems.length > 0 ? (
          <View style={styles.group}>
            <Text variant="overline" color="textSubtle" accessibilityRole="header">
              {t.fromHomeTitle}
            </Text>
            <Card style={styles.pantry}>
              <Text variant="body" color="textMuted">
                {list.pantryItems
                  .map((item) => INGREDIENTS_BY_ID[item.ingredientId].name)
                  .join(', ')}
              </Text>
              <Text variant="caption" color="textSubtle">
                {t.fromHomeBody}
              </Text>
            </Card>
          </View>
        ) : null}

        {state.extras.length > 0 ? (
          <View style={styles.group}>
            <Text variant="overline" color="textSubtle" accessibilityRole="header">
              {t.extrasTitle}
            </Text>
            <Card padding="flush" style={styles.groupCard}>
              {state.extras.map((extra) => {
                const recipe = RECIPES_BY_ID[extra.recipeId];
                if (!recipe) return null;
                return (
                  <View key={extra.recipeId} style={styles.extraRow}>
                    <Text variant="body" style={styles.flex}>
                      {recipe.title}
                      <Text variant="caption" color="textSubtle">
                        {'  '}
                        {format(strings.common.servings, { count: extra.servings })}
                      </Text>
                    </Text>
                    <IconButton
                      icon="close"
                      variant="plain"
                      size={40}
                      accessibilityLabel={format(t.removeExtra, { title: recipe.title })}
                      onPress={() => removeExtra(listId, extra.recipeId)}
                    />
                  </View>
                );
              })}
            </Card>
          </View>
        ) : null}

        {done > 0 ? (
          <Button
            label={t.clearChecked}
            variant="ghost"
            size="compact"
            icon={<Icon name="undo" size={18} color="accentText" />}
            onPress={() => clearChecked(listId)}
          />
        ) : null}
      </ScrollView>
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
    tabular: {
      fontVariant: ['tabular-nums'],
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      gap: spacing.xl,
    },
    summary: {
      gap: spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.md,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    group: {
      gap: spacing.sm,
    },
    groupCard: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      borderRadius: radii.lg,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    pantry: {
      gap: spacing.sm,
    },
    extraRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 52,
    },
  }),
);
