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
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        style={{
                            position: 'absolute', left: isMobile ? '8px' : '20px',
                            top: '50%', transform: 'translateY(-50%)', zIndex: 25,
                        }}
                    >
                        <Fab onClick={() => { rtl ? go(step) : go(-step); }}
                            disabled={!canPrev} size={isMobile ? 38 : 46}
                            style={{ 
                                borderRadius: '50%', 
                                border: '2.5px solid #0f172a',
                                borderBottom: '5px solid #0f172a',
                                background: '#ffffff',
                                color: '#0f172a',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            }}>
                            <ChevronLeft size={isMobile ? 22 : 26} strokeWidth={3} />
                        </Fab>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        style={{
                            position: 'absolute', right: isMobile ? '8px' : '20px',
                            top: '50%', transform: 'translateY(-50%)', zIndex: 25,
                        }}
                    >
                        <Fab onClick={() => { rtl ? go(-step) : go(step); }}
                            disabled={!canNext} size={isMobile ? 38 : 46}
                            style={{ 
                                borderRadius: '50%', 
                                border: '2.5px solid #0f172a',
                                borderBottom: '5px solid #0f172a',
                                background: '#ffffff',
                                color: '#0f172a',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            }}>
                            <ChevronRight size={isMobile ? 22 : 26} strokeWidth={3} />
                        </Fab>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MangaReaderSideArrows;
