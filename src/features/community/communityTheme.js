export const COMMUNITY_FONT_FAMILY = '"Sniglet", "Coming Soon", cursive';

export const COMMUNITY_PAGE_STYLE = {
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 0 12px',
};

export const COMMUNITY_PANEL_STYLE = {
  background: '#fffefc',
  border: '3px solid #cbd5e1',
  borderBottom: '8px solid #94a3b8',
  borderRadius: '28px',
  boxShadow: '0 18px 42px rgba(15, 23, 42, 0.12)',
};

export const COMMUNITY_INPUT_STYLE = {
  width: '100%',
  border: '2.5px solid #dbe7f3',
  borderBottom: '5px solid #c7d7ea',
  borderRadius: '16px',
  background: '#ffffff',
  color: '#1e293b',
  padding: '12px 14px',
  fontFamily: COMMUNITY_FONT_FAMILY,
  fontSize: '1rem',
  lineHeight: 1.4,
  outline: 'none',
};

export const COMMUNITY_TEXTAREA_STYLE = {
  ...COMMUNITY_INPUT_STYLE,
  minHeight: '132px',
  resize: 'vertical',
};

export function createCommunityChipStyle({ borderColor, bottomColor, background, color = '#475569' }) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background,
    border: `2.5px solid ${borderColor}`,
    borderBottom: `6px solid ${bottomColor}`,
    borderRadius: '16px',
    padding: '6px 10px',
    minHeight: '32px',
    color,
    fontFamily: COMMUNITY_FONT_FAMILY,
    fontSize: '0.78rem',
    lineHeight: 1,
    fontWeight: '400',
  };
}

export function createCommunityTimestampStyle({ borderColor, bottomColor, background, color = '#475569' }) {
  return {
    ...createCommunityChipStyle({ borderColor, bottomColor, background, color }),
    padding: '4px 10px',
    minHeight: '28px',
    fontSize: '0.72rem',
    borderRadius: '8px',
  };
}

export function createCommunityButtonStyle({ borderColor, bottomColor, background, color = '#ffffff' }) {
  return {
    border: `3px solid ${borderColor}`,
    borderBottom: `8px solid ${bottomColor}`,
    borderRadius: '16px',
    background,
    color,
    cursor: 'pointer',
    fontFamily: COMMUNITY_FONT_FAMILY,
    fontSize: '1.1rem',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px 26px',
    minHeight: '54px',
    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.1)',
  };
}

export function createCommunityCounterStyle({ borderColor, bottomColor, background, color = '#475569' }) {
  return {
    ...createCommunityButtonStyle({ borderColor, bottomColor, background, color }),
    padding: '14px 22px',
    minWidth: '112px',
    justifyContent: 'center',
    borderRadius: '999px',
  };
}

export function formatCommunityTimestamp(value, locale) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return new Intl.DateTimeFormat(locale || undefined, {
    dateStyle: 'medium',
  }).format(parsed);
}
