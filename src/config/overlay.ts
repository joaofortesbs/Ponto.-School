export const OVERLAY_CONFIG = {
  opacity: 0.45,
  blur: 3,
  zIndex: 9999,
  transition: {
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export type OverlayConfig = typeof OVERLAY_CONFIG;
