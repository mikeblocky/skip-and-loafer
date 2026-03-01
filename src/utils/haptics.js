const HAPTIC_PATTERNS = {
  selection: 6,
  light: 8,
  medium: 14,
  success: [8, 24, 8, 24, 16],
  warning: [26, 36, 26],
  error: [24, 40, 24],
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
