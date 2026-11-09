/** The mascot's states. Each has its own face (or artwork) and motion. */
export type MascotState = 'idle' | 'happy' | 'thinking' | 'celebrating' | 'cooking' | 'sleepy' | 'encouraging';

export const MASCOT_STATES: readonly MascotState[] = [
  'idle',
  'happy',
  'thinking',
  'celebrating',
  'cooking',
  'sleepy',
  'encouraging',
];
