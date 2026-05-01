import {
  PAPER_FONT_FAMILY,
  PAPER_PANEL_STYLE,
  createPaperButtonStyle,
  createPaperChipStyle,
  createPaperCounterStyle,
  createPaperInputStyle,
} from '../../components/shared/paper/paperTheme';

export const COMMUNITY_FONT_FAMILY = PAPER_FONT_FAMILY;

export const COMMUNITY_PAGE_STYLE = {
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 0 12px',
};

export const COMMUNITY_PANEL_STYLE = PAPER_PANEL_STYLE;

export const COMMUNITY_INPUT_STYLE = createPaperInputStyle({
  fontFamily: COMMUNITY_FONT_FAMILY,
});

export const COMMUNITY_TEXTAREA_STYLE = {
  ...COMMUNITY_INPUT_STYLE,
  minHeight: '132px',
  resize: 'vertical',
};

export function createCommunityChipStyle({ borderColor, bottomColor, background, color = '#475569' }) {
  return createPaperChipStyle({
    borderColor,
    bottomColor,
    background,
    color,
    fontFamily: COMMUNITY_FONT_FAMILY,
  });
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
  return createPaperButtonStyle({
    borderColor,
    bottomColor,
    background,
    color,
    fontFamily: COMMUNITY_FONT_FAMILY,
  });
}

export function createCommunityCounterStyle({ borderColor, bottomColor, background, color = '#475569' }) {
  return createPaperCounterStyle({
    borderColor,
    bottomColor,
    background,
    color,
  });
}

export function formatCommunityTimestamp(value, locale) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return new Intl.DateTimeFormat(locale || undefined, {
    dateStyle: 'medium',
  }).format(parsed);
}
