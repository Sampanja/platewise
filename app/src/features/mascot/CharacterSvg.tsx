import { memo, type JSX } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';

import type { CharacterId } from '@/theme/characters';

import type { MascotState } from './types';

/**
 * Vector characters in one finished style (docs/MASCOT.md, section 6):
 * - 200 × 200 canvas, warm dark outline (INK, 3.5 px), soft ground shadow.
 * - Bodies are shaded with a radial gradient (light from the upper left) and
 *   a glossy highlight, so every character reads as a rounded object.
 * - Big expressive eyes with two highlights, brows and a mouth per state.
 * - Little outlined arms whose pose tells the state at a glance (wave, both
 *   up, hand on chin, spoon, thumbs up), so states differ in silhouette too.
 * Faces, arms and props are shared; only the body differs per character.
 * Fixed colours: a character keeps its look in light and dark mode. Replaced
 * by final artwork from assets/mascot when it exists.
 */

const INK = '#2B1D15';
const STROKE = 3.5;
const CHEEK = '#F48FB1';
const LEAF = '#3E9A5A';
const LEAF_LIGHT = '#5DB874';
const LEAF_DARK = '#2C7543';
const GOLD = '#F5C451';

type Point = readonly [number, number];

type Body = {
  /** Base, light and shade colour of the gradient. */
  colors: { base: string; light: string; shade: string };
  /** Arm and hand colour (a little darker than the body). */
  limb: string;
  /** Draws the body; `fill` is the shaded gradient. */
  draw: (fill: string) => JSX.Element;
  /** Drawn on top of the body but under the face (leaves over the head, pit). */
  front?: () => JSX.Element;
  face: { x: number; y: number; scale: number };
  /** Shoulders: where the arms join the body (left, right). */
  shoulders: readonly [Point, Point];
  /** Top of the head, where the chef hat sits. */
  top: number;
  /** Eye whites help faces read on dark bodies. */
  sclera: boolean;
};

function Leaf({ d, vein }: { d: string; vein: string }) {
  return (
    <G>
      <Path d={d} fill={LEAF} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Path d={vein} stroke={LEAF_DARK} strokeWidth={2} fill="none" strokeLinecap="round" />
    </G>
  );
}

/** Glossy highlight on the upper left of a body. */
function Shine({ d }: { d: string }) {
  return <Path d={d} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={6} strokeLinecap="round" fill="none" />;
}

const BODIES: Record<CharacterId, Body> = {
  // Beetroot: round magenta root, three leaves on purple stems, a curly tail.
  nuppu: {
    colors: { base: '#9C2160', light: '#C24A86', shade: '#6E1441' },
    limb: '#7E184C',
    face: { x: 100, y: 128, scale: 1 },
    shoulders: [
      [38, 136],
      [162, 136],
    ],
    top: 64,
    sclera: true,
    draw: (fill) => (
      <G>
        <Path d="M96 66 C92 50 90 38 92 24" stroke="#8E1B50" strokeWidth={5} fill="none" strokeLinecap="round" />
        <Path d="M104 66 C112 54 120 48 128 44" stroke="#8E1B50" strokeWidth={4} fill="none" strokeLinecap="round" />
        <Leaf d="M92 32 C70 28 54 10 62 0 C82 2 96 18 92 32 Z" vein="M90 30 C80 22 72 12 66 4" />
        <Leaf d="M100 34 C102 14 118 2 134 4 C136 22 120 36 100 34 Z" vein="M104 30 C112 20 120 12 130 8" />
        <Leaf d="M124 46 C138 34 160 34 170 46 C158 58 138 58 124 46 Z" vein="M130 46 C142 44 154 44 164 46" />
        <Path d="M100 186 C98 194 103 199 110 197" stroke={INK} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
        <Path
          d="M100 62 C152 62 174 98 170 134 C166 168 136 188 100 188 C64 188 34 168 30 134 C26 98 48 62 100 62 Z"
          fill={fill}
          stroke={INK}
          strokeWidth={STROKE}
        />
        <Shine d="M58 96 C66 82 80 74 94 72" />
        <Path d="M150 152 C146 162 140 170 132 176" stroke="#5E1037" strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <Path d="M60 166 C66 172 72 176 80 179" stroke="#5E1037" strokeWidth={3} strokeLinecap="round" fill="none" />
      </G>
    ),
  },
  // Avocado: pear-shaped dark skin, buttery flesh and a round pit as a belly.
  avo: {
    colors: { base: '#4A7A2E', light: '#6C9E43', shade: '#2F5219' },
    limb: '#3E6A25',
    face: { x: 100, y: 96, scale: 0.86 },
    shoulders: [
      [48, 128],
      [152, 128],
    ],
    top: 34,
    sclera: false,
    draw: (fill) => (
      <G>
        <Path d="M100 32 C101 24 104 18 110 14" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path
          d="M100 30 C134 30 152 70 158 112 C164 160 136 192 100 192 C64 192 36 160 42 112 C48 70 66 30 100 30 Z"
          fill={fill}
          stroke={INK}
          strokeWidth={STROKE}
        />
        <Path
          d="M100 42 C126 42 142 76 147 112 C152 152 128 181 100 181 C72 181 48 152 53 112 C58 76 74 42 100 42 Z"
          fill="#DCEDAA"
        />
        <Path d="M100 50 C122 50 136 80 140 112" stroke="#F2F8D2" strokeWidth={5} strokeLinecap="round" fill="none" />
      </G>
    ),
    front: () => (
      <G>
        <Circle cx={100} cy={148} r={23} fill="#8A5A2B" stroke={INK} strokeWidth={3} />
        <Ellipse cx={92} cy={140} rx={7} ry={5} fill="#B9844D" />
      </G>
    ),
  },
  // Tomato: plump, wide and red, with a green star calyx and a little stem.
  tomo: {
    colors: { base: '#E0412F', light: '#F4705B', shade: '#B02A1D' },
    limb: '#C2321F',
    face: { x: 100, y: 128, scale: 1 },
    shoulders: [
      [28, 132],
      [172, 132],
    ],
    top: 60,
    sclera: false,
    draw: (fill) => (
      <G>
        <Ellipse cx={100} cy={126} rx={76} ry={64} fill={fill} stroke={INK} strokeWidth={STROKE} />
        <Shine d="M50 104 C56 90 70 80 86 76" />
        <Path d="M74 66 C84 72 92 74 100 74 C108 74 116 72 126 66" stroke="#B02A1D" strokeWidth={3} fill="none" strokeLinecap="round" />
      </G>
    ),
    front: () => (
      <G>
        <Path
          d="M100 74 L86 58 L98 64 L100 48 L104 64 L118 56 L108 72 L126 76 L106 80 L100 94 L94 80 L74 78 Z"
          fill={LEAF}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <Path d="M100 52 C100 42 104 36 110 32" stroke={LEAF_DARK} strokeWidth={6} strokeLinecap="round" fill="none" />
        <Path d="M100 52 C100 42 104 36 110 32" stroke={INK} strokeWidth={1.5} strokeLinecap="round" fill="none" strokeOpacity={0.4} />
      </G>
    ),
  },
  // Carrot: a tall tapering root with ridges and a tuft of fronds.
  karo: {
    colors: { base: '#F28A2E', light: '#FFAE5E', shade: '#C9631A' },
    limb: '#D9701F',
    face: { x: 100, y: 102, scale: 0.86 },
    shoulders: [
      [58, 116],
      [142, 116],
    ],
    top: 60,
    sclera: false,
    draw: (fill) => (
      <G>
        <Leaf d="M94 66 C76 52 66 30 74 14 C90 24 100 46 94 66 Z" vein="M92 60 C86 46 80 32 77 20" />
        <Leaf d="M106 66 C108 42 120 22 136 18 C140 38 126 58 106 66 Z" vein="M110 60 C116 46 124 32 132 24" />
        <Leaf d="M100 64 C94 42 96 20 104 4 C116 22 112 46 100 64 Z" vein="M101 58 C100 40 101 24 104 10" />
        <Path
          d="M52 78 C52 64 76 58 100 58 C124 58 148 64 148 78 C148 98 122 160 108 188 C104 196 96 196 92 188 C78 160 52 98 52 78 Z"
          fill={fill}
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
        <Shine d="M66 80 C74 70 86 67 98 67" />
        <Path
          d="M68 136 L82 132 M118 152 L130 148 M80 162 L92 160 M122 124 L136 120 M90 178 L98 177"
          stroke="#C2591A"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </G>
    ),
  },
  // Lemon: a sunny oval with a nub at each end and one leaf on top.
  lemo: {
    colors: { base: '#FAD12E', light: '#FFE878', shade: '#E0A800' },
    limb: '#E6B400',
    face: { x: 100, y: 118, scale: 0.95 },
    shoulders: [
      [36, 138],
      [164, 138],
    ],
    top: 56,
    sclera: false,
    draw: (fill) => (
      <G>
        <Leaf d="M102 58 C104 40 120 26 140 26 C140 46 122 60 102 58 Z" vein="M106 54 C116 44 126 36 136 30" />
        <Path
          d="M22 118 C22 110 28 106 34 104 C44 76 70 58 100 58 C130 58 156 76 166 104 C172 106 178 110 178 118 C178 126 172 130 166 132 C156 162 130 180 100 180 C70 180 44 162 34 132 C28 130 22 126 22 118 Z"
          fill={fill}
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
        <Shine d="M54 92 C64 78 80 70 96 68" />
        <Circle cx={142} cy={156} r={2} fill="#D69E00" />
        <Circle cx={60} cy={158} r={2} fill="#D69E00" />
        <Circle cx={150} cy={86} r={2} fill="#D69E00" />
      </G>
    ),
  },
  // Blueberry: a round indigo berry with a dusty bloom, a five-point crown and a twig.
  blu: {
    colors: { base: '#4F5BB8', light: '#7C88DA', shade: '#323C8A' },
    limb: '#414CA2',
    face: { x: 100, y: 128, scale: 0.98 },
    shoulders: [
      [34, 138],
      [166, 138],
    ],
    top: 62,
    sclera: true,
    draw: (fill) => (
      <G>
        <Path d="M112 64 C118 46 128 36 142 30" stroke="#6B4A2E" strokeWidth={5} strokeLinecap="round" fill="none" />
        <Leaf d="M132 36 C138 18 158 8 176 12 C172 32 152 42 132 36 Z" vein="M138 32 C148 24 160 18 170 15" />
        <Circle cx={100} cy={128} r={68} fill={fill} stroke={INK} strokeWidth={STROKE} />
        <Path d="M54 96 C62 82 76 72 92 68" stroke="#C9D0F5" strokeOpacity={0.7} strokeWidth={6} strokeLinecap="round" fill="none" />
        <Circle cx={140} cy={168} r={3} fill="#C9D0F5" opacity={0.5} />
        <Circle cx={60} cy={164} r={2.5} fill="#C9D0F5" opacity={0.5} />
      </G>
    ),
    front: () => (
      <G>
        <Path
          d="M100 58 L106 68 L118 66 L110 76 L116 86 L104 82 L100 92 L96 82 L84 86 L90 76 L82 66 L94 68 Z"
          fill="#2B336F"
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <Circle cx={100} cy={75} r={4} fill="#1B2150" />
      </G>
    ),
  },
};

// ——— Faces ———

function Eye({ x, y, sclera, look = [0, 0] }: { x: number; y: number; sclera: boolean; look?: Point }) {
  const [lx, ly] = look;
  return (
    <G>
      {sclera ? <Ellipse cx={x} cy={y} rx={11.5} ry={13.5} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} /> : null}
      <Ellipse cx={x + lx * 3} cy={y + ly * 3 + (sclera ? 1 : 0)} rx={sclera ? 6.8 : 8.5} ry={sclera ? 8 : 10.5} fill={INK} />
      <Circle cx={x + lx * 3 + 2.8} cy={y + ly * 3 - 3.5} r={2.8} fill="#FFFFFF" />
      <Circle cx={x + lx * 3 - 2.4} cy={y + ly * 3 + 3.6} r={1.3} fill="#FFFFFF" opacity={0.85} />
    </G>
  );
}

/** A closed eye: a smiling arc (^) or, with `down`, a sleepy one. */
function ClosedEye({ x, y, down = false }: { x: number; y: number; down?: boolean }) {
  return (
    <Path
      d={down ? `M${x - 10} ${y} Q${x} ${y + 8} ${x + 10} ${y}` : `M${x - 10} ${y + 3} Q${x} ${y - 10} ${x + 10} ${y + 3}`}
      stroke={INK}
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Brow({ x, y, tilt, lift = 0 }: { x: number; y: number; tilt: number; lift?: number }) {
  return (
    <Path
      d={`M${x - 9} ${y - lift + tilt} Q${x} ${y - lift - 5} ${x + 9} ${y - lift - tilt}`}
      stroke={INK}
      strokeWidth={3.5}
      fill="none"
      strokeLinecap="round"
    />
  );
}

const LX = -24;
const RX = 24;
const MOUTH = 22;

function Face({ state, body, blink }: { state: MascotState; body: Body; blink: boolean }) {
  const { x, y, scale } = body.face;
  const open = (look?: Point) =>
    blink ? (
      <G>
        <ClosedEye x={LX} y={2} down />
        <ClosedEye x={RX} y={2} down />
      </G>
    ) : (
      <G>
        <Eye x={LX} y={0} sclera={body.sclera} look={look} />
        <Eye x={RX} y={0} sclera={body.sclera} look={look} />
      </G>
    );
  const browY = body.sclera ? -20 : -18;
  const inner = (() => {
    switch (state) {
      case 'happy':
        return (
          <G>
            <ClosedEye x={LX} y={0} />
            <ClosedEye x={RX} y={0} />
            <Path d={`M-16 ${MOUTH - 4} Q0 ${MOUTH + 22} 16 ${MOUTH - 4} Z`} fill={INK} />
            <Path d={`M-8 ${MOUTH + 7} Q0 ${MOUTH + 13} 8 ${MOUTH + 7}`} stroke="#E36B6B" strokeWidth={6} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'celebrating':
        return (
          <G>
            <ClosedEye x={LX} y={0} />
            <ClosedEye x={RX} y={0} />
            <Brow x={LX} y={browY - 2} tilt={-2} lift={2} />
            <Brow x={RX} y={browY - 2} tilt={2} lift={2} />
            <Path d={`M-19 ${MOUTH - 6} Q0 ${MOUTH + 30} 19 ${MOUTH - 6} Z`} fill={INK} />
            <Path d={`M-9 ${MOUTH + 10} Q0 ${MOUTH + 17} 9 ${MOUTH + 10}`} stroke="#E36B6B" strokeWidth={7} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'thinking':
        return (
          <G>
            {open([1, -1])}
            <Brow x={LX} y={browY} tilt={0} />
            <Brow x={RX} y={browY} tilt={3} lift={4} />
            <Ellipse cx={8} cy={MOUTH + 3} rx={5} ry={5.5} fill={INK} />
          </G>
        );
      case 'sleepy':
        return (
          <G>
            <ClosedEye x={LX} y={0} down />
            <ClosedEye x={RX} y={0} down />
            <Ellipse cx={0} cy={MOUTH + 4} rx={5} ry={4} fill={INK} />
          </G>
        );
      case 'encouraging':
        return (
          <G>
            {blink ? <ClosedEye x={LX} y={2} down /> : <Eye x={LX} y={0} sclera={body.sclera} />}
            <ClosedEye x={RX} y={2} />
            <Brow x={LX} y={browY} tilt={-2} lift={2} />
            <Path d={`M-15 ${MOUTH - 2} Q0 ${MOUTH + 16} 15 ${MOUTH - 2}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'cooking':
        return (
          <G>
            {open([0, 0.4])}
            <Path d={`M-12 ${MOUTH} Q0 ${MOUTH + 11} 12 ${MOUTH}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
            <Path d={`M3 ${MOUTH + 6} Q8 ${MOUTH + 13} 12 ${MOUTH + 5}`} fill="#E36B6B" stroke={INK} strokeWidth={2} />
          </G>
        );
      case 'idle':
      default:
        return (
          <G>
            {open()}
            <Path d={`M-12 ${MOUTH} Q0 ${MOUTH + 11} 12 ${MOUTH}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
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

// ——— Arms ———

type Pose = 'down' | 'wave' | 'up' | 'scratch' | 'spoon' | 'thumb' | 'droop';

/** Each state's arm poses (left, right). */
const POSES: Record<MascotState, readonly [Pose, Pose]> = {
  idle: ['down', 'down'],
  happy: ['down', 'wave'],
  celebrating: ['up', 'up'],
  thinking: ['down', 'scratch'],
  cooking: ['down', 'spoon'],
  sleepy: ['droop', 'droop'],
  encouraging: ['down', 'thumb'],
};

/** Hand position relative to the shoulder for a right arm (mirrored for the left). */
function handFor(pose: Pose): Point {
  switch (pose) {
    case 'wave':
      return [20, -40];
    case 'up':
      return [16, -46];
    case 'scratch':
      // Up to the side of the head, scratching it while thinking.
      return [-2, -54];
    case 'spoon':
      return [6, -26];
    case 'thumb':
      return [20, -20];
    case 'droop':
      return [8, 26];
    case 'down':
    default:
      return [14, 22];
  }
}

function Arm({ body, side, pose }: { body: Body; side: 0 | 1; pose: Pose }) {
  const [sx, sy] = body.shoulders[side];
  const dir = side === 0 ? -1 : 1;
  const [hx0, hy] = handFor(pose);
  const hx = hx0 * dir;
  const ex = sx + hx;
  const ey = sy + hy;
  // An elbow bend outwards keeps the arm soft and readable.
  const cx = sx + (pose === 'scratch' ? 26 * dir : hx * 0.5 + 10 * dir);
  const cy = sy + hy * 0.5 + (pose === 'scratch' ? -6 : 4);
  const d = `M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}`;
  return (
    <G>
      <Path d={d} stroke={INK} strokeWidth={10} strokeLinecap="round" fill="none" />
      <Path d={d} stroke={body.limb} strokeWidth={5} strokeLinecap="round" fill="none" />
      {pose === 'spoon' ? (
        <G>
          <Path d={`M${ex + 4} ${ey + 10} L${ex - 8} ${ey - 30}`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <Path d={`M${ex + 4} ${ey + 10} L${ex - 8} ${ey - 30}`} stroke="#C99A5E" strokeWidth={3.5} strokeLinecap="round" />
          <Ellipse cx={ex - 10} cy={ey - 36} rx={6} ry={9} fill="#C99A5E" stroke={INK} strokeWidth={2.5} rotation={-17} origin={`${ex - 10}, ${ey - 36}`} />
        </G>
      ) : null}
      <Circle cx={ex} cy={ey} r={7.5} fill={body.limb} stroke={INK} strokeWidth={3} />
      {pose === 'thumb' ? (
        <Path d={`M${ex - 1} ${ey - 6} L${ex - 1} ${ey - 15}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      ) : null}
      {pose === 'thumb' ? (
        <Path d={`M${ex - 1} ${ey - 6} L${ex - 1} ${ey - 15}`} stroke={body.limb} strokeWidth={3.5} strokeLinecap="round" />
      ) : null}
    </G>
  );
}

// ——— Props ———

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
      <Path d="M84 40 L84 48 M101 40 L101 48 M118 40 L118 48" stroke="#E2D9D0" strokeWidth={2} />
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
      strokeLinejoin="round"
    />
  );
}

/** A question mark drawn as a path (no font needed). */
function Question({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Path
        d={`M${x - 8} ${y - 8} C${x - 8} ${y - 18} ${x + 9} ${y - 18} ${x + 9} ${y - 7} C${x + 9} ${y} ${x} ${y} ${x} ${y + 7}`}
        stroke={INK}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={x} cy={y + 16} r={3.2} fill={INK} />
    </G>
  );
}

/** A "z" drawn as a path. */
function Zed({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <Path
      d={`M${x - 6 * s} ${y - 6 * s} L${x + 6 * s} ${y - 6 * s} L${x - 6 * s} ${y + 6 * s} L${x + 6 * s} ${y + 6 * s}`}
      stroke="#7B5BB0"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

export type CharacterSvgProps = {
  character: CharacterId;
  state: MascotState;
  size: number;
  /** Eyes closed for a blink (only states with open eyes change). */
  blink?: boolean;
};

export const CharacterSvg = memo(function CharacterSvg({ character, state, size, blink = false }: CharacterSvgProps) {
  const body = BODIES[character];
  const gradientId = `body-${character}`;
  const [leftPose, rightPose] = POSES[state];
  const hatX = body.face.x;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessible={false}>
      <Defs>
        <RadialGradient id={gradientId} cx="38%" cy="32%" rx="70%" ry="72%" fx="34%" fy="28%">
          <Stop offset="0" stopColor={body.colors.light} />
          <Stop offset="0.55" stopColor={body.colors.base} />
          <Stop offset="1" stopColor={body.colors.shade} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={100} cy={194} rx={52} ry={5} fill={INK} opacity={0.14} />
      {body.draw(`url(#${gradientId})`)}
      {body.front?.()}
      <Arm body={body} side={0} pose={leftPose} />
      <Arm body={body} side={1} pose={rightPose} />
      {state === 'cooking' ? <ChefHat x={hatX} top={body.top} /> : null}
      <Face state={state} body={body} blink={blink} />
      {state === 'thinking' ? (
        <G>
          <Circle cx={164} cy={62} r={4} fill={INK} />
          <Circle cx={174} cy={48} r={6} fill={INK} />
          <Question x={184} y={22} />
        </G>
      ) : null}
      {state === 'sleepy' ? (
        <G>
          <Zed x={164} y={62} s={1.1} />
          <Zed x={182} y={38} s={0.8} />
        </G>
      ) : null}
      {state === 'celebrating' ? (
        <G>
          <Star x={18} y={60} color={GOLD} />
          <Star x={184} y={78} color="#F28DB2" />
          <Star x={30} y={20} color="#7CC4F2" s={0.6} />
          <Star x={170} y={22} color={LEAF_LIGHT} s={0.6} />
          <Circle cx={56} cy={34} r={3.5} fill="#F28DB2" />
          <Circle cx={148} cy={44} r={3.5} fill={GOLD} />
        </G>
      ) : null}
      {state === 'encouraging' ? <Star x={178} y={70} color={GOLD} s={0.7} /> : null}
    </Svg>
  );
});

/** Every character id with a drawn body (for tests). */
export const DRAWN_CHARACTERS = Object.keys(BODIES) as CharacterId[];
