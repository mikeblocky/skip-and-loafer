import React, { Suspense, lazy, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

void motion;
import { triggerHaptic } from '../../utils/haptics';
import { QUESTION_BANK } from '../../data/quizData';
import useIdlePreload from '../app/hooks/useIdlePreload';
import { calculateHumanResult } from './quizGame/humanResultEngine';
import QuizStageFallback from './quizGame/QuizStageFallback';
import {
  buildHumanQuestionSet,
  computeHumanLiveQuality,
  localizeQuizQuestion,
  pickMostInformativeHumanQuestion,
} from './quizGame/humanQuizUtils';
import {
  AXES,
  QUESTION_TYPE_WEIGHT,
  RELIABILITY_RECOVERY_BANK,
  SYNERGY_CHECK_LOGIC,
  hashString,
} from './quizGame/config';

const loadQuizIntegrityCheckpoint = () => import('./quizGame/QuizIntegrityCheckpoint');
const loadQuizIntro = () => import('./quizGame/QuizIntro');
const loadQuizLoadingState = () => import('./quizGame/QuizLoadingState');
const loadQuizQuestionStep = () => import('./quizGame/QuizQuestionStep');
const loadQuizResultView = () => import('./quizGame/QuizResultView');

const QuizIntegrityCheckpoint = lazy(loadQuizIntegrityCheckpoint);
const QuizIntro = lazy(loadQuizIntro);
const QuizLoadingState = lazy(loadQuizLoadingState);
const QuizQuestionStep = lazy(loadQuizQuestionStep);
const QuizResultView = lazy(loadQuizResultView);

const QuizGame = ({ isMobile, portraitData, fallbackColors, t }) => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [questionIds, setQuestionIds] = useState([]);
  const [axes, setAxes] = useState({ social: 0, planning: 0, focus: 0, drive: 0 });
  const [sliderValue, setSliderValue] = useState(3);
  const [spectrumValue, setSpectrumValue] = useState(3);
  const [stanceSelection, setStanceSelection] = useState(null);
  const [multiSelection, setMultiSelection] = useState([]);
  const [rankSelection, setRankSelection] = useState([]);
  const [confidenceSelection, setConfidenceSelection] = useState({ optionIndex: null, level: 2 });
  const [ipsativeMost, setIpsativeMost] = useState(null);
  const [ipsativeLeast, setIpsativeLeast] = useState(null);
  const [allocationPoints, setAllocationPoints] = useState({});
  const [holdLevel, setHoldLevel] = useState(0);
  const [rhythmPattern, setRhythmPattern] = useState([]);
  const [constellationSelection, setConstellationSelection] = useState([]);
  const [integrityCheckpoint, setIntegrityCheckpoint] = useState(null);
  const [matchedResult, setMatchedResult] = useState(null);
  const [showAllScores, setShowAllScores] = useState(false);
  const evidenceTrailRef = useRef([]);
  const axisSignalRef = useRef({ social: 0, planning: 0, focus: 0, drive: 0 });
  const axisPolarityRef = useRef({
    social: { pos: 0, neg: 0 },
    planning: { pos: 0, neg: 0 },
    focus: { pos: 0, neg: 0 },
    drive: { pos: 0, neg: 0 },
  });
  const typeCountRef = useRef({});
  const responseVectorsRef = useRef([]);
  const responseQualityRef = useRef({
    sliderCount: 0,
    sliderExtreme: 0,
    spectrumCount: 0,
    spectrumExtreme: 0,
    optionSelectTotal: 0,
    optionSelectCounts: [0, 0, 0, 0],
    allocationCount: 0,
    allocationConcentrationSum: 0,
  });
  const pairResponsesRef = useRef({});
  const pendingAxesRef = useRef(null);
  const integrityPromptCountRef = useRef(0);
  const lastIntegrityPromptStepRef = useRef(0);
  const recoveryRoundRef = useRef(0);
  const localizedQuestionBank = React.useMemo(
    () => QUESTION_BANK.map((question) => localizeQuizQuestion(question, t)),
    [t]
  );
  const localizedQuestionLookup = React.useMemo(
    () => new Map(localizedQuestionBank.map((question) => [question.id, question])),
    [localizedQuestionBank]
  );
  const quizStagePreloaders = useMemo(
    () => [loadQuizIntegrityCheckpoint, loadQuizLoadingState, loadQuizQuestionStep, loadQuizResultView],
    [],
  );
  const questions = React.useMemo(
    () => questionIds.map((id) => localizedQuestionLookup.get(id)).filter(Boolean),
    [questionIds, localizedQuestionLookup]
  );

  useIdlePreload(quizStagePreloaders, currentStep <= 1, {
    delayMs: 220,
    staggerMs: 140,
    maxPreloadCount: isMobile ? 2 : 3,
  });

  const handleStart = () => {
    triggerHaptic('selection');
    
    // Use stratified sampling for broad type coverage, then adaptively reorder at runtime.
    const sampled = buildHumanQuestionSet({ localizedQuestionBank, count: 35 });
    setQuestionIds(sampled.map((question) => question.id));
    
    setCurrentStep(1);
    setAxes({ social: 0, planning: 0, focus: 0, drive: 0 });
    setSliderValue(3);
    setSpectrumValue(3);
    setStanceSelection(null);
    setMultiSelection([]);
    setRankSelection([]);
    setConfidenceSelection({ optionIndex: null, level: 2 });
    setIpsativeMost(null);
    setIpsativeLeast(null);
    setAllocationPoints({});
    setHoldLevel(0);
    setRhythmPattern([]);
    setConstellationSelection([]);
    setIntegrityCheckpoint(null);
    setShowAllScores(false);
    evidenceTrailRef.current = [];
    axisSignalRef.current = { social: 0, planning: 0, focus: 0, drive: 0 };
    axisPolarityRef.current = {
      social: { pos: 0, neg: 0 },
      planning: { pos: 0, neg: 0 },
      focus: { pos: 0, neg: 0 },
      drive: { pos: 0, neg: 0 },
    };
    typeCountRef.current = {};
    responseVectorsRef.current = [];
    responseQualityRef.current = {
      sliderCount: 0,
      sliderExtreme: 0,
      spectrumCount: 0,
      spectrumExtreme: 0,
      optionSelectTotal: 0,
      optionSelectCounts: [0, 0, 0, 0],
      allocationCount: 0,
      allocationConcentrationSum: 0,
    };
    pairResponsesRef.current = {};
    pendingAxesRef.current = null;
    integrityPromptCountRef.current = 0;
    lastIntegrityPromptStepRef.current = 0;
    recoveryRoundRef.current = 0;
  };

  const accumulateEvidence = (label, modifiers) => {
    const dominantAxis = Object.entries(modifiers).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    if (!dominantAxis) return;
    const [axis, delta] = dominantAxis;
    const axisLabelMap = {
      social: t.quiz.traits.social.toLowerCase(),
      planning: t.quiz.traits.planning.toLowerCase(),
      focus: t.quiz.traits.focus.toLowerCase(),
      drive: t.quiz.traits.drive.toLowerCase(),
    };
    evidenceTrailRef.current = [
      ...evidenceTrailRef.current,
      {
        axis,
        delta,
        label,
        insight: `${label} indicates ${delta > 0 ? 'higher' : 'lower'} ${axisLabelMap[axis] || axis}.`,
      },
    ];
  };

  const applyModifiers = (modifiers, evidenceLabel = 'Response', questionType = 'choice', qualityMeta = {}) => {
    const liveQuality = computeHumanLiveQuality({
      responseQuality: responseQualityRef.current,
      pairResponses: pairResponsesRef.current,
      responseVectors: responseVectorsRef.current,
    });
    const typeWeight = QUESTION_TYPE_WEIGHT[questionType] || 1;
    const dynamicMultiplier = Math.max(0.72, Math.min(1.08, 0.82 + ((liveQuality.integrity / 100) * 0.26)));
    const finalWeight = typeWeight * dynamicMultiplier;
    typeCountRef.current[questionType] = (typeCountRef.current[questionType] || 0) + 1;
    const weightedModifiers = {};
    AXES.forEach((axis) => {
      const base = modifiers?.[axis] || 0;
      const weighted = Math.round(base * finalWeight);
      weightedModifiers[axis] = weighted;
      axisSignalRef.current[axis] += Math.abs(weighted);
      if (weighted > 0) axisPolarityRef.current[axis].pos += Math.abs(weighted);
      if (weighted < 0) axisPolarityRef.current[axis].neg += Math.abs(weighted);
    });

    responseVectorsRef.current = [...responseVectorsRef.current, weightedModifiers];
    if (qualityMeta.optionIndex != null) {
      const clamped = Math.max(0, Math.min(3, qualityMeta.optionIndex));
      responseQualityRef.current.optionSelectTotal += 1;
      responseQualityRef.current.optionSelectCounts[clamped] += 1;
    }
    if (qualityMeta.pairKey && qualityMeta.pairSlot) {
      if (!pairResponsesRef.current[qualityMeta.pairKey]) {
        pairResponsesRef.current[qualityMeta.pairKey] = { a: null, b: null };
      }
      const clampedValue = Math.max(-1, Math.min(1, qualityMeta.pairValue ?? 0));
      pairResponsesRef.current[qualityMeta.pairKey][qualityMeta.pairSlot] = clampedValue;
    }

    let newAxes = { ...axes };
    Object.keys(weightedModifiers).forEach(key => {
      newAxes[key] = (newAxes[key] || 0) + weightedModifiers[key];
    });
    setAxes(newAxes);
    accumulateEvidence(evidenceLabel, weightedModifiers);
    advanceStep(newAxes);
  };

  const handleNextSlider = (q) => {
    triggerHaptic('success');
    let newAxes = { ...axes };
    let val = 0;
    if (q.invert) { val = (3 - sliderValue) * 5; } 
    else { val = (sliderValue - 3) * 5; }
    
    const typeWeight = QUESTION_TYPE_WEIGHT.slider || 1;
    typeCountRef.current.slider = (typeCountRef.current.slider || 0) + 1;
    const weightedVal = Math.round(val * typeWeight);
    newAxes[q.axis] += weightedVal;
    axisSignalRef.current[q.axis] += Math.abs(weightedVal);
    if (weightedVal > 0) axisPolarityRef.current[q.axis].pos += Math.abs(weightedVal);
    if (weightedVal < 0) axisPolarityRef.current[q.axis].neg += Math.abs(weightedVal);
    responseVectorsRef.current = [...responseVectorsRef.current, { [q.axis]: weightedVal }];
    responseQualityRef.current.sliderCount += 1;
    if (sliderValue === 1 || sliderValue === 5) responseQualityRef.current.sliderExtreme += 1;
    setAxes(newAxes);
    accumulateEvidence(`${q.text} (${sliderValue}/5)`, { [q.axis]: weightedVal });
    setSliderValue(3);
    advanceStep(newAxes);
  };

  const handleSubmitMulti = (q) => {
    if (!multiSelection.length) return;
    const merged = { social: 0, planning: 0, focus: 0, drive: 0 };
    const labels = [];
    q.options.forEach((opt, index) => {
      if (!multiSelection.includes(index)) return;
      labels.push(opt.text);
      Object.entries(opt.modifiers || {}).forEach(([axis, value]) => {
        merged[axis] += value;
      });
    });
    setMultiSelection([]);
    applyModifiers(merged, `${q.text} -> ${labels.join(' + ')}`, 'multi', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: multiSelection.length ? 0.65 : 0,
    });
  };

  const handleSubmitRank = (q) => {
    if (rankSelection.length < 2) return;
    const weightedMerge = { social: 0, planning: 0, focus: 0, drive: 0 };
    rankSelection.forEach((selectedIndex, rankIndex) => {
      const weight = rankIndex === 0 ? 1 : 0.55;
      const opt = q.options[selectedIndex];
      Object.entries(opt.modifiers || {}).forEach(([axis, value]) => {
        weightedMerge[axis] += Math.round(value * weight);
      });
    });
    const labels = rankSelection.map((idx, i) => `#${i + 1} ${q.options[idx].text}`);
    setRankSelection([]);
    applyModifiers(weightedMerge, `${q.text} -> ${labels.join(' | ')}`, 'rank2', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: rankSelection.length >= 2 ? 0.7 : 0,
    });
  };

  const handleSubmitConfidenceChoice = (q) => {
    if (confidenceSelection.optionIndex == null) return;
    const selected = q.options?.[confidenceSelection.optionIndex];
    const confidenceMultiplier = confidenceSelection.level === 1 ? 0.72 : confidenceSelection.level === 3 ? 1.18 : 1;
    const merged = { social: 0, planning: 0, focus: 0, drive: 0 };
    AXES.forEach((axis) => {
      const base = selected?.modifiers?.[axis] || 0;
      merged[axis] = Math.round(base * confidenceMultiplier);
    });
    const confidenceLabel = confidenceSelection.level === 1 ? 'low confidence' : confidenceSelection.level === 3 ? 'high confidence' : 'medium confidence';
    const selectedIndex = confidenceSelection.optionIndex;
    setConfidenceSelection({ optionIndex: null, level: 2 });
    applyModifiers(merged, `${q.text} -> ${selected?.text || '-'} (${confidenceLabel})`, 'confidenceChoice', {
      optionIndex: selectedIndex,
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: confidenceSelection.level === 1 ? 0.35 : confidenceSelection.level === 3 ? 0.85 : 0.6,
    });
  };

  const handleSubmitStance = (q, selectionIndex) => {
    const stanceMap = [-1, -0.4, 0.4, 1];
    const factor = stanceMap[selectionIndex] ?? 0;
    const merged = { social: 0, planning: 0, focus: 0, drive: 0 };
    AXES.forEach((axis) => {
      merged[axis] = Math.round((q.modifiers?.[axis] || 0) * factor);
    });
    const labels = q.labels || ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'];
    setStanceSelection(selectionIndex);
    applyModifiers(merged, `${q.text} -> ${labels[selectionIndex] || 'stance'}`, 'stance', {
      optionIndex: selectionIndex,
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: factor,
    });
    setStanceSelection(null);
  };

  const handleSubmitHold = (q) => {
    const level = Math.max(0, Math.min(1, holdLevel ?? 0));
    const merged = { social: 0, planning: 0, focus: 0, drive: 0 };
    AXES.forEach((axis) => {
      merged[axis] = Math.round(
        ((q.lowModifiers?.[axis] || 0) * (1 - level)) +
        ((q.highModifiers?.[axis] || 0) * level)
      );
    });
    const label = level < 0.34 ? q.lowLabel : level > 0.66 ? q.highLabel : (t.quiz.interactionUi?.balancedMiddle || 'balanced middle');
    setHoldLevel(0);
    applyModifiers(merged, `${q.text} -> ${label} (${Math.round(level * 100)}%)`, 'hold', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: (level * 2) - 1,
    });
  };

  const handleSubmitRhythm = (q) => {
    if ((rhythmPattern || []).length < 4) return;
    const intervals = rhythmPattern.slice(1).map((stamp, index) => stamp - rhythmPattern[index]).filter((value) => value > 0);
    const average = intervals.reduce((sum, value) => sum + value, 0) / Math.max(1, intervals.length);
    const variance = intervals.reduce((sum, value) => sum + ((value - average) ** 2), 0) / Math.max(1, intervals.length);
    const deviation = Math.sqrt(variance);
    const slowWeight = Math.max(0, Math.min(1, (average - 220) / 980));
    const fastWeight = 1 - slowWeight;
    const wildWeight = Math.max(0, Math.min(1, ((deviation / Math.max(average, 1)) - 0.06) / 0.39));
    const steadyWeight = 1 - wildWeight;
    const merged = { social: 0, planning: 0, focus: 0, drive: 0 };

    AXES.forEach((axis) => {
      const tempoValue = ((q.slowModifiers?.[axis] || 0) * slowWeight) + ((q.fastModifiers?.[axis] || 0) * fastWeight);
      const patternValue = ((q.steadyModifiers?.[axis] || 0) * steadyWeight) + ((q.wildModifiers?.[axis] || 0) * wildWeight);
      merged[axis] = Math.round((tempoValue + patternValue) / 2);
    });

    const paceLabel = slowWeight >= 0.5 ? q.slowLabel : q.fastLabel;
    const shapeLabel = steadyWeight >= 0.5 ? q.steadyLabel : q.wildLabel;
    const pairValue = ((fastWeight - slowWeight) + (wildWeight - steadyWeight)) / 2;
    setRhythmPattern([]);
    applyModifiers(merged, `${q.text} -> ${paceLabel} / ${shapeLabel}`, 'rhythm', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue,
    });
  };

  const handleSubmitConstellation = (q) => {
    const pickCount = q.pickCount || 3;
    if (constellationSelection.length < pickCount) return;
    const weights = [1, 0.74, 0.48, 0.28];
    const merged = { social: 0, planning: 0, focus: 0, drive: 0 };
    constellationSelection.slice(0, pickCount).forEach((selectedIndex, stepIndex) => {
      const option = q.options?.[selectedIndex];
      const weight = weights[stepIndex] || 0.24;
      AXES.forEach((axis) => {
        merged[axis] += Math.round((option?.modifiers?.[axis] || 0) * weight);
      });
    });
    const trioKey = constellationSelection.slice(0, pickCount).join('-');
    const trioBonus = q.trioBonuses?.[trioKey] || {};
    AXES.forEach((axis) => {
      merged[axis] += trioBonus?.[axis] || 0;
    });
    const labels = constellationSelection.slice(0, pickCount).map((idx) => q.options?.[idx]?.text).filter(Boolean);
    setConstellationSelection([]);
    applyModifiers(merged, `${q.text} -> ${labels.join(' -> ')}`, 'constellation', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: labels.length / 3,
    });
  };
  const getQuestionInstruction = (q) => {
    switch (q.type) {
      case 'slider':
        return t.quiz.instructions.slider;
      case 'choice':
        return t.quiz.instructions.choice;
      case 'yesno':
        return t.quiz.instructions.yesno;
      case 'duel':
        return t.quiz.instructions.duel;
      case 'multi':
        return t.quiz.instructions.multi.replace('{n}', q.maxSelect || 2);
      case 'rank2':
        return t.quiz.instructions.rank2;
      case 'ipsative':
        return t.quiz.instructions.ipsative;
      case 'spectrum':
        return t.quiz.instructions.spectrum;
        case 'allocation':
          return t.quiz.instructions.allocation.replace('{n}', q.budget || 10);
        case 'confidenceChoice':
          return t.quiz.instructions.confidenceChoice;
        case 'hold':
          return t.quiz.interactionUi?.holdInstruction || 'Press and hold until the intensity feels right, then release.';
        case 'rhythm':
          return t.quiz.interactionUi?.rhythmInstruction || 'Tap 4 times in the pace that honestly feels like you.';
        case 'constellation':
          return 'Build a 3-step pattern from first instinct to last instinct.';
        case 'stance':
          return t.quiz.instructions.stance;
      default:
        return t.quiz.instructions.default;
    }
  };

  const handleSubmitIpsative = (q) => {
    if (ipsativeMost == null || ipsativeLeast == null || ipsativeMost === ipsativeLeast) return;
    const most = q.options?.[ipsativeMost];
    const least = q.options?.[ipsativeLeast];
    const combined = { social: 0, planning: 0, focus: 0, drive: 0 };

    AXES.forEach((axis) => {
      const plus = most?.modifiers?.[axis] || 0;
      const minus = least?.modifiers?.[axis] || 0;
      combined[axis] = plus - Math.round(minus * 0.8);
    });

    const label = `${q.text} -> most: ${most?.text || '-'} | least: ${least?.text || '-'}`;
    setIpsativeMost(null);
    setIpsativeLeast(null);
    applyModifiers(combined, label, 'ipsative', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: 0.75,
    });
  };

  const handleSubmitSpectrum = (q) => {
    const ratio = (spectrumValue - 3) / 2; // -1..1
    const leftWeight = (1 - ratio) / 2;
    const rightWeight = (1 + ratio) / 2;
    const intensity = 0.8 + (Math.abs(ratio) * 0.7);
    const combined = { social: 0, planning: 0, focus: 0, drive: 0 };

    AXES.forEach((axis) => {
      const leftVal = q.left?.modifiers?.[axis] || 0;
      const rightVal = q.right?.modifiers?.[axis] || 0;
      combined[axis] = Math.round(((leftVal * leftWeight) + (rightVal * rightWeight)) * intensity);
    });

    const leftText = q.leftLabel || 'left';
    const rightText = q.rightLabel || 'right';
    const selectedText = ratio < 0 ? leftText : ratio > 0 ? rightText : 'balanced middle';
    const strength = Math.round(Math.abs(ratio) * 100);
    responseQualityRef.current.spectrumCount += 1;
    if (spectrumValue === 1 || spectrumValue === 5) responseQualityRef.current.spectrumExtreme += 1;
    setSpectrumValue(3);
    applyModifiers(combined, `${q.text} -> ${selectedText} (${strength}%)`, 'spectrum', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: ratio,
    });
  };

  const handleAdjustAllocation = (q, index, delta) => {
    const budget = q.budget || 10;
    setAllocationPoints((prev) => {
      const next = { ...prev };
      const current = next[index] || 0;
      const total = (q.options || []).reduce((sum, _, idx) => sum + (next[idx] || 0), 0);
      if (delta > 0 && total >= budget) return prev;
      if (delta < 0 && current <= 0) return prev;
      next[index] = Math.max(0, current + delta);
      return next;
    });
  };

  const handleSubmitAllocation = (q) => {
    const budget = q.budget || 10;
    const total = (q.options || []).reduce((sum, _, idx) => sum + (allocationPoints[idx] || 0), 0);
    if (total !== budget) return;
    const combined = { social: 0, planning: 0, focus: 0, drive: 0 };
    const labels = [];

    (q.options || []).forEach((opt, idx) => {
      const points = allocationPoints[idx] || 0;
      if (!points) return;
      labels.push(`${opt.text} (${points})`);
      AXES.forEach((axis) => {
        const val = opt.modifiers?.[axis] || 0;
        combined[axis] += Math.round((val * points) / budget);
      });
    });

    const maxAllocated = Math.max(...(q.options || []).map((_, idx) => allocationPoints[idx] || 0), 0);
    responseQualityRef.current.allocationCount += 1;
    responseQualityRef.current.allocationConcentrationSum += (budget > 0 ? maxAllocated / budget : 0);

    setAllocationPoints({});
    applyModifiers(combined, `${q.text} -> ${labels.join(' | ')}`, 'allocation', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: 0.7,
    });
  };

  const buildDynamicReason = (characterKey, standardizedAxes, reliabilityIndex) => {
    const style = t.quiz.characters[characterKey] || {
      openers: [t.quiz.reasonFallbacks?.opener || 'This profile matched your overall response pattern.'],
      anchor: t.quiz.reasonFallbacks?.anchor || 'Your answers held together enough to point in a clear direction.',
      growth: t.quiz.reasonFallbacks?.growth || 'Keep tracking what works for you and adjust based on real situations.',
    };

    const baseSeed = `${characterKey}-${standardizedAxes.social}-${standardizedAxes.planning}-${standardizedAxes.focus}-${standardizedAxes.drive}-${reliabilityIndex}`;
    const seed = hashString(baseSeed);
    
    // 1. Core Opener
    const openersPool = style.openers || [];
    const opener = openersPool.length ? openersPool[seed % openersPool.length] : 'You matched this profile.';

    // 2. Magnitude-Aware Axis Lines
    const getIntensity = (val) => {
      const abs = Math.abs(val);
      if (abs >= 85) return t.quiz.intense.profoundly;
      if (abs >= 65) return t.quiz.intense.notably;
      if (abs >= 45) return t.quiz.intense.distinctly;
      if (abs >= 25) return t.quiz.intense.moderately;
      return t.quiz.intense.subtly;
    };

    const rankedAxes = [...AXES]
      .map((axis) => ({ axis, value: standardizedAxes[axis] || 0, magnitude: Math.abs(standardizedAxes[axis] || 0) }))
      .sort((a, b) => b.magnitude - a.magnitude);

    const axisLine = (entry, indexShift) => {
      const polarity = entry.value >= 0 ? 'pos' : 'neg';
      const pool = t.quiz.axisDynamicLines?.[entry.axis]?.[polarity] || [];
      if (!pool.length) return '';
      const text = pool[(seed + indexShift) % pool.length];
      const intensity = getIntensity(entry.value);
      return `${intensity} ${text}`;
    };

      const primaryLine = rankedAxes[0] ? axisLine(rankedAxes[0], 3) : '';
      const secondaryLine = rankedAxes[1] && rankedAxes[1].magnitude >= 25 ? axisLine(rankedAxes[1], 7) : '';
      const evidenceLine = evidenceTrailRef.current
        .slice()
        .sort((a, b) => Math.abs(b.delta || 0) - Math.abs(a.delta || 0))
        .slice(0, 1)
        .map((entry) =>
          (t.quiz.clueLead || 'A clear clue came from {label}.').replace('{label}', String(entry.label || ''))
        )
        .find(Boolean);

    // 3. Synergy Injects
    const synergyMatchIndex = SYNERGY_CHECK_LOGIC.findIndex(check => check(standardizedAxes));
    const synergyLine = (synergyMatchIndex !== -1 && t.quiz.synergyInjects?.[synergyMatchIndex]) 
      ? t.quiz.synergyInjects[synergyMatchIndex] 
      : '';

    // 4. Reliability Context
    const reliabilityLine = reliabilityIndex < 58
      ? t.quiz.reliabilityContext?.exploratory || 'Treat this as a strong first read that may shift as your environment settles.'
      : reliabilityIndex < 72
        ? t.quiz.reliabilityContext?.stable || 'This profile is fairly stable and reflects your current underlying rhythm well.'
        : t.quiz.reliabilityContext?.consistent || 'The pattern is remarkably consistent across all your responses.';

      const summaryLine = [primaryLine, secondaryLine].filter(Boolean).join(' ');

      const blueprints = [
        () => [opener, style.anchor, summaryLine, evidenceLine, synergyLine, style.growth, reliabilityLine],
        () => [opener, summaryLine, style.anchor, evidenceLine, style.growth, reliabilityLine],
        () => [`${opener} ${style.anchor}`, summaryLine || evidenceLine, synergyLine, style.growth, reliabilityLine],
        () => [opener, primaryLine, style.anchor, evidenceLine, reliabilityLine]
      ];

    const selectedBlueprint = blueprints[seed % blueprints.length]();

    return selectedBlueprint
      .filter(Boolean)
      .join(' ');
  };

  const buildDynamicPrediction = (characterKey) => {
    return t.quiz.characters[characterKey]?.prediction || t.quiz.predictionFallback || 'A good day is waiting for you.';
  };

  const resolvedMatchedResult = React.useMemo(() => {
    if (!matchedResult?.matchKey || !matchedResult?.standardizedAxes) return matchedResult;
    return {
      ...matchedResult,
      reason: buildDynamicReason(
        matchedResult.matchKey,
        matchedResult.standardizedAxes,
        matchedResult.reliabilityIndex
      ),
      prediction: buildDynamicPrediction(matchedResult.matchKey),
    };
  }, [matchedResult, t]);

  const maybeInjectRecoveryRound = (nextAxes) => {
    const live = computeHumanLiveQuality({
      responseQuality: responseQualityRef.current,
      pairResponses: pairResponsesRef.current,
      responseVectors: responseVectorsRef.current,
    });
    const reliabilityNow = Math.round((live.integrity * 0.58) + ((live.pairConsistency || 0.5) * 100 * 0.24) + ((live.coherence || 0.5) * 100 * 0.18));
    const severe = reliabilityNow < 42 || live.integrity < 45;
    const moderate =
      reliabilityNow < 54 &&
      (live.integrity < 60 || (live.pairConsistency || 0.5) < 0.62 || (live.coherence || 0.5) < 0.55);

    if (!severe && !moderate) return false;

    // Reliability Recovery Logic:
    // When patterns are inconsistent, we inject high-weighted questions to force a clear alignment.
    const maxRecoveryRounds = severe ? 2 : 1;
    if (recoveryRoundRef.current >= maxRecoveryRounds) return false;

    const askedIds = new Set(questionIds);
    const pool = RELIABILITY_RECOVERY_BANK.filter((q) => !askedIds.has(q.id));
    if (!pool.length) return false;

    const byId = (id) => pool.find((q) => q.id === id);
    const pickIds = (ids) => ids.map((id) => byId(id)).filter(Boolean);

    // Dynamic question injection based on severity
    let selected = severe
      ? [...pickIds([901, 902, 903, 904, 907, 908]), ...pickIds([905, 906])]
      : [...pickIds([901, 902]), ...pickIds([903, 904]).slice(0, 1), ...pickIds([905, 906, 907, 908]).sort(() => Math.random() - 0.5).slice(0, 2)];

    if (!selected.length || selected.length < (severe ? 6 : 3)) {
      const fallbackCount = severe ? 8 : 4;
      selected = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(fallbackCount, pool.length));
    }
    if (!selected.length) return false;

    recoveryRoundRef.current += 1;
    pendingAxesRef.current = nextAxes;
    setQuestionIds((prev) => [...prev, ...selected.map((question) => question.id)]);
    setIntegrityCheckpoint({
      integrity: live.integrity,
      reliability: reliabilityNow,
      isCalibration: true,
      message: severe
        ? t.quiz.deepCalibrationMsg
        : t.quiz.calibrationMsg,
    });
    return true;
  };

  const continueStepTransition = (nextAxes) => {
    if (currentStep < questions.length) {
      const nextIndex = currentStep;
      const remaining = questions.slice(nextIndex);
      const nextQuestion = pickMostInformativeHumanQuestion({
        remainingQuestions: remaining,
        axes,
        axisSignal: axisSignalRef.current,
        typeCount: typeCountRef.current,
      });
      if (nextQuestion) {
        const reordered = [
          ...questionIds.slice(0, nextIndex),
          nextQuestion.id,
          ...remaining.filter((q) => q.id !== nextQuestion.id).map((q) => q.id),
        ];
        setQuestionIds(reordered);
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
      const liveQuality = computeHumanLiveQuality({
        responseQuality: responseQualityRef.current,
        pairResponses: pairResponsesRef.current,
        responseVectors: responseVectorsRef.current,
      });
      const enoughSpacing = (currentStep - lastIntegrityPromptStepRef.current) >= 6;
      const canPrompt = integrityPromptCountRef.current < 2 && enoughSpacing && !integrityCheckpoint;
      if (canPrompt && liveQuality.integrity < 52) {
        pendingAxesRef.current = nextAxes;
        integrityPromptCountRef.current += 1;
        lastIntegrityPromptStepRef.current = currentStep;
        setIntegrityCheckpoint({
          integrity: liveQuality.integrity,
          message: t.quiz.inconsistencyMsg,
        });
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
    const nextMatchedResult = calculateHumanResult({
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
    setTimeout(() => {
      triggerHaptic('success');
      setMatchedResult(nextMatchedResult);
      setCurrentStep(questions.length + 2);
    }, 2400);
  };

  const renderContent = () => {
    if (integrityCheckpoint) {
      return (
        <Suspense fallback={<QuizStageFallback isMobile={isMobile} label={t.quiz?.thinking || 'Loading quiz...'} />}>
          <QuizIntegrityCheckpoint
            isMobile={isMobile}
            integrityCheckpoint={integrityCheckpoint}
            t={t}
            onResume={resumeAfterIntegrityCheckpoint}
          />
        </Suspense>
      );
    }

    if (currentStep === 0) {
      return (
        <Suspense fallback={<QuizStageFallback isMobile={isMobile} label={t.quiz?.thinking || 'Loading quiz...'} />}>
          <QuizIntro isMobile={isMobile} t={t} onStart={handleStart} />
        </Suspense>
      );
    }

    if (currentStep > 0 && currentStep <= questions.length) {
      const question = questions[currentStep - 1];

      return (
        <Suspense fallback={<QuizStageFallback isMobile={isMobile} label={t.quiz?.thinking || 'Loading question...'} />}>
          <QuizQuestionStep
            isMobile={isMobile}
            currentStep={currentStep}
            totalQuestions={questions.length}
            question={question}
            t={t}
            state={{
              sliderValue,
              spectrumValue,
              stanceSelection,
              multiSelection,
              rankSelection,
              confidenceSelection,
              ipsativeMost,
              ipsativeLeast,
              allocationPoints,
              holdLevel,
              rhythmPattern,
              constellationSelection,
            }}
            setters={{
              setSliderValue,
              setSpectrumValue,
              setMultiSelection,
              setRankSelection,
              setConfidenceSelection,
              setIpsativeMost,
              setIpsativeLeast,
              setHoldLevel,
              setRhythmPattern,
              setConstellationSelection,
            }}
            handlers={{
              onApplyModifiers: applyModifiers,
              onNextSlider: handleNextSlider,
              onSubmitMulti: handleSubmitMulti,
              onSubmitRank: handleSubmitRank,
              onSubmitIpsative: handleSubmitIpsative,
              onSubmitSpectrum: handleSubmitSpectrum,
              onAdjustAllocation: handleAdjustAllocation,
              onSubmitAllocation: handleSubmitAllocation,
              onSubmitConfidenceChoice: handleSubmitConfidenceChoice,
              onSubmitStance: handleSubmitStance,
              onSubmitHold: handleSubmitHold,
              onSubmitRhythm: handleSubmitRhythm,
              onSubmitConstellation: handleSubmitConstellation,
            }}
            getQuestionInstruction={getQuestionInstruction}
          />
        </Suspense>
      );
    }

    if (currentStep === questions.length + 1) {
      return (
        <Suspense fallback={<QuizStageFallback isMobile={isMobile} label={t.quiz?.thinking || 'Calculating...'} />}>
          <QuizLoadingState t={t} />
        </Suspense>
      );
    }

    if (currentStep === questions.length + 2 && resolvedMatchedResult) {
      return (
        <Suspense fallback={<QuizStageFallback isMobile={isMobile} label={t.quiz?.thinking || 'Loading result...'} />}>
          <QuizResultView
            isMobile={isMobile}
            matchedResult={resolvedMatchedResult}
            fallbackColors={fallbackColors}
            axes={axes}
            t={t}
            showAllScores={showAllScores}
            setShowAllScores={setShowAllScores}
            onRestart={handleStart}
          />
        </Suspense>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        minHeight: isMobile ? '460px' : '580px',
        paddingTop: isMobile ? '4px' : '8px',
      }}
    >
      <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizGame;








