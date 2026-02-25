import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Globe, Languages, ChevronLeft, ChevronRight, Tv, BookMarked } from 'lucide-react';
import { CHAPTERS, VOLUMES } from '../data/chapters';

const NOTE_PALETTES = [
    { bg: '#fff0f3', border: '#ff9ec6', accent: '#ff6b9d' },  // pink
    { bg: '#eef6ff', border: '#8fd3ff', accent: '#4da6e8' },  // blue
    { bg: '#fefce8', border: '#ffe57f', accent: '#d4a017' },  // yellow
    { bg: '#f0fdf4', border: '#97eba9', accent: '#4ead6b' },  // green
    { bg: '#faf5ff', border: '#c4b5fd', accent: '#8b5cf6' },  // lavender
    { bg: '#fff7ed', border: '#fdba74', accent: '#ea7e30' },  // peach
];


/* Per-volume colors matching cover art */
const VOL_COLORS = {
    1: '#ff9ec6',            // Pink
    2: '#f0a85e',            // Yellow-peach
    3: '#6bc47f',            // Green
    4: '#a78bfa',            // Lavender
    5: '#d46a6a',            // Red-green (warm)
    6: '#5aade0',            // Blue
    7: '#f28ba0',            // Peach-Pink
    8: '#6ab8d4',            // Yellow-blue
    9: '#5ea86a',            // Green-red
    10: '#8b9cf0',            // Blue-lavender
    11: '#ff9ec6',            // Pink
    12: '#7ec494',            // Peach-green
    13: '#c4b5fd',            // Lavender (default for in-progress)
};

/* ─── Chapter row (shared) ─── */
const ChapterRow = ({ chapter, index, isMobile, onReadChapter }) => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, rotate: (index % 2 === 0 ? -0.5 : 0.5) }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3, type: 'spring', stiffness: 200 }}
            whileHover={!isMobile ? { scale: 1.015, y: -2, boxShadow: `0 4px 12px ${note.border}60` } : {}}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap',
                gap: isMobile ? '10px' : '14px',
                padding: isMobile ? '14px 12px' : '13px 18px',
                background: note.bg,
                borderRadius: isMobile ? '8px' : '8px',
                border: `1.5px solid ${note.border}80`,
                borderBottom: `3px solid ${note.border}`,
                boxShadow: `0 2px 5px ${note.border}25`,
                overflow: 'hidden',
                width: '100%'
            }}
        >
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

            {/* Number badge with twinkle */}
            <motion.div
                animate={{
                    boxShadow: [
                        `0 0 0px ${note.accent}00`,
                        `0 0 8px ${note.accent}40`,
                        `0 0 0px ${note.accent}00`,
                    ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                <span style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: isMobile ? '0.74rem' : '0.92rem',
                    color: '#374151', fontWeight: 'bold', lineHeight: 1.3,
                    whiteSpace: 'normal'
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
            <div style={{ display: 'flex', gap: '3px', flexShrink: 0, flexWrap: 'nowrap', minWidth: 'max-content' }}>
                {chapter.pages && chapter.pages.length > 0 && (
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
                {chapter.links.en && (
                    <motion.a href={chapter.links.en} target="_blank" rel="noopener noreferrer"
                        whileTap={{ scale: 0.95 }} style={linkStyle(note.accent)}>
                        <Globe size={isMobile ? 9 : 11} /> EN
                    </motion.a>
                )}
                {jpLinks.length === 1 && (
                    <motion.a href={jpLinks[0]} target="_blank" rel="noopener noreferrer"
                        whileTap={{ scale: 0.95 }} style={linkStyle('var(--pop-pink)')}>
                        <Languages size={isMobile ? 9 : 11} /> JP
                    </motion.a>
                )}
                {jpLinks.length > 1 && jpLinks.map((link, i) => (
                    <motion.a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        whileTap={{ scale: 0.95 }} style={linkStyle('var(--pop-pink)')}>
                        <Languages size={isMobile ? 9 : 11} /> {i + 1}
                    </motion.a>
                ))}
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
        overflowX: isMobile ? 'visible' : 'auto', paddingBottom: '2px', alignItems: 'flex-end', justifyContent: isMobile ? 'center' : 'flex-start'
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
const MobileChapters = ({ activeVol, setActiveVol, volume, volChapters, volColor, goPrev, goNext, onReadChapter }) => (
    <div style={{
        width: '100%', padding: '10px 8px',
        display: 'flex', flexDirection: 'column',
        overflow: 'visible', flex: 1
    }}>
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

                    {/* Volume info */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{
                            fontFamily: 'var(--font-main)', fontSize: '1.4rem',
                            fontWeight: 'normal', color: volColor, marginBottom: '2px', lineHeight: 1.1
                        }}>{volume.title}</p>
                        <p style={{
                            fontFamily: 'var(--font-hand)', fontSize: '0.85rem', color: '#9ca3af'
                        }}>
                            Ch. {volume.chapters[0]}–{volume.chapters[volume.chapters.length - 1]}
                            {volume.inProgress && <span style={{ color: '#f59e0b', marginLeft: '5px' }}>✦ ongoing</span>}
                        </p>
                    </div>

                    {/* Next arrow */}
                    <NavBtn onClick={goNext} disabled={activeVol === VOLUMES.length - 1} volColor={volColor} isMobile>
                        <ChevronRight size={16} />
                    </NavBtn>
                </div>

                {/* Chapter list */}
                <div style={{
                    display: 'flex', flexDirection: 'column',
                    gap: '5px', width: '100%'
                }}>
                    {volChapters.map((ch, idx) => (
                        <ChapterRow key={ch.number} chapter={ch} index={idx} isMobile onReadChapter={onReadChapter} />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
);

/* ─── DESKTOP layout ─── */
const DesktopChapters = ({ activeVol, setActiveVol, volume, volChapters, volColor, goPrev, goNext, onReadChapter }) => (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={22} style={{ color: 'var(--pop-blue)' }} />
                <span style={{
                    fontFamily: 'var(--font-main)', color: '#6b7280',
                    fontSize: '1.3rem', fontWeight: 'normal',
                }}>Chapters</span>
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
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            style={{
                                fontFamily: 'var(--font-main)', fontSize: '1.5rem',
                                fontWeight: 'normal', color: volColor, marginBottom: '2px'
                            }}>{volume.title}</motion.p>
                        <p style={{ fontFamily: 'var(--font-hand)', fontSize: '0.9rem', color: '#9ca3af' }}>
                            Chapters {volume.chapters[0]} – {volume.chapters[volume.chapters.length - 1]}
                            {volume.inProgress && <span style={{ color: '#f59e0b', marginLeft: '6px' }}>✦ ongoing</span>}
                        </p>
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
                    gap: '8px', overflowY: 'auto', maxHeight: '530px'
                }}>
                    {volChapters.map((ch, idx) => (
                        <ChapterRow key={ch.number} chapter={ch} index={idx} isMobile={false} onReadChapter={onReadChapter} />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
);

/* ─── Main export ─── */
const ChaptersPage = ({ isMobile, onReadChapter }) => {
    const [activeVol, setActiveVol] = useState(VOLUMES.length - 1);
    const volume = VOLUMES[activeVol];
    const volChapters = volume.chapters.map(num => CHAPTERS.find(c => c.number === num)).filter(Boolean);
    const volColor = VOL_COLORS[volume.number] || '#9ca3af';

    const goPrev = () => setActiveVol(prev => Math.max(0, prev - 1));
    const goNext = () => setActiveVol(prev => Math.min(VOLUMES.length - 1, prev + 1));

    const shared = { activeVol, setActiveVol, volume, volChapters, volColor, goPrev, goNext, onReadChapter };

    return isMobile ? <MobileChapters {...shared} /> : <DesktopChapters {...shared} />;
};

export default ChaptersPage;
