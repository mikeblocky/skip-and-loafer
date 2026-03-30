import { useCallback, useMemo, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';
import { PORTRAIT_DATA } from '../../mystery/mysteryData';
import { FALLBACK_COLORS } from '../chatPalette';
import { BUTTON_STYLE, CHAT_FONT_FAMILY } from '../chatConstants';
import { getPaletteByIndex } from '../chatStorage';

export function PalettePicker({ selectedIndex, onSelect, disabled, compact = false }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', padding: '4px 0' }}>
      {FALLBACK_COLORS.map((palette, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            onSelect(index);
          }}
          disabled={disabled}
          style={{
            width: compact ? '28px' : '32px',
            height: compact ? '28px' : '32px',
            borderRadius: '999px',
            background: palette.bg,
            border: selectedIndex === index ? `3px solid ${palette.text}` : `2px solid ${palette.border}`,
            cursor: 'pointer',
            opacity: disabled ? 0.6 : 1,
            boxShadow: selectedIndex === index ? `0 0 0 2px ${palette.bg}, 0 4px 12px ${palette.border}88` : 'none',
            transition: 'transform 160ms ease, box-shadow 160ms ease',
            transform: selectedIndex === index ? 'scale(1.15)' : 'scale(1)',
          }}
          title={`Color theme ${index + 1}`}
        />
      ))}
    </div>
  );
}

export function PortraitPicker({ isMobile, selectedCharacter, profile, onSelect, onSelectPalette, disabled, compact = false, copy }) {
  const options = useMemo(
    () => PORTRAIT_DATA.map((portrait, index) => ({
      ...portrait,
      palette: getPaletteByIndex(index),
      tilt: index % 2 === 0 ? -1.5 : 1.5,
    })),
    [],
  );
  const selectedIndex = Math.max(options.findIndex((portrait) => portrait.name === selectedCharacter), 0);
  const activePortrait = options[selectedIndex] || options[0];
  const touchStartRef = useRef(null);

  const moveSelection = useCallback((direction) => {
    const nextIndex = (selectedIndex + direction + options.length) % options.length;
    triggerHaptic('selection');
    onSelect(options[nextIndex].name);
  }, [onSelect, options, selectedIndex]);

  const handleLucky = useCallback(() => {
    if (options.length <= 1) return;
    let nextIndex = selectedIndex;
    while (nextIndex === selectedIndex) {
      nextIndex = Math.floor(Math.random() * options.length);
    }
    triggerHaptic('success');
    onSelect(options[nextIndex].name);
    if (onSelectPalette) {
      const randomPaletteIndex = Math.floor(Math.random() * FALLBACK_COLORS.length);
      onSelectPalette(randomPaletteIndex);
    }
  }, [onSelect, onSelectPalette, options, selectedIndex]);

  const displayPalette = getPaletteByIndex(profile?.paletteIndex !== undefined ? profile.paletteIndex : selectedIndex);

  return (
    <div style={{ display: 'grid', gap: compact ? '10px' : '14px', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
      <div
        onTouchStart={(event) => {
          touchStartRef.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const startX = touchStartRef.current;
          const endX = event.changedTouches[0]?.clientX ?? null;
          touchStartRef.current = null;
          if (startX == null || endX == null) return;
          const delta = endX - startX;
          if (Math.abs(delta) < 42) return;
          moveSelection(delta < 0 ? 1 : -1);
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '40px minmax(0, 1fr) 40px' : '48px minmax(0, 1fr) 48px',
          gap: compact ? '8px' : '12px',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => moveSelection(-1)}
          disabled={disabled}
          style={{
            width: compact ? '34px' : '42px',
            height: compact ? '34px' : '42px',
            borderRadius: '999px',
            border: '1px solid #dbe7f3',
            background: '#ffffff',
            color: '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: disabled ? 0.6 : 1,
            fontFamily: CHAT_FONT_FAMILY,
            fontWeight: 400,
          }}
          aria-label="Previous character"
        >
          <ChevronLeft size={compact ? 16 : 18} strokeWidth={2.4} />
        </button>

        <motion.button
          key={activePortrait.name}
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            onSelect(activePortrait.name);
          }}
          whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
          whileTap={disabled ? undefined : { scale: 0.98 }}
          disabled={disabled}
          initial={{ opacity: 0.85, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            ...BUTTON_STYLE,
            width: '100%',
            maxWidth: compact ? '148px' : (isMobile ? '216px' : '232px'),
            justifySelf: 'center',
            padding: compact ? '6px 4px' : '14px 12px',
            flexDirection: 'column',
            gap: compact ? '4px' : '12px',
            background: displayPalette.bg,
            color: displayPalette.text,
            border: `3.5px solid ${displayPalette.border}`,
            borderBottom: `${compact ? 6 : 8}px solid ${displayPalette.border}`,
            boxShadow: `0 10px 20px ${displayPalette.border}33`,
            minHeight: compact ? '138px' : (isMobile ? '208px' : '224px'),
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            opacity: disabled ? 0.7 : 1,
          }}
          className="paper-interact"
        >
          <img
            src={activePortrait.src}
            alt={activePortrait.name}
            draggable="false"
            style={{
              width: '100%',
              height: compact ? '92px' : (isMobile ? '136px' : '148px'),
              objectFit: 'contain',
              filter: 'drop-shadow(4px 6px 10px rgba(15, 23, 42, 0.18))',
            }}
          />
          <span
            style={{
              fontSize: compact ? '0.88rem' : (isMobile ? '1rem' : '1.08rem'),
              color: displayPalette.border,
              background: '#ffffff',
              padding: compact ? '2px 14px' : '4px 18px',
              borderRadius: '999px',
              border: `${compact ? 2.5 : 3}px solid ${displayPalette.border}`,
              boxShadow: '0 4px 0 rgba(15, 23, 42, 0.05)',
              textAlign: 'center',
              fontFamily: CHAT_FONT_FAMILY,
              fontWeight: 400,
            }}
          >
            {activePortrait.name}
          </span>
        </motion.button>

        <button
          type="button"
          onClick={() => moveSelection(1)}
          disabled={disabled}
          style={{
            width: compact ? '34px' : '42px',
            height: compact ? '34px' : '42px',
            borderRadius: '999px',
            border: '1px solid #dbe7f3',
            background: '#ffffff',
            color: '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: disabled ? 0.6 : 1,
            fontFamily: CHAT_FONT_FAMILY,
            fontWeight: 400,
          }}
          aria-label="Next character"
        >
          <ChevronRight size={compact ? 16 : 18} strokeWidth={2.4} />
        </button>
      </div>

      <div style={{ display: 'grid', justifyItems: 'center', gap: '8px' }}>
        <PalettePicker 
          selectedIndex={profile?.paletteIndex ?? 0} 
          onSelect={onSelectPalette} 
          disabled={disabled} 
          compact={compact} 
        />
        
        <button
          type="button"
          onClick={handleLucky}
          disabled={disabled}
          style={{
            ...BUTTON_STYLE,
            padding: compact ? '8px 14px' : '10px 18px',
            background: '#fff7ed',
            color: '#9a3412',
            border: '2.5px solid #fdba74',
            borderBottom: '5.5px solid #f97316',
            borderRadius: '16px',
            opacity: disabled ? 0.6 : 1,
            marginTop: '6px',
            boxShadow: '0 4px 0 rgba(249, 115, 22, 0.1)',
            transition: 'transform 120ms ease, border-bottom-width 120ms ease'
          }}
          className="paper-interact"
        >
          <RefreshCw size={compact ? 14 : 15} strokeWidth={2.8} />
          <span style={{ fontSize: compact ? '0.88rem' : '0.96rem', fontWeight: 400 }}>{copy?.luckyPick || "I'm feeling lucky"}</span>
        </button>
        <div style={{ color: '#94a3b8', fontSize: compact ? '0.88rem' : '0.96rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, marginTop: '4px' }}>
          {selectedIndex + 1} / {options.length}
        </div>
      </div>
    </div>
  );
}
