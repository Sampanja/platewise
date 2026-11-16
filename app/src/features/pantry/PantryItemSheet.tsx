import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { Button, Icon, PressableScale, SelectChip, Text } from '@/components/ui';
import { usePantryStore } from '@/data/stores/pantry';
import { PANTRY_LOCATIONS, type PantryItem } from '@/data/types';
import { strings } from '@/i18n';
import { addDays, shortDate, today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { ensurePermission } from '@/services/reminders';
import { colors, radii, spacing, themedStyles } from '@/theme';

import { AmountPicker } from './AmountPicker';
import { ingredientName } from './format';
import { IngredientPickerSheet } from './IngredientPickerSheet';

const t = strings.pantry;
/** Quick best-before choices, days from today. */
const DATE_OFFSETS = [1, 3, 7, 14, 30];

export type PantryItemSheetProps = {
  item: PantryItem | null;
  onClose: () => void;
};

/** Edit one pantry item: amount, best-before date, place, ingredient; or remove it (with undo). */
export function PantryItemSheet({ item, onClose }: PantryItemSheetProps) {
  const update = usePantryStore((s) => s.update);
  const remove = usePantryStore((s) => s.remove);
  const restore = usePantryStore((s) => s.restore);
  const replaceIngredient = usePantryStore((s) => s.replaceIngredient);
  const [picking, setPicking] = useState(false);
  // The sheet shows the stored item, so every change is saved at once (optimistic, nothing to confirm).
  const live = usePantryStore((s) => (item ? s.items.find((i) => i.id === item.id) : undefined));
  const current = live ?? item;
  if (!current) return null;
  const now = today();
  const dates = DATE_OFFSETS.map((days) => addDays(now, days));
  const ownDate = current.bestBefore && !dates.includes(current.bestBefore) ? current.bestBefore : null;

  const removeItem = () => {
    const removed = remove(current.id);
    onClose();
    if (removed) showToast(t.removed, { label: strings.common.undo, onPress: () => restore(removed) });
  };

  return (
    <>
      <Sheet visible={item !== null && !picking} onClose={onClose} title={ingredientName(current.ingredientId)}>
        <Section title={t.amount}>
          <AmountPicker
            key={current.id}
            ingredientId={current.ingredientId}
            amount={current.amount}
            onChange={(amount) => update(current.id, { amount })}
          />
        </Section>
        <Section title={t.bestBeforeTitle}>
          <View style={styles.chips}>
            <SelectChip role="radio" label={t.noDate} selected={current.bestBefore === null} onPress={() => update(current.id, { bestBefore: null })} />
            {ownDate ? <SelectChip role="radio" label={shortDate(ownDate)} selected onPress={() => undefined} /> : null}
            {dates.map((date) => (
              <SelectChip
                key={date}
                role="radio"
                label={shortDate(date)}
                selected={current.bestBefore === date}
                onPress={() => {
                  update(current.id, { bestBefore: date });
                  // The first date is when an expiry reminder becomes useful: ask for notifications then.
                  if (usePantryStore.getState().expiryReminders) void ensurePermission();
                }}
              />
            ))}
          </View>
        </Section>
        <Section title={t.locationTitle}>
          <View style={styles.chips}>
            {PANTRY_LOCATIONS.map((location) => (
              <SelectChip
                key={location}
                role="radio"
                label={t.locations[location]}
                selected={current.location === location}
                onPress={() => update(current.id, { location })}
              />
            ))}
          </View>
        </Section>
        <PressableScale onPress={() => setPicking(true)} accessibilityRole="button" style={styles.action}>
          <Icon name="swap" size={20} color="accentText" />
          <Text variant="bodyStrong" color="accentText">
            {t.change}
          </Text>
        </PressableScale>
        <PressableScale onPress={removeItem} accessibilityRole="button" style={styles.action}>
          <Icon name="trash" size={20} color="textMuted" />
          <Text variant="bodyStrong" color="textMuted">
            {t.remove}
          </Text>
        </PressableScale>
        <Button label={t.done} onPress={onClose} />
      </Sheet>
      <IngredientPickerSheet
        visible={picking}
        title={t.change}
        onClose={() => setPicking(false)}
        onPick={(ingredientId) => {
          replaceIngredient(current.id, ingredientId);
          setPicking(false);
          onClose();
        }}
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="label" color="textSubtle">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    section: {
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 48,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceRaised,
    },
  }),
);
