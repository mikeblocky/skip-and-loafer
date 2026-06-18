import { CHAR_PROFILES, QUESTION_BANK } from '../../../data/quizData';
import { AXES } from './config';

const zeroAxes = () => ({ social: 0, planning: 0, focus: 0, drive: 0 });

export const computeHumanLiveQuality = ({
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

  const avgVector = responseVectors.reduce(
    (acc, vector) => {
      AXES.forEach((axis) => {
        acc[axis] += vector?.[axis] || 0;
      });
      return acc;
    },
    zeroAxes()
  );
  const vectorCount = Math.max(1, responseVectors.length);
  AXES.forEach((axis) => {
    avgVector[axis] /= vectorCount;
  });
  const avgNorm = Math.sqrt(AXES.reduce((sum, axis) => sum + avgVector[axis] * avgVector[axis], 0)) || 1;
  const coherence = responseVectors.length
    ? responseVectors.reduce((sum, vector) => {
      const dot = AXES.reduce((acc, axis) => acc + (vector?.[axis] || 0) * avgVector[axis], 0);
      const vectorNorm = Math.sqrt(AXES.reduce((acc, axis) => acc + (vector?.[axis] || 0) * (vector?.[axis] || 0), 0)) || 1;
      return sum + Math.max(0, dot / (vectorNorm * avgNorm));
    }, 0) / responseVectors.length
    : 0.55;

  const adaptiveExtremeBuffer = Math.max(
    0.08,
    Math.min(
      0.52,
      0.12 +
        (Math.max(0, coherence - 0.55) * 0.55) +
        (Math.max(0, pairConsistency - 0.55) * 0.45)
    )
  );
  const extremePenaltyRate = Math.max(0, sliderExtremeRate - adaptiveExtremeBuffer);

  const integrity = Math.round(
    Math.max(
      35,
      Math.min(
        99,
        (coherence * 100 * 0.33) +
          (pairConsistency * 100 * 0.27) +
          ((1 - extremePenaltyRate) * 100 * 0.18) +
          ((1 - positionBiasPenalty) * 100 * 0.14) +
          ((1 - Math.max(0, allocationConcentration - 0.72) / 0.28) * 100 * 0.08)
      )
    )
  );

  return { integrity, coherence, pairConsistency, sliderExtremeRate, positionBiasPenalty };
};

export const summarizeHumanQuestionSignal = (question) => {
  const signal = zeroAxes();
  const absorb = (modifiers = {}, factor = 1) => {
    AXES.forEach((axis) => {
      signal[axis] += Math.abs(modifiers?.[axis] || 0) * factor;
    });
  };

  if (question.type === 'slider' && question.axis) {
    signal[question.axis] += 10;
    return signal;
  }

  if (
    question.type === 'choice' ||
    question.type === 'multi' ||
    question.type === 'rank2' ||
    question.type === 'ipsative' ||
    question.type === 'allocation' ||
    question.type === 'confidenceChoice' ||
    question.type === 'constellation'
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
    return signal;
  }

  return signal;
};

export const pickMostInformativeHumanQuestion = ({
  remainingQuestions,
  axes,
  axisSignal,
  typeCount,
}) => {
  if (!remainingQuestions.length) return null;

  const totalSignal = AXES.reduce((sum, axis) => sum + (axisSignal[axis] || 0), 0);
  const uncertainty = AXES.reduce((acc, axis) => {
    const ratio = totalSignal > 0 ? (axisSignal[axis] || 0) / totalSignal : 0;
    acc[axis] = Math.max(0.55, 1.3 - ratio * 1.25);
    return acc;
  }, {});

  const provisionalRank = Object.entries(CHAR_PROFILES)
    .map(([key, profile]) => {
      const dx = (axes.social || 0) - (profile.social || 0);
      const dy = (axes.planning || 0) - (profile.planning || 0);
      const dz = (axes.focus || 0) - (profile.focus || 0);
      const dw = (axes.drive || 0) - (profile.drive || 0);
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
      return { key, profile, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  const topA = provisionalRank[0]?.profile;
  const topB = provisionalRank[1]?.profile;
  const discriminationAxisWeight = AXES.reduce((acc, axis) => {
    const diff = Math.abs((topA?.[axis] || 0) - (topB?.[axis] || 0));
    acc[axis] = 1 + diff * 0.11;
    return acc;
  }, {});

  const scored = remainingQuestions.map((question, index) => {
    const signal = summarizeHumanQuestionSignal(question);
    const axisGain = AXES.reduce((sum, axis) => sum + signal[axis] * uncertainty[axis], 0);
    const discriminationGain = AXES.reduce((sum, axis) => sum + signal[axis] * (discriminationAxisWeight[axis] || 1), 0);
    const diversityBonus = Math.max(0, 1.7 - ((typeCount[question.type] || 0) * 0.42));
    return {
      index,
      score: ((axisGain * 0.62) + (discriminationGain * 0.38)) * diversityBonus + (Math.random() * 0.45),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return remainingQuestions[scored[0].index];
};

export const buildHumanQuestionSet = ({ questionBank, count = 35 }) => {
  const validityItems = questionBank.filter((question) => question.isValidityItem);
  const basePool = questionBank.filter((question) => !question.isValidityItem);
  const byType = basePool.reduce((acc, question) => {
    if (!acc[question.type]) acc[question.type] = [];
    acc[question.type].push(question);
    return acc;
  }, {});

  const pickRandom = (items, amount) =>
    [...(items || [])]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(amount, (items || []).length));

  const seed = [
    ...validityItems,
    ...pickRandom(byType.slider, 3),
    ...pickRandom(byType.choice, 3),
    ...pickRandom(byType.yesno, 2),
    ...pickRandom(byType.duel, 2),
    ...pickRandom(byType.multi, 2),
    ...pickRandom(byType.rank2, 2),
    ...pickRandom(byType.ipsative, 2),
    ...pickRandom(byType.spectrum, 2),
    ...pickRandom(byType.stance, 2),
    ...pickRandom(byType.allocation, 2),
    ...pickRandom(byType.confidenceChoice, 2),
    ...pickRandom(byType.hold, 2),
    ...pickRandom(byType.rhythm, 2),
    ...pickRandom(byType.constellation, 2),
  ];

  const usedIds = new Set(seed.map((question) => question.id));
  const remainder = questionBank
    .filter((question) => !usedIds.has(question.id))
    .sort(() => Math.random() - 0.5);
  return [...seed, ...remainder]
    .slice(0, Math.min(count, questionBank.length))
    .sort(() => Math.random() - 0.5);
};
