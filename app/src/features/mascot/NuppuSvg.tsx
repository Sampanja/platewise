import Svg, { Circle, Ellipse, G, Path, Text as SvgText } from 'react-native-svg';

import type { MascotState } from './types';

/**
 * Temporary vector Nuppu: a round turnip with two leaves, rosy cheeks and a
 * face for each state. Fixed colours (a character keeps its look in both
 * themes); a dark outline keeps it visible on light and dark backgrounds.
 * Replaced by the final artwork in assets/mascot when it exists.
 */
const INK = '#2B1D15';
const BODY = '#FFF6EC';
const CAP = '#9C5AB0';
const CAP_LIGHT = '#B57BC4';
const LEAF = '#3E9A5A';
const LEAF_DARK = '#2C7543';
const CHEEK = '#F48FB1';

export function NuppuSvg({ state, size }: { state: MascotState; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessible={false}>
      {/* Leaves: the left one waves for "encouraging". */}
      <G rotation={state === 'encouraging' ? -18 : 0} origin="92, 52">
        <Path d="M92 52 C70 40 60 18 72 6 C88 14 98 32 92 52 Z" fill={LEAF} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <Path d="M90 48 C82 36 76 24 76 14" stroke={LEAF_DARK} strokeWidth={2} fill="none" strokeLinecap="round" />
      </G>
      <Path d="M106 52 C120 34 138 26 152 32 C148 50 128 60 106 52 Z" fill={LEAF} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M110 50 C122 44 134 38 144 36" stroke={LEAF_DARK} strokeWidth={2} fill="none" strokeLinecap="round" />

      {/* Root tail */}
      <Path d="M100 186 C98 192 100 198 104 199" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* Body: cream turnip with a purple top. */}
      <Path
        d="M100 50 C150 50 176 86 172 124 C168 160 136 186 100 188 C64 186 32 160 28 124 C24 86 50 50 100 50 Z"
        fill={BODY}
        stroke={INK}
        strokeWidth={3.5}
      />
      <Path
        d="M100 52 C146 52 170 84 171 110 C150 96 126 92 100 92 C74 92 50 96 29 110 C30 84 54 52 100 52 Z"
        fill={CAP}
      />
      <Path d="M70 64 C80 58 92 56 104 57" stroke={CAP_LIGHT} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path
        d="M100 50 C150 50 176 86 172 124 C168 160 136 186 100 188 C64 186 32 160 28 124 C24 86 50 50 100 50 Z"
        fill="none"
        stroke={INK}
        strokeWidth={3.5}
      />

      {state === 'cooking' ? <ChefHat /> : null}

      {/* Cheeks */}
      <Ellipse cx={62} cy={140} rx={11} ry={7} fill={CHEEK} opacity={0.7} />
      <Ellipse cx={138} cy={140} rx={11} ry={7} fill={CHEEK} opacity={0.7} />

      <Face state={state} />

      {state === 'thinking' ? (
        <G>
          <Circle cx={168} cy={64} r={5} fill={INK} />
          <Circle cx={180} cy={48} r={7} fill={INK} />
          <SvgText x={180} y={30} fontSize={28} fontWeight="bold" fill={INK} textAnchor="middle">
            ?
          </SvgText>
        </G>
      ) : null}
      {state === 'sleepy' ? (
        <G>
          <SvgText x={160} y={70} fontSize={24} fontWeight="bold" fill={CAP} textAnchor="middle">
            z
          </SvgText>
          <SvgText x={178} y={48} fontSize={18} fontWeight="bold" fill={CAP} textAnchor="middle">
            z
          </SvgText>
        </G>
      ) : null}
      {state === 'celebrating' ? (
        <G>
          <Star x={24} y={60} color="#F5C451" />
          <Star x={176} y={70} color="#F28DB2" />
          <Star x={40} y={22} color="#7CC4F2" small />
          <Star x={166} y={24} color="#7FCB8E" small />
        </G>
      ) : null}
    </Svg>
  );
}

function Face({ state }: { state: MascotState }) {
  switch (state) {
    case 'happy':
    case 'celebrating':
      return (
        <G>
          <Path d="M66 124 Q76 112 86 124" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M114 124 Q124 112 134 124" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M82 142 Q100 168 118 142 Z" fill={INK} />
          <Path d="M90 152 Q100 160 110 152" stroke="#E36B6B" strokeWidth={6} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'thinking':
      return (
        <G>
          <Ellipse cx={76} cy={122} rx={8} ry={10} fill={INK} />
          <Ellipse cx={124} cy={122} rx={8} ry={10} fill={INK} />
          <Circle cx={79} cy={117} r={3} fill="#FFFFFF" />
          <Circle cx={127} cy={117} r={3} fill="#FFFFFF" />
          <Path d="M112 104 Q124 98 136 104" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Circle cx={104} cy={150} r={5} fill={INK} />
        </G>
      );
    case 'sleepy':
      return (
        <G>
          <Path d="M66 124 Q76 132 86 124" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M114 124 Q124 132 134 124" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M92 150 Q100 154 108 150" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'encouraging':
      return (
        <G>
          <Ellipse cx={76} cy={122} rx={8} ry={10} fill={INK} />
          <Circle cx={79} cy={118} r={3} fill="#FFFFFF" />
          <Path d="M114 124 Q124 114 134 124" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M84 144 Q100 160 116 144" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'cooking':
    case 'idle':
    default:
      return (
        <G>
          <Ellipse cx={76} cy={122} rx={8} ry={10} fill={INK} />
          <Ellipse cx={124} cy={122} rx={8} ry={10} fill={INK} />
          <Circle cx={79} cy={118} r={3} fill="#FFFFFF" />
          <Circle cx={127} cy={118} r={3} fill="#FFFFFF" />
          <Path d="M86 144 Q100 156 114 144" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        </G>
      );
  }
}

function ChefHat() {
  return (
    <G>
      <Path
        d="M62 64 C52 50 62 32 78 36 C82 22 106 18 114 32 C128 24 146 36 140 52 C150 58 146 70 138 72 L66 72 C58 72 56 66 62 64 Z"
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path d="M68 72 L68 84 L134 84 L134 72" fill="#FFFFFF" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </G>
  );
}

function Star({ x, y, color, small = false }: { x: number; y: number; color: string; small?: boolean }) {
  const s = small ? 0.6 : 1;
  return (
    <Path
      d={`M${x} ${y - 12 * s} L${x + 3.5 * s} ${y - 3.5 * s} L${x + 12 * s} ${y} L${x + 3.5 * s} ${y + 3.5 * s} L${x} ${y + 12 * s} L${x - 3.5 * s} ${y + 3.5 * s} L${x - 12 * s} ${y} L${x - 3.5 * s} ${y - 3.5 * s} Z`}
      fill={color}
      stroke={INK}
      strokeWidth={1.5}
    />
  );
}
