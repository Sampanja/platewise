/**
 * Colours that intentionally ignore the light/dark theme and the character:
 * surfaces drawn on top of the camera feed or photos, product photos on
 * white, and the metal tiers of badges. Views never write hex values; they
 * read these or the active palette (`colors`).
 */
export const fixed = {
  /** Camera preview background before the feed starts. */
  black: '#000000',
  white: '#FFFFFF',
  /** Panels and buttons over the camera feed. */
  cameraPanel: 'rgba(0, 0, 0, 0.55)',
  cameraPanelLight: 'rgba(0, 0, 0, 0.45)',
  cameraHairline: 'rgba(255, 255, 255, 0.2)',
  cameraFrame: 'rgba(255, 255, 255, 0.55)',
  /** Dims a photo slightly while it is being "scanned". */
  photoDim: 'rgba(0, 0, 0, 0.2)',
  /** Inner highlight on the primary button, readable on every accent. */
  buttonHighlight: 'rgba(255, 255, 255, 0.25)',
  /** Product photos are cut out on white. */
  productBackdrop: '#FFFFFF',
  /** Badge tiers: the same metals in every theme. */
  badge: {
    bronze: { from: '#E7A46B', to: '#B4692F', ribbon: '#C9461A' },
    silver: { from: '#E6EBF0', to: '#9AA6B2', ribbon: '#1F6FA8' },
    gold: { from: '#FFE08A', to: '#D49B16', ribbon: '#2F7D4A' },
    shine: '#FFFFFF',
    /** Icon on the metal: dark enough on all three tiers. */
    ink: '#2B1D15',
  },
} as const;
