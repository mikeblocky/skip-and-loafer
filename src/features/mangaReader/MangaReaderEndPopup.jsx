import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Fab from './Fab';
import { MODE } from './constants';

const MangaReaderEndPopup = ({
  showEndPopup,
  isMobile,
  chapterNumber,
  cooldownRemaining,
  autoNextCountdown,
  onNextChapter,
  onPrevChapter,
  onClose,
  setShowEndPopup,
  setPage,
  mode,
  imgRefs,
  t,
}) => (
  <AnimatePresence>
    {showEndPopup && (
      <motion.div
        initial={{ opacity: 0, y: -20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -20, x: '-50%' }}
        style={{
          position: 'absolute',
          top: isMobile ? '60px' : '40px',
          left: '50%',
          zIndex: 10000,
          background: '#fff8ef',
          border: '3px solid #0f172a',
          borderBottom: '8px solid #ff9ec6',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '16px 20px',
          width: 'auto',
          minWidth: 'min(300px, 92vw)',
          boxShadow: '8px 8px 0px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-main)', color: '#0f172a', fontSize: '1.15rem', fontWeight: '900', lineHeight: 1.2 }}>
              Chapter {chapterNumber} ended
            </span>
            {cooldownRemaining === 0 ? (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{
                  fontFamily: 'var(--font-hand)',
                  color: '#059669',
                  fontSize: '0.85rem',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ✓ +1 read counted!
              </motion.span>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-hand)',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  marginTop: '2px',
                }}
              >
                Reread count in {cooldownRemaining}s
              </span>
            )}
          </div>
          <Fab onClick={() => setShowEndPopup(false)} size={28} style={{ background: '#f1f5f9', border: '2px solid #0f172a', borderBottom: '3.5px solid #0f172a', color: '#0f172a' }}>
            <X size={14} strokeWidth={3} />
          </Fab>
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-main)',
            fontWeight: '900',
            color: '#be185d',
            background: 'rgba(255,158,198,0.12)',
            padding: '8px',
            borderRadius: '10px',
            border: '2px solid #ff9ec6',
          }}
        >
          <span>{onNextChapter ? 'Auto-next in ' : 'Auto-close in '} <strong style={{ color: '#dc2626' }}>{autoNextCountdown}s</strong>...</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: '4px' }}>
          <Fab 
            disabled={!onPrevChapter} 
            onClick={() => { setShowEndPopup(false); onPrevChapter?.(); }} 
            size={38} 
            style={{ 
              flex: 1, 
              fontSize: '0.78rem', 
              fontFamily: 'var(--font-main)', 
              fontWeight: '900', 
              background: '#f1f5f9',
              color: '#0f172a',
              border: '2.5px solid #0f172a',
              borderBottom: '5px solid #0f172a',
              borderRadius: '12px'
            }}
          >
            Previous
          </Fab>
          <Fab
            active={true}
            onClick={() => {
              setShowEndPopup(false);
              if (onNextChapter) onNextChapter();
              else if (onClose) onClose();
            }}
            size={38}
            style={{ 
              flex: 1, 
              fontSize: '0.78rem', 
              fontFamily: 'var(--font-main)', 
              fontWeight: '900',
              border: '2.5px solid #0f172a',
              borderBottom: '5px solid #0f172a',
              borderRadius: '12px'
            }}
          >
            {onNextChapter ? 'Next Chapter' : 'Close'}
          </Fab>
        </div>

        <Fab
          onClick={() => {
            setShowEndPopup(false);
            setPage(0);
            if (mode === MODE.SCROLL && imgRefs.current[0]) {
              imgRefs.current[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          size={34}
          style={{ 
            width: '100%', 
            marginTop: '4px', 
            fontSize: '0.8rem', 
            fontFamily: 'var(--font-main)', 
            fontWeight: '900', 
            background: '#ffffff', 
            color: '#0f172a', 
            border: '2.5px dashed #0f172a', 
            borderBottom: '4.5px solid #0f172a',
            borderRadius: '12px'
          }}
        >
          {mode === MODE.SCROLL ? t.returnToTop : t.returnToFirstPage}
        </Fab>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MangaReaderEndPopup;
