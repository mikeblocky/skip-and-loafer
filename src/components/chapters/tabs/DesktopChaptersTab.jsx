import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Tv, Pin, ShoppingCart } from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter } from '../../../data/chapters';

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
  uiLanguage,
  getVolumeTitleFn,
  getVolumeShortWordFn,
  getCountryPluralSuffixFn,
  VolSelectorComponent,
  NavBtnComponent,
  ChapterRowComponent,
}) => (
  <div style={{
    width: '100%', padding: '28px 40px',
    minHeight: '600px', display: 'flex', flexDirection: 'column',
    overflow: 'visible',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BookOpen size={22} style={{ color: 'var(--pop-blue)' }} />
        <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#6b7280', fontSize: '1.3rem', fontWeight: 'normal' }}>{t.chapters}</span>

        {(() => {
          const totalAvailable = CHAPTERS.filter(c => isMainChapter(c.number) && (c.links.en || c.pages)).length;
          const finishedCount = Array.from(isFinished ? CHAPTERS.filter(c => isMainChapter(c.number) && isFinished(c.number)) : []).length;
          const unread = totalAvailable - finishedCount;

          if (unread > 0) {
            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  padding: '5px 12px',
                  background: 'var(--pop-yellow)', borderRadius: '9999px',
                  border: '1.5px solid #ffe57f',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  marginLeft: '10px',
                  boxShadow: '0 2px 8px rgba(255, 229, 127, 0.2)',
                }}
              >
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
                  <Pin size={14} style={{ color: '#d4a017' }} />
                </motion.div>
                <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.82rem', color: '#854d0e', fontWeight: 'bold' }}>
                  {t.unreadShort.replace('{count}', unread).replace('{suffix}', getCountryPluralSuffixFn(uiLanguage, unread))}
                </span>
              </motion.div>
            );
          }
          return null;
        })()}
      </div>
      <VolSelectorComponent activeVol={activeVol} setActiveVol={setActiveVol} isMobile={false} uiLanguage={uiLanguage} />
    </div>

    <AnimatePresence mode="wait">
      <motion.div
        key={volume.number}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '30px', alignItems: 'flex-start' }}
      >
        <div style={{ flexShrink: 0, width: '210px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            style={{ position: 'relative', width: '190px' }}
          >
            <div style={{
              width: '100%', aspectRatio: '2/3',
              borderRadius: '10px', overflow: 'hidden',
              boxShadow: `0 6px 20px ${volColor}35, 0 3px 8px rgba(0,0,0,0.12)`,
              border: `2.5px solid ${volColor}50`,
              background: volume.cover ? '#f9fafb' : `linear-gradient(145deg, ${volColor}15, ${volColor}35)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {volume.cover ? (
                <img src={volume.cover} alt={getVolumeTitleFn(uiLanguage, volume.number)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
              ) : (
                <span style={{
                  fontFamily: 'var(--font-main)', fontSize: '2.2rem',
                  fontWeight: 'bold', color: volColor, opacity: 0.35,
                  textAlign: 'center', lineHeight: 1.2,
                }}>{getVolumeShortWordFn(uiLanguage)}<br />{volume.number}</span>
              )}
            </div>

            {volume.anime && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                style={{
                  position: 'absolute', top: '-8px', right: '-10px',
                  background: '#ede9fe', color: '#7c3aed', padding: '4px 10px', borderRadius: '8px',
                  fontSize: '0.72rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', gap: '3px', border: '2px solid #c4b5fd',
                }}
              >
                <Tv size={11} />{volume.anime}
              </motion.div>
            )}
          </motion.div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{ fontFamily: 'var(--font-main)', fontSize: '1.5rem', fontWeight: 'normal', color: volColor, marginBottom: '2px' }}
            >
              {getVolumeTitleFn(uiLanguage, volume.number)}
            </motion.p>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '0.9rem', color: '#9ca3af', marginBottom: '4px' }}>
              {t.chaptersRange} {Math.floor(volume.chapters[0])} – {Math.floor(volume.chapters[volume.chapters.length - 1])}
              {volume.inProgress && <span style={{ color: '#f59e0b', marginLeft: '6px' }}>✦ {t.ongoing}</span>}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {nativePurchaseUrl && (
                <motion.a
                  href={nativePurchaseUrl} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.85rem', color: '#fff', background: 'var(--pop-green)',
                    padding: '6px 12px', borderRadius: '8px', textDecoration: 'none',
                    fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                    boxShadow: '0 2px 6px rgba(151, 235, 169, 0.5)',
                  }}
                >
                  <ShoppingCart size={14} /> {nativeVolumeLabel || t.buyNativeVolume}
                </motion.a>
              )}
              {volume.purchaseUrl && (
                <motion.a
                  href={volume.purchaseUrl} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.85rem', color: '#fff', background: volColor,
                    padding: '6px 12px', borderRadius: '8px', textDecoration: 'none',
                    fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                    boxShadow: `0 2px 6px ${volColor}50`,
                  }}
                >
                  <ShoppingCart size={14} /> {t.buyEnVolume}
                </motion.a>
              )}
              {volume.purchaseUrlJp && (
                <motion.a
                  href={volume.purchaseUrlJp} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.85rem', color: '#fff', background: 'var(--pop-pink)',
                    padding: '6px 12px', borderRadius: '8px', textDecoration: 'none',
                    fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                    boxShadow: '0 2px 6px rgba(255, 158, 198, 0.5)',
                  }}
                >
                  <ShoppingCart size={14} /> {t.buyJpVolume}
                </motion.a>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '4px' }}>
              <NavBtnComponent onClick={goPrev} disabled={activeVol === 0} volColor={volColor}>
                <ChevronLeft size={20} />
              </NavBtnComponent>
              <NavBtnComponent onClick={goNext} disabled={activeVol === VOLUMES.length - 1} volColor={volColor}>
                <ChevronRight size={20} />
              </NavBtnComponent>
            </div>
          </div>
        </div>

        <div className="hide-scrollbar" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          gap: '8px', overflowY: 'visible', overflowX: 'visible', maxHeight: 'none',
          padding: '8px 6px 4px 6px',
        }}>
          {volChapters.map((ch, idx) => (
            <ChapterRowComponent
              key={ch.number}
              chapter={ch}
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

export default DesktopChaptersTab;
