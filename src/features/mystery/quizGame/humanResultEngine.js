import { CHAR_PROFILES } from '../../../data/quizData';
import { getCharacterDisplayName } from '../../../data/characterNames';
import { AXES, toMysteryName } from './config';
import { computeHumanLiveQuality } from './humanQuizUtils';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const calculateHumanResult = ({
  finalAxes,
  axisSignal,
  axisPolarity,
  responseQuality,
  pairResponses,
  responseVectors,
  portraitData,
  evidenceTrail,
  recoveryRounds,
  uiLanguage = 'en',
}) => {
  const totalSignal = AXES.reduce((sum, axis) => sum + (axisSignal[axis] || 0), 0);
  const axisWeight = AXES.reduce((acc, axis) => {
    const baseSignal = axisSignal[axis] || 0;
    const ratio = totalSignal > 0 ? baseSignal / totalSignal : 0.25;
    acc[axis] = Math.max(0.75, Math.min(1.7, 0.95 + ratio * 2.1));
    return acc;
  }, {});

  const standardizedAxes = AXES.reduce((acc, axis) => {
    const raw = finalAxes[axis] || 0;
    const normalizedSignal = Math.max(8, axisSignal[axis] || 8);
    acc[axis] = clamp(Math.round((raw / normalizedSignal) * 100), -100, 100);
    return acc;
  }, {});

  const normalizedAxes = AXES.reduce((acc, axis) => {
    acc[axis] = clamp(Math.round((standardizedAxes[axis] / 10) * 10) / 10, -10, 10);
    return acc;
  }, {});

  const tScores = AXES.reduce((acc, axis) => {
    const standardized = standardizedAxes[axis] || 0;
    acc[axis] = Math.max(30, Math.min(70, Math.round(50 + (standardized * 0.18))));
    return acc;
  }, {});

  const axisPercentiles = AXES.reduce((acc, axis) => {
    const standardized = (standardizedAxes[axis] || 0) / 100;
    const percentile = 100 / (1 + Math.exp(-(standardized * 3.2)));
    acc[axis] = Math.round(percentile);
    return acc;
  }, {});

  const consistency = AXES.reduce((sum, axis) => {
    const pos = axisPolarity[axis]?.pos || 0;
    const neg = axisPolarity[axis]?.neg || 0;
    const total = pos + neg;
    if (!total) return sum + 0.5;
    return sum + (Math.max(pos, neg) / total);
  }, 0) / AXES.length;

  const liveQuality = computeHumanLiveQuality({
    responseQuality,
    pairResponses,
    responseVectors,
  });
  const responseIntegrity = liveQuality.integrity;
  const coherence = liveQuality.coherence;
  const sliderExtremeRate = liveQuality.sliderExtremeRate;
  const pairConsistency = liveQuality.pairConsistency;
  const qualityMultiplier = 0.82 + ((responseIntegrity / 100) * 0.18);
  const coverageMultiplier = Math.max(0.84, Math.min(1.02, 0.84 + (Math.min(totalSignal, 300) / 300) * 0.18));
  const reliabilityAdjustment =
    ((responseIntegrity - 50) * 0.16) +
    ((((pairConsistency || 0.5) * 100) - 50) * 0.08) +
    (((coherence || 0.5) * 100 - 50) * 0.06);
  const responsePenalty = Math.max(0, ((1 - consistency) * 9) + ((sliderExtremeRate || 0) * 8));

  const normalizedMagnitude =
    Math.sqrt(AXES.reduce((sum, axis) => sum + (normalizedAxes[axis] || 0) * (normalizedAxes[axis] || 0), 0)) || 1;
  const maxDistance =
    Math.sqrt(AXES.reduce((sum, axis) => sum + ((axisWeight[axis] || 1) * 20 * 20), 0)) || 1;

  const rankedMatches = Object.entries(CHAR_PROFILES)
    .map(([key, profile]) => {
      const dx = (normalizedAxes.social || 0) - (profile.social || 0);
      const dy = (normalizedAxes.planning || 0) - (profile.planning || 0);
      const dz = (normalizedAxes.focus || 0) - (profile.focus || 0);
      const dw = (normalizedAxes.drive || 0) - (profile.drive || 0);
      const weightedDistance = Math.sqrt(
        axisWeight.social * dx * dx +
        axisWeight.planning * dy * dy +
        axisWeight.focus * dz * dz +
        axisWeight.drive * dw * dw
      );

      const distanceScore = clamp(100 - ((weightedDistance / maxDistance) * 100), 0, 100);
      const meanAbsDelta = (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) + Math.abs(dw)) / AXES.length;
      const axisAgreementScore = clamp(100 - (meanAbsDelta * 8.2), 0, 100);

      const profileMagnitude =
        Math.sqrt(AXES.reduce((sum, axis) => sum + (profile[axis] || 0) * (profile[axis] || 0), 0)) || 1;
      const dot = AXES.reduce((sum, axis) => sum + (normalizedAxes[axis] || 0) * (profile[axis] || 0), 0);
      const cosineSimilarity = clamp(dot / (normalizedMagnitude * profileMagnitude), -1, 1);
      const alignmentScore = ((cosineSimilarity + 1) / 2) * 100;

      const baseSuitability =
        (distanceScore * 0.52) +
        (alignmentScore * 0.31) +
        (axisAgreementScore * 0.17);

      const weightSum = AXES.reduce((sum, axis) => sum + (axisWeight[axis] || 1), 0) || 1;
      const axisContributionRows = AXES.map((axis) => {
        const delta = (normalizedAxes[axis] || 0) - (profile[axis] || 0);
        const closeness = Math.max(0, 100 - (Math.abs(delta) * 9.2));
        const weighted = closeness * (axisWeight[axis] || 1);
        const mismatchPenalty =
          Math.sign(normalizedAxes[axis] || 0) !== Math.sign(profile[axis] || 0) &&
          Math.abs(normalizedAxes[axis] || 0) > 2 &&
          Math.abs(profile[axis] || 0) > 2
            ? Math.min(7, Math.abs(delta) * 0.45)
            : 0;
        return {
          label: axis,
          value: Math.round(((weighted / weightSum) * 0.5) - mismatchPenalty),
          mismatchPenalty,
        };
      }).sort((a, b) => b.value - a.value);

      const directionPenalty = axisContributionRows.reduce((sum, entry) => sum + entry.mismatchPenalty, 0);
      const contributionBreakdown = [
        ...axisContributionRows.slice(0, 4).map((entry) => ({
          label: entry.label,
          value: entry.value,
        })),
        { label: 'alignment', value: Math.round(alignmentScore * 0.31) },
        { label: 'distance fit', value: Math.round(distanceScore * 0.52) },
        { label: 'agreement', value: Math.round(axisAgreementScore * 0.17) },
        { label: 'reliability adj', value: Math.round(reliabilityAdjustment) },
        { label: 'direction penalty', value: -Math.round(directionPenalty) },
        { label: 'response penalty', value: -Math.round(responsePenalty) },
      ];
      const contributionTotal = Math.round(baseSuitability + reliabilityAdjustment - directionPenalty - responsePenalty);

      const suitabilityScore = Math.round(
        clamp(
          (baseSuitability + reliabilityAdjustment - directionPenalty - responsePenalty) *
            qualityMultiplier *
            coverageMultiplier,
          10,
          99
        )
      );

      return {
        key,
        cosineSimilarity,
        distanceScore,
        alignmentScore,
        axisAgreementScore,
        suitabilityScore,
        contributionBreakdown,
        contributionTotal,
      };
    })
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const bestMatch = rankedMatches[0] || { key: 'Mitsumi', suitabilityScore: 60, cosineSimilarity: 0 };
  const runnerUp = rankedMatches[1] || bestMatch;
  const temperature = 14;
  const scores = rankedMatches.map((match) => Math.exp((match.suitabilityScore || 0) / temperature));
  const scoreSum = scores.reduce((sum, score) => sum + score, 0) || 1;
  const bestProb = scores.length ? (scores[0] / scoreSum) : 0.5;
  const separation = Math.max(0, (bestMatch.suitabilityScore || 0) - (runnerUp.suitabilityScore || 0));

  const reliabilityIndex = Math.round(
    Math.max(
      28,
      Math.min(
        99,
        (responseIntegrity * 0.54) +
          ((pairConsistency * 100) * 0.22) +
          ((consistency * 100) * 0.14) +
          ((Math.max(0, separation) * 2.1) * 0.10)
      )
    )
  );
  const exploratoryOnly = reliabilityIndex < 58;

  const baseConfidence = Math.max(
    58,
    Math.min(
      98,
      Math.round(
        ((bestMatch.suitabilityScore || 60) * 0.52) +
          (bestProb * 100 * 0.28) +
          (separation * 1.8) +
          (Math.min(totalSignal, 320) * 0.055) +
          (consistency * 11)
      )
    )
  );
  const confidence = Math.round(
    baseConfidence * (0.68 + ((responseIntegrity / 100) * 0.32)) * (exploratoryOnly ? 0.88 : 1)
  );

  const bestDisplayName = toMysteryName(bestMatch.key);
  const localizedBestDisplayName = getCharacterDisplayName(bestDisplayName, uiLanguage);
  const matchObj =
    portraitData.find((portrait) => portrait.name === bestDisplayName || portrait.name.includes(bestDisplayName)) ||
    portraitData[5];

  const dedupedScores = new Map();
  rankedMatches.forEach((entry) => {
    const displayName = toMysteryName(entry.key);
    const localizedDisplayName = getCharacterDisplayName(displayName, uiLanguage);
    const previous = dedupedScores.get(displayName);
    if (!previous || entry.suitabilityScore > previous.score) {
      dedupedScores.set(displayName, {
        name: localizedDisplayName,
        score: entry.suitabilityScore,
        distanceScore: Math.round(entry.distanceScore),
        alignmentScore: Math.round(entry.alignmentScore),
        axisAgreementScore: Math.round(entry.axisAgreementScore),
      });
    }
  });

  const characterScores = Array.from(dedupedScores.values()).sort((a, b) => b.score - a.score);
  const topCandidates = characterScores.slice(0, 5).map((entry) => ({
    name: entry.name,
    score: entry.score,
  }));
  const runnerUpDisplay =
    characterScores.find((entry) => entry.name !== localizedBestDisplayName)?.name || getCharacterDisplayName(toMysteryName(runnerUp.key), uiLanguage);

  return {
    character: matchObj,
    matchKey: bestMatch.key,
    confidence,
    suitabilityScore: bestMatch.suitabilityScore,
    finalAxes,
    axisWeight,
    topMatch: localizedBestDisplayName,
    runnerUp: runnerUpDisplay,
    consistency,
    cosineSimilarity: bestMatch.cosineSimilarity,
    tScores,
    axisPercentiles,
    topCandidates,
    characterScores,
    standardizedAxes,
    responseIntegrity,
    coherence,
    sliderExtremeRate,
    pairConsistency,
    reliabilityIndex,
    exploratoryOnly,
    contributionBreakdown: bestMatch.contributionBreakdown || [],
    contributionTotal: bestMatch.contributionTotal || 0,
    recoveryRounds,
    evidenceTrail: [...evidenceTrail],
  };
};
