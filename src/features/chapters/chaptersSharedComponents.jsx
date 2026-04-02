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
  Pin
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
 
export const ChapterRow = ({ chapter, volumeNumber, index, isMobile, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks, t, uiLanguage = 'en', getReadTierFn }) => {
  const finished = isFinished?.(chapter.number);
  const readCount = getReadCount?.(chapter.number) || 0;
  const tier = getReadTierFn(readCount, uiLanguage);
  
  // Use Volume-specific theme
  const theme = VOL_THEMES[volumeNumber || 1] || VOL_THEMES[1];
  
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
    fontWeight: '900',
    border: `2px solid ${border || 'rgba(0,0,0,0.2)'}`,
    borderBottom: `4px solid ${border || 'rgba(0,0,0,0.3)'}`,
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
      initial={{ opacity: 0, y: 30, scale: 0.9, rotate: (index % 2 === 0 ? -2 : 2) }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: (index % 2 === 0 ? -0.5 : 0.5) }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 500, damping: 15 }}
      whileHover={{ 
        scale: 1.03, 
        y: -10, 
        zIndex: 10,
        boxShadow: `0 12px 32px ${theme.shadow}`,
        transition: { type: 'spring', stiffness: 450, damping: 12 } 
      }}
      whileTap={{ scale: 0.92, y: 8, rotate: index % 2 === 0 ? 1 : -1 }}
      style={getChapterRowStyle(theme, index, finished, isMobile)}
    >
      <CelebrationHearts show={celebrating} />
      <MilestoneEffects count={readCount} tier={tier} color={theme.accent} isMobile={isMobile} />
 
      {finished && (
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15, delay: index * 0.05 + 0.2 }}
          style={{
            position: 'absolute',
            top: '-12px',
            right: '20px',
            zIndex: 15,
            background: tier.bg || '#fff',
            borderRadius: '12px',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: `3px solid ${tier.border || theme.border}`,
            borderBottom: `6px solid ${tier.border || theme.border}`,
            boxShadow: `0 4px 12px ${theme.shadow}`,
          }}
        >
          <Sparkle size={14} strokeWidth={3} style={{ color: tier.text || theme.accent }} />
          <span style={{ color: tier.text || theme.accent, fontSize: '0.75rem', fontWeight: '900', fontFamily: 'var(--font-main)', lineHeight: 1.2 }}>
            {tier.label ? `${tier.label} • ${readCount}×` : `${readCount}×`}
          </span>
        </motion.div>
      )}
 
      <div style={{ 
        width: isMobile ? '44px' : '52px', 
        height: isMobile ? '44px' : '52px', 
        borderRadius: '16px', 
        background: theme.bg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexShrink: 0, 
        border: `3px solid ${theme.border}`,
        borderBottom: `6px solid ${theme.border}`,
        boxShadow: `0 4px 0 rgba(0,0,0,0.1)`,
      }}>
        <span style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: '400', color: theme.accent }}>{chapterBadge}</span>
      </div>
 
      <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {chapterTitle && (
          <span style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '1rem' : '1.1rem', color: '#111827', fontWeight: '900', lineHeight: 1.2 }}>
            {chapterTitle}
          </span>
        )}
        {chapter.latest && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ 
              width: 'fit-content',
              fontSize: '0.65rem', 
              fontFamily: 'var(--font-main)', 
              fontWeight: '900', 
              color: '#dc2626', 
              background: '#fee2e2', 
              border: '2px solid #ef4444',
              borderBottom: '4px solid #ef4444',
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
            whileHover={cooldown > 0 ? {} : { scale: 1.05, y: -4, rotate: 2 }}
            whileTap={cooldown > 0 ? {} : { scale: 0.85, y: 8, rotate: -2 }}
            onClick={handleIncrement}
            disabled={cooldown > 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: isMobile ? '0.8rem' : '0.85rem',
              color: cooldown > 0 ? '#94a3b8' : theme.accent,
              background: cooldown > 0 ? '#f1f5f9' : theme.surface,
              padding: isMobile ? '8px 16px' : '10px 20px',
              borderRadius: '14px',
              fontFamily: 'var(--font-main)',
              fontWeight: '900',
              border: `3px solid ${cooldown > 0 ? '#cbd5e1' : theme.border}`,
              borderBottom: cooldown > 0 ? '3px solid #cbd5e1' : `8px solid ${theme.border}`,
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              boxShadow: cooldown > 0 ? 'none' : `0 6px 16px ${theme.shadow}`,
              opacity: cooldown > 0 ? 0.7 : 1,
            }}
          >
            {cooldown > 0 ? <Timer size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
            {cooldown > 0 ? `${cooldown}${t.secondsUnit || 's'}` : t.plusRead}
          </motion.button>
        )}
        {chapter.readInApp && chapter.pages && chapter.pages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05, y: -4, rotate: -2 }}
            whileTap={{ scale: 0.85, y: 8, rotate: 2 }}
            onClick={() => onReadChapter && onReadChapter(chapter)}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: isMobile ? '0.8rem' : '0.85rem', 
              color: '#fff', 
              background: '#059669', 
              padding: isMobile ? '8px 16px' : '10px 20px', 
              borderRadius: '14px', 
              fontFamily: 'var(--font-main)', 
              fontWeight: '900', 
              border: '3px solid #065f46', 
              borderBottom: '8px solid #064e3b',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(5, 150, 105, 0.2)'
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
            fontWeight: '900',
            border: `3px solid ${theme.border}`,
            borderBottom: `6px solid ${theme.border}`
          }}>
            <Timer size={14} strokeWidth={3} /> {formatTime(linkTimeLeft)}
            <button 
              onClick={() => cancelExternalLink?.(chapter.number)} 
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0 0 4px', fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center' }} 
              title="Cancel"
            >
              &times;
            </button>
          </div>
        )}
      </div>
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

  const handleSelect = (idx) => {
    triggerHaptic('tabSwitch');
    setActiveVol(idx);
    
    // Smoothly scroll the selected button into view if possible
    const container = containerRef.current;
    if (container) {
      const btn = container.querySelector(`[data-vol-idx="${idx}"]`);
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
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0' }}>
      <div 
        ref={containerRef}
        className="hide-scrollbar"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '8px' : '10px', 
          padding: '10px 20px 20px 20px',
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
                background: '#ffffff',
                color: theme.accent,
                border: `3.5px solid ${theme.accent}`,
                borderBottom: isActive ? `8px solid ${theme.accent}` : `4px solid ${theme.accent}`,
                borderRadius: '16px',
                fontFamily: 'var(--font-paper)',
                fontSize: isMobile ? '1.35rem' : '1.45rem',
                fontWeight: '900',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border-bottom-width 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.2s',
                boxShadow: isActive ? `0 6px 16px ${theme.accent}15` : '0 4px 10px rgba(0,0,0,0.05)',
                transform: isActive ? 'translateY(-4px)' : 'none'
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
