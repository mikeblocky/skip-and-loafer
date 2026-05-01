export const PAPER_FONT_FAMILY = 'var(--font-paper)';

export const PAPER_PANEL_STYLE = {
  background: 'var(--surface-panel)',
  border: '3px solid var(--surface-border)',
  borderBottom: '8px solid var(--surface-border-strong)',
  borderRadius: '28px',
  boxShadow: 'var(--shadow-panel)',
};

export const PAPER_FLOATING_PANEL_STYLE = {
  ...PAPER_PANEL_STYLE,
  background: 'var(--surface-elevated)',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-floating)',
};

export const PAPER_MODAL_STYLE = {
  ...PAPER_PANEL_STYLE,
  background: 'var(--surface-elevated)',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-modal)',
};

export function createPaperPanelStyle({
  background = 'var(--surface-panel)',
  borderColor = 'var(--surface-border)',
  bottomColor = 'var(--surface-border-strong)',
  radius = '28px',
  shadow = 'var(--shadow-panel)',
} = {}) {
  return {
    ...PAPER_PANEL_STYLE,
    background,
    borderColor,
    borderBottomColor: bottomColor,
    borderRadius: radius,
    boxShadow: shadow,
  };
}

export function createPaperHeadingBadgeStyle({
  borderColor,
  bottomColor,
  background = 'var(--surface-card)',
  radius = '24px',
  padding = '10px 24px',
  gap = '12px',
  shadow = '0 8px 18px rgba(15, 23, 42, 0.12)',
} = {}) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap,
    padding,
    borderRadius: radius,
    background,
    border: `3.5px solid ${borderColor}`,
    borderBottom: `9.5px solid ${bottomColor}`,
    boxShadow: shadow,
    zIndex: 1,
  };
}

export function createPaperButtonStyle({
  borderColor,
  bottomColor,
  background,
  color = '#ffffff',
  radius = '16px',
  padding = '15px 26px',
  minHeight = '54px',
  fontSize = '1.1rem',
  fontFamily = PAPER_FONT_FAMILY,
  gap = '10px',
  shadow = '0 10px 20px rgba(15, 23, 42, 0.1)',
} = {}) {
  return {
    border: `3px solid ${borderColor}`,
    borderBottom: `8px solid ${bottomColor}`,
    borderRadius: radius,
    background,
    color,
    cursor: 'pointer',
    fontFamily,
    fontSize,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap,
    padding,
    minHeight,
    boxShadow: shadow,
  };
}

export function createPaperInputStyle({
  background = 'var(--surface-card)',
  borderColor = '#dbe7f3',
  bottomColor = '#c7d7ea',
  color = '#1e293b',
  radius = '16px',
  padding = '12px 14px',
  minHeight = '48px',
  fontSize = '1rem',
  lineHeight = 1.4,
  fontFamily = PAPER_FONT_FAMILY,
} = {}) {
  return {
    width: '100%',
    border: `2.5px solid ${borderColor}`,
    borderBottom: `5px solid ${bottomColor}`,
    borderRadius: radius,
    background,
    color,
    padding,
    minHeight,
    fontFamily,
    fontSize,
    lineHeight,
    outline: 'none',
  };
}

export function createPaperChipStyle({
  borderColor,
  bottomColor,
  background,
  color = '#475569',
  radius = '16px',
  padding = '6px 10px',
  minHeight = '32px',
  fontSize = '0.78rem',
  fontFamily = PAPER_FONT_FAMILY,
  gap = '6px',
} = {}) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap,
    background,
    border: `2.5px solid ${borderColor}`,
    borderBottom: `6px solid ${bottomColor}`,
    borderRadius: radius,
    padding,
    minHeight,
    color,
    fontFamily,
    fontSize,
    lineHeight: 1,
    fontWeight: '400',
  };
}

export function createPaperCounterStyle({
  borderColor,
  bottomColor,
  background,
  color = '#475569',
} = {}) {
  return {
    ...createPaperButtonStyle({
      borderColor,
      bottomColor,
      background,
      color,
    }),
    padding: '14px 22px',
    minWidth: '112px',
    justifyContent: 'center',
    borderRadius: '999px',
  };
}
