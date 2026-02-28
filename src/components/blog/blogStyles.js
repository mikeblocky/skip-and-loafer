export const getPageRootStyle = (isMobile) => ({
  width: '100%',
  padding: isMobile ? '24px 8px 10px 8px' : '28px 40px',
  minHeight: isMobile ? 'auto' : '600px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'visible',
  flex: 1,
});

export const getHeaderRowStyle = (isMobile) => ({
  display: 'flex',
  alignItems: isMobile ? 'center' : 'flex-end',
  justifyContent: 'space-between',
  marginBottom: isMobile ? '16px' : '24px',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '8px' : '16px',
});

export const getHeaderTitleWrapStyle = (isMobile) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: isMobile ? '6px' : '0',
});

export const getHeaderTitleStyle = (isMobile) => ({
  fontFamily: 'Sniglet, var(--font-main)',
  color: '#6b7280',
  fontSize: isMobile ? '1.5rem' : '1.3rem',
  fontWeight: 'normal',
});

export const getSortButtonStyle = (isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #d1d5db',
  background: '#fff',
  borderRadius: '9999px',
  color: '#4b5563',
  fontFamily: 'var(--font-hand)',
  fontWeight: 'bold',
  fontSize: isMobile ? '0.72rem' : '0.8rem',
  padding: isMobile ? '6px 10px' : '7px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export const getReaderControlButtonStyle = ({ active, isMobile }) => ({
  border: `1.5px solid ${active ? '#2563eb' : '#d1d5db'}`,
  background: active ? '#eff6ff' : '#fff',
  color: active ? '#1d4ed8' : '#4b5563',
  borderRadius: '9999px',
  padding: isMobile ? '10px' : '6px 11px',
  fontFamily: 'var(--font-hand)',
  fontSize: isMobile ? '0.72rem' : '0.8rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  minWidth: isMobile ? '42px' : 'auto',
  minHeight: isMobile ? '42px' : 'auto',
  transition: 'background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.2s ease',
});

export const getReaderControlsContainerStyle = ({ floating, isMobile, showFloatingControls }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: isMobile ? '6px' : '8px',
  flexWrap: 'wrap',
  marginBottom: floating ? 0 : (isMobile ? '12px' : '16px'),
  padding: isMobile ? '6px 8px' : '10px',
  borderRadius: '10px',
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  position: floating ? 'fixed' : 'relative',
  left: floating ? '50%' : 'auto',
  bottom: floating ? (isMobile ? '14px' : '20px') : 'auto',
  transform: floating
    ? `translateX(-50%) translateY(${showFloatingControls ? '0px' : '10px'})`
    : 'none',
  width: floating ? (isMobile ? 'calc(100% - 20px)' : 'fit-content') : '100%',
  maxWidth: floating ? 'min(1080px, calc(100% - 24px))' : 'none',
  boxShadow: floating ? '0 8px 18px rgba(0,0,0,0.18)' : 'none',
  zIndex: floating ? 2100 : 'auto',
  justifyContent: isMobile ? 'center' : 'flex-start',
  opacity: floating ? (showFloatingControls ? 1 : 0) : 1,
  pointerEvents: floating ? (showFloatingControls ? 'auto' : 'none') : 'auto',
  willChange: floating ? 'transform, opacity' : 'auto',
  transition: floating
    ? 'opacity 0.22s ease, transform 0.22s ease, background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
    : 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
});

export const READER_CONTROLS_LABEL_STYLE = {
  fontFamily: 'var(--font-hand)',
  fontSize: '0.82rem',
  color: '#6b7280',
  fontWeight: 'bold',
};

export const getControlsSeparatorStyle = (isMobile) => ({
  width: '1px',
  height: isMobile ? '24px' : '18px',
  background: '#d1d5db',
  margin: '0 2px',
});

export const getScrollablePaneStyle = (isMobile) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  overflowY: isMobile ? 'visible' : 'auto',
  maxHeight: isMobile ? 'none' : 'min(550px, calc(100vh - 280px))',
  padding: '4px',
});

export const EMPTY_BLOGS_STYLE = {
  textAlign: 'center',
  padding: '40px 0',
  background: '#fafafa',
  borderRadius: '12px',
  border: '1px dashed #e5e7eb',
  color: '#9ca3af',
  fontFamily: 'var(--font-hand)',
};

export const getBlogCardStyle = (note, isMobile) => ({
  border: `2px solid ${note.border}`,
  background: note.bg,
  borderRadius: '9px',
  padding: isMobile ? '10px 11px' : '11px 13px',
  boxShadow: isMobile ? '0 2px 6px rgba(0,0,0,0.06)' : '0 4px 10px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: isMobile ? '8px' : '12px',
});

export const BLOG_CARD_TITLE_STYLE = {
  fontFamily: 'var(--font-main)',
  color: '#374151',
  fontWeight: 700,
  lineHeight: 1.3,
};

export const getBlogMetaStyle = (note, isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: note.accent,
  fontFamily: 'var(--font-hand)',
  fontSize: isMobile ? '0.72rem' : '0.78rem',
  fontWeight: 'bold',
  lineHeight: 1.2,
  flexWrap: 'wrap',
});

export const BLOG_META_DOT_STYLE = { color: '#9ca3af', margin: '0 2px' };

export const getReadPostButtonStyle = (note, isMobile) => ({
  border: `2px solid ${note.border}`,
  background: '#fff',
  borderRadius: '9999px',
  color: note.accent,
  fontFamily: 'var(--font-hand)',
  fontWeight: 'bold',
  fontSize: isMobile ? '0.72rem' : '0.8rem',
  padding: isMobile ? '6px 10px' : '7px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

export const getBackToListButtonStyle = (isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  border: '2px solid #d1d5db',
  background: '#fff',
  borderRadius: '9999px',
  color: '#4b5563',
  fontFamily: 'var(--font-hand)',
  fontWeight: 'bold',
  fontSize: isMobile ? '0.75rem' : '0.82rem',
  padding: '6px 11px',
  cursor: 'pointer',
});

export const getDetailMetaStyle = (isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  color: '#9ca3af',
  fontFamily: 'var(--font-hand)',
  fontSize: isMobile ? '0.72rem' : '0.8rem',
  flexWrap: 'wrap',
});

export const getReaderPanelStyle = (readerTheme, isMobile) => ({
  border: `2px solid ${readerTheme.panelBorder}`,
  background: readerTheme.panelBg,
  borderRadius: '12px',
  padding: isMobile ? '12px' : '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  overflow: 'hidden',
  flex: 1,
  minHeight: 0,
  transition: 'background 0.35s ease, border-color 0.35s ease',
});

export const getReaderHeadingStyle = (readerTheme, headingFontScale, isMobile) => ({
  margin: 0,
  color: readerTheme.heading,
  fontFamily: 'var(--font-main)',
  fontWeight: 700,
  fontSize: isMobile ? `${1 * headingFontScale}rem` : `${1.1 * headingFontScale}rem`,
  transition: 'font-size 0.3s ease, color 0.3s ease',
});

export const getReaderDescriptionStyle = (readerTheme, bodyFontScale, paragraphLineHeight, isMobile) => ({
  margin: 0,
  color: readerTheme.subtle,
  fontFamily: 'var(--font-hand)',
  fontSize: isMobile ? `${0.76 * bodyFontScale}rem` : `${0.84 * bodyFontScale}rem`,
  lineHeight: paragraphLineHeight,
  transition: 'font-size 0.3s ease, line-height 0.3s ease, color 0.3s ease',
});

export const getReaderScrollStyle = (readerTheme) => ({
  overflowY: 'auto',
  flex: 1,
  minHeight: 0,
  borderTop: `1px solid ${readerTheme.divider}`,
  paddingTop: '10px',
  scrollBehavior: 'smooth',
});

export const getReaderContentWrapStyle = (focusWidth) => ({
  maxWidth: focusWidth ? '860px' : '100%',
  margin: '0 auto',
  transition: 'max-width 0.35s ease, font-size 0.3s ease',
});

export const getLoadMoreStyle = (isMobile, readerTheme) => ({
  width: '100%',
  padding: isMobile ? '10px 0 18px 0' : '14px 0 22px 0',
  textAlign: 'center',
  color: readerTheme.subtle,
  fontFamily: 'var(--font-hand)',
  fontSize: isMobile ? '0.78rem' : '0.84rem',
});

export const PROGRESS_TRACK_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '4px',
  background: 'rgba(229,231,235,0.5)',
  zIndex: 2120,
  pointerEvents: 'none',
};

export const PROGRESS_FILL_STYLE = {
  height: '100%',
  width: '100%',
  transformOrigin: '0% 50%',
  background: '#3b82f6',
  borderRadius: '0 2px 2px 0',
};

const getFloatingActionBaseStyle = (isMobile) => ({
  position: 'fixed',
  right: isMobile ? '14px' : '28px',
  zIndex: 2110,
  border: '2px solid #d1d5db',
  background: '#fff',
  color: '#374151',
  borderRadius: '9999px',
  padding: isMobile ? '14px 18px' : '14px 20px',
  fontFamily: 'var(--font-hand)',
  fontWeight: 'bold',
  boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
});

export const getBackFabStyle = (isMobile, showFloatingControls) => ({
  ...getFloatingActionBaseStyle(isMobile),
  bottom: showFloatingControls ? (isMobile ? '156px' : '168px') : (isMobile ? '92px' : '102px'),
  fontSize: isMobile ? '0.94rem' : '1rem',
});

export const getTopFabStyle = (isMobile, showFloatingControls) => ({
  ...getFloatingActionBaseStyle(isMobile),
  bottom: showFloatingControls ? (isMobile ? '98px' : '108px') : (isMobile ? '34px' : '42px'),
  fontSize: isMobile ? '0.98rem' : '1.05rem',
});
