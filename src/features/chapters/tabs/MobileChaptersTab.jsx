import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Tv, Pin } from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter } from '../../../data/chapters';
import VolumePurchaseLinks from './VolumePurchaseLinks';
import { VOL_THEMES, getVolumeCardStyle, VOL_TITLE_STYLE, EXTRA_BADGE_STYLE } from '../chapterStyles';
 
const MobileChaptersTab = ({
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
 
  return (
    <div style={{
      width: '100%', padding: '20px 16px 80px',
      display: 'flex', flexDirection: 'column',
      gap: '24px', overflow: 'visible',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <VolSelectorComponent
          activeVol={activeVol}
          setActiveVol={setActiveVol}
          isMobile={true}
          uiLanguage={uiLanguage}
          unreadCount={unreadCount}
        />
      </div>
 
      <AnimatePresence mode="wait">
        <motion.div
          key={volume.number}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}
        >
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={getVolumeCardStyle(theme, true)}
            >
              <div style={{
                width: '100%', height: '100%',
                borderRadius: '10px', overflow: 'hidden',
                background: volume.cover ? '#fff' : `linear-gradient(145deg, ${theme.bg}, ${theme.surface})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                {volume.cover ? (
                  <img src={volume.cover} alt={getVolumeTitleFn(uiLanguage, volume.number)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-main)', fontSize: '2rem',
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
                  <Tv size={12} strokeWidth={3} style={{ marginRight: '3px' }} />{volume.anime}
                </motion.div>
              )}
            </motion.div>
 
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
              <motion.p
                style={VOL_TITLE_STYLE(theme)}
              >
                {getVolumeTitleFn(uiLanguage, volume.number)}
              </motion.p>
              <p style={{ fontFamily: 'var(--font-main)', fontSize: '0.85rem', color: '#6b7280', fontWeight: '800' }}>
                {t.chaptersRange} {Math.floor(volume.chapters[0])} – {Math.floor(volume.chapters[volume.chapters.length - 1])}
                {volume.inProgress && <span style={{ color: '#f59e0b', marginLeft: '6px' }}>✦ {t.ongoing}</span>}
              </p>
              <VolumePurchaseLinks
                isMobile={true}
                volColor={theme.border}
                nativePurchaseUrl={nativePurchaseUrl}
                nativeVolumeLabel={nativeVolumeLabel || t.buyNativeVolume}
                enPurchaseUrl={volume.purchaseUrl}
                enVolumeLabel={enVolumeLabel || t.buyEnVolume}
                jpPurchaseUrl={volume.purchaseUrlJp}
                jpVolumeLabel={jpVolumeLabel || t.buyJpVolume}
              />
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '4px' }}>
                <NavBtnComponent onClick={goPrev} disabled={activeVol === 0} volumeNumber={volume.number} isMobile={true}>
                  <ChevronLeft size={24} strokeWidth={3} />
                </NavBtnComponent>
                <NavBtnComponent onClick={goNext} disabled={activeVol === VOLUMES.length - 1} volumeNumber={volume.number} isMobile={true}>
                  <ChevronRight size={24} strokeWidth={3} />
                </NavBtnComponent>
              </div>
            </div>
          </div>
 
          <div style={{
            width: '100%', display: 'flex', flexDirection: 'column',
            gap: '12px', padding: '10px 4px 60px',
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
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
 
export default MobileChaptersTab;
