// ── Spring-based physics presets ──
// Every interaction should feel like touching something real.

// Entrance springs
export const ENTER_SPRING = { type: 'spring', stiffness: 260, damping: 20 };
export const ENTER_SPRING_SOFT = { type: 'spring', stiffness: 180, damping: 22 };
export const ENTER_SPRING_BOUNCY = { type: 'spring', stiffness: 400, damping: 15 };

// Drag springs
export const DRAG_SPRING = { bounceStiffness: 300, bounceDamping: 20 };
export const DRAG_SPRING_HEAVY = { bounceStiffness: 400, bounceDamping: 25 };

// ── Fade / Slide entrance ──
export const FADE_UP_INITIAL = { opacity: 0, y: 20 };
export const FADE_UP_ANIMATE = { opacity: 1, y: 0 };

export const CONTENT_SLIDE = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const CONTENT_SLIDE_COMPACT = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export const TAB_PANEL_INITIAL = { opacity: 0, x: 20 };
export const getTabPanelAnimate = (isActive) => ({ opacity: isActive ? 1 : 0, x: isActive ? 0 : -8 });

// ── Transition presets (spring-based) ──
export const TRANSITION_FAST = { type: 'spring', stiffness: 500, damping: 30 };
export const TRANSITION_TAB = { type: 'spring', stiffness: 400, damping: 25 };
export const TRANSITION_GENTLE = { type: 'spring', stiffness: 200, damping: 20 };

// ── Hover presets ──
export const HOVER_LIFT_SM = { y: -3, boxShadow: '0 6px 16px rgba(0,0,0,0.1)' };
export const HOVER_SCALE_TAB = { scale: 1.08, y: -1 };

// ── Tap presets (spring squish with overshoot) ──
export const TAP_SCALE_DEFAULT = { scale: 0.92 };
export const TAP_SCALE_SOFT = { scale: 0.95 };
export const TAP_SCALE_TAB = { scale: 0.9 };

// Spring configs for whileTap transitions (use as transition prop)
export const PRESS_SPRING = { type: 'spring', stiffness: 500, damping: 15, mass: 0.6 };
export const PRESS_SPRING_SOFT = { type: 'spring', stiffness: 350, damping: 18, mass: 0.7 };

// ── Wobble / emotional keyframes ──
export const WOBBLE = {
  rotate: [0, -3, 4, -2, 1, 0],
  scale: [1, 1.04, 0.97, 1.02, 1],
};
export const WOBBLE_TRANSITION = { duration: 0.6, ease: 'easeInOut' };

// ── Breathing / idle animation ──
export const BREATHE = {
  scale: [1, 1.03, 1],
  y: [0, -2, 0],
};
export const BREATHE_TRANSITION = { duration: 3, repeat: Infinity, ease: 'easeInOut' };

// ── Heartbeat pulse ──
export const HEARTBEAT = {
  scale: [1, 1.08, 1, 1.05, 1],
};
export const HEARTBEAT_TRANSITION = { duration: 1.2, repeat: Infinity, ease: 'easeInOut' };

// ── Jelly / Squash-and-stretch ──
// Squish down on tap, stretch up on release — like pressing a gummy button
export const JELLY_TAP = { scale: 0.9, scaleY: 0.85, scaleX: 1.08 };
export const JELLY_HOVER = { scale: 1.06, scaleY: 1.04, scaleX: 1.02, y: -2 };
export const SQUASH_TRANSITION = { type: 'spring', stiffness: 600, damping: 12, mass: 0.4 };

// Playful entrance with slight random-feeling rotation
export const PLAYFUL_ENTRANCE = (index) => ({
  initial: { opacity: 0, y: 18, rotate: (index % 3 - 1) * 1.5, scale: 0.95 },
  animate: { opacity: 1, y: 0, rotate: (index % 2 === 0 ? 0.3 : -0.3), scale: 1 },
  transition: { delay: index * 0.035, type: 'spring', stiffness: 280, damping: 18 },
});

// Number badge pop — for chapter numbers, volume badges
export const BADGE_POP = { scale: [0.8, 1.15, 0.95, 1.05, 1] };
export const BADGE_POP_TRANSITION = { duration: 0.5, ease: 'easeOut' };
