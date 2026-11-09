/** Geometry of the floating tab bar (pure, so it can be unit tested). */

export const BAR_HEIGHT = 68;
export const PRIMARY_SIZE = 56;
/** Centre of the primary button, measured down from the bar's top edge. */
export const PRIMARY_CENTER_Y = 2;
/** How far the primary button rises above the bar. */
export const RISE = PRIMARY_SIZE / 2 - PRIMARY_CENTER_Y;
/** The notch: half its width at the top edge and its depth. Leaves a ~6 dp ring of air around the button. */
export const NOTCH_HALF = 46;
export const NOTCH_DEPTH = 36;
/** On tablets and landscape the bar keeps a comfortable width instead of stretching. */
export const MAX_BAR_WIDTH = 520;

/**
 * The bar's outline: a pill with a smooth notch cut in the middle of the top
 * edge for the primary button. Five equal slots put the centre slot exactly at
 * width / 2, so the notch always sits under the button.
 */
export function barPath(width: number, height = BAR_HEIGHT): string {
  const r = height / 2;
  const cx = width / 2;
  const h = NOTCH_HALF;
  const d = NOTCH_DEPTH;
  return [
    `M ${r} 0`,
    `L ${cx - h} 0`,
    // Two cubic curves form the scoop; both ends are tangent to the top edge.
    `C ${cx - h + 14} 0 ${cx - h + 8} ${d} ${cx} ${d}`,
    `C ${cx + h - 8} ${d} ${cx + h - 14} 0 ${cx + h} 0`,
    `L ${width - r} 0`,
    `A ${r} ${r} 0 0 1 ${width - r} ${height}`,
    `L ${r} ${height}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    'Z',
  ].join(' ');
}
