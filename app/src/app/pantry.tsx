import { router, useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, StyleSheet, View, type SectionListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Chip, EmptyState, haptics, Icon, PressableScale, SwitchRow, Text, type IconName } from '@/components/ui';
import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { CONFIDENT_MATCH, searchIngredients } from '@/data/catalog/search';
import { usePantryStore } from '@/data/stores/pantry';
import { PANTRY_LOCATIONS, type PantryItem, type PantryLocation } from '@/data/types';
import { defaultLocation, expiringItems, isExpiringSoon } from '@/domain/pantry';
import { IngredientPickerSheet } from '@/features/pantry/IngredientPickerSheet';
import { PantryItemSheet } from '@/features/pantry/PantryItemSheet';
import { expiryLabel, ingredientName, pantryAmountLabel } from '@/features/pantry/format';
import { format, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { lookupBarcode } from '@/services/barcode';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.pantry;

type Section = { location: PantryLocation; data: PantryItem[] };

/**
 * Ruokavarasto: the ingredients at home, by place. Add by scanning, search or
 * barcode; tap a row to change its amount, date or place. Reached from Koti
 * and from Reseptit → Varastosta.
 */
export default function PantryScreen() {
  const params = useLocalSearchParams<{ barcode?: string }>();
  const items = usePantryStore((s) => s.items);
  const add = usePantryStore((s) => s.add);
  const reminders = usePantryStore((s) => s.expiryReminders);
  const setReminders = usePantryStore((s) => s.setExpiryReminders);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [prefill, setPrefill] = useState('');
  const now = today();

  const sections = useMemo<Section[]>(() => {
    const byName = (a: PantryItem, b: PantryItem) =>
      Number(isExpiringSoon(b, now)) - Number(isExpiringSoon(a, now)) ||
      ingredientName(a.ingredientId).localeCompare(ingredientName(b.ingredientId));
    return PANTRY_LOCATIONS.map((location) => ({
      location,
      data: items.filter((item) => item.location === location).sort(byName),
    })).filter((section) => section.data.length > 0);
  }, [items, now]);
  const expiringCount = useMemo(() => expiringItems(items, now).length, [items, now]);
  const editing = editingId ? (items.find((i) => i.id === editingId) ?? null) : null;

  const addIngredient = useCallback(
    (ingredientId: string, source: 'search' | 'barcode') => {
      const ingredient = INGREDIENTS_BY_ID[ingredientId];
      if (!ingredient) return;
      add([
        { ingredientId, amount: { kind: 'level', level: 'plenty' }, bestBefore: null, location: defaultLocation(ingredient), source, estimate: false },
      ]);
      haptics.success();
      showToast(format(t.addedOne, { name: ingredient.name }));
      const added = usePantryStore.getState().items.find((item) => item.ingredientId === ingredientId);
      if (added) setEditingId(added.id);
    },
    [add],
  );

  // Back from the barcode camera: find the product, then the closest ingredient.
  const barcode = params.barcode;
  useEffect(() => {
    if (!barcode) return;
    router.setParams({ barcode: undefined });
    void lookupBarcode(barcode).then((result) => {
      const name = result.status === 'found' ? result.food.name : result.status === 'incomplete' ? result.name : '';
      const best = name ? searchIngredients(name, 1)[0] : undefined;
      if (best && best.score >= CONFIDENT_MATCH) {
        addIngredient(best.item.id, 'barcode');
        return;
      }
      showToast(result.status === 'offline' ? strings.product.offlineBody : t.barcodeNoMatch);
      setPrefill(name);
      setPicking(true);
    });
  }, [barcode, addIngredient]);

  const renderItem = useCallback<SectionListRenderItem<PantryItem, Section>>(
    ({ item }) => <PantryRow item={item} now={now} onPress={setEditingId} />,
    [now],
  );

  const header = (
    <View style={styles.header}>
      <Text variant="body" color="textMuted">
        {t.intro}
      </Text>
      <View style={styles.actions}>
        <Action icon="scan" label={t.scan} onPress={() => router.push('/pantry-scan')} />
        <Action
          icon="search"
          label={t.search}
          onPress={() => {
            setPrefill('');
            setPicking(true);
          }}
        />
        <Action icon="barcode" label={t.barcode} onPress={() => router.push({ pathname: '/camera', params: { mode: 'barcode', target: 'pantry' } })} />
      </View>
      {items.length > 0 ? (
        <View style={styles.summary}>
          <Text variant="label" color="textSubtle">
            {items.length === 1 ? t.countOne : format(t.count, { count: items.length })}
            {expiringCount > 0 ? ` · ${format(t.expiringCount, { count: expiringCount })}` : ''}
          </Text>
          <Button
            label={t.whatCanIMake}
            size="compact"
            variant="secondary"
            icon={<Icon name="chef" size={18} />}
            onPress={() => router.navigate({ pathname: '/recipes', params: { segment: 'pantry' } })}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={t.title} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text variant="overline" color="accentText" style={styles.sectionHeader} accessibilityRole="header">
            {t.locations[section.location]}
          </Text>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="fridge"
            mascot="thinking"
            title={t.emptyTitle}
            body={t.emptyBody}
            action={{ label: t.scan, onPress: () => router.push('/pantry-scan') }}
          />
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <SwitchRow label={t.reminders} hint={t.remindersHint} value={reminders} onValueChange={setReminders} />
          </View>
        }
        initialNumToRender={12}
      />
      <PantryItemSheet item={editing} onClose={() => setEditingId(null)} />
      <IngredientPickerSheet
        visible={picking}
        initialQuery={prefill}
        onClose={() => setPicking(false)}
        onPick={(id) => {
          setPicking(false);
          addIngredient(id, prefill ? 'barcode' : 'search');
        }}
      />
    </SafeAreaView>
  );
}

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale haptic="tap" onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.action}>
      <View style={styles.actionIcon}>
        <Icon name={icon} size={24} color="textOnAccent" />
      </View>
      <Text variant="label" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {label}
      </Text>
    </PressableScale>
  );
}

const PantryRow = memo(function PantryRow({ item, now, onPress }: { item: PantryItem; now: string; onPress: (id: string) => void }) {
  const name = ingredientName(item.ingredientId);
  const amount = pantryAmountLabel(item.ingredientId, item.amount);
  const expiry = expiryLabel(item, now);
  const soon = isExpiringSoon(item, now);
  return (
    <PressableScale
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={[format(t.a11yItem, { name, amount, location: t.locations[item.location] }), expiry].filter(Boolean).join(', ')}
      style={styles.row}
    >
      <View style={styles.flex}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.meta}>
          <Text variant="caption" color="textSubtle">
            {amount}
          </Text>
          {expiry ? (
            <Text variant="caption" color={soon ? 'accentText' : 'textSubtle'}>
              {`· ${expiry}`}
            </Text>
          ) : null}
          {item.estimate ? <Chip label={strings.common.estimate} tone="accent" /> : null}
        </View>
      </View>
      <Icon name="chevronRight" size={18} color="textSubtle" />
    </PressableScale>
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
      paddingBottom: spacing.xxl,
      gap: spacing.sm,
    },
    header: {
      gap: spacing.lg,
      paddingBottom: spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    action: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: radii.lg,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    summary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    sectionHeader: {
      paddingTop: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 60,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
    },
    flex: {
      flex: 1,
      gap: 2,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    footer: {
      paddingTop: spacing.lg,
    },
  }),
);
