import { motion } from 'framer-motion';
import { Crown, Trophy, Medal, Users, Gamepad2, Star } from 'lucide-react';
import { createPaperPanelStyle } from '../../../components/shared/paper/paperTheme';
import { normalizeScoreToHundred } from '../quizUtils';

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
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const LeaderboardTab = ({ isMobile, t, usingGlobalLeaderboard, displayedLeaderboard }) => {
  const totalPlayed = displayedLeaderboard.reduce((sum, entry) => sum + (entry.played || 0), 0);
  const totalEntries = displayedLeaderboard.length;
  const playedSeparator = t.played === '回' ? '' : ' ';

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariant}
      style={{ display: 'grid', gap: '20px', padding: '10px' }}
    >
      
      {/* Quiz Board Stats Header */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
        <motion.div 
          variants={smashVariant}
          whileHover={{ scale: 1.02, rotate: 1 }}
          className="sketchbook-border"
          style={{ 
            ...createPaperPanelStyle({
              background: '#fff5f8',
              borderColor: '#fda4af',
              bottomColor: '#f43f5e',
              radius: '24px',
              shadow: '0 8px 16px rgba(244, 63, 94, 0.06)'
            }),
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
          }}
        >
          <div 
            className="sketchbook-border"
            style={{ 
              background: '#ffffff', 
              padding: '10px', 
              borderRadius: '16px', 
              border: '3px solid #fda4af',
              borderBottom: '6px solid #f43f5e',
              color: '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Gamepad2 size={26} strokeWidth={2.8} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#9f1239', fontSize: '1.6rem', lineHeight: 1, fontWeight: '400' }}>{totalPlayed}</div>
            <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#f43f5e', fontSize: '0.94rem', marginTop: '2px', fontWeight: '400' }}>{t.gamesPlayedLabel || 'Games played'}</div>
          </div>
        </motion.div>

        <motion.div 
          variants={smashVariant}
          whileHover={{ scale: 1.02, rotate: -1 }}
          className="sketchbook-border"
          style={{ 
            ...createPaperPanelStyle({
              background: '#eff6ff',
              borderColor: '#bfdbfe',
              bottomColor: '#3b82f6',
              radius: '24px',
              shadow: '0 8px 16px rgba(59, 130, 246, 0.06)'
            }),
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
          }}
        >
          <div 
            className="sketchbook-border"
            style={{ 
              background: '#ffffff', 
              padding: '10px', 
              borderRadius: '16px', 
              border: '3px solid #bfdbfe',
              borderBottom: '6px solid #3b82f6',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={26} strokeWidth={2.8} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#1e3a8a', fontSize: '1.6rem', lineHeight: 1, fontWeight: '400' }}>{totalEntries}</div>
            <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#3b82f6', fontSize: '0.94rem', marginTop: '2px', fontWeight: '400' }}>{t.totalPlayersLabel || 'Total players'}</div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gap: '14px' }}>
        <motion.div 
          variants={smashVariant}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}
        >
           <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#1f2937', fontSize: '1.25rem', fontWeight: '400' }}>
            {t.leaderboardHeading || 'Rankings'}
           </span>
        </motion.div>

        {displayedLeaderboard.length === 0 && (
          <motion.div 
            variants={smashVariant}
            className="sketchbook-border"
            style={{
              ...createPaperPanelStyle({
                background: '#f8fafc',
                borderColor: '#cbd5e1',
                bottomColor: '#94a3b8',
                radius: '20px',
              }),
              padding: '20px',
              textAlign: 'center',
              color: '#64748b',
              fontFamily: COMMUNITY_FONT_FAMILY,
              fontSize: '1rem',
            }}
          >
            {t.noLeaderboard || 'No scoreboard entries yet.'}
          </motion.div>
        )}

        <div
          className="hide-scrollbar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
            maxHeight: isMobile ? 'calc(100vh - 350px)' : '320px',
            paddingRight: '4px',
            paddingBottom: '24px',
          }}
        >
          {displayedLeaderboard.map((entry, index) => {
            const rank = index + 1;
            
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
                key={`${entry.name}-${index}`}
                variants={smashVariant}
                whileHover={{ scale: 1.015, x: 6, rotate: rank <= 3 ? (rank % 2 === 0 ? 0.5 : -0.5) : 0 }}
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
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Washi tape badge on the top ranks */}
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

                {/* Left Side: Rank Stamp Badge + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span
                      style={{
                        fontFamily: COMMUNITY_FONT_FAMILY,
                        fontSize: rank <= 3 ? '1.15rem' : '1.05rem',
                        color: rank <= 3 ? accent : '#1e293b',
                        fontWeight: '400',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.name}
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
                  </div>
                </div>

                {/* Right Side: Score Badge & Played Counts */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <div style={{ display: 'grid', justifyItems: 'end', gap: '3px' }}>
                    <div
                      className="sketchbook-border"
                      style={{
                        background: '#ffffff',
                        border: `2.5px solid ${border}`,
                        borderBottom: `4.5px solid ${bottom}`,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontFamily: COMMUNITY_FONT_FAMILY,
                        color: accent,
                        fontSize: isMobile ? '0.85rem' : '0.94rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {rank === 1 && <Star size={13} fill="#fbbf24" color="#fbbf24" style={{ marginBottom: '1px' }} />}
                      {normalizeScoreToHundred(entry.bestScore)}%
                    </div>
                    <span style={{ fontFamily: 'var(--font-hand)', color: '#94a3b8', fontSize: '0.76rem' }}>
                      {entry.played}{playedSeparator}{t.played || 'games played'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardTab;
