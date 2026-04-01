import { BarChart3, CheckCircle2, FileText } from 'lucide-react';
import { CHARACTER_COLORS } from '../../../data/characters';
import {
  MysteryResultBody,
  MysteryResultCharacterCard,
  MysteryResultContributionPanel,
  MysteryResultHeader,
  MysteryResultOverviewGrid,
  MysteryResultRankingPanel,
  MysteryResultRestartButton,
  MysteryResultStage,
  MysteryResultTextPanel,
  MysteryResultTraitCard,
  MysteryResultTraitPanel,
} from '../results/MysteryResultPrimitives';
import { QuizActionButton, QUIZ_BUTTON_PALETTES } from './QuizPrimitives';

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
    <MysteryResultStage>
      <MysteryResultHeader
        isMobile={isMobile}
        title={t.quiz.resultTitle}
        subtitle={characterName}
      />

      <MysteryResultBody
        isMobile={isMobile}
        artwork={(
          <MysteryResultCharacterCard
            isMobile={isMobile}
            colors={colors}
            name={characterName}
            imageSrc={matchedResult.character?.src}
          />
        )}
      >
        <MysteryResultOverviewGrid isMobile={isMobile} items={overviewCards} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <MysteryResultTextPanel
            isMobile={isMobile}
            icon={FileText}
            title={t.quiz.notesTitle}
            body={matchedResult.reason}
            palette={{
              background: '#fff7ed',
              borderColor: '#fdba74',
              bottomColor: '#f97316',
              titleColor: '#9a3412',
              textColor: '#7c2d12',
            }}
          />
          <MysteryResultTextPanel
            isMobile={isMobile}
            icon={CheckCircle2}
            title={t.quiz.dailyPrediction}
            body={matchedResult.prediction}
            palette={{
              background: '#fdf2f8',
              borderColor: '#f9a8d4',
              bottomColor: '#db2777',
              titleColor: '#9d174d',
              textColor: '#831843',
            }}
          />
        </div>

        {!!matchedResult.contributionBreakdown?.length ? (
          <MysteryResultContributionPanel
            title={t.quiz.contributionTitle || 'Contribution breakdown'}
            totalValue={matchedResult.contributionTotal}
            totalLabel={t.quiz.contributionTotalLabel || 'total'}
            entries={matchedResult.contributionBreakdown}
            formatLabel={(entry) => formatContributionLabel(entry.label, t)}
          />
        ) : null}

        <MysteryResultTraitPanel isMobile={isMobile} icon={BarChart3} title={t.quiz.personalityTraits}>
          {traitRows.map((trait) => {
            const color = TRAIT_COLORS[trait.key] || '#60a5fa';
            const magnitude = Math.abs(trait.value);
            const polarityLabel = trait.value >= 0 ? (t.quiz.higherLabel || 'Higher') : (t.quiz.lowerLabel || 'Lower');

            return (
              <MysteryResultTraitCard
                key={trait.key}
                trait={{
                  ...trait,
                  color,
                  description: getTraitDescription(trait.key, trait.value, t),
                }}
                valueLabel={`${trait.value > 0 ? '+' : ''}${trait.value}`}
                badges={[
                  {
                    key: 'polarity',
                    label: polarityLabel,
                    color,
                    background: `${color}14`,
                  },
                  {
                    key: 'intensity',
                    label:
                      magnitude >= 70
                        ? (t.quiz.strongSignalLabel || 'Strong signal')
                        : magnitude >= 40
                          ? (t.quiz.clearLeanLabel || 'Clear lean')
                          : (t.quiz.lightLeanLabel || 'Light lean'),
                  },
                ]}
              />
            );
          })}
        </MysteryResultTraitPanel>

        <MysteryResultRankingPanel
          isMobile={isMobile}
          title={rankingTitle}
          headerAction={matchedResult.characterScores.length > 5 ? (
            <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <QuizActionButton
                isMobile={isMobile}
                onClick={() => setShowAllScores((previous) => !previous)}
                aria-pressed={showAllScores}
                palette={QUIZ_BUTTON_PALETTES.softBlue}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '10px 16px', borderRadius: '16px', fontSize: '0.95rem' }}
              >
                {showAllScores ? t.quiz.hideAll : t.quiz.showAll}
              </QuizActionButton>
            </div>
          ) : null}
          scores={visibleScores}
          scoreFormatter={(entry) => formatPercent(entry.score)}
          bottomStats={bottomStats}
          maxBottomColumns={5}
        />

        <MysteryResultRestartButton
          isMobile={isMobile}
          label={t.quiz.retakeBtn}
          onRestart={onRestart}
        />
      </MysteryResultBody>
    </MysteryResultStage>
  );
};

export default QuizResultView;
