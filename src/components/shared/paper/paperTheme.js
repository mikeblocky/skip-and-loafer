export const PAPER_FONT_FAMILY = 'var(--font-paper)';

export const PAPER_PANEL_STYLE = {
  background: '#fffefc',
  border: '3px solid #cbd5e1',
  borderBottom: '8px solid #94a3b8',
  borderRadius: '28px',
  boxShadow: '0 18px 42px rgba(15, 23, 42, 0.12)',
};

export function createPaperPanelStyle({
  background = '#fffefc',
  borderColor = '#cbd5e1',
  bottomColor = '#94a3b8',
  radius = '28px',
  shadow = '0 18px 42px rgba(15, 23, 42, 0.12)',
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
  background = '#ffffff',
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
