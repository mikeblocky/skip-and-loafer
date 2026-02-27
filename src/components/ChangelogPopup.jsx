/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Bug, Cake, BookOpen, Trash2, ShoppingBag, Images } from 'lucide-react';

/**
 * Bump this version string every time you add new changelog entries.
 * The popup only shows if the user hasn't seen this exact version.
 */
const CHANGELOG_VERSION = '2026-02-27-v3';
const STORAGE_KEY = 'skip_changelogSeen';

const CHANGELOG_ENTRIES = [
    {
        icon: <Images size={14} />,
        type: 'new',
        text: 'Gallery tab — browse fan art, tweets, stickers, and more by category',
    },
    {
        icon: <Cake size={14} />,
        type: 'new',
        text: 'Birthday calendar — see upcoming character birthdays',
    },
    {
        icon: <BookOpen size={14} />,
        type: 'new',
        text: '+1 Read button to manually track rereads per chapter',
    },
    {
        icon: <ShoppingBag size={14} />,
        type: 'new',
        text: 'Added volume purchase buttons',
    },
    {
        icon: <Zap size={14} />,
        type: 'improved',
        text: 'Sync now works across all pages and on mobile',
    },
    {
        icon: <Trash2 size={14} />,
        type: 'removed',
        text: 'Native reader and translated chapters',
    },
    {
        icon: <Bug size={14} />,
        type: 'fix',
        text: 'Fixed read counts showing different numbers between synced devices',
    },
    {
        icon: <Bug size={14} />,
        type: 'fix',
        text: 'Disconnecting a sync key now fully resets local progress',
    },
];

const TYPE_COLORS = {
    new: { bg: '#dbeafe', text: '#1e40af', label: 'New' },
    improved: { bg: '#d1fae5', text: '#065f46', label: 'Improved' },
    removed: { bg: '#fee2e2', text: '#991b1b', label: 'Removed' },
    fix: { bg: '#fef3c7', text: '#92400e', label: 'Fix' },
};

const ChangelogPopup = ({ isMobile }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        try {
            const seen = localStorage.getItem(STORAGE_KEY);
            if (seen !== CHANGELOG_VERSION) {
                setShow(true);
            }
        } catch { /* ignore */ }
    }, []);

    const handleClose = () => {
        setShow(false);
        try {
            localStorage.setItem(STORAGE_KEY, CHANGELOG_VERSION);
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
                            <h2 style={{
                                fontFamily: 'var(--font-main)', color: '#374151',
                                fontSize: isMobile ? '1.2rem' : '1.4rem', margin: 0,
                            }}>
                                What&apos;s new
                            </h2>
                        </div>

                        {/* Entries */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            {CHANGELOG_ENTRIES.map((entry, i) => {
                                const typeStyle = TYPE_COLORS[entry.type] || TYPE_COLORS.fix;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                                            padding: '10px 12px',
                                            background: '#fafafa',
                                            borderRadius: '10px',
                                            border: '1px solid #e5e7eb',
                                        }}
                                    >
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-hand)',
                                            padding: '2px 8px', borderRadius: '9999px',
                                            background: typeStyle.bg, color: typeStyle.text,
                                            flexShrink: 0, whiteSpace: 'nowrap', marginTop: '1px',
                                        }}>
                                            {entry.icon} {typeStyle.label}
                                        </span>
                                        <span style={{
                                            fontFamily: 'var(--font-hand)', color: '#374151',
                                            fontSize: isMobile ? '0.85rem' : '0.9rem', lineHeight: 1.4,
                                        }}>
                                            {entry.text}
                                        </span>
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
                                Got it!
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChangelogPopup;
