import { AnimatePresence, motion } from 'framer-motion';
import { Accessibility, Keyboard, Languages, Settings } from 'lucide-react';

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
      <motion.button
        onClick={toggleSettingsMain}
        aria-label={t.settings || 'Settings'}
        aria-expanded={showSettingsMain}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95, y: 4 }}
        style={{
          background: 'white',
          border: '3px solid #60a5fa',
          borderBottom: '8px solid #3b82f6',
          borderRadius: '20px',
          padding: isMobile ? '10px' : '10px 18px',
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
          fontSize: '1rem',
          minWidth: isMobile ? '48px' : '0',
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Settings size={20} strokeWidth={2.5} />
        {!isMobile && (t.settings || 'Settings')}
      </motion.button>

      <AnimatePresence>
        {showSettingsMain && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              background: 'white',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #94a3b8',
              borderRadius: '24px',
              padding: '12px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              minWidth: '180px',
              zIndex: 2000
            }}
          >
            <button
               onClick={toggleLanguagePanel}
               style={{
                 textAlign: 'left', background: 'none', border: 'none', padding: '12px 14px',
                 borderRadius: '16px', cursor: 'pointer', color: '#334155', fontFamily: '"Sniglet", "Coming Soon", cursive',
                 fontWeight: '400', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px',
                 transition: 'all 0.2s'
               }}
               onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.paddingLeft = '18px'; }}
               onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.paddingLeft = '14px'; }}
            >
              <Languages size={18} strokeWidth={2.5} color="#64748b" /> {t.language}
            </button>
            <button
               onClick={toggleAccessibilityPanel}
               style={{
                 textAlign: 'left', background: 'none', border: 'none', padding: '12px 14px',
                 borderRadius: '16px', cursor: 'pointer', color: '#334155', fontFamily: '"Sniglet", "Coming Soon", cursive',
                 fontWeight: '400', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px',
                 transition: 'all 0.2s'
               }}
               onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.paddingLeft = '18px'; }}
               onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.paddingLeft = '14px'; }}
            >
              <Accessibility size={18} strokeWidth={2.5} color="#64748b" /> {t.accessibility}
            </button>
            {!isMobile && (
              <button
                 onClick={toggleShortcutPanel}
                 style={{
                   textAlign: 'left', background: 'none', border: 'none', padding: '12px 14px',
                   borderRadius: '16px', cursor: 'pointer', color: '#334155', fontFamily: '"Sniglet", "Coming Soon", cursive',
                   fontWeight: '400', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px',
                   transition: 'all 0.2s'
                 }}
                 onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.paddingLeft = '18px'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.paddingLeft = '14px'; }}
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
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            role="dialog"
            aria-label={t.accessibilityOptions}
            style={{
              background: 'white',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #94a3b8',
              borderRadius: '24px',
              padding: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              minWidth: isMobile ? '260px' : '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 2000
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
                  fontFamily: '"Sniglet", "Coming Soon", cursive',
                  color: '#374151',
                  fontWeight: '400',
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
              <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#374151', fontWeight: '400', fontSize: '0.88rem' }}>
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
                        fontFamily: '"Sniglet", "Coming Soon", cursive',
                        fontWeight: '400',
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

            <div style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#6b7280', fontSize: '0.75rem', lineHeight: 1.3 }}>
              {t.tip}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLanguageMenu && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            role="listbox"
            aria-label={t.language}
            style={{
              background: '#fff',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #94a3b8',
              borderRadius: '24px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              padding: '12px',
              minWidth: isMobile ? '240px' : '260px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              zIndex: 2000
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
                    border: selected ? '2.5px solid #60a5fa' : '2.5px solid transparent',
                    borderRadius: '12px',
                    background: selected ? '#eff6ff' : '#fff',
                    color: selected ? '#1e40af' : '#334155',
                    padding: '10px 12px',
                    fontFamily: '"Sniglet", "Coming Soon", cursive',
                    fontWeight: '400',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { if(!selected) e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={(e) => { if(!selected) e.currentTarget.style.background = '#fff'; }}
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
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            role="dialog"
            aria-label={t.keyboardHelp}
            style={{
              background: 'white',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #94a3b8',
              borderRadius: '24px',
              padding: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              minWidth: isMobile ? '260px' : '300px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 2000
            }}
          >
            <div style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', color: '#1e293b', fontSize: '1.1rem', letterSpacing: '0.2px' }}>{t.shortcuts}</div>
            <div style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#4b5563', fontSize: '0.92rem', lineHeight: 1.4, fontWeight: '400' }}>
              {t.shortcutsIntro}
            </div>
            <div style={{ 
              fontFamily: '"Sniglet", "Coming Soon", cursive', 
              color: '#334155', 
              fontSize: '0.9rem', 
              lineHeight: 1.6,
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '16px',
              border: '2px dashed #e2e8f0'
            }}>
              <div><strong style={{ color: '#3b82f6' }}>1..7</strong> — {t.mainTabShortcut || uiText.en.mainTabShortcut || 'Jump to a main tab'}</div>
              <div><strong style={{ color: '#3b82f6' }}>Q / E</strong> — {t.prevNextSubtab || uiText.en.prevNextSubtab || 'Previous / next subtab'}</div>
              <div><strong style={{ color: '#3b82f6' }}>Alt+A</strong> — {t.accessibility}</div>
              <div><strong style={{ color: '#3b82f6' }}>Alt+K</strong> — {t.shortcuts}</div>
              <div><strong style={{ color: '#3b82f6' }}>Esc</strong> — {t.close}</div>
            </div>
            <div style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '400', textAlign: 'right' }}>
              {t.usage}{shortcutStats.usageCount}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppQuickControls;




