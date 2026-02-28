import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter, VOL_COLORS } from '../../../data/chapters';
import { VOL_BGS, getVolumeTitle } from '../syncConfig';

const ProgressTab = ({
  isMobile,
  progressPct,
  t,
  finishedCountMain,
  totalChapters,
  totalReads,
  expandedVol,
  setExpandedVol,
  uiLanguage,
  finished,
  onReadChapter,
  trackExternalLink,
  cancelExternalLink,
  unmarkFinished,
  readCounts,
  incrementReadCount,
  getRemainingCooldown,
  pendingLinks,
  ListRow,
  MiniChapterRow,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{
      position: isMobile ? 'static' : 'sticky',
      top: isMobile ? 'auto' : '0px',
      zIndex: isMobile ? 'auto' : 15,
      background: isMobile ? 'transparent' : 'var(--paper-white)',
      paddingBottom: isMobile ? '0' : '10px',
      marginBottom: 0,
      marginInline: 0,
      paddingInline: 0,
    }}>
      <ListRow
        isMobile={isMobile}
        index={0}
        finished={progressPct === 100}
        noteColor={3}
        tierBg="#10b981"
        tierBorder="#059669"
        tierText="#fff"
        tierAccent="#047857"
        numberLine2={`${progressPct}%`}
        title={t.overallCompletion}
        subtitle={
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#6b7280' }}>
            {finishedCountMain} of {totalChapters} {t.chaptersDone}
          </span>
        }
        rightContent={
          <div style={{ background: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: '9999px', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold' }}>
            {totalReads} {t.totalReads}
          </div>
        }
        style={{
          boxShadow: isMobile ? undefined : '0 4px 14px rgba(5, 150, 105, 0.15)',
        }}
      />
    </div>

    <div className="hide-scrollbar" style={{
      flex: 1,
      overflowY: 'visible',
      overflowX: 'visible',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '8px 4px 4px 4px',
      maxHeight: 'none',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '8px',
        alignItems: 'start',
      }}>
        {VOLUMES.map((vol, idx) => {
          const volChapters = vol.chapters.map(num => CHAPTERS.find(c => c.number === num)).filter(Boolean);
          const mainVolChapters = vol.chapters.filter(num => isMainChapter(num));
          const vf = mainVolChapters.filter(ch => finished.has(ch)).length;
          const vt = mainVolChapters.length;
          const p = vt > 0 ? Math.round((vf / vt) * 100) : 0;
          const isFinished = p === 100;
          const isExpanded = expandedVol === vol.number;
          const volHex = VOL_COLORS[vol.number] || '#c4b5fd';
          const customNote = { bg: VOL_BGS[vol.number] || '#faf5ff', border: volHex, accent: volHex };

          return (
            <div key={vol.number} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <ListRow
                isMobile={isMobile}
                index={idx + 1}
                finished={isFinished}
                customNote={customNote}
                tierBg="#10b981"
                tierBorder="#059669"
                tierText="#fff"
                tierAccent="#047857"
                numberLine2={vol.number}
                title={getVolumeTitle(uiLanguage, vol.number)}
                onClick={() => setExpandedVol(isExpanded ? null : vol.number)}
                subtitle={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px' }}>
                    <div style={{ flex: 1, height: '8px', background: `${customNote.border}40`, borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        style={{ height: '100%', background: customNote.accent, borderRadius: '4px' }}
                      />
                    </div>
                    <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', width: '32px' }}>
                      {p}%
                    </span>
                  </div>
                }
                rightContent={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: `${customNote.border}40`, color: customNote.accent, padding: '4px 10px', borderRadius: '9999px', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold' }}>
                      {vf}/{vt}
                    </div>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={18} style={{ color: customNote.accent }} />
                    </motion.div>
                  </div>
                }
              />

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden', paddingLeft: isMobile ? '12px' : '24px', display: 'flex', flexDirection: 'column', gap: '0px' }}
                  >
                    <div style={{
                      borderLeft: `2px dashed ${customNote.border}`,
                      paddingLeft: '12px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '8px',
                    }}>
                      {volChapters.map((ch, cIdx) => (
                        <MiniChapterRow
                          key={ch.number}
                          chapter={ch}
                          index={cIdx}
                          isMobile={isMobile}
                          onReadChapter={onReadChapter}
                          isFinished={(num) => finished.has(num)}
                          trackExternalLink={trackExternalLink}
                          cancelExternalLink={cancelExternalLink}
                          unmarkFinished={unmarkFinished}
                          getReadCount={(num) => readCounts[num] || 0}
                          incrementReadCount={incrementReadCount}
                          getRemainingCooldown={getRemainingCooldown}
                          pendingLinks={pendingLinks}
                          plusReadLabel={t.plusRead}
                          uiLanguage={uiLanguage}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default ProgressTab;
