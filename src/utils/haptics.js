const HAPTIC_PATTERNS = {
  // Existing
  selection: 6,
  light: 8,
  medium: 14,
  success: [8, 24, 8, 24, 16],
  warning: [26, 36, 26],
  error: [24, 40, 24],
  // New granular patterns
  tap: 4,                        // crisp single-frame tap for buttons
  press: [6, 10, 6],             // held press feeling
  drag: 3,                       // subtle pulse during drag
  release: [4, 8, 10],           // snap-back on release
  celebrate: [8, 20, 8, 20, 12, 30, 16], // milestone / achievement
  bounce: [3, 6, 3],             // rubber-band snap
  tabSwitch: [4, 8, 4],          // tactile tab change
};

const isReducedMotionEnabled = () => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-a11y-reduce-motion') === '1';
};

export const triggerHaptic = (type = 'light') => {
  if (isReducedMotionEnabled()) return false;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;

  const pattern = HAPTIC_PATTERNS[type] ?? HAPTIC_PATTERNS.light;
  return navigator.vibrate(pattern);
};
