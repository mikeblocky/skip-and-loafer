import { AnimatePresence, motion } from 'framer-motion';
import { Accessibility, Keyboard, Languages } from 'lucide-react';

const AppQuickControls = ({
  quickControlsRef,
  readerChapter,
  isMobile,
  t,
  uiText,
  showAccessibilityPanel,
  showShortcutPanel,
  showLanguageMenu,
  toggleAccessibilityPanel,
  toggleShortcutPanel,
  toggleLanguagePanel,
  accessibilityPrefs,
  toggleAccessibilityPref,
  setAccessibilityColorBlindMode,
  uiLanguage,
  setUiLanguage,
  setShowLanguageMenu,
  shortcutStats,
}) => {
  const colorBlindLabel = t.colorVisionMode || uiText.en.colorVisionMode || 'Color vision mode';
  const colorBlindOptions = [
    { key: 'none', label: t.colorVisionOff || uiText.en.colorVisionOff || 'Off' },
    { key: 'protanopia', label: t.colorVisionProtanopia || uiText.en.colorVisionProtanopia || 'Protanopia' },
    { key: 'deuteranopia', label: t.colorVisionDeuteranopia || uiText.en.colorVisionDeuteranopia || 'Deuteranopia' },
    { key: 'tritanopia', label: t.colorVisionTritanopia || uiText.en.colorVisionTritanopia || 'Tritanopia' },
    { key: 'black-white', label: t.colorVisionBlackWhite || uiText.en.colorVisionBlackWhite || 'Black & White' },
  ];

  return (
    <div ref={quickControlsRef} style={{ position: 'fixed', left: '10px', top: '10px', zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
      <button
        onClick={toggleAccessibilityPanel}
        aria-label={t.accessibilityOptions}
        aria-expanded={showAccessibilityPanel}
        style={{
          background: 'white',
          border: '2px solid var(--line-blue)',
          borderRadius: '9999px',
          padding: '8px 12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#374151',
          fontFamily: 'var(--font-hand)',
          fontWeight: 'bold',
          fontSize: '0.9rem',
        }}
      >
        <Accessibility size={16} />
        {t.accessibility}
      </button>

      {!isMobile && (
        <button
          onClick={toggleShortcutPanel}
          aria-label={t.keyboardHelp}
          aria-expanded={showShortcutPanel}
          style={{
            background: 'white',
            border: '2px solid var(--line-blue)',
            borderRadius: '9999px',
            padding: '8px 12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#374151',
            fontFamily: 'var(--font-hand)',
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}
        >
          <Keyboard size={16} />
          {t.shortcuts}
        </button>
      )}

      <button
        onClick={toggleLanguagePanel}
        aria-label={t.language}
        aria-expanded={showLanguageMenu}
        style={{
          background: 'white',
          border: '2px solid var(--line-blue)',
          borderRadius: '9999px',
          padding: '8px 12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#374151',
          fontFamily: 'var(--font-hand)',
          fontWeight: 'bold',
          fontSize: '0.9rem',
        }}
      >
        <Languages size={16} />
        {t.language}
      </button>

      <AnimatePresence>
        {showAccessibilityPanel && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-label={t.accessibilityOptions}
            style={{
              background: 'white',
              border: '2px solid var(--line-blue)',
              borderRadius: '12px',
              padding: '10px',
              boxShadow: '0 8px 18px rgba(0,0,0,0.16)',
              minWidth: isMobile ? '220px' : '250px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {[
              { key: 'reduceMotion', label: t.reduceMotion || uiText.en.reduceMotion },
              { key: 'largeText', label: t.largeText || uiText.en.largeText },
              { key: 'largeControls', label: t.largeControls || uiText.en.largeControls },
              { key: 'highContrast', label: t.highContrast || uiText.en.highContrast },
              { key: 'readableSpacing', label: t.readableSpacing || uiText.en.readableSpacing },
              { key: 'underlineLinks', label: t.underlineLinks || uiText.en.underlineLinks },
              { key: 'reduceTransparency', label: t.reduceTransparency || uiText.en.reduceTransparency },
              { key: 'simplifyVisuals', label: t.simplifyVisuals || uiText.en.simplifyVisuals },
              { key: 'dimNonEssentialColors', label: t.dimNonEssentialColors || uiText.en.dimNonEssentialColors || 'Dim non-essential colors' },
            ].map((option) => (
              <label
                key={option.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  fontFamily: 'var(--font-hand)',
                  color: '#374151',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                }}
              >
                <span>{option.label}</span>
                <input
                  type="checkbox"
                  checked={!!accessibilityPrefs[option.key]}
                  onChange={() => toggleAccessibilityPref(option.key)}
                  aria-label={option.label}
                />
              </label>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '2px' }}>
              <span style={{ fontFamily: 'var(--font-hand)', color: '#374151', fontWeight: 'bold', fontSize: '0.88rem' }}>
                {colorBlindLabel}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {colorBlindOptions.map((option) => {
                  const selected = (accessibilityPrefs.colorBlindMode || 'none') === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setAccessibilityColorBlindMode(option.key)}
                      style={{
                        border: selected ? '1.5px solid var(--line-blue)' : '1.5px solid #d1d5db',
                        background: selected ? '#eef6ff' : '#fff',
                        color: '#374151',
                        borderRadius: '9999px',
                        padding: '4px 10px',
                        fontFamily: 'var(--font-hand)',
                        fontWeight: selected ? 'bold' : 'normal',
                        fontSize: '0.8rem',
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

            <div style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontSize: '0.75rem', lineHeight: 1.3 }}>
              {t.tip}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLanguageMenu && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="listbox"
            aria-label={t.language}
            style={{
              background: '#fff',
              border: '2px solid var(--line-blue)',
              borderRadius: '12px',
              boxShadow: '0 8px 18px rgba(0,0,0,0.16)',
              padding: '8px',
              minWidth: isMobile ? '220px' : '250px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
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
                    textAlign: 'left',
                    border: selected ? '1.5px solid var(--line-blue)' : '1.5px solid transparent',
                    borderRadius: '8px',
                    background: selected ? '#eef6ff' : '#fff',
                    color: '#374151',
                    padding: '6px 8px',
                    fontFamily: 'var(--font-hand)',
                    fontWeight: selected ? 'bold' : 'normal',
                    cursor: 'pointer',
                  }}
                >
                  {uiText[lang].languageName}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShortcutPanel && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-label={t.keyboardHelp}
            style={{
              background: 'white',
              border: '2px solid var(--line-blue)',
              borderRadius: '12px',
              padding: '10px',
              boxShadow: '0 8px 18px rgba(0,0,0,0.16)',
              minWidth: isMobile ? '220px' : '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-main)', color: '#374151', fontSize: '1rem' }}>{t.shortcuts}</div>
            <div style={{ fontFamily: 'var(--font-hand)', color: '#4b5563', fontSize: '0.88rem', lineHeight: 1.3 }}>
              {t.shortcutsIntro}
            </div>
            <div style={{ fontFamily: 'var(--font-hand)', color: '#374151', fontSize: '0.86rem', lineHeight: 1.4 }}>
              <div><strong>1..7</strong> — {t.mainTabShortcut || uiText.en.mainTabShortcut || 'Jump to a main tab'}</div>
              <div><strong>Q / E</strong> — {t.prevNextSubtab || uiText.en.prevNextSubtab || 'Previous / next subtab'}</div>
              <div><strong>Alt+A</strong> — {t.accessibility}</div>
              <div><strong>Alt+K</strong> — {t.shortcuts}</div>
              <div><strong>Esc</strong> — {t.close}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontSize: '0.76rem' }}>
              {t.usage}{shortcutStats.usageCount}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppQuickControls;
