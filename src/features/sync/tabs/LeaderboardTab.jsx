import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, BookOpen, List } from 'lucide-react';
import { CHAPTERS, VOLUMES, VOL_COLORS } from '../../../data/chapters';
import { NOTE_PALETTES, VOL_BGS, getChapterWord, getVolumeWord } from '../syncConfig';
import { ListRow } from '../syncSharedComponents';

const smashVariant = {
  hidden: { y: -80, scale: 0.8, opacity: 0, rotate: -3 },
  visible: { 
    y: 0, 
    scale: 1, 
    opacity: 1, 
    rotate: 0, 
    transition: { type: 'spring', stiffness: 500, damping: 12, mass: 1 } 
  }
};

const containerVariant = {
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const LeaderboardTab = ({ isMobile, isLoadingLeaderboard, leaderboard, t, uiLanguage }) => {
  const chapterWord = getChapterWord(uiLanguage);
  const volumeWord = getVolumeWord(uiLanguage);

  const entries = useMemo(() => {
    return leaderboard
      .map((entry, index) => {
        const chapterNumber = getSafeChapterNumber(entry.chapter);
        const chapterMeta = CHAPTERS.find((item) => item.number === chapterNumber) || (typeof entry.chapter === 'object' ? entry.chapter : null);
        const volume = VOLUMES.find((item) => item.chapters.includes(chapterNumber));
        const note = NOTE_PALETTES[index % NOTE_PALETTES.length];

        return {
          ...entry,
          rank: index + 1,
          chapter: chapterNumber,
          title: chapterMeta?.title || `${chapterWord} ${chapterNumber}`,
          volume,
          cardBg: volume ? (VOL_BGS[volume.number] || note.bg) : note.bg,
          cardBorder: volume ? (VOL_COLORS[volume.number] || note.border) : note.border,
          accent: note.accent,
        };
      })
      .filter((entry) => entry.chapter != null);
  }, [leaderboard, chapterWord]);

  if (isLoadingLeaderboard) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '16px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 size={40} color="var(--pop-pink)" />
        </motion.div>
        <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#64748b' }}>{t.loadingGlobal}</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '32px', border: '3px dashed #cbd5e1' }}>
        <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
        <p style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#64748b', margin: 0 }}>{t.noGlobal}</p>
      </div>
    );
  }

  const totalReads = entries.reduce((sum, e) => sum + e.count, 0);
  const totalRanked = entries.length;
  const maxReads = entries[0]?.count || 1;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariant}
      style={{ display: 'grid', gap: '24px', padding: '10px' }}
    >
      
      {/* Reread Board Stats Header */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
        <motion.div 
          variants={smashVariant}
          whileHover={{ scale: 1.025, rotate: 1.5, y: -4 }}
          style={{ 
            background: '#fff', 
            border: '4px solid #f59e0b', 
            borderBottom: '12.5px solid #d97706', 
            borderRadius: '28px', 
            padding: '20px 24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            boxShadow: '0 12px 32px rgba(245, 158, 11, 0.15)'
          }}
        >
          <div style={{ background: '#fef3c7', width: '56px', height: '56px', borderRadius: '18px', border: '3.5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 #f59e0b' }}>
            <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#d97706', fontSize: '1.4rem' }}>∑</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#92400e', fontSize: '1.8rem', lineHeight: 1 }}>{totalReads}</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#f59e0b', fontSize: '1rem', marginTop: '4px' }}>{t.totalCommunityReads || 'Total community reads'}</div>
          </div>
        </motion.div>

        <motion.div 
          variants={smashVariant}
          whileHover={{ scale: 1.025, rotate: -1.5, y: -4 }}
          style={{ 
            background: '#fff', 
            border: '4px solid #ec4899', 
            borderBottom: '12.5px solid #db2777', 
            borderRadius: '28px', 
            padding: '20px 24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            boxShadow: '0 12px 32px rgba(236, 72, 153, 0.15)'
          }}
        >
          <div style={{ background: '#fce7f3', width: '56px', height: '56px', borderRadius: '18px', border: '3.5px solid #ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 #ec4899' }}>
            <List size={32} color="#db2777" strokeWidth={3.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#9d174d', fontSize: '1.8rem', lineHeight: 1 }}>{totalRanked}</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#ec4899', fontSize: '1rem', marginTop: '4px' }}>{t.rankedChapters || 'Ranked chapters'}</div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <motion.div 
          variants={smashVariant}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', marginTop: '8px' }}
        >
           <span style={{ fontFamily: '"Coming Soon", cursive', fontWeight: '900', color: '#1f2937', fontSize: '1.45rem', letterSpacing: '0.5px' }}>
             {t.leaderboardHeading || 'Manga rankings'}
           </span>
        </motion.div>

        {entries.map((entry, index) => {
          const rank = index + 1;
          const heatPercent = Math.max(8, Math.round((entry.count / maxReads) * 100));
          const nextEntry = entries[index - 1];
          const gap = nextEntry ? nextEntry.count - entry.count : 0;
          
          let customNote = null;
          
          if (rank === 1) {
            customNote = { bg: '#fffbeb', border: '#fbbf24', accent: '#b45309' };
          } else if (rank === 2) {
            customNote = { bg: '#f8fafc', border: '#94a3b8', accent: '#475569' };
          } else if (rank === 3) {
            customNote = { bg: '#fff7ed', border: '#fdba74', accent: '#92400e' };
          } else if (entry.volume) {
            customNote = { bg: VOL_BGS[entry.volume.number], border: VOL_COLORS[entry.volume.number], accent: VOL_COLORS[entry.volume.number] };
          }

          return (
            <motion.div 
              key={`${entry.chapter}-${index}`}
              variants={smashVariant}
              whileHover={{ scale: 1.015, x: isMobile ? 0 : 10 }}
            >
              <ListRow
                index={index}
                noteColor={index}
                customNote={customNote}
                numberLine1=""
                numberLine2={String(rank)}
                title={
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontFamily: 'var(--font-main)', 
                        fontWeight: '900', 
                        fontSize: rank <= 3 ? '1.4rem' : '1.2rem',
                        color: rank <= 3 ? (customNote?.accent || '#1e293b') : '#1e293b',
                        lineHeight: 1.1
                      }}>
                        {chapterWord} {entry.chapter}: {entry.title}
                      </span>
                      {entry.volume && (
                        <div style={{
                          background: VOL_COLORS[entry.volume.number],
                          color: '#fff',
                          fontFamily: 'var(--font-main)',
                          fontSize: '0.75rem',
                          fontWeight: '900',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          border: '2.5px solid rgba(0,0,0,0.15)',
                          borderBottomWidth: '4.5px',
                          boxShadow: '0 3px 0 rgba(0,0,0,0.1)'
                        }}>
                          {volumeWord} {entry.volume.number}
                        </div>
                      )}
                    </div>
                    
                    {/* Heat Bar */}
                    <div style={{ width: '100%', maxWidth: '240px', height: '10px', background: 'rgba(0,0,0,0.08)', borderRadius: '999px', border: '2.5px solid rgba(0,0,0,0.05)', overflow: 'hidden', position: 'relative' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${heatPercent}%` }}
                        transition={{ delay: 0.3 + (index * 0.05), duration: 0.8, type: 'spring' }}
                        style={{ height: '100%', background: rank === 1 ? '#ef4444' : (customNote?.accent || '#64748b'), borderRadius: '999px' }}
                      />
                    </div>
                  </div>
                }
                subtitle={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: '0.9rem', color: rank === 1 ? '#ef4444' : '#94a3b8', letterSpacing: '0.2px' }}>
                      {rank === 1
                        ? (t.leadingByReads || 'Leading by {count} reads').replace('{count}', String(entries[1] ? entry.count - entries[1].count : entry.count))
                        : (gap > 0 ? (t.readsBehindRank || '{count} reads behind rank #{rank}').replace('{count}', String(gap)).replace('{rank}', String(rank - 1)) : null)}
                    </div>
                  </div>
                }
                isMobile={isMobile}
                rightContent={(
                  <div style={{ display: 'grid', justifyItems: 'end', gap: '6px' }}>
                    <div style={{ 
                      background: '#fff', 
                      border: `3.5px solid ${customNote?.border || '#e2e8f0'}`,
                      borderBottom: `9.5px solid ${customNote?.border || '#cbd5e1'}`,
                      padding: isMobile ? '8px 18px' : '10px 24px',
                      borderRadius: '20px',
                      fontFamily: 'var(--font-main)', 
                      fontWeight: '900', 
                      color: customNote?.accent || '#475569', 
                      fontSize: isMobile ? '1rem' : '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
                    }}>
                      {entry.count} {t.readsLabel || 'reads'}
                    </div>
                    <span style={{ 
                      fontFamily: 'var(--font-hand)', 
                      fontWeight: 'bold', 
                      color: rank <= 3 ? (customNote?.accent || '#94a3b8') : '#94a3b8', 
                      fontSize: isMobile ? '0.85rem' : '1rem'
                    }}>
                      Chapter {entry.chapter}
                    </span>
                  </div>
                )}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const getSafeChapterNumber = (chap) => {
  if (typeof chap === 'object' && chap !== null) return chap.number;
  return chap;
};

export default LeaderboardTab;



