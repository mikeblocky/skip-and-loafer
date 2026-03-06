import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Fab from './Fab';
import { MODE } from './constants';

const MangaReaderTopOverlay = ({ showOverlay, showNav, isMobile, btnSize, iconMain, onClose, chapter, page, total, mode, spreadIdx }) => (
    <>
        <AnimatePresence>
            {showOverlay && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'absolute', top: isMobile ? '24px' : '12px', right: isMobile ? '8px' : '14px', zIndex: 100 }}
                >
                    <div
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        style={{ padding: '24px', margin: '-12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'none' }}
                    >
                        <Fab onClick={onClose} size={btnSize} style={isMobile ? { background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' } : {}}>
                            <X size={iconMain} />
                        </Fab>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showNav && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                        position: 'absolute', top: isMobile ? '42px' : '16px',
                        left: isMobile ? 0 : '16px', right: isMobile ? 0 : 'auto', zIndex: 30,
                        display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '5px',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', pointerEvents: 'auto' }}>
                        <span style={{
                            fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.85rem' : '0.75rem',
                            fontWeight: 'bold', color: 'rgba(255,255,255,0.6)',
                        }}>
                            Chapter {chapter.displayNumber ?? chapter.number}
                            {chapter.title && (
                                <span style={{
                                    fontSize: isMobile ? '0.7rem' : '0.62rem',
                                    color: 'rgba(255,255,255,0.3)', fontWeight: 'normal',
                                    maxWidth: isMobile ? '160px' : '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    marginLeft: '4px'
                                }}> — {chapter.title}</span>
                            )}
                        </span>
                        <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: isMobile ? '2px' : '0px' }}>
                            {mode === MODE.SPREAD ? `${spreadIdx + 1}–${Math.min(spreadIdx + 2, total)}` : page + 1} / {total}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
);

export default MangaReaderTopOverlay;
