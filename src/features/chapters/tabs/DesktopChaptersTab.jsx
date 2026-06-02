import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Sparkle, ShoppingCart, BookOpen } from 'lucide-react';
import { VOLUMES, isMainChapter } from '../../../data/chapters';
import VolumePurchaseLinks from './VolumePurchaseLinks';
import { VOL_THEMES, getVolumeCardStyle, VOL_TITLE_STYLE, EXTRA_BADGE_STYLE } from '../chapterStyles';

const DesktopChaptersTab = ({
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

  return (
    <div style={{
      width: '100%',
      padding: '16px 24px 48px 24px',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'row',
      gap: '32px',
      alignItems: 'flex-start',
      overflow: 'visible',
    }}>
      {/* LEFT COLUMN: Manga Bookshelf Sidebar (310px) */}
      <div style={{
        width: '310px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'sticky',
        top: '24px',
      }}>
        {/* Bookshelf Header */}
        <div style={{
          background: 'var(--themed-bookshelf-header-bg, #eff6ff)',
          border: '2.5px solid var(--themed-bookshelf-header-border, #4d9cff)',
          borderBottom: '5px solid var(--themed-bookshelf-header-border, #4d9cff)',
          borderRadius: '16px',
          padding: '14px 18px',
          boxShadow: '0 4px 12px rgba(77, 156, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <BookOpen size={20} style={{ color: 'var(--themed-bookshelf-header-icon, #0066ff)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'Sniglet, var(--font-main)',
              fontSize: '1.15rem',
              fontWeight: '400',
              color: 'var(--themed-bookshelf-header-text, #1e3a8a)',
              lineHeight: 1.2,
            }}>
              {t.mangaShelf || 'List of volumes'}
            </span>
            <span style={{
              fontFamily: 'Sniglet, var(--font-main)',
              fontSize: '0.8rem',
              color: 'var(--themed-bookshelf-header-muted, #3b82f6)',
              fontWeight: '400',
            }}>
              {VOLUMES.length} volumes available
            </span>
          </div>
        </div>

        {/* Vertical Bookshelf List (2-column grid of covers) */}
        <div 
          className="hide-scrollbar" 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 250px)',
            padding: '4px 6px 24px 4px',
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
                onClick={() => setActiveVol(idx)}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  position: 'relative',
                  aspectRatio: '2/3',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: isActive ? `2.5px solid var(--themed-card-border, ${theme.border})` : `2.5px solid var(--themed-card-inactive-border, #cbd5e1)`,
                  borderRight: isActive ? `4.5px solid var(--themed-card-border, ${theme.border})` : `2.5px solid var(--themed-card-inactive-border, #cbd5e1)`,
                  borderBottom: isActive ? `6px solid var(--themed-card-border, ${theme.border})` : `4.5px solid var(--themed-card-inactive-border, #cbd5e1)`,
                  boxShadow: isActive ? `0 8px 20px ${theme.shadow}` : `0 4px 10px rgba(0,0,0,0.05)`,
                  background: isActive ? `var(--themed-card-bg, ${theme.surface})` : 'var(--themed-card-inactive-bg, #fff)',
                  transition: 'all 0.22s ease',
                  overflow: 'visible',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Volume Cover Image */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: vol.cover ? 'var(--themed-card-bg, #fff)' : `var(--themed-cover-placeholder-bg, ${theme.surface})`,
                  opacity: isActive ? 1 : 0.82,
                }}>
                  {showVolumeArtwork && vol.cover ? (
                    <img src={vol.cover} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
                  ) : (
                    <span style={{
                      fontFamily: 'Sniglet, var(--font-main)',
                      fontSize: '1.5rem',
                      fontWeight: '400',
                      color: theme.accent,
                      opacity: 0.45,
                      textAlign: 'center',
                      lineHeight: 1.1,
                    }}>
                      {getVolumeShortWordFn(uiLanguage)}<br />{vol.number}
                    </span>
                  )}
                </div>

                {/* Progress Pill Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: isVolFinished 
                    ? 'var(--pop-green, #10b981)' 
                    : hasStarted 
                      ? theme.accent 
                      : '#6b7280',
                  color: '#fff',
                  border: `2px solid ${isVolFinished ? '#047857' : theme.border}`,
                  borderBottom: `3px solid ${isVolFinished ? '#047857' : theme.border}`,
                  borderRadius: '9999px',
                  padding: '2px 8px',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-main)',
                  fontWeight: '400',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}>
                  {isVolFinished && <Sparkle size={8} strokeWidth={4} style={{ color: '#fff' }} />}
                  <span>{isVolFinished ? '100%' : `${doneChs}/${totalChs}`}</span>
                </div>

                {/* Active Selection Ribbon */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: theme.accent,
                    color: '#ffffff',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
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

      {/* RIGHT COLUMN: Volume Details Banner + Chapters Grid Viewport */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Active Volume Hero Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={volume.number}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              background: `var(--themed-card-bg, ${currentTheme.surface})`,
              border: `2.5px solid var(--themed-card-border, ${currentTheme.border})`,
              borderBottom: `6px solid var(--themed-card-border, ${currentTheme.border})`,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: `0 8px 24px ${currentTheme.shadow}`,
              display: 'flex',
              flexDirection: 'row',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            {/* Banner Thumbnail */}
            <div style={{
              width: '90px',
              aspectRatio: '2/3',
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0,
              border: `2.5px solid var(--themed-card-border, ${currentTheme.border})`,
              borderRight: `4.5px solid var(--themed-card-border, ${currentTheme.border})`,
              borderBottom: `5px solid var(--themed-card-border, ${currentTheme.border})`,
              boxShadow: `0 4px 12px ${currentTheme.shadow}`,
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
                  fontSize: '1.25rem',
                  fontWeight: '400',
                  color: currentTheme.accent,
                  opacity: 0.45,
                  textAlign: 'center',
                  lineHeight: 1.1,
                }}>
                  {getVolumeShortWordFn(uiLanguage)}<br />{volume.number}
                </span>
              )}
            </div>

            {/* Banner Content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flex: 1,
              minWidth: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={VOL_TITLE_STYLE(currentTheme)}>
                  {activeVolumeTitle}
                </span>

                {volume.anime && (
                  <div style={{
                    background: 'var(--themed-card-bg, #fff)',
                    border: `2px solid var(--themed-card-border, ${currentTheme.border})`,
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-main)',
                    fontWeight: '400',
                    color: `var(--themed-text-secondary, ${currentTheme.accent})`,
                    boxShadow: `0 2.5px 0 var(--themed-card-border, ${currentTheme.border})`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Tv size={12} strokeWidth={2.5} />
                    <span>{uiLanguage === 'ja' ? 'アニメ第1期' : volume.anime}</span>
                  </div>
                )}
              </div>

              <p style={{
                fontFamily: 'var(--font-main)',
                fontSize: '0.9rem',
                color: 'var(--text-secondary, #4b5563)',
                fontWeight: '400',
                margin: 0,
              }}>
                {t.chaptersRange} {Math.floor(volume.chapters[0])} – {Math.floor(volume.chapters[volume.chapters.length - 1])}
                {volume.inProgress && <span style={{ color: '#d97706', marginLeft: '8px' }}>✦ {t.ongoing}</span>}
              </p>

              <div style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                <VolumePurchaseLinks
                  isMobile={false}
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
          </motion.div>
        </AnimatePresence>

        {/* Chapters High-Density Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={volume.number}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="hide-scrollbar"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              overflowY: 'visible',
              overflowX: 'visible',
              maxHeight: 'none',
              padding: '4px 6px 48px 6px',
            }}
          >
            {volChapters.map((ch, idx) => (
              <ChapterRowComponent
                key={ch.number}
                chapter={ch}
                volumeNumber={volume.number}
                index={idx}
                isMobile={false}
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DesktopChaptersTab;
