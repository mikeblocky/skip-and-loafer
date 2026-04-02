import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, BookOpen, RefreshCw } from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter, VOL_COLORS } from '../../../data/chapters';
import { VOL_BGS, getVolumeTitle } from '../syncConfig';

const StatCard = ({ label, value, accent, bg, border, isMobile, icon: Icon }) => (
  <div
    className="sketchbook-border"
    style={{
      background: bg,
      border: `3px solid ${border}`,
      borderBottom: `8px solid ${border}`,
      borderRadius: '20px',
      padding: isMobile ? '14px 14px 12px' : '16px 16px 14px',
      display: 'grid',
      gap: '8px',
      minHeight: isMobile ? '112px' : '120px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: accent }}>
      <Icon size={18} strokeWidth={2.4} />
      <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? '0.94rem' : '1rem', fontWeight: '400', lineHeight: 1.2 }}>{label}</span>
    </div>
    <div style={{ color: '#0f172a', fontSize: isMobile ? '1.55rem' : '1.75rem', lineHeight: 1, fontFamily: 'Sniglet, var(--font-main)', fontWeight: '400' }}>{value}</div>
  </div>
);

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
  MiniChapterRow,
}) => {
  const activeVolumes = VOLUMES.filter((vol) => vol.chapters.some((chapterNumber) => finished.has(chapterNumber))).length;

  return (
    <div style={{ display: 'grid', gap: '22px', paddingTop: '6px', paddingBottom: '10px' }}>
      <motion.div
        initial={{ opacity: 0, y: 18, rotate: -0.8 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        className="sketchbook-border"
        style={{
          background: '#ffffff',
          border: '3.5px solid #10b981',
          borderBottom: '10px solid #047857',
          borderRadius: '28px',
          padding: isMobile ? '20px 18px' : '24px 24px 22px',
          boxShadow: '0 16px 0 rgba(16, 185, 129, 0.18)',
          display: 'grid',
          gap: '18px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: '16px', alignItems: isMobile ? 'stretch' : 'center' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ffffff', border: '3px solid #a7f3d0', borderBottom: '7px solid #34d399', borderRadius: '999px', padding: '8px 14px', width: 'fit-content' }}>
              <BookOpen size={18} strokeWidth={2.4} style={{ color: '#047857' }} />
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? '0.95rem' : '1rem', fontWeight: '400', color: '#065f46' }}>{t.overallCompletion}</span>
            </div>
            <div style={{ color: '#065f46', fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? '2.2rem' : '2.8rem', lineHeight: 1, fontWeight: '400' }}>{progressPct}%</div>
            <div style={{ color: '#475569', fontSize: isMobile ? '0.98rem' : '1.02rem', lineHeight: 1.45 }}>
              {finishedCountMain} / {totalChapters} {t.chaptersDone}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, minmax(0, 170px))', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
            <StatCard label={t.chaptersDone} value={String(finishedCountMain)} accent="#0f766e" bg="#ecfdf5" border="#86efac" isMobile={isMobile} icon={CheckCircle2} />
            <StatCard label={t.totalReads} value={String(totalReads)} accent="#1d4ed8" bg="#eff6ff" border="#93c5fd" isMobile={isMobile} icon={RefreshCw} />
            <StatCard label={t.volumesLabel || 'Volumes'} value={String(activeVolumes)} accent="#7c3aed" bg="#faf5ff" border="#c4b5fd" isMobile={isMobile} icon={BookOpen} />
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px', alignItems: 'start' }}>
        {VOLUMES.map((vol, idx) => {
          const volChapters = vol.chapters.map((num) => CHAPTERS.find((chapter) => chapter.number === num)).filter(Boolean);
          const mainVolChapters = vol.chapters.filter((num) => isMainChapter(num));
          const finishedCount = mainVolChapters.filter((chapterNumber) => finished.has(chapterNumber)).length;
          const totalCount = mainVolChapters.length;
          const progress = totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0;
          const isFinished = progress === 100;
          const isExpanded = expandedVol === vol.number;
          const accent = VOL_COLORS[vol.number] || '#8b5cf6';
          const panelBg = VOL_BGS[vol.number] || '#ffffff';

          return (
            <div key={vol.number} style={{ display: 'grid', gap: '10px' }}>
              <motion.button
                initial={{ opacity: 0, y: 20, rotate: idx % 2 === 0 ? 0.8 : -0.8 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: idx * 0.04, type: 'spring', stiffness: 260, damping: 18 }}
                whileHover={isMobile ? {} : { y: -6, rotate: idx % 2 === 0 ? 0.8 : -0.8 }}
                whileTap={{ scale: 0.97, y: 4 }}
                onClick={() => setExpandedVol(isExpanded ? null : vol.number)}
                className="sketchbook-border paper-interact"
                style={{
                  background: `linear-gradient(180deg, ${panelBg} 0%, #ffffff 100%)`,
                  border: `3.5px solid ${accent}`,
                  borderBottom: `10px solid ${accent}`,
                  borderRadius: '24px',
                  padding: isMobile ? '18px 16px' : '20px 18px',
                  display: 'grid',
                  gap: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: `0 16px 30px ${accent}20`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'fit-content', minWidth: '56px', padding: '6px 12px', borderRadius: '999px', background: '#ffffff', border: `3px solid ${accent}`, color: accent, fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.96rem', fontWeight: '400' }}>
                      {vol.number}
                    </span>
                    <div style={{ color: '#1e293b', fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? '1.16rem' : '1.22rem', fontWeight: '400', lineHeight: 1.1 }}>{getVolumeTitle(uiLanguage, vol.number)}</div>
                  </div>

                  <div style={{ display: 'grid', justifyItems: 'end', gap: '8px' }}>
                    <div style={{ background: isFinished ? '#ecfdf5' : '#ffffff', border: `3px solid ${isFinished ? '#34d399' : accent}`, borderBottom: `7px solid ${isFinished ? '#10b981' : accent}`, borderRadius: '16px', padding: '8px 10px', minWidth: '88px', textAlign: 'center' }}>
                      <div style={{ color: isFinished ? '#047857' : accent, fontFamily: 'Sniglet, var(--font-main)', fontSize: '1.02rem', fontWeight: '400', lineHeight: 1 }}>{progress}%</div>
                      <div style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.2 }}>{finishedCount}/{totalCount}</div>
                    </div>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={20} strokeWidth={2.6} style={{ color: accent }} />
                    </motion.div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {mainVolChapters.map((chapterNumber) => {
                    const done = finished.has(chapterNumber);
                    return (
                      <span
                        key={chapterNumber}
                        style={{
                          minWidth: '42px',
                          height: '34px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 10px',
                          borderRadius: '14px',
                          background: done ? `${accent}18` : '#ffffff',
                          border: `2.5px solid ${done ? accent : '#dbe4f0'}`,
                          color: done ? accent : '#94a3b8',
                          fontFamily: 'Sniglet, var(--font-main)',
                          fontSize: '0.88rem',
                          fontWeight: '400',
                          lineHeight: 1,
                        }}
                      >
                        {chapterNumber}
                      </span>
                    );
                  })}
                </div>
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'grid', gap: '8px', padding: isMobile ? '2px 6px 4px 12px' : '2px 8px 6px 18px', borderLeft: `2px dashed ${accent}` }}>
                      {volChapters.map((chapter, chapterIndex) => (
                        <MiniChapterRow
                          key={chapter.number}
                          chapter={chapter}
                          index={chapterIndex}
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
  );
};

export default ProgressTab;

