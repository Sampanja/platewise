/**
 * Final mascot artwork goes in this folder (see docs/MASCOT.md).
 *
 * Until a state has an image here, the app draws the temporary vector
 * version of Nuppu (src/features/mascot/NuppuSvg.tsx). To switch to the final
 * artwork, drop the files in this folder and map them below, e.g.
 *
 *   idle: require('./nuppu-idle.png'),
 *
 * React Native picks @2x / @3x variants automatically when they sit next to
 * the 1x file (nuppu-idle@2x.png, nuppu-idle@3x.png). The app's own motion
 * (bob, bounce, tilt) is applied on top of the image, so still images are
 * enough; see MASCOT.md for optional animated files.
 */
/** Values are `require()` results (asset ids). */
export const MASCOT_IMAGES: Partial<
  Record<'idle' | 'happy' | 'thinking' | 'celebrating' | 'cooking' | 'sleepy' | 'encouraging', number>
> = {};
