import { motion } from 'framer-motion';
import { History, Award, Calendar, Star, ChevronRight } from 'lucide-react';
import { createPaperPanelStyle } from '../../../components/shared/paper/paperTheme';
import { getDifficultyLabel, getQuestionSetLabel, normalizeScoreToHundred } from '../quizUtils';

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

const HistoryTab = ({ isMobile, t, displayedHistory }) => {
  const totalAttempts = displayedHistory.length;
  const bestScorePercent = displayedHistory.length > 0
    ? Math.max(...displayedHistory.map((item) => normalizeScoreToHundred(item.score)))
    : 0;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariant}
      style={{ display: 'grid', gap: '20px', padding: '10px' }}
    >
      {/* History Stats Header */}
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
            <History size={26} strokeWidth={2.8} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#9f1239', fontSize: '1.6rem', lineHeight: 1, fontWeight: '400' }}>{totalAttempts}</div>
            <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#f43f5e', fontSize: '0.94rem', marginTop: '2px', fontWeight: '400' }}>{t.historyGlobalAttempts || 'Global attempts'}</div>
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
            <Award size={26} strokeWidth={2.8} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#1e3a8a', fontSize: '1.6rem', lineHeight: 1, fontWeight: '400' }}>{bestScorePercent}%</div>
            <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#3b82f6', fontSize: '0.94rem', marginTop: '2px', fontWeight: '400' }}>{t.historyTopRecord || 'Top record'}</div>
          </div>
        </motion.div>
      </div>

      {/* History Items list */}
      <div style={{ display: 'grid', gap: '14px' }}>
        <motion.div 
          variants={smashVariant}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}
        >
           <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#1f2937', fontSize: '1.25rem', fontWeight: '400' }}>
            {t.historyHeading || 'Recent records'}
           </span>
        </motion.div>

        {displayedHistory.length === 0 && (
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
              padding: '24px',
              textAlign: 'center',
              color: '#64748b',
              fontFamily: COMMUNITY_FONT_FAMILY,
              fontSize: '1rem',
            }}
          >
            {t.noHistory || 'No quiz history yet.'}
          </motion.div>
        )}

        <div
          className="hide-scrollbar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            maxHeight: isMobile ? 'calc(100vh - 350px)' : '320px',
            paddingRight: '4px',
            paddingBottom: '24px',
          }}
        >
          {displayedHistory.map((item, index) => {
            const colors = [
              { bg: '#fff5f8', border: '#f9a8d4', bottom: '#f472b6', accent: '#be185d', washi: 'pink' },
              { bg: '#eff6ff', border: '#bfdbfe', bottom: '#60a5fa', accent: '#1d4ed8', washi: 'blue' },
              { bg: '#f0fdf4', border: '#bbf7d0', bottom: '#4ade80', accent: '#15803d', washi: 'yellow' },
              { bg: '#f5f3ff', border: '#ddd6fe', bottom: '#a78bfa', accent: '#6d28d9', washi: 'pink' },
            ];
            const col = colors[index % colors.length];
            const isRecent = index === 0;

            return (
              <motion.div 
                key={item.id || `${item.playedAt}-${index}`}
                variants={smashVariant}
                whileHover={{ scale: 1.015, x: 6, rotate: isRecent ? -0.5 : 0 }}
                className="sketchbook-border"
                style={{
                  ...createPaperPanelStyle({
                    background: col.bg,
                    borderColor: col.border,
                    bottomColor: col.bottom,
                    radius: '20px',
                    shadow: isRecent ? '0 10px 20px rgba(15,23,42,0.06)' : '0 4px 8px rgba(15,23,42,0.01)',
                  }),
                  position: 'relative',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Washi tape badge on the most recent attempt */}
                {isRecent && (
                  <div
                    className={`washi-tape washi-tape--${col.washi}`}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '24px',
                      transform: 'rotate(-5deg)',
                      width: '60px',
                      height: '16px',
                      zIndex: 10,
                    }}
                  />
                )}

                {/* Left Side: Attempt Badge & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                  <div
                    className="sketchbook-border"
                    style={{
                      width: '38px',
                      height: '38px',
                      background: '#ffffff',
                      border: `2.5px solid ${col.border}`,
                      borderBottom: `5px solid ${col.bottom}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: COMMUNITY_FONT_FAMILY,
                      color: col.accent,
                      fontSize: '0.94rem',
                      fontWeight: '400',
                      flexShrink: 0,
                    }}
                  >
                    #{displayedHistory.length - index}
                  </div>

                  <div style={{ display: 'grid', gap: '6px', minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: COMMUNITY_FONT_FAMILY,
                          fontSize: '1.1rem',
                          color: col.accent,
                          fontWeight: '400',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </span>
                      <span style={{ fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: '0.86rem' }}>
                        {t.historyScored || 'scored'} {item.score}/{item.total}
                      </span>
                    </div>

                    {/* Difficulty and Question Set Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <div 
                        className="sketchbook-border"
                        style={{ 
                          background: '#ffffff', 
                          border: `1.5px solid ${col.border}`, 
                          borderBottom: `3.5px solid ${col.bottom}`,
                          padding: '2px 8px', 
                          borderRadius: '8px',
                          fontFamily: COMMUNITY_FONT_FAMILY,
                          fontSize: '0.72rem',
                          color: col.accent,
                        }}
                      >
                        {getDifficultyLabel(item.difficultyMode, t)}
                      </div>
                      <div 
                        className="sketchbook-border"
                        style={{ 
                          background: '#ffffff', 
                          border: `1.5px solid ${col.border}`, 
                          borderBottom: `3.5px solid ${col.bottom}`,
                          padding: '2px 8px', 
                          borderRadius: '8px',
                          fontFamily: COMMUNITY_FONT_FAMILY,
                          fontSize: '0.72rem',
                          color: col.accent,
                        }}
                      >
                        {getQuestionSetLabel(item.questionSet, t)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Score Badge & Played Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ display: 'grid', justifyItems: 'end', gap: '4px' }}>
                    <div
                      className="sketchbook-border"
                      style={{
                        background: '#ffffff',
                        border: `2.5px solid ${col.border}`,
                        borderBottom: `4.5px solid ${col.bottom}`,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontFamily: COMMUNITY_FONT_FAMILY,
                        color: col.accent,
                        fontSize: isMobile ? '0.85rem' : '0.94rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {normalizeScoreToHundred(item.score) === 100 && (
                        <Star size={13} fill="#fbbf24" color="#fbbf24" style={{ marginBottom: '1px' }} />
                      )}
                      {normalizeScoreToHundred(item.score)}%
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                      <Calendar size={12} />
                      <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.75rem' }}>
                        {new Date(item.playedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" strokeWidth={3} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryTab;

