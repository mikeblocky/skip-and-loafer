export const getPageRootStyle = (isMobile) => ({
  width: '100%',
  padding: isMobile ? '24px 10px 100px 10px' : '28px 40px',
  minHeight: isMobile ? 'auto' : '600px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'visible',
  flex: 1,
});

export const getHeaderRowStyle = (isMobile) => ({
  display: 'flex',
  alignItems: isMobile ? 'flex-start' : 'center',
  justifyContent: 'space-between',
  marginBottom: isMobile ? '16px' : '24px',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '12px' : '16px',
  padding: '0 8px',
});

export const getHeaderTitleWrapStyle = (isMobile) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: '#fff',
  border: '3px solid #f97316',
  borderBottom: '6px solid #ea580c',
  borderRadius: '20px',
  padding: '8px 20px',
  boxShadow: '0 4px 12px rgba(249,115,22,0.1)',
});

export const getHeaderTitleStyle = (isMobile) => ({
  fontFamily: 'var(--font-main)',
  color: '#c2410c',
  fontSize: isMobile ? '1.3rem' : '1.4rem',
  fontWeight: '900',
  letterSpacing: '0.5px',
});

export const getSortButtonStyle = (isMobile) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '3px solid #fbbf24',
    borderBottom: '9px solid #f59e0b',
    background: '#fff7d6',
    borderRadius: '24px',
    color: '#b45309',
    fontFamily: 'Sniglet, var(--font-main)',
    fontWeight: '400',
    fontSize: isMobile ? '1.04rem' : '1.12rem',
    lineHeight: 1,
    padding: isMobile ? '14px 16px' : '16px 18px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: '0 14px 24px rgba(245, 158, 11, 0.18)',
  });

export const getReaderControlButtonStyle = ({ active, isMobile }) => ({
  border: `2.5px solid ${active ? '#60a5fa' : '#cbd5e1'}`,
  borderBottom: `${active ? (isMobile ? '6px' : '7px') : (isMobile ? '4px' : '5px')} solid ${active ? '#2563eb' : '#94a3b8'}`,
  background: active ? '#eff6ff' : '#ffffff',
  color: active ? '#1d4ed8' : '#475569',
  borderRadius: isMobile ? '16px' : '18px',
  padding: isMobile ? '8px' : '10px 14px',
  fontFamily: 'Sniglet, var(--font-main)',
  fontSize: isMobile ? '0.78rem' : '0.9rem',
  fontWeight: '400',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: isMobile ? '6px' : '7px',
  minWidth: isMobile ? '40px' : 'auto',
  minHeight: isMobile ? '40px' : 'auto',
  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  transform: active ? 'translateY(2px)' : 'none',
});

export const getReaderControlsContainerStyle = ({ floating, isMobile, showFloatingControls }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: isMobile ? '6px' : '12px',
  flexWrap: 'nowrap',
  marginBottom: floating ? 0 : (isMobile ? '20px' : '24px'),
  padding: isMobile ? '8px 10px' : '14px',
  borderRadius: isMobile ? '22px' : '28px',
  background: 'rgba(255, 255, 255, 0.94)',
  backdropFilter: 'blur(14px) saturate(1.4)',
  border: '3px solid #dbeafe',
  borderBottom: isMobile ? '6px solid #93c5fd' : '8px solid #93c5fd',
  position: floating ? 'fixed' : 'relative',
  left: floating ? (isMobile ? 'calc(50% + 14px)' : '50%') : 'auto',
  top: floating && isMobile ? 'max(calc(env(safe-area-inset-top) + 8px), 8px)' : 'auto',
  bottom: floating ? (isMobile ? 'auto' : '24px') : 'auto',
  transform: floating
    ? `translateX(-50%) translateY(${showFloatingControls ? '0px' : (isMobile ? '-18px' : '40px')}) scale(${showFloatingControls ? '1' : '0.96'})`
    : 'none',
  width: isMobile ? 'fit-content' : (floating ? 'fit-content' : '100%'),
  maxWidth: floating ? (isMobile ? 'calc(100% - 84px)' : 'calc(100% - 24px)') : (isMobile ? '100%' : 'none'),
  boxShadow: floating ? (isMobile ? '0 10px 24px rgba(15, 23, 42, 0.12)' : '0 14px 36px rgba(15, 23, 42, 0.16)') : '0 12px 24px rgba(96, 165, 250, 0.08)',
  zIndex: 2100,
  justifyContent: isMobile ? 'center' : (floating ? 'center' : 'space-between'),
  overflowX: isMobile ? 'auto' : 'visible',
  overflowY: 'hidden',
  opacity: floating ? (showFloatingControls ? 1 : 0) : 1,
  pointerEvents: floating ? (showFloatingControls ? 'auto' : 'none') : 'auto',
  transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease, box-shadow 0.24s ease',
  marginInline: isMobile ? 'auto' : undefined,
});

export const READER_CONTROLS_LABEL_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: 'Sniglet, var(--font-main)',
  fontSize: '0.95rem',
  color: '#1d4ed8',
  fontWeight: '400',
  background: '#ffffff',
  border: '2.5px solid #bfdbfe',
  borderBottom: '60a5fa',
  borderRadius: '999px',
  padding: '8px 12px',
};

export const getControlsSeparatorStyle = (isMobile) => ({
  width: isMobile ? '2px' : '2px',
  height: isMobile ? '22px' : '26px',
  background: '#dbeafe',
  margin: isMobile ? '0 1px' : '0 4px',
  borderRadius: '999px',
});

export const getScrollablePaneStyle = (isMobile) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  overflowY: 'visible',
  overflowX: 'hidden',
  padding: isMobile ? '10px 12px 40px 12px' : '15px 12px 30px 12px',
});

export const EMPTY_BLOGS_STYLE = {
  textAlign: 'center',
  padding: '60px 0',
  background: '#f8fafc',
  borderRadius: '24px',
  border: '3px dashed #cbd5e1',
  color: '#94a3b8',
  fontFamily: 'var(--font-main)',
  fontWeight: '900',
};

export const getBlogCardStyle = (note, isMobile) => ({
  border: `3px solid ${note.border}`,
  borderBottom: `8px solid ${note.border}`,
  background: note.bg,
  borderRadius: '24px',
  padding: isMobile ? '20px 18px' : '24px 28px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: isMobile ? '16px' : '24px',
  position: 'relative',
  margin: isMobile ? '0 4px 24px 4px' : '0 8px 28px 8px',
  overflow: 'visible',
});

export const BLOG_CARD_TITLE_STYLE = {
  fontFamily: 'var(--font-main)',
  color: '#1e293b',
  fontWeight: 900,
  lineHeight: 1.25,
};

export const getBlogMetaStyle = (note, isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: note.accent,
  fontFamily: 'var(--font-main)',
  fontSize: isMobile ? '0.75rem' : '0.8rem',
  fontWeight: '900',
  lineHeight: 1.2,
  flexWrap: 'wrap',
  background: '#fff',
  padding: '4px 10px',
  borderRadius: '10px',
  border: `2px solid ${note.border}`,
  marginTop: '4px',
});

export const BLOG_META_DOT_STYLE = { color: '#cbd5e1', margin: '0 2px' };

export const getReadPostButtonStyle = (note, isMobile) => ({
  border: `2.5px solid ${note.border}`,
  borderBottom: `6px solid ${note.border}`,
  background: '#fff',
  borderRadius: '16px',
  color: note.accent,
  fontFamily: 'var(--font-main)',
  fontWeight: '900',
  fontSize: isMobile ? '0.8rem' : '0.9rem',
  padding: isMobile ? '10px 16px' : '12px 20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

export const getBackToListButtonStyle = (isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '3px solid #bfdbfe',
  borderBottom: '7px solid #60a5fa',
  background: '#fff',
  borderRadius: '18px',
  color: '#1d4ed8',
  fontFamily: 'Sniglet, var(--font-main)',
  fontWeight: '400',
  fontSize: isMobile ? '0.92rem' : '1rem',
  padding: '10px 18px',
  cursor: 'pointer',
});

export const getDetailMetaStyle = (isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: '#64748b',
  fontFamily: 'var(--font-main)',
  fontWeight: '800',
  fontSize: isMobile ? '0.78rem' : '0.84rem',
  flexWrap: 'wrap',
});

export const getReaderPanelStyle = (readerTheme, isMobile) => ({
  border: `3px solid ${readerTheme.panelBorder}`,
  borderBottom: `10px solid ${readerTheme.panelBorder}`,
  background: readerTheme.panelBg,
  borderRadius: '28px',
  padding: isMobile ? '18px' : '28px',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  overflow: 'visible',
  flex: 1,
  minHeight: 0,
  boxShadow: '0 16px 28px rgba(15, 23, 42, 0.08)',
  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
});

export const getReaderHeadingStyle = (readerTheme, headingFontScale, isMobile) => ({
  margin: 0,
  color: readerTheme.heading,
  fontFamily: 'Sniglet, var(--font-main)',
  fontWeight: 400,
  fontSize: isMobile ? `${1.56 * headingFontScale}rem` : `${1.94 * headingFontScale}rem`,
  lineHeight: 1.12,
  letterSpacing: '0.012em',
  transition: 'font-size 0.3s ease, color 0.3s ease',
});

export const getReaderDescriptionStyle = (readerTheme, bodyFontScale, paragraphLineHeight, isMobile) => ({
  margin: 0,
  color: readerTheme.subtle,
  fontFamily: 'Sniglet, var(--font-main)',
  fontWeight: 400,
  fontSize: isMobile ? `${1.02 * bodyFontScale}rem` : `${1.08 * bodyFontScale}rem`,
  lineHeight: paragraphLineHeight + 0.04,
  letterSpacing: '0.01em',
  opacity: 0.92,
  transition: 'font-size 0.3s ease, line-height 0.3s ease, color 0.3s ease',
});

export const getReaderScrollStyle = (readerTheme) => ({
  overflowY: 'visible',
  flex: 1,
  minHeight: 0,
  borderTop: `3px solid ${readerTheme.divider}`,
  paddingTop: '22px',
  scrollBehavior: 'smooth',
});

export const getReaderContentWrapStyle = (focusWidth) => ({
  maxWidth: focusWidth ? '860px' : '100%',
  margin: '0 auto',
  paddingBottom: '6px',
  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
});

export const getLoadMoreStyle = (isMobile, readerTheme) => ({
  width: '100%',
  padding: isMobile ? '14px 0 24px 0' : '20px 0 40px 0',
  textAlign: 'center',
  color: readerTheme.subtle,
  fontFamily: 'Sniglet, var(--font-main)',
  fontWeight: '400',
  fontSize: isMobile ? '0.92rem' : '1rem',
  letterSpacing: '0.01em',
  opacity: 0.6,
});

export const PROGRESS_TRACK_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '8px',
  background: 'rgba(226,232,240,0.4)',
  zIndex: 2120,
  pointerEvents: 'none',
};

export const PROGRESS_FILL_STYLE = {
  height: '100%',
  width: '100%',
  transformOrigin: '0% 50%',
  background: '#3b82f6',
  borderRadius: '0 4px 4px 0',
  boxShadow: '0 0 10px rgba(59,130,246,0.3)',
};

const getFloatingActionBaseStyle = (isMobile) => ({
  position: 'fixed',
  right: isMobile ? '16px' : '28px',
  zIndex: 2110,
  border: '3px solid #cbd5e1',
  borderBottom: '7px solid #94a3b8',
  background: '#fff',
  color: '#334151',
  borderRadius: '20px',
  padding: isMobile ? '14px' : '14px 22px',
  fontFamily: 'var(--font-main)',
  fontWeight: '900',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: isMobile ? '0' : '10px',
  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
});

export const getBackFabStyle = (isMobile, showFloatingControls) => ({
  ...getFloatingActionBaseStyle(isMobile),
  bottom: showFloatingControls ? (isMobile ? '178px' : '190px') : (isMobile ? '106px' : '118px'),
  fontSize: isMobile ? '0.94rem' : '1rem',
});

export const getTopFabStyle = (isMobile, showFloatingControls) => ({
  ...getFloatingActionBaseStyle(isMobile),
  bottom: showFloatingControls ? (isMobile ? '108px' : '120px') : (isMobile ? '38px' : '48px'),
  fontSize: isMobile ? '0.98rem' : '1.05rem',
});
