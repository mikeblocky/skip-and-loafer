import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Fab from './Fab';
import { MODE } from './constants';

const MangaReaderSideArrows = ({ mode, showNav, isMobile, rtl, go, canPrev, canNext }) => {
    if (mode === MODE.SCROLL) return null;

    const step = mode === MODE.SPREAD ? 2 : 1;

    return (
        <AnimatePresence>
            {showNav && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', left: isMobile ? '2px' : '6px',
                            top: '50%', transform: 'translateY(-50%)', zIndex: 25,
                        }}
                    >
                        <Fab onClick={() => { rtl ? go(step) : go(-step); }}
                            disabled={!canPrev} size={isMobile ? 44 : 42}
                            style={{ background: isMobile ? 'transparent' : 'rgba(0,0,0,0.3)', border: 'none', color: isMobile ? 'rgba(255,255,255,0.15)' : undefined }}>
                            <ChevronLeft size={isMobile ? 32 : 28} strokeWidth={1} />
                        </Fab>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', right: isMobile ? '2px' : '6px',
                            top: '50%', transform: 'translateY(-50%)', zIndex: 25,
                        }}
                    >
                        <Fab onClick={() => { rtl ? go(-step) : go(step); }}
                            disabled={!canNext} size={isMobile ? 44 : 42}
                            style={{ background: isMobile ? 'transparent' : 'rgba(0,0,0,0.3)', border: 'none', color: isMobile ? 'rgba(255,255,255,0.15)' : undefined }}>
                            <ChevronRight size={isMobile ? 32 : 28} strokeWidth={1} />
                        </Fab>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MangaReaderSideArrows;
