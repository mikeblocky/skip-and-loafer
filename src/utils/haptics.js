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

let hasUserGesture = false;
let gestureListenersBound = false;
let lastHapticAt = 0;
let lastHapticSource = 'manual';
let lastHapticType = null;

const SOFT_HAPTIC_TYPES = new Set(['tap', 'selection', 'light', 'medium', 'press', 'tabSwitch', 'bounce']);

const markUserGesture = () => {
  hasUserGesture = true;
};

const bindGestureListeners = () => {
  if (gestureListenersBound || typeof window === 'undefined') return;

  gestureListenersBound = true;
  window.addEventListener('pointerdown', markUserGesture, { passive: true, once: true });
  window.addEventListener('touchstart', markUserGesture, { passive: true, once: true });
  window.addEventListener('keydown', markUserGesture, { passive: true, once: true });
};

export const registerHapticGesture = () => {
  bindGestureListeners();
  markUserGesture();
};

export const triggerHaptic = (type = 'light', options = {}) => {
  if (isReducedMotionEnabled()) return false;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
  bindGestureListeners();
  if (!hasUserGesture) return false;
  if ((navigator.maxTouchPoints || 0) < 1) return false;

  const now = typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
  const source = options.source || 'manual';

  if (source === 'manual' && lastHapticSource === 'auto' && now - lastHapticAt < 160 && SOFT_HAPTIC_TYPES.has(type)) {
    return false;
  }

  if (lastHapticType === type && now - lastHapticAt < 48) {
    return false;
  }

  const pattern = HAPTIC_PATTERNS[type] ?? HAPTIC_PATTERNS.light;
  try {
    const didVibrate = navigator.vibrate(pattern);
    if (didVibrate) {
      lastHapticAt = now;
      lastHapticSource = source;
      lastHapticType = type;
    }
    return didVibrate;
  } catch {
    return false;
  }
};
