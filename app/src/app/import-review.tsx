import { router } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Chip, EmptyState, haptics, IconButton, PressableScale, Text, TextField } from '@/components/ui';
import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { useImportDraftStore } from '@/data/stores/importDraft';
import { useImportedRecipesStore } from '@/data/stores/importedRecipes';
import type { ImportedIngredient } from '@/data/types';
import { parseAmount } from '@/domain/nutrition';
import { IngredientPickerSheet } from '@/features/pantry/IngredientPickerSheet';
import { format, strings } from '@/i18n';
import { showToast } from '@/lib/toast';
import { CONFIRM_BELOW } from '@/services/recipeImport';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.recipeImport;

type Row = ImportedIngredient & { key: string };

/**
 * Tarkista ainekset: every line of an imported recipe, matched to the
 * ingredient table. Uncertain and unmatched lines are marked; the user picks
 * the right ingredient, fixes grams or removes the line, then saves.
 */
export default function ImportReviewScreen() {
  const draft = useImportDraftStore((s) => s.draft);
  const clear = useImportDraftStore((s) => s.clear);
  const save = useImportedRecipesStore((s) => s.save);
  const [rows, setRows] = useState<Row[]>(() => (draft?.ingredients ?? []).map((row, index) => ({ ...row, key: `${index}` })));
  const [picking, setPicking] = useState<string | null>(null);

  const update = useCallback((key: string, patch: Partial<ImportedIngredient>) => {
    setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }, []);
  const remove = useCallback((key: string) => {
    haptics.tap();
    setRows((list) => list.filter((row) => row.key !== key));
  }, []);
  const renderItem = useCallback<ListRenderItem<Row>>(
    ({ item }) => <ReviewRow row={item} onChange={update} onRemove={remove} onPick={setPicking} />,
    [update, remove],
  );

  if (!draft) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title={t.reviewTitle} />
        <EmptyState icon="link" title={t.notFoundTitle} body={t.notFoundBody} action={{ label: t.fromLink, onPress: () => router.replace('/import-recipe') }} />
      </SafeAreaView>
    );
  }

  const saveRecipe = () => {
    const saved = save({ ...draft, ingredients: rows.map(({ key: _key, ...row }) => row) });
    clear();
    haptics.success();
    showToast(t.saved);
    router.dismissTo({ pathname: '/imported/[id]', params: { id: saved.id } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={t.reviewTitle} />
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="title">{draft.title}</Text>
            <Text variant="body" color="textMuted">
              {t.reviewIntro}
            </Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <Button label={t.save} onPress={saveRecipe} disabled={rows.length === 0} />
      </View>
      <IngredientPickerSheet
        visible={picking !== null}
        title={t.choose}
        initialQuery={picking ? (rows.find((r) => r.key === picking)?.line ?? '') : ''}
        onClose={() => setPicking(null)}
        onPick={(ingredientId) => {
          if (picking) update(picking, { ingredientId, confidence: 1 });
          setPicking(null);
        }}
      />
    </SafeAreaView>
  );
}

type RowProps = {
  row: Row;
  onChange: (key: string, patch: Partial<ImportedIngredient>) => void;
  onRemove: (key: string) => void;
  onPick: (key: string) => void;
};

const ReviewRow = memo(function ReviewRow({ row, onChange, onRemove, onPick }: RowProps) {
  const [text, setText] = useState(row.grams !== null ? String(row.grams) : '');
  const ingredient = row.ingredientId ? INGREDIENTS_BY_ID[row.ingredientId] : undefined;
  const uncertain = ingredient !== undefined && row.confidence < CONFIRM_BELOW;
  return (
    <View style={[styles.row, (!ingredient || uncertain || row.grams === null) && styles.rowCheck]}>
      <View style={styles.rowTop}>
        <Text variant="caption" color="textSubtle" style={styles.flex} numberOfLines={2}>
          {row.line}
        </Text>
        <IconButton icon="trash" variant="plain" size={36} accessibilityLabel={format(t.removeA11y, { line: row.line })} onPress={() => onRemove(row.key)} />
      </View>
      <PressableScale onPress={() => onPick(row.key)} accessibilityRole="button" accessibilityLabel={ingredient ? ingredient.name : t.notFound} style={styles.pick}>
        <Text variant="bodyStrong" color={ingredient ? 'text' : 'accentText'} style={styles.flex}>
          {ingredient ? ingredient.name : t.notFound}
        </Text>
        {uncertain ? <Chip label={t.check} /> : null}
      </PressableScale>
      <View style={styles.grams}>
        <TextField
          value={text}
          onChangeText={(value) => {
            const clean = value.replace(/[^\d,.]/g, '');
            setText(clean);
            const grams = parseAmount(clean);
            onChange(row.key, { grams: grams !== undefined && grams > 0 ? Math.round(grams) : null });
          }}
          keyboardType="decimal-pad"
          placeholder={t.noAmount}
          accessibilityLabel={t.gramsLabel}
          trailing={
            <Text variant="caption" color="textSubtle">
              {strings.common.gUnit}
            </Text>
          }
        />
      </View>
    </View>
  );
});

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    list: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.sm,
    },
    header: {
      gap: spacing.sm,
      paddingBottom: spacing.sm,
    },
    row: {
      gap: spacing.sm,
      padding: spacing.md,
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
      gap: spacing.sm,
    },
    pick: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 44,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceRaised,
    },
    grams: {
      gap: spacing.xs,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
  }),
);

