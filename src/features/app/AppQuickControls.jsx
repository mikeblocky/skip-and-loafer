import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Accessibility, Keyboard, Languages, Settings } from 'lucide-react';

const PANEL_BASE_STYLE = {
  background: '#fffefc',
  border: '3px solid #cbd5e1',
  borderBottom: '8px solid #94a3b8',
  borderRadius: '22px',
  padding: '14px',
  boxShadow: '0 14px 34px rgba(15,23,42,0.12)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  zIndex: 2000,
};

const PANEL_TITLE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontWeight: '400',
  color: '#1e293b',
  fontSize: '1.08rem',
  letterSpacing: '0.2px',
};

const getPanelIconBoxStyle = (border, bottom, background, color) => ({
  width: '38px',
  height: '38px',
  borderRadius: '14px',
  border: `2.5px solid ${border}`,
  borderBottom: `6px solid ${bottom}`,
  background,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color,
  flexShrink: 0,
});

const getOptionCardStyle = (active = false) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  padding: '11px 12px',
  borderRadius: '16px',
  border: `2.5px solid ${active ? '#60a5fa' : '#dbe7f3'}`,
  borderBottom: `6px solid ${active ? '#3b82f6' : '#bfd2e6'}`,
  background: active ? '#f3f8ff' : '#ffffff',
  boxShadow: active ? '0 8px 16px rgba(59,130,246,0.12)' : '0 6px 12px rgba(148,163,184,0.08)',
});

const getCompactOptionCardStyle = (active = false) => ({
  ...getOptionCardStyle(active),
  padding: '8px 10px',
  borderRadius: '14px',
  gap: '8px',
});

const KEYCAP_STYLE = {
  minWidth: '52px',
  padding: '7px 9px',
  borderRadius: '12px',
  border: '2.5px solid #93c5fd',
  borderBottom: '6px solid #60a5fa',
  background: '#eff6ff',
  color: '#1d4ed8',
  textAlign: 'center',
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontWeight: '400',
  fontSize: '0.88rem',
  lineHeight: 1.1,
  flexShrink: 0,
};

const SETTINGS_ENTRY_STYLE = {
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: '10px 12px',
  borderRadius: '16px',
  cursor: 'pointer',
  color: '#334155',
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontWeight: '400',
  fontSize: '0.92rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'background-color 0.16s ease',
};

const AppQuickControls = ({
  quickControlsRef,
  readerChapter,
  isMobile,
  t,
  uiText,
  showAccessibilityPanel,
  showShortcutPanel,
  showLanguageMenu,
  showSettingsMain,
  toggleAccessibilityPanel,
  toggleShortcutPanel,
  toggleLanguagePanel,
  toggleSettingsMain,
  accessibilityPrefs,
  toggleAccessibilityPref,
  setAccessibilityColorBlindMode,
  uiLanguage,
  setUiLanguage,
  setShowLanguageMenu,
  shortcutStats,
  tabCount = 8,
}) => {
  const [activeAccessibilityGroup, setActiveAccessibilityGroup] = useState('reading');
  const colorBlindLabel = t.colorVisionMode || uiText.en.colorVisionMode || 'Color vision mode';
  const groupedLabels = {
    en: { reading: 'Reading & text', clarity: 'Clarity & contrast', visuals: 'Motion & visuals', color: 'Color mode' },
    es: { reading: 'Lectura y texto', clarity: 'Claridad y contraste', visuals: 'Movimiento y visuales', color: 'Modo de color' },
    pt: { reading: 'Leitura e texto', clarity: 'Clareza e contraste', visuals: 'Movimento e visuais', color: 'Modo de cor' },
    fr: { reading: 'Lecture et texte', clarity: 'Clarte et contraste', visuals: 'Mouvement et visuel', color: 'Mode couleur' },
    de: { reading: 'Lesen und Text', clarity: 'Klarheit und Kontrast', visuals: 'Bewegung und Visuals', color: 'Farbmodus' },
    it: { reading: 'Lettura e testo', clarity: 'Chiarezza e contrasto', visuals: 'Movimento e aspetto', color: 'Modalita colore' },
  }[uiLanguage] || { reading: 'Reading & text', clarity: 'Clarity & contrast', visuals: 'Motion & visuals', color: 'Color mode' };
  const tabRange = tabCount > 9 ? '1..9, 0' : `1..${tabCount}`;
  const shortcutTipBase = t.tip || uiText.en.tip || 'Tip: use 1..8 to jump tabs quickly.';
  const shortcutTip = tabCount > 9
    ? 'Tip: use 1..9 and 0 to jump tabs quickly.'
    : shortcutTipBase
      .replace(/1 to \d+/g, tabRange)
      .replace(/1\.\.\d+/g, tabRange);
  const colorBlindOptions = [
    { key: 'none', label: t.colorVisionOff || uiText.en.colorVisionOff || 'Off' },
    { key: 'protanopia', label: t.colorVisionProtanopia || uiText.en.colorVisionProtanopia || 'Protanopia' },
    { key: 'deuteranopia', label: t.colorVisionDeuteranopia || uiText.en.colorVisionDeuteranopia || 'Deuteranopia' },
    { key: 'tritanopia', label: t.colorVisionTritanopia || uiText.en.colorVisionTritanopia || 'Tritanopia' },
    { key: 'black-white', label: t.colorVisionBlackWhite || uiText.en.colorVisionBlackWhite || 'Black & White' },
  ];

  const shortcutRows = [
    { keyLabel: tabRange, description: t.mainTabShortcut || uiText.en.mainTabShortcut || 'Jump to a main tab' },
    { keyLabel: 'Q / E', description: t.prevNextSubtab || uiText.en.prevNextSubtab || 'Previous / next subtab' },
    { keyLabel: 'Alt+A', description: t.accessibility },
    { keyLabel: 'Alt+K', description: t.shortcuts },
    { keyLabel: 'Esc', description: t.close },
  ];

  const accessibilityOptions = [
    { key: 'reduceMotion', label: t.reduceMotion || uiText.en.reduceMotion },
    { key: 'largeText', label: t.largeText || uiText.en.largeText },
    { key: 'largeControls', label: t.largeControls || uiText.en.largeControls },
    { key: 'highContrast', label: t.highContrast || uiText.en.highContrast },
    { key: 'readableSpacing', label: t.readableSpacing || uiText.en.readableSpacing },
    { key: 'underlineLinks', label: t.underlineLinks || uiText.en.underlineLinks },
    { key: 'reduceTransparency', label: t.reduceTransparency || uiText.en.reduceTransparency },
    { key: 'simplifyVisuals', label: t.simplifyVisuals || uiText.en.simplifyVisuals },
    { key: 'dimNonEssentialColors', label: t.dimNonEssentialColors || uiText.en.dimNonEssentialColors || 'Dim non-essential colors' },
  ];
  const accessibilitySections = [
    { key: 'reading', title: groupedLabels.reading, accent: '#60a5fa', options: accessibilityOptions.filter((option) => ['largeText', 'largeControls', 'readableSpacing', 'underlineLinks'].includes(option.key)) },
    { key: 'clarity', title: groupedLabels.clarity, accent: '#34d399', options: accessibilityOptions.filter((option) => ['highContrast', 'reduceTransparency'].includes(option.key)) },
    { key: 'visuals', title: groupedLabels.visuals, accent: '#f59e0b', options: accessibilityOptions.filter((option) => ['reduceMotion', 'simplifyVisuals', 'dimNonEssentialColors'].includes(option.key)) },
    { key: 'color', title: groupedLabels.color, accent: '#8b5cf6', options: colorBlindOptions, isColorGroup: true },
  ];

  void readerChapter;

  return (
    <div
      ref={quickControlsRef}
        style={{
          position: 'fixed',
          left: '12px',
          top: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 10px)' : '12px',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
      }}
    >
      <motion.button
        onClick={toggleSettingsMain}
        aria-label={t.settings || 'Settings'}
        aria-expanded={showSettingsMain}
        whileHover={isMobile ? undefined : { y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98, y: 1 }}
        style={{
          background: 'white',
          border: '3px solid #60a5fa',
          borderBottom: '7px solid #3b82f6',
          borderRadius: '18px',
          padding: isMobile ? '8px' : '8px 14px',
          boxShadow: '0 6px 20px rgba(59, 130, 246, 0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '0' : '8px',
          color: '#1e40af',
          fontFamily: '"Sniglet", "Coming Soon", cursive',
          fontWeight: '400',
          lineHeight: 1,
          fontSize: '0.96rem',
          minWidth: isMobile ? '44px' : '0',
          transition: 'background-color 0.16s ease, transform 0.16s ease',
        }}
      >
        <Settings size={18} strokeWidth={2.5} />
        {!isMobile && (t.settings || 'Settings')}
      </motion.button>

      <AnimatePresence>
        {showSettingsMain && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{
              background: 'white',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #94a3b8',
              borderRadius: '24px',
              padding: '10px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              minWidth: '166px',
              zIndex: 2000,
            }}
          >
            <button
              onClick={toggleLanguagePanel}
              style={SETTINGS_ENTRY_STYLE}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Languages size={18} strokeWidth={2.5} color="#64748b" /> {t.language}
            </button>
            <button
              onClick={toggleAccessibilityPanel}
              style={SETTINGS_ENTRY_STYLE}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Accessibility size={18} strokeWidth={2.5} color="#64748b" /> {t.accessibility}
            </button>
            {!isMobile && (
              <button
                onClick={toggleShortcutPanel}
                style={SETTINGS_ENTRY_STYLE}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Keyboard size={18} strokeWidth={2.5} color="#64748b" /> {t.shortcuts}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAccessibilityPanel && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            role="dialog"
            aria-label={t.accessibilityOptions}
            style={{
              ...PANEL_BASE_STYLE,
              minWidth: isMobile ? '244px' : '296px',
              gap: '8px',
              padding: '12px',
            }}
          >
            <div style={PANEL_TITLE_STYLE}>
              <div style={getPanelIconBoxStyle('#a7f3d0', '#34d399', '#ecfdf5', '#059669')}>
                <Accessibility size={18} strokeWidth={2.4} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>{t.accessibility}</span>
                <span style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.25 }}>
                  {t.accessibilityOptions}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              {accessibilitySections.map((section) => {
                const isSelected = activeAccessibilityGroup === section.key;
                return (
                  <div key={section.key} style={{ display: 'grid', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveAccessibilityGroup(section.key)}
                      style={{
                        ...getCompactOptionCardStyle(isSelected),
                        width: '100%',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isSelected ? `${section.accent}15` : '#ffffff',
                        borderColor: isSelected ? section.accent : '#dbe7f3',
                        borderBottomColor: isSelected ? section.accent : '#bfd2e6',
                        color: '#1e293b',
                      }}
                    >
                      <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.88rem', color: isSelected ? section.accent : '#334155', lineHeight: 1.1 }}>
                        {section.title}
                      </span>
                      <span
                        style={{
                          minWidth: '28px',
                          height: '28px',
                          borderRadius: '10px',
                          border: `2px solid ${isSelected ? section.accent : '#cbd5e1'}`,
                          borderBottom: `4px solid ${isSelected ? section.accent : '#cbd5e1'}`,
                          background: isSelected ? '#ffffff' : '#f8fafc',
                          color: isSelected ? section.accent : '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: '"Sniglet", "Coming Soon", cursive',
                          fontSize: '0.74rem',
                          lineHeight: 1,
                        }}
                      >
                        {section.isColorGroup ? colorBlindOptions.length : section.options.length}
                      </span>
                    </button>

                    {isSelected && !section.isColorGroup && (
                      <div
                        style={{
                          ...getCompactOptionCardStyle(false),
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: '6px',
                          padding: '10px',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: '"Sniglet", "Coming Soon", cursive',
                            color: section.accent,
                            fontSize: '0.88rem',
                            lineHeight: 1.1,
                            fontWeight: '400',
                          }}
                        >
                          {section.title}
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: '6px',
                          }}
                        >
                          {section.options.map((option) => (
                            <label
                              key={option.key}
                              style={{
                                ...getCompactOptionCardStyle(!!accessibilityPrefs[option.key]),
                                fontFamily: '"Sniglet", "Coming Soon", cursive',
                                color: '#334155',
                                fontWeight: '400',
                                fontSize: '0.77rem',
                                cursor: 'pointer',
                                padding: '8px 9px',
                              }}
                            >
                              <span style={{ flex: 1, lineHeight: 1.18 }}>{option.label}</span>
                              <input
                                type="checkbox"
                                checked={!!accessibilityPrefs[option.key]}
                                onChange={() => toggleAccessibilityPref(option.key)}
                                aria-label={option.label}
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  accentColor: '#3b82f6',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {isSelected && section.isColorGroup && (
                      <div
                        style={{
                          ...getCompactOptionCardStyle(false),
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#334155', fontWeight: '400', fontSize: '0.82rem' }}>
                          {colorBlindLabel}
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px' }}>
                          {colorBlindOptions.map((option) => {
                            const selected = (accessibilityPrefs.colorBlindMode || 'none') === option.key;
                            return (
                              <button
                                key={option.key}
                                type="button"
                                onClick={() => setAccessibilityColorBlindMode(option.key)}
                                style={{
                                  border: selected ? '2.5px solid #8b5cf6' : '2.5px solid #d1d5db',
                                  borderBottom: selected ? '5px solid #7c3aed' : '5px solid #cbd5e1',
                                  background: selected ? '#f5f3ff' : '#fff',
                                  color: selected ? '#6d28d9' : '#374151',
                                  borderRadius: '12px',
                                  padding: '6px 8px',
                                  fontFamily: '"Sniglet", "Coming Soon", cursive',
                                  fontWeight: '400',
                                  fontSize: '0.74rem',
                                  lineHeight: 1.1,
                                  cursor: 'pointer',
                                }}
                                aria-pressed={selected}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                ...getCompactOptionCardStyle(false),
                color: '#64748b',
                fontFamily: '"Sniglet", "Coming Soon", cursive',
                fontSize: '0.72rem',
                lineHeight: 1.28,
              }}
            >
              {shortcutTip}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLanguageMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            role="listbox"
            aria-label={t.language}
            style={{
              background: '#fff',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #94a3b8',
              borderRadius: '24px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              padding: '10px',
              minWidth: isMobile ? '244px' : '264px',
              display: 'grid',
              gap: '8px',
              zIndex: 2000,
            }}
          >
            {Object.keys(uiText).map((lang) => {
              const selected = lang === uiLanguage;
              return (
                <button
                  key={lang}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setUiLanguage(lang);
                    setShowLanguageMenu(false);
                  }}
                  style={{
                    ...getCompactOptionCardStyle(selected),
                    textAlign: 'left',
                    width: '100%',
                    background: selected ? '#eef6ff' : '#fff',
                    borderColor: selected ? '#60a5fa' : '#dbe7f3',
                    borderBottomColor: selected ? '#3b82f6' : '#cbd5e1',
                    color: selected ? '#1e40af' : '#334155',
                    padding: '10px 12px',
                    fontFamily: '"Sniglet", "Coming Soon", cursive',
                    fontWeight: '400',
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    boxShadow: selected ? '0 8px 14px rgba(59,130,246,0.12)' : '0 4px 8px rgba(148,163,184,0.08)',
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto',
                        alignItems: 'center',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = '#f8fbff'; }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = '#fff'; }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '32px', borderRadius: '10px', border: `2px solid ${selected ? '#93c5fd' : '#dbe7f3'}`, borderBottom: `4px solid ${selected ? '#60a5fa' : '#cbd5e1'}`, background: selected ? '#ffffff' : '#f8fafc', color: selected ? '#2563eb' : '#64748b', fontSize: '0.72rem', lineHeight: 1, textTransform: 'uppercase' }}>{lang}</span>
                  <span style={{ display: 'block', lineHeight: 1.1, flex: 1 }}>{uiText[lang].languageName}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '30px', height: '30px', borderRadius: '10px', border: `2px solid ${selected ? '#93c5fd' : '#dbe7f3'}`, borderBottom: `4px solid ${selected ? '#60a5fa' : '#cbd5e1'}`, background: selected ? '#ffffff' : '#f8fafc', color: selected ? '#2563eb' : '#94a3b8', flexShrink: 0, fontSize: '0.86rem', lineHeight: 1 }}>{selected ? '✓' : ''}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShortcutPanel && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            role="dialog"
            aria-label={t.keyboardHelp}
            style={{
              ...PANEL_BASE_STYLE,
              minWidth: isMobile ? '246px' : '270px',
            }}
          >
            <div style={PANEL_TITLE_STYLE}>
              <div style={getPanelIconBoxStyle('#c4b5fd', '#8b5cf6', '#f5f3ff', '#7c3aed')}>
                <Keyboard size={18} strokeWidth={2.4} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>{t.shortcuts}</span>
                <span style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.25 }}>
                  {t.keyboardHelp}
                </span>
              </div>
            </div>

            <div style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#4b5563', fontSize: '0.92rem', lineHeight: 1.4, fontWeight: '400' }}>
              {t.shortcutsIntro}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {shortcutRows.map((row) => (
                <div key={row.keyLabel} style={{ ...getOptionCardStyle(false), alignItems: 'center' }}>
                  <div style={KEYCAP_STYLE}>{row.keyLabel}</div>
                  <div style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#334155', fontSize: '0.92rem', lineHeight: 1.35 }}>
                    {row.description}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                ...getOptionCardStyle(false),
                justifyContent: 'center',
                color: '#64748b',
                fontFamily: '"Sniglet", "Coming Soon", cursive',
                fontSize: '0.8rem',
                textAlign: 'center',
              }}
            >
              {t.usage}{shortcutStats.usageCount}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppQuickControls;
