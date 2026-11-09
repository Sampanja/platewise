import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radii, spacing, themedStyles, touchTarget } from '@/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type CheckRowProps = {
  label: string;
  detail?: string;
  checked: boolean;
  onToggle: () => void;
};

/** Full-width tappable row with an animated checkmark, used for shopping list items. */
export function CheckRow({ label, detail, checked, onToggle }: CheckRowProps) {
  const [progress] = useState(() => new Animated.Value(checked ? 1 : 0));

  useEffect(() => {
    Animated.spring(progress, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      speed: 24,
      bounciness: 14,
    }).start();
  }, [checked, progress]);

  return (
    <PressableScale
      haptic="select"
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      style={styles.row}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        <Animated.View
          style={{
            opacity: progress,
            transform: [
              { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
            ],
          }}
        >
          <Text variant="bodyStrong" color="textOnAccent" style={styles.tick}>
            ✓
          </Text>
        </Animated.View>
      </View>
      <View style={styles.texts}>
        <Text
          variant="body"
          color={checked ? 'textSubtle' : 'text'}
          style={checked && styles.struck}
        >
          {label}
        </Text>
        {detail ? (
          <Text variant="caption" color="textSubtle">
            {detail}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}

const BOX = 28;

const styles = themedStyles(() =>
  StyleSheet.create({
    row: {
      minHeight: touchTarget + spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      paddingVertical: spacing.sm,
    },
    box: {
      width: BOX,
      height: BOX,
      borderRadius: radii.sm,
      borderWidth: 2,
      borderColor: colors.textSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxChecked: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    tick: {
      lineHeight: BOX - 4,
    },
    texts: {
      flex: 1,
      gap: spacing.xxs,
    },
    struck: {
      textDecorationLine: 'line-through',
    },
  }),
);
