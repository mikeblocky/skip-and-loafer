import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { VOLUMES, VOL_COLORS } from '../../data/chapters';
import { TAP_SCALE_DEFAULT, HOVER_SCALE_TAB, TAP_SCALE_TAB } from '../shared/animationPresets';

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

  if (count < 2 || numParticles <= 0) return null;

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
            filter: `drop-shadow(0 0 3px ${tier.border})`,
          }}
        >
          <p.Icon size={p.size} />
        </motion.div>
      ))}
    </div>
  );
};

export const ChapterRow = ({ chapter, index, isMobile, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks, t, uiLanguage = 'en', getReadTierFn, notePalettes }) => {
  const finished = isFinished?.(chapter.number);
  const readCount = getReadCount?.(chapter.number) || 0;
  const tier = getReadTierFn(readCount, uiLanguage);
  const note = notePalettes[index % notePalettes.length];
  const jpLinks = chapter.links.jp || [];

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

  const handleIncrement = () => {
    if (cooldown > 0) return;
    incrementReadCount?.(chapter.number);
    setCooldown(60);
  };

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
      initial={{ opacity: 0, y: 10, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
      animate={finished ? { opacity: 1, y: 0, rotate: 0, scale: [1, 1.02, 1] } : { opacity: 1, y: 0, rotate: 0 }}
      transition={finished ? { delay: index * 0.04, duration: 0.5 } : { delay: index * 0.04, duration: 0.3, type: 'spring', stiffness: 200 }}
      whileHover={!isMobile ? { scale: 1.015, y: -2, boxShadow: `0 4px 12px ${note.border}60` } : {}}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: isMobile ? '10px' : '14px',
        padding: isMobile ? '14px 12px' : '13px 18px',
        background: note.bg,
        border: `1.5px solid ${note.border}80`,
        borderBottom: `3px solid ${note.border}`,
        boxShadow: finished ? `0 2px 8px ${note.border}60` : `0 2px 5px ${note.border}25`,
        overflow: 'visible',
        width: '100%',
      }}
    >
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
            padding: isMobile ? '3px 8px 4px 10px' : '3px 10px 5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            boxShadow: `0 2px 6px ${tier.border}40`,
          }}
        >
          <span style={{ color: tier.text, fontSize: isMobile ? '0.55rem' : '0.62rem', fontWeight: 'bold', fontFamily: 'var(--font-hand)', lineHeight: 1.2 }}>
            {tier.label ? `${tier.label} - ${readCount || 1}×` : `${readCount || 1}×`}
          </span>
        </motion.div>
      )}

      <div style={{ position: 'absolute', top: '-1px', left: isMobile ? '12px' : '18px', width: isMobile ? '22px' : '30px', height: isMobile ? '8px' : '10px', background: `${note.border}50`, borderRadius: '0 0 3px 3px' }} />

      <motion.div
        animate={finished ? { rotate: [0, -10, 10, -5, 5, 0] } : { boxShadow: [`0 0 0px ${note.accent}00`, `0 0 8px ${note.accent}40`, `0 0 0px ${note.accent}00`] }}
        transition={finished ? { duration: 0.6, delay: index * 0.04 + 0.2 } : { duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
        style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${note.border}40, ${note.border}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${note.border}` }}
      >
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.78rem' : '1rem', fontWeight: 'bold', color: note.accent }}>{chapter.number}</span>
      </motion.div>

      <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.74rem' : '0.92rem', color: '#374151', fontWeight: 'bold', lineHeight: 1.3, whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {chapter.title}
        </span>
        {chapter.latest && (
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: isMobile ? '0.5rem' : '0.58rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#dc2626', background: '#fef2f2', border: '1.5px solid #fca5a5', padding: '1px 6px', borderRadius: '9999px', whiteSpace: 'nowrap' }}
          >
            ✦ {t.latest}
          </motion.span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '4px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
        <motion.button
          whileHover={cooldown > 0 ? {} : { scale: 1.1 }}
          whileTap={cooldown > 0 ? {} : TAP_SCALE_DEFAULT}
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
            boxShadow: cooldown > 0 ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
            border: `1.5px solid ${cooldown > 0 ? '#d1d5db' : note.border}`,
            cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            opacity: cooldown > 0 ? 0.7 : 1,
          }}
        >
          {cooldown > 0 ? `⏳ ${cooldown}s` : t.plusRead}
        </motion.button>
        {false && chapter.pages && chapter.pages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={TAP_SCALE_DEFAULT}
            onClick={() => onReadChapter && onReadChapter(chapter)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '0.75rem' : '0.76rem', color: '#fff', background: '#10b981', padding: isMobile ? '6px 10px' : '4px 10px', borderRadius: '9999px', textDecoration: 'none', fontFamily: 'var(--font-hand)', fontWeight: 'bold', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
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
            {t.timeLeft}: {formatTime(linkTimeLeft)}
            <button onClick={() => cancelExternalLink?.(chapter.number)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0 0 4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '2px' }} title="Cancel timer">
              &times;
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const NavBtn = ({ onClick, disabled, volColor, children, isMobile }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.1 } : {}}
    whileTap={!disabled ? { scale: 0.92 } : {}}
    style={{
      width: isMobile ? '40px' : '38px',
      height: isMobile ? '40px' : '38px',
      borderRadius: '10px',
      border: `1.5px solid ${disabled ? '#e5e7eb' : volColor + '50'}`,
      background: disabled ? '#f9fafb' : `${volColor}10`,
      cursor: disabled ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.3 : 1,
      color: disabled ? '#9ca3af' : volColor,
      transition: 'all 0.2s',
    }}
  >
    {children}
  </motion.button>
);

export const VolSelector = ({ activeVol, setActiveVol, isMobile, uiLanguage, getVolumeShortWordFn }) => (
  <div className="hide-scrollbar" style={{ display: 'flex', gap: isMobile ? '6px' : '4px', flexWrap: isMobile ? 'wrap' : 'nowrap', overflowX: isMobile ? 'visible' : 'auto', overflowY: 'visible', padding: '6px 2px', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' }}>
    {VOLUMES.map((vol, idx) => {
      const isActive = idx === activeVol;
      const c = VOL_COLORS[vol.number] || '#9ca3af';
      return (
        <motion.button
          key={vol.number}
          onClick={() => setActiveVol(idx)}
          whileHover={HOVER_SCALE_TAB}
          whileTap={TAP_SCALE_TAB}
          style={{
            minWidth: isMobile ? '36px' : '34px',
            height: isMobile ? '46px' : '44px',
            borderRadius: '7px',
            border: isActive ? `2px solid ${c}` : '1.5px solid #e5e7eb',
            background: isActive ? `${c}15` : '#fafafa',
            cursor: 'pointer',
            padding: isMobile ? '4px 0' : '3px 0',
            fontFamily: 'var(--font-hand)',
            fontWeight: 'bold',
            color: isActive ? c : '#b0b5bc',
            flexShrink: 0,
            transition: 'all 0.15s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            lineHeight: 1.2,
            overflow: 'visible',
          }}
        >
          <span style={{ fontSize: isMobile ? '0.55rem' : '0.48rem', opacity: 0.65, lineHeight: 1.2 }}>{getVolumeShortWordFn(uiLanguage)}</span>
          <span style={{ fontSize: isMobile ? '0.9rem' : '0.82rem', lineHeight: 1.2 }}>{vol.number}</span>
        </motion.button>
      );
    })}
  </div>
);
