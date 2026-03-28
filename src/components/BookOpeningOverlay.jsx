/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Book opening animation overlay shown on page load.
 * Simulates a diary/notebook cover flipping open with 3D perspective.
 */
const BookOpeningOverlay = ({ onComplete }) => {
    const [phase, setPhase] = useState('closed'); // 'closed' -> 'opening' -> 'done'

    useEffect(() => {
        // Start opening after a tiny delay for the paint to settle
        const t1 = setTimeout(() => setPhase('opening'), 300);
        // Complete after animation finishes
        const t2 = setTimeout(() => {
            setPhase('done');
            onComplete?.();
        }, 1800);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {phase !== 'done' && (
                <motion.div
                    key="book-overlay"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#fdfaf8',
                        perspective: '1800px',
                    }}
                >
                    {/* Background pattern — notebook lines */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e8f0f8 32px)',
                        backgroundSize: '100% 32px',
                        opacity: 0.5,
                    }} />

                    {/* Book container */}
                    <div style={{
                        position: 'relative',
                        width: 'min(600px, 85vw)',
                        height: 'min(420px, 70vh)',
                        perspective: '1800px',
                        transformStyle: 'preserve-3d',
                    }}>
                        {/* Back page (stays visible as cover opens) */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'white',
                            borderRadius: '4px 12px 12px 4px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e8f0f860 32px)',
                            backgroundSize: '100% 32px',
                        }}>
                            {/* Spiral binding */}
                            <div style={{
                                position: 'absolute',
                                left: '-8px',
                                top: '10%',
                                bottom: '10%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-evenly',
                                gap: '4px',
                            }}>
                                {Array.from({ length: 8 }, (_, i) => (
                                    <div key={i} style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        border: '2.5px solid #9ca3af',
                                        background: '#f3f4f6',
                                    }} />
                                ))}
                            </div>

                            {/* Inner page content preview */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: phase === 'opening' ? 1 : 0, scale: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                style={{ textAlign: 'center' }}
                            >
                                <p style={{
                                    fontFamily: 'var(--font-hand)',
                                    fontSize: '1rem',
                                    color: '#9ca3af',
                                    letterSpacing: '0.15em',
                                }}>
                                    ✦ AGENDA ✦
                                </p>
                                <h2 style={{
                                    fontFamily: 'Sniglet, var(--font-main)',
                                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                    fontWeight: 'normal',
                                    lineHeight: 1.1,
                                    marginTop: '8px',
                                }}>
                                    <span style={{ color: 'var(--pop-blue)' }}>Skip </span>
                                    <span style={{ color: '#b0b8c0', fontSize: '0.8em' }}>&</span>
                                    <span style={{ color: 'var(--pop-pink)' }}> Loafer</span>
                                </h2>
                            </motion.div>
                        </div>

                        {/* Front cover (flips open) */}
                        <motion.div
                            initial={{ rotateY: 0 }}
                            animate={{
                                rotateY: phase === 'opening' ? -160 : 0,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 40,
                                damping: 15,
                                mass: 1.2,
                            }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                transformOrigin: 'left center',
                                transformStyle: 'preserve-3d',
                                borderRadius: '4px 12px 12px 4px',
                                backfaceVisibility: 'hidden',
                            }}
                        >
                            {/* Cover front face */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 30%, #f48fb1 70%, #ec407a 100%)',
                                borderRadius: '4px 12px 12px 4px',
                                boxShadow: '4px 4px 20px rgba(0,0,0,0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '16px',
                                padding: '40px',
                                backfaceVisibility: 'hidden',
                            }}>
                                {/* Decorative top stars */}
                                <div style={{ display: 'flex', gap: '12px', opacity: 0.7 }}>
                                    <span style={{ fontSize: '1.2rem' }}>⭐</span>
                                    <span style={{ fontSize: '0.9rem' }}>✦</span>
                                    <span style={{ fontSize: '1.2rem' }}>⭐</span>
                                </div>

                                {/* Title */}
                                <h1 style={{
                                    fontFamily: 'Sniglet, var(--font-main)',
                                    fontSize: 'clamp(1.7rem, 6vw, 3.5rem)',
                                    fontWeight: 'normal',
                                    color: 'white',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    lineHeight: 1.1,
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {'Skip\u00A0&\u00A0Loafer'}
                                </h1>

                                <p style={{
                                    fontFamily: 'var(--font-hand)',
                                    fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                                    color: 'rgba(255,255,255,0.85)',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                }}>
                                    Chapter Tracker
                                </p>

                                {/* Decorative heart */}
                                <motion.div
                                    animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{ fontSize: '2rem', marginTop: '8px' }}
                                >
                                    💕
                                </motion.div>

                                {/* Decorative bottom */}
                                <div style={{ display: 'flex', gap: '8px', opacity: 0.6, marginTop: '8px' }}>
                                    <span>✿</span>
                                    <span>✿</span>
                                    <span>✿</span>
                                </div>
                            </div>

                            {/* Cover back face (visible when flipped) */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: '#f8bbd0',
                                borderRadius: '12px 4px 4px 12px',
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }} />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BookOpeningOverlay;
