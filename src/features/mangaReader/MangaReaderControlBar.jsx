import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  BookOpen,
  ArrowLeftToLine,
  ArrowRightToLine,
  AlignVerticalSpaceAround,
  StepBack,
  StepForward,
  ArrowUpToLine,
  File,
} from 'lucide-react';
import Fab from './Fab';
import { MODE } from './constants';

const HoverHint = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '14px',
      background: 'rgba(20,20,20,0.85)',
      backdropFilter: 'blur(6px)',
      padding: '4px 8px',
      borderRadius: '6px',
      color: 'rgba(255,255,255,0.8)',
      fontSize: '0.65rem',
      fontWeight: 'bold',
      fontFamily: 'var(--font-hand)',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }}
  >
    {children}
  </div>
);

const Divider = ({ isMobile }) => (
  <div
    style={{
      width: isMobile ? '1px' : '18px',
      height: isMobile ? '18px' : '1px',
      background: '#cbd5e1',
      margin: isMobile ? '0 2px' : '2px 0',
    }}
  />
);

const MangaReaderControlBar = ({
  showNav,
  isMobile,
  isNavHovered,
  setIsNavHovered,
  setShowEndPopup,
  setPage,
  mode,
  imgRefs,
  btnSize,
  page,
  rtl,
  iconMain,
  t,
  setMode,
  resetZoom,
  setRtl,
  doZoom,
  zoom,
}) => {
  return (
    <AnimatePresence>
      {showNav && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.12 }}
          style={isMobile ? {
            position: 'absolute', bottom: '50px',
            left: '8px', right: '8px',
            zIndex: 30, pointerEvents: 'none',
          } : {
            position: 'absolute', right: '60px', top: 'calc(50% - 150px)',
            transform: 'translateY(-50%)',
            zIndex: 30,
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-end', width: '100%', pointerEvents: 'auto',
          }}>
            <div className="hide-scrollbar"
              onMouseEnter={() => !isMobile && setIsNavHovered(true)}
              onMouseLeave={() => !isMobile && setIsNavHovered(false)}
              style={{
                display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: isMobile ? '4px' : '8px',
                background: '#ffffff',
                borderRadius: isMobile ? '16px' : '20px',
                padding: isMobile ? '6px 10px' : '12px 10px',
                border: '2.5px solid #0f172a',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.25)',
                overflowX: isMobile ? 'auto' : 'visible',
                overflowY: isMobile ? 'visible' : 'auto',
                maxWidth: '100%', maxHeight: '100%',
              }}>
              <div style={{ position: 'relative' }}>
                <Fab onClick={() => {
                  setShowEndPopup(false);
                  setPage(0);
                  if (mode === MODE.SCROLL && imgRefs.current[0]) {
                    imgRefs.current[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }} size={btnSize} disabled={page === 0}>
                  {mode === MODE.SCROLL ? <ArrowUpToLine size={iconMain} /> : (rtl ? <StepForward size={iconMain} /> : <StepBack size={iconMain} />)}
                </Fab>
                {!isMobile && isNavHovered && (
                  <HoverHint>{mode === MODE.SCROLL ? t.backToTop : t.firstPage}</HoverHint>
                )}
              </div>

              <Divider isMobile={isMobile} />

              {[
                { m: MODE.SINGLE, I: File, label: 'Single', key: '1' },
                { m: MODE.SPREAD, I: BookOpen, label: 'Spread', key: '2' },
                { m: MODE.SCROLL, I: AlignVerticalSpaceAround, label: 'Scroll', key: '3' },
              ].map(({ m, I: ModeIcon, label, key }) => (
                <div key={m} style={{ position: 'relative' }}>
                  <Fab active={mode === m} size={btnSize}
                    onClick={() => { setMode(m); resetZoom(); }}>
                    <ModeIcon size={iconMain} />
                  </Fab>
                  {!isMobile && isNavHovered && (
                    <HoverHint>
                      {label} <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>{key}</span>
                    </HoverHint>
                  )}
                </div>
              ))}

              <Divider isMobile={isMobile} />

              {mode !== MODE.SCROLL && (
                <div style={{ position: 'relative' }}>
                  <Fab onClick={() => setRtl((value) => !value)} size={btnSize} style={isMobile ? { padding: '0 8px', width: 'auto' } : {}}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {rtl ? <ArrowLeftToLine size={iconMain} /> : <ArrowRightToLine size={iconMain} />}
                    </div>
                  </Fab>
                  {!isMobile && isNavHovered && (
                    <HoverHint>
                      Direction <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>{rtl ? 'Right-to-Left' : 'Left-to-Right'}</span>
                    </HoverHint>
                  )}
                </div>
              )}

              <Divider isMobile={isMobile} />

              <div style={{ position: 'relative' }}>
                <Fab onClick={() => doZoom(-0.25)} disabled={zoom <= 0.5} size={btnSize}>
                  <ZoomOut size={iconMain} />
                </Fab>
                {!isMobile && isNavHovered && (
                  <HoverHint>
                    Zoom Out <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>-</span>
                  </HoverHint>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <Fab onClick={resetZoom} active={zoom !== 1} size={btnSize} style={isMobile ? { padding: '0 8px', width: 'auto' } : { height: 'auto', padding: '8px 0' }}>
                  <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: isMobile ? '0.6rem' : '0.65rem' }}>
                    {Math.round(zoom * 100)}%
                  </span>
                </Fab>
                {!isMobile && isNavHovered && (
                  <HoverHint>
                    Reset <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>0</span>
                  </HoverHint>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <Fab onClick={() => doZoom(0.25)} disabled={zoom >= 4} size={btnSize}>
                  <ZoomIn size={iconMain} />
                </Fab>
                {!isMobile && isNavHovered && (
                  <HoverHint>
                    Zoom In <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>+</span>
                  </HoverHint>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MangaReaderControlBar;
