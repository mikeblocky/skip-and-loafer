import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import QuizIntegrityCheckpoint from './quizGame/QuizIntegrityCheckpoint';
import QuizQuestionStep from './quizGame/QuizQuestionStep';
import { QUESTION_TYPE_WEIGHT, hashString } from './quizGame/config';
import { toMysteryLabelCase } from './quizGame/ui';
import AnimalQuizResultView from './animalQuiz/AnimalQuizResultView';
import getAnimalQuizCopy from './animalQuiz/copy';
import { ANIMAL_AXES, ANIMAL_DISPLAY_TRAITS, ANIMAL_PROFILES } from '../../data/animalQuizData';
import { ANIMAL_INSTRUCTION_COPY, buildAnimalQuestionBank, buildAnimalRecoveryBank } from '../../data/animalQuizQuestions';

const TRAIT_PALETTE = ['#34d399', '#60a5fa', '#f59e0b', '#8b5cf6', '#14b8a6', '#f97316'];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const zero = () => Object.fromEntries(ANIMAL_AXES.map((axis) => [axis, 0]));
const polarity = () => Object.fromEntries(ANIMAL_AXES.map((axis) => [axis, { pos: 0, neg: 0 }]));
const qualityState = () => ({ sliderCount: 0, sliderExtreme: 0, spectrumCount: 0, spectrumExtreme: 0, optionSelectTotal: 0, optionSelectCounts: [0, 0, 0, 0], allocationCount: 0, allocationConcentrationSum: 0 });
const normalizeSigned = (value) => clamp(Math.round((value + 100) / 2), 0, 100);
const pickInstruction = (value, uiLanguage = 'en') => (typeof value === 'string' ? value : (value?.[uiLanguage] || value?.en || ''));

const buildAnimalFactors = (standardizedAxes, metrics) => {
  const warmth = normalizeSigned(standardizedAxes.warmth || 0);
  const curiosity = normalizeSigned(standardizedAxes.curiosity || 0);
  const vigilance = normalizeSigned(standardizedAxes.vigilance || 0);
  const independence = normalizeSigned(standardizedAxes.independence || 0);
  const play = normalizeSigned(standardizedAxes.play || 0);
  const comfort = normalizeSigned(standardizedAxes.comfort || 0);
  const coherence = (metrics.coherence || 0.5) * 100;
  const pairConsistency = (metrics.pairConsistency || 0.5) * 100;
  const consistency = (metrics.consistency || 0.5) * 100;
  const extremeShield = (1 - (metrics.sliderExtremeRate || 0)) * 100;
  return {
    chaosCharm: clamp(Math.round((play * 0.38) + (warmth * 0.26) + (curiosity * 0.14) + ((100 - vigilance) * 0.12) + ((100 - comfort) * 0.10)), 0, 99),
    watchCircle: clamp(Math.round((vigilance * 0.40) + (curiosity * 0.10) + (independence * 0.14) + (pairConsistency * 0.18) + (coherence * 0.18)), 0, 99),
    denSoftness: clamp(Math.round((comfort * 0.46) + (warmth * 0.22) + (extremeShield * 0.12) + ((metrics.responseIntegrity || 50) * 0.20)), 0, 99),
    soloRoam: clamp(Math.round((independence * 0.42) + (curiosity * 0.18) + ((100 - warmth) * 0.12) + (vigilance * 0.14) + (consistency * 0.14)), 0, 99),
    ritualAnchor: clamp(Math.round((comfort * 0.28) + ((metrics.responseIntegrity || 50) * 0.22) + (pairConsistency * 0.22) + (vigilance * 0.14) + ((100 - play) * 0.14)), 0, 99),
    bounceEnergy: clamp(Math.round((play * 0.42) + (warmth * 0.22) + (curiosity * 0.10) + (coherence * 0.14) + ((100 - vigilance) * 0.12)), 0, 99),
  };
};

const buildAnimalReason = (animalKey, animalFactors, reliabilityIndex, evidenceTrail = [], copy = {}) => {
  const localizedProfile = copy.profiles?.[animalKey] || {};
  const detailSeed = evidenceTrail.slice(-6).map((entry) => `${entry.axis}:${entry.delta}:${entry.label}`).join('|');
  const seed = hashString(`${animalKey}-${Object.values(animalFactors).join('-')}-${reliabilityIndex}-${detailSeed}`);
  const openers = localizedProfile.openers || [copy.reasonFallbacks?.opener || 'Your animal pattern came through clearly.'];
  const opener = openers[seed % (openers.length || 1)];
  const anchor = localizedProfile.anchor || copy.reasonFallbacks?.anchor || '';
  const growth = localizedProfile.growth || copy.reasonFallbacks?.growth || '';
  const factorLine = Object.entries(animalFactors)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => copy.factorLines?.[key])
    .find(Boolean) || '';
  const clueLine = evidenceTrail
    .slice()
    .sort((a, b) => Math.abs(b.delta || 0) - Math.abs(a.delta || 0))
    .slice(0, 1)
    .map((entry) => (copy.clueLead || 'A clear clue came from {label}.').replace('{label}', String(entry.label || '')))
    .filter(Boolean);
  const reliabilityLine = reliabilityIndex < 58
    ? copy.reliabilityContext?.exploratory || 'Treat this as a strong live read that could sharpen further with steadier answers over time.'
    : reliabilityIndex < 74
      ? copy.reliabilityContext?.stable || 'The pattern is fairly stable and holds together well across different question styles.'
      : copy.reliabilityContext?.consistent || 'The pattern stays remarkably consistent even as the quiz changes format and pressure.';
  const blueprints = [
    [opener, anchor, factorLine, ...clueLine, growth, reliabilityLine],
    [opener, factorLine, anchor, ...clueLine, growth, reliabilityLine],
    [`${opener} ${anchor}`, factorLine, ...clueLine, growth, reliabilityLine],
  ];
  return blueprints[seed % blueprints.length].filter(Boolean).join(' ');
};

const computeProfileBalanceAdjustment = (profileKey, profileEntries) => {
  const profile = profileEntries.find(([key]) => key === profileKey)?.[1];
  const others = profileEntries.filter(([key]) => key !== profileKey).map(([, entry]) => entry);
  if (!profile || !others.length) return 0;

  const axisCloseness = others.reduce((sum, other) => {
    const distance = Math.sqrt(ANIMAL_AXES.reduce((acc, axis) => {
      const delta = (((profile.axes || {})[axis] || 0) - ((other.axes || {})[axis] || 0));
      return acc + (delta * delta);
    }, 0));
    return sum + clamp(100 - ((distance / 40) * 100), 0, 100);
  }, 0) / others.length;

  const factorKeys = Object.keys(profile.factors || {});
  const factorCloseness = others.reduce((sum, other) => {
    const diff = factorKeys.reduce((acc, key) => acc + Math.abs((profile.factors?.[key] || 0) - (other.factors?.[key] || 0)), 0) / Math.max(1, factorKeys.length);
    return sum + clamp(100 - diff, 0, 100);
  }, 0) / others.length;

  const distinctiveness = 100 - ((axisCloseness * 0.65) + (factorCloseness * 0.35));
  return clamp(Math.round((distinctiveness - 50) * 0.18), -8, 8);
};

const AnimalQuizGame = ({ isMobile, portraitData, t, uiLanguage = 'en' }) => {
  const copy = React.useMemo(() => getAnimalQuizCopy(uiLanguage, t), [uiLanguage, t]);
  const questionBank = useMemo(() => buildAnimalQuestionBank(uiLanguage), [uiLanguage]);
  const recoveryBank = useMemo(() => buildAnimalRecoveryBank(uiLanguage), [uiLanguage]);
  const localizedQuestionLookup = useMemo(
    () => new Map([...questionBank, ...recoveryBank].map((question) => [question.id, question])),
    [questionBank, recoveryBank],
  );
  const instructionCopy = {
    grid: pickInstruction(ANIMAL_INSTRUCTION_COPY.grid, uiLanguage),
    sort4: pickInstruction(ANIMAL_INSTRUCTION_COPY.sort4, uiLanguage),
    pairMatch: pickInstruction(ANIMAL_INSTRUCTION_COPY.pairMatch, uiLanguage),
    hold: pickInstruction(ANIMAL_INSTRUCTION_COPY.hold, uiLanguage),
    rhythm: pickInstruction(ANIMAL_INSTRUCTION_COPY.rhythm, uiLanguage),
    constellation: pickInstruction(ANIMAL_INSTRUCTION_COPY.constellation, uiLanguage),
    reaction: pickInstruction(ANIMAL_INSTRUCTION_COPY.reaction, uiLanguage),
    timing: pickInstruction(ANIMAL_INSTRUCTION_COPY.timing, uiLanguage),
  };
  const [currentStep, setCurrentStep] = useState(0);
  const [questionIds, setQuestionIds] = useState([]);
  const [axes, setAxes] = useState(zero());
  const [sliderValue, setSliderValue] = useState(3);
  const [spectrumValue, setSpectrumValue] = useState(3);
  const [stanceSelection, setStanceSelection] = useState(null);
  const [multiSelection, setMultiSelection] = useState([]);
  const [rankSelection, setRankSelection] = useState([]);
  const [confidenceSelection, setConfidenceSelection] = useState({ optionIndex: null, level: 2 });
  const [ipsativeMost, setIpsativeMost] = useState(null);
  const [ipsativeLeast, setIpsativeLeast] = useState(null);
  const [allocationPoints, setAllocationPoints] = useState({});
  const [driftSelection, setDriftSelection] = useState([]);
  const [sortSelection, setSortSelection] = useState([]);
  const [pairMatchSelection, setPairMatchSelection] = useState([]);
  const [tradeoffValue, setTradeoffValue] = useState(2);
  const [holdLevel, setHoldLevel] = useState(0);
  const [rhythmPattern, setRhythmPattern] = useState([]);
  const [constellationSelection, setConstellationSelection] = useState([]);
  const [integrityCheckpoint, setIntegrityCheckpoint] = useState(null);
  const [matchedResult, setMatchedResult] = useState(null);
  const axisSignalRef = useRef(zero());
  const axisPolarityRef = useRef(polarity());
  const typeCountRef = useRef({});
  const responseVectorsRef = useRef([]);
  const responseQualityRef = useRef(qualityState());
  const pairResponsesRef = useRef({});
  const pendingAxesRef = useRef(null);
  const integrityPromptCountRef = useRef(0);
  const lastIntegrityPromptStepRef = useRef(0);
  const recoveryRoundRef = useRef(0);
  const evidenceTrailRef = useRef([]);
  const questions = useMemo(
    () => questionIds.map((id) => localizedQuestionLookup.get(id)).filter(Boolean),
    [questionIds, localizedQuestionLookup],
  );

  const resolvedMatchedResult = useMemo(() => {
    if (!matchedResult?.matchKey || !matchedResult?.animalFactors) return matchedResult;
    const displayTraits = ANIMAL_DISPLAY_TRAITS.map((trait, index) => ({
      key: trait.key,
      label: copy.traitLabels?.[trait.key] || trait.label,
      value: matchedResult.animalFactors[trait.key] || 0,
      description:
        (matchedResult.animalFactors[trait.key] || 0) >= 50
          ? (copy.traitDescriptions?.[trait.key]?.high || trait.high)
          : (copy.traitDescriptions?.[trait.key]?.low || trait.low),
      color: TRAIT_PALETTE[index % TRAIT_PALETTE.length],
    }));

    const localizedEvidenceTrail = (matchedResult.evidenceTrail || []).map((entry) => {
      const localizedQuestion = entry.questionId != null ? localizedQuestionLookup.get(entry.questionId) : null;
      return {
        ...entry,
        label: localizedQuestion?.evidenceLabel || localizedQuestion?.text || entry.label,
      };
    });

    return {
      ...matchedResult,
      reason: buildAnimalReason(
        matchedResult.matchKey,
        matchedResult.animalFactors,
        matchedResult.reliabilityIndex,
        localizedEvidenceTrail,
        copy,
      ),
      prediction:
        t.quiz?.characters?.[matchedResult.matchKey]?.prediction ||
        copy.predictionFallback ||
        'A quiet animal mood follows you today.',
      displayTraits,
    };
  }, [copy, matchedResult, t, localizedQuestionLookup]);

  const accumulateAnimalEvidence = (label, modifiers, detail = '', meta = {}) => {
    const dominant = Object.entries(modifiers || {}).sort((a, b) => Math.abs((b[1] || 0)) - Math.abs((a[1] || 0)))[0];
    if (!dominant) return;
    const [axis, delta] = dominant;
    evidenceTrailRef.current = [
      ...evidenceTrailRef.current,
      {
        axis,
        delta,
        label,
        detail,
        questionId: meta.questionId ?? null,
      },
    ];
  };
  const computeConsistency = () => ANIMAL_AXES.reduce((sum, axis) => {
    const pos = axisPolarityRef.current[axis]?.pos || 0;
    const neg = axisPolarityRef.current[axis]?.neg || 0;
    const total = pos + neg;
    return sum + (total ? (Math.max(pos, neg) / total) : 0.5);
  }, 0) / ANIMAL_AXES.length;

  const computeLiveQuality = () => {
    const sliderTotal = responseQualityRef.current.sliderCount + responseQualityRef.current.spectrumCount;
    const sliderExtremeRate = sliderTotal ? (responseQualityRef.current.sliderExtreme + responseQualityRef.current.spectrumExtreme) / sliderTotal : 0;
    const optionTotal = responseQualityRef.current.optionSelectTotal || 0;
    const dominantOptionRate = optionTotal ? Math.max(...responseQualityRef.current.optionSelectCounts.map((count) => count / optionTotal)) : 0.25;
    const positionBiasPenalty = Math.max(0, Math.min(1, (dominantOptionRate - 0.55) / 0.45));
    const allocationConcentration = responseQualityRef.current.allocationCount ? responseQualityRef.current.allocationConcentrationSum / responseQualityRef.current.allocationCount : 0.55;
    const pairValues = Object.values(pairResponsesRef.current);
    const pairConsistency = pairValues.length ? pairValues.reduce((sum, pair) => {
      if (pair?.a == null || pair?.b == null) return sum + 0.5;
      return sum + Math.max(0, 1 - (Math.abs(pair.a - pair.b) / 2));
    }, 0) / pairValues.length : 0.7;
    const averageVector = responseVectorsRef.current.reduce((acc, vector) => {
      ANIMAL_AXES.forEach((axis) => { acc[axis] += vector?.[axis] || 0; });
      return acc;
    }, zero());
    const vectorCount = Math.max(1, responseVectorsRef.current.length);
    ANIMAL_AXES.forEach((axis) => { averageVector[axis] /= vectorCount; });
    const averageNorm = Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => sum + ((averageVector[axis] || 0) ** 2), 0)) || 1;
    const coherence = responseVectorsRef.current.length ? responseVectorsRef.current.reduce((sum, vector) => {
      const dot = ANIMAL_AXES.reduce((acc, axis) => acc + ((vector?.[axis] || 0) * (averageVector[axis] || 0)), 0);
      const vectorNorm = Math.sqrt(ANIMAL_AXES.reduce((acc, axis) => acc + ((vector?.[axis] || 0) ** 2), 0)) || 1;
      return sum + Math.max(0, dot / (vectorNorm * averageNorm));
    }, 0) / responseVectorsRef.current.length : 0.58;
    const adaptiveExtremeBuffer = Math.max(0.08, Math.min(0.54, 0.13 + (Math.max(0, coherence - 0.55) * 0.52) + (Math.max(0, pairConsistency - 0.55) * 0.45)));
    const extremePenaltyRate = Math.max(0, sliderExtremeRate - adaptiveExtremeBuffer);
    const integrity = Math.round(clamp((coherence * 100 * 0.31) + (pairConsistency * 100 * 0.29) + ((1 - extremePenaltyRate) * 100 * 0.16) + ((1 - positionBiasPenalty) * 100 * 0.14) + ((1 - Math.max(0, allocationConcentration - 0.72) / 0.28) * 100 * 0.10), 35, 99));
    return { integrity, coherence, pairConsistency, sliderExtremeRate };
  };

  const summarizeQuestionSignal = (question) => {
    const signal = zero();
    const absorb = (modifiers = {}, factor = 1) => ANIMAL_AXES.forEach((axis) => { signal[axis] += Math.abs(modifiers?.[axis] || 0) * factor; });
    if (question.type === 'slider' && question.axis) { signal[question.axis] += 10; return signal; }
    if (['choice', 'multi', 'rank2', 'ipsative', 'allocation', 'confidenceChoice', 'drift', 'grid', 'sort4', 'pairMatch', 'constellation'].includes(question.type)) { (question.options || []).forEach((option) => absorb(option.modifiers || {})); return signal; }
    if (question.type === 'hold') { absorb(question.lowModifiers || {}, 1.3); absorb(question.highModifiers || {}, 1.3); return signal; }
    if (question.type === 'rhythm') { absorb(question.slowModifiers || {}, 1.1); absorb(question.fastModifiers || {}, 1.1); absorb(question.steadyModifiers || {}, 1.1); absorb(question.wildModifiers || {}, 1.1); return signal; }
    if (question.type === 'tradeoff') { absorb(question.left?.modifiers || {}, 1.4); absorb(question.right?.modifiers || {}, 1.4); return signal; }
    if (question.type === 'stance') { absorb(question.modifiers || {}, 2); return signal; }
    if (question.type === 'yesno') { absorb(question.yesModifiers || {}); absorb(question.noModifiers || {}); return signal; }
    if (question.type === 'duel' || question.type === 'spectrum') { absorb(question.left?.modifiers || {}); absorb(question.right?.modifiers || {}); }
    return signal;
  };

  const pickMostInformativeQuestion = (remaining) => {
    if (!remaining.length) return null;
    const totalSignal = ANIMAL_AXES.reduce((sum, axis) => sum + (axisSignalRef.current[axis] || 0), 0);
    const uncertainty = ANIMAL_AXES.reduce((acc, axis) => {
      const ratio = totalSignal > 0 ? (axisSignalRef.current[axis] || 0) / totalSignal : 0;
      acc[axis] = Math.max(0.55, 1.3 - ratio * 1.25);
      return acc;
    }, {});
    const provisional = Object.values(ANIMAL_PROFILES).map((profile) => ({ axes: profile.axes, distance: Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => sum + (((axes[axis] || 0) - ((profile.axes || {})[axis] || 0)) ** 2), 0)) })).sort((a, b) => a.distance - b.distance);
    const topA = provisional[0]?.axes || {};
    const topB = provisional[1]?.axes || {};
    const discrimination = ANIMAL_AXES.reduce((acc, axis) => { acc[axis] = 1 + (Math.abs((topA[axis] || 0) - (topB[axis] || 0)) * 0.09); return acc; }, {});
    return remaining.map((question, index) => {
      const signal = summarizeQuestionSignal(question);
      const axisGain = ANIMAL_AXES.reduce((sum, axis) => sum + (signal[axis] * uncertainty[axis]), 0);
      const discriminationGain = ANIMAL_AXES.reduce((sum, axis) => sum + (signal[axis] * (discrimination[axis] || 1)), 0);
      const diversityBonus = Math.max(0, 1.8 - ((typeCountRef.current[question.type] || 0) * 0.42));
      return { question, index, score: ((axisGain * 0.6) + (discriminationGain * 0.4)) * diversityBonus + (Math.random() * 0.45) };
    }).sort((a, b) => b.score - a.score)[0]?.question || null;
  };

  const buildQuestionSet = (count = 35) => {
    const byType = questionBank.reduce((acc, question) => { if (!acc[question.type]) acc[question.type] = []; acc[question.type].push(question); return acc; }, {});
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
    const selected = [...orderedSeed, ...filler].slice(0, Math.min(count, questionBank.length));
    return shuffle(selected);
  };

  const handleStart = () => {
    triggerHaptic('selection');
    setQuestionIds(buildQuestionSet(35).map((question) => question.id));
    setCurrentStep(1);
    setAxes(zero());
    setSliderValue(3);
    setSpectrumValue(3);
    setStanceSelection(null);
    setMultiSelection([]);
    setRankSelection([]);
    setConfidenceSelection({ optionIndex: null, level: 2 });
    setIpsativeMost(null);
    setIpsativeLeast(null);
    setAllocationPoints({});
    setDriftSelection([]);
    setSortSelection([]);
    setPairMatchSelection([]);
    setTradeoffValue(2);
    setHoldLevel(0);
    setRhythmPattern([]);
    setConstellationSelection([]);
    setIntegrityCheckpoint(null);
    setMatchedResult(null);
    axisSignalRef.current = zero();
    axisPolarityRef.current = polarity();
    typeCountRef.current = {};
    responseVectorsRef.current = [];
    responseQualityRef.current = qualityState();
    pairResponsesRef.current = {};
    pendingAxesRef.current = null;
    integrityPromptCountRef.current = 0;
    lastIntegrityPromptStepRef.current = 0;
    recoveryRoundRef.current = 0;
    evidenceTrailRef.current = [];
  };
  const applyModifiers = (modifiers, _label = 'Response', questionType = 'choice', qualityMeta = {}) => {
    const liveQuality = computeLiveQuality();
    const typeWeight = QUESTION_TYPE_WEIGHT[questionType] || 1;
    const finalWeight = typeWeight * Math.max(0.72, Math.min(1.1, 0.82 + ((liveQuality.integrity / 100) * 0.28)));
    typeCountRef.current[questionType] = (typeCountRef.current[questionType] || 0) + 1;
    const weighted = {};
    ANIMAL_AXES.forEach((axis) => {
      const value = Math.round((modifiers?.[axis] || 0) * finalWeight);
      weighted[axis] = value;
      axisSignalRef.current[axis] += Math.abs(value);
      if (value > 0) axisPolarityRef.current[axis].pos += Math.abs(value);
      if (value < 0) axisPolarityRef.current[axis].neg += Math.abs(value);
    });
    responseVectorsRef.current = [...responseVectorsRef.current, weighted];
    if (qualityMeta.optionIndex != null) {
      const optionIndex = clamp(qualityMeta.optionIndex, 0, 3);
      responseQualityRef.current.optionSelectTotal += 1;
      responseQualityRef.current.optionSelectCounts[optionIndex] += 1;
    }
    if (qualityMeta.pairKey && qualityMeta.pairSlot) {
      if (!pairResponsesRef.current[qualityMeta.pairKey]) pairResponsesRef.current[qualityMeta.pairKey] = { a: null, b: null };
      pairResponsesRef.current[qualityMeta.pairKey][qualityMeta.pairSlot] = clamp(qualityMeta.pairValue ?? 0, -1, 1);
    }
    const nextAxes = { ...axes };
    ANIMAL_AXES.forEach((axis) => { nextAxes[axis] = (nextAxes[axis] || 0) + (weighted[axis] || 0); });
    setAxes(nextAxes);
    accumulateAnimalEvidence(_label, weighted);
    advanceStep(nextAxes);
  };

  const handleNextSlider = (question) => {
    triggerHaptic('success');
    const rawValue = question.invert ? (3 - sliderValue) * 5 : (sliderValue - 3) * 5;
    const weightedValue = Math.round(rawValue * (QUESTION_TYPE_WEIGHT.slider || 1));
    const nextAxes = { ...axes, [question.axis]: (axes[question.axis] || 0) + weightedValue };
    axisSignalRef.current[question.axis] += Math.abs(weightedValue);
    if (weightedValue > 0) axisPolarityRef.current[question.axis].pos += Math.abs(weightedValue);
    if (weightedValue < 0) axisPolarityRef.current[question.axis].neg += Math.abs(weightedValue);
    responseVectorsRef.current = [...responseVectorsRef.current, { [question.axis]: weightedValue }];
    responseQualityRef.current.sliderCount += 1;
    if (sliderValue === 1 || sliderValue === 5) responseQualityRef.current.sliderExtreme += 1;
    setAxes(nextAxes);
    accumulateAnimalEvidence(question.text, { [question.axis]: weightedValue }, `Slider landed at ${sliderValue}/5 on ${question.axis}.`, { questionId: question.id });
    setSliderValue(3);
    advanceStep(nextAxes);
  };

  const handleSubmitMulti = (question) => {
    if (!multiSelection.length) return;
    const merged = zero();
    question.options.forEach((option, index) => {
      if (!multiSelection.includes(index)) return;
      ANIMAL_AXES.forEach((axis) => { merged[axis] += option.modifiers?.[axis] || 0; });
    });
    setMultiSelection([]);
    applyModifiers(merged, question.text, 'multi', { pairKey: question.pairKey, pairSlot: question.pairSlot, pairValue: multiSelection.length ? 0.65 : 0 });
  };

  const handleSubmitRank = (question) => {
    if (rankSelection.length < 2) return;
    const merged = zero();
    rankSelection.forEach((selectedIndex, rankIndex) => {
      const weight = rankIndex === 0 ? 1 : 0.55;
      const option = question.options[selectedIndex];
      ANIMAL_AXES.forEach((axis) => { merged[axis] += Math.round((option.modifiers?.[axis] || 0) * weight); });
    });
    setRankSelection([]);
    applyModifiers(merged, question.text, 'rank2', { pairKey: question.pairKey, pairSlot: question.pairSlot, pairValue: 0.72 });
  };

  const handleSubmitConfidenceChoice = (question) => {
    if (confidenceSelection.optionIndex == null) return;
    const selected = question.options?.[confidenceSelection.optionIndex];
    const multiplier = confidenceSelection.level === 1 ? 0.72 : confidenceSelection.level === 3 ? 1.18 : 1;
    const merged = zero();
    ANIMAL_AXES.forEach((axis) => { merged[axis] = Math.round((selected?.modifiers?.[axis] || 0) * multiplier); });
    const optionIndex = confidenceSelection.optionIndex;
    const pairValue = confidenceSelection.level === 1 ? 0.35 : confidenceSelection.level === 3 ? 0.85 : 0.6;
    setConfidenceSelection({ optionIndex: null, level: 2 });
    applyModifiers(merged, question.text, 'confidenceChoice', { optionIndex, pairKey: question.pairKey, pairSlot: question.pairSlot, pairValue });
  };

  const handleSubmitStance = (question, selectionIndex) => {
    const stanceMap = [-1, -0.4, 0.4, 1];
    const factor = stanceMap[selectionIndex] ?? 0;
    const merged = zero();
    ANIMAL_AXES.forEach((axis) => { merged[axis] = Math.round((question.modifiers?.[axis] || 0) * factor); });
    setStanceSelection(selectionIndex);
    applyModifiers(merged, question.text, 'stance', { optionIndex: selectionIndex, pairKey: question.pairKey, pairSlot: question.pairSlot, pairValue: factor });
    setStanceSelection(null);
  };

  const handleSubmitIpsative = (question) => {
    if (ipsativeMost == null || ipsativeLeast == null || ipsativeMost === ipsativeLeast) return;
    const most = question.options?.[ipsativeMost];
    const least = question.options?.[ipsativeLeast];
    const merged = zero();
    ANIMAL_AXES.forEach((axis) => { merged[axis] = (most?.modifiers?.[axis] || 0) - Math.round((least?.modifiers?.[axis] || 0) * 0.8); });
    setIpsativeMost(null);
    setIpsativeLeast(null);
    applyModifiers(merged, question.text, 'ipsative', { pairKey: question.pairKey, pairSlot: question.pairSlot, pairValue: 0.7 });
  };

  const handleSubmitSpectrum = (question) => {
    const ratio = (spectrumValue - 3) / 2;
    const leftScale = Math.max(0, -ratio);
    const rightScale = Math.max(0, ratio);
    const middleWeight = 1 - Math.abs(ratio);
    const merged = zero();
    ANIMAL_AXES.forEach((axis) => {
      const leftValue = question.left?.modifiers?.[axis] || 0;
      const rightValue = question.right?.modifiers?.[axis] || 0;
      merged[axis] = Math.round((leftValue * leftScale) + (rightValue * rightScale) + (((leftValue + rightValue) / 2) * middleWeight * 0.25));
    });
    responseQualityRef.current.spectrumCount += 1;
    if (spectrumValue === 1 || spectrumValue === 5) responseQualityRef.current.spectrumExtreme += 1;
    setSpectrumValue(3);
    applyModifiers(merged, question.text, 'spectrum', { pairKey: question.pairKey, pairSlot: question.pairSlot, pairValue: ratio });
  };

  const handleAdjustAllocation = (question, index, delta) => {
    const budget = question.budget || 10;
    setAllocationPoints((previous) => {
      const next = { ...previous };
      const current = next[index] || 0;
      const total = (question.options || []).reduce((sum, _, optionIndex) => sum + (next[optionIndex] || 0), 0);
      if (delta > 0 && total >= budget) return previous;
      if (delta < 0 && current <= 0) return previous;
      next[index] = Math.max(0, current + delta);
      return next;
    });
  };

  const handleSubmitAllocation = (question) => {
    const budget = question.budget || 10;
    const total = (question.options || []).reduce((sum, _, index) => sum + (allocationPoints[index] || 0), 0);
    if (total !== budget) return;
    const merged = zero();
    (question.options || []).forEach((option, index) => {
      const points = allocationPoints[index] || 0;
      if (!points) return;
      ANIMAL_AXES.forEach((axis) => { merged[axis] += Math.round(((option.modifiers?.[axis] || 0) * points) / budget); });
    });
    const maxAllocated = Math.max(...(question.options || []).map((_, index) => allocationPoints[index] || 0), 0);
    responseQualityRef.current.allocationCount += 1;
    responseQualityRef.current.allocationConcentrationSum += (budget > 0 ? maxAllocated / budget : 0);
    setAllocationPoints({});
    applyModifiers(merged, question.text, 'allocation', { pairKey: question.pairKey, pairSlot: question.pairSlot, pairValue: 0.72 });
  };

  const handleSubmitDrift = (question) => {
    const pickCount = question.pickCount || 3;
    if (driftSelection.length < pickCount) return;
    const weights = [1, 0.72, 0.46, 0.3];
    const merged = zero();
    const maxIndex = Math.max(1, (question.options || []).length - 1);

    driftSelection.slice(0, pickCount).forEach((selectedIndex, stepIndex) => {
      const option = question.options?.[selectedIndex];
      const weight = weights[stepIndex] || 0.24;
      ANIMAL_AXES.forEach((axis) => {
        merged[axis] += Math.round((option?.modifiers?.[axis] || 0) * weight);
      });
    });

    const totalWeight = driftSelection.slice(0, pickCount).reduce((sum, _, stepIndex) => sum + (weights[stepIndex] || 0.24), 0) || 1;
    const balance = driftSelection.slice(0, pickCount).reduce((sum, selectedIndex, stepIndex) => {
      const weight = weights[stepIndex] || 0.24;
      const normalizedIndex = ((selectedIndex / maxIndex) * 2) - 1;
      return sum + (normalizedIndex * weight);
    }, 0) / totalWeight;

    const firstSelection = driftSelection[0] ?? 0;
    setDriftSelection([]);
    applyModifiers(merged, question.text, 'drift', {
      optionIndex: firstSelection,
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue: clamp(balance, -1, 1),
    });
  };

  const handleSubmitSort4 = (question) => {
    if (sortSelection.length < 4) return;
    const weights = [1, 0.58, 0.12, -0.34];
    const merged = zero();
    const maxIndex = Math.max(1, (question.options || []).length - 1);

    sortSelection.slice(0, 4).forEach((selectedIndex, rankIndex) => {
      const option = question.options?.[selectedIndex];
      const weight = weights[rankIndex] || 0;
      ANIMAL_AXES.forEach((axis) => {
        merged[axis] += Math.round((option?.modifiers?.[axis] || 0) * weight);
      });
    });

    const topSelection = sortSelection[0] ?? 0;
    const bottomSelection = sortSelection[3] ?? topSelection;
    const pairValue = ((((topSelection / maxIndex) * 2) - 1) - (((bottomSelection / maxIndex) * 2) - 1)) / 2;
    setSortSelection([]);
    applyModifiers(merged, question.text, 'sort4', {
      optionIndex: topSelection,
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue: clamp(pairValue, -1, 1),
    });
  };

  const handleSubmitPairMatch = (question) => {
    if (pairMatchSelection.length < 2) return;
    const merged = zero();
    pairMatchSelection.slice(0, 2).forEach((selectedIndex) => {
      const option = question.options?.[selectedIndex];
      ANIMAL_AXES.forEach((axis) => {
        merged[axis] += option?.modifiers?.[axis] || 0;
      });
    });
    const pairKey = [...pairMatchSelection].slice(0, 2).sort((a, b) => a - b).join('-');
    const bonus = question.pairBonuses?.[pairKey] || {};
    ANIMAL_AXES.forEach((axis) => {
      merged[axis] += bonus?.[axis] || 0;
    });
    const pairValue = pairMatchSelection[0] === pairMatchSelection[1] ? 0 : (((pairMatchSelection[1] - pairMatchSelection[0]) / Math.max(1, (question.options?.length || 2) - 1)) * 2) - 1;
    const topSelection = pairMatchSelection[0] ?? 0;
    setPairMatchSelection([]);
    applyModifiers(merged, question.text, 'pairMatch', {
      optionIndex: topSelection,
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue: clamp(pairValue, -1, 1),
    });
  };

  const handleSubmitHold = (question) => {
    const level = clamp(holdLevel ?? 0, 0, 1);
    const merged = zero();
    ANIMAL_AXES.forEach((axis) => {
      merged[axis] = Math.round(
        ((question.lowModifiers?.[axis] || 0) * (1 - level)) +
        ((question.highModifiers?.[axis] || 0) * level)
      );
    });
    const label = level < 0.34 ? question.lowLabel : level > 0.66 ? question.highLabel : (copy.balancedMiddle || 'balanced middle');
    const detail = `You held closest to ${String(label || '').toLowerCase()} at ${Math.round(level * 100)}%.`;
    setHoldLevel(0);
    accumulateAnimalEvidence(question.text, merged, detail, { questionId: question.id });
    applyModifiers(merged, `${question.text} -> ${label}`, 'hold', {
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue: (level * 2) - 1,
    });
  };

  const handleSubmitRhythm = (question) => {
    if ((rhythmPattern || []).length < 4) return;
    const intervals = rhythmPattern.slice(1).map((stamp, index) => stamp - rhythmPattern[index]).filter((value) => value > 0);
    const average = intervals.reduce((sum, value) => sum + value, 0) / Math.max(1, intervals.length);
    const variance = intervals.reduce((sum, value) => sum + ((value - average) ** 2), 0) / Math.max(1, intervals.length);
    const deviation = Math.sqrt(variance);
    const slowWeight = clamp((average - 220) / 980, 0, 1);
    const fastWeight = 1 - slowWeight;
    const wildWeight = clamp(((deviation / Math.max(average, 1)) - 0.06) / 0.39, 0, 1);
    const steadyWeight = 1 - wildWeight;
    const merged = zero();

    ANIMAL_AXES.forEach((axis) => {
      const tempoValue = ((question.slowModifiers?.[axis] || 0) * slowWeight) + ((question.fastModifiers?.[axis] || 0) * fastWeight);
      const patternValue = ((question.steadyModifiers?.[axis] || 0) * steadyWeight) + ((question.wildModifiers?.[axis] || 0) * wildWeight);
      merged[axis] = Math.round((tempoValue + patternValue) / 2);
    });

    const paceLabel = slowWeight >= 0.5 ? question.slowLabel : question.fastLabel;
    const shapeLabel = steadyWeight >= 0.5 ? question.steadyLabel : question.wildLabel;
    const detail = `Your taps came through ${String(paceLabel || '').toLowerCase()} and ${String(shapeLabel || '').toLowerCase()}.`;
    const firstSelection = fastWeight >= slowWeight ? 1 : 0;
    setRhythmPattern([]);
    accumulateAnimalEvidence(question.text, merged, detail, { questionId: question.id });
    applyModifiers(merged, `${question.text} -> ${paceLabel} / ${shapeLabel}`, 'rhythm', {
      optionIndex: firstSelection,
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue: ((fastWeight - slowWeight) + (wildWeight - steadyWeight)) / 2,
    });
  };

  const handleSubmitConstellation = (question) => {
    const pickCount = question.pickCount || 3;
    if (constellationSelection.length < pickCount) return;
    const weights = [1, 0.74, 0.48, 0.28];
    const merged = zero();
    constellationSelection.slice(0, pickCount).forEach((selectedIndex, stepIndex) => {
      const option = question.options?.[selectedIndex];
      const weight = weights[stepIndex] || 0.24;
      ANIMAL_AXES.forEach((axis) => {
        merged[axis] += Math.round((option?.modifiers?.[axis] || 0) * weight);
      });
    });
    const trioKey = constellationSelection.slice(0, pickCount).join('-');
    const trioBonus = question.trioBonuses?.[trioKey] || {};
    ANIMAL_AXES.forEach((axis) => {
      merged[axis] += trioBonus?.[axis] || 0;
    });
    const labels = constellationSelection.slice(0, pickCount).map((selectedIndex) => question.options?.[selectedIndex]?.text).filter(Boolean);
    const detail = `Your pattern linked ${labels.join(' -> ')}.`;
    const firstSelection = constellationSelection[0] ?? 0;
    setConstellationSelection([]);
    accumulateAnimalEvidence(question.text, merged, detail, { questionId: question.id });
    applyModifiers(merged, `${question.text} -> ${labels.join(' -> ')}`, 'constellation', {
      optionIndex: firstSelection,
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue: labels.length / 3,
    });
  };

  const handleSubmitReaction = (question, payload) => {
    const latency = payload?.latency ?? null;
    const falseStart = Boolean(payload?.falseStart);
    const merged = zero();

    if (falseStart) {
      ANIMAL_AXES.forEach((axis) => {
        merged[axis] = question.falseStartModifiers?.[axis] || 0;
      });
      accumulateAnimalEvidence(question.text, merged, `You moved before the signal landed.`, { questionId: question.id });
      applyModifiers(merged, `${question.text} -> early`, 'reaction', {
        pairKey: question.pairKey,
        pairSlot: question.pairSlot,
        pairValue: -1,
      });
      return;
    }

    if (latency == null) return;
    const fastCutoff = question.fastCutoffMs || 300;
    const steadyCutoff = question.steadyCutoffMs || 520;
    const quickWeight = clamp((steadyCutoff - latency) / Math.max(1, steadyCutoff - fastCutoff), 0, 1);
    const slowWeight = 1 - quickWeight;

    ANIMAL_AXES.forEach((axis) => {
      merged[axis] = Math.round(
        ((question.quickModifiers?.[axis] || 0) * quickWeight) +
        ((question.slowModifiers?.[axis] || 0) * slowWeight)
      );
    });

    const paceLabel = latency <= fastCutoff ? question.quickLabel : latency <= steadyCutoff ? question.steadyLabel : question.slowLabel;
    accumulateAnimalEvidence(question.text, merged, `You reacted in ${Math.round(latency)} ms, closest to ${String(paceLabel || '').toLowerCase()}.`, { questionId: question.id });
    applyModifiers(merged, `${question.text} -> ${paceLabel}`, 'reaction', {
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue: (quickWeight * 2) - 1,
    });
  };

  const handleSubmitTiming = (question, payload) => {
    const accuracy = clamp(payload?.accuracy ?? 0, 0, 1);
    const merged = zero();
    const bullseyeThreshold = question.bullseyeThreshold ?? 0.82;
    const nearThreshold = question.nearThreshold ?? 0.55;
    const label =
      accuracy >= bullseyeThreshold
        ? question.bullseyeLabel
        : accuracy >= nearThreshold
          ? question.nearLabel
          : question.wideLabel;
    const sourceModifiers =
      accuracy >= bullseyeThreshold
        ? question.bullseyeModifiers
        : accuracy >= nearThreshold
          ? question.nearModifiers
          : question.wideModifiers;

    ANIMAL_AXES.forEach((axis) => {
      merged[axis] = sourceModifiers?.[axis] || 0;
    });

    accumulateAnimalEvidence(question.text, merged, `You stopped at ${Math.round(accuracy * 100)}% accuracy, closest to ${String(label || '').toLowerCase()}.`, { questionId: question.id });
    applyModifiers(merged, `${question.text} -> ${label}`, 'timing', {
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue: (accuracy * 2) - 1,
    });
  };

  const handleSubmitTradeoff = (question) => {
    const budget = question.budget || 4;
    const leftPoints = clamp(tradeoffValue, 0, budget);
    const rightPoints = budget - leftPoints;
    const merged = zero();
    ANIMAL_AXES.forEach((axis) => {
      const leftValue = question.left?.modifiers?.[axis] || 0;
      const rightValue = question.right?.modifiers?.[axis] || 0;
      merged[axis] = Math.round(((leftValue * leftPoints) + (rightValue * rightPoints)) / Math.max(1, budget));
    });
    setTradeoffValue(Math.floor(budget / 2));
    applyModifiers(merged, question.text, 'tradeoff', {
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue: ((leftPoints / Math.max(1, budget)) * 2) - 1,
    });
  };

  const getQuestionInstruction = (question) => {
    switch (question.type) {
      case 'slider': return t.quiz.instructions.slider;
      case 'choice': return t.quiz.instructions.choice;
      case 'yesno': return t.quiz.instructions.yesno;
      case 'duel': return t.quiz.instructions.duel;
      case 'multi': return t.quiz.instructions.multi.replace('{n}', question.maxSelect || 2);
      case 'rank2': return t.quiz.instructions.rank2;
      case 'ipsative': return t.quiz.instructions.ipsative;
      case 'spectrum': return t.quiz.instructions.spectrum;
      case 'allocation': return t.quiz.instructions.allocation.replace('{n}', question.budget || 10);
      case 'confidenceChoice': return t.quiz.instructions.confidenceChoice;
      case 'stance': return t.quiz.instructions.stance;
      case 'drift': return t.quiz.instructions.multi.replace('{n}', question.pickCount || 3);
        case 'tradeoff': return t.quiz.instructions.allocation.replace('{n}', question.budget || 4);
        case 'grid': return instructionCopy.grid;
        case 'sort4': return instructionCopy.sort4;
        case 'pairMatch': return instructionCopy.pairMatch;
        case 'hold': return instructionCopy.hold;
        case 'rhythm': return instructionCopy.rhythm;
        case 'constellation': return instructionCopy.constellation;
        case 'reaction': return instructionCopy.reaction;
        case 'timing': return instructionCopy.timing;
        default: return t.quiz.instructions.default;
      }
  };

  const maybeInjectRecoveryRound = (nextAxes) => {
    const live = computeLiveQuality();
    const reliabilityNow = Math.round((live.integrity * 0.56) + ((live.pairConsistency || 0.5) * 100 * 0.24) + ((live.coherence || 0.5) * 100 * 0.20));
    const severe = reliabilityNow < 44 || live.integrity < 46;
    const moderate = reliabilityNow < 56 && (live.integrity < 60 || (live.pairConsistency || 0.5) < 0.64 || (live.coherence || 0.5) < 0.58);
    if (!severe && !moderate) return false;
    const maxRecoveryRounds = severe ? 2 : 1;
    if (recoveryRoundRef.current >= maxRecoveryRounds) return false;
    const askedIds = new Set(questionIds);
    const pool = recoveryBank.filter((question) => !askedIds.has(question.id));
    if (!pool.length) return false;
    const selected = shuffle(pool).slice(0, Math.min(severe ? 5 : 3, pool.length));
    if (!selected.length) return false;
    recoveryRoundRef.current += 1;
    pendingAxesRef.current = nextAxes;
    setQuestionIds((previous) => [...previous, ...selected.map((question) => question.id)]);
    setIntegrityCheckpoint({ integrity: live.integrity, reliability: reliabilityNow, isCalibration: true, message: severe ? t.quiz.deepCalibrationMsg : t.quiz.calibrationMsg });
    return true;
  };

  const continueStepTransition = (nextAxes) => {
    if (currentStep < questions.length) {
      const nextIndex = currentStep;
      const remaining = questions.slice(nextIndex);
      const nextQuestion = pickMostInformativeQuestion(remaining);
      if (nextQuestion) {
        setQuestionIds([
          ...questionIds.slice(0, nextIndex),
          nextQuestion.id,
          ...remaining.filter((question) => question.id !== nextQuestion.id).map((question) => question.id),
        ]);
      }
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(nextAxes || axes);
    }
  };

  const resumeAfterIntegrityCheckpoint = () => {
    const axesToUse = pendingAxesRef.current || axes;
    pendingAxesRef.current = null;
    setIntegrityCheckpoint(null);
    continueStepTransition(axesToUse);
  };

  const advanceStep = (nextAxes) => {
    if (currentStep > 5 && currentStep < questions.length) {
      const liveQuality = computeLiveQuality();
      const enoughSpacing = (currentStep - lastIntegrityPromptStepRef.current) >= 6;
      const canPrompt = integrityPromptCountRef.current < 2 && enoughSpacing && !integrityCheckpoint;
      if (canPrompt && liveQuality.integrity < 54) {
        pendingAxesRef.current = nextAxes;
        integrityPromptCountRef.current += 1;
        lastIntegrityPromptStepRef.current = currentStep;
        setIntegrityCheckpoint({ integrity: liveQuality.integrity, message: t.quiz.inconsistencyMsg });
        return;
      }
    }
    if (currentStep >= questions.length) {
      const injected = maybeInjectRecoveryRound(nextAxes);
      if (injected) return;
    }
    continueStepTransition(nextAxes);
  };
  const calculateResult = (finalAxes) => {
    setCurrentStep(questions.length + 1);
    const totalSignal = ANIMAL_AXES.reduce((sum, axis) => sum + (axisSignalRef.current[axis] || 0), 0);
    const axisWeight = ANIMAL_AXES.reduce((acc, axis) => {
      const baseSignal = axisSignalRef.current[axis] || 0;
      const ratio = totalSignal > 0 ? baseSignal / totalSignal : (1 / ANIMAL_AXES.length);
      acc[axis] = Math.max(0.75, Math.min(1.7, 0.92 + ratio * 2.1));
      return acc;
    }, {});
    const standardizedAxes = ANIMAL_AXES.reduce((acc, axis) => {
      const raw = finalAxes[axis] || 0;
      const signal = Math.max(8, axisSignalRef.current[axis] || 8);
      acc[axis] = clamp(Math.round((raw / signal) * 100), -100, 100);
      return acc;
    }, {});
    const normalizedAxes = ANIMAL_AXES.reduce((acc, axis) => { acc[axis] = clamp(Math.round((standardizedAxes[axis] / 10) * 10) / 10, -10, 10); return acc; }, {});
    const consistency = computeConsistency();
    const liveQuality = computeLiveQuality();
    const responseIntegrity = liveQuality.integrity;
    const coherence = liveQuality.coherence;
    const sliderExtremeRate = liveQuality.sliderExtremeRate;
    const pairConsistency = liveQuality.pairConsistency;
    const consistencyScore = Math.round(clamp(((pairConsistency * 100) * 0.45) + ((consistency * 100) * 0.25) + ((coherence * 100) * 0.30), 35, 99));
    const animalFactors = buildAnimalFactors(standardizedAxes, { responseIntegrity, coherence, sliderExtremeRate, pairConsistency, consistency });
    const reliabilityAdjustment =
      ((responseIntegrity - 50) * 0.14) +
      ((((pairConsistency || 0.5) * 100) - 50) * 0.08) +
      ((((coherence || 0.5) * 100) - 50) * 0.06);
    const responsePenalty = Math.max(0, ((1 - consistency) * 10) + ((sliderExtremeRate || 0) * 7));
    const normalizedMagnitude = Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => sum + ((normalizedAxes[axis] || 0) ** 2), 0)) || 1;
    const maxDistance = Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => sum + ((axisWeight[axis] || 1) * 20 * 20), 0)) || 1;
    const userTopFactors = Object.entries(animalFactors).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => key);
    const profileEntries = Object.entries(ANIMAL_PROFILES);
    const rankedMatches = profileEntries.map(([key, profile]) => {
      const weightedDistance = Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => {
        const delta = (normalizedAxes[axis] || 0) - ((profile.axes || {})[axis] || 0);
        return sum + ((axisWeight[axis] || 1) * delta * delta);
      }, 0));
      const axisSimilarity = clamp(100 - ((weightedDistance / maxDistance) * 100), 0, 100);
      const profileMagnitude = Math.sqrt(ANIMAL_AXES.reduce((sum, axis) => sum + ((((profile.axes || {})[axis] || 0) ** 2)), 0)) || 1;
      const dot = ANIMAL_AXES.reduce((sum, axis) => sum + ((normalizedAxes[axis] || 0) * (((profile.axes || {})[axis] || 0))), 0);
      const cosineSimilarity = clamp(dot / (normalizedMagnitude * profileMagnitude), -1, 1);
      const alignmentScore = ((cosineSimilarity + 1) / 2) * 100;
      const factorDiff = Object.entries(profile.factors || {}).reduce((sum, [factorKey, target]) => sum + Math.abs((animalFactors[factorKey] || 0) - target), 0) / Math.max(1, Object.keys(profile.factors || {}).length);
      const factorSimilarity = clamp(100 - factorDiff, 0, 100);
      const profileTopFactors = Object.entries(profile.factors || {}).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([factorKey]) => factorKey);
      const overlap = userTopFactors.filter((factorKey) => profileTopFactors.includes(factorKey)).length;
      const baseSuitability = (axisSimilarity * 0.48) + (factorSimilarity * 0.32) + (alignmentScore * 0.12) + ((52 + (overlap * 24)) * 0.08);
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
      const contributionTotal = Math.round(baseSuitability + profileBalanceAdjustment + reliabilityAdjustment - responsePenalty);
      return {
        key,
        suitabilityScore: Math.round(clamp((baseSuitability + profileBalanceAdjustment + reliabilityAdjustment - responsePenalty) * qualityMultiplier * coverageMultiplier, 10, 99)),
        cosineSimilarity,
        contributionBreakdown,
        contributionTotal,
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    const bestMatch = rankedMatches[0] || { key: 'Satonosuke', suitabilityScore: 60, cosineSimilarity: 0 };
    const runnerUp = rankedMatches[1] || bestMatch;
    const scaled = rankedMatches.map((entry) => Math.exp((entry.suitabilityScore || 0) / 14));
    const probability = scaled.length ? (scaled[0] / (scaled.reduce((sum, value) => sum + value, 0) || 1)) : 0.5;
    const separation = Math.max(0, (bestMatch.suitabilityScore || 0) - (runnerUp.suitabilityScore || 0));
    const reliabilityIndex = Math.round(clamp((responseIntegrity * 0.48) + (consistencyScore * 0.22) + ((pairConsistency * 100) * 0.18) + (Math.max(0, separation) * 0.12), 30, 99));
    const exploratoryOnly = reliabilityIndex < 60;
    const confidence = Math.round(clamp((((bestMatch.suitabilityScore || 60) * 0.52) + (probability * 100 * 0.24) + (consistencyScore * 0.14) + (Math.min(totalSignal, 340) * 0.05) + (separation * 1.6)) * (exploratoryOnly ? 0.9 : 1), 56, 98));
    const portrait = portraitData.find((item) => item.name === bestMatch.key) || portraitData[0];
    setTimeout(() => {
      triggerHaptic('success');
      setMatchedResult({
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
        recoveryRounds: recoveryRoundRef.current,
        evidenceTrail: [...evidenceTrailRef.current],
      });
      setCurrentStep(questions.length + 2);
    }, 2200);
  };

  const renderIntro = () => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ textAlign: 'center', width: '100%', maxWidth: isMobile ? '390px' : '500px' }}>
      <div className="sketchbook-border" style={{ background: '#f8fbff', border: '3.5px solid #bfdbfe', borderBottom: '9.5px solid #93c5fd', borderRadius: '28px', padding: isMobile ? '24px 20px' : '32px 24px', boxShadow: '0 12px 32px rgba(59, 130, 246, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><PawPrint size={isMobile ? 56 : 72} color="#3b82f6" strokeWidth={3.5} /></div>
        <h2 style={{ fontSize: isMobile ? '2.4rem' : '3rem', color: '#1e40af', margin: '0 0 18px 0', transform: 'rotate(-2deg)' }}>{toMysteryLabelCase(copy.menuTitle)}</h2>
        <p style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', color: '#1e293b', marginBottom: '12px', lineHeight: 1.5, background: '#eff6ff', padding: '16px 20px', borderRadius: '20px', border: '3px dashed #bfdbfe' }}>{copy.menuDescription}</p>
        <p style={{ color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', lineHeight: 1.45, margin: '0 0 28px 0' }}>{copy.introNote}</p>
        <motion.button whileHover={{ scale: 1.06, rotate: 2, y: -6 }} whileTap={{ scale: 0.9, y: 12 }} onClick={handleStart} className="sketchbook-border paper-interact" style={{ background: '#3b82f6', color: 'white', border: '3.5px solid #2563eb', borderBottom: '9.5px solid #1d4ed8', padding: isMobile ? '14px 42px' : '18px 64px', fontSize: isMobile ? '1.25rem' : '1.45rem', cursor: 'pointer', borderRadius: '24px', boxShadow: '0 10px 0 rgba(37, 99, 235, 0.2)' }}>{toMysteryLabelCase(t.quiz.startBtn)}</motion.button>
      </div>
    </motion.div>
  );

  const renderLoading = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <PawPrint size={64} color="#3b82f6" className="pulse-slow" />
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '2rem', color: '#1e40af', margin: 0 }}>{toMysteryLabelCase(t.quiz.thinking)}</h3>
        <p style={{ color: '#64748b', fontSize: '1.25rem', margin: '4px 0 0 0' }}>{copy.calculating}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (integrityCheckpoint) return <QuizIntegrityCheckpoint isMobile={isMobile} integrityCheckpoint={integrityCheckpoint} t={t} onResume={resumeAfterIntegrityCheckpoint} />;
    if (currentStep === 0) return renderIntro();
    if (currentStep > 0 && currentStep <= questions.length) {
      const question = questions[currentStep - 1];
      return <QuizQuestionStep isMobile={isMobile} currentStep={currentStep} totalQuestions={questions.length} question={question} t={t} portraitData={portraitData} state={{ sliderValue, spectrumValue, stanceSelection, multiSelection, rankSelection, confidenceSelection, ipsativeMost, ipsativeLeast, allocationPoints, driftSelection, sortSelection, pairMatchSelection, tradeoffValue, holdLevel, rhythmPattern, constellationSelection }} setters={{ setSliderValue, setSpectrumValue, setMultiSelection, setRankSelection, setConfidenceSelection, setIpsativeMost, setIpsativeLeast, setDriftSelection, setSortSelection, setPairMatchSelection, setTradeoffValue, setHoldLevel, setRhythmPattern, setConstellationSelection }} handlers={{ onApplyModifiers: applyModifiers, onNextSlider: handleNextSlider, onSubmitMulti: handleSubmitMulti, onSubmitRank: handleSubmitRank, onSubmitIpsative: handleSubmitIpsative, onSubmitSpectrum: handleSubmitSpectrum, onAdjustAllocation: handleAdjustAllocation, onSubmitAllocation: handleSubmitAllocation, onSubmitDrift: handleSubmitDrift, onSubmitSort4: handleSubmitSort4, onSubmitPairMatch: handleSubmitPairMatch, onSubmitConfidenceChoice: handleSubmitConfidenceChoice, onSubmitStance: handleSubmitStance, onSubmitTradeoff: handleSubmitTradeoff, onSubmitHold: handleSubmitHold, onSubmitRhythm: handleSubmitRhythm, onSubmitConstellation: handleSubmitConstellation, onSubmitReaction: handleSubmitReaction, onSubmitTiming: handleSubmitTiming }} getQuestionInstruction={getQuestionInstruction} />;
    }
    if (currentStep === questions.length + 1) return renderLoading();
    if (currentStep === questions.length + 2 && resolvedMatchedResult) return <AnimalQuizResultView isMobile={isMobile} matchedResult={resolvedMatchedResult} copy={copy} onRestart={handleStart} />;
    return null;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', minHeight: isMobile ? '460px' : '580px', paddingTop: isMobile ? '4px' : '8px' }}>
      <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </div>
    </div>
  );
};

export default AnimalQuizGame;
















