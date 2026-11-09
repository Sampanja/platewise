import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Icon, type IconName } from '@/components/ui';
import type { Tier } from '@/domain/gamification';
import { colors } from '@/theme';

const TIER_COLORS: Record<Tier, { from: string; to: string; ribbon: string }> = {
  bronze: { from: '#E7A46B', to: '#B4692F', ribbon: '#C9461A' },
  silver: { from: '#E6EBF0', to: '#9AA6B2', ribbon: '#1F6FA8' },
  gold: { from: '#FFE08A', to: '#D49B16', ribbon: '#2F7D4A' },
};

/**
 * Achievement medal: a ribbon and a gradient disc in the tier's metal with
 * the achievement's icon. Locked medals are flat and faded so the shape
 * still hints at what is coming.
 */
export function Badge({ tier, icon, size = 64, locked = false }: { tier: Tier; icon: IconName; size?: number; locked?: boolean }) {
  const c = TIER_COLORS[tier];
  const id = `g-${tier}`;
  return (
    <View style={[styles.wrap, { width: size, height: size * 1.15 }, locked && styles.locked]}>
      <Svg width={size} height={size * 1.15} viewBox="0 0 100 115">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={locked ? colors.surfaceRaised : c.from} />
            <Stop offset="1" stopColor={locked ? colors.border : c.to} />
          </LinearGradient>
        </Defs>
        <Path d="M30 70 L20 112 L38 102 L48 114 L52 74 Z" fill={locked ? colors.border : c.ribbon} />
        <Path d="M70 70 L80 112 L62 102 L52 114 L48 74 Z" fill={locked ? colors.border : c.ribbon} opacity={0.85} />
        <Circle cx={50} cy={46} r={42} fill={`url(#${id})`} />
        <Circle cx={50} cy={46} r={34} fill="none" stroke="#FFFFFF" strokeOpacity={locked ? 0.2 : 0.55} strokeWidth={3} />
      </Svg>
      <View style={[styles.icon, { top: size * 0.4 - size * 0.18, width: size, height: size * 0.36 }]}>
        <Icon name={icon} size={size * 0.34} tint={locked ? colors.textSubtle : '#2B1D15'} strokeWidth={2.2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  locked: {
    opacity: 0.55,
  },
  icon: {
    position: 'absolute',
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
