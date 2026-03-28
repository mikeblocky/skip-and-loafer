import { VOL_COLORS } from '../../data/chapters';

// Helper to lighten/darken colors for the Soft-UI palette
const adjustColor = (hex, amount) => {
  const clamp = (num) => Math.min(255, Math.max(0, num));
  const r = clamp(parseInt(hex.slice(1, 3), 16) + amount);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + amount);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const VOL_THEMES = Object.entries(VOL_COLORS).reduce((acc, [vol, color]) => {
  acc[vol] = {
    main: color,
    border: color,
    bg: `${color}15`, // Translucent background
    surface: adjustColor(color, 160), // Very light tinted surface
    accent: adjustColor(color, -20), // Slightly darker for text/icons
    shadow: `${color}40`,
  };
  return acc;
}, {});

export const getChapterRowStyle = (theme, index, finished, isMobile) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: isMobile ? '12px' : '16px',
  padding: isMobile ? '16px 14px' : '18px 20px',
  background: theme.surface,
  borderRadius: '20px',
  border: `3px solid ${theme.border}`,
  borderBottom: finished ? `6px solid ${theme.border}` : `8px solid ${theme.border}`,
  boxShadow: finished 
    ? `0 4px 12px ${theme.shadow}` 
    : `0 8px 20px ${theme.shadow}`,
  width: '100%',
  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  cursor: 'pointer',
  overflow: 'visible',
});

export const getVolumeCardStyle = (theme, isMobile) => ({
  position: 'relative',
  width: isMobile ? '140px' : '200px',
  aspectRatio: '2/3',
  borderRadius: '16px',
  overflow: 'visible',
  background: theme.surface,
  border: `3px solid ${theme.border}`,
  borderRight: `6px solid ${theme.border}`, // Adds 'spine' depth
  borderBottom: `10px solid ${theme.border}`, // Adds 'shelf' depth
  boxShadow: `0 12px 32px ${theme.shadow}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
});

export const getNavButtonStyle = (theme, disabled, isMobile) => ({
  width: isMobile ? '44px' : '40px',
  height: isMobile ? '44px' : '40px',
  borderRadius: '12px',
  border: `3px solid ${disabled ? '#e2e8f0' : theme.border}`,
  background: disabled ? '#f8fafc' : theme.surface,
  borderBottom: disabled ? '3px solid #cbd5e1' : `6px solid ${theme.border}`,
  color: disabled ? '#94a3b8' : theme.accent,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabled ? 'default' : 'pointer',
  transition: 'all 0.15s ease',
});

export const getVolSelectorButtonStyle = (theme, isActive, isMobile) => ({
  minWidth: isMobile ? '42px' : '38px',
  height: isMobile ? '52px' : '48px',
  borderRadius: '12px',
  border: `3px solid ${isActive ? theme.border : '#cbd5e1'}`,
  background: isActive ? theme.surface : '#fff',
  borderBottom: isActive ? `6px solid ${theme.border}` : '4px solid #94a3b8',
  color: isActive ? theme.accent : '#64748b',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-main)',
  fontWeight: '900',
  gap: 0,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  position: 'relative',
  padding: '4px 0',
});

export const VOL_TITLE_STYLE = (theme) => ({
  fontFamily: 'var(--font-main)',
  fontSize: '1.75rem',
  fontWeight: '900',
  color: theme.accent,
  margin: '10px 0 4px 0',
  textShadow: `2px 2px 0 ${theme.surface}`,
});

export const EXTRA_BADGE_STYLE = (theme) => ({
  position: 'absolute',
  top: '-12px',
  right: '-12px',
  background: '#fff',
  border: `3px solid ${theme.border}`,
  borderRadius: '12px',
  padding: '4px 8px',
  fontSize: '0.75rem',
  fontWeight: '900',
  color: theme.accent,
  boxShadow: `0 4px 0 ${theme.border}`,
  zIndex: 10,
});
