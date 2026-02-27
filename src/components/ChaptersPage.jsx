/* eslint-disable no-unused-vars */
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Globe, Languages, ChevronLeft, ChevronRight, Tv, BookMarked, Pin, Sparkles, Star, Heart, Crown, Gem, Sparkle, Dog, Cat, Music, Coffee, Gift, Pizza, Rabbit, Bird, Fish, Snail, PawPrint, ShoppingCart } from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter, VOL_COLORS } from '../data/chapters';

const NOTE_PALETTES = [
    { bg: '#fff0f3', border: '#ff9ec6', accent: '#ff6b9d' },  // pink
    { bg: '#eef6ff', border: '#8fd3ff', accent: '#4da6e8' },  // blue
    { bg: '#fefce8', border: '#ffe57f', accent: '#d4a017' },  // yellow
    { bg: '#f0fdf4', border: '#97eba9', accent: '#4ead6b' },  // green
    { bg: '#faf5ff', border: '#c4b5fd', accent: '#8b5cf6' },  // lavender
    { bg: '#fff7ed', border: '#fdba74', accent: '#ea7e30' },  // peach
    { bg: '#ecfeff', border: '#67e8f9', accent: '#0891b2' },  // cyan
];

/* ─── Read count color tiers ─── */
const getReadTier = (count) => {
    if (count >= 100) return { bg: '#0f172a', border: '#fbbf24', text: '#fde047', tint: '#fefce8', accent: '#d97706', label: 'Golden Retriever' };
    if (count >= 90) return { bg: '#be123c', border: '#9f1239', text: '#fff', tint: '#ffe4e6', accent: '#be123c', label: 'Student Council President' };
    if (count >= 80) return { bg: '#0369a1', border: '#075985', text: '#fff', tint: '#e0f2fe', accent: '#0369a1', label: 'Honor Student' };
    if (count >= 70) return { bg: '#0f766e', border: '#115e59', text: '#fff', tint: '#ccfbf1', accent: '#0f766e', label: 'Class Representative' };
    if (count >= 60) return { bg: '#a21caf', border: '#86198f', text: '#fff', tint: '#fae8ff', accent: '#a21caf', label: 'Cultural Festival MVP' };
    if (count >= 50) return { bg: '#ef4444', border: '#dc2626', text: '#fff', tint: '#fee2e2', accent: '#dc2626', label: 'Drama Club Star' };
    if (count >= 40) return { bg: '#4338ca', border: '#3730a3', text: '#fff', tint: '#e0e7ff', accent: '#4338ca', label: 'Karaoke Enthusiast' };
    if (count >= 30) return { bg: '#8b5cf6', border: '#7c3aed', text: '#fff', tint: '#faf5ff', accent: '#7c3aed', label: 'Fraise Customer' };
    if (count >= 20) return { bg: '#ec4899', border: '#db2777', text: '#fff', tint: '#fdf2f8', accent: '#db2777', label: 'Tsubame West VIP' };
    if (count >= 10) return { bg: '#3b82f6', border: '#2563eb', text: '#fff', tint: '#eff6ff', accent: '#2563eb', label: 'Study Group Member' };
    if (count >= 5) return { bg: '#10b981', border: '#059669', text: '#fff', tint: '#ecfdf5', accent: '#059669', label: 'Class 1-3 Student' };
    if (count >= 2) return { bg: '#f97316', border: '#ea580c', text: '#fff', tint: '#fff7ed', accent: '#ea580c', label: 'First Day Transfer' };
    return { bg: '#f59e0b', border: '#d97706', text: '#fff', tint: '#fffbeb', accent: '#d97706', label: '' };
};

/* ─── Milestone Sparkles Overlay ─── */
const MilestoneEffects = ({ count, tier, color }) => {
    let numParticles = 0;
    let shapes = [Sparkles];
    if (count >= 100) { numParticles = 25; shapes = [Sparkle, Gem, Crown, Heart, Star, Cat, Dog, Music, Gift, Pizza, Rabbit, Bird, Fish, PawPrint]; }
    else if (count >= 50) { numParticles = 16; shapes = [Sparkle, Star, Heart, Cat, Dog, Music, Coffee, Rabbit, Bird]; }
    else if (count >= 20) { numParticles = 10; shapes = [Sparkle, Star, Cat, Dog, Music, Rabbit]; }
    else if (count >= 5) { numParticles = 6; shapes = [Sparkle, Star, Heart, Bird]; }
    else { numParticles = 3; shapes = [Sparkle, Star]; }

    const particles = useMemo(() => {
        return Array.from({ length: numParticles }).map((_, i) => {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            const randomDelay = Math.random() * 3;
            const randomDuration = 2 + Math.random() * 3;
            const Icon = shapes[i % shapes.length];
            const size = Math.random() * 8 + 8; // Adjusted size as per instruction

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
                targetRotate: (Math.random() - 0.5) * 120
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]); // Changed from useEffect to useMemo

    if (count < 2) return null;

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
                        rotate: [0, p.targetRotate]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeOut"
                    }}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        color: color || tier.accent || tier.border,
                        filter: `drop-shadow(0 0 3px ${tier.border})`
                    }}
                >
                    <p.Icon size={p.size} />
                </motion.div>
            ))}
        </div>
    );
};

/* ─── Chapter row (shared) ─── */
const ChapterRow = ({ chapter, index, isMobile, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks }) => {
    const finished = isFinished?.(chapter.number);
    const readCount = getReadCount?.(chapter.number) || 0;
    const tier = getReadTier(readCount);
    const note = NOTE_PALETTES[index % NOTE_PALETTES.length];
    const jpLinks = chapter.links.jp || [];

    // Cooldown state
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
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: isMobile ? '0.75rem' : '0.76rem',
        color: '#fff', background: bg,
        padding: isMobile ? '6px 10px' : '4px 10px', borderRadius: '9999px',
        textDecoration: 'none', fontFamily: 'var(--font-hand)', fontWeight: 'bold',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexShrink: 0, whiteSpace: 'nowrap'
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
            initial={{ opacity: 0, y: 10, rotate: (index % 2 === 0 ? -0.5 : 0.5) }}
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
                width: '100%'
            }}
        >
            <MilestoneEffects count={readCount} tier={tier} color={note.accent} />

            {/* Corner ribbon — inside the row, top-right */}
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
                        display: 'flex', alignItems: 'center', gap: '3px',
                        boxShadow: `0 2px 6px ${tier.border}40`,
                    }}
                >
                    <span style={{
                        color: tier.text,
                        fontSize: isMobile ? '0.55rem' : '0.62rem',
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-hand)',
                        lineHeight: 1,
                    }}>
                        {tier.label ? `${tier.label} - ${readCount || 1}×` : `${readCount || 1}×`}
                    </span>
                </motion.div>
            )}

            {/* Tape decoration */}
            <div style={{
                position: 'absolute',
                top: '-1px',
                left: isMobile ? '12px' : '18px',
                width: isMobile ? '22px' : '30px',
                height: isMobile ? '8px' : '10px',
                background: `${note.border}50`,
                borderRadius: '0 0 3px 3px',
            }} />

            {/* Number badge */}
            <motion.div
                animate={finished ? { rotate: [0, -10, 10, -5, 5, 0] } : {
                    boxShadow: [
                        `0 0 0px ${note.accent}00`,
                        `0 0 8px ${note.accent}40`,
                        `0 0 0px ${note.accent}00`,
                    ]
                }}
                transition={finished ? { duration: 0.6, delay: index * 0.04 + 0.2 } : { duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
                style={{
                    width: isMobile ? '32px' : '44px',
                    height: isMobile ? '32px' : '44px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${note.border}40, ${note.border}80)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: `2px solid ${note.border}`,
                }}
            >
                <span style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: isMobile ? '0.78rem' : '1rem',
                    fontWeight: 'bold',
                    color: note.accent
                }}>
                    {chapter.number}
                </span>
            </motion.div>

            {/* Title + Latest badge */}
            <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: isMobile ? '0.74rem' : '0.92rem',
                    color: '#374151', fontWeight: 'bold', lineHeight: 1.3,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word'
                }}>
                    {chapter.title}
                </span>
                {chapter.latest && (
                    <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            fontSize: isMobile ? '0.5rem' : '0.58rem',
                            fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                            color: '#dc2626', background: '#fef2f2',
                            border: '1.5px solid #fca5a5',
                            padding: '1px 6px', borderRadius: '9999px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        ✦ latest
                    </motion.span>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                <motion.button
                    whileHover={cooldown > 0 ? {} : { scale: 1.1 }} whileTap={cooldown > 0 ? {} : { scale: 0.95 }}
                    onClick={handleIncrement}
                    disabled={cooldown > 0}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: isMobile ? '0.75rem' : '0.76rem',
                        color: cooldown > 0 ? '#9ca3af' : note.accent, background: cooldown > 0 ? '#f3f4f6' : `${note.border}30`,
                        padding: isMobile ? '6px 10px' : '4px 10px', borderRadius: '9999px',
                        textDecoration: 'none', fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                        boxShadow: cooldown > 0 ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
                        border: `1.5px solid ${cooldown > 0 ? '#d1d5db' : note.border}`,
                        cursor: cooldown > 0 ? 'not-allowed' : 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                        opacity: cooldown > 0 ? 0.7 : 1
                    }}
                >
                    {cooldown > 0 ? `⏳ ${cooldown}s` : '+1 Read'}
                </motion.button>
                {false && chapter.pages && chapter.pages.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => onReadChapter && onReadChapter(chapter)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: isMobile ? '0.75rem' : '0.76rem',
                            color: '#fff', background: '#10b981',
                            padding: isMobile ? '6px 10px' : '4px 10px', borderRadius: '9999px',
                            textDecoration: 'none', fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap'
                        }}
                    >
                        <BookMarked size={isMobile ? 12 : 11} /> Read
                    </motion.button>
                )}
                {false && chapter.links.en && (
                    <motion.a href={chapter.links.en} target="_blank" rel="noopener noreferrer"
                        onClick={() => trackExternalLink?.(chapter.number)}
                        onContextMenu={() => trackExternalLink?.(chapter.number)}
                        onAuxClick={(e) => { if (e.button === 1) trackExternalLink?.(chapter.number); }}
                        whileTap={{ scale: 0.95 }} style={linkStyle(note.accent)}>
                        <Globe size={isMobile ? 9 : 11} /> EN
                    </motion.a>
                )}
                {jpLinks.length === 1 && (
                    <motion.a href={jpLinks[0]} target="_blank" rel="noopener noreferrer"
                        onClick={() => trackExternalLink?.(chapter.number)}
                        onContextMenu={() => trackExternalLink?.(chapter.number)}
                        onAuxClick={(e) => { if (e.button === 1) trackExternalLink?.(chapter.number); }}
                        whileTap={{ scale: 0.95 }} style={linkStyle('var(--pop-pink)')}>
                        <Languages size={isMobile ? 9 : 11} /> JP
                    </motion.a>
                )}
                {jpLinks.length > 1 && jpLinks.map((link, i) => (
                    <motion.a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        onClick={() => trackExternalLink?.(chapter.number)}
                        onContextMenu={() => trackExternalLink?.(chapter.number)}
                        onAuxClick={(e) => { if (e.button === 1) trackExternalLink?.(chapter.number); }}
                        whileTap={{ scale: 0.95 }} style={linkStyle('var(--pop-pink)')}>
                        <Languages size={isMobile ? 9 : 11} /> {i + 1}
                    </motion.a>
                ))}
                {linkTimeLeft > 0 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: isMobile ? '0.7rem' : '0.72rem',
                        color: note.accent, background: `${note.border}30`,
                        padding: '4px 8px', borderRadius: '8px',
                        fontFamily: 'var(--font-hand)', fontWeight: 'bold', marginLeft: '4px'
                    }}>
                        Time left: {formatTime(linkTimeLeft)}
                        <button onClick={() => cancelExternalLink?.(chapter.number)} style={{
                            background: 'transparent', border: 'none', color: '#ef4444',
                            cursor: 'pointer', padding: '0 0 0 4px', fontSize: '0.9rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginLeft: '2px'
                        }} title="Cancel timer">
                            &times;
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/* ─── Nav arrow button ─── */
const NavBtn = ({ onClick, disabled, volColor, children, isMobile }) => (
    <motion.button
        onClick={onClick} disabled={disabled}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.92 } : {}}
        style={{
            width: isMobile ? '40px' : '38px',
            height: isMobile ? '40px' : '38px',
            borderRadius: '10px',
            border: `1.5px solid ${disabled ? '#e5e7eb' : volColor + '50'}`,
            background: disabled ? '#f9fafb' : `${volColor}10`,
            cursor: disabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: disabled ? 0.3 : 1,
            color: disabled ? '#9ca3af' : volColor,
            transition: 'all 0.2s'
        }}
    >{children}</motion.button>
);

/* ─── Volume selector strip ─── */
const VolSelector = ({ activeVol, setActiveVol, isMobile }) => (
    <div className="hide-scrollbar" style={{
        display: 'flex', gap: isMobile ? '6px' : '4px', flexWrap: isMobile ? 'wrap' : 'nowrap',
        overflowX: isMobile ? 'visible' : 'auto', padding: '4px 2px', alignItems: 'flex-end', justifyContent: isMobile ? 'center' : 'flex-start'
    }}>
        {VOLUMES.map((vol, idx) => {
            const isActive = idx === activeVol;
            const c = VOL_COLORS[vol.number] || '#9ca3af';
            return (
                <motion.button key={vol.number}
                    onClick={() => setActiveVol(idx)}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    style={{
                        minWidth: isMobile ? '36px' : '34px',
                        height: isMobile ? '44px' : '42px',
                        borderRadius: '7px',
                        border: isActive ? `2px solid ${c}` : '1.5px solid #e5e7eb',
                        background: isActive ? `${c}15` : '#fafafa',
                        cursor: 'pointer', padding: '1px 0',
                        fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                        color: isActive ? c : '#b0b5bc',
                        flexShrink: 0, transition: 'all 0.15s',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 0, lineHeight: 1
                    }}
                >
                    <span style={{ fontSize: isMobile ? '0.55rem' : '0.48rem', opacity: 0.65 }}>Vol</span>
                    <span style={{ fontSize: isMobile ? '0.9rem' : '0.82rem' }}>{vol.number}</span>
                </motion.button>
            );
        })}
    </div>
);

/* ─── MOBILE layout ─── */
const MobileChapters = ({ activeVol, setActiveVol, volume, volChapters, volColor, goPrev, goNext, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, markFinished, unmarkFinished, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks }) => (
    <div style={{
        width: '100%', padding: '24px 8px 10px 8px',
        display: 'flex', flexDirection: 'column',
        overflow: 'visible', flex: 1
    }}>
        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', justifyContent: 'center' }}>
            <BookOpen size={24} style={{ color: 'var(--pop-blue)' }} />
            <span style={{ fontFamily: 'var(--font-main)', color: '#6b7280', fontSize: '1.5rem', fontWeight: 'normal' }}>Chapters</span>
        </div>

        {/* Volume selector */}
        <div style={{ marginBottom: '10px' }}>
            <VolSelector activeVol={activeVol} setActiveVol={setActiveVol} isMobile />
        </div>

        {/* Volume card: cover + info + nav */}
        <AnimatePresence mode="wait">
            <motion.div
                key={volume.number}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 250, damping: 25 }}
            >
                {/* Missed Chapters Notification */}
                {(() => {
                    const totalAvailable = CHAPTERS.filter(c => isMainChapter(c.number) && (c.links.en || c.pages)).length;
                    const finishedCount = Array.from(isFinished ? CHAPTERS.filter(c => isMainChapter(c.number) && isFinished(c.number)) : []).length;
                    const unread = totalAvailable - finishedCount;

                    if (unread > 0) {
                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    marginBottom: '12px', padding: '8px 12px',
                                    background: 'var(--pop-yellow)', borderRadius: '8px',
                                    border: '1.5px solid #ffe57f',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: '0 2px 8px rgba(255, 229, 127, 0.3)'
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    <Pin size={16} style={{ color: '#d4a017' }} />
                                </motion.div>
                                <span style={{
                                    fontFamily: 'var(--font-hand)', fontSize: '0.85rem',
                                    color: '#854d0e', fontWeight: 'bold'
                                }}>
                                    Notice: You have {unread} unread chapter{unread > 1 ? 's' : ''}!
                                </span>
                            </motion.div>
                        );
                    }
                    return null;
                })()}

                {/* Cover row */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '12px', marginBottom: '12px',
                    padding: '0 2px'
                }}>
                    {/* Prev arrow */}
                    <NavBtn onClick={goPrev} disabled={activeVol === 0} volColor={volColor} isMobile>
                        <ChevronLeft size={16} />
                    </NavBtn>

                    {/* Cover */}
                    <div style={{ position: 'relative', width: '100px', flexShrink: 0 }}>
                        <div style={{
                            width: '100%', aspectRatio: '2/3',
                            borderRadius: '8px', overflow: 'hidden',
                            boxShadow: `0 4px 14px ${volColor}30, 0 2px 6px rgba(0,0,0,0.1)`,
                            border: `2px solid ${volColor}50`,
                            background: volume.cover ? '#f9fafb' : `linear-gradient(145deg, ${volColor}15, ${volColor}35)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {volume.cover ? (
                                <img src={volume.cover} alt={volume.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
                            ) : (
                                <span style={{
                                    fontFamily: 'var(--font-main)', fontSize: '1.5rem',
                                    fontWeight: 'bold', color: volColor, opacity: 0.35,
                                    textAlign: 'center', lineHeight: 1.2
                                }}>Vol<br />{volume.number}</span>
                            )}
                        </div>
                        {volume.anime && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                                style={{
                                    position: 'absolute', top: '-4px', right: '-6px',
                                    background: '#ede9fe',
                                    color: '#7c3aed', padding: '2px 6px', borderRadius: '6px',
                                    fontSize: '0.52rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', gap: '2px',
                                    border: '1.5px solid #c4b5fd'
                                }}>
                                <Tv size={8} />{volume.anime}
                            </motion.div>
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{
                            fontFamily: 'var(--font-main)', fontSize: '1.4rem',
                            fontWeight: 'normal', color: volColor, marginBottom: '2px', lineHeight: 1.1
                        }}>{volume.title}</p>
                        <p style={{
                            fontFamily: 'var(--font-hand)', fontSize: '0.85rem', color: '#9ca3af'
                        }}>
                            Chapter {Math.floor(volume.chapters[0])} – {Math.floor(volume.chapters[volume.chapters.length - 1])}
                            {volume.inProgress && <span style={{ color: '#f59e0b', marginLeft: '5px' }}>✦ ongoing</span>}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                            {volume.purchaseUrl && (
                                <motion.a
                                    href={volume.purchaseUrl} target="_blank" rel="noopener noreferrer"
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.75rem', color: '#fff', background: volColor,
                                        padding: '4px 8px', borderRadius: '6px', textDecoration: 'none',
                                        fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                                        boxShadow: `0 2px 4px ${volColor}40`
                                    }}
                                >
                                    <ShoppingCart size={12} /> Preorder/Buy EN
                                </motion.a>
                            )}
                            {volume.purchaseUrlJp && (
                                <motion.a
                                    href={volume.purchaseUrlJp} target="_blank" rel="noopener noreferrer"
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.75rem', color: '#fff', background: 'var(--pop-pink)',
                                        padding: '4px 8px', borderRadius: '6px', textDecoration: 'none',
                                        fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                                        boxShadow: `0 2px 4px rgba(255, 158, 198, 0.4)`
                                    }}
                                >
                                    <ShoppingCart size={12} /> Preorder/Buy JP
                                </motion.a>
                            )}
                        </div>
                    </div>

                    {/* Next arrow */}
                    <NavBtn onClick={goNext} disabled={activeVol === VOLUMES.length - 1} volColor={volColor} isMobile>
                        <ChevronRight size={16} />
                    </NavBtn>
                </div>

                {/* Chapter list */}
                <div style={{
                    display: 'flex', flexDirection: 'column',
                    gap: '5px', width: '100%', padding: '4px 2px',
                }}>
                    {volChapters.map((ch, idx) => (
                        <ChapterRow key={ch.number} chapter={ch} index={idx} isMobile onReadChapter={onReadChapter} isFinished={isFinished} trackExternalLink={trackExternalLink} cancelExternalLink={cancelExternalLink} markFinished={markFinished} unmarkFinished={unmarkFinished} getReadCount={getReadCount} incrementReadCount={incrementReadCount} getRemainingCooldown={getRemainingCooldown} pendingLinks={pendingLinks} />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
);

/* ─── DESKTOP layout ─── */
const DesktopChapters = ({ activeVol, setActiveVol, volume, volChapters, volColor, goPrev, goNext, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, markFinished, unmarkFinished, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks }) => (
    <div style={{
        width: '100%', padding: '28px 40px',
        minHeight: '600px', display: 'flex', flexDirection: 'column',
        overflow: 'visible'
    }}>
        {/* Header */}
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '22px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={22} style={{ color: 'var(--pop-blue)' }} />
                <span style={{
                    fontFamily: 'var(--font-main)', color: '#6b7280',
                    fontSize: '1.3rem', fontWeight: 'normal',
                }}>Chapters</span>

                {/* Missed Chapters Notification (Desktop Inline) */}
                {(() => {
                    const totalAvailable = CHAPTERS.filter(c => isMainChapter(c.number) && (c.links.en || c.pages)).length;
                    const finishedCount = Array.from(isFinished ? CHAPTERS.filter(c => isMainChapter(c.number) && isFinished(c.number)) : []).length;
                    const unread = totalAvailable - finishedCount;

                    if (unread > 0) {
                        return (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    padding: '5px 12px',
                                    background: 'var(--pop-yellow)', borderRadius: '9999px',
                                    border: '1.5px solid #ffe57f',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    marginLeft: '10px',
                                    boxShadow: '0 2px 8px rgba(255, 229, 127, 0.2)'
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    <Pin size={14} style={{ color: '#d4a017' }} />
                                </motion.div>
                                <span style={{
                                    fontFamily: 'var(--font-hand)', fontSize: '0.82rem',
                                    color: '#854d0e', fontWeight: 'bold'
                                }}>
                                    {unread} unread chapter{unread > 1 ? 's' : ''}!
                                </span>
                            </motion.div>
                        );
                    }
                    return null;
                })()}
            </div>
            <VolSelector activeVol={activeVol} setActiveVol={setActiveVol} isMobile={false} />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
            <motion.div
                key={volume.number}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                    flex: 1, display: 'flex', flexDirection: 'row',
                    gap: '30px', alignItems: 'flex-start'
                }}
            >
                {/* Cover panel */}
                <div style={{
                    flexShrink: 0, width: '210px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '14px'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        style={{ position: 'relative', width: '190px' }}
                    >
                        <div style={{
                            width: '100%', aspectRatio: '2/3',
                            borderRadius: '10px', overflow: 'hidden',
                            boxShadow: `0 6px 20px ${volColor}35, 0 3px 8px rgba(0,0,0,0.12)`,
                            border: `2.5px solid ${volColor}50`,
                            background: volume.cover ? '#f9fafb' : `linear-gradient(145deg, ${volColor}15, ${volColor}35)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {volume.cover ? (
                                <img src={volume.cover} alt={volume.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
                            ) : (
                                <span style={{
                                    fontFamily: 'var(--font-main)', fontSize: '2.2rem',
                                    fontWeight: 'bold', color: volColor, opacity: 0.35,
                                    textAlign: 'center', lineHeight: 1.2
                                }}>Vol<br />{volume.number}</span>
                            )}
                        </div>

                        {volume.anime && (
                            <motion.div initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                                style={{
                                    position: 'absolute', top: '-8px', right: '-10px',
                                    background: '#ede9fe',
                                    color: '#7c3aed', padding: '4px 10px', borderRadius: '8px',
                                    fontSize: '0.72rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', gap: '3px',
                                    border: '2px solid #c4b5fd'
                                }}>
                                <Tv size={11} />{volume.anime}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Volume info */}
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            style={{
                                fontFamily: 'var(--font-main)', fontSize: '1.5rem',
                                fontWeight: 'normal', color: volColor, marginBottom: '2px'
                            }}>{volume.title}</motion.p>
                        <p style={{ fontFamily: 'var(--font-hand)', fontSize: '0.9rem', color: '#9ca3af', marginBottom: '4px' }}>
                            Chapters {Math.floor(volume.chapters[0])} – {Math.floor(volume.chapters[volume.chapters.length - 1])}
                            {volume.inProgress && <span style={{ color: '#f59e0b', marginLeft: '6px' }}>✦ ongoing</span>}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {volume.purchaseUrl && (
                                <motion.a
                                    href={volume.purchaseUrl} target="_blank" rel="noopener noreferrer"
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.85rem', color: '#fff', background: volColor,
                                        padding: '6px 12px', borderRadius: '8px', textDecoration: 'none',
                                        fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                                        boxShadow: `0 2px 6px ${volColor}50`
                                    }}
                                >
                                    <ShoppingCart size={14} /> Buy English volume
                                </motion.a>
                            )}
                            {volume.purchaseUrlJp && (
                                <motion.a
                                    href={volume.purchaseUrlJp} target="_blank" rel="noopener noreferrer"
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.85rem', color: '#fff', background: 'var(--pop-pink)',
                                        padding: '6px 12px', borderRadius: '8px', textDecoration: 'none',
                                        fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                                        boxShadow: `0 2px 6px rgba(255, 158, 198, 0.5)`
                                    }}
                                >
                                    <ShoppingCart size={14} /> Buy Japanese volume
                                </motion.a>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '4px' }}>
                            <NavBtn onClick={goPrev} disabled={activeVol === 0} volColor={volColor}>
                                <ChevronLeft size={20} />
                            </NavBtn>
                            <NavBtn onClick={goNext} disabled={activeVol === VOLUMES.length - 1} volColor={volColor}>
                                <ChevronRight size={20} />
                            </NavBtn>
                        </div>
                    </div>
                </div>

                {/* Chapter list */}
                <div className="hide-scrollbar" style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    gap: '8px', overflowY: 'auto', maxHeight: 'min(530px, calc(100vh - 280px))',
                    padding: '4px 6px',
                }}>
                    {volChapters.map((ch, idx) => (
                        <ChapterRow key={ch.number} chapter={ch} index={idx} isMobile={false} onReadChapter={onReadChapter} isFinished={isFinished} trackExternalLink={trackExternalLink} cancelExternalLink={cancelExternalLink} markFinished={markFinished} unmarkFinished={unmarkFinished} getReadCount={getReadCount} incrementReadCount={incrementReadCount} getRemainingCooldown={getRemainingCooldown} pendingLinks={pendingLinks} />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
);

/* ─── Main export ─── */
const ChaptersPage = ({ isMobile, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, markFinished, unmarkFinished, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks }) => {
    const [activeVol, _setActiveVol] = useState(() => {
        const saved = localStorage.getItem('skip_activeVol');
        if (saved !== null) {
            const idx = parseInt(saved, 10);
            if (!isNaN(idx) && idx >= 0 && idx < VOLUMES.length) return idx;
        }
        return VOLUMES.length - 1;
    });
    const setActiveVol = (valOrFn) => {
        _setActiveVol(prev => {
            const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
            localStorage.setItem('skip_activeVol', String(next));
            return next;
        });
    };
    const volume = VOLUMES[activeVol];
    const volChapters = volume.chapters.map(num => CHAPTERS.find(c => c.number === num)).filter(Boolean);
    const volColor = VOL_COLORS[volume.number] || '#9ca3af';

    const goPrev = () => setActiveVol(prev => Math.max(0, prev - 1));
    const goNext = () => setActiveVol(prev => Math.min(VOLUMES.length - 1, prev + 1));

    const shared = { activeVol, setActiveVol, volume, volChapters, volColor, goPrev, goNext, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, markFinished, unmarkFinished, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks };

    return isMobile ? <MobileChapters {...shared} /> : <DesktopChapters {...shared} />;
};

export default ChaptersPage;
