import Svg, { Circle, Ellipse, G, Path, Text as SvgText } from 'react-native-svg';

import type { CharacterId } from '@/theme/characters';

import type { MascotState } from './types';

/**
 * Temporary vector characters in one consistent style: a 200 × 200 canvas, a
 * warm dark outline, big expressive eyes with white highlights and rosy
 * cheeks. Every character has its own body; faces and props are shared, so
 * all states look alike across characters. Fixed colours: a character keeps
 * its look in light and dark mode. Replaced by final artwork from
 * assets/mascot when it exists (docs/MASCOT.md).
 */

const INK = '#2B1D15';
const STROKE = 3.5;
const CHEEK = '#F48FB1';

type Body = {
  /** Draws the body behind the face. */
  draw: () => React.JSX.Element;
  /** Face centre and size. */
  face: { x: number; y: number; scale: number };
  /** Top of the head, where the chef hat sits. */
  top: number;
  /** Eye whites help faces read on dark bodies. */
  sclera: boolean;
};

const LEAF = '#3E9A5A';
const LEAF_DARK = '#2C7543';

function Leaf({ d, vein }: { d: string; vein: string }) {
  return (
    <G>
      <Path d={d} fill={LEAF} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Path d={vein} stroke={LEAF_DARK} strokeWidth={2} fill="none" strokeLinecap="round" />
    </G>
  );
}

const BODIES: Record<CharacterId, Body> = {
  // Beetroot: round magenta root with three leaves and a curly tail.
  nuppu: {
    face: { x: 100, y: 130, scale: 1 },
    top: 66,
    sclera: true,
    draw: () => (
      <G>
        <Path d="M96 64 C92 48 90 36 92 22" stroke="#8E1B50" strokeWidth={4} fill="none" strokeLinecap="round" />
        <Leaf d="M92 30 C70 26 56 8 64 0 C82 2 96 16 92 30 Z" vein="M90 28 C80 20 72 12 68 6" />
        <Leaf d="M100 34 C102 14 116 2 132 4 C134 22 118 36 100 34 Z" vein="M104 30 C112 20 120 12 128 8" />
        <Leaf d="M104 50 C122 40 146 42 156 54 C144 66 120 64 104 50 Z" vein="M110 50 C124 48 138 50 150 54" />
        <Path d="M100 186 C98 194 102 199 108 198" stroke={INK} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
        <Path
          d="M100 62 C152 62 174 98 170 134 C166 168 136 188 100 188 C64 188 34 168 30 134 C26 98 48 62 100 62 Z"
          fill="#8E1B50"
          stroke={INK}
          strokeWidth={STROKE}
        />
        <Path d="M62 88 C72 76 86 72 100 72" stroke="#B9467F" strokeWidth={7} strokeLinecap="round" fill="none" />
        <Path d="M150 150 C146 160 140 168 132 174" stroke="#6E1440" strokeWidth={4} strokeLinecap="round" fill="none" />
      </G>
    ),
  },
  // Carrot: tapering orange root with ridges and fronds.
  porkkis: {
    face: { x: 100, y: 104, scale: 0.85 },
    top: 62,
    sclera: false,
    draw: () => (
      <G>
        <Leaf d="M96 66 C80 50 72 30 80 16 C94 26 100 46 96 66 Z" vein="M94 60 C88 46 84 34 82 22" />
        <Leaf d="M104 66 C106 44 116 26 130 22 C134 40 122 58 104 66 Z" vein="M108 60 C114 46 120 36 126 28" />
        <Leaf d="M100 64 C96 44 98 24 104 10 C114 26 110 48 100 64 Z" vein="M101 58 C101 42 102 28 104 16" />
        <Path
          d="M54 76 C54 64 76 58 100 58 C124 58 146 64 146 76 C146 94 120 160 108 186 C104 194 96 194 92 186 C80 160 54 94 54 76 Z"
          fill="#F28A2E"
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
        <Path d="M70 132 L84 128 M118 150 L130 146 M78 158 L90 156 M120 112 L134 108" stroke="#C9631A" strokeWidth={3} strokeLinecap="round" />
        <Path d="M68 74 C78 68 90 66 102 66" stroke="#FFB16B" strokeWidth={6} strokeLinecap="round" fill="none" />
      </G>
    ),
  },
  // Avocado: dark green skin, creamy flesh and a round pit.
  aava: {
    face: { x: 100, y: 98, scale: 0.85 },
    top: 34,
    sclera: false,
    draw: () => (
      <G>
        <Path
          d="M100 30 C134 30 152 68 158 110 C164 158 136 192 100 192 C64 192 36 158 42 110 C48 68 66 30 100 30 Z"
          fill="#3F6E2A"
          stroke={INK}
          strokeWidth={STROKE}
        />
        <Path
          d="M100 42 C126 42 142 74 147 110 C152 150 128 180 100 180 C72 180 48 150 53 110 C58 74 74 42 100 42 Z"
          fill="#D8EAA6"
        />
        <Circle cx={100} cy={146} r={24} fill="#8A5A2B" stroke={INK} strokeWidth={3} />
        <Ellipse cx={92} cy={138} rx={7} ry={5} fill="#B57D47" />
      </G>
    ),
  },
  // Tomato: plump red with a green star calyx.
  tomppa: {
    face: { x: 100, y: 126, scale: 1 },
    top: 60,
    sclera: false,
    draw: () => (
      <G>
        <Ellipse cx={100} cy={124} rx={74} ry={64} fill="#E2412F" stroke={INK} strokeWidth={STROKE} />
        <Path d="M62 92 C72 80 88 74 102 74" stroke="#FF8A78" strokeWidth={7} strokeLinecap="round" fill="none" />
        <Path
          d="M100 74 L86 56 L94 70 L70 64 L90 78 L76 90 L98 80 L102 96 L106 80 L126 90 L112 76 L132 64 L106 70 L114 56 Z"
          fill={LEAF}
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <Path d="M100 62 C100 54 102 48 106 44" stroke={LEAF_DARK} strokeWidth={5} strokeLinecap="round" fill="none" />
      </G>
    ),
  },
  // Blueberry: round indigo berry with a little crown.
  mustis: {
    face: { x: 100, y: 122, scale: 1 },
    top: 56,
    sclera: true,
    draw: () => (
      <G>
        <Circle cx={100} cy={122} r={68} fill="#3E4FA8" stroke={INK} strokeWidth={STROKE} />
        <Path d="M56 96 C66 78 84 68 104 66" stroke="#7D8CE0" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.8} />
        <Path
          d="M84 60 L90 48 L96 58 L100 44 L104 58 L110 48 L116 60 Z"
          fill="#2A3570"
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </G>
    ),
  },
  // Lemon: sunny oval with pointed ends and a leaf.
  sitru: {
    face: { x: 100, y: 120, scale: 1 },
    top: 62,
    sclera: false,
    draw: () => (
      <G>
        <Leaf d="M120 64 C130 44 152 36 168 40 C164 58 144 70 120 64 Z" vein="M124 62 C136 54 150 48 162 44" />
        <Path
          d="M24 120 C28 112 32 108 38 104 C46 78 70 62 100 62 C130 62 154 78 162 104 C168 108 172 112 176 120 C172 128 168 132 162 136 C154 162 130 178 100 178 C70 178 46 162 38 136 C32 132 28 128 24 120 Z"
          fill="#FFD43B"
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
        <Path d="M60 92 C72 78 88 72 104 72" stroke="#FFF0A8" strokeWidth={7} strokeLinecap="round" fill="none" />
        <Circle cx={142} cy={150} r={2} fill="#D9AE18" />
        <Circle cx={60} cy={152} r={2} fill="#D9AE18" />
        <Circle cx={150} cy={96} r={2} fill="#D9AE18" />
      </G>
    ),
  },
  // Chanterelle: wavy golden cap on a sturdy stem.
  kanttu: {
    face: { x: 100, y: 140, scale: 0.85 },
    top: 50,
    sclera: false,
    draw: () => (
      <G>
        <Path
          d="M66 100 C62 140 66 178 100 184 C134 178 138 140 134 100 Z"
          fill="#F7C46E"
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
        <Path d="M78 108 L82 124 M100 106 L100 122 M122 108 L118 124" stroke="#D9952F" strokeWidth={2.5} strokeLinecap="round" />
        <Path
          d="M24 92 C30 58 70 46 100 46 C130 46 170 58 176 92 C166 104 152 96 142 106 C130 96 118 110 100 102 C82 110 70 96 58 106 C48 96 34 104 24 92 Z"
          fill="#F2A93B"
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
        <Path d="M50 74 C64 60 82 56 100 56" stroke="#FFD08A" strokeWidth={7} strokeLinecap="round" fill="none" />
      </G>
    ),
  },
  // Rye bread: a slice with a dark crust, crumb and caraway seeds.
  ruis: {
    face: { x: 100, y: 120, scale: 0.95 },
    top: 42,
    sclera: true,
    draw: () => (
      <G>
        <Path
          d="M38 88 C36 54 68 40 100 40 C132 40 164 54 162 88 C156 96 156 102 158 110 L156 176 C156 186 150 190 140 190 L60 190 C50 190 44 186 44 176 L42 110 C44 102 44 96 38 88 Z"
          fill="#5A3A26"
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
        <Path
          d="M50 90 C50 64 74 52 100 52 C126 52 150 64 150 90 C146 98 146 104 147 110 L146 172 C146 176 142 180 136 180 L64 180 C58 180 54 176 54 172 L53 110 C54 104 54 98 50 90 Z"
          fill="#8B5E3C"
        />
        <Ellipse cx={70} cy={160} rx={3} ry={1.6} fill="#D8B58C" rotation={30} origin="70, 160" />
        <Ellipse cx={130} cy={164} rx={3} ry={1.6} fill="#D8B58C" rotation={-20} origin="130, 164" />
        <Ellipse cx={74} cy={80} rx={3} ry={1.6} fill="#D8B58C" rotation={10} origin="74, 80" />
        <Ellipse cx={128} cy={78} rx={3} ry={1.6} fill="#D8B58C" rotation={-30} origin="128, 78" />
      </G>
    ),
  },
};

function Eye({ x, y, sclera, look = 0 }: { x: number; y: number; sclera: boolean; look?: number }) {
  return (
    <G>
      {sclera ? <Ellipse cx={x} cy={y} rx={11} ry={13} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} /> : null}
      <Ellipse cx={x + look * 3} cy={y + (sclera ? 1 : 0) - look * 3} rx={sclera ? 6.5 : 8} ry={sclera ? 7.5 : 10} fill={INK} />
      <Circle cx={x + look * 3 + 2.5} cy={y - 3 - look * 3} r={2.6} fill="#FFFFFF" />
    </G>
  );
}

function ClosedEye({ x, y, down = false }: { x: number; y: number; down?: boolean }) {
  return (
    <Path
      d={down ? `M${x - 10} ${y} Q${x} ${y + 8} ${x + 10} ${y}` : `M${x - 10} ${y + 2} Q${x} ${y - 10} ${x + 10} ${y + 2}`}
      stroke={INK}
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Face({ state, body }: { state: MascotState; body: Body }) {
  const { x, y, scale } = body.face;
  const lx = -24;
  const rx = 24;
  const mouthY = 22;
  const inner = (() => {
    switch (state) {
      case 'happy':
      case 'celebrating':
        return (
          <G>
            <ClosedEye x={lx} y={0} />
            <ClosedEye x={rx} y={0} />
            <Path d={`M-16 ${mouthY - 4} Q0 ${mouthY + 22} 16 ${mouthY - 4} Z`} fill={INK} />
            <Path d={`M-8 ${mouthY + 6} Q0 ${mouthY + 12} 8 ${mouthY + 6}`} stroke="#E36B6B" strokeWidth={6} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'thinking':
        return (
          <G>
            <Eye x={lx} y={0} sclera={body.sclera} look={1} />
            <Eye x={rx} y={0} sclera={body.sclera} look={1} />
            <Path d={`M${rx - 12} -20 Q${rx} -27 ${rx + 12} -20`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
            <Circle cx={6} cy={mouthY + 2} r={5} fill={INK} />
          </G>
        );
      case 'sleepy':
        return (
          <G>
            <ClosedEye x={lx} y={0} down />
            <ClosedEye x={rx} y={0} down />
            <Path d={`M-7 ${mouthY + 2} Q0 ${mouthY + 6} 7 ${mouthY + 2}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'encouraging':
        return (
          <G>
            <Eye x={lx} y={0} sclera={body.sclera} />
            <ClosedEye x={rx} y={2} />
            <Path d={`M-14 ${mouthY} Q0 ${mouthY + 14} 14 ${mouthY}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'cooking':
      case 'idle':
      default:
        return (
          <G>
            <Eye x={lx} y={0} sclera={body.sclera} />
            <Eye x={rx} y={0} sclera={body.sclera} />
            <Path d={`M-12 ${mouthY} Q0 ${mouthY + 11} 12 ${mouthY}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          </G>
        );
    }
  })();
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Ellipse cx={-40} cy={16} rx={10} ry={6.5} fill={CHEEK} opacity={0.75} />
      <Ellipse cx={40} cy={16} rx={10} ry={6.5} fill={CHEEK} opacity={0.75} />
      {inner}
    </G>
  );
}

function ChefHat({ x, top }: { x: number; top: number }) {
  const y = top - 30;
  return (
    <G transform={`translate(${x - 100} ${y})`}>
      <Path
        d="M62 30 C52 16 62 -2 78 2 C82 -12 106 -16 114 -2 C128 -10 146 2 140 18 C150 24 146 36 138 38 L66 38 C58 38 56 32 62 30 Z"
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path d="M68 38 L68 50 L134 50 L134 38" fill="#FFFFFF" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </G>
  );
}

function Star({ x, y, color, s = 1 }: { x: number; y: number; color: string; s?: number }) {
  return (
    <Path
      d={`M${x} ${y - 12 * s} L${x + 3.5 * s} ${y - 3.5 * s} L${x + 12 * s} ${y} L${x + 3.5 * s} ${y + 3.5 * s} L${x} ${y + 12 * s} L${x - 3.5 * s} ${y + 3.5 * s} L${x - 12 * s} ${y} L${x - 3.5 * s} ${y - 3.5 * s} Z`}
      fill={color}
      stroke={INK}
      strokeWidth={1.5}
    />
  );
}

export function CharacterSvg({ character, state, size }: { character: CharacterId; state: MascotState; size: number }) {
  const body = BODIES[character];
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessible={false}>
      {body.draw()}
      {state === 'cooking' ? <ChefHat x={body.face.x} top={body.top} /> : null}
      <Face state={state} body={body} />
      {state === 'thinking' ? (
        <G>
          <Circle cx={170} cy={70} r={5} fill={INK} />
          <Circle cx={182} cy={54} r={7} fill={INK} />
          <SvgText x={182} y={36} fontSize={28} fontWeight="bold" fill={INK} textAnchor="middle">
            ?
          </SvgText>
        </G>
      ) : null}
      {state === 'sleepy' ? (
        <G>
          <SvgText x={164} y={72} fontSize={24} fontWeight="bold" fill="#7B5BB0" textAnchor="middle">
            z
          </SvgText>
          <SvgText x={182} y={50} fontSize={18} fontWeight="bold" fill="#7B5BB0" textAnchor="middle">
            z
          </SvgText>
        </G>
      ) : null}
      {state === 'celebrating' ? (
        <G>
          <Star x={20} y={64} color="#F5C451" />
          <Star x={180} y={74} color="#F28DB2" />
          <Star x={34} y={24} color="#7CC4F2" s={0.6} />
          <Star x={168} y={26} color="#7FCB8E" s={0.6} />
        </G>
      ) : null}
      {state === 'encouraging' ? <Star x={170} y={60} color="#F5C451" s={0.7} /> : null}
    </Svg>
  );
}
