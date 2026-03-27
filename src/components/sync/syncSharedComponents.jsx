import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
import { HOVER_SCALE_TAB, TAP_SCALE_DEFAULT, TAP_SCALE_TAB, PRESS_SPRING, ENTER_SPRING, JELLY_TAP, JELLY_HOVER, SQUASH_TRANSITION } from '../shared/animationPresets';
import { triggerHaptic } from '../../utils/haptics';

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
      size: 10 + Math.random() * 8,
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 1400);
    return () => clearTimeout(timer);
  }, [show]);
  return particles.map(p => (
    <span key={p.id} className="heart-float" style={{ left: `${p.left}%`, bottom: '100%', fontSize: `${p.size}px`, animationDelay: `${p.animDelay}s` }}>{p.emoji}</span>
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
      const size = Math.random() * 8 + 8;

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

  if (!count || count < 2 || numParticles <= 0) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden', borderRadius: '8px' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
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
            filter: tier ? `drop-shadow(0 0 3px ${tier.border})` : 'none',
          }}
        >
          <p.Icon size={p.size} />
        </motion.div>
      ))}
    </div>
  );
};

export const ListRow = ({ index, finished, readCount, noteColor, customNote, tierBorder, tierBg, tierText, tierAccent, numberLine1, numberLine2, title, subtitle, rightContent, onClick, style, isMobile = false }) => {
  const note = customNote || NOTE_PALETTES[noteColor % NOTE_PALETTES.length];

  const quirkRotate = ((index * 7 + 3) % 5 - 2) * 0.4;
  const quirkRadius = `${6 + (index % 3) * 2}px ${8 + (index % 2)}px ${5 + (index % 4)}px ${7 + (index % 5)}px`;

  return (
    <motion.div
      className="paper-interact"
      initial={{ opacity: 0, y: 18, rotate: (index % 3 - 1) * 1.5, scale: 0.95 }}
      animate={finished ? { opacity: 1, y: 0, rotate: quirkRotate, scale: [1, 1.04, 0.99, 1] } : { opacity: 1, y: 0, rotate: quirkRotate }}
      transition={finished ? { delay: index * 0.04, ...ENTER_SPRING } : { delay: index * 0.035, type: 'spring', stiffness: 280, damping: 18 }}
      whileHover={!isMobile && onClick ? { scale: 1.025, y: -4, rotate: 0, boxShadow: `0 8px 22px ${note.border}45`, transition: { type: 'spring', stiffness: 300, damping: 16 } } : {}}
      whileTap={onClick ? { ...JELLY_TAP, transition: SQUASH_TRANSITION } : {}}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: isMobile ? '10px' : '14px',
        padding: isMobile ? '14px 12px' : '13px 18px',
        background: note.bg,
        borderRadius: quirkRadius,
        border: `1.5px solid ${note.border}80`,
        borderBottom: `3.5px solid ${note.border}`,
        boxShadow: finished ? `0 3px 10px ${note.border}55` : `0 2px 6px ${note.border}20`,
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
          background: `linear-gradient(135deg, ${note.border}40, ${note.border}80)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: `2px solid ${note.border}`,
        }}
      >
        {numberLine1 && <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: 'bold', color: note.accent, lineHeight: 1 }}>{numberLine1}</span>}
        {numberLine2 && <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.85rem' : '1.1rem', fontWeight: 'bold', color: note.accent, lineHeight: 1 }}>{numberLine2}</span>}
      </motion.div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.9rem' : '1.05rem', color: '#374151', fontWeight: 'bold', lineHeight: 1.2, whiteSpace: 'normal' }}>{title}</span>
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
    fontSize: isMobile ? '0.75rem' : '0.76rem',
    color: '#fff',
    background: bg,
    padding: isMobile ? '6px 10px' : '4px 10px',
    borderRadius: '9999px',
    textDecoration: 'none',
    fontFamily: 'var(--font-hand)',
    fontWeight: 'bold',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    flexShrink: 0,
    whiteSpace: 'nowrap',
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
      animate={finished ? { opacity: 1, scale: [1, 1.03, 1], y: 0, rotate: quirkRotate } : { opacity: 1, scale: 1, y: 0, rotate: quirkRotate }}
      transition={{ delay: index * 0.02, type: 'spring', stiffness: 280, damping: 22 }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: isMobile ? '8px' : '12px',
        padding: isMobile ? '12px 10px' : '12px 14px',
        background: '#fff',
        borderRadius: quirkRadius,
        border: '1.5px solid #e5e7eb',
        borderLeft: `4px solid ${note.accent}`,
        boxShadow: finished ? `0 2px 8px ${note.border}40` : '0 1px 2px rgba(0,0,0,0.05)',
        overflow: 'visible',
        width: '100%',
      }}
    >

      <CelebrationHearts show={celebrating} />
      <MilestoneEffects count={readCount} tier={tier} color={note.accent} isMobile={isMobile} />

      {finished && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={readCount >= 2 ? { y: 0, opacity: 1, scale: [1, 1.15, 1], rotate: [0, -6, 6, -3, 3, 0] } : { y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20, delay: index * 0.04 + 0.1, duration: 0.6 }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 5,
            pointerEvents: 'none',
            background: tier.bg,
            borderRadius: '0 6px 0 8px',
            padding: isMobile ? '2px 6px 3px 8px' : '2px 8px 4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            boxShadow: `0 2px 4px ${tier.border}30`,
          }}
        >
          <span style={{ color: tier.text, fontSize: isMobile ? '0.55rem' : '0.62rem', fontWeight: 'bold', fontFamily: 'var(--font-hand)', lineHeight: 1 }}>
            {tier.label ? `${tier.label} - ${readCount || 1}×` : `${readCount || 1}×`}
          </span>
        </motion.div>
      )}

      <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#6b7280', fontWeight: 'bold', flexShrink: 0 }}>{chapter.number} - </span>
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.74rem' : '0.85rem', color: '#374151', fontWeight: 'bold', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2 }}>{chapter.title}</span>
      </div>

      <div style={{ display: 'flex', gap: '4px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
        {!comingSoon && (
          <motion.button
            whileHover={cooldown > 0 ? {} : { ...JELLY_HOVER, transition: { type: 'spring', stiffness: 400, damping: 12 } }}
            whileTap={cooldown > 0 ? {} : { ...JELLY_TAP, transition: SQUASH_TRANSITION }}
            onClick={handleIncrement}
            disabled={cooldown > 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: isMobile ? '0.75rem' : '0.76rem',
              color: cooldown > 0 ? '#9ca3af' : note.accent,
              background: cooldown > 0 ? '#f3f4f6' : `${note.border}30`,
              padding: isMobile ? '6px 10px' : '4px 10px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontFamily: 'var(--font-hand)',
              fontWeight: 'bold',
              border: `1.5px solid ${cooldown > 0 ? '#d1d5db' : note.border}`,
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: cooldown > 0 ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
              opacity: cooldown > 0 ? 0.7 : 1,
            }}
          >
            {cooldown > 0 ? `⏳ ${cooldown}s` : plusReadLabel}
          </motion.button>
        )}

        {false && chapter.pages && chapter.pages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={TAP_SCALE_DEFAULT}
            onClick={() => onReadChapter?.(chapter)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '0.75rem' : '0.76rem', color: '#fff', background: '#10b981', padding: isMobile ? '6px 10px' : '4px 10px', borderRadius: '9999px', textDecoration: 'none', fontFamily: 'var(--font-hand)', fontWeight: 'bold', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '0.7rem' : '0.72rem', color: note.accent, background: `${note.border}30`, padding: '4px 8px', borderRadius: '8px', fontFamily: 'var(--font-hand)', fontWeight: 'bold', marginLeft: '4px' }}>
            ⏳ {formatTime(linkTimeLeft)}
            <button onClick={() => cancelExternalLink?.(chapter.number)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0 0 4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '2px' }} title="Cancel timer">
              &times;
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const TabSelector = ({ activeTab, setActiveTab, isMobile, tabs }) => (
  <div
    className="hide-scrollbar"
    style={{
      display: 'flex',
      gap: isMobile ? '6px' : '6px',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      overflowX: 'auto',
      overflowY: 'visible',
      padding: '4px 4px 6px 4px',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      scrollPaddingInline: '8px',
    }}
  >
    {tabs.map((tab, idx) => {
      const isActive = idx === activeTab;
      const c = tab.color;
      const Icon = tab.icon;
      return (
        <motion.button
          key={tab.id}
          onClick={() => { triggerHaptic('tabSwitch'); setActiveTab(idx); }}
          whileHover={{ ...HOVER_SCALE_TAB, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
          whileTap={{ scale: 0.9, transition: PRESS_SPRING }}
          style={{
            minWidth: isMobile ? '70px' : '100px',
            minHeight: isMobile ? '46px' : '46px',
            borderRadius: '7px',
            border: isActive ? `2px solid ${c}` : '1.5px solid #e5e7eb',
            background: isActive ? `${c}15` : '#fafafa',
            cursor: 'pointer',
            padding: isMobile ? '6px 10px' : '7px 10px',
            fontFamily: 'var(--font-hand)',
            fontWeight: 'bold',
            color: isActive ? c : '#b0b5bc',
            flexShrink: 0,
            transition: 'all 0.15s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            lineHeight: 1.2,
            overflow: 'visible',
            margin: '0 1px',
          }}
        >
          <Icon size={isMobile ? 12 : 14} style={{ opacity: isActive ? 1 : 0.65 }} />
          <span style={{ fontSize: isMobile ? '0.65rem' : '0.8rem', lineHeight: 1.2 }}>{tab.title}</span>
        </motion.button>
      );
    })}
  </div>
);
