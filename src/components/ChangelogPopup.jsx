/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
    STORAGE_KEY,
    RELEASE_DATE,
    formatReleaseDate,
    getUtcOffsetLabel,
    CHANGELOG_SERIES,
    TYPE_COLORS,
    UI_TEXT,
} from './changelog/changelogConfig';

const ChangelogPopup = ({ isMobile, uiLanguage = 'en' }) => {
    const [show, setShow] = useState(false);
    const utcOffsetLabel = getUtcOffsetLabel();
    const releaseDateLabel = formatReleaseDate(RELEASE_DATE);
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;

    useEffect(() => {
        try {
            const seen = localStorage.getItem(STORAGE_KEY);
            if (seen !== '1') {
                setShow(true);
            }
        } catch { /* ignore */ }
    }, []);

    const handleClose = () => {
        setShow(false);
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch { /* ignore */ }
    };

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
                        backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px',
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--paper-white)',
                            padding: isMobile ? '20px 16px' : '28px 28px',
                            borderRadius: '16px',
                            border: '3px solid var(--pop-blue)',
                            boxShadow: '8px 8px 0 rgba(0,0,0,0.1)',
                            maxWidth: '460px', width: '100%',
                            position: 'relative',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                        }}
                        className="hide-scrollbar"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', justifyContent: 'center', flexDirection: 'column' }}>
                            <h2 style={{
                                fontFamily: 'Sniglet, var(--font-main)', color: '#374151',
                                fontSize: isMobile ? '1.2rem' : '1.4rem', margin: 0,
                                fontWeight: 'normal',
                            }}>
                                {t.whatsNew}
                            </h2>
                            <span style={{
                                fontFamily: 'var(--font-hand)',
                                color: '#9ca3af',
                                fontSize: isMobile ? '0.75rem' : '0.8rem',
                                lineHeight: 1.2,
                            }}>
                                {t.releaseDate}: {releaseDateLabel} ({utcOffsetLabel} {t.local})
                            </span>
                        </div>

                        {/* Feature Series */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            {CHANGELOG_SERIES.map((feature, featureIdx) => {
                                const Icon = feature.icon;
                                return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: featureIdx * 0.05 }}
                                    style={{
                                        padding: isMobile ? '10px 10px' : '12px 12px',
                                        background: '#fafafa',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#6b7280', display: 'inline-flex', alignItems: 'center' }}><Icon size={14} /></span>
                                        <span style={{
                                            fontFamily: 'Sniglet, var(--font-main)',
                                            color: '#374151',
                                            fontSize: isMobile ? '0.95rem' : '1rem',
                                            lineHeight: 1.2,
                                            fontWeight: 'normal',
                                        }}>
                                            {feature.title}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {feature.lines.map((line, lineIdx) => {
                                            const baseTypeStyle = TYPE_COLORS[line.type] || TYPE_COLORS.fixed;
                                            const typeStyle = { ...baseTypeStyle, label: t.type[line.type] || baseTypeStyle.label };
                                            return (
                                                <div key={`${feature.title}-${lineIdx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        fontSize: '0.62rem',
                                                        fontWeight: 'bold',
                                                        fontFamily: 'var(--font-hand)',
                                                        padding: '2px 7px',
                                                        borderRadius: '9999px',
                                                        background: typeStyle.bg,
                                                        color: typeStyle.text,
                                                        flexShrink: 0,
                                                        marginTop: '1px',
                                                    }}>
                                                        {typeStyle.label}
                                                    </span>
                                                    <span style={{
                                                        fontFamily: 'var(--font-hand)',
                                                        color: '#374151',
                                                        fontSize: isMobile ? '0.82rem' : '0.88rem',
                                                        lineHeight: 1.35,
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

                        {/* Close CTA */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClose}
                                style={{
                                    background: 'var(--pop-blue)', border: '2px solid #60a5fa',
                                    color: '#fff', padding: '8px 28px', borderRadius: '9999px',
                                    fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: '1rem',
                                    cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
