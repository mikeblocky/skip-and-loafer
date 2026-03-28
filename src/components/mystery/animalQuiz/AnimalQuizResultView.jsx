import React from 'react';
import { motion } from 'framer-motion';

void motion;
import { BarChart3, CheckCircle2, FileText } from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';
import { ANIMAL_CARD_COLORS } from '../../../data/animalQuizData';
import { toMysteryLabelCase } from '../quizGame/ui';

const formatPercent = (value) => `${Math.round(value)}%`;
const formatContributionLabel = (label, copy) => {
  const map = {
    'axis fit': 'Axis fit',
    'factor fit': 'Factor fit',
    alignment: 'Pattern alignment',
    'top-factor overlap': 'Top-factor overlap',
    'reliability adj': 'Reliability bonus',
    'response penalty': 'Response penalty',
  };
  return copy.contributionLabels?.[label] || map[label] || label;
};

const getTierLabel = (value, copy) => {
  if (value >= 80) return copy.tierLabels?.high || 'High';
  if (value >= 60) return copy.tierLabels?.clear || 'Clear';
  if (value >= 40) return copy.tierLabels?.balanced || 'Balanced';
  return copy.tierLabels?.quiet || 'Quiet';
};

const AnimalQuizResultView = ({ isMobile, matchedResult, copy, onRestart }) => {
  const characterName = matchedResult?.topMatch || matchedResult?.character?.name || '';
  const colors = ANIMAL_CARD_COLORS[characterName] || { bg: '#eff6ff', border: '#60a5fa', text: '#1d4ed8' };

  const overviewCards = [
    {
      key: 'confidence',
      label: copy.certaintyLabel,
      value: formatPercent(matchedResult.confidence),
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1e40af',
    },
    {
      key: 'reliability',
      label: copy.reliabilityIndexLabel,
      value: formatPercent(matchedResult.reliabilityIndex),
      bg: '#f5f3ff',
      border: '#c4b5fd',
      text: '#6d28d9',
    },
    {
      key: 'integrity',
      label: copy.integrityScoreLabel,
      value: formatPercent(matchedResult.responseIntegrity),
      bg: '#ecfdf5',
      border: '#86efac',
      text: '#166534',
    },
    {
      key: 'consistency',
      label: copy.consistencyLabel,
      value: formatPercent(matchedResult.consistencyScore),
      bg: '#fff7ed',
      border: '#fdba74',
      text: '#c2410c',
    },
  ];

  const bottomStats = [
    { label: copy.coherenceLabel, value: formatPercent((matchedResult.coherence || 0) * 100) },
    { label: copy.extremeRateLabel, value: formatPercent((matchedResult.sliderExtremeRate || 0) * 100) },
    { label: copy.runnerUpLabel, value: matchedResult.runnerUp || '?' },
  ];

  if (matchedResult.recoveryRounds > 0) {
    bottomStats.push({ label: copy.recoveryRoundsLabel, value: String(matchedResult.recoveryRounds) });
  }

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0, y: 24 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 120 }}
      style={{ width: '100%', maxWidth: '940px', display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <div style={{ textAlign: 'center', display: 'grid', gap: '8px' }}>
        <div style={{ color: colors.text, fontSize: isMobile ? '2.1rem' : '2.7rem', lineHeight: 1.1 }}>
          {toMysteryLabelCase(copy.resultTitle)}
        </div>
        <div style={{ color: '#475569', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>{characterName}</div>
        {matchedResult.exploratoryOnly && (
          <div style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.45 }}>
            {copy.exploratoryNote}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <motion.div
            whileHover={isMobile ? {} : { scale: 1.05, rotate: 1.5, y: -4 }}
            style={{
              background: colors.bg,
              border: `3.5px solid ${colors.border}`,
              borderRadius: '24px',
              borderBottomWidth: '11.5px',
              padding: '16px',
              boxShadow: `0 12px 32px ${colors.border}35`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              position: 'relative',
              transform: 'rotate(-1.5deg)',
              width: isMobile ? '200px' : '240px',
              maxWidth: '100%',
            }}
            className="paper-interact"
          >
            <img
              src={matchedResult.character?.src}
              alt={characterName}
              style={{
                width: '100%',
                height: isMobile ? '180px' : '240px',
                objectFit: 'contain',
                filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.2))',
              }}
              draggable="false"
            />
            <div
              style={{
                fontSize: isMobile ? '1.35rem' : '1.55rem',
                color: colors.text,
                background: '#ffffff',
                padding: '4px 20px',
                borderRadius: '99px',
                border: `3.5px solid ${colors.border}`,
                boxShadow: '0 4px 0 rgba(0,0,0,0.05)',
                transform: 'rotate(1deg)',
                textAlign: 'center',
              }}
            >
              {characterName}
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
            {overviewCards.map((item) => (
              <div
                key={item.key}
                className="sketchbook-border"
                style={{
                  background: item.bg,
                  border: `3px solid ${item.border}`,
                  borderBottom: `7px solid ${item.border}`,
                  borderRadius: '18px',
                  padding: '14px 14px 12px 14px',
                  display: 'grid',
                  gap: '6px',
                }}
              >
                <div style={{ color: item.text, fontSize: '0.88rem', lineHeight: 1.2 }}>
                  {toMysteryLabelCase(item.label)}
                </div>
                <div style={{ color: item.text, fontSize: isMobile ? '1.15rem' : '1.2rem', lineHeight: 1 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="sketchbook-border" style={{ background: '#fff7ed', border: '3.5px solid #fdba74', borderBottom: '9.5px solid #f97316', borderRadius: '24px', padding: isMobile ? '16px' : '20px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9a3412', fontSize: '1.15rem' }}>
                <FileText size={22} />
                {toMysteryLabelCase(copy.notesTitle)}
              </div>
              <div style={{ color: '#7c2d12', fontSize: isMobile ? '0.92rem' : '1rem', lineHeight: 1.55 }}>{matchedResult.reason}</div>
            </div>

            <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3.5px solid #f9a8d4', borderBottom: '9.5px solid #db2777', borderRadius: '24px', padding: isMobile ? '16px' : '20px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9d174d', fontSize: '1.15rem' }}>
                <CheckCircle2 size={22} />
                {toMysteryLabelCase(copy.dailyPredictionLabel)}
              </div>
              <div style={{ color: '#831843', fontSize: isMobile ? '0.92rem' : '1rem', lineHeight: 1.55 }}>{matchedResult.prediction}</div>
            </div>
          </div>

          {!!matchedResult.contributionBreakdown?.length && (
            <div className="sketchbook-border" style={{ background: '#f8fafc', border: '3.5px solid #cbd5e1', borderBottom: '9.5px solid #94a3b8', borderRadius: '24px', padding: '20px', display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ color: '#334155', fontSize: '1.15rem' }}>
                  {toMysteryLabelCase(copy.contributionTitle || 'Contribution breakdown')}
                </div>
                <div style={{ color: '#0f172a', background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '999px', padding: '6px 12px', fontSize: '0.92rem' }}>
                  {(matchedResult.contributionTotal || 0) > 0 ? '+' : ''}{Math.round(matchedResult.contributionTotal || 0)} {copy.contributionTotalLabel || 'total'}
                </div>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {matchedResult.contributionBreakdown.slice(0, 8).map((entry) => (
                  <div key={`${entry.label}-${entry.value}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '12px', background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '12px 14px' }}>
                    <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.25 }}>
                      {formatContributionLabel(entry.label, copy)}
                    </div>
                    <div style={{ color: entry.value >= 0 ? '#166534' : '#b91c1c', fontSize: '0.95rem' }}>
                      {entry.value >= 0 ? '+' : ''}{Math.round(entry.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sketchbook-border" style={{ background: '#f8fbff', border: '3.5px solid #bfdbfe', borderBottom: '9.5px solid #93c5fd', borderRadius: '24px', padding: '20px', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e40af', fontSize: '1.15rem' }}>
              <BarChart3 size={22} />
              {toMysteryLabelCase(copy.traitsTitle)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              {matchedResult.displayTraits.map((trait) => (
                <div
                  key={trait.key}
                  className="sketchbook-border"
                  style={{
                    background: '#ffffff',
                    border: `3px solid ${trait.color}`,
                    borderBottom: `7px solid ${trait.color}`,
                    borderRadius: '18px',
                    padding: '14px 16px',
                    display: 'grid',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start' }}>
                    <div style={{ color: '#1e293b', fontSize: '1rem', lineHeight: 1.2 }}>
                      {toMysteryLabelCase(trait.label)}
                    </div>
                    <div
                      style={{
                        minWidth: '62px',
                        textAlign: 'center',
                        color: trait.color,
                        background: `${trait.color}14`,
                        border: `2px solid ${trait.color}`,
                        borderRadius: '999px',
                        padding: '4px 10px',
                        fontSize: '0.92rem',
                        lineHeight: 1,
                      }}
                    >
                      {trait.value}
                    </div>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.4 }}>
                    {trait.description}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: trait.color, background: `${trait.color}14`, borderRadius: '999px', padding: '4px 10px', fontSize: '0.82rem', lineHeight: 1 }}>
                      {getTierLabel(trait.value, copy)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sketchbook-border" style={{ background: '#ffffff', border: '3.5px solid #cbd5e1', borderBottom: '9.5px solid #94a3b8', borderRadius: '24px', padding: '20px', display: 'grid', gap: '14px' }}>
            <div style={{ color: '#334155', fontSize: '1.15rem', textAlign: isMobile ? 'center' : 'left' }}>
              {toMysteryLabelCase(copy.rankingTitle)}
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {matchedResult.characterScores.map((entry, index) => (
                <div key={entry.name} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '12px', background: index === 0 ? '#eff6ff' : '#f8fafc', border: `2px solid ${index === 0 ? '#93c5fd' : '#e2e8f0'}`, borderRadius: '18px', padding: '12px 14px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.92rem' }}>{index + 1}</span>
                  <span style={{ color: index === 0 ? '#1e40af' : '#334155', fontSize: '1rem' }}>{entry.name}</span>
                  <span style={{ color: '#0f172a', fontSize: '0.95rem' }}>{formatPercent(entry.score)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : `repeat(${Math.min(bottomStats.length, 4)}, minmax(0, 1fr))`, gap: '10px' }}>
              {bottomStats.map((item) => (
                <div
                  key={item.label}
                  className="sketchbook-border"
                  style={{
                    background: '#f8fafc',
                    border: '2.5px solid #e2e8f0',
                    borderBottom: '6px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '12px 12px 10px 12px',
                    display: 'grid',
                    gap: '4px',
                  }}
                >
                  <div style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.2 }}>
                    {toMysteryLabelCase(item.label)}
                  </div>
                  <div style={{ color: '#0f172a', fontSize: '1rem', lineHeight: 1.15 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.95, y: 6 }}
              onClick={() => {
                triggerHaptic('success');
                onRestart();
              }}
              className="sketchbook-border paper-interact"
              style={{ background: '#3b82f6', border: '3.5px solid #2563eb', borderBottom: '9.5px solid #1d4ed8', color: '#fff', padding: isMobile ? '14px 28px' : '16px 44px', borderRadius: '22px', cursor: 'pointer', fontSize: isMobile ? '1.15rem' : '1.25rem', boxShadow: '0 10px 0 rgba(37, 99, 235, 0.2)' }}
            >
              {toMysteryLabelCase(copy.retakeLabel)}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimalQuizResultView;
