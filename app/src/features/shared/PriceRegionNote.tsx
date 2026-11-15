import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Icon, PressableScale, Text } from '@/components/ui';
import { isRoughEstimate, type PriceRegionCode } from '@/domain/priceRegion';
import { format, strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

/**
 * Says which country's price level the estimates use. Outside Finland the
 * prices are converted from Finnish data, and the note says so plainly.
 * A tap opens the region setting.
 */
export function PriceRegionNote({ region }: { region: PriceRegionCode }) {
  const t = strings.priceRegions;
  const text = format(isRoughEstimate(region) ? t.noteRough : t.noteMeasured, { country: t.names[region] });
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/profile-edit/[section]', params: { section: 'region' } })}
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityHint={t.changeHint}
      style={styles.note}
    >
      <Icon name="info" size={18} color="textSubtle" />
      <Text variant="caption" color="textSubtle" style={styles.flex}>
        {text}
      </Text>
      <Icon name="chevronRight" size={16} color="textSubtle" />
    </PressableScale>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    note: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 44,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.md,
      backgroundColor: colors.surface,
    },
    flex: {
      flex: 1,
    },
  }),
);
