import { BarChart3, CheckCircle2, FileText } from 'lucide-react';
import { ANIMAL_CARD_COLORS } from '../../../data/animalQuizData';
import { getCharacterDisplayName } from '../../../data/characterNames';
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

const AnimalQuizResultView = ({ isMobile, matchedResult, copy, onRestart, uiLanguage = 'en' }) => {
  const characterName = matchedResult?.topMatch || matchedResult?.character?.name || '';
  const displayCharacterName = getCharacterDisplayName(characterName, uiLanguage);
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
    <MysteryResultStage>
      <MysteryResultHeader
        isMobile={isMobile}
        title={copy.resultTitle}
        subtitle={displayCharacterName}
        subtitleNote={matchedResult.exploratoryOnly ? copy.exploratoryNote : null}
        titleColor={colors.text}
      />

      <MysteryResultBody
        isMobile={isMobile}
        artwork={(
          <MysteryResultCharacterCard
            isMobile={isMobile}
            colors={colors}
            name={displayCharacterName}
            imageSrc={matchedResult.character?.src}
          />
        )}
      >
        <MysteryResultOverviewGrid isMobile={isMobile} items={overviewCards} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <MysteryResultTextPanel
            isMobile={isMobile}
            icon={FileText}
            title={copy.notesTitle}
            body={matchedResult.reason}
            palette={{
              background: '#fff7ed',
              borderColor: '#fdba74',
              bottomColor: '#f97316',
              titleColor: '#9a3412',
              textColor: '#7c2d12',
            }}
            paddingMobile="16px"
            bodyFontSizeMobile="0.92rem"
          />
          <MysteryResultTextPanel
            isMobile={isMobile}
            icon={CheckCircle2}
            title={copy.dailyPredictionLabel}
            body={matchedResult.prediction}
            palette={{
              background: '#fdf2f8',
              borderColor: '#f9a8d4',
              bottomColor: '#db2777',
              titleColor: '#9d174d',
              textColor: '#831843',
            }}
            paddingMobile="16px"
            bodyFontSizeMobile="0.92rem"
          />
        </div>

        {!!matchedResult.contributionBreakdown?.length ? (
          <MysteryResultContributionPanel
            title={copy.contributionTitle || 'Contribution breakdown'}
            totalValue={matchedResult.contributionTotal}
            totalLabel={copy.contributionTotalLabel || 'total'}
            entries={matchedResult.contributionBreakdown}
            formatLabel={(entry) => formatContributionLabel(entry.label, copy)}
          />
        ) : null}

        <MysteryResultTraitPanel isMobile={isMobile} icon={BarChart3} title={copy.traitsTitle}>
          {matchedResult.displayTraits.map((trait) => (
            <MysteryResultTraitCard
              key={trait.key}
              trait={trait}
              valueLabel={trait.value}
              valueMinWidth="62px"
              badges={[
                {
                  key: 'tier',
                  label: getTierLabel(trait.value, copy),
                  color: trait.color,
                  background: `${trait.color}14`,
                },
              ]}
            />
          ))}
        </MysteryResultTraitPanel>

        <MysteryResultRankingPanel
          isMobile={isMobile}
          title={copy.rankingTitle}
          scores={matchedResult.characterScores}
          scoreFormatter={(entry) => formatPercent(entry.score)}
          bottomStats={bottomStats}
        />

        <MysteryResultRestartButton
          isMobile={isMobile}
          label={copy.retakeLabel}
          onRestart={onRestart}
        />
      </MysteryResultBody>
    </MysteryResultStage>
  );
};

export default AnimalQuizResultView;
