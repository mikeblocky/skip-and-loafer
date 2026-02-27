/* eslint-disable no-unused-vars */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw, Copy, Check, ArrowDownToLine,
    KeyRound, Loader2, AlertCircle, Clock,
    BarChart3, BookOpen, Wifi, WifiOff,
    Trophy, Crown, Star, Zap, Globe, BookMarked, Languages, ChevronDown, ChevronUp, Cloud,
    Gem, Heart, Sparkles, Sparkle, Cat, Dog, Music, Coffee, Gift, Pizza, Sun, Ghost,
    Rabbit, Bird, Fish, Snail, PawPrint
} from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter, VOL_COLORS } from '../data/chapters';

/* ─── Color palettes matching ChaptersPage aesthetics ─── */
const NOTE_PALETTES = [
    { bg: '#fff0f3', border: '#ff9ec6', accent: '#ff6b9d' },  // pink
    { bg: '#eef6ff', border: '#8fd3ff', accent: '#4da6e8' },  // blue
    { bg: '#fefce8', border: '#ffe57f', accent: '#d4a017' },  // yellow
    { bg: '#f0fdf4', border: '#97eba9', accent: '#4ead6b' },  // green
    { bg: '#faf5ff', border: '#c4b5fd', accent: '#8b5cf6' },  // lavender
    { bg: '#fff7ed', border: '#fdba74', accent: '#ea7e30' },  // peach
    { bg: '#ecfeff', border: '#67e8f9', accent: '#0891b2' },  // cyan
];

const VOL_BGS = {
    1: '#fff0f3',   // Pink
    2: '#fff7ed',   // Yellow-peach
    3: '#f0fdf4',   // Green
    4: '#faf5ff',   // Lavender
    5: '#fff0f3',   // Red-green (warm)
    6: '#eef6ff',   // Blue
    7: '#fff0f3',   // Peach-Pink
    8: '#eef6ff',   // Yellow-blue
    9: '#f0fdf4',   // Green-red
    10: '#faf5ff',  // Blue-lavender
    11: '#fff0f3',  // Pink
    12: '#f0fdf4',  // Peach-green
    13: '#faf5ff',  // Lavender (default for in-progress)
};

/* ─── Milestone Sparkles Overlay ─── */
const MilestoneEffects = ({ count, tier, color }) => {
    let numParticles = 0;
    let shapes = [Sparkle];
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
                targetRotate: (Math.random() - 0.5) * 120
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    if (!count || count < 2) return null;

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
                        filter: tier ? `drop-shadow(0 0 3px ${tier.border})` : 'none'
                    }}
                >
                    <p.Icon size={p.size} />
                </motion.div>
            ))}
        </div>
    );
};

/* ─── Shared UI Components ─── */
const ListRow = ({ index, finished, readCount, noteColor, customNote, tierBorder, tierBg, tierText, tierAccent, numberLine1, numberLine2, title, subtitle, rightContent, onClick, style }) => {
    const note = customNote || NOTE_PALETTES[noteColor % NOTE_PALETTES.length];
    const isMobile = window.innerWidth <= 768;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, rotate: (index % 2 === 0 ? -0.5 : 0.5) }}
            animate={finished ? { opacity: 1, y: 0, rotate: 0, scale: [1, 1.02, 1] } : { opacity: 1, y: 0, rotate: 0 }}
            transition={finished ? { delay: index * 0.04, duration: 0.5 } : { delay: index * 0.04, duration: 0.3, type: 'spring', stiffness: 200 }}
            whileHover={!isMobile && onClick ? { scale: 1.015, y: -2, boxShadow: `0 4px 12px ${note.border}60` } : {}}
            onClick={onClick}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap',
                gap: isMobile ? '10px' : '14px',
                padding: isMobile ? '14px 12px' : '13px 18px',
                background: note.bg,
                borderRadius: '8px',
                border: `1.5px solid ${note.border}80`,
                borderBottom: `3px solid ${note.border}`,
                boxShadow: finished ? `0 2px 8px ${note.border}60` : `0 2px 5px ${note.border}25`,
                overflow: 'visible',
                width: '100%',
                cursor: onClick ? 'pointer' : 'default',
                ...style // merge any custom styles
            }}
        >
            {readCount >= 2 && tierBg && tierBorder && (
                <MilestoneEffects count={readCount} tier={{ bg: tierBg, border: tierBorder, text: tierText, accent: tierAccent }} color={note.accent} />
            )}

            {/* Tape decoration */}
            <div style={{
                position: 'absolute', top: '-1px', left: isMobile ? '12px' : '18px',
                width: isMobile ? '22px' : '30px', height: isMobile ? '8px' : '10px',
                background: `${note.border}50`,
                borderRadius: '0 0 3px 3px',
            }} />

            {/* Badge */}
            <motion.div
                animate={finished ? { rotate: [0, -10, 10, -5, 5, 0] } : { boxShadow: [`0 0 0px ${note.accent}00`, `0 0 8px ${note.accent}40`, `0 0 0px ${note.accent}00`] }}
                transition={finished ? { duration: 0.6, delay: index * 0.04 + 0.2 } : { duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
                style={{
                    width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${note.border}40, ${note.border}80)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: `2px solid ${note.border}`,
                }}
            >
                {numberLine1 && <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: 'bold', color: note.accent, lineHeight: 1 }}>{numberLine1}</span>}
                {numberLine2 && <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.85rem' : '1.1rem', fontWeight: 'bold', color: note.accent, lineHeight: 1 }}>{numberLine2}</span>}
            </motion.div>

            {/* Content area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.9rem' : '1.05rem', color: '#374151', fontWeight: 'bold', lineHeight: 1.2, whiteSpace: 'normal' }}>
                    {title}
                </span>
                {subtitle && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {subtitle}
                    </div>
                )}
            </div>

            {/* Right content / Ribbon area */}
            {rightContent && (
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                    {rightContent}
                </div>
            )}
        </motion.div>
    );
};

/* ─── Chapter Row (Mini version for accordions) ─── */
const MiniChapterRow = ({ chapter, index, isMobile, onReadChapter, isFinished, getReadCount, trackExternalLink, cancelExternalLink, unmarkFinished, incrementReadCount, getRemainingCooldown, pendingLinks }) => {
    const finished = isFinished?.(chapter.number);
    const readCount = getReadCount?.(chapter.number) || 0;
    const tier = getReadTier(readCount);
    const note = NOTE_PALETTES[index % NOTE_PALETTES.length];
    const jpLinks = chapter.links.jp || [];

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
            initial={{ opacity: 0, scale: 0.98, y: -5 }}
            animate={finished ? { opacity: 1, scale: [1, 1.02, 1], y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.02, duration: finished ? 0.3 : 0.2 }}
            style={{
                position: 'relative', display: 'flex', alignItems: 'center', flexWrap: 'wrap',
                gap: isMobile ? '8px' : '12px', padding: isMobile ? '12px 10px' : '12px 14px',
                background: '#fff',
                borderRadius: '6px', border: `1.5px solid #e5e7eb`,
                borderLeft: `4px solid ${note.accent}`,
                boxShadow: finished ? `0 2px 8px ${note.border}40` : '0 1px 2px rgba(0,0,0,0.05)',
                overflow: 'visible', width: '100%'
            }}
        >
            <MilestoneEffects count={readCount} tier={tier} color={note.accent} />

            {finished && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={readCount >= 2 ? { y: 0, opacity: 1, scale: [1, 1.15, 1], rotate: [0, -6, 6, -3, 3, 0] } : { y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20, delay: index * 0.04 + 0.1, duration: 0.6 }}
                    style={{
                        position: 'absolute', top: 0, right: 0, zIndex: 5, pointerEvents: 'none',
                        background: tier.bg, borderRadius: '0 6px 0 8px',
                        padding: isMobile ? '2px 6px 3px 8px' : '2px 8px 4px 10px',
                        display: 'flex', alignItems: 'center', gap: '3px',
                        boxShadow: `0 2px 4px ${tier.border}30`,
                    }}>
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
                        border: `1.5px solid ${cooldown > 0 ? '#d1d5db' : note.border}`,
                        cursor: cooldown > 0 ? 'not-allowed' : 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                        boxShadow: cooldown > 0 ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', opacity: cooldown > 0 ? 0.7 : 1
                    }}
                >
                    {cooldown > 0 ? `⏳ ${cooldown}s` : '+1 Read'}
                </motion.button>
                {false && chapter.pages && chapter.pages.length > 0 && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => onReadChapter?.(chapter)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '0.75rem' : '0.76rem', color: '#fff', background: '#10b981', padding: isMobile ? '6px 10px' : '4px 10px', borderRadius: '9999px', textDecoration: 'none', fontFamily: 'var(--font-hand)', fontWeight: 'bold', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        <BookMarked size={isMobile ? 12 : 11} /> Read
                    </motion.button>
                )}
                {false && chapter.links.en && (
                    <motion.a href={chapter.links.en} target="_blank" rel="noopener noreferrer" onClick={() => trackExternalLink?.(chapter.number)} onContextMenu={() => trackExternalLink?.(chapter.number)} onAuxClick={(e) => { if (e.button === 1) trackExternalLink?.(chapter.number); }} whileTap={{ scale: 0.95 }} style={linkStyle(note.accent)}>
                        <Globe size={isMobile ? 9 : 11} /> EN
                    </motion.a>
                )}
                {jpLinks.length === 1 && (
                    <motion.a href={jpLinks[0]} target="_blank" rel="noopener noreferrer" onClick={() => trackExternalLink?.(chapter.number)} onContextMenu={() => trackExternalLink?.(chapter.number)} onAuxClick={(e) => { if (e.button === 1) trackExternalLink?.(chapter.number); }} whileTap={{ scale: 0.95 }} style={linkStyle('var(--pop-pink)')}>
                        <Languages size={isMobile ? 9 : 11} /> JP
                    </motion.a>
                )}
                {jpLinks.length > 1 && jpLinks.map((link, i) => (
                    <motion.a key={i} href={link} target="_blank" rel="noopener noreferrer" onClick={() => trackExternalLink?.(chapter.number)} onContextMenu={() => trackExternalLink?.(chapter.number)} onAuxClick={(e) => { if (e.button === 1) trackExternalLink?.(chapter.number); }} whileTap={{ scale: 0.95 }} style={linkStyle('var(--pop-pink)')}>
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
                        ⏳ {formatTime(linkTimeLeft)}
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

/* ─── Read tier logic ─── */
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
const MEDAL_ICONS = [Crown, Star, Zap];
const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32'];

/* ─── Sync data helpers (used only for initial key generation) ─── */
const SYNC_API_BASE = '/api/sync';
const collectSyncData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('skip_')) data[key] = localStorage.getItem(key);
    }
    return data;
};

/* ═══════════════════════════
   TABS DEFINITION
   ═══════════════════════════ */
const TABS = [
    { id: 'progress', title: 'Progress', short: 'Overview', color: '#10b981', icon: BarChart3 },
    { id: 'leaderboard', title: 'Most reread chapters', short: 'Rereads', color: '#b45309', icon: Trophy },
    { id: 'sync', title: 'Sync', short: 'Sync', color: '#3b82f6', icon: RefreshCw }
];

/* ─── Tab selector strip ─── */
const TabSelector = ({ activeTab, setActiveTab, isMobile }) => (
    <div className="hide-scrollbar" style={{
        display: 'flex', gap: isMobile ? '6px' : '6px', flexWrap: isMobile ? 'wrap' : 'nowrap',
        overflowX: isMobile ? 'visible' : 'auto', paddingBottom: '2px', alignItems: 'flex-end', justifyContent: isMobile ? 'center' : 'flex-start'
    }}>
        {TABS.map((tab, idx) => {
            const isActive = idx === activeTab;
            const c = tab.color;
            const Icon = tab.icon;
            return (
                <motion.button key={tab.id} onClick={() => setActiveTab(idx)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
                    style={{
                        minWidth: isMobile ? '70px' : '100px', height: isMobile ? '44px' : '44px',
                        borderRadius: '7px', border: isActive ? `2px solid ${c}` : '1.5px solid #e5e7eb',
                        background: isActive ? `${c}15` : '#fafafa', cursor: 'pointer', padding: '0 10px',
                        fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: isActive ? c : '#b0b5bc',
                        flexShrink: 0, transition: 'all 0.15s', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '2px', lineHeight: 1
                    }}>
                    <Icon size={isMobile ? 12 : 14} style={{ opacity: isActive ? 1 : 0.65 }} />
                    <span style={{ fontSize: isMobile ? '0.65rem' : '0.8rem' }}>{tab.title}</span>
                </motion.button>
            );
        })}
    </div>
);

/* ═══════════════════════════
   MAIN SYNC PAGE
   ═══════════════════════════ */
const SyncPage = ({ isMobile, finishedCount = 0, finished = new Set(), readCounts = {}, reloadFromStorage, onReadChapter, trackExternalLink, cancelExternalLink, unmarkFinished, incrementReadCount, getRemainingCooldown, pendingLinks, syncData }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [expandedVol, setExpandedVol] = useState(null);

    const totalChapters = CHAPTERS.filter(c => isMainChapter(c.number) && (c.links.en || (c.links.jp?.length > 0) || (c.pages?.length > 0))).length;
    const finishedCountMain = Array.from(finished).filter(num => isMainChapter(num)).length;
    const progressPct = totalChapters > 0 ? Math.round((finishedCountMain / totalChapters) * 100) : 0;

    /* ── Reread data ── */
    const rereadEntries = Object.entries(readCounts)
        .map(([ch, count]) => ({ chapter: parseFloat(ch), count }))
        .filter(e => e.count > 0)
        .sort((a, b) => b.count - a.count);
    const totalReads = rereadEntries.reduce((sum, e) => sum + e.count, 0);

    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

    useEffect(() => {
        if (activeTab === 1) {
            setIsLoadingLeaderboard(true);
            fetch('/api/reads/top')
                .then(res => res.json())
                .then(data => {
                    if (data.leaderboard) setLeaderboard(data.leaderboard);
                })
                .catch(err => console.error('Failed to fetch leaderboard:', err))
                .finally(() => setIsLoadingLeaderboard(false));
        }
    }, [activeTab]);

    /* ── Sync state ── */
    // Using global sync hook passed as prop
    const { syncKey, setSyncKey, syncActive, setSyncActive, lastSynced, pushData, pullData, disconnect } = syncData || {};
    
    // Local UI state
    const [inputKey, setInputKey] = useState('');
    const [loading, setLoading] = useState(null);
    const [status, setStatus] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        setLoading('gen'); setStatus(null);
        try {
            const data = collectSyncData();
            const res = await fetch(`${SYNC_API_BASE}/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) });
            if (!res.ok) throw new Error('Failed');
            const { key } = await res.json();
            setSyncKey(key); setSyncActive(true); 
            setStatus({ type: 'success', msg: `Syncing with key ${key}` });
        } catch (e) { setStatus({ type: 'error', msg: e.message }); } finally { setLoading(null); }
    }, [setSyncKey, setSyncActive]);

    const handleJoin = useCallback(async () => {
        const key = inputKey.trim();
        if (!key) { setStatus({ type: 'error', msg: 'Enter a key' }); return; }
        setLoading('join'); setStatus(null);
        try {
            if (await pullData(key)) { 
                setSyncKey(key); 
                setSyncActive(true); 
                setInputKey(''); 
                setStatus({ type: 'success', msg: 'Connected!' }); 
            }
            else setStatus({ type: 'error', msg: 'Key not found' });
        } catch (e) { setStatus({ type: 'error', msg: e.message }); } finally { setLoading(null); }
    }, [inputKey, pullData, setSyncKey, setSyncActive]);

    const handleDisconnect = useCallback(() => {
        // Clear all progress data and disconnect
        disconnect?.();
        setStatus({ type: 'info', msg: 'Disconnected — progress data cleared' });
    }, [disconnect]);


    const handleCopy = useCallback(() => {
        if (syncKey) { navigator.clipboard.writeText(syncKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    }, [syncKey]);

    /* ── Content renders ── */
    const renderProgress = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
                position: isMobile ? 'static' : 'sticky',
                top: isMobile ? 'auto' : '0px', // sit just below the App padding edge
                zIndex: isMobile ? 'auto' : 15, // higher than volumes
                background: isMobile ? 'transparent' : 'var(--paper-white)',
                paddingBottom: isMobile ? '0' : '10px',
                marginBottom: isMobile ? '0' : '-2px', // pull up the subsequent gap a bit
                marginInline: isMobile ? '0' : '-4px', // span out to cover padding
                paddingInline: isMobile ? '0' : '4px',
            }}>
                <ListRow
                    index={0} finished={progressPct === 100} noteColor={3}
                    tierBg="#10b981" tierBorder="#059669" tierText="#fff" tierAccent="#047857"
                    numberLine2={`${progressPct}%`}
                    title="Overall completion"
                    subtitle={
                        <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#6b7280' }}>
                            {finishedCountMain} of {totalChapters} chapters done
                        </span>
                    }
                    rightContent={
                        <div style={{ background: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: '9999px', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold' }}>
                            {totalReads} total reads
                        </div>
                    }
                    style={{
                        boxShadow: isMobile ? undefined : '0 4px 14px rgba(5, 150, 105, 0.15)' // subtle green glow for the sticky box
                    }}
                />
            </div>

            <div className="hide-scrollbar" style={{
                flex: 1, overflowY: isMobile ? 'visible' : 'auto', display: 'flex', flexDirection: 'column',
                gap: '8px', padding: '4px', maxHeight: isMobile ? 'none' : 'min(530px, calc(100vh - 280px))'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '8px',
                    alignItems: 'start'
                }}>
                    {VOLUMES.map((vol, idx) => {
                        const volChapters = vol.chapters.map(num => CHAPTERS.find(c => c.number === num)).filter(Boolean);
                        const mainVolChapters = vol.chapters.filter(num => isMainChapter(num));
                        const vf = mainVolChapters.filter(ch => finished.has(ch)).length;
                        const vt = mainVolChapters.length;
                        const p = vt > 0 ? Math.round((vf / vt) * 100) : 0;
                        const isFinished = p === 100;
                        const noteColor = idx + 1;
                        const isExpanded = expandedVol === vol.number;
                        const volHex = VOL_COLORS[vol.number] || '#c4b5fd';
                        const customNote = { bg: VOL_BGS[vol.number] || '#faf5ff', border: volHex, accent: volHex };

                        return (
                            <div key={vol.number} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <ListRow
                                    index={idx + 1}
                                    finished={isFinished}
                                    customNote={customNote}
                                    tierBg="#10b981" tierBorder="#059669" tierText="#fff" tierAccent="#047857"
                                    numberLine2={vol.number}
                                    title={vol.title}
                                    onClick={() => setExpandedVol(isExpanded ? null : vol.number)}
                                    subtitle={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px' }}>
                                            <div style={{ flex: 1, height: '8px', background: `${customNote.border}40`, borderRadius: '4px', overflow: 'hidden' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.5, delay: idx * 0.05 }}
                                                    style={{ height: '100%', background: customNote.accent, borderRadius: '4px' }} />
                                            </div>
                                            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', width: '32px' }}>
                                                {p}%
                                            </span>
                                        </div>
                                    }
                                    rightContent={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ background: `${customNote.border}40`, color: customNote.accent, padding: '4px 10px', borderRadius: '9999px', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold' }}>
                                                {vf}/{vt}
                                            </div>
                                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                <ChevronDown size={18} style={{ color: customNote.accent }} />
                                            </motion.div>
                                        </div>
                                    }
                                />
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ overflow: 'hidden', paddingLeft: isMobile ? '12px' : '24px', display: 'flex', flexDirection: 'column', gap: '0px' }}
                                        >
                                            <div style={{
                                                borderLeft: `2px dashed ${customNote.border}`,
                                                paddingLeft: '12px', paddingTop: '8px', paddingBottom: '8px',
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                                gap: '8px'
                                            }}>
                                                {volChapters.map((ch, cIdx) => (
                                                    <MiniChapterRow
                                                        key={ch.number} chapter={ch} index={cIdx} isMobile={isMobile}
                                                        onReadChapter={onReadChapter} isFinished={(num) => finished.has(num)}
                                                        trackExternalLink={trackExternalLink} cancelExternalLink={cancelExternalLink} unmarkFinished={unmarkFinished}
                                                        getReadCount={(num) => readCounts[num] || 0}
                                                        incrementReadCount={incrementReadCount}
                                                        getRemainingCooldown={getRemainingCooldown}
                                                        pendingLinks={pendingLinks}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderLeaderboard = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isLoadingLeaderboard ? (
                <div style={{ textAlign: 'center', padding: '40px 0', background: '#fafafa', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Loader2 size={32} color="#d1d5db" /></motion.div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
                        Loading global reads...
                    </p>
                </div>
            ) : leaderboard.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', background: '#fafafa', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
                    <BookOpen size={32} style={{ color: '#d1d5db', marginBottom: '12px' }} />
                    <p style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
                        No global reads yet!
                    </p>
                </div>
            ) : (
                leaderboard.map((entry, idx) => {
                    const ch = CHAPTERS.find(c => c.number === entry.chapter);
                    const volObj = VOLUMES.find(v => v.chapters.includes(entry.chapter));
                    const tier = getReadTier(entry.count);
                    const rank = idx + 1;
                    const MedalIcon = idx < 3 ? MEDAL_ICONS[idx] : null;

                    const chIdx = volObj ? volObj.chapters.indexOf(entry.chapter) : 0;
                    const volBg = volObj ? (VOL_BGS[volObj.number] || '#faf5ff') : '#faf5ff';
                    const volBorder = volObj ? (VOL_COLORS[volObj.number] || '#c4b5fd') : '#c4b5fd';
                    const chAccent = NOTE_PALETTES[chIdx % NOTE_PALETTES.length].accent;
                    const customNote = { bg: volBg, border: volBorder, accent: chAccent };

                    return (
                        <ListRow
                            key={entry.chapter}
                            index={idx}
                            finished={true}
                            readCount={entry.count}
                            customNote={customNote}
                            tierBg={tier.bg} tierBorder={tier.border} tierText={tier.text} tierAccent={tier.accent}
                            numberLine2={rank}
                            title={ch?.title || `Chapter ${entry.chapter}`}
                            subtitle={
                                <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', color: tier.accent }}>
                                    Chapter {entry.chapter} {volObj ? `• Volume ${volObj.number}` : ''}
                                </span>
                            }
                            rightContent={
                                <>
                                    {MedalIcon && (
                                        <div style={{ background: MEDAL_COLORS[idx], color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                            <MedalIcon size={14} />
                                        </div>
                                    )}
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{ background: tier.bg, color: tier.text, padding: '4px 12px', borderRadius: '9999px', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 'bold', boxShadow: `0 2px 6px ${tier.border}40`, whiteSpace: 'nowrap' }}>
                                        {entry.count} reads
                                    </motion.div>
                                </>
                            }
                        />
                    );
                })
            )}
        </div>
    );

    const renderSync = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ListRow
                index={0}
                finished={syncActive}
                noteColor={1}
                tierBg="#3b82f6" tierBorder="#2563eb" tierText="#fff" tierAccent="#1e40af"
                numberLine1={<Cloud size={14} />}
                title={syncActive ? "Sync active" : "Sync inactive"}
                subtitle={
                    <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', color: syncActive ? '#1e40af' : '#6b7280' }}>
                        {syncActive ? 'Syncing your progress every 15s' : 'Connect to sync your reads across devices'}
                    </span>
                }
                rightContent={
                    <div style={{ background: syncActive ? '#dbeafe' : '#f3f4f6', color: syncActive ? '#1e40af' : '#6b7280', padding: '4px 10px', borderRadius: '9999px', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {syncActive ? <Wifi size={14} /> : <WifiOff size={14} />} {syncActive ? 'Connected' : 'Offline'}
                    </div>
                }
            />

            <div style={{ marginTop: '8px', padding: isMobile ? '16px' : '24px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                {syncActive ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', border: '1.5px solid #bfdbfe', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.9rem', fontWeight: 'bold', color: '#1e40af' }}>Cloud connection</div>
                                {lastSynced && <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.8rem', color: '#60a5fa' }}>Last sync: {lastSynced.toLocaleTimeString()}</div>}
                            </div>
                        </div>

                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', background: '#f0f9ff', border: '2px dashed #93c5fd', borderRadius: '8px', padding: '14px 20px', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '1.4rem', fontWeight: 'bold', color: '#1e40af', letterSpacing: '0.15em' }}>{syncKey}</span>
                            <motion.button onClick={handleCopy} whileTap={{ scale: 0.85 }} style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', color: copied ? '#16a34a' : '#3b82f6', padding: '6px' }}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </motion.button>
                        </div>

                        <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} /> Share this key to sync between devices. It will never expire.
                        </div>

                        <motion.button onClick={handleDisconnect} whileTap={{ scale: 0.95 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', background: 'white', border: '1.5px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-hand)', fontSize: '0.9rem', fontWeight: 'bold', color: '#ef4444', marginTop: '8px' }}>
                            <WifiOff size={14} /> Disconnect
                        </motion.button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                        <motion.button onClick={handleGenerate} disabled={loading === 'gen'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', width: '100%', maxWidth: '300px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white', border: 'none', borderRadius: '12px', cursor: loading === 'gen' ? 'wait' : 'pointer', fontFamily: 'var(--font-hand)', fontSize: '1.05rem', fontWeight: 'bold', boxShadow: '0 4px 14px rgba(59,130,246,0.25)' }}>
                            {loading === 'gen' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><Loader2 size={16} /></motion.div> : <KeyRound size={16} />}
                            {loading === 'gen' ? 'Creating...' : 'Create new sync key'}
                        </motion.button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '300px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 'bold' }}>OR JOIN</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '300px' }}>
                            <input
                                type="text"
                                value={inputKey}
                                onChange={e => {
                                    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                    if (val.length > 4) val = val.substring(0, 4) + '-' + val.substring(4);
                                    setInputKey(val.substring(0, 9));
                                }}
                                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                placeholder="XXXX-XXXX"
                                maxLength={9}
                                style={{ flex: 1, padding: '10px 14px', fontFamily: 'var(--font-hand)', fontSize: '1.05rem', fontWeight: 'bold', letterSpacing: '0.15em', textAlign: 'center', border: '2px solid #e5e7eb', borderRadius: '10px', background: 'white', color: '#374151', outline: 'none' }}
                                onFocus={e => { e.target.style.borderColor = '#3b82f6'; }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                            />
                            <motion.button onClick={handleJoin} disabled={loading === 'join'} whileTap={{ scale: 0.95 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: 'white', border: 'none', borderRadius: '10px', cursor: loading === 'join' ? 'wait' : 'pointer', fontFamily: 'var(--font-hand)', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 }}>
                                {loading === 'join' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><Loader2 size={14} /></motion.div> : <ArrowDownToLine size={14} />} Join
                            </motion.button>
                        </div>
                    </div>
                )}
                <AnimatePresence>
                    {status && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '10px 14px', marginTop: '16px', borderRadius: '8px', fontFamily: 'var(--font-hand)', fontSize: '0.9rem', fontWeight: 'bold', background: status.type === 'success' ? '#f0fdf4' : status.type === 'error' ? '#fef2f2' : '#eff6ff', border: `1.5px solid ${status.type === 'success' ? '#86efac' : status.type === 'error' ? '#fca5a5' : '#93c5fd'}`, color: status.type === 'success' ? '#166534' : status.type === 'error' ? '#991b1b' : '#1e40af', maxWidth: '300px', margin: '16px auto 0' }}>
                            {status.type === 'success' ? <Check size={14} /> : status.type === 'error' ? <AlertCircle size={14} /> : <RefreshCw size={14} />} {status.msg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    return (
        <div style={{ width: '100%', padding: isMobile ? '24px 8px 10px 8px' : '28px 40px', minHeight: isMobile ? 'auto' : '600px', display: 'flex', flexDirection: 'column', overflow: 'visible', flex: 1 }}>
            {/* Header (Desktop + Mobile inline) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between', marginBottom: isMobile ? '16px' : '26px', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', justifyContent: 'center' }}>
                    <Globe size={isMobile ? 24 : 22} style={{ color: 'var(--pop-blue)' }} />
                    <span style={{ fontFamily: 'var(--font-main)', color: '#6b7280', fontSize: isMobile ? '1.5rem' : '1.3rem', fontWeight: 'normal' }}>Progress & Sync</span>
                </div>
                <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} />
            </div>

            {/* Content pane */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="hide-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: isMobile ? 'visible' : 'auto', maxHeight: isMobile ? 'none' : 'min(550px, calc(100vh - 280px))', padding: '4px' }}
                >
                    {activeTab === 0 && renderProgress()}
                    {activeTab === 1 && renderLeaderboard()}
                    {activeTab === 2 && renderSync()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SyncPage;
