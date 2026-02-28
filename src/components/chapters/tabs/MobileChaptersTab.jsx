import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Tv, Pin, ShoppingCart } from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter } from '../../../data/chapters';

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
  uiLanguage,
  getVolumeTitleFn,
  getVolumeShortWordFn,
  getCountryPluralSuffixFn,
  VolSelectorComponent,
  NavBtnComponent,
  ChapterRowComponent,
}) => (
  <div style={{
    width: '100%', padding: '24px 8px 10px 8px',
    display: 'flex', flexDirection: 'column',
    overflow: 'visible', flex: 1,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', justifyContent: 'center' }}>
      <BookOpen size={24} style={{ color: 'var(--pop-blue)' }} />
      <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#6b7280', fontSize: '1.5rem', fontWeight: 'normal' }}>{t.chapters}</span>
    </div>

    <div style={{ marginBottom: '10px' }}>
      <VolSelectorComponent activeVol={activeVol} setActiveVol={setActiveVol} isMobile uiLanguage={uiLanguage} />
    </div>

    <AnimatePresence mode="wait">
      <motion.div
        key={volume.number}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 250, damping: 25 }}
      >
        {(() => {
          const totalAvailable = CHAPTERS.filter(c => isMainChapter(c.number) && (c.links.en || c.pages)).length;
          const finishedCount = Array.from(isFinished ? CHAPTERS.filter(c => isMainChapter(c.number) && isFinished(c.number)) : []).length;
          const unread = totalAvailable - finishedCount;

          if (unread > 0) {
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  marginBottom: '12px', padding: '8px 12px',
                  background: 'var(--pop-yellow)', borderRadius: '8px',
                  border: '1.5px solid #ffe57f',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 2px 8px rgba(255, 229, 127, 0.3)',
                }}
              >
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
                  <Pin size={16} style={{ color: '#d4a017' }} />
                </motion.div>
                <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.85rem', color: '#854d0e', fontWeight: 'bold' }}>
                  {t.unreadNotice.replace('{count}', unread).replace('{suffix}', getCountryPluralSuffixFn(uiLanguage, unread))}
                </span>
              </motion.div>
            );
          }
          return null;
        })()}

        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', marginBottom: '12px',
          padding: '0 2px',
        }}>
          <NavBtnComponent onClick={goPrev} disabled={activeVol === 0} volColor={volColor} isMobile>
            <ChevronLeft size={16} />
          </NavBtnComponent>

          <div style={{ position: 'relative', width: '100px', flexShrink: 0 }}>
            <div style={{
              width: '100%', aspectRatio: '2/3',
              borderRadius: '8px', overflow: 'hidden',
              boxShadow: `0 4px 14px ${volColor}30, 0 2px 6px rgba(0,0,0,0.1)`,
              border: `2px solid ${volColor}50`,
              background: volume.cover ? '#f9fafb' : `linear-gradient(145deg, ${volColor}15, ${volColor}35)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {volume.cover ? (
                <img src={volume.cover} alt={getVolumeTitleFn(uiLanguage, volume.number)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
              ) : (
                <span style={{
                  fontFamily: 'var(--font-main)', fontSize: '1.5rem',
                  fontWeight: 'bold', color: volColor, opacity: 0.35,
                  textAlign: 'center', lineHeight: 1.2,
                }}>{getVolumeShortWordFn(uiLanguage)}<br />{volume.number}</span>
              )}
            </div>
            {volume.anime && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                style={{
                  position: 'absolute', top: '-4px', right: '-6px',
                  background: '#ede9fe',
                  color: '#7c3aed', padding: '2px 6px', borderRadius: '6px',
                  fontSize: '0.52rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', gap: '2px',
                  border: '1.5px solid #c4b5fd',
                }}
              >
                <Tv size={8} />{volume.anime}
              </motion.div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{
              fontFamily: 'var(--font-main)', fontSize: '1.4rem',
              fontWeight: 'normal', color: volColor, marginBottom: '2px', lineHeight: 1.1,
            }}>{getVolumeTitleFn(uiLanguage, volume.number)}</p>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '0.85rem', color: '#9ca3af' }}>
              {t.chapterRange} {Math.floor(volume.chapters[0])} – {Math.floor(volume.chapters[volume.chapters.length - 1])}
              {volume.inProgress && <span style={{ color: '#f59e0b', marginLeft: '5px' }}>✦ {t.ongoing}</span>}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
              {nativePurchaseUrl && (
                <motion.a
                  href={nativePurchaseUrl} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.75rem', color: '#fff', background: 'var(--pop-green)',
                    padding: '4px 8px', borderRadius: '6px', textDecoration: 'none',
                    fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(151, 235, 169, 0.45)',
                  }}
                >
                  <ShoppingCart size={12} /> {nativeVolumeLabel || t.buyNativeVolume}
                </motion.a>
              )}
              {volume.purchaseUrl && (
                <motion.a
                  href={volume.purchaseUrl} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.75rem', color: '#fff', background: volColor,
                    padding: '4px 8px', borderRadius: '6px', textDecoration: 'none',
                    fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                    boxShadow: `0 2px 4px ${volColor}40`,
                  }}
                >
                  <ShoppingCart size={12} /> {t.buyEN}
                </motion.a>
              )}
              {volume.purchaseUrlJp && (
                <motion.a
                  href={volume.purchaseUrlJp} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.75rem', color: '#fff', background: 'var(--pop-pink)',
                    padding: '4px 8px', borderRadius: '6px', textDecoration: 'none',
                    fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(255, 158, 198, 0.4)',
                  }}
                >
                  <ShoppingCart size={12} /> {t.buyJP}
                </motion.a>
              )}
            </div>
          </div>

          <NavBtnComponent onClick={goNext} disabled={activeVol === VOLUMES.length - 1} volColor={volColor} isMobile>
            <ChevronRight size={16} />
          </NavBtnComponent>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', padding: '4px 2px' }}>
          {volChapters.map((ch, idx) => (
            <ChapterRowComponent
              key={ch.number}
              chapter={ch}
              index={idx}
              isMobile
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

export default MobileChaptersTab;
