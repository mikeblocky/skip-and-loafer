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

export const TRANSITION_FAST = { duration: 0.2 };
export const TRANSITION_TAB = { duration: 0.25 };

export const HOVER_LIFT_SM = { y: -2 };
export const HOVER_SCALE_TAB = { scale: 1.06 };

export const TAP_SCALE_DEFAULT = { scale: 0.95 };
export const TAP_SCALE_SOFT = { scale: 0.96 };
export const TAP_SCALE_TAB = { scale: 0.93 };
