import { router } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { TestModeBanner } from '@/components/TestModeBanner';
import { Button, Chip, EmptyState, haptics, Icon, IconButton, SelectChip, Text } from '@/components/ui';
import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { usePantryStore } from '@/data/stores/pantry';
import { usePantryDraftStore, type DraftRow } from '@/data/stores/pantryDraft';
import { PANTRY_LEVELS, type PantryAmount } from '@/data/types';
import { defaultLocation } from '@/domain/pantry';
import { AmountPicker } from '@/features/pantry/AmountPicker';
import { ingredientName } from '@/features/pantry/format';
import { IngredientPickerSheet } from '@/features/pantry/IngredientPickerSheet';
import { format, strings } from '@/i18n';
import { showToast } from '@/lib/toast';
import { PANTRY_NEEDS_CHECK_BELOW, pantryRecognition } from '@/services/pantryRecognition';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.pantryReview;

/**
 * Tarkista tuotteet: every recognised ingredient can be removed, swapped for
 * another ingredient and its amount set; missing ones can be added. Nothing
 * reaches the pantry before "Lisää varastoon".
 */
export default function PantryReviewScreen() {
  const draft = usePantryDraftStore((s) => s.rows);
  const clearDraft = usePantryDraftStore((s) => s.clear);
  const add = usePantryStore((s) => s.add);
  const [rows, setRows] = useState<DraftRow[]>(draft);
  const [picker, setPicker] = useState<{ replace: string | null } | null>(null);

  const updateRow = useCallback((key: string, patch: Partial<DraftRow>) => {
    setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }, []);
  const removeRow = useCallback((key: string) => {
    haptics.tap();
    setRows((list) => list.filter((row) => row.key !== key));
  }, []);
  const openReplace = useCallback((key: string) => setPicker({ replace: key }), []);

  const pick = (ingredientId: string) => {
    const ingredient = INGREDIENTS_BY_ID[ingredientId];
    const target = picker?.replace;
    setPicker(null);
    if (!ingredient) return;
    setRows((list) => {
      const old = target ? list.find((row) => row.key === target) : undefined;
      const row: DraftRow = {
        key: ingredientId,
        ingredientId,
        amount: old?.amount ?? { kind: 'level', level: 'plenty' },
        location: defaultLocation(ingredient),
        confidence: null,
      };
      // One row per ingredient: picking one that is already listed replaces that row too.
      const others = list.filter((r) => r.ingredientId !== ingredientId || r.key === target);
      return target ? others.map((r) => (r.key === target ? row : r)) : [...others, row];
    });
  };

  const save = () => {
    if (rows.length === 0) return;
    add(
      rows.map((row) => ({
        ingredientId: row.ingredientId,
        amount: row.amount,
        bestBefore: null,
        location: row.location,
        source: 'scan' as const,
        estimate: row.confidence !== null,
      })),
    );
    clearDraft();
    haptics.success();
    showToast(format(strings.pantry.added, { count: rows.length }));
    router.replace('/pantry');
  };

  const renderItem = useCallback<ListRenderItem<DraftRow>>(
    ({ item }) => <ReviewRow row={item} onChange={updateRow} onRemove={removeRow} onReplace={openReplace} />,
    [updateRow, removeRow, openReplace],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={t.title} />
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            {pantryRecognition.mode === 'test' ? (
              <TestModeBanner title={strings.photoResult.testModeTitle} body={strings.pantryScan.testModeBody} />
            ) : null}
            <Text variant="body" color="textMuted">
              {t.intro}
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="fridge" mascot="thinking" title={t.emptyTitle} body={t.emptyBody} />}
        ListFooterComponent={
          <Button
            label={t.add}
            variant="secondary"
            icon={<Icon name="plus" size={20} />}
            onPress={() => setPicker({ replace: null })}
          />
        }
      />
      <View style={styles.bottom}>
        <Button label={rows.length === 1 ? t.saveOne : format(t.save, { count: rows.length })} disabled={rows.length === 0} onPress={save} />
      </View>
      <IngredientPickerSheet
        visible={picker !== null}
        title={picker?.replace ? strings.pantry.change : strings.pantry.addTitle}
        onClose={() => setPicker(null)}
        onPick={pick}
      />
    </SafeAreaView>
  );
}

type ReviewRowProps = {
  row: DraftRow;
  onChange: (key: string, patch: Partial<DraftRow>) => void;
  onRemove: (key: string) => void;
  onReplace: (key: string) => void;
};

const ReviewRow = memo(function ReviewRow({ row, onChange, onRemove, onReplace }: ReviewRowProps) {
  const [exact, setExact] = useState(row.amount.kind === 'grams');
  const name = ingredientName(row.ingredientId);
  const uncertain = row.confidence !== null && row.confidence < PANTRY_NEEDS_CHECK_BELOW;
  const setAmount = (amount: PantryAmount) => onChange(row.key, { amount });
  return (
    <View style={[styles.row, uncertain && styles.rowCheck]}>
      <View style={styles.rowTop}>
        <View style={styles.nameRow}>
          <Text variant="bodyStrong" numberOfLines={2} style={styles.name}>
            {name}
          </Text>
          <View style={styles.tags}>
            {row.confidence !== null ? <Chip label={strings.common.estimate} tone="accent" /> : null}
            {uncertain ? <Chip label={t.check} tone="neutral" /> : null}
          </View>
        </View>
        <IconButton icon="swap" variant="plain" accessibilityLabel={format(t.changeA11y, { name })} onPress={() => onReplace(row.key)} />
        <IconButton icon="trash" variant="plain" accessibilityLabel={format(t.removeA11y, { name })} onPress={() => onRemove(row.key)} />
      </View>
      {exact ? (
        <AmountPicker ingredientId={row.ingredientId} amount={row.amount} onChange={(amount) => {
          setAmount(amount);
          if (amount.kind === 'level') setExact(false);
        }} />
      ) : (
        <View style={styles.chips}>
          {PANTRY_LEVELS.map((level) => (
            <SelectChip
              key={level}
              role="radio"
              label={strings.pantry.levels[level]}
              selected={row.amount.kind === 'level' && row.amount.level === level}
              onPress={() => setAmount({ kind: 'level', level })}
            />
          ))}
          <SelectChip role="radio" label={strings.pantry.exactShort} selected={false} onPress={() => setExact(true)} />
        </View>
      )}
    </View>
  );
});

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    list: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.sm,
    },
    header: {
      gap: spacing.md,
      paddingBottom: spacing.sm,
    },
    row: {
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    rowCheck: {
      borderColor: colors.accentText,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    nameRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    name: {
      flexShrink: 1,
    },
    tags: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    bottom: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
  }),
);
