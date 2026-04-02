import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Tv, Pin } from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter } from '../../../data/chapters';
import VolumePurchaseLinks from './VolumePurchaseLinks';
import { VOL_THEMES, getVolumeCardStyle, VOL_TITLE_STYLE, EXTRA_BADGE_STYLE } from '../chapterStyles';
 
const DesktopChaptersTab = ({
  activeVol,
  setActiveVol,
  volume,
  volChapters,
  volColor,
  goPrev,
  goNext,
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
  getCountryPluralSuffixFn,
  VolSelectorComponent,
  NavBtnComponent,
  ChapterRowComponent,
  unreadCount,
}) => {
  const theme = VOL_THEMES[volume.number] || VOL_THEMES[1];
  const showVolumeArtwork = uiLanguage !== 'ja';
  const showVolumeTitle = uiLanguage !== 'ja';
  const volumeTitle = getVolumeTitleFn(uiLanguage, volume.number);
 
  return (
    <div style={{
      width: '100%', padding: '32px 48px',
      minHeight: '600px', display: 'flex', flexDirection: 'column',
      overflow: 'visible',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
        <VolSelectorComponent
          activeVol={activeVol}
          setActiveVol={setActiveVol}
          isMobile={false}
          uiLanguage={uiLanguage}
          unreadCount={unreadCount}
        />
      </div>
 
      <AnimatePresence mode="wait">
        <motion.div
          key={volume.number}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '48px', alignItems: 'flex-start' }}
        >
          <div style={{ flexShrink: 0, width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.18, ease: 'easeOut' }}
              style={getVolumeCardStyle(theme, false)}
            >
              <div style={{
                width: '100%', height: '100%',
                borderRadius: '12px', overflow: 'hidden',
                background: volume.cover ? '#fff' : `linear-gradient(145deg, ${theme.bg}, ${theme.surface})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                {showVolumeArtwork && volume.cover ? (
                  <img src={volume.cover} alt={volumeTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-main)', fontSize: '2.5rem',
                    fontWeight: '900', color: theme.accent, opacity: 0.4,
                    textAlign: 'center', lineHeight: 1.1,
                  }}>{getVolumeShortWordFn(uiLanguage)}<br />{volume.number}</span>
                )}
              </div>
 
              {volume.anime && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.08, duration: 0.16, ease: 'easeOut' }}
                  style={EXTRA_BADGE_STYLE(theme)}
                >
                  <Tv size={14} strokeWidth={3} style={{ marginRight: '4px' }} />{uiLanguage === 'ja' ? 'アニメ第1期' : volume.anime}
                </motion.div>
              )}
            </motion.div>
 
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
              {showVolumeTitle && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.16, ease: 'easeOut' }}
                  style={VOL_TITLE_STYLE(theme)}
                >
                  {volumeTitle}
                </motion.p>
              )}
              <p style={{ fontFamily: 'var(--font-main)', fontSize: '0.95rem', color: '#6b7280', fontWeight: '700', marginBottom: '8px' }}>
                {t.chaptersRange} {Math.floor(volume.chapters[0])} – {Math.floor(volume.chapters[volume.chapters.length - 1])}
                {volume.inProgress && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>✦ {t.ongoing}</span>}
              </p>
              <VolumePurchaseLinks
                isMobile={false}
                volColor={theme.border}
                nativePurchaseUrl={nativePurchaseUrl}
                nativeVolumeLabel={nativeVolumeLabel || t.buyNativeVolume}
                enPurchaseUrl={volume.purchaseUrl}
                enVolumeLabel={enVolumeLabel || t.buyEnVolume}
                jpPurchaseUrl={volume.purchaseUrlJp}
                jpVolumeLabel={jpVolumeLabel || t.buyJpVolume}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
                <NavBtnComponent onClick={goPrev} disabled={activeVol === 0} volumeNumber={volume.number} isMobile={false}>
                  <ChevronLeft size={24} strokeWidth={3} />
                </NavBtnComponent>
                <NavBtnComponent onClick={goNext} disabled={activeVol === VOLUMES.length - 1} volumeNumber={volume.number} isMobile={false}>
                  <ChevronRight size={24} strokeWidth={3} />
                </NavBtnComponent>
              </div>
            </div>
          </div>
 
          <div className="hide-scrollbar" style={{
            flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px', overflowY: 'visible', overflowX: 'visible', maxHeight: 'none',
            padding: '12px 10px 48px 10px',
          }}>
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
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
 
export default DesktopChaptersTab;
