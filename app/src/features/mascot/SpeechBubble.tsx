import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui';
import { colors, radii, spacing, themedStyles } from '@/theme';

import { Mascot } from './Mascot';
import type { MascotState } from './types';

/** The mascot with a speech bubble beside it: greetings, empty states, celebrations. */
export function MascotSays({
  state = 'idle',
  message,
  size = 72,
  children,
  style,
}: {
  state?: MascotState;
  message: string;
  size?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.row, style]}>
      <Mascot state={state} size={size} />
      <View style={styles.bubble} accessible accessibilityLabel={message} accessibilityLiveRegion="polite">
        <View style={styles.tail} />
        <Text variant="body">{message}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    bubble: {
      flex: 1,
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tail: {
      position: 'absolute',
      left: -7,
      top: '50%',
      width: 14,
      height: 14,
      marginTop: -7,
      backgroundColor: colors.surface,
      borderLeftWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      transform: [{ rotate: '45deg' }],
    },
  }),
);
