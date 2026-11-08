import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton, Text } from '@/components/ui';
import { strings } from '@/i18n';
import { spacing } from '@/theme';

export type ScreenHeaderProps = {
  title?: string;
  /** Defaults to going back in the stack. */
  onBack?: () => void;
  /** Close (×) instead of back (‹) for modal-like screens. */
  variant?: 'back' | 'close';
  trailing?: ReactNode;
};

/** Top bar for screens outside the tabs: back or close, title, optional action. */
export function ScreenHeader({ title, onBack, variant = 'back', trailing }: ScreenHeaderProps) {
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={styles.row}>
      <IconButton
        icon={variant === 'close' ? 'close' : 'chevronLeft'}
        accessibilityLabel={variant === 'close' ? strings.common.close : strings.common.back}
        onPress={back}
      />
      <Text variant="heading" accessibilityRole="header" numberOfLines={1} style={styles.title}>
        {title ?? ''}
      </Text>
      <View style={styles.trailing}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  trailing: {
    minWidth: 48,
    alignItems: 'flex-end',
  },
});
