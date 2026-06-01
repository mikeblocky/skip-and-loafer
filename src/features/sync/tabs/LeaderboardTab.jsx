import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, BookOpen, Crown, Trophy, Medal, Star } from 'lucide-react';
import { CHAPTERS, VOLUMES, VOL_COLORS } from '../../../data/chapters';
import { NOTE_PALETTES, VOL_BGS, getChapterWord, getVolumeWord } from '../syncConfig';
import { createPaperPanelStyle } from '../../../components/shared/paper/paperTheme';

const COMMUNITY_FONT_FAMILY = 'var(--font-paper)';

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
        <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#64748b', fontSize: '0.94rem' }}>{t.loadingGlobal || 'Loading rankings...'}</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        className="sketchbook-border"
        style={{
          ...createPaperPanelStyle({
            background: '#f8fafc',
            borderColor: '#cbd5e1',
            bottomColor: '#94a3b8',
            radius: '24px',
          }),
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <BookOpen size={44} color="#94a3b8" style={{ marginBottom: '12px' }} />
        <p style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#64748b', margin: 0, fontSize: '0.94rem' }}>{t.noGlobal || 'No rankings recorded.'}</p>
      </div>
    );
  }

  const maxReads = entries[0]?.count || 1;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariant}
      style={{ display: 'grid', gap: '16px', width: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', margin: '4px 0' }}>
         <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#1f2937', fontSize: '1.25rem', fontWeight: '400' }}>
           {t.leaderboardHeading || 'Manga rankings'}
         </span>
      </div>

      <div style={{ display: 'grid', gap: '14px', width: '100%' }}>
        {entries.map((entry, index) => {
          const rank = index + 1;
          const heatPercent = Math.max(8, Math.round((entry.count / maxReads) * 100));
          const nextEntry = entries[index - 1];
          const gap = nextEntry ? nextEntry.count - entry.count : 0;
          
          let bg = '#ffffff';
          let border = '#cbd5e1';
          let bottom = '#94a3b8';
          let accent = '#475569';
          let RankIcon = null;
          let washi = null;
          
          if (rank === 1) {
            bg = '#fffbeb';
            border = '#fcd34d';
            bottom = '#f59e0b';
            accent = '#b45309';
            RankIcon = <Crown size={22} strokeWidth={2.6} />;
            washi = 'yellow';
          } else if (rank === 2) {
            bg = '#f8fafc';
            border = '#cbd5e1';
            bottom = '#94a3b8';
            accent = '#334155';
            RankIcon = <Trophy size={18} strokeWidth={2.6} />;
            washi = 'blue';
          } else if (rank === 3) {
            bg = '#fff7ed';
            border = '#fdba74';
            bottom = '#f97316';
            accent = '#c2410c';
            RankIcon = <Medal size={18} strokeWidth={2.6} />;
            washi = 'pink';
          } else {
            const colors = [
              { bg: '#fff5f8', border: '#f9a8d4', bottom: '#f472b6', accent: '#be185d' },
              { bg: '#eff6ff', border: '#bfdbfe', bottom: '#60a5fa', accent: '#1d4ed8' },
              { bg: '#f0fdf4', border: '#bbf7d0', bottom: '#4ade80', accent: '#15803d' },
              { bg: '#f5f3ff', border: '#ddd6fe', bottom: '#a78bfa', accent: '#6d28d9' },
            ];
            const col = colors[index % colors.length];
            bg = col.bg;
            border = col.border;
            bottom = col.bottom;
            accent = col.accent;
          }

          return (
            <motion.div 
              key={`${entry.chapter}-${index}`}
              variants={smashVariant}
              whileHover={{ scale: 1.015, x: 6, rotate: rank <= 3 ? (rank % 2 === 0 ? 0.5 : -0.5) : 0 }}
              style={{ width: '100%' }}
            >
              <div
                className="sketchbook-border"
                style={{
                  ...createPaperPanelStyle({
                    background: bg,
                    borderColor: border,
                    bottomColor: bottom,
                    radius: '20px',
                    shadow: rank <= 3 ? '0 10px 20px rgba(15,23,42,0.06)' : '0 4px 8px rgba(15,23,42,0.01)',
                  }),
                  position: 'relative',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                {/* Washi tape badge on top ranks */}
                {washi && (
                  <div
                    className={`washi-tape washi-tape--${washi}`}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: index % 2 === 0 ? '16px' : 'auto',
                      right: index % 2 === 0 ? 'auto' : '16px',
                      transform: `rotate(${index % 2 === 0 ? -10 : 10}deg)`,
                      width: '56px',
                      height: '16px',
                      zIndex: 10,
                    }}
                  />
                )}

                {/* Left Side: Rank Stamp + Name Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                  <div
                    className="sketchbook-border"
                    style={{
                      width: '38px',
                      height: '38px',
                      background: '#ffffff',
                      border: `2.5px solid ${border}`,
                      borderBottom: `5px solid ${bottom}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: COMMUNITY_FONT_FAMILY,
                      color: accent,
                      fontSize: '1rem',
                      fontWeight: '400',
                      flexShrink: 0,
                    }}
                  >
                    #{rank}
                  </div>

                  <div style={{ display: 'grid', gap: '4px', minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
                      <span
                        style={{
                          fontFamily: COMMUNITY_FONT_FAMILY,
                          fontSize: rank <= 3 ? '1.15rem' : '1.05rem',
                          color: rank <= 3 ? accent : '#1e293b',
                          fontWeight: '400',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.1,
                        }}
                      >
                        {chapterWord} {entry.chapter}: {entry.title}
                      </span>
                      
                      {RankIcon && (
                        <motion.div
                          animate={{ rotate: [0, -8, 8, 0] }}
                          transition={{ repeat: Infinity, duration: 3.5, delay: index * 0.25 }}
                          style={{ color: accent, display: 'inline-flex', alignItems: 'center' }}
                        >
                          {RankIcon}
                        </motion.div>
                      )}

                      {entry.volume && (
                        <div 
                          className="sketchbook-border"
                          style={{
                            background: VOL_COLORS[entry.volume.number] || '#64748b',
                            border: '1.5px solid rgba(0,0,0,0.1)',
                            borderBottom: '3.5px solid rgba(0,0,0,0.2)',
                            color: '#fff',
                            fontFamily: COMMUNITY_FONT_FAMILY,
                            fontSize: '0.68rem',
                            fontWeight: '400',
                            padding: '2px 8px',
                            borderRadius: '8px',
                          }}
                        >
                          {volumeWord} {entry.volume.number}
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Heat Bar */}
                    <div style={{ width: '100%', maxWidth: '240px', height: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', border: '1.5px solid rgba(0,0,0,0.02)', overflow: 'hidden', position: 'relative', marginTop: '2px' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${heatPercent}%` }}
                        transition={{ delay: 0.15 + (index * 0.04), duration: 0.6, type: 'spring' }}
                        style={{ height: '100%', background: rank === 1 ? '#f43f5e' : (accent || '#64748b'), borderRadius: '999px' }}
                      />
                    </div>

                    {/* GAP / Leading Description */}
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.86rem', color: rank === 1 ? '#f43f5e' : '#94a3b8', letterSpacing: '0.2px', marginTop: '1px' }}>
                      {rank === 1
                        ? (t.leadingByReads || 'leading by {count} reads').replace('{count}', String(entries[1] ? entry.count - entries[1].count : entry.count))
                        : (gap > 0 ? (t.readsBehindRank || '{count} reads behind rank #{rank}').replace('{count}', String(gap)).replace('{rank}', String(rank - 1)) : null)}
                    </div>
                  </div>
                </div>

                {/* Right Side: Wobbly Chapter Reads Chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ display: 'grid', justifyItems: 'end', gap: '4px' }}>
                    <div
                      className="sketchbook-border"
                      style={{
                        background: '#ffffff',
                        border: `2.5px solid ${border}`,
                        borderBottom: `4.5px solid ${bottom}`,
                        padding: '6px 14px',
                        borderRadius: '14px',
                        fontFamily: COMMUNITY_FONT_FAMILY,
                        color: accent,
                        fontSize: isMobile ? '0.85rem' : '0.94rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {entry.count} {t.readsLabel || 'reads'}
                    </div>
                    <span style={{ fontFamily: 'var(--font-hand)', color: '#94a3b8', fontSize: '0.78rem' }}>
                      Chapter {entry.chapter}
                    </span>
                  </div>
                </div>
              </div>
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

