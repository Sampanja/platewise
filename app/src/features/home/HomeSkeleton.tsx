import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui';
import { strings } from '@/i18n';
import { radii, spacing } from '@/theme';

/** Placeholder shaped like the home screen while the plan loads. */
export function HomeSkeleton() {
  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={strings.common.loading}
      accessibilityState={{ busy: true }}
    >
      <View style={styles.padded}>
        <Skeleton height={360} radius={radii.card} />
      </View>
      <View style={[styles.padded, styles.gapSm]}>
        <Skeleton width={160} height={24} />
        <View style={styles.row}>
          <Skeleton width={168} height={190} radius={radii.lg} />
          <Skeleton width={168} height={190} radius={radii.lg} />
          <Skeleton width={168} height={190} radius={radii.lg} />
        </View>
      </View>
      <View style={styles.padded}>
        <Skeleton height={180} radius={radii.card} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  gapSm: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    overflow: 'hidden',
  },
});
