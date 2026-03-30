import { ANIMAL_AXES, ANIMAL_PROFILES } from '../../../data/animalQuizData';
import {
  buildAnimalFactors,
  clamp,
  computeProfileBalanceAdjustment,
  shuffle,
  zeroAnimalAxes,
} from './utils';

export const computeAnimalConsistency = (axisPolarity) =>
  ANIMAL_AXES.reduce((sum, axis) => {
    const pos = axisPolarity[axis]?.pos || 0;
    const neg = axisPolarity[axis]?.neg || 0;
    const total = pos + neg;
    return sum + (total ? (Math.max(pos, neg) / total) : 0.5);
  }, 0) / ANIMAL_AXES.length;

export const computeAnimalLiveQuality = ({
  responseQuality,
  pairResponses,
  responseVectors,
}) => {
  const sliderTotal = responseQuality.sliderCount + responseQuality.spectrumCount;
  const sliderExtremeRate = sliderTotal
    ? (responseQuality.sliderExtreme + responseQuality.spectrumExtreme) / sliderTotal
    : 0;
  const optionTotal = responseQuality.optionSelectTotal || 0;
  const dominantOptionRate = optionTotal
    ? Math.max(...responseQuality.optionSelectCounts.map((count) => count / optionTotal))
    : 0.25;
  const positionBiasPenalty = Math.max(0, Math.min(1, (dominantOptionRate - 0.55) / 0.45));
  const allocationConcentration = responseQuality.allocationCount
    ? responseQuality.allocationConcentrationSum / responseQuality.allocationCount
    : 0.55;
  const pairValues = Object.values(pairResponses);
  const pairConsistency = pairValues.length
    ? pairValues.reduce((sum, pair) => {
      if (pair?.a == null || pair?.b == null) return sum + 0.5;
      return sum + Math.max(0, 1 - (Math.abs(pair.a - pair.b) / 2));
    }, 0) / pairValues.length
    : 0.7;
  const averageVector = responseVectors.reduce((acc, vector) => {
    ANIMAL_AXES.forEach((axis) => {
      acc[axis] += vector?.[axis] || 0;
    });
    return acc;
  }, zeroAnimalAxes());
  const vectorCount = Math.max(1, responseVectors.length);
  ANIMAL_AXES.forEach((axis) => {
    averageVector[axis] /= vectorCount;
  });
  const averageNorm =
    Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => sum + ((averageVector[axis] || 0) ** 2), 0)) || 1;
  const coherence = responseVectors.length
    ? responseVectors.reduce((sum, vector) => {
      const dot = ANIMAL_AXES.reduce(
        (acc, axis) => acc + ((vector?.[axis] || 0) * (averageVector[axis] || 0)),
        0
      );
      const vectorNorm =
        Math.sqrt(ANIMAL_AXES.reduce((acc, axis) => acc + ((vector?.[axis] || 0) ** 2), 0)) || 1;
      return sum + Math.max(0, dot / (vectorNorm * averageNorm));
    }, 0) / responseVectors.length
    : 0.58;
  const adaptiveExtremeBuffer = Math.max(
    0.08,
    Math.min(
      0.54,
      0.13 +
        (Math.max(0, coherence - 0.55) * 0.52) +
        (Math.max(0, pairConsistency - 0.55) * 0.45)
    )
  );
  const extremePenaltyRate = Math.max(0, sliderExtremeRate - adaptiveExtremeBuffer);
  const integrity = Math.round(
    clamp(
      (coherence * 100 * 0.31) +
        (pairConsistency * 100 * 0.29) +
        ((1 - extremePenaltyRate) * 100 * 0.16) +
        ((1 - positionBiasPenalty) * 100 * 0.14) +
        ((1 - Math.max(0, allocationConcentration - 0.72) / 0.28) * 100 * 0.1),
      35,
      99
    )
  );

  return { integrity, coherence, pairConsistency, sliderExtremeRate };
};

export const summarizeAnimalQuestionSignal = (question) => {
  const signal = zeroAnimalAxes();
  const absorb = (modifiers = {}, factor = 1) => {
    ANIMAL_AXES.forEach((axis) => {
      signal[axis] += Math.abs(modifiers?.[axis] || 0) * factor;
    });
  };

  if (question.type === 'slider' && question.axis) {
    signal[question.axis] += 10;
    return signal;
  }

  if (
    [
      'choice',
      'multi',
      'rank2',
      'ipsative',
      'allocation',
      'confidenceChoice',
      'drift',
      'grid',
      'sort4',
      'pairMatch',
      'constellation',
    ].includes(question.type)
  ) {
    (question.options || []).forEach((option) => absorb(option.modifiers || {}));
    return signal;
  }

  if (question.type === 'hold') {
    absorb(question.lowModifiers || {}, 1.3);
    absorb(question.highModifiers || {}, 1.3);
    return signal;
  }

  if (question.type === 'rhythm') {
    absorb(question.slowModifiers || {}, 1.1);
    absorb(question.fastModifiers || {}, 1.1);
    absorb(question.steadyModifiers || {}, 1.1);
    absorb(question.wildModifiers || {}, 1.1);
    return signal;
  }

  if (question.type === 'tradeoff') {
    absorb(question.left?.modifiers || {}, 1.4);
    absorb(question.right?.modifiers || {}, 1.4);
    return signal;
  }

  if (question.type === 'stance') {
    absorb(question.modifiers || {}, 2);
    return signal;
  }

  if (question.type === 'yesno') {
    absorb(question.yesModifiers || {});
    absorb(question.noModifiers || {});
    return signal;
  }

  if (question.type === 'duel' || question.type === 'spectrum') {
    absorb(question.left?.modifiers || {});
    absorb(question.right?.modifiers || {});
  }

  return signal;
};

export const pickMostInformativeAnimalQuestion = ({
  remainingQuestions,
  axes,
  axisSignal,
  typeCount,
}) => {
  if (!remainingQuestions.length) return null;
  const totalSignal = ANIMAL_AXES.reduce((sum, axis) => sum + (axisSignal[axis] || 0), 0);
  const uncertainty = ANIMAL_AXES.reduce((acc, axis) => {
    const ratio = totalSignal > 0 ? (axisSignal[axis] || 0) / totalSignal : 0;
    acc[axis] = Math.max(0.55, 1.3 - ratio * 1.25);
    return acc;
  }, {});
  const provisional = Object.values(ANIMAL_PROFILES)
    .map((profile) => ({
      axes: profile.axes,
      distance: Math.sqrt(
        ANIMAL_AXES.reduce(
          (sum, axis) => sum + (((axes[axis] || 0) - ((profile.axes || {})[axis] || 0)) ** 2),
          0
        )
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
  const topA = provisional[0]?.axes || {};
  const topB = provisional[1]?.axes || {};
  const discrimination = ANIMAL_AXES.reduce((acc, axis) => {
    acc[axis] = 1 + (Math.abs((topA[axis] || 0) - (topB[axis] || 0)) * 0.09);
    return acc;
  }, {});

  return remainingQuestions
    .map((question) => {
      const signal = summarizeAnimalQuestionSignal(question);
      const axisGain = ANIMAL_AXES.reduce((sum, axis) => sum + (signal[axis] * uncertainty[axis]), 0);
      const discriminationGain = ANIMAL_AXES.reduce(
        (sum, axis) => sum + (signal[axis] * (discrimination[axis] || 1)),
        0
      );
      const diversityBonus = Math.max(0, 1.8 - ((typeCount[question.type] || 0) * 0.42));
      return {
        question,
        score: ((axisGain * 0.6) + (discriminationGain * 0.4)) * diversityBonus + (Math.random() * 0.45),
      };
    })
    .sort((a, b) => b.score - a.score)[0]?.question || null;
};

export const buildAnimalQuestionSet = ({ questionBank, count = 35 }) => {
  const byType = questionBank.reduce((acc, question) => {
    if (!acc[question.type]) acc[question.type] = [];
    acc[question.type].push(question);
    return acc;
  }, {});
  const pick = (items, amount) => shuffle(items || []).slice(0, Math.min(amount, (items || []).length));

  const guaranteed = [
    ...pick(byType.flip, 1),
    ...pick(byType.reaction, 1),
    ...pick(byType.timing, 1),
  ];
  const guaranteedIds = new Set(guaranteed.map((question) => question.id));
  const seeded = [
    ...pick(byType.slider, 2),
    ...pick(byType.choice, 1),
    ...pick(byType.yesno, 2),
    ...pick(byType.duel, 2),
    ...pick(byType.multi, 2),
    ...pick(byType.rank2, 2),
    ...pick(byType.ipsative, 2),
    ...pick(byType.spectrum, 2),
    ...pick(byType.allocation, 2),
    ...pick(byType.confidenceChoice, 2),
    ...pick(byType.stance, 2),
    ...pick(byType.drift, 1),
    ...pick(byType.tradeoff, 1),
    ...pick(byType.grid, 2),
    ...pick(byType.sort4, 2),
    ...pick(byType.pairMatch, 2),
    ...pick(byType.hold, 2),
    ...pick(byType.rhythm, 2),
    ...pick(byType.constellation, 2),
    ...pick(byType.reaction, 1),
    ...pick(byType.timing, 1),
  ].filter((question) => !guaranteedIds.has(question.id));

  const orderedSeed = [...guaranteed, ...seeded];
  const used = new Set(orderedSeed.map((question) => question.id));
  const filler = shuffle(questionBank.filter((question) => !used.has(question.id)));
  return shuffle([...orderedSeed, ...filler].slice(0, Math.min(count, questionBank.length)));
};

export const calculateAnimalResult = ({
  finalAxes,
  axisSignal,
  axisPolarity,
  responseQuality,
  pairResponses,
  responseVectors,
  portraitData,
  evidenceTrail,
  recoveryRounds,
}) => {
  const totalSignal = ANIMAL_AXES.reduce((sum, axis) => sum + (axisSignal[axis] || 0), 0);
  const axisWeight = ANIMAL_AXES.reduce((acc, axis) => {
    const baseSignal = axisSignal[axis] || 0;
    const ratio = totalSignal > 0 ? baseSignal / totalSignal : (1 / ANIMAL_AXES.length);
    acc[axis] = Math.max(0.75, Math.min(1.7, 0.92 + ratio * 2.1));
    return acc;
  }, {});
  const standardizedAxes = ANIMAL_AXES.reduce((acc, axis) => {
    const raw = finalAxes[axis] || 0;
    const signal = Math.max(8, axisSignal[axis] || 8);
    acc[axis] = clamp(Math.round((raw / signal) * 100), -100, 100);
    return acc;
  }, {});
  const normalizedAxes = ANIMAL_AXES.reduce((acc, axis) => {
    acc[axis] = clamp(Math.round((standardizedAxes[axis] / 10) * 10) / 10, -10, 10);
    return acc;
  }, {});
  const consistency = computeAnimalConsistency(axisPolarity);
  const liveQuality = computeAnimalLiveQuality({ responseQuality, pairResponses, responseVectors });
  const responseIntegrity = liveQuality.integrity;
  const coherence = liveQuality.coherence;
  const sliderExtremeRate = liveQuality.sliderExtremeRate;
  const pairConsistency = liveQuality.pairConsistency;
  const consistencyScore = Math.round(
    clamp(((pairConsistency * 100) * 0.45) + ((consistency * 100) * 0.25) + ((coherence * 100) * 0.3), 35, 99)
  );
  const animalFactors = buildAnimalFactors(standardizedAxes, {
    responseIntegrity,
    coherence,
    sliderExtremeRate,
    pairConsistency,
    consistency,
  });
  const reliabilityAdjustment =
    ((responseIntegrity - 50) * 0.14) +
    ((((pairConsistency || 0.5) * 100) - 50) * 0.08) +
    ((((coherence || 0.5) * 100) - 50) * 0.06);
  const responsePenalty = Math.max(0, ((1 - consistency) * 10) + ((sliderExtremeRate || 0) * 7));
  const normalizedMagnitude =
    Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => sum + ((normalizedAxes[axis] || 0) ** 2), 0)) || 1;
  const maxDistance =
    Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => sum + ((axisWeight[axis] || 1) * 20 * 20), 0)) || 1;
  const userTopFactors = Object.entries(animalFactors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => key);
  const profileEntries = Object.entries(ANIMAL_PROFILES);
  const rankedMatches = profileEntries
    .map(([key, profile]) => {
      const weightedDistance = Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => {
        const delta = (normalizedAxes[axis] || 0) - ((profile.axes || {})[axis] || 0);
        return sum + ((axisWeight[axis] || 1) * delta * delta);
      }, 0));
      const axisSimilarity = clamp(100 - ((weightedDistance / maxDistance) * 100), 0, 100);
      const profileMagnitude =
        Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => sum + ((((profile.axes || {})[axis] || 0) ** 2)), 0)) || 1;
      const dot = ANIMAL_AXES.reduce(
        (sum, axis) => sum + ((normalizedAxes[axis] || 0) * (((profile.axes || {})[axis] || 0))),
        0
      );
      const cosineSimilarity = clamp(dot / (normalizedMagnitude * profileMagnitude), -1, 1);
      const alignmentScore = ((cosineSimilarity + 1) / 2) * 100;
      const factorDiff = Object.entries(profile.factors || {}).reduce(
        (sum, [factorKey, target]) => sum + Math.abs((animalFactors[factorKey] || 0) - target),
        0
      ) / Math.max(1, Object.keys(profile.factors || {}).length);
      const factorSimilarity = clamp(100 - factorDiff, 0, 100);
      const profileTopFactors = Object.entries(profile.factors || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([factorKey]) => factorKey);
      const overlap = userTopFactors.filter((factorKey) => profileTopFactors.includes(factorKey)).length;
      const baseSuitability =
        (axisSimilarity * 0.48) +
        (factorSimilarity * 0.32) +
        (alignmentScore * 0.12) +
        ((52 + (overlap * 24)) * 0.08);
      const profileBalanceAdjustment = computeProfileBalanceAdjustment(key, profileEntries);
      const qualityMultiplier = 0.84 + ((responseIntegrity / 100) * 0.16);
      const coverageMultiplier = Math.max(0.86, Math.min(1.03, 0.86 + (Math.min(totalSignal, 360) / 360) * 0.17));
      const contributionBreakdown = [
        { label: 'axis fit', value: Math.round(axisSimilarity * 0.48) },
        { label: 'factor fit', value: Math.round(factorSimilarity * 0.32) },
        { label: 'alignment', value: Math.round(alignmentScore * 0.12) },
        { label: 'top-factor overlap', value: Math.round((52 + (overlap * 24)) * 0.08) },
        { label: 'profile balance', value: profileBalanceAdjustment },
        { label: 'reliability adj', value: Math.round(reliabilityAdjustment) },
        { label: 'response penalty', value: -Math.round(responsePenalty) },
      ];
      const contributionTotal = Math.round(
        baseSuitability + profileBalanceAdjustment + reliabilityAdjustment - responsePenalty
      );

      return {
        key,
        suitabilityScore: Math.round(
          clamp(
            (baseSuitability + profileBalanceAdjustment + reliabilityAdjustment - responsePenalty) *
              qualityMultiplier *
              coverageMultiplier,
            10,
            99
          )
        ),
        cosineSimilarity,
        contributionBreakdown,
        contributionTotal,
      };
    })
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const bestMatch = rankedMatches[0] || { key: 'Satonosuke', suitabilityScore: 60, cosineSimilarity: 0 };
  const runnerUp = rankedMatches[1] || bestMatch;
  const scaled = rankedMatches.map((entry) => Math.exp((entry.suitabilityScore || 0) / 14));
  const probability = scaled.length
    ? (scaled[0] / (scaled.reduce((sum, value) => sum + value, 0) || 1))
    : 0.5;
  const separation = Math.max(0, (bestMatch.suitabilityScore || 0) - (runnerUp.suitabilityScore || 0));
  const reliabilityIndex = Math.round(
    clamp(
      (responseIntegrity * 0.48) +
        (consistencyScore * 0.22) +
        ((pairConsistency * 100) * 0.18) +
        (Math.max(0, separation) * 0.12),
      30,
      99
    )
  );
  const exploratoryOnly = reliabilityIndex < 60;
  const confidence = Math.round(
    clamp(
      (((bestMatch.suitabilityScore || 60) * 0.52) +
        (probability * 100 * 0.24) +
        (consistencyScore * 0.14) +
        (Math.min(totalSignal, 340) * 0.05) +
        (separation * 1.6)) *
        (exploratoryOnly ? 0.9 : 1),
      56,
      98
    )
  );
  const portrait = portraitData.find((item) => item.name === bestMatch.key) || portraitData[0];

  return {
    character: portrait,
    matchKey: bestMatch.key,
    topMatch: bestMatch.key,
    runnerUp: runnerUp.key,
    animalFactors,
    confidence,
    reliabilityIndex,
    responseIntegrity,
    pairConsistency,
    coherence,
    sliderExtremeRate,
    consistencyScore,
    characterScores: rankedMatches.map((entry) => ({ name: entry.key, score: entry.suitabilityScore })),
    exploratoryOnly,
    contributionBreakdown: bestMatch.contributionBreakdown || [],
    contributionTotal: bestMatch.contributionTotal || 0,
    recoveryRounds,
    evidenceTrail: [...evidenceTrail],
  };
};
