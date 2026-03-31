import { motion } from 'framer-motion';
import { Crown, Trophy, Medal, Users, Gamepad2, Star } from 'lucide-react';
import { ListRow } from '../../sync/syncSharedComponents';
import { normalizeScoreToHundred } from '../quizUtils';

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
          style={{ 
            background: '#fff', 
            border: '4px solid #10b981', 
            borderBottom: '10px solid #059669', 
            borderRadius: '24px', 
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            boxShadow: '0 8px 0 rgba(16, 185, 129, 0.1)'
          }}
        >
          <div style={{ background: '#d1fae5', padding: '12px', borderRadius: '16px', border: '3px solid #10b981' }}>
            <Gamepad2 size={28} color="#059669" strokeWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#065f46', fontSize: '1.5rem', lineHeight: 1 }}>{totalPlayed}</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#10b981', fontSize: '0.9rem', marginTop: '2px' }}>{t.gamesPlayedLabel || 'Games played'}</div>
          </div>
        </motion.div>

        <motion.div 
          variants={smashVariant}
          whileHover={{ scale: 1.02, rotate: -1 }}
          style={{ 
            background: '#fff', 
            border: '4px solid #3b82f6', 
            borderBottom: '10px solid #1d4ed8', 
            borderRadius: '24px', 
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            boxShadow: '0 8px 0 rgba(59, 130, 246, 0.1)'
          }}
        >
          <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '16px', border: '3px solid #3b82f6' }}>
            <Users size={28} color="#1d4ed8" strokeWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1e3a8a', fontSize: '1.5rem', lineHeight: 1 }}>{totalEntries}</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#3b82f6', fontSize: '0.9rem', marginTop: '2px' }}>{t.totalPlayersLabel || 'Total players'}</div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gap: '14px' }}>
        <motion.div 
          variants={smashVariant}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px' }}
        >
           <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: '1.2rem', letterSpacing: '0.5px' }}>
            {t.leaderboardHeading || 'Rankings'}
           </span>
        </motion.div>

        {displayedLeaderboard.length === 0 && (
          <motion.div variants={smashVariant}>
            <ListRow
              index={1}
              noteColor={4}
              numberLine1="—"
              numberLine2="—"
              title={t.noLeaderboard}
              isMobile={isMobile}
            />
          </motion.div>
        )}

        {displayedLeaderboard.map((entry, index) => {
          const rank = index + 1;
          
          let RankIcon = null;
          let customNote = null;
          
          if (rank === 1) {
            RankIcon = <Crown size={24} color="#b45309" strokeWidth={2.5} />;
            customNote = { bg: '#fffbeb', border: '#fbbf24', accent: '#b45309' };
          } else if (rank === 2) {
            RankIcon = <Trophy size={20} color="#475569" strokeWidth={2.5} />;
            customNote = { bg: '#f8fafc', border: '#94a3b8', accent: '#475569' };
          } else if (rank === 3) {
            RankIcon = <Medal size={20} color="#92400e" strokeWidth={2.5} />;
            customNote = { bg: '#fff7ed', border: '#fdba74', accent: '#92400e' };
          }

          return (
            <motion.div 
              key={`${entry.name}-${index}`}
              variants={smashVariant}
              whileHover={{ scale: 1.01, x: 5 }}
            >
              <ListRow
                index={index + 2}
                noteColor={index}
                customNote={customNote}
                numberLine1="#"
                numberLine2={String(rank)}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      fontFamily: 'var(--font-main)', 
                      fontWeight: '900', 
                      fontSize: rank <= 3 ? '1.2rem' : '1.1rem',
                      color: rank <= 3 ? (customNote?.accent || '#1e293b') : '#1e293b'
                    }}>
                      {entry.name}
                    </span>
                    {RankIcon && (
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, delay: index * 0.2 }}
                      >
                        {RankIcon}
                      </motion.div>
                    )}
                  </div>
                }
                isMobile={isMobile}
                rightContent={(
                  <div style={{ display: 'grid', justifyItems: 'end', gap: '4px' }}>
                    <div style={{ 
                      background: rank <= 3 ? '#fff' : '#f8fafc', 
                      border: rank <= 3 ? `3px solid ${customNote.border}` : '2px solid #e2e8f0',
                      borderBottom: rank <= 3 ? `6px solid ${customNote.border}` : '4px solid #cbd5e1',
                      padding: '6px 14px',
                      borderRadius: '14px',
                      fontFamily: 'var(--font-main)', 
                      fontWeight: '900', 
                      color: rank <= 3 ? customNote.accent : '#475569', 
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {rank === 1 && <Star size={16} fill="#fbbf24" color="#fbbf24" />}
                      {normalizeScoreToHundred(entry.bestScore)}%
                    </div>
                    <span style={{ 
                      fontFamily: 'var(--font-hand)', 
                      fontWeight: 'bold', 
                      color: '#94a3b8', 
                      fontSize: isMobile ? '0.7rem' : '0.8rem'
                    }}>
                      {entry.played} games played
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

export default LeaderboardTab;

