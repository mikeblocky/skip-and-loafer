import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Sparkle, ShoppingCart, BookOpen } from 'lucide-react';
import { VOLUMES, isMainChapter } from '../../../data/chapters';
import VolumePurchaseLinks from './VolumePurchaseLinks';
import { VOL_THEMES, getVolumeCardStyle, VOL_TITLE_STYLE, EXTRA_BADGE_STYLE } from '../chapterStyles';
import { useEffect, useRef } from 'react';
import { triggerHaptic } from '../../../utils/haptics';

const MobileChaptersTab = ({
  activeVol,
  setActiveVol,
  volume,
  volChapters,
  onReadChapter,
  isFinished,
  trackExternalLink,
  cancelExternalLink,
  markFinished,
  unmarkFinished,
  getReadCount,
  incrementReadCount,
  getRemainingCooldown,
  pendingLinks,
  t,
  nativePurchaseUrl,
  nativeVolumeLabel,
  enVolumeLabel,
  jpVolumeLabel,
  uiLanguage,
  getVolumeTitleFn,
  getVolumeShortWordFn,
  ChapterRowComponent,
  chapterNotes = {},
  onSaveNote,
}) => {
  const currentTheme = VOL_THEMES[volume.number] || VOL_THEMES[1];
  const showVolumeArtwork = uiLanguage !== 'ja';
  const showVolumeTitle = uiLanguage !== 'ja';
  const activeVolumeTitle = getVolumeTitleFn(uiLanguage, volume.number);

  const carouselRef = useRef(null);

  // Auto-scroll selected volume card to center of mobile viewport
  useEffect(() => {
    const container = carouselRef.current;
    if (container) {
      const activeCard = container.querySelector(`[data-vol-idx="${activeVol}"]`);
      if (activeCard) {
        const offsetLeft = activeCard.offsetLeft;
        const width = activeCard.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({
          left: offsetLeft - (containerWidth / 2) + (width / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeVol]);

  const handleSelect = (idx) => {
    triggerHaptic('tabSwitch');
    setActiveVol(idx);
  };

  return (
    <div style={{
      width: '100%',
      padding: '12px 10px 80px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      overflow: 'visible',
    }}>
      
      {/* TOP CAROUSEL SHELF: Horizontal Swipeable Covers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 8px',
        }}>
          <BookOpen size={16} style={{ color: 'var(--themed-bookshelf-header-icon, #0066ff)' }} />
          <span style={{
            fontFamily: 'Sniglet, var(--font-main)',
            fontSize: '0.9rem',
            color: 'var(--themed-bookshelf-header-text, #1e3a8a)',
            fontWeight: '400',
          }}>
            {t.mangaShelf || 'List of volumes'} ({VOLUMES.length} vols)
          </span>
        </div>

        <div 
          ref={carouselRef}
          className="hide-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 12px 16px 12px',
            overflowX: 'auto',
            scrollSnapType: 'x proximity',
            width: '100%',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {VOLUMES.map((vol, idx) => {
            const isActive = idx === activeVol;
            const theme = VOL_THEMES[vol.number] || VOL_THEMES[1];
            const title = getVolumeTitleFn(uiLanguage, vol.number);

            // Calculate progress metrics
            const mainChapters = vol.chapters.filter(isMainChapter);
            const totalChs = mainChapters.length;
            const doneChs = mainChapters.filter(chNum => isFinished?.(chNum)).length;
            const isVolFinished = doneChs === totalChs;
            const hasStarted = doneChs > 0;

            return (
              <motion.div
                key={vol.number}
                data-vol-idx={idx}
                onClick={() => handleSelect(idx)}
                whileHover={{ y: -1.5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flexShrink: 0,
                  width: '64px',
                  aspectRatio: '2/3',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: isActive ? `2px solid ${theme.border}` : `2px solid var(--themed-card-inactive-border, #cbd5e1)`,
                  borderRight: isActive ? `3.5px solid ${theme.border}` : `2px solid var(--themed-card-inactive-border, #cbd5e1)`,
                  borderBottom: isActive ? `4.5px solid ${theme.border}` : `3.5px solid var(--themed-card-inactive-border, #cbd5e1)`,
                  boxShadow: isActive ? `0 6px 14px ${theme.shadow}` : '0 2px 6px rgba(0,0,0,0.05)',
                  background: isActive ? `var(--themed-card-bg, ${theme.surface})` : 'var(--themed-card-inactive-bg, #fff)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  scrollSnapAlign: 'center',
                }}
              >
                {/* Cover Image */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '7px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: vol.cover ? 'var(--themed-card-bg, #fff)' : `var(--themed-cover-placeholder-bg, ${theme.surface})`,
                  opacity: isActive ? 1 : 0.8,
                }}>
                  {showVolumeArtwork && vol.cover ? (
                    <img src={vol.cover} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
                  ) : (
                    <span style={{
                      fontFamily: 'Sniglet, var(--font-main)',
                      fontSize: '1rem',
                      fontWeight: '400',
                      color: theme.accent,
                      opacity: 0.45,
                      textAlign: 'center',
                      lineHeight: 1.1,
                    }}>
                      {vol.number}
                    </span>
                  )}
                </div>

                {/* Progress Mini Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: isVolFinished 
                    ? 'var(--pop-green, #10b981)' 
                    : hasStarted 
                      ? theme.accent 
                      : '#6b7280',
                  color: '#fff',
                  border: `1.5px solid ${isVolFinished ? '#047857' : theme.border}`,
                  borderRadius: '9999px',
                  padding: '1px 5px',
                  fontSize: '0.55rem',
                  fontFamily: 'var(--font-main)',
                  fontWeight: '400',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}>
                  {isVolFinished && <Sparkle size={6} strokeWidth={4} style={{ color: '#fff' }} />}
                  <span>{isVolFinished ? '100%' : `${doneChs}/${totalChs}`}</span>
                </div>

                {/* Selection indicator */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: theme.accent,
                    color: '#ffffff',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.45rem',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    zIndex: 2,
                  }}>
                    ✦
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM VIEWPORT: Active Volume Hero + Chapters Column */}
      <AnimatePresence mode="wait">
        <motion.div
          key={volume.number}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Active Volume Hero Banner */}
          <div style={{
            background: `var(--themed-card-bg, ${currentTheme.surface})`,
            border: `2.5px solid ${currentTheme.border}`,
            borderBottom: `5px solid ${currentTheme.border}`,
            borderRadius: '20px',
            padding: '16px',
            boxShadow: `0 6px 16px ${currentTheme.shadow}`,
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            alignItems: 'center',
          }}>
            {/* Banner Thumbnail */}
            <div style={{
              width: '60px',
              aspectRatio: '2/3',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
              border: `2px solid ${currentTheme.border}`,
              borderRight: `3.5px solid ${currentTheme.border}`,
              borderBottom: `4px solid ${currentTheme.border}`,
              boxShadow: `0 3px 8px ${currentTheme.shadow}`,
              background: volume.cover ? 'var(--themed-card-bg, #fff)' : `var(--themed-cover-placeholder-bg, ${currentTheme.surface})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {showVolumeArtwork && volume.cover ? (
                <img src={volume.cover} alt={activeVolumeTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
              ) : (
                <span style={{
                  fontFamily: 'Sniglet, var(--font-main)',
                  fontSize: '0.9rem',
                  fontWeight: '400',
                  color: currentTheme.accent,
                  opacity: 0.45,
                  textAlign: 'center',
                  lineHeight: 1.1,
                }}>
                  {volume.number}
                </span>
              )}
            </div>

            {/* Banner details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'Sniglet, var(--font-main)',
                  fontSize: '1.25rem',
                  fontWeight: '400',
                  color: currentTheme.accent,
                  margin: 0,
                  textShadow: `1px 1px 0 ${currentTheme.surface}`,
                }}>
                  {activeVolumeTitle}
                </span>

                {volume.anime && (
                  <div style={{
                    background: 'var(--themed-card-bg, #fff)',
                    border: `1.5px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    padding: '1px 6px',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-main)',
                    fontWeight: '400',
                    color: `var(--themed-text-secondary, ${currentTheme.accent})`,
                    boxShadow: `0 2px 0 ${currentTheme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}>
                    <Tv size={10} strokeWidth={2.5} />
                    <span>{uiLanguage === 'ja' ? 'アニメ第1期' : volume.anime}</span>
                  </div>
                )}
              </div>

              <p style={{
                fontFamily: 'var(--font-main)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary, #4b5563)',
                fontWeight: '400',
                margin: 0,
              }}>
                {t.chaptersRange} {Math.floor(volume.chapters[0])} – {Math.floor(volume.chapters[volume.chapters.length - 1])}
                {volume.inProgress && <span style={{ color: '#d97706', marginLeft: '6px' }}>✦ {t.ongoing}</span>}
              </p>

              <div style={{ alignSelf: 'flex-start', marginTop: '2px' }}>
                <VolumePurchaseLinks
                  isMobile={true}
                  volColor={currentTheme.border}
                  nativePurchaseUrl={nativePurchaseUrl}
                  nativeVolumeLabel={nativeVolumeLabel || t.buyNativeVolume}
                  enPurchaseUrl={volume.purchaseUrl}
                  enVolumeLabel={enVolumeLabel || t.buyEnVolume}
                  jpPurchaseUrl={volume.purchaseUrlJp}
                  jpVolumeLabel={jpVolumeLabel || t.buyJpVolume}
                />
              </div>
            </div>
          </div>

          {/* Chapters checklist (vertical stack) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '4px 2px 24px 2px',
          }}>
            {volChapters.map((ch, idx) => (
              <ChapterRowComponent
                key={ch.number}
                chapter={ch}
                volumeNumber={volume.number}
                index={idx}
                isMobile={true}
                onReadChapter={onReadChapter}
                isFinished={isFinished}
                trackExternalLink={trackExternalLink}
                cancelExternalLink={cancelExternalLink}
                markFinished={markFinished}
                unmarkFinished={unmarkFinished}
                getReadCount={getReadCount}
                incrementReadCount={incrementReadCount}
                getRemainingCooldown={getRemainingCooldown}
                pendingLinks={pendingLinks}
                t={t}
                uiLanguage={uiLanguage}
                noteText={chapterNotes[ch.number] || ''}
                onSaveNote={onSaveNote}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MobileChaptersTab;
