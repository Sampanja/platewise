import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, PressableScale, Text } from '@/components/ui';
import { usePantryStore } from '@/data/stores/pantry';
import { expiringItems } from '@/domain/pantry';
import { format, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.pantry;

/** Koti: "Varastossa X tuotetta, Y vanhenee pian" → Ruokavarasto. */
export function PantryCard() {
  const items = usePantryStore((s) => s.items);
  const now = today();
  const expiring = useMemo(() => expiringItems(items, now).length, [items, now]);
  const body =
    items.length === 0
      ? t.homeEmpty
      : expiring > 0
        ? format(t.homeBody, { count: items.length, expiring })
        : format(t.homeBodyCalm, { count: items.length });

  return (
    <PressableScale
      onPress={() => router.push(items.length === 0 ? '/pantry-scan' : '/pantry')}
      accessibilityRole="button"
      accessibilityLabel={`${t.homeTitle}. ${body}`}
      style={styles.card}
    >
      <View style={styles.badge}>
        <Icon name="fridge" size={26} color="accentText" />
      </View>
      <View style={styles.texts}>
        <Text variant="overline" color="textSubtle">
          {t.homeTitle}
        </Text>
        <Text variant="body" color={expiring > 0 ? 'text' : 'textMuted'}>
          {body}
        </Text>
        <Text variant="label" color="accentText">
          {items.length === 0 ? strings.quick.scanPantry : t.homeCta}
        </Text>
      </View>
      <Icon name="chevronRight" size={18} color="textSubtle" />
    </PressableScale>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.xl,
      borderRadius: radii.card,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.glassBorder,
    },
    badge: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    texts: {
      flex: 1,
      gap: spacing.xxs,
    },
  }),
);
