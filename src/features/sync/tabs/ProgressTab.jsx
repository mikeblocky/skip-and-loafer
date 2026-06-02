import { motion } from 'framer-motion';
import { Tv, Award, BookOpen } from 'lucide-react';
import { VOLUMES, isMainChapter, VOL_COLORS } from '../../../data/chapters';
import { VOL_BGS, getVolumeTitle } from '../syncConfig';
import { triggerHaptic } from '../../../utils/haptics';

const ProgressTab = ({
  isMobile,
  setExpandedVol,
  uiLanguage,
  finished,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* ── SHELF DECORATIVE BANNER ── */}
      <div style={{
        width: '100%',
        padding: '12px 16px',
        background: 'var(--themed-bookshelf-header-bg, linear-gradient(90deg, #eff6ff 0%, #fff 100%))',
        border: '2px solid var(--themed-bookshelf-header-border, #bfdbfe)',
        borderBottom: '4px solid var(--themed-bookshelf-header-border, #93c5fd)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: '"Coming Soon", cursive', fontSize: isMobile ? '0.86rem' : '0.94rem', color: 'var(--themed-bookshelf-header-text, #1e3a8a)', fontWeight: '400' }}>
            {uiLanguage === 'ja' ? '巻をタップして、各話の進捗と購入リンクを表示します' : 'Tap a volume to view chapter progress & purchase links!'}
          </span>
        </div>
      </div>

      {/* ── MANGA LIBRARY SHELF GRID ── */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(130px, 1fr))' : 'repeat(auto-fill, minmax(170px, 1fr))', 
          columnGap: isMobile ? '12px' : '24px', 
          rowGap: isMobile ? '24px' : '36px', 
          alignItems: 'start',
          width: '100%',
          padding: '10px 4px 40px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {VOLUMES.map((vol, idx) => {
          const mainVolChapters = vol.chapters.filter((num) => isMainChapter(num));
          const finishedCount = mainVolChapters.filter((chapterNumber) => finished.has(chapterNumber)).length;
          const totalCount = mainVolChapters.length;
          const progress = totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0;
          const isFinished = progress === 100;
          const accent = isFinished ? '#10b981' : (VOL_COLORS[vol.number] || '#8b5cf6');
          const panelBg = isFinished ? '#e6f4ea' : (VOL_BGS[vol.number] || '#ffffff');

          return (
            <div 
              key={vol.number} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                width: '100%',
                position: 'relative',
              }}
            >
              {/* Physical 3D Book Cover Card */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.035, type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={isMobile ? {} : { 
                  y: -10, 
                  rotateY: -8, 
                  rotateZ: 0.5,
                  boxShadow: `0 14px 28px ${accent}25, 4px 8px 16px rgba(0,0,0,0.12)`,
                  transition: { type: 'spring', stiffness: 350, damping: 15 } 
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  triggerHaptic('impactLight');
                  setExpandedVol(vol.number);
                }}
                style={{
                  width: '100%',
                  aspectRatio: '11 / 16',
                  borderRadius: '12px',
                  background: vol.cover ? 'var(--surface-card, #ffffff)' : `linear-gradient(135deg, ${panelBg} 0%, var(--surface-card, #ffffff) 100%)`,
                  border: `2.5px solid ${accent}`,
                  boxShadow: `0 6px 14px ${accent}12, 2px 4px 8px rgba(0,0,0,0.06)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'visible',
                  padding: 0,
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                  boxSizing: 'border-box'
                }}
              >
                
                {/* 3D Stacked Page Edges (Right Edge) */}
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  bottom: '3px',
                  right: '-5px',
                  width: '5px',
                  background: '#fcfcf9',
                  border: '1.5px solid #cbd5e1',
                  borderLeft: 'none',
                  borderRadius: '0 4px 4px 0',
                  zIndex: -1,
                  boxShadow: 'inset -2px 0 2px rgba(0,0,0,0.05)'
                }} />
                
                {/* 3D Stacked Page Edges (Bottom Edge) */}
                <div style={{
                  position: 'absolute',
                  left: '3px',
                  right: '3px',
                  bottom: '-5px',
                  height: '5px',
                  background: '#fcfcf9',
                  border: '1.5px solid #cbd5e1',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  zIndex: -1,
                  boxShadow: 'inset 0 -2px 2px rgba(0,0,0,0.05)'
                }} />

                {/* Overlapping Bookmark Ribbon (Progress Tag) */}
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '12px',
                  width: '26px',
                  height: '38px',
                  background: accent,
                  zIndex: 4,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '2px 0',
                  boxSizing: 'border-box'
                }}>
                  <span style={{ 
                    color: '#ffffff', 
                    fontFamily: 'var(--font-main)', 
                    fontSize: '0.62rem', 
                    fontWeight: '700', 
                    lineHeight: 1,
                    textAlign: 'center'
                  }}>
                    {progress}%
                  </span>
                </div>

                {/* 100% Completion Gold Award Stamp */}
                {isFinished && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: -12 }}
                    transition={{ type: 'spring', delay: idx * 0.05 + 0.1 }}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      zIndex: 3,
                      background: 'linear-gradient(135deg, #fef08a 0%, #fbbf24 100%)',
                      border: '2px solid #b45309',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
                    }}
                  >
                    <Award size={14} color="#b45309" strokeWidth={2.8} />
                  </motion.div>
                )}

                {/* Anime Season Badge Overlay */}
                {vol.anime && (
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    zIndex: 3,
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(3px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '8px',
                    padding: '2px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    <Tv size={9} color="#fff" />
                    <span style={{ color: '#fff', fontSize: '0.52rem', fontFamily: 'var(--font-hand)', fontWeight: '400' }}>TV</span>
                  </div>
                )}

                {/* Book Spine Overlay (Left Book Fold Effect) */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: '8px',
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.06) 50%, rgba(255,255,255,0.08) 100%)',
                  zIndex: 2,
                  borderRadius: '10px 0 0 10px'
                }} />

                {/* Cover Image or Styled Placeholder */}
                {vol.cover ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img 
                      src={vol.cover} 
                      alt={`Volume ${vol.number} Cover`} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} 
                    />
                    {/* Glossy Overlay Reflection */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)',
                      pointerEvents: 'none'
                    }} />
                  </div>
                ) : (
                  // Styled Notebook Diary Placeholder (e.g. Volume 14)
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: `linear-gradient(135deg, ${panelBg} 0%, var(--surface-card, #ffffff) 100%)`,
                    position: 'relative',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}>
                    {/* Sketch Grid */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                      opacity: 0.8
                    }} />
                    
                    {/* Hand-drawn style dashed border */}
                    <div style={{
                      position: 'absolute',
                      inset: '6px',
                      border: `1.5px dashed ${accent}`,
                      borderRadius: '8px',
                      pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1, marginTop: '12px' }}>
                      <span style={{ 
                        fontFamily: '"Coming Soon", cursive', 
                        fontSize: isMobile ? '0.78rem' : '0.86rem', 
                        fontWeight: '700', 
                        color: accent,
                        padding: '2px 8px',
                        background: 'var(--surface-card, #ffffff)',
                        border: `1.5px solid ${accent}`,
                        borderRadius: '999px',
                        lineHeight: 1
                      }}>
                        Vol {vol.number}
                      </span>
                      <span style={{ 
                        fontFamily: '"Coming Soon", cursive', 
                        fontSize: isMobile ? '0.62rem' : '0.68rem', 
                        color: 'var(--text-muted, #64748b)', 
                        fontWeight: '400',
                        marginTop: '4px',
                        textAlign: 'center'
                      }}>
                        {vol.inProgress ? 'In Progress' : 'Latest'}
                      </span>
                    </div>

                    <div style={{
                      zIndex: 1,
                      marginBottom: '10px'
                    }}>
                      <BookOpen size={isMobile ? 24 : 32} color={accent} strokeWidth={1.8} style={{ opacity: 0.8 }} />
                    </div>
                  </div>
                )}
              </motion.button>

              {/* Volume Title Labels Beneath Book */}
              <div style={{
                marginTop: '10px',
                textAlign: 'center',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <span style={{ 
                  fontFamily: '"Coming Soon", cursive', 
                  fontSize: isMobile ? '0.82rem' : '0.9rem', 
                  fontWeight: '400', 
                  color: 'var(--text-primary, #1e293b)',
                  lineHeight: 1.2
                }}>
                  {getVolumeTitle(uiLanguage, vol.number)}
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-hand)', 
                  fontSize: isMobile ? '0.66rem' : '0.74rem', 
                  color: 'var(--text-secondary, #64748b)',
                  lineHeight: 1.1
                }}>
                  {finishedCount}/{totalCount} {uiLanguage === 'ja' ? '話完了' : 'chapters'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ProgressTab;
