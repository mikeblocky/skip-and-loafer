import { VOL_COLORS } from '../../data/chapters';

export const NOTE_PALETTES = [
  { background: 'var(--themed-note-bg-1, #fff8be)', border: 'var(--themed-note-border-1, #facc15)', bottom: 'var(--themed-note-bottom-1, #eab308)', accent: 'var(--themed-note-accent-1, #a16207)' },
  { background: 'var(--themed-note-bg-2, #fee2e2)', border: 'var(--themed-note-border-2, #fda4af)', bottom: 'var(--themed-note-bottom-2, #fb7185)', accent: 'var(--themed-note-accent-2, #be123c)' },
  { background: 'var(--themed-note-bg-3, #dbeafe)', border: 'var(--themed-note-border-3, #93c5fd)', bottom: 'var(--themed-note-bottom-3, #60a5fa)', accent: 'var(--themed-note-accent-3, #1d4ed8)' },
  { background: 'var(--themed-note-bg-4, #dcfce7)', border: 'var(--themed-note-border-4, #86efac)', bottom: 'var(--themed-note-bottom-4, #4ade80)', accent: 'var(--themed-note-accent-4, #15803d)' },
  { background: 'var(--themed-note-bg-5, #fce7f3)', border: 'var(--themed-note-border-5, #f9a8d4)', bottom: 'var(--themed-note-bottom-5, #f472b6)', accent: 'var(--themed-note-accent-5, #be185d)' },
  { background: 'var(--themed-note-bg-6, #ede9fe)', border: 'var(--themed-note-border-6, #c4b5fd)', bottom: 'var(--themed-note-bottom-6, #a78bfa)', accent: 'var(--themed-note-accent-6, #6d28d9)' },
  { background: 'var(--themed-note-bg-7, #ffedd5)', border: 'var(--themed-note-border-7, #fdba74)', bottom: 'var(--themed-note-bottom-7, #fb923c)', accent: 'var(--themed-note-accent-7, #c2410c)' },
  { background: 'var(--themed-note-bg-8, #ecfeff)', border: 'var(--themed-note-border-8, #67e8f9)', bottom: 'var(--themed-note-bottom-8, #22d3ee)', accent: 'var(--themed-note-accent-8, #0f766e)' },
];

export const getNotePaletteForChapter = (chapterNumber) => {
  const num = parseFloat(chapterNumber) || 1;
  const idx = (Math.floor(num) + (num % 1 !== 0 ? 3 : 0)) % NOTE_PALETTES.length;
  return NOTE_PALETTES[idx];
};


// Helper to lighten/darken colors for the Soft-UI palette
const adjustColor = (hex, amount) => {
  const clamp = (num) => Math.min(255, Math.max(0, num));
  const r = clamp(parseInt(hex.slice(1, 3), 16) + amount);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + amount);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Custom high-contrast accessibility accent color generator
const getAccessibleAccent = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  const amount = l > 110 ? -90 : -40;
  
  const clamp = (num) => Math.min(255, Math.max(0, num));
  const newR = clamp(r + amount);
  const newG = clamp(g + amount);
  const newB = clamp(b + amount);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

export const VOL_THEMES = Object.entries(VOL_COLORS).reduce((acc, [vol, color]) => {
  acc[vol] = {
    main: color,
    border: color,
    bg: `${color}15`, // Translucent background
    surface: adjustColor(color, 160), // Very light tinted surface
    accent: getAccessibleAccent(color), // Dynamic contrast-guaranteed accent for text/icons
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
  background: `var(--themed-card-bg, ${theme.surface})`,
  borderRadius: '20px',
  border: `2.5px solid ${theme.border}`,
  borderBottom: finished ? `4.5px solid ${theme.border}` : `6px solid ${theme.border}`,
  boxShadow: finished
    ? `0 4px 12px ${theme.shadow}`
    : `0 6px 18px ${theme.shadow}`,
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
  background: `var(--themed-card-bg, ${theme.surface})`,
  border: `2.5px solid ${theme.border}`,
  borderRight: `4.5px solid ${theme.border}`,
  borderBottom: `6px solid ${theme.border}`,
  boxShadow: `0 8px 24px ${theme.shadow}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
});

export const getNavButtonStyle = (theme, disabled, isMobile) => ({
  width: isMobile ? '44px' : '40px',
  height: isMobile ? '44px' : '40px',
  borderRadius: '12px',
  border: `2.5px solid ${disabled ? 'var(--themed-card-inactive-border, #e2e8f0)' : theme.border}`,
  background: disabled ? 'var(--themed-button-disabled-bg, #f8fafc)' : `var(--themed-card-bg, ${theme.surface})`,
  borderBottom: disabled ? '2.5px solid var(--themed-card-inactive-border, #cbd5e1)' : `4.5px solid ${theme.border}`,
  color: disabled ? 'var(--themed-text-muted, #94a3b8)' : 'var(--themed-badge-text, ' + theme.accent + ')',
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
  border: `2.5px solid ${isActive ? theme.border : 'var(--themed-card-inactive-border, #cbd5e1)'}`,
  background: isActive ? `var(--themed-card-bg, ${theme.surface})` : 'var(--themed-card-inactive-bg, #fff)',
  borderBottom: isActive ? `4.5px solid ${theme.border}` : '3px solid var(--themed-card-inactive-border, #94a3b8)',
  color: isActive ? 'var(--themed-badge-text, ' + theme.accent + ')' : 'var(--themed-text-muted, #64748b)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-main)',
  fontWeight: '400',
  gap: 0,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  position: 'relative',
  padding: '4px 0',
});

export const VOL_TITLE_STYLE = (theme) => ({
  fontFamily: 'Sniglet, var(--font-main)',
  fontSize: '1.75rem',
  fontWeight: '400',
  color: theme.accent,
  margin: '10px 0 4px 0',
  textShadow: `2px 2px 0 ${theme.surface}`,
});

export const EXTRA_BADGE_STYLE = (theme) => ({
  position: 'absolute',
  top: '-12px',
  right: '-12px',
  background: '#fff',
  border: `2.5px solid ${theme.border}`,
  borderRadius: '12px',
  padding: '4px 8px',
  fontSize: '0.75rem',
  fontWeight: '400',
  color: theme.accent,
  boxShadow: `0 3px 0 ${theme.border}`,
  zIndex: 10,
});
