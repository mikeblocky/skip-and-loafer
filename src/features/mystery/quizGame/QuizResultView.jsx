import React from 'react';
import { motion } from 'framer-motion';

void motion;
import { BarChart3, CheckCircle2, FileText } from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';
import { CHARACTER_COLORS } from '../../../data/characters';
import { toMysteryLabelCase } from './ui';

const PRIMARY_AXIS_KEYS = ['social', 'planning', 'focus', 'drive'];
const TRAIT_COLORS = {
  social: '#60a5fa',
  planning: '#8b5cf6',
  focus: '#34d399',
  drive: '#f59e0b',
  adaptability: '#14b8a6',
  stability: '#22c55e',
  discipline: '#6366f1',
  reliability: '#ef4444',
};

const clampTraitValue = (value) => Math.max(-99, Math.min(99, Math.round(value)));
const formatPercent = (value) => `${Math.round(value)}%`;
const formatContributionLabel = (label, t) => {
  const map = {
    social: 'Social fit',
    planning: 'Planning fit',
    focus: 'Focus fit',
    drive: 'Drive fit',
    alignment: 'Pattern alignment',
    'distance fit': 'Distance fit',
    agreement: 'Axis agreement',
    'reliability adj': 'Reliability bonus',
    'direction penalty': 'Direction penalty',
    'response penalty': 'Response penalty',
  };
  return t.quiz.contributionLabels?.[label] || map[label] || label;
};

const getMatchColors = (characterName, fallbackColors = []) => {
  const mappedKey = Object.keys(CHARACTER_COLORS).find(
    (key) => key.includes(characterName) || characterName.includes(key.split(' ')[0]),
  );

  if (mappedKey && CHARACTER_COLORS[mappedKey]) {
    return CHARACTER_COLORS[mappedKey];
  }

  if (!fallbackColors.length) {
    return { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' };
  }

  return fallbackColors[characterName.length % fallbackColors.length];
};

const getTraitDescription = (key, value, t) => {
  const intensity = Math.abs(value);
  const strengthKey = intensity >= 70 ? 'strong' : intensity >= 40 ? 'clear' : 'light';
  const strength =
    t.quiz.traitDescriptions?.strength?.[strengthKey] ||
    (strengthKey === 'strong' ? 'strong signal' : strengthKey === 'clear' ? 'clear lean' : 'light lean');
  const direction = t.quiz.traitDescriptions?.[key]?.[value >= 0 ? 'pos' : 'neg'] || '';
  return direction ? `${strength} ${direction}` : strength;
};

const QuizResultView = ({
  isMobile,
  matchedResult,
  fallbackColors,
  t,
  showAllScores,
  setShowAllScores,
  onRestart,
}) => {
  const characterName = matchedResult?.topMatch || matchedResult?.character?.name || '';
  const colors = getMatchColors(characterName, fallbackColors);
  const rankingTitle = (t.quiz.traits.suitabilityRankingTitle || t.quiz.suitabilityRanking || '')
    .replace('{confidence}', matchedResult.confidence);
  const visibleScores = showAllScores
    ? matchedResult.characterScores
    : matchedResult.characterScores.slice(0, 5);

  const traitRows = [
    ...PRIMARY_AXIS_KEYS.map((axisKey) => ({
      key: axisKey,
      label: t.quiz.traits[axisKey],
      value: matchedResult.standardizedAxes?.[axisKey] || 0,
    })),
    {
      key: 'adaptability',
      label: t.quiz.traits.adaptability,
      value: clampTraitValue(((1 - (matchedResult.sliderExtremeRate || 0)) * 100) - 50),
    },
    {
      key: 'stability',
      label: t.quiz.traits.stability,
      value: clampTraitValue((matchedResult.responseIntegrity || 0) - 50),
    },
    {
      key: 'discipline',
      label: t.quiz.traits.discipline,
      value: clampTraitValue(((matchedResult.pairConsistency || 0) * 100) - 50),
    },
    {
      key: 'reliability',
      label: t.quiz.traits.reliability,
      value: clampTraitValue((matchedResult.reliabilityIndex || 0) - 50),
    },
  ];

  const overviewCards = [
    {
      key: 'confidence',
      label: t.quiz.confidence,
      value: formatPercent(matchedResult.confidence),
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1e40af',
    },
    {
      key: 'reliability',
      label: t.quiz.reliabilityIndex,
      value: formatPercent(matchedResult.reliabilityIndex),
      bg: '#f5f3ff',
      border: '#c4b5fd',
      text: '#6d28d9',
    },
    {
      key: 'integrity',
      label: t.quiz.integrityScore,
      value: formatPercent(matchedResult.responseIntegrity),
      bg: '#ecfdf5',
      border: '#86efac',
      text: '#166534',
    },
    {
      key: 'pairConsistency',
      label: t.quiz.pairConsistency,
      value: formatPercent((matchedResult.pairConsistency || 0) * 100),
      bg: '#fff7ed',
      border: '#fdba74',
      text: '#c2410c',
    },
  ];

  const bottomStats = [
    { label: t.quiz.coherence, value: formatPercent((matchedResult.coherence || 0) * 100) },
    { label: t.quiz.extremeRate, value: formatPercent((matchedResult.sliderExtremeRate || 0) * 100) },
    { label: t.quiz.suitabilityScore, value: formatPercent(matchedResult.suitabilityScore || 0) },
    { label: t.quiz.runnerUpLabel || 'Runner up', value: matchedResult.runnerUp || '-' },
  ];

  if (matchedResult.recoveryRounds > 0) {
    bottomStats.push({ label: t.quiz.recoveryRounds, value: String(matchedResult.recoveryRounds) });
  }

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0, y: 24 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 120 }}
      style={{ width: '100%', maxWidth: '940px', display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <div style={{ textAlign: 'center', display: 'grid', gap: '8px' }}>
        <div style={{ color: '#1e40af', fontSize: isMobile ? '2.1rem' : '2.7rem', lineHeight: 1.1 }}>
          {toMysteryLabelCase(t.quiz.resultTitle)}
        </div>
        <div style={{ color: '#475569', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>{characterName}</div>
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
            <div className="sketchbook-border" style={{ background: '#fff7ed', border: '3.5px solid #fdba74', borderBottom: '9.5px solid #f97316', borderRadius: '24px', padding: '20px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9a3412', fontSize: '1.15rem' }}>
                <FileText size={22} />
                {toMysteryLabelCase(t.quiz.notesTitle)}
              </div>
              <div style={{ color: '#7c2d12', fontSize: '1rem', lineHeight: 1.55 }}>{matchedResult.reason}</div>
            </div>

            <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3.5px solid #f9a8d4', borderBottom: '9.5px solid #db2777', borderRadius: '24px', padding: '20px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9d174d', fontSize: '1.15rem' }}>
                <CheckCircle2 size={22} />
                {toMysteryLabelCase(t.quiz.dailyPrediction)}
              </div>
              <div style={{ color: '#831843', fontSize: '1rem', lineHeight: 1.55 }}>{matchedResult.prediction}</div>
            </div>
          </div>

          {!!matchedResult.contributionBreakdown?.length && (
            <div className="sketchbook-border" style={{ background: '#f8fafc', border: '3.5px solid #cbd5e1', borderBottom: '9.5px solid #94a3b8', borderRadius: '24px', padding: '20px', display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ color: '#334155', fontSize: '1.15rem' }}>
                  {toMysteryLabelCase(t.quiz.contributionTitle || 'Contribution breakdown')}
                </div>
                <div style={{ color: '#0f172a', background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '999px', padding: '6px 12px', fontSize: '0.92rem' }}>
                  {(matchedResult.contributionTotal || 0) > 0 ? '+' : ''}{Math.round(matchedResult.contributionTotal || 0)} {t.quiz.contributionTotalLabel || 'total'}
                </div>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {matchedResult.contributionBreakdown.slice(0, 8).map((entry) => (
                  <div key={`${entry.label}-${entry.value}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '12px', background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '12px 14px' }}>
                    <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.25 }}>
                      {formatContributionLabel(entry.label, t)}
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
              {toMysteryLabelCase(t.quiz.personalityTraits)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              {traitRows.map((trait) => {
                const color = TRAIT_COLORS[trait.key] || '#60a5fa';
                const polarityLabel = trait.value >= 0 ? (t.quiz.higherLabel || 'Higher') : (t.quiz.lowerLabel || 'Lower');

                return (
                  <div
                    key={trait.key}
                    className="sketchbook-border"
                    style={{
                      background: '#ffffff',
                      border: `3px solid ${color}`,
                      borderBottom: `7px solid ${color}`,
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
                          minWidth: '58px',
                          textAlign: 'center',
                          color,
                          background: `${color}14`,
                          border: `2px solid ${color}`,
                          borderRadius: '999px',
                          padding: '4px 10px',
                          fontSize: '0.92rem',
                          lineHeight: 1,
                        }}
                      >
                        {trait.value > 0 ? '+' : ''}{trait.value}
                      </div>
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.4 }}>
                      {getTraitDescription(trait.key, trait.value, t)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color, background: `${color}14`, borderRadius: '999px', padding: '4px 10px', fontSize: '0.82rem', lineHeight: 1 }}>
                        {polarityLabel}
                      </span>
                      <span style={{ color: '#475569', background: '#f8fafc', borderRadius: '999px', padding: '4px 10px', fontSize: '0.82rem', lineHeight: 1 }}>
                        {Math.abs(trait.value) >= 70 ? (t.quiz.strongSignalLabel || 'Strong signal') : Math.abs(trait.value) >= 40 ? (t.quiz.clearLeanLabel || 'Clear lean') : (t.quiz.lightLeanLabel || 'Light lean')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sketchbook-border" style={{ background: '#ffffff', border: '3.5px solid #cbd5e1', borderBottom: '9.5px solid #94a3b8', borderRadius: '24px', padding: '20px', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ color: '#334155', fontSize: '1.15rem', textAlign: isMobile ? 'center' : 'left' }}>{toMysteryLabelCase(rankingTitle)}</div>
              {matchedResult.characterScores.length > 5 && (
                <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllScores((previous) => !previous)}
                    className="sketchbook-border paper-interact"
                    style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '6px solid #2563eb', color: '#1e40af', padding: '10px 16px', borderRadius: '16px', cursor: 'pointer', fontSize: '0.95rem' }}
                  >
                    {toMysteryLabelCase(showAllScores ? t.quiz.hideAll : t.quiz.showAll)}
                  </motion.button>
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {visibleScores.map((entry, index) => (
                <div key={entry.name} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '12px', background: index === 0 ? '#eff6ff' : '#f8fafc', border: `2px solid ${index === 0 ? '#93c5fd' : '#e2e8f0'}`, borderRadius: '18px', padding: '12px 14px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.92rem' }}>{index + 1}</span>
                  <span style={{ color: index === 0 ? '#1e40af' : '#334155', fontSize: '1rem' }}>{entry.name}</span>
                  <span style={{ color: '#0f172a', fontSize: '0.95rem' }}>{formatPercent(entry.score)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : `repeat(${Math.min(bottomStats.length, 5)}, minmax(0, 1fr))`, gap: '10px' }}>
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
              {toMysteryLabelCase(t.quiz.retakeBtn)}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizResultView;
