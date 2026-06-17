import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { ENTER_SPRING_BOUNCY, JELLY_TAP, JELLY_HOVER, SQUASH_TRANSITION } from './animationPresets';
import { PAPER_FONT_FAMILY } from './paper/paperTheme';
import {
    STORAGE_KEY,
    CHANGELOG_VERSION,
    RELEASE_DATE,
    formatReleaseDate,
    getUtcOffsetLabel,
    CHANGELOG_SERIES,
    TYPE_META,
    UI_TEXT,
} from '../../features/changelog/changelogConfig';

const SPRING_POP  = { type: 'spring', stiffness: 480, damping: 22 };
const SPRING_SOFT = { type: 'spring', stiffness: 280, damping: 22 };

const WASHI_COLORS = ['washi-tape--blue', 'washi-tape--pink', 'washi-tape--yellow', 'washi-tape--blue', 'washi-tape--pink', 'washi-tape--yellow'];
const WASHI_ROTATIONS = ['-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg', '1deg'];

const DOT_TYPE_META = {
  added:   { dot: '#22c55e', label: 'New' },
  changed: { dot: '#3b82f6', label: 'Updated' },
  removed: { dot: '#ef4444', label: 'Removed' },
  fixed:   { dot: '#f59e0b', label: 'Fixed' },
};

const ChangelogPopup = ({ isMobile, uiLanguage = 'en' }) => {
    const [show, setShow] = useState(false);
    const utcOffsetLabel = getUtcOffsetLabel();
    const releaseDateLabel = formatReleaseDate(RELEASE_DATE);
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
    const seenVersionKey = `${STORAGE_KEY}_${CHANGELOG_VERSION}`;

    useEffect(() => {
        try {
            const seenVersion = localStorage.getItem(seenVersionKey);
            if (seenVersion !== CHANGELOG_VERSION) {
                setShow(true);
                localStorage.setItem(seenVersionKey, CHANGELOG_VERSION);
            }
        } catch { /* ignore */ }
    }, [seenVersionKey]);

    const handleClose = () => setShow(false);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: isMobile ? '12px' : '20px',
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.88, y: 28, rotate: -1.5 }}
                        animate={{ scale: 1, y: 0, rotate: 0 }}
                        exit={{ scale: 0.88, y: 28, opacity: 0 }}
                        transition={ENTER_SPRING_BOUNCY}
                        onClick={(e) => e.stopPropagation()}
                        className="hide-scrollbar"
                        style={{
                            background: 'var(--surface-elevated, #fff)',
                            borderRadius: '24px',
                            border: '2.5px solid var(--pop-blue)',
                            borderBottom: '6px solid #1d4ed8',
                            boxShadow: '0 24px 64px rgba(15,23,42,0.18)',
                            padding: isMobile ? '18px 14px 22px' : '24px 24px 28px',
                            maxWidth: '480px',
                            width: '100%',
                            position: 'relative',
                            maxHeight: isMobile ? '88vh' : '82vh',
                            overflowY: 'auto',
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                color: 'var(--text-muted, #9ca3af)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '4px', borderRadius: '8px',
                            }}
                        >
                            <X size={18} />
                        </button>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: isMobile ? '16px' : '20px' }}>
                            <h2 style={{
                                fontFamily: PAPER_FONT_FAMILY,
                                color: 'var(--text-primary, #1e293b)',
                                fontSize: isMobile ? '1.3rem' : '1.5rem',
                                margin: '0 0 4px',
                                fontWeight: 'normal',
                            }}>
                                {t.whatsNew}
                            </h2>
                            <span style={{
                                fontFamily: 'var(--font-hand)',
                                color: 'var(--text-muted, #9ca3af)',
                                fontSize: '0.8rem',
                            }}>
                                {releaseDateLabel} · {utcOffsetLabel}
                            </span>
                        </div>

                        {/* Feature cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            {CHANGELOG_SERIES.map((feature, featureIdx) => {
                                const Icon = feature.icon;
                                const col = feature.color;
                                const washiClass = WASHI_COLORS[featureIdx % WASHI_COLORS.length];
                                const washiRotate = WASHI_ROTATIONS[featureIdx % WASHI_ROTATIONS.length];

                                return (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ ...SPRING_SOFT, delay: featureIdx * 0.06 }}
                                        style={{
                                            position: 'relative',
                                            background: col.bg,
                                            border: `2.5px solid ${col.border}`,
                                            borderBottom: `6px solid ${col.bottom}`,
                                            borderRadius: '18px',
                                            padding: isMobile ? '14px 12px 12px' : '16px 14px 14px',
                                            boxShadow: `0 6px 18px ${col.border}22`,
                                        }}
                                    >
                                        {/* Washi tape strip */}
                                        <div
                                            className={`washi-tape ${washiClass}`}
                                            style={{
                                                position: 'absolute',
                                                top: '-12px',
                                                left: '32px',
                                                transform: `rotate(${washiRotate})`,
                                                width: '68px',
                                                height: '19px',
                                                zIndex: 6,
                                            }}
                                        />

                                        {/* Section title row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
                                            <div style={{
                                                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                                                background: col.border,
                                                border: `3px solid ${col.border}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: `0 4px 10px ${col.border}55`,
                                            }}>
                                                <Icon size={14} color="#fff" strokeWidth={2.2} />
                                            </div>
                                            <span style={{
                                                fontFamily: 'Sniglet, var(--font-main)',
                                                color: 'var(--text-primary, #1e293b)',
                                                fontSize: isMobile ? '0.97rem' : '1.03rem',
                                                lineHeight: 1.2,
                                                fontWeight: 'normal',
                                            }}>
                                                {feature.title}
                                            </span>
                                        </div>

                                        {/* Lines */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '4px' }}>
                                            {feature.lines.map((line, lineIdx) => {
                                                const meta = DOT_TYPE_META[line.type] || DOT_TYPE_META.fixed;
                                                const typeLabel = t.type?.[line.type] || meta.label;
                                                return (
                                                    <div key={lineIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center',
                                                            background: '#ffffff',
                                                            border: `1.5px solid ${meta.dot}66`,
                                                            borderBottom: `3px solid ${meta.dot}`,
                                                            borderRadius: '999px',
                                                            padding: '2px 8px',
                                                            fontFamily: 'Sniglet, var(--font-main)',
                                                            fontSize: '0.6rem',
                                                            color: meta.dot,
                                                            flexShrink: 0,
                                                            lineHeight: 1.4,
                                                            marginTop: '1px',
                                                        }}>
                                                            {typeLabel}
                                                        </span>
                                                        <span style={{
                                                            fontFamily: 'var(--font-hand)',
                                                            color: 'var(--text-secondary, #374151)',
                                                            fontSize: isMobile ? '0.8rem' : '0.84rem',
                                                            lineHeight: 1.45,
                                                        }}>
                                                            {line.text}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* CTA */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <motion.button
                                whileHover={{ scale: 1.06, rotate: -2, y: -3, transition: SPRING_POP }}
                                whileTap={{ scale: 0.92, rotate: 1, transition: SPRING_POP }}
                                animate={{
                                    boxShadow: ['0 8px 22px rgba(59,130,246,0.28)', '0 12px 30px rgba(59,130,246,0.45)', '0 8px 22px rgba(59,130,246,0.28)'],
                                }}
                                transition={{ repeat: Infinity, duration: 1.8 }}
                                onClick={() => { triggerHaptic('tap'); handleClose(); }}
                                style={{
                                    background: 'var(--pop-blue, #3b82f6)',
                                    border: '2.5px solid #60a5fa',
                                    borderBottom: '6px solid #1d4ed8',
                                    color: '#fff',
                                    padding: '11px 36px',
                                    borderRadius: '16px',
                                    fontFamily: 'Sniglet, var(--font-main)',
                                    fontWeight: 'normal',
                                    fontSize: '1.05rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    lineHeight: 1,
                                }}
                            >
                                {t.gotIt}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChangelogPopup;
