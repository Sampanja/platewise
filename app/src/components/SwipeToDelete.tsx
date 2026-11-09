import { useMemo, useState, type ReactNode } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

import { haptics, Icon, Text } from '@/components/ui';
import { strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

type Props = {
  onDelete: () => void;
  children: ReactNode;
};

/** Distance to the left that deletes on release. */
const THRESHOLD = 96;

/**
 * Row that can be swiped left to delete. Only leftward swipes are claimed, so
 * a rightward swipe still reaches the parent (e.g. day navigation). Screen
 * reader users get the same action through the row's accessibility actions.
 */
export function SwipeToDelete({ onDelete, children }: Props) {
  const [translateX] = useState(() => new Animated.Value(0));
  const [armed, setArmed] = useState(false);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dx < -12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderMove: (_, g) => {
          const x = Math.min(0, g.dx);
          translateX.setValue(x);
          const past = x < -THRESHOLD;
          setArmed((was) => {
            if (past && !was) haptics.select();
            return past;
          });
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx < -THRESHOLD) {
            haptics.warning();
            Animated.timing(translateX, { toValue: -600, duration: 180, useNativeDriver: true }).start(() => {
              onDelete();
            });
          } else {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
          }
          setArmed(false);
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          setArmed(false);
        },
      }),
    [onDelete, translateX],
  );

  return (
    <View style={styles.wrap}>
      <View style={[styles.behind, armed && styles.behindArmed]} accessible={false}>
        <Icon name="trash" size={20} color={armed ? 'text' : 'danger'} />
        <Text variant="label" color={armed ? 'text' : 'danger'}>
          {strings.common.remove}
        </Text>
      </View>
      <Animated.View
        style={[styles.front, { transform: [{ translateX }] }]}
        accessibilityActions={[{ name: 'delete', label: strings.common.remove }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'delete') onDelete();
        }}
        {...responder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    wrap: {
      borderRadius: radii.md,
      overflow: 'hidden',
    },
    behind: {
      ...StyleSheet.absoluteFill,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.xs,
      paddingRight: spacing.lg,
      backgroundColor: colors.dangerSoft,
    },
    behindArmed: {
      backgroundColor: colors.danger,
    },
    front: {
      backgroundColor: colors.surface,
    },
  }),
);
