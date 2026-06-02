import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked,
  Globe,
  Languages,
  Sparkle,
  Star,
  Heart,
  Crown,
  Gem,
  Dog,
  Cat,
  Music,
  Coffee,
  Gift,
  Pizza,
  Rabbit,
  Bird,
  Fish,
  PawPrint,
  Timer,
  Plus,
  ChevronDown,
  Pin,
  Pencil,
  StickyNote
} from 'lucide-react';
import { VOLUMES, VOL_COLORS } from '../../data/chapters';
import { TAP_SCALE_DEFAULT, HOVER_SCALE_TAB, TAP_SCALE_TAB, PRESS_SPRING, ENTER_SPRING, JELLY_TAP, JELLY_HOVER, SQUASH_TRANSITION } from '../../components/shared/animationPresets';
import { triggerHaptic } from '../../utils/haptics';
import {
  VOL_THEMES,
  getChapterRowStyle,
  getNavButtonStyle,
  getVolSelectorButtonStyle,
} from './chapterStyles';
import { getChapterDisplayTitle } from '../../data/chapterTitles';

void motion;
 
// Floating celebration hearts on +1 read
const CelebrationHearts = ({ show }) => {
  const [particles, setParticles] = useState([]);
 
  useEffect(() => {
    if (!show) return;
    const emojis = ['💗', '✨', '💖', '⭐', '💕'];
    const newParticles = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: 30 + Math.random() * 40,
      animDelay: i * 0.08,
      size: 20 + Math.random() * 14,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 1400);
    return () => clearTimeout(timer);
  }, [show]);
 
  return particles.map(p => (
    <span
      key={p.id}
      className="heart-float"
      style={{
        left: `${p.left}%`,
        bottom: '100%',
        fontSize: `${p.size}px`,
        animationDelay: `${p.animDelay}s`,
        zIndex: 100,
        textShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}
    >
      {p.emoji}
    </span>
  ));
};
 
const MilestoneEffects = ({ count, tier, color, isMobile }) => {
  let numParticles = 0;
  let shapes = [Sparkle];
  if (count >= 100) {
    numParticles = 25;
    shapes = [Sparkle, Gem, Crown, Heart, Star, Cat, Dog, Music, Gift, Pizza, Rabbit, Bird, Fish, PawPrint];
  } else if (count >= 50) {
    numParticles = 16;
    shapes = [Sparkle, Star, Heart, Cat, Dog, Music, Coffee, Rabbit, Bird];
  } else if (count >= 20) {
    numParticles = 10;
    shapes = [Sparkle, Star, Cat, Dog, Music, Rabbit];
  } else if (count >= 5) {
    numParticles = 6;
    shapes = [Sparkle, Star, Heart, Bird];
  } else {
    numParticles = 3;
    shapes = [Sparkle, Star];
  }
 
  if (isMobile) {
    numParticles = Math.max(0, Math.floor(numParticles * 0.45));
  }
 
  const particles = useMemo(() => {
    return Array.from({ length: numParticles }).map((_, i) => {
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomDelay = Math.random() * 3;
      const randomDuration = 2 + Math.random() * 3;
      const Icon = shapes[i % shapes.length];
      const size = Math.random() * 8 + 10;
 
      return {
        id: i,
        Icon,
        size,
        x: randomX,
        y: randomY,
        delay: randomDelay,
        duration: randomDuration,
        targetScale: 0.8 + Math.random() * 0.7,
        targetY: -15 - Math.random() * 25,
        targetRotate: (Math.random() - 0.5) * 120,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
 
  if (count < 2 || numParticles <= 0) return null;
 
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden', borderRadius: '18px' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0, p.targetScale, 0],
            y: [0, p.targetY],
            rotate: [0, p.targetRotate],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: color || tier.accent || tier.border,
            filter: `drop-shadow(0 0 4px ${tier.border})`,
          }}
        >
          <p.Icon size={p.size} strokeWidth={3} />
        </motion.div>
      ))}
    </div>
  );
};
 
export const ChapterRow = ({ chapter, volumeNumber, index, isMobile, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks, t, uiLanguage = 'en', getReadTierFn, noteText = '', onSaveNote }) => {
  const finished = isFinished?.(chapter.number);
  const readCount = getReadCount?.(chapter.number) || 0;
  const tier = getReadTierFn(readCount, uiLanguage);
  
  // Use Volume-specific theme
  const theme = VOL_THEMES[volumeNumber || 1] || VOL_THEMES[1];

  const [showNoteInput, setShowNoteInput] = useState(false);
  
  const jpLinks = chapter.links.jp || [];
  const comingSoon = !chapter.links.en && jpLinks.length === 0;
  const rawChapterBadge = chapter.badge ?? chapter.displayNumber ?? chapter.number;
  const chapterBadge = (typeof rawChapterBadge === 'string' || typeof rawChapterBadge === 'number')
    ? rawChapterBadge
    : (typeof rawChapterBadge?.number === 'string' || typeof rawChapterBadge?.number === 'number')
      ? rawChapterBadge.number
      : '';
  const chapterTitle = getChapterDisplayTitle(chapter, uiLanguage);
 
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
 
  const linkStyle = (bg, border) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: isMobile ? '0.75rem' : '0.8rem',
    color: '#fff',
    background: bg,
    padding: isMobile ? '6px 14px' : '6px 16px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontFamily: 'var(--font-main)',
    fontWeight: '400',
    border: `2px solid ${border || 'rgba(0,0,0,0.2)'}`,
    borderBottom: `3px solid ${border || 'rgba(0,0,0,0.3)'}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  });
 
  const pendingStart = pendingLinks?.[chapter.number];
  const [linkTimeLeft, setLinkTimeLeft] = useState(0);
 
  useEffect(() => {
    if (!pendingStart) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      initial={{ opacity: 0, y: 8, scale: 0.98, rotate: (index % 2 === 0 ? -0.2 : 0.2) }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 500, damping: 25 }}
      whileHover={{ 
        scale: 1.015, 
        y: -1.5, 
        zIndex: 10,
        boxShadow: `0 8px 24px ${theme.shadow}`,
        transition: { type: 'spring', stiffness: 450, damping: 15 } 
      }}
      whileTap={{ scale: 0.98, y: 0.5 }}
      style={getChapterRowStyle(theme, index, finished, isMobile)}
    >
      <CelebrationHearts show={celebrating} />
      <MilestoneEffects count={readCount} tier={tier} color={theme.accent} isMobile={isMobile} />
 
    {finished && (
      <motion.div
        initial={{ y: -6, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25, delay: index * 0.04 + 0.1 }}
        style={{
          position: 'absolute',
          top: '-12px',
          right: '20px',
          zIndex: 15,
          background: `var(--themed-card-bg, ${tier.bg || '#fff'})`,
          borderRadius: '12px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: `2px solid var(--themed-card-border, ${tier.border || theme.border})`,
          borderBottom: `4px solid var(--themed-card-border, ${tier.border || theme.border})`,
          boxShadow: `0 4px 12px ${theme.shadow}`,
        }}
      >
        <Sparkle size={14} strokeWidth={3} style={{ color: tier.text || theme.accent }} />
        <span style={{ color: `var(--themed-text-secondary, ${tier.text || theme.accent})`, fontSize: '0.75rem', fontWeight: '400', fontFamily: 'var(--font-main)', lineHeight: 1.2 }}>
            {tier.label ? `${tier.label} • ${readCount}×` : `${readCount}×`}
          </span>
        </motion.div>
      )}
 
    <div style={{ 
      width: isMobile ? '44px' : '52px', 
      height: isMobile ? '44px' : '52px', 
      borderRadius: '16px', 
      background: `var(--themed-card-inactive-bg, ${theme.bg})`, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexShrink: 0, 
      border: `2.5px solid var(--themed-card-border, ${theme.border})`,
      borderBottom: `4.5px solid var(--themed-card-border, ${theme.border})`,
      boxShadow: `0 3px 0 rgba(0,0,0,0.1)`,
    }}>
      <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: '400', color: `var(--themed-badge-text, ${theme.accent})` }}>{chapterBadge}</span>
    </div>
 
    <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {chapterTitle && (
        <span style={{ 
          fontFamily: 'Sniglet, var(--font-main)', 
          fontSize: isMobile ? '1rem' : '1.1rem', 
          color: `var(--themed-text-primary, ${theme.accent})`, 
          fontWeight: '400', 
          lineHeight: 1.2,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {chapterTitle}
          {noteText && (
            <StickyNote 
              size={isMobile ? 14 : 16} 
              strokeWidth={3} 
              style={{ 
                color: 'var(--note-text, #d97706)',
                flexShrink: 0,
                transform: 'rotate(-8deg)',
                filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))'
              }} 
              title={t.chapterNote || "Chapter has notes"}
            />
          )}
        </span>
      )}
      {chapter.latest && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ 
            width: 'fit-content',
            fontSize: '0.65rem', 
            fontFamily: 'var(--font-main)', 
            fontWeight: '400', 
            color: '#dc2626', 
            background: '#fee2e2', 
            border: '1.5px solid #ef4444',
            borderBottom: '3px solid #ef4444',
            padding: '2px 10px', 
            borderRadius: '9999px', 
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Plus size={10} strokeWidth={4} /> {t.latest}
        </motion.div>
      )}
    </div>
 
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
      {!comingSoon && (
        <motion.button
          className="no-override"
          whileHover={cooldown > 0 ? {} : { scale: 1.015, y: -1, rotate: 0.5 }}
          whileTap={cooldown > 0 ? {} : { scale: 0.98, y: 0.5 }}
          onClick={handleIncrement}
          disabled={cooldown > 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: isMobile ? '0.8rem' : '0.85rem',
            color: cooldown > 0 ? 'var(--themed-text-muted, #94a3b8)' : 'var(--themed-button-text, ' + theme.accent + ')',
            background: cooldown > 0 ? 'var(--themed-button-disabled-bg, #f1f5f9)' : 'var(--themed-card-inactive-bg, ' + theme.surface + ')',
            padding: isMobile ? '6px 14px' : '8px 18px',
            borderRadius: '12px',
            fontFamily: 'var(--font-main)',
            fontWeight: '400',
            border: `2px solid ${cooldown > 0 ? 'var(--themed-card-inactive-border, #cbd5e1)' : 'var(--themed-card-border, ' + theme.border + ')'}`,
            borderBottom: cooldown > 0 ? '2.5px solid var(--themed-card-inactive-border, #cbd5e1)' : `4.5px solid var(--themed-card-border, ${theme.border})`,
            cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
            boxShadow: cooldown > 0 ? 'none' : `0 4px 12px ${theme.shadow}`,
            opacity: cooldown > 0 ? 0.7 : 1,
          }}
        >
          {cooldown > 0 ? <Timer size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
          {cooldown > 0 ? `${cooldown}${t.secondsUnit || 's'}` : t.plusRead}
        </motion.button>
      )}
      {chapter.readInApp && chapter.pages && chapter.pages.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.015, y: -1, rotate: -0.5 }}
          whileTap={{ scale: 0.98, y: 0.5 }}
          onClick={() => onReadChapter && onReadChapter(chapter)}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: isMobile ? '0.8rem' : '0.85rem', 
            color: '#fff', 
            background: 'var(--pop-green, #059669)', 
            padding: isMobile ? '6px 14px' : '8px 18px', 
            borderRadius: '12px', 
            fontFamily: 'var(--font-main)', 
            fontWeight: '400', 
            border: '2px solid var(--themed-card-border, #065f46)', 
            borderBottom: '4.5px solid var(--themed-card-border, #064e3b)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)'
          }}
        >
            <BookMarked size={16} strokeWidth={3} /> {t.readInApp || 'Read'}
          </motion.button>
        )}
        
        {jpLinks.length === 1 && (
          <motion.a 
            href={jpLinks[0]} target="_blank" rel="noopener noreferrer" 
            onClick={() => trackExternalLink?.(chapter.number)} 
            whileHover={{ scale: 1.1, y: -4, rotate: 5 }}
            whileTap={{ scale: 0.85, y: 6 }}
            style={linkStyle('var(--pop-pink)', '#be185d')}
          >
            <Languages size={14} strokeWidth={3} /> JP
          </motion.a>
        )}
        {jpLinks.length > 1 && jpLinks.map((link, i) => (
          <motion.a 
            key={i} href={link} target="_blank" rel="noopener noreferrer" 
            onClick={() => trackExternalLink?.(chapter.number)} 
            whileHover={{ scale: 1.1, y: -4, rotate: 5 }}
            whileTap={{ scale: 0.85, y: 6 }}
            style={linkStyle('var(--pop-pink)', '#be185d')}
          >
            <Languages size={14} strokeWidth={3} /> {i + 1}
          </motion.a>
        ))}
      {!comingSoon && (
        <motion.button
          className="no-override"
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('tap');
            setShowNoteInput(!showNoteInput);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? '32px' : '36px',
            height: isMobile ? '32px' : '36px',
            borderRadius: '12px',
            background: noteText ? 'var(--note-bg)' : 'var(--themed-card-inactive-bg, var(--surface-card))',
            color: noteText ? 'var(--note-text)' : 'var(--themed-badge-text, ' + theme.accent + ')',
            border: `2px solid ${noteText ? 'var(--note-border-bottom)' : 'var(--themed-card-border, ' + theme.border + ')'}`,
            borderBottom: noteText ? '4px solid var(--note-border-bottom)' : `4.5px solid ${theme.border}`,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            position: 'relative',
          }}
          title={t.chapterNote || 'Write a note'}
        >
          <Pencil size={15} strokeWidth={2.5} />
          {noteText && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: '#ef4444',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              border: '1.5px solid #fff',
            }} />
          )}
        </motion.button>
      )}
      {linkTimeLeft > 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontSize: '0.75rem', 
          color: theme.accent, 
          background: '#fff', 
          padding: '6px 12px', 
          borderRadius: '12px', 
          fontFamily: 'var(--font-main)', 
          fontWeight: '400',
          border: `2px solid ${theme.border}`,
          borderBottom: `4.5px solid ${theme.border}`
        }}>
          <Timer size={14} strokeWidth={3} /> {formatTime(linkTimeLeft)}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              cancelExternalLink?.(chapter.number);
            }} 
            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0 0 4px', fontSize: '1.1rem', fontWeight: 400, display: 'flex', alignItems: 'center' }} 
            title="Cancel"
          >
            &times;
          </button>
        </div>
      )}
      </div>

      <AnimatePresence>
        {showNoteInput && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ width: '100%', overflow: 'hidden', zIndex: 5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              background: 'var(--note-bg)',
              border: '2px solid var(--note-border)',
              borderBottom: '4px solid var(--note-border-bottom)',
              borderRadius: '16px',
              padding: isMobile ? '10px 12px' : '12px 16px',
              position: 'relative',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.05)',
              transform: 'rotate(-0.5deg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxSizing: 'border-box',
            }}>
              {/* Scrapbook pin/tape deco */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%) rotate(1deg)',
                width: '60px',
                height: '18px',
                background: 'rgba(255,255,255,0.4)',
                backdropFilter: 'blur(1.5px)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px dashed rgba(0,0,0,0.1)',
                zIndex: 2,
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{
                  fontFamily: 'var(--font-paper)',
                  fontSize: '0.8rem',
                  color: 'var(--note-text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Pin size={12} strokeWidth={3} style={{ transform: 'rotate(45deg)' }} />
                  {t.myNotes || 'My notes'}
                </span>
                  {noteText && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveNote?.(chapter.number, '');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--note-text)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-main)',
                      padding: 0,
                      textDecoration: 'underline',
                      opacity: 0.8,
                    }}
                  >
                    {t.clearNote || 'Clear'}
                  </button>
                )}
              </div>

              <textarea
                value={noteText}
                onChange={(e) => onSaveNote?.(chapter.number, e.target.value)}
                placeholder={t.writeNotePlaceholder || 'Jot down some thoughts about this chapter...'}
                rows={3}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'var(--font-paper)',
                  fontSize: '0.88rem',
                  lineHeight: '1.4',
                  color: 'var(--note-text)',
                  padding: '4px 0',
                  margin: 0,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
 
export const NavBtn = ({ onClick, disabled, volumeNumber, children, isMobile }) => {
  const theme = VOL_THEMES[volumeNumber || 1] || VOL_THEMES[1];
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.1, y: -4, rotate: children?.props?.name === 'chevron-left' ? -5 : 5 } : {}}
      whileTap={!disabled ? { scale: 0.85, y: 8 } : {}}
      style={getNavButtonStyle(theme, disabled, isMobile)}
    >
      {children}
    </motion.button>
  );
};
 
export const VolSelector = ({ activeVol, setActiveVol, isMobile, uiLanguage }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const btn = container.querySelector(`[data-vol-idx="${activeVol}"]`);
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
  }, [activeVol]);

  const handleSelect = (idx) => {
    triggerHaptic('tabSwitch');
    setActiveVol(idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0', maxWidth: isMobile ? 'calc(100% - 100px)' : 'calc(100% - 160px)', minWidth: 0 }}>
      <div 
        ref={containerRef}
        className="hide-scrollbar"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '6px' : '8px', 
          padding: '6px 12px 12px 12px',
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          maxWidth: '100%',
        }}
      >
        {VOLUMES.map((vol, idx) => {
          const isActive = idx === activeVol;
          const theme = VOL_THEMES[vol.number] || VOL_THEMES[1];
          
          return (
            <motion.button
              key={vol.number}
              className="volume-selector-button no-override"
              data-vol-idx={idx}
              onClick={() => handleSelect(idx)}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.9, y: 4 }}
              style={{
                flexShrink: 0,
                width: isMobile ? '48px' : '52px',
                height: isMobile ? '48px' : '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--themed-card-bg, #ffffff)',
                color: 'var(--themed-badge-text, ' + theme.accent + ')',
                border: `2.5px solid var(--themed-badge-text, ${theme.accent})`,
                borderBottom: isActive ? `6px solid var(--themed-badge-text, ${theme.accent})` : `3.5px solid var(--themed-badge-text, ${theme.accent})`,
                borderRadius: '16px',
                fontFamily: '"Coming Soon", var(--font-main)',
                fontSize: isMobile ? '1.35rem' : '1.45rem',
                fontWeight: '400',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border-bottom-width 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.2s',
                boxShadow: isActive ? `0 6px 16px ${theme.accent}15` : '0 4px 10px rgba(0,0,0,0.05)',
                transform: isActive ? 'translateY(-2px)' : 'none'
              }}
            >
              {vol.number}
              {isActive && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: theme.accent,
                    color: '#ffffff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 2
                  }}
                >
                  ✦
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
