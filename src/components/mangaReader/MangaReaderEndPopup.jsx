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
          background: 'rgba(15,15,15,0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,158,198,0.3)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 16px',
          width: 'auto',
          minWidth: 'min(280px, 90vw)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-hand)', color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>
              Chapter {chapterNumber} ended
            </span>
            {cooldownRemaining === 0 ? (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{
                  fontFamily: 'var(--font-hand)',
                  color: '#ff9ec6',
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
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
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.75rem',
                  marginTop: '4px',
                }}
              >
                Reread count in {cooldownRemaining}s
              </span>
            )}
          </div>
          <Fab onClick={() => setShowEndPopup(false)} size={28} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)' }}>
            <X size={16} />
          </Fab>
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-hand)',
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(0,0,0,0.2)',
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span>{onNextChapter ? 'Auto-next in ' : 'Auto-close in '} <strong style={{ color: '#ff9ec6' }}>{autoNextCountdown}s</strong>...</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <Fab disabled={!onPrevChapter} onClick={() => { setShowEndPopup(false); onPrevChapter?.(); }} size={36} style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold', background: 'rgba(255,255,255,0.08)' }}>
            Previous chapter
          </Fab>
          <Fab
            active={true}
            onClick={() => {
              setShowEndPopup(false);
              if (onNextChapter) onNextChapter();
              else if (onClose) onClose();
            }}
            size={36}
            style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold' }}
          >
            {onNextChapter ? 'Next chapter' : 'Close reader'}
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
          size={32}
          style={{ width: '100%', marginTop: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(255,255,255,0.2)' }}
        >
          {mode === MODE.SCROLL ? t.returnToTop : t.returnToFirstPage}
        </Fab>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MangaReaderEndPopup;
