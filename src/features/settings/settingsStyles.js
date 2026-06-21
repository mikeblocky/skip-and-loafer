import { createPaperChipStyle } from '../../components/shared/paper/paperTheme';

export const PANEL_TITLE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: 'var(--font-paper)',
  fontWeight: '400',
  color: 'var(--text-primary)',
  fontSize: '1.2rem',
  letterSpacing: '0.2px',
  borderBottom: '2.5px dashed var(--surface-border)',
  paddingBottom: '10px',
  marginBottom: '16px',
};

export const getPanelIconBoxStyle = (border, bottom, background, color) => ({
  ...createPaperChipStyle({
    borderColor: border,
    bottomColor: bottom,
    background,
    color,
    radius: '12px',
    padding: '0',
    minHeight: '34px',
    gap: '0',
  }),
  width: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});
