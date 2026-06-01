import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODE } from './constants';

const MangaReaderProgressBar = ({
  showNav,
  isMobile,
  mode,
  rtl,
  page,
  total,
  imgRefs,
  setPage,
}) => {
  const [previewPage, setPreviewPage] = useState(null);
  const isScroll = mode === MODE.SCROLL;
  const effectiveRtl = isScroll ? false : rtl;
  const safeDenominator = Math.max(total - 1, 1);
  const progressPct = total > 1 ? (page / safeDenominator) * 100 : 100;

  const resolveProgressPage = (event, barElement) => {
    const rect = barElement.getBoundingClientRect();
    let percent = (event.clientX - rect.left) / rect.width;
    if (effectiveRtl) percent = 1 - percent;
    percent = Math.max(0, Math.min(1, percent));
    return Math.round(percent * safeDenominator);
  };

  return (
    <AnimatePresence>
      {showNav && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'absolute',
            bottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : 0,
            left: isMobile ? '16px' : 0,
            right: isMobile ? '16px' : 0,
            zIndex: 40,
            height: isMobile ? '36px' : '22px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: isMobile ? 'center' : 'flex-end',
          }}
          onPointerDown={(event) => {
            const nextPage = resolveProgressPage(event, event.currentTarget);
            setPreviewPage(nextPage);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (previewPage === null) return;
            const nextPage = resolveProgressPage(event, event.currentTarget);
            setPreviewPage(nextPage);
          }}
          onPointerUp={(event) => {
            if (previewPage !== null) {
              if (mode === MODE.SCROLL) {
                imgRefs.current[previewPage]?.scrollIntoView({ behavior: 'smooth' });
              } else {
                setPage(previewPage);
              }
              setPreviewPage(null);
            }
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => setPreviewPage(null)}
        >
          {previewPage !== null && (
            <div
              style={{
                position: 'absolute',
                bottom: isMobile ? '40px' : '26px',
                left: `${effectiveRtl ? 100 - (previewPage / safeDenominator) * 100 : (previewPage / safeDenominator) * 100}%`,
                transform: 'translateX(-50%)',
                background: 'rgba(20,20,20,0.92)',
                backdropFilter: 'blur(6px)',
                borderRadius: '8px',
                padding: '4px 10px',
                border: '1px solid rgba(255,255,255,0.1)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-hand)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#ff9ec6',
                }}
              >
                {previewPage + 1} / {total}
              </span>
            </div>
          )}

          <div
            style={{
              width: '100%',
              height: isMobile ? '10px' : '14px',
              background: '#ffffff',
              borderRadius: '6px',
              border: '2px solid #0f172a',
              boxShadow: '2px 2px 0px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: 'repeating-linear-gradient(90deg, #cbd5e1, #cbd5e1 1px, transparent 1px, transparent 12px)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: effectiveRtl ? 'auto' : 0,
                right: effectiveRtl ? 0 : 'auto',
                width: `${previewPage !== null ? (previewPage / safeDenominator) * 100 : progressPct}%`,
                background: '#ff9ec6',
                borderRight: effectiveRtl ? 'none' : '2.2px solid #0f172a',
                borderLeft: effectiveRtl ? '2.2px solid #0f172a' : 'none',
                transition: previewPage !== null ? 'none' : 'width 0.15s ease-out',
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(15,23,42,0.1), rgba(15,23,42,0.1) 1px, transparent 1px, transparent 12px)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MangaReaderProgressBar;
