import type { ReactNode } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, type ColorToken } from '@/theme';

/**
 * Line icons on a 24 × 24 grid with round caps, drawn to match the
 * DM Sans stroke weight. Decorative by default (hidden from screen readers):
 * the surrounding control carries the accessible label.
 */
const shapes = {
  home: <Path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z" />,
  recipes: (
    <>
      <Path d="M12 6.5C10.4 5 7.9 4.5 3.5 4.5v14c4.4 0 6.9.5 8.5 2 1.6-1.5 4.1-2 8.5-2v-14c-4.4 0-6.9.5-8.5 2z" />
      <Path d="M12 6.5v14" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  diary: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 3.5V12h8.5" />
    </>
  ),
  profile: (
    <>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 20.5c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  chevronRight: <Path d="m9 5 7 7-7 7" />,
  plate: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4.5} />
    </>
  ),
  savings: <Path d="M3.5 7.5 9.5 13.5l4-4 7 7M15 16.5h5.5V11" />,
  alert: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 7.5v5.5M12 16.5v.01" />
    </>
  ),
  clock: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 7.5V12l3 2" />
    </>
  ),
  flame: (
    <Path d="M12 3.5c.8 3.2 5 5.3 5 9.8a5 5 0 0 1-10 0c0-2.4 1.3-3.9 2.4-4.9.4 1.4 1.3 2.4 2.4 2.4-.2-2.6-.8-4.8.2-7.3z" />
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof shapes;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorToken;
  /** Thicker stroke for the active state of tab icons. */
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color = 'text', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors[color]}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {shapes[name]}
    </Svg>
  );
}
