import { useState } from 'react';
import { motion } from 'framer-motion';
import { Accessibility, Keyboard, Languages, Settings, Check, Sparkle, Sun, Moon, FileText as FileTextIcon, ALargeSmall, Space, Focus } from 'lucide-react';
import { getAppLanguageOptions, APP_UI_TEXT } from '../config/appUiText';
import {
  createPaperChipStyle,
  createPaperPanelStyle,
  PAPER_FONT_FAMILY,
} from '../components/shared/paper/paperTheme';
import PaperHeadingBadge from '../components/shared/paper/PaperHeadingBadge';
import PaperPageHeader from '../components/shared/paper/PaperPageHeader';

const PANEL_TITLE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: 'var(--font-paper)',
  fontWeight: '400',
  color: '#1e293b',
  fontSize: '1.2rem',
  letterSpacing: '0.2px',
  borderBottom: '2.5px dashed #cbd5e1',
  paddingBottom: '10px',
  marginBottom: '16px',
};

const getPanelIconBoxStyle = (border, bottom, background, color) => ({
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

const getOptionCardStyle = (active = false) => ({
  ...createPaperPanelStyle({
    background: active ? '#f0f7ff' : 'var(--surface-card)',
    borderColor: active ? '#3b82f6' : '#cbd5e1',
    bottomColor: active ? '#2563eb' : '#cbd5e1',
    radius: '16px',
    shadow: active ? '0 6px 14px rgba(59,130,246,0.06)' : '0 4px 8px rgba(0,0,0,0.01)',
  }),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  padding: '12px 16px',
  borderWidth: '2.5px',
  borderBottomWidth: active ? '5px' : '4px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

const KEYCAP_STYLE = {
  ...createPaperChipStyle({
    borderColor: '#93c5fd',
    bottomColor: '#60a5fa',
    background: '#eff6ff',
    color: '#1d4ed8',
    radius: '10px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-paper)',
  }),
  minWidth: '48px',
  textAlign: 'center',
  fontWeight: '400',
  lineHeight: 1.1,
  flexShrink: 0,
};

const PREVIEW_QUOTES = {
  en: { title: "Cherry Blossoms", text: "Mitsumi and Sousuke walked to school under the blooming cherry blossoms. It was a beautiful spring morning.", button: "Read Article" },
  es: { title: "Flores de Cerezo", text: "Mitsumi y Sousuke caminaron a la escuela bajo las flores de cerezo en flor. Era una hermosa mañana de primavera.", button: "Leer Artículo" },
  pt: { title: "Flores de Cerejeira", text: "Mitsumi e Sousuke caminharam para a escola sob as flores de cerejeira em flor. Era uma bela manhã de primavera.", button: "Ler Artigo" },
  fr: { title: "Cerisiers en Fleurs", text: "Mitsumi et Sousuke marchèrent vers l’école sous les cerisiers en fleurs. C'était une magnifique matinée de printemps.", button: "Lire l'Article" },
  de: { title: "Kirschblüten", text: "Mitsumi und Sousuke gingen unter den blühenden Kirschblüten zur Schule. Es war ein wunderschöner Frühlingsmorgen.", button: "Artikel Lesen" },
  it: { title: "Fiori di Ciliegio", text: "Mitsumi e Sousuke camminarono verso la scuola sotto i ciliegi in fiore. Era una splendida mattina di primavera.", button: "Leggi Articolo" },
  ja: { title: "桜の並木道", text: "美津未と聡介は咲き誇る桜の下を歩いて登校した。美しい春の朝だった。", button: "記事を読む" },
};

const SettingsPage = ({
  isMobile,
  uiLanguage,
  setUiLanguage,
  accessibilityPrefs,
  toggleAccessibilityPref,
  setAccessibilityColorBlindMode,
  shortcutStats,
  readerPrefs,
  setReaderPrefs,
  t,
}) => {
  const fallbackText = APP_UI_TEXT.en;
  
  const appLanguageOptions = getAppLanguageOptions();
  const colorBlindLabel = t.colorVisionMode || fallbackText.colorVisionMode || 'Color vision mode';

  const colorBlindOptions = [
    { key: 'none', label: t.colorVisionOff || fallbackText.colorVisionOff || 'Off' },
    { key: 'protanopia', label: t.colorVisionProtanopia || fallbackText.colorVisionProtanopia || 'Protanopia' },
    { key: 'deuteranopia', label: t.colorVisionDeuteranopia || fallbackText.colorVisionDeuteranopia || 'Deuteranopia' },
    { key: 'tritanopia', label: t.colorVisionTritanopia || fallbackText.colorVisionTritanopia || 'Tritanopia' },
    { key: 'black-white', label: t.colorVisionBlackWhite || fallbackText.colorVisionBlackWhite || 'Black & White' },
  ];

  const shortcutRows = [
    { keyLabel: '1..8', description: t.mainTabShortcut || fallbackText.mainTabShortcut || 'Jump to a main tab', icon: '🏠' },
    { keyLabel: 'Q / E', description: t.prevNextSubtab || fallbackText.prevNextSubtab || 'Previous / next subtab', icon: '↔️' },
    { keyLabel: 'Alt+A', description: t.accessibility || 'Accessibility', icon: '♿' },
    { keyLabel: 'Alt+K', description: t.shortcuts || 'Keyboard Help', icon: '⌨️' },
    { keyLabel: 'Esc', description: t.close || 'Close overlay', icon: '✖️' },
  ];

  const accessibilityOptions = [
    { key: 'largeText', label: t.largeText || fallbackText.largeText },
    { key: 'largeControls', label: t.largeControls || fallbackText.largeControls },
    { key: 'readableSpacing', label: t.readableSpacing || fallbackText.readableSpacing },
    { key: 'underlineLinks', label: t.underlineLinks || fallbackText.underlineLinks },
    { key: 'highContrast', label: t.highContrast || fallbackText.highContrast },
    { key: 'reduceTransparency', label: t.reduceTransparency || fallbackText.reduceTransparency },
    { key: 'reduceMotion', label: t.reduceMotion || fallbackText.reduceMotion },
    { key: 'simplifyVisuals', label: t.simplifyVisuals || fallbackText.simplifyVisuals },
    { key: 'dimNonEssentialColors', label: t.dimNonEssentialColors || fallbackText.dimNonEssentialColors || 'Dim non-essential colors' },
  ];

  const readingOptions = accessibilityOptions.filter(o => ['largeText', 'largeControls', 'readableSpacing', 'underlineLinks'].includes(o.key));
  const clarityOptions = accessibilityOptions.filter(o => ['highContrast', 'reduceTransparency'].includes(o.key));
  const visualsOptions = accessibilityOptions.filter(o => ['reduceMotion', 'simplifyVisuals', 'dimNonEssentialColors'].includes(o.key));

  const getLanguageVisual = (code) => {
    const flags = {
      en: '🇺🇸',
      es: '🇪🇸',
      pt: '🇧🇷',
      fr: '🇫🇷',
      de: '🇩🇪',
      it: '🇮🇹',
      ja: '🇯🇵',
    };
    return (
      <span style={{ fontSize: '1.35rem', marginRight: '8px', display: 'inline-flex', alignItems: 'center' }}>
        {flags[code] || '🌐'}
      </span>
    );
  };

  const getVisualPreview = (key, val) => {
    switch (key) {
      case 'largeText':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginRight: '6px', minWidth: '40px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Aa</span>
            <span style={{ fontSize: '1.05rem', color: '#1e293b' }}>Aa</span>
          </div>
        );
      case 'largeControls':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '6px', minWidth: '40px' }}>
            <span style={{ padding: '2.5px 5px', background: '#cbd5e1', borderRadius: '3px', fontSize: '0.62rem' }}>A</span>
            <span style={{ padding: '3.5px 7px', background: '#3b82f6', color: '#fff', borderRadius: '5px', fontSize: '0.75rem' }}>A</span>
          </div>
        );
      case 'readableSpacing':
        return (
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: val ? '4px' : '2px', marginRight: '6px', width: '22px' }}>
            <div style={{ height: '2px', background: '#64748b', width: '100%' }} />
            <div style={{ height: '2px', background: '#64748b', width: '100%' }} />
            <div style={{ height: '2px', background: '#64748b', width: '100%' }} />
          </div>
        );
      case 'underlineLinks':
        return (
          <span style={{ textDecoration: 'underline', color: '#3b82f6', fontSize: '0.8rem', marginRight: '6px', minWidth: '40px' }}>
            abc
          </span>
        );
      case 'highContrast':
        return (
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'conic-gradient(#000 180deg, #fff 180deg)',
            border: '2px solid #000',
            marginRight: '6px'
          }} />
        );
      case 'reduceTransparency':
        return (
          <div style={{ display: 'inline-flex', gap: '3px', marginRight: '6px' }}>
            <div style={{ width: '11px', height: '11px', background: 'rgba(59,130,246,0.3)', borderRadius: '2.5px' }} />
            <div style={{ width: '11px', height: '11px', background: '#3b82f6', borderRadius: '2.5px' }} />
          </div>
        );
      case 'reduceMotion':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginRight: '6px', width: '18px' }}>
            <span style={{ fontSize: '0.85rem', display: 'inline-block' }}>🌀</span>
            {val && <span style={{ position: 'absolute', color: '#ef4444', fontSize: '1rem' }}>/</span>}
          </div>
        );
      case 'simplifyVisuals':
        return (
          <div style={{ display: 'inline-flex', gap: '3px', marginRight: '6px', fontSize: '0.8rem', width: '18px' }}>
            <span>{val ? '•' : '✨'}</span>
          </div>
        );
      case 'dimNonEssentialColors':
        return (
          <div style={{ display: 'inline-flex', gap: '2px', marginRight: '6px' }}>
            <div style={{ width: '5px', height: '11px', background: val ? '#94a3b8' : '#ef4444', borderRadius: '0.8px' }} />
            <div style={{ width: '5px', height: '11px', background: val ? '#cbd5e1' : '#10b981', borderRadius: '0.8px' }} />
            <div style={{ width: '5px', height: '11px', background: val ? '#e2e8f0' : '#3b82f6', borderRadius: '0.8px' }} />
          </div>
        );
      default:
        return null;
    }
  };

  const getColorBlindPreview = (key) => {
    const swatches = [
      { color: '#ef4444', name: 'Red' },
      { color: '#22c55e', name: 'Green' },
      { color: '#3b82f6', name: 'Blue' },
      { color: '#eab308', name: 'Yellow' }
    ];

    const filterName = key === 'none' ? 'none' : `url(#filter-${key})`;

    return (
      <div style={{ display: 'flex', gap: '4px', marginRight: '8px', filter: filterName }}>
        {swatches.map((s, idx) => (
          <div
            key={idx}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: s.color,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      padding: isMobile ? '20px 14px 60px' : '32px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-paper)',
    }}>
      
      {/* SVG Color Blindness Matrix Filters */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="filter-protanopia">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="filter-deuteranopia">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="filter-tritanopia">
            <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="filter-black-white">
            <feColorMatrix type="matrix" values="0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>
      
      {/* Redesigned Pop-Art Sketchbook Header Banner */}
      <PaperPageHeader
        isMobile={isMobile}
        center={(
          <PaperHeadingBadge
            isMobile={isMobile}
            icon={Settings}
            title={t.settings || 'Settings'}
            palette={{
              borderColor: '#818cf8',
              bottomColor: '#818cf8',
              shadow: '0 4px 15px rgba(129, 140, 248, 0.1)',
            }}
            titleColor="#818cf8"
            iconColor="#818cf8"
          />
        )}
        marginBottomMobile="20px"
        marginBottomDesktop="32px"
        gapMobile="16px"
        paddingMobile="0"
        paddingDesktop="0"
      />

      {/* Beautiful, Balanced Scrapbook Two-Column Grid Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
        gap: '28px',
        alignItems: 'start',
        width: '100%',
        maxWidth: '1240px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        
        {/* LEFT COLUMN: Accessibility Options & Blog Reader Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* A. Flat Accessibility Suite */}
          <div
            className="sketchbook-border"
            style={{
              background: '#ffffff',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #cbd5e1',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
            }}
          >
            <div
              className="washi-tape washi-tape--yellow"
              style={{
                top: '-14px',
                left: '24px',
                transform: 'rotate(-2deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
            <div style={PANEL_TITLE_STYLE}>
              <div style={getPanelIconBoxStyle('#34d399', '#059669', '#ecfdf5', '#059669')}>
                <Accessibility size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.accessibility || 'Accessibility Options'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Text & Reading */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-paper)', fontWeight: '400', fontSize: '0.98rem', color: '#64748b', margin: '0 0 10px 0', borderBottom: '1.5px dashed #cbd5e1', paddingBottom: '4px' }}>
                  Text & Reading Preferences
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {readingOptions.map(option => {
                    const val = !!accessibilityPrefs[option.key];
                    return (
                      <motion.div
                        key={option.key}
                        onClick={() => toggleAccessibilityPref(option.key)}
                        whileTap={{ scale: 0.98 }}
                        style={getOptionCardStyle(val)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {getVisualPreview(option.key, val)}
                          <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.88rem', color: '#334155', fontWeight: '400' }}>
                            {option.label}
                          </span>
                        </div>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: '2px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: val ? '#3b82f6' : '#fff',
                          borderColor: val ? '#2563eb' : '#cbd5e1',
                          flexShrink: 0,
                        }}>
                          {val && <Check size={14} color="#fff" strokeWidth={3} />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Display & Clarity */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-paper)', fontWeight: '400', fontSize: '0.98rem', color: '#64748b', margin: '0 0 10px 0', borderBottom: '1.5px dashed #cbd5e1', paddingBottom: '4px' }}>
                  Display & Contrast
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {clarityOptions.map(option => {
                    const val = !!accessibilityPrefs[option.key];
                    return (
                      <motion.div
                        key={option.key}
                        onClick={() => toggleAccessibilityPref(option.key)}
                        whileTap={{ scale: 0.98 }}
                        style={getOptionCardStyle(val)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {getVisualPreview(option.key, val)}
                          <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.88rem', color: '#334155', fontWeight: '400' }}>
                            {option.label}
                          </span>
                        </div>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: '2px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: val ? '#3b82f6' : '#fff',
                          borderColor: val ? '#2563eb' : '#cbd5e1',
                          flexShrink: 0,
                        }}>
                          {val && <Check size={14} color="#fff" strokeWidth={3} />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Motion & Colors */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-paper)', fontWeight: '400', fontSize: '0.98rem', color: '#64748b', margin: '0 0 10px 0', borderBottom: '1.5px dashed #cbd5e1', paddingBottom: '4px' }}>
                  Motion & Colors
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '12px' }}>
                  {visualsOptions.map(option => {
                    const val = !!accessibilityPrefs[option.key];
                    return (
                      <motion.div
                        key={option.key}
                        onClick={() => toggleAccessibilityPref(option.key)}
                        whileTap={{ scale: 0.98 }}
                        style={getOptionCardStyle(val)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {getVisualPreview(option.key, val)}
                          <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.88rem', color: '#334155', fontWeight: '400' }}>
                            {option.label}
                          </span>
                        </div>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: '2px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: val ? '#3b82f6' : '#fff',
                          borderColor: val ? '#2563eb' : '#cbd5e1',
                          flexShrink: 0,
                        }}>
                          {val && <Check size={14} color="#fff" strokeWidth={3} />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Colorblindness Settings Row */}
              <div style={{ background: '#f8fafc', border: '2.5px solid #cbd5e1', borderBottom: '5px solid #cbd5e1', borderRadius: '20px', padding: '14px 16px' }} className="sketchbook-border">
                <span style={{ fontFamily: 'var(--font-paper)', color: '#4b5563', fontSize: '0.84rem', display: 'block', marginBottom: '8px', fontWeight: '400' }}>
                  {colorBlindLabel}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {colorBlindOptions.map((option) => {
                    const selected = (accessibilityPrefs.colorBlindMode || 'none') === option.key;
                    return (
                      <motion.div
                        key={option.key}
                        onClick={() => setAccessibilityColorBlindMode(option.key)}
                        whileTap={{ scale: 0.98 }}
                        className="sketchbook-border"
                        style={getOptionCardStyle(selected)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {getColorBlindPreview(option.key)}
                          <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.84rem', color: '#334155', fontWeight: '400' }}>
                            {option.label}
                          </span>
                        </div>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fff',
                          borderColor: selected ? '#3b82f6' : '#cbd5e1',
                          flexShrink: 0,
                        }}>
                          {selected && (
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: '#3b82f6',
                            }} />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* B. Blog Reader Options Card */}
          {readerPrefs && setReaderPrefs && (
            <div
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: '3px solid #cbd5e1',
                borderBottom: '8px solid #cbd5e1',
                padding: '20px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
              }}
            >
              <div
                className="washi-tape washi-tape--blue"
                style={{
                  top: '-14px',
                  right: '24px',
                  transform: 'rotate(2deg)',
                  width: '74px',
                  height: '22px',
                  zIndex: 5,
                }}
              />
              <div style={PANEL_TITLE_STYLE}>
                <div style={getPanelIconBoxStyle('#f59e0b', '#d97706', '#fef3c7', '#d97706')}>
                  <Sparkle size={18} strokeWidth={2.4} style={{ color: '#d97706' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.readerControls || 'Blog reader options'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { key: 'largeText', label: t.largeTextMode || 'Larger text', Icon: ALargeSmall },
                  { key: 'wideSpacing', label: t.widerSpacingMode || 'Wider spacing', Icon: Space },
                  { key: 'focusWidth', label: t.focusWidthMode || 'Comfort width', Icon: Focus },
                ].map((pref) => {
                  const isActive = !!readerPrefs[pref.key];
                  return (
                    <motion.div
                      key={pref.key}
                      onClick={() => setReaderPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                      whileTap={{ scale: 0.98 }}
                      style={getOptionCardStyle(isActive)}
                    >
                      <span style={{
                        fontFamily: 'var(--font-paper)',
                        fontSize: '0.88rem',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '400',
                      }}>
                        <pref.Icon size={16} strokeWidth={2.4} style={{ color: isActive ? '#3b82f6' : '#64748b' }} />
                        {pref.label}
                      </span>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: '2px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive ? '#3b82f6' : '#fff',
                        borderColor: isActive ? '#2563eb' : '#cbd5e1',
                        flexShrink: 0,
                      }}>
                        {isActive && <Check size={14} color="#fff" strokeWidth={3} />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontFamily: 'var(--font-paper)', color: '#64748b', fontSize: '0.84rem', fontWeight: '400' }}>
                  Reader color theme
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { key: 'paper', label: t.themePaper || 'Paper', bg: '#fff7ed', border: '#fdba74', text: '#7c2d12', Icon: FileTextIcon },
                    { key: 'sepia', label: t.themeSepia || 'Sepia', bg: '#fef3c7', border: '#f59e0b', text: '#78350f', Icon: Sun },
                    { key: 'night', label: t.themeNight || 'Night', bg: '#0f172a', border: '#334155', text: '#f8fafc', Icon: Moon },
                  ].map((themeOpt) => {
                    const isThemeActive = readerPrefs.theme === themeOpt.key;
                    return (
                      <motion.button
                        key={themeOpt.key}
                        type="button"
                        onClick={() => setReaderPrefs(prev => ({ ...prev, theme: themeOpt.key }))}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="sketchbook-border"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 6px',
                          background: themeOpt.bg,
                          color: themeOpt.text,
                          border: isThemeActive ? `3px solid #3b82f6` : `2px solid ${themeOpt.border}`,
                          borderBottom: isThemeActive ? `5px solid #2563eb` : `4px solid ${themeOpt.border}`,
                          cursor: 'pointer',
                          boxShadow: isThemeActive ? '0 4px 8px rgba(59,130,246,0.1)' : 'none',
                          transition: 'all 0.1s ease',
                          fontWeight: '400',
                        }}
                      >
                        <themeOpt.Icon size={16} strokeWidth={isThemeActive ? 3 : 2.2} />
                        <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.8rem', fontWeight: '400' }}>
                          {themeOpt.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Live Visual Preview, Language Selector & Shortcuts Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* A. Live Visual Preview Card */}
          <div
            className="sketchbook-border"
            style={{
              background: '#ffffff',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #cbd5e1',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
            }}
          >
            <div
              className="washi-tape washi-tape--pink"
              style={{
                top: '-14px',
                right: '24px',
                transform: 'rotate(1.5deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
            <div style={PANEL_TITLE_STYLE}>
              <div style={getPanelIconBoxStyle('#f59e0b', '#d97706', '#fef3c7', '#d97706')}>
                <Sparkle size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>Visual preview</span>
            </div>

            <div
              className="sketchbook-border"
              style={{
                border: accessibilityPrefs.highContrast ? '3.5px solid #000' : '3px solid #fdba74',
                borderBottom: accessibilityPrefs.highContrast ? '7px solid #000' : '6px solid #f97316',
                background: readerPrefs?.theme === 'night' ? '#0f172a' : (readerPrefs?.theme === 'sepia' ? '#fef3c7' : '#fff7ed'),
                color: readerPrefs?.theme === 'night' ? '#f8fafc' : (readerPrefs?.theme === 'sepia' ? '#451a03' : '#431407'),
                padding: accessibilityPrefs.largeControls ? '16px 18px' : '12px 14px',
                transition: 'all 0.2s ease',
                filter: accessibilityPrefs.colorBlindMode && accessibilityPrefs.colorBlindMode !== 'none' ? `url(#filter-${accessibilityPrefs.colorBlindMode})` : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: accessibilityPrefs.readableSpacing || readerPrefs?.wideSpacing ? '14px' : '8px',
                boxSizing: 'border-box',
              }}
            >
              <h4 style={{
                margin: 0,
                fontFamily: 'var(--font-paper)',
                fontSize: (accessibilityPrefs.largeText || readerPrefs?.largeText) ? '1.3rem' : '1.1rem',
                lineHeight: 1.2,
                textDecoration: accessibilityPrefs.underlineLinks ? 'underline' : 'none',
                fontWeight: '400',
              }}>
                {PREVIEW_QUOTES[uiLanguage]?.title || PREVIEW_QUOTES.en.title}
              </h4>
              
              <p style={{
                margin: 0,
                fontFamily: 'var(--font-paper)',
                fontSize: (accessibilityPrefs.largeText || readerPrefs?.largeText) ? '0.92rem' : '0.8rem',
                lineHeight: accessibilityPrefs.readableSpacing || readerPrefs?.wideSpacing ? 1.75 : 1.45,
                letterSpacing: accessibilityPrefs.readableSpacing ? '0.04em' : 'normal',
                opacity: 0.9,
                fontWeight: '400',
              }}>
                {PREVIEW_QUOTES[uiLanguage]?.text || PREVIEW_QUOTES.en.text}
              </p>

              <button
                type="button"
                style={{
                  alignSelf: 'flex-start',
                  border: accessibilityPrefs.highContrast ? '3px solid #000' : '2px solid #bfdbfe',
                  borderBottom: accessibilityPrefs.highContrast ? '5px solid #000' : '4px solid #60a5fa',
                  background: '#fff',
                  color: '#1d4ed8',
                  borderRadius: accessibilityPrefs.largeControls ? '12px' : '9px',
                  padding: accessibilityPrefs.largeControls ? '9px 16px' : '7px 12px',
                  fontFamily: 'var(--font-paper)',
                  fontSize: (accessibilityPrefs.largeText || readerPrefs?.largeText) ? '0.9rem' : '0.78rem',
                  cursor: 'pointer',
                  textDecoration: accessibilityPrefs.underlineLinks ? 'underline' : 'none',
                  fontWeight: '400',
                }}
              >
                {PREVIEW_QUOTES[uiLanguage]?.button || PREVIEW_QUOTES.en.button}
              </button>
            </div>
          </div>

          {/* B. Language Selector Card */}
          <div
            className="sketchbook-border"
            style={{
              background: '#ffffff',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #cbd5e1',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
            }}
          >
            <div
              className="washi-tape washi-tape--blue"
              style={{
                top: '-14px',
                left: '24px',
                transform: 'rotate(-1.5deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
            <div style={PANEL_TITLE_STYLE}>
              <div style={getPanelIconBoxStyle('#60a5fa', '#2563eb', '#eef6ff', '#1d4ed8')}>
                <Languages size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.language || 'LanguageSelector'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {appLanguageOptions.map(({ code, name }) => {
                const isActive = code === uiLanguage;
                return (
                  <motion.button
                    key={code}
                    onClick={() => setUiLanguage(code)}
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="sketchbook-border"
                    style={{
                      ...getOptionCardStyle(isActive),
                      fontFamily: 'var(--font-paper)',
                      fontSize: '0.88rem',
                      color: isActive ? '#1d4ed8' : '#334155',
                      padding: '10px 14px',
                      background: isActive ? '#eff6ff' : '#fff',
                      border: isActive ? '2.5px solid #3b82f6' : '2.5px solid #cbd5e1',
                      borderBottom: isActive ? '5px solid #2563eb' : '4px solid #cbd5e1',
                      boxShadow: isActive ? '0 4px 8px rgba(59, 130, 246, 0.05)' : 'none',
                      justifyContent: 'flex-start',
                      width: '100%',
                      fontWeight: '400',
                    }}
                  >
                    {getLanguageVisual(code)}
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: '400' }}>{name}</span>
                    {isActive && <Sparkle size={12} strokeWidth={3} style={{ color: '#3b82f6', marginLeft: 'auto' }} />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* C. Keyboard Shortcuts Guide Card */}
          <div
            className="sketchbook-border"
            style={{
              background: '#ffffff',
              border: '3px solid #cbd5e1',
              borderBottom: '8px solid #cbd5e1',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
            }}
          >
            <div
              className="washi-tape washi-tape--yellow"
              style={{
                top: '-14px',
                right: '24px',
                transform: 'rotate(2.5deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
            <div style={PANEL_TITLE_STYLE}>
              <div style={getPanelIconBoxStyle('#c4b5fd', '#7c3aed', '#f5f3ff', '#7c3aed')}>
                <Keyboard size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.shortcuts || 'Keyboard Shortcuts'}</span>
            </div>

            <p style={{
              fontFamily: 'var(--font-paper)',
              fontSize: '0.84rem',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0 0 4px 0',
              lineHeight: 1.4,
            }}>
              {t.shortcutsIntro || 'Use keyboard shortcuts to quickly navigate the notebook.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {shortcutRows.map((row) => (
                <div key={row.keyLabel} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '8px 12px',
                }} className="sketchbook-border">
                  <div style={KEYCAP_STYLE}>{row.keyLabel}</div>
                  <div style={{ fontSize: '1.15rem' }}>{row.icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-paper)',
                    color: '#334155',
                    fontSize: '0.84rem',
                    fontWeight: '400',
                  }}>
                    {row.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
