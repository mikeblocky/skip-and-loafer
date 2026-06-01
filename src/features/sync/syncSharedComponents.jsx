import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle,
  Gem,
  Crown,
  Heart,
  Star,
  Cat,
  Dog,
  Music,
  Gift,
  Pizza,
  Rabbit,
  Bird,
  Fish,
  PawPrint,
  Coffee,
  BookMarked,
  Globe,
  Languages,
} from 'lucide-react';
import { NOTE_PALETTES, getReadTier } from './syncConfig';
import { HOVER_SCALE_TAB, TAP_SCALE_DEFAULT, TAP_SCALE_TAB, PRESS_SPRING, ENTER_SPRING, JELLY_TAP, JELLY_HOVER, SQUASH_TRANSITION } from '../../components/shared/animationPresets';
import { triggerHaptic } from '../../utils/haptics';
import { toUiLabelCase } from '../../utils/textCase';
import { getChapterDisplayTitle } from '../../data/chapterTitles';

// Floating celebration hearts on +1 read
const CelebrationHearts = ({ show }) => {
  return null;
};

const MilestoneEffects = () => {
  return null;
};

export const ListRow = ({ index, finished, readCount, noteColor, customNote, tierBorder, tierBg, tierText, tierAccent, numberLine1, numberLine2, title, subtitle, rightContent, onClick, style, isMobile = false }) => {
  const note = customNote || NOTE_PALETTES[noteColor % NOTE_PALETTES.length];

  const quirkRotate = ((index * 7 + 3) % 5 - 2) * 0.4;
  const quirkRadius = `${6 + (index % 3) * 2}px ${8 + (index % 2)}px ${5 + (index % 4)}px ${7 + (index % 5)}px`;

  return (
    <motion.div
      className="paper-interact"
      initial={{ opacity: 0, y: 8, rotate: (index % 3 - 1) * 0.3, scale: 0.98 }}
      animate={finished ? { opacity: 1, y: 0, rotate: quirkRotate, scale: [1, 1.015, 0.995, 1] } : { opacity: 1, y: 0, rotate: quirkRotate }}
      transition={finished ? { delay: index * 0.04, ...ENTER_SPRING } : { delay: index * 0.035, type: 'spring', stiffness: 280, damping: 18 }}
      whileHover={!isMobile && onClick ? { scale: 1.01, y: -2, rotate: 0, boxShadow: finished ? `0 14px 0 ${note.border}` : `0 8px 0 ${note.border}`, transition: { type: 'spring', stiffness: 400, damping: 20 } } : {}}
      whileTap={onClick ? { scale: 0.97, y: 1 } : {}}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: isMobile ? '10px' : '14px',
        padding: isMobile ? '14px 12px' : '16px 22px',
        background: note.bg,
        borderRadius: isMobile ? '20px' : '22px',
        border: `3px solid ${note.border}`,
        borderBottom: `7.5px solid ${note.border}`,
        boxShadow: finished ? `0 12px 0 ${note.border}` : `0 6px 0 ${note.border}`,
        overflow: 'visible',
        width: '100%',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {readCount >= 2 && tierBg && tierBorder && (
        <MilestoneEffects count={readCount} tier={{ bg: tierBg, border: tierBorder, text: tierText, accent: tierAccent }} color={note.accent} isMobile={isMobile} />
      )}



      <div style={{ position: 'absolute', top: '-1px', left: isMobile ? '12px' : '18px', width: isMobile ? '22px' : '30px', height: isMobile ? '8px' : '10px', background: `${note.border}50`, borderRadius: '0 0 3px 3px' }} />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={finished
          ? { scale: [0.8, 1.15, 0.95, 1.05, 1], opacity: 1, rotate: [0, -10, 10, -5, 5, 0] }
          : { scale: 1, opacity: 1, boxShadow: [`0 0 0px ${note.accent}00`, `0 0 10px ${note.accent}40`, `0 0 0px ${note.accent}00`] }
        }
        transition={finished
          ? { duration: 0.6, delay: index * 0.04 + 0.15 }
          : { scale: { delay: index * 0.04 + 0.08, type: 'spring', stiffness: 400, damping: 12 }, boxShadow: { duration: 2.5, repeat: Infinity, delay: index * 0.3 } }
        }
        style={{
          width: isMobile ? '36px' : '48px',
          height: isMobile ? '36px' : '48px',
          borderRadius: '50%',
          background: `${note.border}40`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: `3px solid ${note.border}`,
          boxShadow: `0 3px 0 ${note.border}`,
        }}
      >
        {numberLine1 && <span style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: '400',  color: note.accent, lineHeight: 1 }}>{numberLine1}</span>}
        {numberLine2 && <span style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '0.85rem' : '1.1rem', fontWeight: '400',  color: note.accent, lineHeight: 1 }}>{numberLine2}</span>}
      </motion.div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '0.9rem' : '1.05rem', color: '#1f2937', fontWeight: '400',  lineHeight: 1.2, whiteSpace: 'normal' }}>{title}</span>
        {subtitle && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{subtitle}</div>}
      </div>

      {rightContent && <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>{rightContent}</div>}
    </motion.div>
  );
};

export const MiniChapterRow = ({ chapter, index, isMobile, onReadChapter, isFinished, getReadCount, trackExternalLink, cancelExternalLink, unmarkFinished, incrementReadCount, getRemainingCooldown, pendingLinks, plusReadLabel, uiLanguage = 'en' }) => {
  const finished = isFinished?.(chapter.number);
  const readCount = getReadCount?.(chapter.number) || 0;
  const tier = getReadTier(readCount, uiLanguage);
  const note = NOTE_PALETTES[index % NOTE_PALETTES.length];
  const jpLinks = chapter.links.jp || [];
  const comingSoon = !chapter.links.en && jpLinks.length === 0;

  const quirkRotate = ((index * 5 + 2) % 6 - 3) * 0.25;
  const quirkRadius = `${4 + (index % 4)}px ${8 + (index % 3)}px ${5 + (index % 2)}px ${6 + (index % 5)}px`;

  const linkStyle = (bg) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: isMobile ? '0.75rem' : '0.8rem',
    color: '#fff',
    background: bg,
    padding: isMobile ? '5px 10px' : '5px 12px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontFamily: 'var(--font-main)',
    fontWeight: '400', 
    border: '1.5px solid rgba(0,0,0,0.2)',
    boxShadow: '0 2px 0 rgba(0,0,0,0.15)',
  });

  const pendingStart = pendingLinks?.[chapter.number];
  const [linkTimeLeft, setLinkTimeLeft] = useState(0);
  const [cooldown, setCooldown] = useState(() => getRemainingCooldown?.(chapter.number) || 0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        const rem = getRemainingCooldown?.(chapter.number) || 0;
        setCooldown(rem);
        if (rem <= 0) clearInterval(timer);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown, getRemainingCooldown, chapter.number]);

  const [celebrating, setCelebrating] = useState(0);

  const handleIncrement = () => {
    if (cooldown > 0) return;
    triggerHaptic('celebrate');
    incrementReadCount?.(chapter.number);
    setCooldown(60);
    setCelebrating(prev => prev + 1);
  };

  useEffect(() => {
    if (!pendingStart) {
      setLinkTimeLeft(0);
      return;
    }
    const READ_TIME_MS = 4 * 60 * 1000;

    const tick = () => {
      const diff = pendingStart + READ_TIME_MS - Date.now();
      setLinkTimeLeft(diff > 0 ? Math.ceil(diff / 1000) : 0);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [pendingStart]);

  const formatTime = (secs) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div
      className="paper-interact"
      initial={{ opacity: 0, scale: 0.96, y: -8, rotate: quirkRotate }}
      animate={finished ? { opacity: 1, scale: [1, 1.025, 0.985, 1], y: 0, rotate: quirkRotate } : { opacity: 1, scale: 1, y: 0, rotate: quirkRotate }}
      transition={{ delay: index * 0.025, type: 'spring', stiffness: 280, damping: 22 }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: isMobile ? '8px' : '12px',
        padding: isMobile ? '12px 10px' : '14px 16px',
        background: '#fff',
        borderRadius: isMobile ? '16px' : '18px',
        border: '3px solid #e2e8f0',
        borderBottom: '6px solid #cbd5eb',
        borderLeft: `5px solid ${note.accent}`,
        boxShadow: finished ? `0 4px 0 ${note.border}25` : '0 3px 0 rgba(0,0,0,0.03)',
        overflow: 'visible',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >

      <CelebrationHearts show={celebrating} />
      <MilestoneEffects count={readCount} tier={tier} color={note.accent} isMobile={isMobile} />

      {finished && (
        <motion.div
          initial={{ y: -6, opacity: 0 }}
          animate={readCount >= 2 ? { y: 0, opacity: 1, scale: [1, 1.03, 1], rotate: [0, -2, 2, 0] } : { y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25, delay: index * 0.04 + 0.1, duration: 0.4 }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 5,
            pointerEvents: 'none',
            background: tier.bg,
            borderRadius: '0 12px 0 12px',
            padding: isMobile ? '2px 6px 3px 8px' : '3px 10px 4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            boxShadow: `0 2px 4px ${tier.border}30`,
          }}
        >
          <span style={{ color: tier.text, fontSize: isMobile ? '0.58rem' : '0.64rem', fontWeight: '400', fontFamily: 'var(--font-hand)', lineHeight: 1 }}>
            {tier.label ? `${tier.label} - ${readCount || 1}×` : `${readCount || 1}×`}
          </span>
        </motion.div>
      )}

      {/* Checklist Checkbox Stamp Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flex: '1 1 120px',
        minWidth: 0
      }}>
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: `2px solid ${finished ? '#10b981' : '#cbd5e1'}`,
          background: finished ? '#f0fdf4' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: finished ? 'inset 0 1px 3px rgba(16,185,129,0.2)' : 'none'
        }}>
          {finished && (
            <motion.span 
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              style={{ fontSize: '0.66rem', color: '#10b981', fontWeight: 'bold', lineHeight: 1 }}
            >
              ✓
            </motion.span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span style={{ 
            fontFamily: 'var(--font-main)', 
            fontSize: isMobile ? '0.8rem' : '0.92rem', 
            color: finished ? '#94a3b8' : '#6b7280', 
            fontWeight: '400',  
            flexShrink: 0,
            textDecoration: finished ? 'line-through' : 'none'
          }}>
            {chapter.number} - 
          </span>
          <span style={{ 
            fontFamily: 'var(--font-main)', 
            fontSize: isMobile ? '0.78rem' : '0.88rem', 
            color: finished ? '#94a3b8' : '#1f2937', 
            fontWeight: '400',  
            whiteSpace: 'normal', 
            wordBreak: 'break-word', 
            lineHeight: 1.2,
            textDecoration: finished ? 'line-through' : 'none'
          }}>
            {getChapterDisplayTitle(chapter, uiLanguage)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center', marginLeft: isMobile ? '28px' : '0' }}>
        {!comingSoon && (
          <motion.button
            whileHover={cooldown > 0 ? {} : { scale: 1.025, y: -1.5, transition: { type: 'spring', stiffness: 500, damping: 18 } }}
            whileTap={cooldown > 0 ? {} : { scale: 0.96, y: 1 }}
            onClick={handleIncrement}
            disabled={cooldown > 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: isMobile ? '0.75rem' : '0.8rem',
              color: cooldown > 0 ? '#94a3b8' : note.accent,
              background: cooldown > 0 ? '#f8fafc' : `${note.border}18`,
              padding: isMobile ? '6px 12px' : '6px 14px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontFamily: 'var(--font-main)',
              fontWeight: '400', 
              border: `2px solid ${cooldown > 0 ? '#e2e8f0' : note.border}`,
              borderBottom: `4px solid ${cooldown > 0 ? '#cbd5e1' : note.border}`,
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: cooldown > 0 ? 'none' : '0 3px 6px rgba(0,0,0,0.02)',
              opacity: cooldown > 0 ? 0.7 : 1,
            }}
          >
            {cooldown > 0 ? `${cooldown}s` : plusReadLabel}
          </motion.button>
        )}

        {false && chapter.pages && chapter.pages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, y: 1 }}
            onClick={() => onReadChapter?.(chapter)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#fff', background: '#10b981', padding: isMobile ? '5px 10px' : '5px 12px', borderRadius: '10px', textDecoration: 'none', fontFamily: 'var(--font-main)', fontWeight: '400',  border: '1.5px solid #059669', boxShadow: '0 2px 0 #059669', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <BookMarked size={isMobile ? 12 : 11} /> Read
          </motion.button>
        )}

        {false && chapter.links.en && (
          <motion.a href={chapter.links.en} target="_blank" rel="noopener noreferrer" onClick={() => trackExternalLink?.(chapter.number)} onContextMenu={() => trackExternalLink?.(chapter.number)} onAuxClick={(e) => { if (e.button === 1) trackExternalLink?.(chapter.number); }} whileTap={TAP_SCALE_DEFAULT} style={linkStyle(note.accent)}>
            <Globe size={isMobile ? 9 : 11} /> EN
          </motion.a>
        )}

        {jpLinks.length === 1 && (
          <motion.a href={jpLinks[0]} target="_blank" rel="noopener noreferrer" onClick={() => trackExternalLink?.(chapter.number)} onContextMenu={() => trackExternalLink?.(chapter.number)} onAuxClick={(e) => { if (e.button === 1) trackExternalLink?.(chapter.number); }} whileTap={TAP_SCALE_DEFAULT} style={linkStyle('var(--pop-pink)')}>
            <Languages size={isMobile ? 9 : 11} /> JP
          </motion.a>
        )}

        {jpLinks.length > 1 && jpLinks.map((link, i) => (
          <motion.a key={i} href={link} target="_blank" rel="noopener noreferrer" onClick={() => trackExternalLink?.(chapter.number)} onContextMenu={() => trackExternalLink?.(chapter.number)} onAuxClick={(e) => { if (e.button === 1) trackExternalLink?.(chapter.number); }} whileTap={TAP_SCALE_DEFAULT} style={linkStyle('var(--pop-pink)')}>
            <Languages size={isMobile ? 9 : 11} /> {i + 1}
          </motion.a>
        ))}

        {linkTimeLeft > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '0.7rem' : '0.72rem', color: note.accent, background: `${note.border}30`, padding: '4px 8px', borderRadius: '8px', fontFamily: 'var(--font-hand)', fontWeight: '400', marginLeft: '4px' }}>
            {formatTime(linkTimeLeft)}
            <button onClick={() => cancelExternalLink?.(chapter.number)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0 0 4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '2px' }} title="Cancel timer">
              &times;
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const TabSelector = ({ activeTab, setActiveTab, isMobile, tabs, tabLabels }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const btn = container.querySelector(`[data-tab-idx="${activeTab}"]`);
      if (btn) {
        const offsetLeft = btn.offsetLeft;
        const width = btn.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({
          left: offsetLeft - (containerWidth / 2) + (width / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab]);

  const handleSelect = (idx) => {
    triggerHaptic('tabSwitch');
    setActiveTab(idx);
  };

  return (
    <div
      ref={containerRef}
      className={isMobile ? "hide-scrollbar" : ""}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        maxWidth: '100%',
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        padding: isMobile ? '4px 2px 8px 2px' : '4px',
        margin: '0',
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        justifyContent: isMobile ? 'flex-start' : 'center',
        scrollSnapType: isMobile ? 'x proximity' : 'none',
      }}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === idx;
        const TabIcon = tab.icon;
        const tabTitle = toUiLabelCase(
          isMobile
            ? (tab.short || tab.title || (tabLabels && tabLabels[tab.id]?.short) || tab.id)
            : (tab.title || (tabLabels && tabLabels[tab.id]?.title) || tab.id)
        );

        return (
          <motion.button
            key={tab.id}
            data-tab-idx={idx}
            onClick={() => handleSelect(idx)}
            whileHover={{ scale: 1.015, y: -1.5 }}
            whileTap={{ scale: 0.98, y: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isActive ? '6px 12px 8px 12px' : '7px 12px 7px 12px',
              background: isActive ? '#ffffff' : `${tab.color}10`,
              color: tab.color,
              border: `2px solid ${tab.color}${isActive ? '' : '35'}`,
              borderBottom: isActive ? `5px solid ${tab.color}` : `2px solid ${tab.color}35`,
              borderRadius: '12px',
              fontFamily: '"Sniglet", "Coming Soon", cursive',
              fontSize: isMobile ? '0.82rem' : '0.86rem',
              fontWeight: '400',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? `0 6px 16px ${tab.color}20` : `0 2px 4px ${tab.color}05`,
              scrollSnapAlign: 'start',
              flexShrink: 0,
            }}
          >
            <TabIcon size={isMobile ? 14 : 15} strokeWidth={2.4} />
            <span>{tabTitle}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

