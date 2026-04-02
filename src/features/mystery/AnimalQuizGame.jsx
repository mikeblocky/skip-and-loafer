import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import useIdlePreload from '../app/hooks/useIdlePreload';
import { QUESTION_TYPE_WEIGHT } from './quizGame/config';
import QuizStageFallback from './quizGame/QuizStageFallback';
import getAnimalQuizCopy from './animalQuiz/copy';
import {
  buildAnimalReason,
  clamp,
  createAnimalPolarity,
  createAnimalQualityState,
  pickInstruction,
  shuffle,
  TRAIT_PALETTE,
  zeroAnimalAxes,
} from './animalQuiz/utils';
import {
  buildAnimalQuestionSet,
  calculateAnimalResult,
  computeAnimalLiveQuality,
  pickMostInformativeAnimalQuestion,
} from './animalQuiz/engine';
import { ANIMAL_AXES, ANIMAL_DISPLAY_TRAITS } from '../../data/animalQuizData';
import { ANIMAL_INSTRUCTION_COPY, buildAnimalQuestionBank, buildAnimalRecoveryBank } from '../../data/animalQuizQuestions';
import { QuizIntroCard, QuizLoadingCard, QuizStageShell } from './quizGame/QuizStagePrimitives';

const loadQuizIntegrityCheckpoint = () => import('./quizGame/QuizIntegrityCheckpoint');
const loadQuizQuestionStep = () => import('./quizGame/QuizQuestionStep');
const loadAnimalQuizResultView = () => import('./animalQuiz/AnimalQuizResultView');

const QuizIntegrityCheckpoint = lazy(loadQuizIntegrityCheckpoint);
const QuizQuestionStep = lazy(loadQuizQuestionStep);
const AnimalQuizResultView = lazy(loadAnimalQuizResultView);

const AnimalQuizGame = ({ isMobile, portraitData, t, uiLanguage = 'en' }) => {
  const copy = React.useMemo(() => getAnimalQuizCopy(uiLanguage, t), [uiLanguage, t]);
  const isJapanese = uiLanguage === 'ja';
  const reactionEarlyLabel = isJapanese ? '信号より先に動きました。' : 'You moved before the signal landed.';
  const introTitle = isJapanese ? 'あなたはどの動物？' : copy.menuTitle;
  const introDescription = isJapanese
    ? 'サトノスケ、オシオ、オミソに近い本能を探す深めのクイズです。'
    : copy.menuDescription;
  const introNote = isJapanese
    ? '温かさ、慎重さ、遊び心、習慣、そして気ままな動きを見ます。'
    : copy.introNote;
  const loadingLabel = isJapanese ? '動物クイズを読み込み中...' : (copy.calculating || t.quiz?.thinking || 'Loading quiz...');
  const balancedMiddleLabel = isJapanese ? '中間バランス' : (copy.balancedMiddle || 'balanced middle');
  const predictionFallbackLabel = isJapanese
    ? '今日は静かな動物の気配がついてきます。'
    : (copy.predictionFallback || 'A quiet animal mood follows you today.');
  const questionBank = useMemo(() => buildAnimalQuestionBank(uiLanguage), [uiLanguage]);
  const recoveryBank = useMemo(() => buildAnimalRecoveryBank(uiLanguage), [uiLanguage]);
  const localizedQuestionLookup = useMemo(
    () => new Map([...questionBank, ...recoveryBank].map((question) => [question.id, question])),
    [questionBank, recoveryBank],
  );
  const animalStagePreloaders = useMemo(
    () => [loadQuizIntegrityCheckpoint, loadQuizQuestionStep, loadAnimalQuizResultView],
    [],
  );
  const instructionCopy = useMemo(() => ({
    grid: pickInstruction(ANIMAL_INSTRUCTION_COPY.grid, uiLanguage),
    sort4: pickInstruction(ANIMAL_INSTRUCTION_COPY.sort4, uiLanguage),
    pairMatch: pickInstruction(ANIMAL_INSTRUCTION_COPY.pairMatch, uiLanguage),
    hold: pickInstruction(ANIMAL_INSTRUCTION_COPY.hold, uiLanguage),
    rhythm: pickInstruction(ANIMAL_INSTRUCTION_COPY.rhythm, uiLanguage),
    constellation: pickInstruction(ANIMAL_INSTRUCTION_COPY.constellation, uiLanguage),
    reaction: pickInstruction(ANIMAL_INSTRUCTION_COPY.reaction, uiLanguage),
    timing: pickInstruction(ANIMAL_INSTRUCTION_COPY.timing, uiLanguage),
  }), [uiLanguage]);
  const zero = zeroAnimalAxes;
  const polarity = createAnimalPolarity;
  const qualityState = createAnimalQualityState;
  const [currentStep, setCurrentStep] = useState(0);
  const [questionIds, setQuestionIds] = useState([]);
  const [axes, setAxes] = useState(zeroAnimalAxes());
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
  const resultRevealTimeoutRef = useRef(null);
  const axisSignalRef = useRef(zeroAnimalAxes());
  const axisPolarityRef = useRef(createAnimalPolarity());
  const typeCountRef = useRef({});
  const responseVectorsRef = useRef([]);
  const responseQualityRef = useRef(createAnimalQualityState());
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

  useIdlePreload(animalStagePreloaders, currentStep <= 1, {
    delayMs: 220,
    staggerMs: 140,
    maxPreloadCount: isMobile ? 2 : 3,
  });

  useEffect(() => () => {
    if (resultRevealTimeoutRef.current) {
      clearTimeout(resultRevealTimeoutRef.current);
    }
  }, []);

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
        predictionFallbackLabel,
      displayTraits,
    };
  }, [copy, matchedResult, t, localizedQuestionLookup, predictionFallbackLabel]);

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
  const computeLiveQuality = () => computeAnimalLiveQuality({
    responseQuality: responseQualityRef.current,
    pairResponses: pairResponsesRef.current,
    responseVectors: responseVectorsRef.current,
  });

  const handleStart = () => {
    triggerHaptic('selection');
    if (resultRevealTimeoutRef.current) {
      clearTimeout(resultRevealTimeoutRef.current);
      resultRevealTimeoutRef.current = null;
    }
    setQuestionIds(buildAnimalQuestionSet({ questionBank, count: 35 }).map((question) => question.id));
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
  const applyModifiers = (modifiers, _label = isJapanese ? '回答' : 'Response', questionType = 'choice', qualityMeta = {}) => {
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
    accumulateAnimalEvidence(
      question.text,
      { [question.axis]: weightedValue },
      isJapanese
        ? `${question.axis} で ${sliderValue}/5 でした。`
        : `Slider landed at ${sliderValue}/5 on ${question.axis}.`,
      { questionId: question.id }
    );
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
    const label = level < 0.34 ? question.lowLabel : level > 0.66 ? question.highLabel : balancedMiddleLabel;
    const detail = isJapanese
      ? `${Math.round(level * 100)}% で ${String(label || '')} にいちばん近い選択でした。`
      : `You held closest to ${String(label || '').toLowerCase()} at ${Math.round(level * 100)}%.`;
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
    const detail = isJapanese
      ? `${String(paceLabel || '')} と ${String(shapeLabel || '')} の流れでした。`
      : `Your taps came through ${String(paceLabel || '').toLowerCase()} and ${String(shapeLabel || '').toLowerCase()}.`;
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
    const detail = isJapanese
      ? `${labels.join(' ・ ')} がつながりました。`
      : `Your pattern linked ${labels.join(' -> ')}.`;
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
      accumulateAnimalEvidence(question.text, merged, reactionEarlyLabel, { questionId: question.id });
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
    accumulateAnimalEvidence(
      question.text,
      merged,
      isJapanese
        ? `${Math.round(latency)} ミリ秒で反応しました。${String(paceLabel || '')} に近いです。`
        : `You reacted in ${Math.round(latency)} ms, closest to ${String(paceLabel || '').toLowerCase()}.`,
      { questionId: question.id }
    );
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

    accumulateAnimalEvidence(
      question.text,
      merged,
      isJapanese
        ? `${Math.round(accuracy * 100)}% の精度で止まりました。${String(label || '')} に近いです。`
        : `You stopped at ${Math.round(accuracy * 100)}% accuracy, closest to ${String(label || '').toLowerCase()}.`,
      { questionId: question.id }
    );
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
      const nextQuestion = pickMostInformativeAnimalQuestion({
        remainingQuestions: remaining,
        axes,
        axisSignal: axisSignalRef.current,
        typeCount: typeCountRef.current,
      });
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
    const nextMatchedResult = calculateAnimalResult({
      finalAxes,
      axisSignal: axisSignalRef.current,
      axisPolarity: axisPolarityRef.current,
      responseQuality: responseQualityRef.current,
      pairResponses: pairResponsesRef.current,
      responseVectors: responseVectorsRef.current,
      portraitData,
      evidenceTrail: evidenceTrailRef.current,
      recoveryRounds: recoveryRoundRef.current,
    });
    if (resultRevealTimeoutRef.current) {
      clearTimeout(resultRevealTimeoutRef.current);
    }
    resultRevealTimeoutRef.current = setTimeout(() => {
      triggerHaptic('success');
      setMatchedResult(nextMatchedResult);
      setCurrentStep(questions.length + 2);
      resultRevealTimeoutRef.current = null;
    }, 2200);
  };

  const renderIntro = () => (
    <QuizIntroCard
      isMobile={isMobile}
      icon={PawPrint}
      title={introTitle}
      description={introDescription}
      note={introNote}
      actionLabel={t.quiz.startBtn}
      onStart={handleStart}
      maxWidthMobile="390px"
      maxWidthDesktop="500px"
      descriptionFontSizeMobile="1.1rem"
      descriptionFontSizeDesktop="1.3rem"
    />
  );

  const renderLoading = () => (
    <QuizLoadingCard
      isMobile={isMobile}
      icon={PawPrint}
      title={t.quiz.thinking}
      subtitle={loadingLabel}
    />
  );

  const renderContent = () => {
    if (integrityCheckpoint) {
      return (
        <Suspense fallback={<QuizStageFallback isMobile={isMobile} label={loadingLabel} />}>
          <QuizIntegrityCheckpoint isMobile={isMobile} integrityCheckpoint={integrityCheckpoint} t={t} onResume={resumeAfterIntegrityCheckpoint} />
        </Suspense>
      );
    }
    if (currentStep === 0) return renderIntro();
    if (currentStep > 0 && currentStep <= questions.length) {
      const question = questions[currentStep - 1];
      return (
        <Suspense fallback={<QuizStageFallback isMobile={isMobile} label={loadingLabel} />}>
          <QuizQuestionStep isMobile={isMobile} currentStep={currentStep} totalQuestions={questions.length} question={question} t={t} portraitData={portraitData} state={{ sliderValue, spectrumValue, stanceSelection, multiSelection, rankSelection, confidenceSelection, ipsativeMost, ipsativeLeast, allocationPoints, driftSelection, sortSelection, pairMatchSelection, tradeoffValue, holdLevel, rhythmPattern, constellationSelection }} setters={{ setSliderValue, setSpectrumValue, setMultiSelection, setRankSelection, setConfidenceSelection, setIpsativeMost, setIpsativeLeast, setDriftSelection, setSortSelection, setPairMatchSelection, setTradeoffValue, setHoldLevel, setRhythmPattern, setConstellationSelection }} handlers={{ onApplyModifiers: applyModifiers, onNextSlider: handleNextSlider, onSubmitMulti: handleSubmitMulti, onSubmitRank: handleSubmitRank, onSubmitIpsative: handleSubmitIpsative, onSubmitSpectrum: handleSubmitSpectrum, onAdjustAllocation: handleAdjustAllocation, onSubmitAllocation: handleSubmitAllocation, onSubmitDrift: handleSubmitDrift, onSubmitSort4: handleSubmitSort4, onSubmitPairMatch: handleSubmitPairMatch, onSubmitConfidenceChoice: handleSubmitConfidenceChoice, onSubmitStance: handleSubmitStance, onSubmitTradeoff: handleSubmitTradeoff, onSubmitHold: handleSubmitHold, onSubmitRhythm: handleSubmitRhythm, onSubmitConstellation: handleSubmitConstellation, onSubmitReaction: handleSubmitReaction, onSubmitTiming: handleSubmitTiming }} getQuestionInstruction={getQuestionInstruction} />
        </Suspense>
      );
    }
    if (currentStep === questions.length + 1) return renderLoading();
    if (currentStep === questions.length + 2 && resolvedMatchedResult) {
      return (
        <Suspense fallback={<QuizStageFallback isMobile={isMobile} label={loadingLabel} />}>
          <AnimalQuizResultView isMobile={isMobile} matchedResult={resolvedMatchedResult} copy={copy} onRestart={handleStart} uiLanguage={uiLanguage} />
        </Suspense>
      );
    }
    return null;
  };

  return (
    <QuizStageShell isMobile={isMobile}>
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </QuizStageShell>
  );
};

export default AnimalQuizGame;
















