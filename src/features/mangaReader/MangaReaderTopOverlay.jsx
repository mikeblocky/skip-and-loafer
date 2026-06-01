import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Fab from './Fab';
import { MODE } from './constants';
import { getChapterDisplayTitle } from '../../data/chapterTitles';

const MangaReaderTopOverlay = ({ showOverlay, showNav, isMobile, btnSize, iconMain, onClose, chapter, page, total, mode, spreadIdx, uiLanguage = 'en' }) => (
    <>
        <AnimatePresence>
            {showOverlay && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    style={{ position: 'absolute', top: isMobile ? '24px' : '16px', right: isMobile ? '8px' : '20px', zIndex: 100 }}
                >
                    <div
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        style={{ padding: '24px', margin: '-12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'none' }}
                    >
                        <Fab 
                            onClick={onClose} 
                            size={btnSize} 
                            style={{
                                borderRadius: '50%',
                                background: '#ef4444',
                                border: '2.5px solid #0f172a',
                                borderBottom: '4.5px solid #991b1b',
                                color: '#ffffff',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                            }}
                        >
                            <X size={iconMain} strokeWidth={3} />
                        </Fab>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showNav && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    style={{
                        position: 'absolute', top: isMobile ? '38px' : '20px',
                        left: isMobile ? '8px' : '20px', right: isMobile ? '8px' : 'auto', zIndex: 30,
                        display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '5px',
                    }}
                >
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: isMobile ? 'center' : 'flex-start', 
                        pointerEvents: 'auto',
                        background: '#ffffff',
                        border: '2.5px solid #0f172a',
                        borderBottom: '5px solid #ff9ec6',
                        borderRadius: '14px',
                        padding: '6px 14px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-main)', 
                            fontSize: isMobile ? '0.88rem' : '0.92rem',
                            fontWeight: '900', 
                            color: '#0f172a',
                            lineHeight: 1.2,
                        }}>
                            Chapter {chapter.displayNumber ?? chapter.number}
                            {getChapterDisplayTitle(chapter, uiLanguage) && (
                                <span style={{
                                    fontFamily: 'var(--font-hand)',
                                    fontSize: isMobile ? '0.78rem' : '0.8rem',
                                    color: '#475569', 
                                    fontWeight: 'bold',
                                    maxWidth: isMobile ? '160px' : '280px', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    marginLeft: '6px'
                                }}>— {getChapterDisplayTitle(chapter, uiLanguage)}</span>
                            )}
                        </span>
                        <span style={{ 
                            fontFamily: 'var(--font-hand)', 
                            fontSize: '0.72rem', 
                            color: '#64748b', 
                            fontWeight: 'bold',
                            marginTop: '2px',
                            lineHeight: 1,
                        }}>
                            {mode === MODE.SPREAD ? `${spreadIdx + 1}–${Math.min(spreadIdx + 2, total)}` : page + 1} / {total}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
);

export default MangaReaderTopOverlay;
