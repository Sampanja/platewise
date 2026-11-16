/**
 * Final character artwork goes in this folder (see docs/MASCOT.md).
 *
 * Until a character's state has an image here, the app draws the temporary
 * vector version (src/features/mascot/CharacterSvg.tsx). To switch to the
 * final artwork, drop the files in this folder and map them below, e.g.
 *
 *   nuppu: {
 *     idle: require('./nuppu/idle.png'),
 *     happy: require('./nuppu/happy.png'),
 *   },
 *
 * Missing states fall back to the character's `idle` image and then to the
 * vector drawing, so artwork can be added one file at a time. React Native
 * picks @2x / @3x variants automatically when they sit next to the 1x file
 * (idle@2x.png, idle@3x.png). The app's own motion (bob, bounce, tilt) is
 * applied on top of the image, so still images are enough; animated WebP or
 * GIF files also work because expo-image plays them.
 */

/** `idleBlink` is the idle pose with closed eyes (idle-blink.png), shown during a blink. */
type State = 'idle' | 'idleBlink' | 'happy' | 'thinking' | 'celebrating' | 'cooking' | 'sleepy' | 'encouraging';
type Character = 'nuppu' | 'avo' | 'tomo' | 'karo' | 'lemo' | 'blu';

/** Values are `require()` results (asset ids). */
export const CHARACTER_IMAGES: Partial<Record<Character, Partial<Record<State, number>>>> = {};
