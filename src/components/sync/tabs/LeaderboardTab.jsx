import { motion } from 'framer-motion';
import { Loader2, BookOpen } from 'lucide-react';
import { CHAPTERS, VOLUMES, VOL_COLORS } from '../../../data/chapters';
import { getReadTier, MEDAL_ICONS, MEDAL_COLORS, VOL_BGS, getChapterWord, getVolumeWord, NOTE_PALETTES } from '../syncConfig';

const LeaderboardTab = ({ isMobile, isLoadingLeaderboard, leaderboard, t, uiLanguage, ListRow }) => {
  if (isLoadingLeaderboard) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', background: '#fafafa', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader2 size={32} color="#d1d5db" />
          </motion.div>
        </div>
        <p style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
          {t.loadingGlobal}
        </p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', background: '#fafafa', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <BookOpen size={32} style={{ color: '#d1d5db' }} />
        </div>
        <p style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
          {t.noGlobal}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {leaderboard.map((entry, idx) => {
        const ch = CHAPTERS.find(c => c.number === entry.chapter);
        const volObj = VOLUMES.find(v => v.chapters.includes(entry.chapter));
        const tier = getReadTier(entry.count, uiLanguage);
        const rank = idx + 1;
        const MedalIcon = idx < 3 ? MEDAL_ICONS[idx] : null;

        const chIdx = volObj ? volObj.chapters.indexOf(entry.chapter) : 0;
        const volBg = volObj ? (VOL_BGS[volObj.number] || '#faf5ff') : '#faf5ff';
        const volBorder = volObj ? (VOL_COLORS[volObj.number] || '#c4b5fd') : '#c4b5fd';
        const chAccent = NOTE_PALETTES[chIdx % NOTE_PALETTES.length].accent;
        const customNote = { bg: volBg, border: volBorder, accent: chAccent };

        return (
          <ListRow
            isMobile={isMobile}
            key={entry.chapter}
            index={idx}
            finished
            readCount={entry.count}
            customNote={customNote}
            tierBg={tier.bg}
            tierBorder={tier.border}
            tierText={tier.text}
            tierAccent={tier.accent}
            numberLine2={rank}
            title={ch?.title || `${getChapterWord(uiLanguage)} ${entry.chapter}`}
            subtitle={
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', color: tier.accent }}>
                {getChapterWord(uiLanguage)} {entry.chapter} {volObj ? `• ${getVolumeWord(uiLanguage)} ${volObj.number}` : ''}
              </span>
            }
            rightContent={(
              <>
                {MedalIcon && (
                  <div style={{ background: MEDAL_COLORS[idx], color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <MedalIcon size={14} />
                  </div>
                )}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ background: tier.bg, color: tier.text, padding: '4px 12px', borderRadius: '9999px', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 'bold', boxShadow: `0 2px 6px ${tier.border}40`, whiteSpace: 'nowrap' }}
                >
                  {entry.count} {t.reads}
                </motion.div>
              </>
            )}
          />
        );
      })}
    </div>
  );
};

export default LeaderboardTab;
