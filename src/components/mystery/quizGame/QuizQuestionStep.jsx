import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

void motion;
import { triggerHaptic } from '../../../utils/haptics';
import { ANIMAL_CARD_COLORS } from '../../../data/animalQuizData';
import { CHARACTER_COLORS } from '../../../data/characters';
import DotSlider from './DotSlider';
import { CHOICE_COLORS, STANCE_PALETTES } from './config';
import { toMysteryLabelCase } from './ui';

const shuffleArray = (items) => [...items].sort(() => Math.random() - 0.5);
const formatElapsedTime = (elapsedMs = 0) => `${(elapsedMs / 1000).toFixed(1)}s`;
const PUBLIC_MEMORY_PORTRAITS = [
  { name: 'Chris', src: '/portrait/chris.png' },
  { name: 'Fumi', src: '/portrait/fumi.png' },
  { name: 'Kanechika', src: '/portrait/kanechika.png' },
  { name: 'Kazakami', src: '/portrait/kazakami.png' },
  { name: 'Makoto', src: '/portrait/makoto.png' },
  { name: 'Mika', src: '/portrait/mika.png' },
  { name: 'Mitsumi', src: '/portrait/mitsumi.png' },
  { name: 'Mukai', src: '/portrait/mukai.png' },
  { name: 'Nao', src: '/portrait/nao.png' },
  { name: 'Omiso', src: '/portrait/omiso.webp' },
  { name: 'Oshio', src: '/portrait/oshio.webp' },
  { name: 'Ririka', src: '/portrait/rirka.webp' },
  { name: 'Satonosuke', src: '/portrait/satonosuke.png' },
  { name: 'Shima', src: '/portrait/shima.png' },
  { name: 'Tokiko', src: '/portrait/tokiko.png' },
  { name: 'Ujiie', src: '/portrait/ujie.png' },
  { name: 'Yamada', src: '/portrait/yamada.png' },
  { name: 'Yuzuki', src: '/portrait/yuzuki.png' },
];
const MEMORY_FALLBACK_COLORS = [
  { bg: '#ffe4ec', border: '#f472b6', text: '#9d174d' },
  { bg: '#e0f2fe', border: '#38bdf8', text: '#075985' },
  { bg: '#fff1d6', border: '#fbbf24', text: '#92400e' },
  { bg: '#dcfce7', border: '#34d399', text: '#065f46' },
  { bg: '#f1edff', border: '#a78bfa', text: '#5b21b6' },
  { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  { bg: '#fce7f3', border: '#db2777', text: '#831843' },
];
const getMemoryCardPalette = (name) => {
  if (ANIMAL_CARD_COLORS[name]) return ANIMAL_CARD_COLORS[name];
  const mappedKey = Object.keys(CHARACTER_COLORS).find(
    (key) => key.includes(name) || name.includes(key.split(' ')[0]),
  );
  if (mappedKey && CHARACTER_COLORS[mappedKey]) return CHARACTER_COLORS[mappedKey];
  return MEMORY_FALLBACK_COLORS[name.length % MEMORY_FALLBACK_COLORS.length];
};

const instructionStyle = (isMobile) => ({
  marginTop: '2px',
  fontFamily: 'var(--font-hand)',
  color: '#64748b',
  fontSize: isMobile ? '0.95rem' : '1rem',
  textAlign: 'center',
  lineHeight: 1.35,
});

const QuizQuestionStep = ({
  isMobile,
  currentStep,
  totalQuestions,
  question,
  t,
  state,
  setters,
  handlers,
  getQuestionInstruction,
  portraitData = [],
}) => {
  const {
    sliderValue,
    spectrumValue,
    stanceSelection,
    multiSelection,
    rankSelection,
    confidenceSelection,
    ipsativeMost,
    ipsativeLeast,
    allocationPoints,
    driftSelection,
    sortSelection,
    pairMatchSelection,
    tradeoffValue,
    holdLevel,
    rhythmPattern,
    constellationSelection,
  } = state;

  const {
    setSliderValue,
    setSpectrumValue,
    setMultiSelection,
    setRankSelection,
    setConfidenceSelection,
    setIpsativeMost,
    setIpsativeLeast,
    setDriftSelection,
    setSortSelection,
    setPairMatchSelection,
    setTradeoffValue,
    setHoldLevel,
    setRhythmPattern,
    setConstellationSelection,
  } = setters;

  const {
    onApplyModifiers,
    onNextSlider,
    onSubmitMulti,
    onSubmitRank,
    onSubmitIpsative,
    onSubmitSpectrum,
    onAdjustAllocation,
    onSubmitAllocation,
    onSubmitDrift,
    onSubmitSort4,
    onSubmitPairMatch,
    onSubmitConfidenceChoice,
    onSubmitStance,
    onSubmitTradeoff,
    onSubmitHold,
    onSubmitRhythm,
    onSubmitConstellation,
    onSubmitReaction,
    onSubmitTiming,
  } = handlers;

  const totalAllocated = (question.options || []).reduce((sum, _, index) => sum + (allocationPoints[index] || 0), 0);
  const allocationBudget = question.budget || 10;
  const driftTarget = question.pickCount || 3;
  const sortTarget = 4;
  const pairTarget = 2;
  const constellationTarget = question.pickCount || 3;
  const tradeoffBudget = question.budget || 4;
  const tradeoffLeft = Math.max(0, Math.min(tradeoffValue, tradeoffBudget));
  const tradeoffRight = tradeoffBudget - tradeoffLeft;
  const holdTimerRef = React.useRef(null);
  const reactionDelayRef = React.useRef(null);
  const timingFrameRef = React.useRef(null);
  const memoryPreviewRef = React.useRef(null);
  const memoryResolveRef = React.useRef(null);
  const memoryTickerRef = React.useRef(null);
  const memoryStartedAtRef = React.useRef(null);
  const localizedQuestion = t.quiz.questions?.[question.id] || {};
  const memoryDeck = React.useMemo(() => {
    if (question.type !== 'flip') return [];
    const pairCount = question.pairCount || 5;
    const sourcePool = (portraitData || []).filter((item) => item?.src).length
      ? (portraitData || []).filter((item) => item?.src)
      : PUBLIC_MEMORY_PORTRAITS;
    const sourcePortraits = shuffleArray(sourcePool).slice(0, pairCount);
    const fallbackPortraits = Array.from({ length: pairCount }, (_, index) => ({
      name: `Card ${index + 1}`,
      src: '',
    }));
    const chosen = sourcePortraits.length >= pairCount ? sourcePortraits : fallbackPortraits;
    return shuffleArray(
      chosen.flatMap((item, index) => ([
        { id: `${question.id}-${index}-a`, pairId: index, name: item.name, src: item.src, colors: getMemoryCardPalette(item.name) },
        { id: `${question.id}-${index}-b`, pairId: index, name: item.name, src: item.src, colors: getMemoryCardPalette(item.name) },
      ]))
    );
  }, [portraitData, question.id, question.pairCount, question.type]);
  const [reactionState, setReactionState] = React.useState({
    phase: 'idle',
    latency: null,
    falseStart: false,
  });
  const [timingState, setTimingState] = React.useState({
    phase: 'idle',
    progress: 0.12,
    direction: 1,
    accuracy: null,
  });
  const [memoryState, setMemoryState] = React.useState({
    phase: 'idle',
    flippedIds: [],
    matchedPairIds: [],
    elapsedMs: 0,
    completedMs: null,
    resultTier: null,
    modalOpen: false,
  });

  React.useEffect(() => () => {
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (reactionDelayRef.current) {
      window.clearTimeout(reactionDelayRef.current);
      reactionDelayRef.current = null;
    }
    if (timingFrameRef.current) {
      window.cancelAnimationFrame(timingFrameRef.current);
      timingFrameRef.current = null;
    }
    if (memoryPreviewRef.current) {
      window.clearTimeout(memoryPreviewRef.current);
      memoryPreviewRef.current = null;
    }
    if (memoryResolveRef.current) {
      window.clearTimeout(memoryResolveRef.current);
      memoryResolveRef.current = null;
    }
    if (memoryTickerRef.current) {
      window.clearInterval(memoryTickerRef.current);
      memoryTickerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    setReactionState({
      phase: 'idle',
      latency: null,
      falseStart: false,
    });
    setTimingState({
      phase: 'idle',
      progress: 0.12,
      direction: 1,
      accuracy: null,
    });
    if (reactionDelayRef.current) {
      window.clearTimeout(reactionDelayRef.current);
      reactionDelayRef.current = null;
    }
    if (timingFrameRef.current) {
      window.cancelAnimationFrame(timingFrameRef.current);
      timingFrameRef.current = null;
    }
    if (memoryPreviewRef.current) {
      window.clearTimeout(memoryPreviewRef.current);
      memoryPreviewRef.current = null;
    }
    if (memoryResolveRef.current) {
      window.clearTimeout(memoryResolveRef.current);
      memoryResolveRef.current = null;
    }
    if (memoryTickerRef.current) {
      window.clearInterval(memoryTickerRef.current);
      memoryTickerRef.current = null;
    }
    memoryStartedAtRef.current = null;
    setMemoryState({
      phase: question.type === 'flip' ? 'preview' : 'idle',
      flippedIds: [],
      matchedPairIds: [],
      elapsedMs: 0,
      completedMs: null,
      resultTier: null,
      modalOpen: false,
    });
  }, [question.id]);

  React.useEffect(() => {
    if (question.type !== 'flip' || !memoryDeck.length) return undefined;
    memoryPreviewRef.current = window.setTimeout(() => {
      memoryStartedAtRef.current = Date.now();
      setMemoryState((previous) => ({
        ...previous,
        phase: 'play',
      }));
      memoryTickerRef.current = window.setInterval(() => {
        if (!memoryStartedAtRef.current) return;
        setMemoryState((previous) => ({
          ...previous,
          elapsedMs: Date.now() - memoryStartedAtRef.current,
        }));
      }, 80);
    }, question.previewMs || 5200);

    return () => {
      if (memoryPreviewRef.current) {
        window.clearTimeout(memoryPreviewRef.current);
        memoryPreviewRef.current = null;
      }
      if (memoryTickerRef.current) {
        window.clearInterval(memoryTickerRef.current);
        memoryTickerRef.current = null;
      }
    };
  }, [memoryDeck, question.previewMs, question.type]);

  const resetMemoryGame = React.useCallback(() => {
    if (memoryPreviewRef.current) {
      window.clearTimeout(memoryPreviewRef.current);
      memoryPreviewRef.current = null;
    }
    if (memoryResolveRef.current) {
      window.clearTimeout(memoryResolveRef.current);
      memoryResolveRef.current = null;
    }
    if (memoryTickerRef.current) {
      window.clearInterval(memoryTickerRef.current);
      memoryTickerRef.current = null;
    }
    memoryStartedAtRef.current = null;
    setMemoryState({
      phase: 'preview',
      flippedIds: [],
      matchedPairIds: [],
      elapsedMs: 0,
      completedMs: null,
      resultTier: null,
      modalOpen: false,
    });
    memoryPreviewRef.current = window.setTimeout(() => {
      memoryStartedAtRef.current = Date.now();
      setMemoryState((previous) => ({
        ...previous,
        phase: 'play',
      }));
      memoryTickerRef.current = window.setInterval(() => {
        if (!memoryStartedAtRef.current) return;
        setMemoryState((previous) => ({
          ...previous,
          elapsedMs: Date.now() - memoryStartedAtRef.current,
        }));
      }, 80);
    }, question.previewMs || 5200);
  }, [question.previewMs]);

  const submitMemoryResult = () => {
    const completedMs = memoryState.completedMs ?? memoryState.elapsedMs;
    const fastThreshold = question.fastThresholdMs || 24000;
    const steadyThreshold = question.steadyThresholdMs || 40000;
    let modifiers = question.slowModifiers || {};
    let label = question.slowResultLabel || 'Careful matcher';
    let optionIndex = 2;
    let pairValue = -1;

    if (completedMs <= fastThreshold) {
      modifiers = question.fastModifiers || {};
      label = question.fastResultLabel || 'Sharp memory';
      optionIndex = 0;
      pairValue = 1;
    } else if (completedMs <= steadyThreshold) {
      modifiers = question.steadyModifiers || {};
      label = question.steadyResultLabel || 'Steady matcher';
      optionIndex = 1;
      pairValue = 0;
    }

    triggerHaptic('success');
    onApplyModifiers(modifiers, `${question.text} -> ${label} (${formatElapsedTime(completedMs)})`, 'flip', {
      optionIndex,
      pairKey: question.pairKey,
      pairSlot: question.pairSlot,
      pairValue,
    });
  };

  const stopHold = () => {
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const startHold = () => {
    stopHold();
    const startedAt = Date.now();
    setHoldLevel(0);
    triggerHaptic('press');
    holdTimerRef.current = window.setInterval(() => {
      const progress = Math.max(0, Math.min(1, (Date.now() - startedAt) / 1500));
      setHoldLevel(progress);
      if (progress >= 1) {
        stopHold();
      }
    }, 16);
  };

  const tapRhythm = () => {
    triggerHaptic('tap');
    setRhythmPattern((previous) => {
      const next = previous.length >= 4 ? [] : previous;
      return [...next, Date.now()];
    });
  };

  const resetReaction = () => {
    if (reactionDelayRef.current) {
      window.clearTimeout(reactionDelayRef.current);
      reactionDelayRef.current = null;
    }
    setReactionState({
      phase: 'idle',
      latency: null,
      falseStart: false,
    });
  };

  const beginReaction = () => {
    resetReaction();
    const cueDelay = 900 + Math.round(Math.random() * 1400);
    const armedAt = Date.now();
    setReactionState({
      phase: 'arming',
      latency: null,
      falseStart: false,
      armedAt,
    });
    reactionDelayRef.current = window.setTimeout(() => {
      const cueStartedAt = Date.now();
      setReactionState({
        phase: 'cue',
        latency: null,
        falseStart: false,
        cueStartedAt,
      });
      reactionDelayRef.current = null;
    }, cueDelay);
  };

  const tapReaction = () => {
    if (reactionState.phase === 'arming') {
      if (reactionDelayRef.current) {
        window.clearTimeout(reactionDelayRef.current);
        reactionDelayRef.current = null;
      }
      triggerHaptic('warning');
      setReactionState({
        phase: 'done',
        latency: null,
        falseStart: true,
      });
      return;
    }
    if (reactionState.phase !== 'cue') return;
    const latency = Date.now() - (reactionState.cueStartedAt || Date.now());
    triggerHaptic('success');
    setReactionState({
      phase: 'done',
      latency,
      falseStart: false,
    });
  };

  const resetTiming = () => {
    if (timingFrameRef.current) {
      window.cancelAnimationFrame(timingFrameRef.current);
      timingFrameRef.current = null;
    }
    setTimingState({
      phase: 'idle',
      progress: 0.12,
      direction: 1,
      accuracy: null,
    });
  };

  const beginTiming = () => {
    if (timingFrameRef.current) {
      window.cancelAnimationFrame(timingFrameRef.current);
      timingFrameRef.current = null;
    }
    triggerHaptic('selection');
    const speed = question.timingSpeed || 0.016;
    let progress = 0.12;
    let direction = 1;
    setTimingState({
      phase: 'running',
      progress,
      direction,
      accuracy: null,
    });

    const tick = () => {
      progress += speed * direction;
      if (progress >= 1) {
        progress = 1;
        direction = -1;
      } else if (progress <= 0) {
        progress = 0;
        direction = 1;
      }
      setTimingState((previous) => ({
        ...previous,
        phase: 'running',
        progress,
        direction,
      }));
      timingFrameRef.current = window.requestAnimationFrame(tick);
    };

    timingFrameRef.current = window.requestAnimationFrame(tick);
  };

  const stopTiming = () => {
    if (timingState.phase !== 'running') return;
    if (timingFrameRef.current) {
      window.cancelAnimationFrame(timingFrameRef.current);
      timingFrameRef.current = null;
    }
    const target = question.targetProgress ?? 0.68;
    const tolerance = question.targetTolerance ?? 0.2;
    const distance = Math.abs((timingState.progress ?? 0) - target);
    const accuracy = Math.max(0, 1 - (distance / Math.max(tolerance, 0.001)));
    triggerHaptic('success');
    setTimingState((previous) => ({
      ...previous,
      phase: 'done',
      accuracy,
    }));
  };

  const handleMemoryFlip = (cardId) => {
    if (question.type !== 'flip') return;
    setMemoryState((previous) => {
      if (previous.phase !== 'play') return previous;
      if (previous.flippedIds.includes(cardId)) return previous;
      const card = memoryDeck.find((entry) => entry.id === cardId);
      if (!card || previous.matchedPairIds.includes(card.pairId)) return previous;
      if (previous.flippedIds.length >= 2) return previous;

      const nextFlipped = [...previous.flippedIds, cardId];
      if (nextFlipped.length < 2) {
        triggerHaptic('selection');
        return { ...previous, flippedIds: nextFlipped };
      }

      const firstCard = memoryDeck.find((entry) => entry.id === nextFlipped[0]);
      const secondCard = memoryDeck.find((entry) => entry.id === nextFlipped[1]);
      if (!firstCard || !secondCard) return previous;

      if (firstCard.pairId === secondCard.pairId) {
        triggerHaptic('success');
        const nextMatched = [...previous.matchedPairIds, firstCard.pairId];
        const completed = nextMatched.length === (question.pairCount || 5);
        const completedMs = memoryStartedAtRef.current ? Date.now() - memoryStartedAtRef.current : previous.elapsedMs;
        if (completed && memoryTickerRef.current) {
          window.clearInterval(memoryTickerRef.current);
          memoryTickerRef.current = null;
        }
        return {
          ...previous,
          flippedIds: [],
          matchedPairIds: nextMatched,
          elapsedMs: completed ? completedMs : previous.elapsedMs,
          completedMs: completed ? completedMs : previous.completedMs,
          phase: completed ? 'complete' : previous.phase,
          modalOpen: completed,
        };
      }

      triggerHaptic('warning');
      if (memoryResolveRef.current) {
        window.clearTimeout(memoryResolveRef.current);
      }
      memoryResolveRef.current = window.setTimeout(() => {
        setMemoryState((snapshot) => ({
          ...snapshot,
          flippedIds: [],
        }));
        memoryResolveRef.current = null;
      }, 1100);

      return {
        ...previous,
        flippedIds: nextFlipped,
      };
    });
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', damping: 22, stiffness: 120 }}
      style={{ width: '100%', maxWidth: '580px', minHeight: isMobile ? '430px' : '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <div style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-main)', color: '#1d4ed8', marginBottom: isMobile ? '12px' : '16px', fontSize: isMobile ? '0.9rem' : '1.1rem', background: '#eff6ff', padding: isMobile ? '4px 14px' : '6px 18px', borderRadius: '24px', border: '3.5px solid #bfdbfe', fontWeight: 'bold', boxShadow: '0 4px 0 rgba(59, 130, 246, 0.1)' }}>
        {toMysteryLabelCase(t.quiz.question)} {currentStep} {t.quiz.of} {totalQuestions}
      </div>

      <div className="sketchbook-border" style={{ width: '100%', background: '#fff', border: '3.5px solid #bfdbfe', borderBottom: '7px solid #93c5fd', borderRadius: '24px', padding: isMobile ? '16px 18px' : '22px 24px', marginBottom: isMobile ? '20px' : '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1.5rem' : '1.9rem', color: '#1e293b', textAlign: 'left', width: '100%', margin: 0, lineHeight: 1.3, fontWeight: 'bold' }}>
          {t.quiz.questions[question.id]?.text || question.text}
        </h3>
      </div>

      {question.type === 'slider' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
          <DotSlider
            isMobile={isMobile}
            value={sliderValue}
            onChange={setSliderValue}
            leftLabel={t.quiz.questions[question.id]?.leftLabel || question.leftLabel}
            rightLabel={t.quiz.questions[question.id]?.rightLabel || question.rightLabel}
          />
          <div style={{ marginTop: isMobile ? '-10px' : '-6px', ...instructionStyle(isMobile) }}>
            {getQuestionInstruction(question)}
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.9, y: 8 }}
            onClick={() => onNextSlider(question)}
            className="sketchbook-border paper-interact"
            style={{ marginTop: isMobile ? '4px' : '12px', background: '#3b82f6', color: 'white', border: '3.5px solid #2563eb', borderBottom: '9.5px solid #1d4ed8', padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: isMobile ? '1.1rem' : '1.25rem', cursor: 'pointer', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}
          >
            {toMysteryLabelCase(t.quiz.btns.next)}
          </motion.button>
        </div>
      )}

      {question.type === 'choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '14px', width: '100%' }}>
          {question.options.map((option, index) => {
            const colors = CHOICE_COLORS[index % CHOICE_COLORS.length];

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.03, x: isMobile ? 0 : 8, y: -2 }}
                whileTap={{ scale: 0.95, y: 8 }}
                onClick={() => {
                  triggerHaptic('success');
                  onApplyModifiers(option.modifiers, option.text, 'choice', { optionIndex: index });
                }}
                className="sketchbook-border paper-interact"
                style={{
                  background: colors.bg,
                  border: `3.5px solid ${colors.border}`,
                  borderBottom: `9.5px solid ${colors.shadow}`,
                  padding: isMobile ? '16px 18px' : '18px 24px',
                  fontFamily: 'var(--font-main)',
                  color: colors.text,
                  fontSize: isMobile ? '1.1rem' : '1.15rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  lineHeight: 1.4,
                  borderRadius: '24px',
                  fontWeight: 'bold',
                  boxShadow: `0 6px 0 ${colors.shadow}20`
                }}
              >
                {t.quiz.questions[question.id]?.options?.[index] || option.text}
              </motion.button>
            );
          })}
          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
        </div>
      )}

      {question.type === 'guess' && (
        <fieldset style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center', border: '0', padding: 0, margin: 0 }}>
          <legend style={{ display: 'none' }}>{question.text}</legend>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '18px', width: '100%', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('success');
                onApplyModifiers(question.leftModifiers, question.leftLabel, 'guess', {
                  optionIndex: 0,
                  pairKey: question.pairKey,
                  pairSlot: question.pairSlot,
                  pairValue: -1,
                });
              }}
              className="sketchbook-border paper-interact"
              style={{ minWidth: '120px', minHeight: '48px', fontSize: '1.2rem', borderRadius: '16px', border: '3px solid #cbd5e1', background: '#f8fafc', color: '#1e293b', fontWeight: 'bold', cursor: 'pointer', padding: '14px 18px' }}
            >
              {t.quiz.questions[question.id]?.leftLabel || question.leftLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('success');
                onApplyModifiers(question.rightModifiers, question.rightLabel, 'guess', {
                  optionIndex: 1,
                  pairKey: question.pairKey,
                  pairSlot: question.pairSlot,
                  pairValue: 1,
                });
              }}
              className="sketchbook-border paper-interact"
              style={{ minWidth: '120px', minHeight: '48px', fontSize: '1.2rem', borderRadius: '16px', border: '3px solid #cbd5e1', background: '#f8fafc', color: '#1e293b', fontWeight: 'bold', cursor: 'pointer', padding: '14px 18px' }}
            >
              {t.quiz.questions[question.id]?.rightLabel || question.rightLabel}
            </button>
          </div>
          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
        </fieldset>
      )}

      {question.type === 'flip' && (
        <fieldset style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center', border: '0', padding: 0, margin: 0 }}>
          <legend style={{ display: 'none' }}>{question.text}</legend>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ ...instructionStyle(isMobile), marginTop: 0, textAlign: 'left', flex: 1 }}>
              {memoryState.phase === 'preview'
                ? (question.previewLabel || localizedQuestion.previewLabel || getQuestionInstruction(question))
                : (question.playLabel || localizedQuestion.playLabel || getQuestionInstruction(question))}
            </div>
            <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '7px solid #60a5fa', color: '#1d4ed8', borderRadius: '18px', padding: '8px 14px', fontFamily: 'var(--font-main)', fontWeight: 'bold', minWidth: '106px', textAlign: 'center' }}>
              {(question.timerLabel || localizedQuestion.timerLabel || 'Time')}: {formatElapsedTime(memoryState.completedMs ?? memoryState.elapsedMs)}
            </div>
          </div>
          <div style={{ width: '100%', maxWidth: isMobile ? '640px' : '820px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))', gap: isMobile ? '10px' : '14px' }}>
            {memoryDeck.map((card, index) => {
              const isMatched = memoryState.matchedPairIds.includes(card.pairId);
              const isFaceUp = memoryState.phase === 'preview' || isMatched || memoryState.flippedIds.includes(card.id) || memoryState.phase === 'complete';
              const cardColors = card.colors || MEMORY_FALLBACK_COLORS[index % MEMORY_FALLBACK_COLORS.length];
              return (
                <motion.button
                  key={card.id}
                  type="button"
                  disabled={memoryState.phase === 'preview' || isMatched}
                  onClick={() => handleMemoryFlip(card.id)}
                  className="paper-interact"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: isMatched ? 0.95 : 1,
                    y: 0,
                    transition: { delay: index * 0.02 }
                  }}
                  whileHover={{ scale: isMatched ? 0.95 : 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    position: 'relative',
                    aspectRatio: isMobile ? '0.85' : '0.9',
                    borderRadius: '16px',
                    padding: 0,
                    cursor: memoryState.phase === 'play' && !isMatched ? 'pointer' : 'default',
                    background: 'none',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                >
                  <motion.div
                    animate={{
                      scale: isFaceUp ? 1 : 0.985,
                      y: isMatched ? -2 : 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 20,
                      mass: 0.8,
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    {isFaceUp ? (
                      <motion.div
                        key="front"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="sketchbook-border"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: cardColors.bg,
                          border: `3px solid ${cardColors.border}`,
                          borderBottom: `7px solid ${cardColors.border}`,
                          borderRadius: '16px',
                          padding: isMobile ? '4px' : '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          justifyContent: 'flex-end',
                          boxShadow: isMatched ? `0 10px 24px ${cardColors.border}40` : '0 8px 16px rgba(0,0,0,0.08)',
                        }}
                      >
                        {card.src ? (
                          <img src={card.src} alt={card.name} style={{ position: 'absolute', inset: isMobile ? '4px 4px 22px 4px' : '8px 8px 38px 8px', width: isMobile ? 'calc(100% - 8px)' : 'calc(100% - 16px)', height: isMobile ? 'calc(100% - 26px)' : 'calc(100% - 46px)', objectFit: 'cover', borderRadius: '12px', border: `2px solid ${cardColors.border}`, background: '#f8fafc' }} />
                        ) : (
                          <div style={{ position: 'absolute', inset: isMobile ? '4px 4px 22px 4px' : '8px 8px 38px 8px', borderRadius: '12px', border: `2px solid ${cardColors.border}`, background: '#f1f5f9', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-hand)', color: cardColors.text, fontSize: isMobile ? '0.85rem' : '1.1rem' }}>
                            {card.name}
                          </div>
                        )}
                        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', borderRadius: '8px', padding: isMobile ? '2px 4px' : '4px 6px', fontFamily: 'var(--font-main)', fontWeight: 'bold', color: cardColors.text, fontSize: isMobile ? '0.78rem' : '0.92rem', textAlign: 'center', textShadow: '0 1px 1px rgba(255,255,255,0.7)' }}>
                          {card.name}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="sketchbook-border"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: '#f8fafc',
                          border: '3px solid #cbd5e1',
                          borderBottom: '7px solid #94a3b8',
                          borderRadius: '16px',
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ width: '100%', height: '100%', borderRadius: '16px', display: 'grid', placeItems: 'center', background: '#eff6ff' }}>
                          <div style={{ width: '40%', height: '40%', border: '2.5px dashed #60a5fa', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#1d4ed8', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1.2rem' : '1.4rem', opacity: 0.6 }}>?</div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
          {memoryState.modalOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', marginTop: '6px' }}>
              <div className="sketchbook-border" style={{ background: '#fff7ed', border: '3.5px solid #fdba74', borderBottom: '9px solid #f97316', borderRadius: '24px', padding: isMobile ? '18px 16px' : '22px 20px', boxShadow: '0 10px 26px rgba(249, 115, 22, 0.15)' }}>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1.45rem' : '1.7rem', color: '#9a3412', textAlign: 'center', marginBottom: '10px' }}>
                  {(question.completedLabel || localizedQuestion.completedLabel || 'Completed in')} {formatElapsedTime(memoryState.completedMs)}
                </div>
                <div style={{ fontFamily: 'var(--font-main)', color: '#7c2d12', textAlign: 'center', fontWeight: 'bold', marginBottom: '14px' }}>
                  {memoryState.completedMs <= (question.fastThresholdMs || 24000)
                    ? (question.fastResultLabel || localizedQuestion.fastResultLabel)
                    : memoryState.completedMs <= (question.steadyThresholdMs || 40000)
                      ? (question.steadyResultLabel || localizedQuestion.steadyResultLabel)
                      : (question.slowResultLabel || localizedQuestion.slowResultLabel)}
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
                  <button
                    type="button"
                    onClick={submitMemoryResult}
                    className="sketchbook-border paper-interact"
                    style={{ background: '#f97316', color: '#fff', border: '3px solid #ea580c', borderBottom: '7px solid #c2410c', borderRadius: '18px', padding: '12px 18px', fontFamily: 'var(--font-main)', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {toMysteryLabelCase(t.quiz.btns.next)}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </fieldset>
      )}

      {question.type === 'yesno' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '16px', width: '100%', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.06, rotate: -1.5, y: -4 }}
              whileTap={{ scale: 0.9, y: 12 }}
              onClick={() => {
                triggerHaptic('success');
                onApplyModifiers(question.yesModifiers, `${question.text} -> yes`, 'yesno', {
                  optionIndex: 0,
                  pairKey: question.pairKey,
                  pairSlot: question.pairSlot,
                  pairValue: question.pairReverse ? -1 : 1,
                });
              }}
              className="sketchbook-border paper-interact"
              style={{ background: '#ecfdf5', border: '3.5px solid #10b981', borderBottom: '9.5px solid #059669', color: '#064e3b', padding: isMobile ? '16px 20px' : '18px 36px', fontFamily: 'var(--font-main)', fontSize: isMobile ? '1.2rem' : '1.35rem', cursor: 'pointer', flex: 1, borderRadius: '24px', fontWeight: 'bold', boxShadow: '0 8px 0 rgba(16, 185, 129, 0.1)' }}
            >
              {toMysteryLabelCase(t.quiz.btns.true)}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06, rotate: 1.5, y: -4 }}
              whileTap={{ scale: 0.9, y: 12 }}
              onClick={() => {
                triggerHaptic('success');
                onApplyModifiers(question.noModifiers, `${question.text} -> no`, 'yesno', {
                  optionIndex: 1,
                  pairKey: question.pairKey,
                  pairSlot: question.pairSlot,
                  pairValue: question.pairReverse ? 1 : -1,
                });
              }}
              className="sketchbook-border paper-interact"
              style={{ background: '#fff1f2', border: '3.5px solid #f43f5e', borderBottom: '9.5px solid #e11d48', color: '#881337', padding: isMobile ? '16px 20px' : '18px 36px', fontFamily: 'var(--font-main)', fontSize: isMobile ? '1.2rem' : '1.35rem', cursor: 'pointer', flex: 1, borderRadius: '24px', fontWeight: 'bold', boxShadow: '0 8px 0 rgba(244, 63, 94, 0.1)' }}
            >
              {toMysteryLabelCase(t.quiz.btns.false)}
            </motion.button>
          </div>
          <div style={{ ...instructionStyle(isMobile), width: '100%' }}>{getQuestionInstruction(question)}</div>
        </div>
      )}

      {question.type === 'duel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '14px', width: '100%' }}>
            <motion.button
              whileHover={{ scale: 1.04, x: isMobile ? 0 : -8, y: -2 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => {
                triggerHaptic('success');
                onApplyModifiers(question.left.modifiers, question.left.text, 'duel', { optionIndex: 0 });
              }}
              className="sketchbook-border paper-interact"
              style={{
                flex: 1,
                background: '#eff6ff',
                border: '3.5px solid #93c5fd',
                borderBottom: '9.5px solid #3b82f6',
                padding: isMobile ? '16px 18px' : '20px 24px',
                fontFamily: 'var(--font-main)',
                color: '#1e40af',
                fontSize: '1.05rem',
                lineHeight: 1.35,
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: '24px',
                fontWeight: 'bold',
                boxShadow: '0 6px 0 rgba(37, 99, 235, 0.1)'
              }}
            >
              {t.quiz.questions[question.id]?.left || question.left.text}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, x: isMobile ? 0 : 8, y: -2 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => {
                triggerHaptic('success');
                onApplyModifiers(question.right.modifiers, question.right.text, 'duel', { optionIndex: 1 });
              }}
              className="sketchbook-border paper-interact"
              style={{
                flex: 1,
                background: '#fff1f2',
                border: '3.5px solid #fca5a5',
                borderBottom: '9.5px solid #f43f5e',
                padding: isMobile ? '16px 18px' : '20px 24px',
                fontFamily: 'var(--font-main)',
                color: '#9d174d',
                fontSize: '1.05rem',
                lineHeight: 1.35,
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: '24px',
                fontWeight: 'bold',
                boxShadow: '0 6px 0 rgba(244, 63, 94, 0.1)'
              }}
            >
              {t.quiz.questions[question.id]?.right || question.right.text}
            </motion.button>
          </div>
          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
        </div>
      )}

      {question.type === 'multi' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {question.options.map((option, index) => {
            const selected = multiSelection.includes(index);

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, x: isMobile ? 0 : 6, y: -2 }}
                whileTap={{ scale: 0.95, y: 8 }}
                onClick={() => {
                  triggerHaptic('selection');
                  setMultiSelection((previous) => {
                    const maxSelect = question.maxSelect || 2;

                    if (previous.includes(index)) {
                      return previous.filter((value) => value !== index);
                    }

                    if (previous.length >= maxSelect) {
                      return [...previous.slice(1), index];
                    }

                    return [...previous, index];
                  });
                }}
                className="sketchbook-border paper-interact"
                style={{
                  background: selected ? '#eff6ff' : '#ffffff',
                  border: `3.5px solid ${selected ? '#3b82f6' : '#cbd5e1'}`,
                  borderBottom: `9.5px solid ${selected ? '#2563eb' : '#94a3b8'}`,
                  padding: isMobile ? '14px 16px' : '16px 20px',
                  fontFamily: 'var(--font-main)',
                  color: selected ? '#1e40af' : '#334155',
                  fontSize: '1.05rem',
                  lineHeight: 1.35,
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '24px',
                  fontWeight: 'bold',
                  boxShadow: selected ? '0 4px 12px rgba(37, 99, 235, 0.1)' : '0 4px 0 rgba(0,0,0,0.02)'
                }}
              >
                {selected ? '\u2713 ' : ''}{t.quiz.questions[question.id]?.options?.[index] || option.text}
              </motion.button>
            );
          })}
          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitMulti(question)}
              disabled={!multiSelection.length}
              className="sketchbook-border paper-interact"
              style={{
                background: multiSelection.length ? '#3b82f6' : '#94a3b8',
                color: 'white',
                border: '3.5px solid #2563eb',
                borderBottom: '9.5px solid #1d4ed8',
                opacity: multiSelection.length ? 1 : 0.6,
                padding: isMobile ? '12px 32px' : '14px 48px',
                fontFamily: 'var(--font-main)',
                fontSize: '1.15rem',
                cursor: multiSelection.length ? 'pointer' : 'not-allowed',
                borderRadius: '24px',
                fontWeight: 'bold',
                boxShadow: multiSelection.length ? '0 10px 24px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}

      {question.type === 'rank2' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {question.options.map((option, index) => {
            const rankPosition = rankSelection.indexOf(index);
            const selected = rankPosition !== -1;
            const palette = rankPosition === 0
              ? { bg: '#ecfdf5', border: '#34d399', shadow: '#059669', badgeBg: '#d1fae5', badgeBorder: '#10b981', badgeText: '#065f46' }
              : rankPosition === 1
                ? { bg: '#fff7ed', border: '#fb923c', shadow: '#ea580c', badgeBg: '#ffedd5', badgeBorder: '#f97316', badgeText: '#9a3412' }
                : { bg: '#ffffff', border: '#cbd5e1', shadow: '#94a3b8', badgeBg: '#f8fafc', badgeBorder: '#cbd5e1', badgeText: '#94a3b8' };

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
                whileTap={{ scale: 0.94, y: 8 }}
                onClick={() => {
                  triggerHaptic('selection');
                  setRankSelection((previous) => {
                    if (previous.includes(index)) {
                      return previous.filter((value) => value !== index);
                    }

                    if (previous.length >= 2) {
                      return [...previous.slice(1), index];
                    }

                    return [...previous, index];
                  });
                }}
                className="sketchbook-border paper-interact"
                style={{
                  background: palette.bg,
                  border: `3.5px solid ${palette.border}`,
                  borderBottom: `9.5px solid ${palette.shadow}`,
                  padding: isMobile ? '14px 16px' : '18px 20px',
                  fontFamily: 'var(--font-main)',
                  color: '#1e293b',
                  fontSize: '1.05rem',
                  lineHeight: 1.35,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderRadius: '24px',
                  fontWeight: 'bold',
                  boxShadow: `0 6px 0 ${palette.shadow}15`
                }}
              >
                <span style={{ minWidth: '28px', height: '28px', borderRadius: '12px', border: `3px solid ${palette.badgeBorder}`, background: palette.badgeBg, color: palette.badgeText, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontFamily: 'var(--font-main)', fontWeight: 'bold', boxShadow: '0 2px 0 rgba(0,0,0,0.05)' }}>
                  {selected ? rankPosition + 1 : ''}
                </span>
                {t.quiz.questions[question.id]?.options?.[index] || option.text}
              </motion.button>
            );
          })}
          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitRank(question)}
              disabled={rankSelection.length < 2}
              className="sketchbook-border paper-interact"
              style={{
                background: rankSelection.length >= 2 ? '#7c3aed' : '#94a3b8',
                color: 'white',
                border: '3.5px solid #6d28d9',
                borderBottom: '9.5px solid #5b21b6',
                opacity: rankSelection.length >= 2 ? 1 : 0.6,
                padding: isMobile ? '12px 32px' : '14px 48px',
                fontFamily: 'var(--font-main)',
                fontSize: '1.15rem',
                cursor: rankSelection.length >= 2 ? 'pointer' : 'not-allowed',
                borderRadius: '24px',
                fontWeight: 'bold',
                boxShadow: rankSelection.length >= 2 ? '0 10px 24px rgba(124, 58, 237, 0.3)' : 'none'
              }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}

      {question.type === 'ipsative' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(question.options || []).map((option, index) => {
            const isMost = ipsativeMost === index;
            const isLeast = ipsativeLeast === index;

            return (
              <div key={index} className="sketchbook-border" style={{ background: '#ffffff', border: `3.5px solid ${isMost ? '#10b981' : isLeast ? '#f43f5e' : '#cbd5e1'}`, borderBottom: `9.5px solid ${isMost ? '#059669' : isLeast ? '#e11d48' : '#94a3b8'}`, borderRadius: '24px', padding: isMobile ? '14px 16px' : '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 6px 0 rgba(0,0,0,0.02)' }}>
                <div style={{ fontFamily: 'var(--font-main)', color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.35, fontWeight: 'bold' }}>
                  {t.quiz.questions[question.id]?.options?.[index] || option.text}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.9, y: 8 }}
                    onClick={() => {
                      triggerHaptic('selection');
                      setIpsativeMost((previous) => (previous === index ? null : index));
                      if (ipsativeLeast === index) {
                        setIpsativeLeast(null);
                      }
                    }}
                    className="sketchbook-border paper-interact"
                    style={{ flex: 1, background: isMost ? '#ecfdf5' : '#f8fafc', border: `3px solid ${isMost ? '#10b981' : '#cbd5e1'}`, borderBottom: `7px solid ${isMost ? '#059669' : '#94a3b8'}`, color: isMost ? '#065f46' : '#64748b', fontFamily: 'var(--font-main)', fontSize: '0.95rem', padding: '10px 12px', cursor: 'pointer', borderRadius: '16px', fontWeight: 'bold' }}
                  >
                    {toMysteryLabelCase(t.quiz.btns.mostLikeMe)}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.9, y: 8 }}
                    onClick={() => {
                      triggerHaptic('selection');
                      setIpsativeLeast((previous) => (previous === index ? null : index));
                      if (ipsativeMost === index) {
                        setIpsativeMost(null);
                      }
                    }}
                    className="sketchbook-border paper-interact"
                    style={{ flex: 1, background: isLeast ? '#fff1f2' : '#f8fafc', border: `3px solid ${isLeast ? '#f43f5e' : '#cbd5e1'}`, borderBottom: `7px solid ${isLeast ? '#e11d48' : '#94a3b8'}`, color: isLeast ? '#9d174d' : '#64748b', fontFamily: 'var(--font-main)', fontSize: '0.95rem', padding: '10px 12px', cursor: 'pointer', borderRadius: '16px', fontWeight: 'bold' }}
                  >
                    {toMysteryLabelCase(t.quiz.btns.leastLikeMe)}
                  </motion.button>
                </div>
              </div>
            );
          })}
          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitIpsative(question)}
              disabled={ipsativeMost == null || ipsativeLeast == null || ipsativeMost === ipsativeLeast}
              className="sketchbook-border paper-interact"
              style={{
                background: (ipsativeMost != null && ipsativeLeast != null && ipsativeMost !== ipsativeLeast) ? '#0ea5e9' : '#94a3b8',
                color: 'white',
                border: '3.5px solid #0284c7',
                borderBottom: '9.5px solid #0369a1',
                opacity: (ipsativeMost != null && ipsativeLeast != null && ipsativeMost !== ipsativeLeast) ? 1 : 0.6,
                padding: isMobile ? '12px 32px' : '14px 48px',
                fontFamily: 'var(--font-main)',
                fontSize: '1.15rem',
                cursor: (ipsativeMost != null && ipsativeLeast != null && ipsativeMost !== ipsativeLeast) ? 'pointer' : 'not-allowed',
                borderRadius: '24px',
                fontWeight: 'bold',
                boxShadow: (ipsativeMost != null && ipsativeLeast != null && ipsativeMost !== ipsativeLeast) ? '0 10px 24px rgba(14, 165, 233, 0.3)' : 'none'
              }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}

      {question.type === 'spectrum' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <DotSlider
            isMobile={isMobile}
            value={spectrumValue}
            onChange={setSpectrumValue}
            leftLabel={t.quiz.questions[question.id]?.leftLabel || question.leftLabel}
            rightLabel={t.quiz.questions[question.id]?.rightLabel || question.rightLabel}
          />
          <div style={{ fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: '0.95rem' }}>
            {spectrumValue === 3
              ? toMysteryLabelCase(t.quiz.intense.moderately)
              : spectrumValue < 3
                ? `${3 - spectrumValue} ${t.quiz.of} ${t.quiz.questions[question.id]?.leftLabel || question.leftLabel}`
                : `${spectrumValue - 3} ${t.quiz.of} ${t.quiz.questions[question.id]?.rightLabel || question.rightLabel}`}
          </div>
          <div style={{ marginTop: '-4px', ...instructionStyle(isMobile) }}>{getQuestionInstruction(question)}</div>
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.92, y: 10 }}
            onClick={() => onSubmitSpectrum(question)}
            className="sketchbook-border paper-interact"
            style={{ background: '#0ea5e9', color: 'white', border: '3.5px solid #0284c7', borderBottom: '9.5px solid #0369a1', padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: '1.15rem', cursor: 'pointer', borderRadius: '24px', fontWeight: 'bold', boxShadow: '0 10px 24px rgba(14, 165, 233, 0.3)' }}
          >
            {toMysteryLabelCase(t.quiz.btns.continue)}
          </motion.button>
        </div>
      )}

      {question.type === 'allocation' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(question.options || []).map((option, index) => {
            const points = allocationPoints[index] || 0;

            return (
              <div key={index} className="sketchbook-border" style={{ background: '#ffffff', border: '3.5px solid #cbd5e1', borderBottom: '7px solid #94a3b8', borderRadius: '20px', padding: isMobile ? '14px 16px' : '16px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '14px', alignItems: 'center', boxShadow: '0 4px 0 rgba(0,0,0,0.02)' }}>
                <div style={{ fontFamily: 'var(--font-main)', color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.35, fontWeight: 'bold' }}>
                  {t.quiz.questions[question.id]?.options?.[index] || option.text}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9, y: 4 }}
                    onClick={() => onAdjustAllocation(question, index, -1)}
                    className="sketchbook-border paper-interact"
                    style={{ background: '#f8fafc', border: '3px solid #cbd5e1', borderBottom: '6px solid #94a3b8', width: '36px', height: '36px', fontFamily: 'var(--font-main)', cursor: 'pointer', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', color: '#64748b' }}
                  >
                    -
                  </motion.button>
                  <div style={{ minWidth: '32px', textAlign: 'center', fontFamily: 'var(--font-main)', color: '#1e40af', fontSize: '1.2rem', fontWeight: 'bold' }}>{points}</div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9, y: 4 }}
                    onClick={() => onAdjustAllocation(question, index, 1)}
                    className="sketchbook-border paper-interact"
                    style={{ background: '#eff6ff', border: '3px solid #3b82f6', borderBottom: '6px solid #2563eb', width: '36px', height: '36px', fontFamily: 'var(--font-main)', cursor: 'pointer', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}
                  >
                    +
                  </motion.button>
                </div>
              </div>
            );
          })}
          <div style={{ fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: '0.95rem', textAlign: 'center' }}>
            {toMysteryLabelCase(t.quiz.pointsUsed)}: {totalAllocated} / {allocationBudget}
          </div>
          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitAllocation(question)}
              disabled={totalAllocated !== allocationBudget}
              className="sketchbook-border paper-interact"
              style={{
                background: totalAllocated === allocationBudget ? '#3b82f6' : '#94a3b8',
                color: 'white',
                border: '3.5px solid #2563eb',
                borderBottom: '9.5px solid #1d4ed8',
                opacity: totalAllocated === allocationBudget ? 1 : 0.6,
                padding: isMobile ? '12px 32px' : '14px 48px',
                fontFamily: 'var(--font-main)',
                fontSize: '1.2rem',
                cursor: totalAllocated === allocationBudget ? 'pointer' : 'not-allowed',
                borderRadius: '24px',
                fontWeight: 'bold',
                boxShadow: totalAllocated === allocationBudget ? '0 10px 24px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}

      {question.type === 'drift' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gap: '10px' }}>
            {(question.options || []).map((option, index) => {
              const order = driftSelection.indexOf(index);
              const selected = order !== -1;

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
                  whileTap={{ scale: 0.95, y: 8 }}
                  onClick={() => {
                    triggerHaptic('selection');
                    setDriftSelection((previous) => {
                      if (previous.includes(index)) {
                        return previous.filter((value) => value !== index);
                      }

                      if (previous.length >= driftTarget) {
                        return [...previous.slice(1), index];
                      }

                      return [...previous, index];
                    });
                  }}
                  className="sketchbook-border paper-interact"
                  style={{ background: selected ? '#ecfeff' : '#ffffff', border: `3.5px solid ${selected ? '#06b6d4' : '#cbd5e1'}`, borderBottom: `9.5px solid ${selected ? '#0891b2' : '#94a3b8'}`, padding: isMobile ? '14px 16px' : '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', alignItems: 'center', borderRadius: '24px', cursor: 'pointer', boxShadow: selected ? '0 8px 18px rgba(6, 182, 212, 0.18)' : '0 4px 0 rgba(0,0,0,0.02)' }}
                >
                  <span style={{ width: '30px', height: '30px', borderRadius: '12px', border: `3px solid ${selected ? '#06b6d4' : '#cbd5e1'}`, background: selected ? '#cffafe' : '#f8fafc', color: selected ? '#155e75' : '#94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.95rem', lineHeight: 1, fontWeight: '400' }}>
                    {selected ? order + 1 : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--font-main)', color: selected ? '#155e75' : '#1e293b', fontSize: '1.02rem', lineHeight: 1.35, fontWeight: 'bold', textAlign: 'left' }}>
                    {t.quiz.questions[question.id]?.options?.[index] || option.text}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            {[...Array(driftTarget)].map((_, slot) => {
              const selectedIndex = driftSelection[slot];
              const slotLabel = selectedIndex != null
                ? (t.quiz.questions[question.id]?.options?.[selectedIndex] || question.options?.[selectedIndex]?.text)
                : '...';

              return (
                <div key={`drift-slot-${slot}`} className="sketchbook-border" style={{ background: '#f8fafc', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', borderRadius: '18px', padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '999px', background: '#e2e8f0', color: '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.8rem', lineHeight: 1, fontWeight: '400' }}>
                    {slot + 1}
                  </span>
                  <span style={{ fontFamily: 'var(--font-main)', color: '#475569', fontSize: '0.88rem', lineHeight: 1.2, fontWeight: '700' }}>
                    {slotLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitDrift(question)}
              disabled={driftSelection.length < driftTarget}
              className="sketchbook-border paper-interact"
              style={{
                background: driftSelection.length >= driftTarget ? '#06b6d4' : '#94a3b8',
                color: 'white',
                border: '3.5px solid #0891b2',
                borderBottom: '9.5px solid #0e7490',
                opacity: driftSelection.length >= driftTarget ? 1 : 0.6,
                padding: isMobile ? '12px 32px' : '14px 48px',
                fontFamily: 'var(--font-main)',
                fontSize: '1.15rem',
                cursor: driftSelection.length >= driftTarget ? 'pointer' : 'not-allowed',
                borderRadius: '24px',
                fontWeight: 'bold',
                boxShadow: driftSelection.length >= driftTarget ? '0 10px 24px rgba(6, 182, 212, 0.3)' : 'none'
              }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}


      {question.type === 'grid' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px', color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.9rem', lineHeight: 1, fontWeight: '400' }}>
              <span>{question.xLeftLabel}</span>
              <span>{question.xRightLabel}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'stretch' }}>
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px', alignItems: 'center', justifyItems: 'center', color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.88rem', lineHeight: 1, fontWeight: '400' }}>
                <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{question.yTopLabel}</span>
                <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{question.yBottomLabel}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(question.options || []).map((option, index) => {
                  const palette = CHOICE_COLORS[index % CHOICE_COLORS.length];
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.95, y: 8 }}
                      onClick={() => {
                        triggerHaptic('success');
                        onApplyModifiers(option.modifiers, option.text, 'grid', { optionIndex: index });
                      }}
                      className="sketchbook-border paper-interact"
                      style={{ background: palette.bg, border: `3.5px solid ${palette.border}`, borderBottom: `9.5px solid ${palette.shadow}`, padding: isMobile ? '16px 14px' : '18px 16px', minHeight: isMobile ? '108px' : '118px', fontFamily: 'var(--font-main)', color: palette.text, fontSize: isMobile ? '0.98rem' : '1.02rem', lineHeight: 1.28, textAlign: 'left', cursor: 'pointer', borderRadius: '24px', fontWeight: 'bold', boxShadow: `0 6px 0 ${palette.shadow}18` }}
                    >
                      {t.quiz.questions[question.id]?.options?.[index] || option.text}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
        </div>
      )}

      {question.type === 'sort4' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gap: '10px' }}>
            {(question.options || []).map((option, index) => {
              const order = sortSelection.indexOf(index);
              const selected = order !== -1;
              const palette = selected
                ? { bg: '#eff6ff', border: '#60a5fa', bottom: '#2563eb', text: '#1d4ed8' }
                : { bg: '#ffffff', border: '#cbd5e1', bottom: '#94a3b8', text: '#1e293b' };

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
                  whileTap={{ scale: 0.95, y: 8 }}
                  onClick={() => {
                    triggerHaptic('selection');
                    setSortSelection((previous) => {
                      if (previous.includes(index)) {
                        return previous.filter((value) => value !== index);
                      }

                      if (previous.length >= sortTarget) {
                        return [...previous.slice(1), index];
                      }

                      return [...previous, index];
                    });
                  }}
                  className="sketchbook-border paper-interact"
                  style={{ background: palette.bg, border: `3.5px solid ${palette.border}`, borderBottom: `9.5px solid ${palette.bottom}`, padding: isMobile ? '14px 16px' : '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', alignItems: 'center', borderRadius: '24px', cursor: 'pointer', boxShadow: selected ? '0 8px 18px rgba(37, 99, 235, 0.16)' : '0 4px 0 rgba(0,0,0,0.02)' }}
                >
                  <span style={{ width: '32px', height: '32px', borderRadius: '12px', border: `3px solid ${selected ? '#60a5fa' : '#cbd5e1'}`, background: selected ? '#dbeafe' : '#f8fafc', color: selected ? '#1d4ed8' : '#94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.95rem', lineHeight: 1, fontWeight: '400' }}>
                    {selected ? order + 1 : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--font-main)', color: palette.text, fontSize: '1.02rem', lineHeight: 1.3, fontWeight: 'bold', textAlign: 'left' }}>
                    {t.quiz.questions[question.id]?.options?.[index] || option.text}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}>
            {[...Array(sortTarget)].map((_, slot) => {
              const selectedIndex = sortSelection[slot];
              const slotLabel = selectedIndex != null
                ? (t.quiz.questions[question.id]?.options?.[selectedIndex] || question.options?.[selectedIndex]?.text)
                : '...';
              const slotTitle = slot === 0
                ? toMysteryLabelCase(t.quiz.btns.mostLikeMe)
                : slot === (sortTarget - 1)
                  ? toMysteryLabelCase(t.quiz.btns.leastLikeMe)
                  : `#${slot + 1}`;

              return (
                <div key={`sort-slot-${slot}`} className="sketchbook-border" style={{ flex: '1 1 120px', background: '#f8fafc', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
                  <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{slotTitle}</span>
                  <span style={{ color: '#334155', fontFamily: 'var(--font-main)', fontSize: '0.86rem', lineHeight: 1.2, fontWeight: '700' }}>{slotLabel}</span>
                </div>
              );
            })}
          </div>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitSort4(question)}
              disabled={sortSelection.length < sortTarget}
              className="sketchbook-border paper-interact"
              style={{ background: sortSelection.length >= sortTarget ? '#3b82f6' : '#94a3b8', color: 'white', border: '3.5px solid #2563eb', borderBottom: '9.5px solid #1d4ed8', opacity: sortSelection.length >= sortTarget ? 1 : 0.6, padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: '1.15rem', cursor: sortSelection.length >= sortTarget ? 'pointer' : 'not-allowed', borderRadius: '24px', fontWeight: 'bold', boxShadow: sortSelection.length >= sortTarget ? '0 10px 24px rgba(59, 130, 246, 0.3)' : 'none' }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}

      {question.type === 'pairMatch' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
            {(question.options || []).map((option, index) => {
              const selected = pairMatchSelection.includes(index);
              const order = pairMatchSelection.indexOf(index);
              const palette = selected
                ? { bg: '#eff6ff', border: '#60a5fa', bottom: '#2563eb', text: '#1d4ed8' }
                : { bg: '#ffffff', border: '#cbd5e1', bottom: '#94a3b8', text: '#334155' };

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.95, y: 8 }}
                  onClick={() => {
                    triggerHaptic('selection');
                    setPairMatchSelection((previous) => {
                      if (previous.includes(index)) {
                        return previous.filter((value) => value !== index);
                      }

                      if (previous.length >= pairTarget) {
                        return [...previous.slice(1), index];
                      }

                      return [...previous, index];
                    });
                  }}
                  className="sketchbook-border paper-interact"
                  style={{ background: palette.bg, border: `3.5px solid ${palette.border}`, borderBottom: `9.5px solid ${palette.bottom}`, padding: isMobile ? '14px 12px' : '16px 14px', minHeight: isMobile ? '102px' : '114px', display: 'grid', gap: '10px', alignContent: 'space-between', textAlign: 'left', borderRadius: '24px', cursor: 'pointer', boxShadow: selected ? '0 8px 18px rgba(37, 99, 235, 0.16)' : '0 4px 0 rgba(0,0,0,0.02)' }}
                >
                  <span style={{ width: '30px', height: '30px', borderRadius: '12px', border: `3px solid ${selected ? '#60a5fa' : '#cbd5e1'}`, background: selected ? '#dbeafe' : '#f8fafc', color: selected ? '#1d4ed8' : '#94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400' }}>
                    {selected ? order + 1 : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--font-main)', color: palette.text, fontSize: isMobile ? '0.96rem' : '1rem', lineHeight: 1.28, fontWeight: 'bold' }}>
                    {t.quiz.questions[question.id]?.options?.[index] || option.text}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            {Array.from({ length: pairTarget }).map((_, slot) => {
              const selectedIndex = pairMatchSelection[slot];
              const slotLabel = selectedIndex != null
                ? (t.quiz.questions[question.id]?.options?.[selectedIndex] || question.options?.[selectedIndex]?.text)
                : '...';

              return (
                <div key={`pair-slot-${slot}`} className="sketchbook-border" style={{ background: '#f8fafc', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
                  <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>#{slot + 1}</span>
                  <span style={{ color: '#334155', fontFamily: 'var(--font-main)', fontSize: '0.86rem', lineHeight: 1.2, fontWeight: '700' }}>{slotLabel}</span>
                </div>
              );
            })}
          </div>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitPairMatch(question)}
              disabled={pairMatchSelection.length < pairTarget}
              className="sketchbook-border paper-interact"
              style={{ background: pairMatchSelection.length >= pairTarget ? '#3b82f6' : '#94a3b8', color: 'white', border: '3.5px solid #2563eb', borderBottom: '9.5px solid #1d4ed8', opacity: pairMatchSelection.length >= pairTarget ? 1 : 0.6, padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: '1.15rem', cursor: pairMatchSelection.length >= pairTarget ? 'pointer' : 'not-allowed', borderRadius: '24px', fontWeight: 'bold', boxShadow: pairMatchSelection.length >= pairTarget ? '0 10px 24px rgba(59, 130, 246, 0.3)' : 'none' }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}
      {question.type === 'hold' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%' }}>
            <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '7px solid #2563eb', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{localizedQuestion.lowLabel || question.lowLabel}</span>
              <span style={{ color: '#1e3a8a', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>{Math.round((1 - (holdLevel ?? 0)) * 100)}%</span>
            </div>
            <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3px solid #f9a8d4', borderBottom: '7px solid #db2777', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{localizedQuestion.highLabel || question.highLabel}</span>
              <span style={{ color: '#9d174d', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>{Math.round((holdLevel ?? 0) * 100)}%</span>
            </div>
          </div>

          <div className="sketchbook-border" style={{ width: '100%', background: '#f8fafc', border: '3.5px solid #cbd5e1', borderBottom: '9.5px solid #94a3b8', borderRadius: '28px', padding: isMobile ? '18px 16px' : '22px 18px', display: 'grid', gap: '14px' }}>
            <div style={{ width: '100%', height: isMobile ? '18px' : '20px', background: 'rgba(255,255,255,0.65)', borderRadius: '999px', border: '3px solid #cbd5e1', overflow: 'hidden' }}>
              <div style={{ width: `${Math.round((holdLevel ?? 0) * 100)}%`, height: '100%', background: '#60a5fa', transition: holdTimerRef.current ? 'none' : 'width 140ms ease' }} />
            </div>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97, y: 6 }}
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="sketchbook-border paper-interact"
              style={{ background: '#ffffff', border: '3.5px solid #94a3b8', borderBottom: '9.5px solid #64748b', color: '#334155', padding: isMobile ? '18px 20px' : '22px 26px', fontFamily: 'var(--font-main)', fontSize: isMobile ? '1.05rem' : '1.15rem', cursor: 'pointer', borderRadius: '24px', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(100, 116, 139, 0.16)' }}
            >
              {toMysteryLabelCase(t.quiz.interactionUi?.pressAndHold || 'Press and hold')}
            </motion.button>
          </div>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitHold(question)}
              disabled={(holdLevel ?? 0) <= 0}
              className="sketchbook-border paper-interact"
              style={{ background: (holdLevel ?? 0) > 0 ? '#3b82f6' : '#94a3b8', color: 'white', border: '3.5px solid #2563eb', borderBottom: '9.5px solid #1d4ed8', padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: '1.15rem', cursor: (holdLevel ?? 0) > 0 ? 'pointer' : 'not-allowed', borderRadius: '24px', fontWeight: 'bold', boxShadow: (holdLevel ?? 0) > 0 ? '0 10px 24px rgba(59, 130, 246, 0.3)' : 'none', opacity: (holdLevel ?? 0) > 0 ? 1 : 0.6 }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}

      {question.type === 'rhythm' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%' }}>
            <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '7px solid #2563eb', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{localizedQuestion.slowLabel || question.slowLabel} / {localizedQuestion.fastLabel || question.fastLabel}</span>
              <span style={{ color: '#1e3a8a', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
                {rhythmPattern.length >= 2 ? `${Math.round((rhythmPattern[rhythmPattern.length - 1] - rhythmPattern[0]) / Math.max(1, rhythmPattern.length - 1))} ${t.quiz.interactionUi?.averageMs || 'ms avg'}` : (t.quiz.interactionUi?.waiting || 'Waiting')}
              </span>
            </div>
            <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3px solid #f9a8d4', borderBottom: '7px solid #db2777', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{localizedQuestion.steadyLabel || question.steadyLabel} / {localizedQuestion.wildLabel || question.wildLabel}</span>
              <span style={{ color: '#9d174d', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
                {(t.quiz.interactionUi?.tapCount || '{count}/4 taps')
                  .replace('{count}', String(rhythmPattern.length))
                  .replace('{total}', '4')}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96, y: 6 }}
            onClick={tapRhythm}
            className="sketchbook-border paper-interact"
            style={{ width: '100%', minHeight: isMobile ? '170px' : '190px', background: '#f8fafc', border: '3.5px solid #cbd5e1', borderBottom: '9.5px solid #94a3b8', borderRadius: '30px', display: 'grid', alignContent: 'center', justifyItems: 'center', gap: '16px', cursor: 'pointer', padding: '18px' }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              {Array.from({ length: 4 }).map((_, index) => {
                const filled = index < rhythmPattern.length;
                return (
                  <span key={`rhythm-slot-${index}`} style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', borderRadius: '999px', background: filled ? '#7c3aed' : '#e2e8f0', border: `3px solid ${filled ? '#6d28d9' : '#cbd5e1'}`, boxShadow: filled ? '0 4px 10px rgba(124, 58, 237, 0.28)' : 'none' }} />
                );
              })}
            </div>
            <div style={{ fontFamily: 'var(--font-hand)', color: '#1e293b', fontSize: isMobile ? '1.45rem' : '1.7rem', lineHeight: 1.15, textAlign: 'center', fontWeight: 'bold' }}>
              {rhythmPattern.length >= 4 ? (t.quiz.interactionUi?.patternCaptured || 'Pattern captured') : (t.quiz.interactionUi?.tapYourPace || 'Tap your pace')}
            </div>
          </motion.button>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitRhythm(question)}
              disabled={rhythmPattern.length < 4}
              className="sketchbook-border paper-interact"
              style={{ background: rhythmPattern.length >= 4 ? '#7c3aed' : '#94a3b8', color: 'white', border: '3.5px solid #6d28d9', borderBottom: '9.5px solid #5b21b6', opacity: rhythmPattern.length >= 4 ? 1 : 0.6, padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: '1.15rem', cursor: rhythmPattern.length >= 4 ? 'pointer' : 'not-allowed', borderRadius: '24px', fontWeight: 'bold', boxShadow: rhythmPattern.length >= 4 ? '0 10px 24px rgba(124, 58, 237, 0.3)' : 'none' }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}

      {question.type === 'constellation' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 2fr' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
            {(question.options || []).map((option, index) => {
              const selected = constellationSelection.includes(index);
              const order = constellationSelection.indexOf(index);
              const palette = selected
                ? { bg: '#eff6ff', border: '#60a5fa', bottom: '#2563eb', text: '#1d4ed8' }
                : { bg: '#ffffff', border: '#cbd5e1', bottom: '#94a3b8', text: '#334155' };

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.95, y: 8 }}
                  onClick={() => {
                    triggerHaptic('selection');
                    setConstellationSelection((previous) => {
                      if (previous.includes(index)) {
                        return previous.filter((value) => value !== index);
                      }
                      if (previous.length >= constellationTarget) {
                        return [...previous.slice(1), index];
                      }
                      return [...previous, index];
                    });
                  }}
                  className="sketchbook-border paper-interact"
                  style={{ background: palette.bg, border: `3.5px solid ${palette.border}`, borderBottom: `9.5px solid ${palette.bottom}`, padding: isMobile ? '14px 12px' : '16px 14px', minHeight: isMobile ? '102px' : '114px', display: 'grid', gap: '10px', alignContent: 'space-between', textAlign: 'left', borderRadius: '24px', cursor: 'pointer', boxShadow: selected ? '0 8px 18px rgba(37, 99, 235, 0.16)' : '0 4px 0 rgba(0,0,0,0.02)' }}
                >
                  <span style={{ width: '30px', height: '30px', borderRadius: '12px', border: `3px solid ${selected ? '#60a5fa' : '#cbd5e1'}`, background: selected ? '#dbeafe' : '#f8fafc', color: selected ? '#1d4ed8' : '#94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400' }}>
                    {selected ? order + 1 : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--font-main)', color: palette.text, fontSize: isMobile ? '0.96rem' : '1rem', lineHeight: 1.28, fontWeight: 'bold' }}>
                    {t.quiz.questions[question.id]?.options?.[index] || option.text}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
            {Array.from({ length: constellationTarget }).map((_, slot) => {
              const selectedIndex = constellationSelection[slot];
              const slotLabel = selectedIndex != null
                ? (t.quiz.questions[question.id]?.options?.[selectedIndex] || question.options?.[selectedIndex]?.text)
                : '...';

              return (
                <div key={`constellation-slot-${slot}`} className="sketchbook-border" style={{ background: '#f8fafc', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
                  <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>#{slot + 1}</span>
                  <span style={{ color: '#334155', fontFamily: 'var(--font-main)', fontSize: '0.86rem', lineHeight: 1.2, fontWeight: '700' }}>{slotLabel}</span>
                </div>
              );
            })}
          </div>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitConstellation(question)}
              disabled={constellationSelection.length < constellationTarget}
              className="sketchbook-border paper-interact"
              style={{ background: constellationSelection.length >= constellationTarget ? '#7c3aed' : '#94a3b8', color: 'white', border: '3.5px solid #6d28d9', borderBottom: '9.5px solid #5b21b6', opacity: constellationSelection.length >= constellationTarget ? 1 : 0.6, padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: '1.15rem', cursor: constellationSelection.length >= constellationTarget ? 'pointer' : 'not-allowed', borderRadius: '24px', fontWeight: 'bold', boxShadow: constellationSelection.length >= constellationTarget ? '0 10px 24px rgba(124, 58, 237, 0.3)' : 'none' }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}
      {question.type === 'reaction' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%' }}>
            <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '7px solid #2563eb', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>
                {localizedQuestion.quickLabel || question.quickLabel}
              </span>
              <span style={{ color: '#1e3a8a', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
                {reactionState.latency != null ? `${Math.round(reactionState.latency)} ${t.quiz.interactionUi?.milliseconds || 'ms'}` : (t.quiz.interactionUi?.readyLabel || 'Ready')}
              </span>
              {reactionState.latency != null && (
                <span style={{ color: '#2563eb', fontFamily: 'var(--font-main)', fontSize: '0.82rem', fontWeight: 500 }}>
                  {reactionState.latency < 220 ? 'Lightning fast reflexes!' : reactionState.latency < 350 ? 'Great speed! Very sharp.' : reactionState.latency < 500 ? 'Pretty good!' : 'Reflexes recorded.'}
                </span>
              )}
            </div>
            <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3px solid #f9a8d4', borderBottom: '7px solid #db2777', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>
                {localizedQuestion.slowLabel || question.slowLabel}
              </span>
              <span style={{ color: '#9d174d', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
                {reactionState.falseStart ? (t.quiz.interactionUi?.tooEarly || 'Too early') : (localizedQuestion.steadyLabel || question.steadyLabel)}
              </span>
              {reactionState.latency != null && (
                <span style={{ color: '#be185d', fontFamily: 'var(--font-main)', fontSize: '0.82rem', fontWeight: 500 }}>
                  {reactionState.latency < 220 ? 'You reacted instantly!' : reactionState.latency < 350 ? 'Very quick response.' : reactionState.latency < 500 ? 'Measured speed.' : 'Tap recorded.'}
                </span>
              )}
            </div>
          </div>

          <motion.button
            whileHover={reactionState.phase !== 'done' ? { scale: 1.03, y: -2 } : {}}
            whileTap={reactionState.phase !== 'done' ? { scale: 0.96, y: 6 } : {}}
            onClick={
              reactionState.phase === 'idle'
                ? beginReaction
                : reactionState.phase === 'done'
                  ? null
                  : tapReaction
            }
            className="sketchbook-border paper-interact"
            style={{
              width: '100%',
              minHeight: isMobile ? '180px' : '200px',
              background:
                reactionState.phase === 'cue'
                  ? '#ecfdf5'
                  : reactionState.falseStart
                    ? '#fff1f2'
                    : '#f8fafc',
              border: `3.5px solid ${reactionState.phase === 'cue' ? '#34d399' : reactionState.falseStart ? '#fda4af' : '#cbd5e1'}`,
              borderBottom: `9.5px solid ${reactionState.phase === 'cue' ? '#059669' : reactionState.falseStart ? '#e11d48' : '#94a3b8'}`,
              borderRadius: '30px',
              display: 'grid',
              alignContent: 'center',
              justifyItems: 'center',
              gap: '16px',
              cursor: reactionState.phase === 'done' ? 'default' : 'pointer',
              padding: '18px',
              opacity: reactionState.phase === 'done' ? 0.92 : 1,
            }}
          >
            <div style={{ width: isMobile ? '58px' : '72px', height: isMobile ? '58px' : '72px', borderRadius: '999px', background: reactionState.phase === 'cue' ? '#10b981' : '#e2e8f0', border: `4px solid ${reactionState.phase === 'cue' ? '#047857' : '#94a3b8'}`, boxShadow: reactionState.phase === 'cue' ? '0 0 0 12px rgba(16, 185, 129, 0.14)' : 'none' }} />
            <div style={{ fontFamily: 'var(--font-hand)', color: '#1e293b', fontSize: isMobile ? '1.35rem' : '1.6rem', lineHeight: 1.15, textAlign: 'center', fontWeight: 'bold' }}>
              {reactionState.phase === 'idle' && (t.quiz.interactionUi?.startReaction || 'Start reflex test')}
              {reactionState.phase === 'arming' && (t.quiz.interactionUi?.waitForSignal || 'Wait for the signal')}
              {reactionState.phase === 'cue' && (t.quiz.interactionUi?.tapNow || 'Tap now')}
              {reactionState.phase === 'done' && reactionState.falseStart && (
                <>
                  {t.quiz.interactionUi?.tooEarly || 'Too early'}
                  <br />
                  <span style={{ color: '#64748b', fontSize: isMobile ? '1.05rem' : '1.13rem', fontWeight: 500 }}>
                    Reflexes recorded as too early. Focus captured.
                  </span>
                </>
              )}
              {reactionState.phase === 'done' && !reactionState.falseStart && reactionState.latency != null && `${Math.round(reactionState.latency)} ${t.quiz.interactionUi?.milliseconds || 'ms'}`}
              {reactionState.phase === 'done' && !reactionState.falseStart && (
                <>
                  <br />
                  <span style={{ color: '#64748b', fontSize: isMobile ? '1.05rem' : '1.13rem', fontWeight: 500 }}>
                    {reactionState.latency < 220 ? 'Unbelievable reflexes! You tapped almost instantly.' : reactionState.latency < 350 ? 'Very sharp! Your reaction is above average.' : reactionState.latency < 500 ? 'Good job!' : 'Results captured.'}
                  </span>
                </>
              )}
            </div>
          </motion.button>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitReaction(question, reactionState)}
              disabled={reactionState.phase !== 'done'}
              className="sketchbook-border paper-interact"
              style={{ background: reactionState.phase === 'done' ? '#0ea5e9' : '#94a3b8', color: 'white', border: '3.5px solid #0284c7', borderBottom: '9.5px solid #0369a1', opacity: reactionState.phase === 'done' ? 1 : 0.6, padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: '1.15rem', cursor: reactionState.phase === 'done' ? 'pointer' : 'not-allowed', borderRadius: '24px', fontWeight: 'bold', boxShadow: reactionState.phase === 'done' ? '0 10px 24px rgba(14, 165, 233, 0.3)' : 'none' }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}
      {question.type === 'timing' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%' }}>
            <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '7px solid #2563eb', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>
                {localizedQuestion.bullseyeLabel || question.bullseyeLabel}
              </span>
              <span style={{ color: '#1e3a8a', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
                {timingState.accuracy != null ? `${Math.round(timingState.accuracy * 100)}%` : (t.quiz.interactionUi?.targetLabel || 'Target')}
              </span>
              {timingState.accuracy != null && (
                <span style={{ color: '#2563eb', fontFamily: 'var(--font-main)', fontSize: '0.82rem', fontWeight: 500 }}>
                  {timingState.accuracy > 0.85 ? 'Perfect! Right in the zone.' : timingState.accuracy > 0.65 ? 'Very close! Just a bit off.' : 'You were a bit off the mark.'}
                </span>
              )}
            </div>
            <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3px solid #f9a8d4', borderBottom: '7px solid #db2777', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>
                {localizedQuestion.wideLabel || question.wideLabel}
              </span>
              <span style={{ color: '#9d174d', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
                {timingState.phase === 'running' ? (t.quiz.interactionUi?.inMotion || 'In motion') : (localizedQuestion.nearLabel || question.nearLabel)}
              </span>
              {timingState.accuracy != null && (
                <span style={{ color: '#be185d', fontFamily: 'var(--font-main)', fontSize: '0.82rem', fontWeight: 500 }}>
                  {timingState.accuracy < 0.35 ? 'The target is the goal.' : timingState.accuracy < 0.65 ? 'Almost there! Just a little more precision.' : 'Pretty close!'}
                </span>
              )}
            </div>
          </div>

          <div className="sketchbook-border" style={{ width: '100%', background: '#f8fafc', border: '3.5px solid #cbd5e1', borderBottom: '9.5px solid #94a3b8', borderRadius: '28px', padding: isMobile ? '18px 16px' : '22px 18px', display: 'grid', gap: '14px' }}>
            <div style={{ position: 'relative', width: '100%', height: isMobile ? '24px' : '28px', background: 'rgba(255,255,255,0.7)', borderRadius: '999px', border: '3px solid #cbd5e1', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: `${((question.targetProgress ?? 0.68) - ((question.targetTolerance ?? 0.2) / 2)) * 100}%`, width: `${(question.targetTolerance ?? 0.2) * 100}%`, top: 0, bottom: 0, background: 'rgba(52, 211, 153, 0.24)', borderLeft: '2px solid #10b981', borderRight: '2px solid #10b981' }} />
              <div style={{ position: 'absolute', left: `calc(${(timingState.progress ?? 0) * 100}% - 8px)`, top: '-2px', width: '16px', height: isMobile ? '22px' : '26px', borderRadius: '999px', background: '#0f172a', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={timingState.accuracy == null ? { scale: 1.04, y: -2 } : {}}
                whileTap={timingState.accuracy == null ? { scale: 0.92, y: 8 } : {}}
                onClick={timingState.phase === 'running' ? stopTiming : beginTiming}
                disabled={timingState.accuracy != null}
                className="sketchbook-border paper-interact"
                style={{ background: timingState.accuracy != null ? '#f1f5f9' : (timingState.phase === 'running' ? '#0f172a' : '#ffffff'), color: timingState.accuracy != null ? '#94a3b8' : (timingState.phase === 'running' ? '#ffffff' : '#334155'), border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', padding: '12px 20px', fontFamily: 'var(--font-main)', fontSize: '1rem', cursor: timingState.accuracy != null ? 'default' : 'pointer', borderRadius: '18px', fontWeight: 'bold', opacity: timingState.accuracy != null ? 0.7 : 1 }}
              >
                {toMysteryLabelCase(timingState.phase === 'running' ? (t.quiz.interactionUi?.stopMeter || 'Stop meter') : (t.quiz.interactionUi?.startMeter || 'Start meter'))}
              </motion.button>
            </div>
          </div>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitTiming(question, timingState)}
              disabled={timingState.accuracy == null}
              className="sketchbook-border paper-interact"
              style={{ background: timingState.accuracy != null ? '#0ea5e9' : '#94a3b8', color: 'white', border: '3.5px solid #0284c7', borderBottom: '9.5px solid #0369a1', opacity: timingState.accuracy != null ? 1 : 0.6, padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: '1.15rem', cursor: timingState.accuracy != null ? 'pointer' : 'not-allowed', borderRadius: '24px', fontWeight: 'bold', boxShadow: timingState.accuracy != null ? '0 10px 24px rgba(14, 165, 233, 0.3)' : 'none' }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}
      {question.type === 'tradeoff' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
            <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3.5px solid #93c5fd', borderBottom: '9.5px solid #2563eb', borderRadius: '24px', padding: '16px 18px', display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#1d4ed8', fontSize: '1rem', lineHeight: 1, fontWeight: '400' }}>
                  {t.quiz.questions[question.id]?.leftLabel || question.leftLabel || 'A'}
                </span>
                <span style={{ minWidth: '28px', padding: '6px 8px', borderRadius: '999px', background: '#ffffff', border: '2px solid #93c5fd', color: '#1d4ed8', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400', textAlign: 'center' }}>
                  {tradeoffLeft}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-main)', color: '#1e3a8a', fontSize: '1rem', lineHeight: 1.35, fontWeight: 'bold' }}>
                {t.quiz.questions[question.id]?.left || question.left.text}
              </div>
            </div>

            <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3.5px solid #f9a8d4', borderBottom: '9.5px solid #db2777', borderRadius: '24px', padding: '16px 18px', display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#be185d', fontSize: '1rem', lineHeight: 1, fontWeight: '400' }}>
                  {t.quiz.questions[question.id]?.rightLabel || question.rightLabel || 'B'}
                </span>
                <span style={{ minWidth: '28px', padding: '6px 8px', borderRadius: '999px', background: '#ffffff', border: '2px solid #f9a8d4', color: '#be185d', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400', textAlign: 'center' }}>
                  {tradeoffRight}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-main)', color: '#9d174d', fontSize: '1rem', lineHeight: 1.35, fontWeight: 'bold' }}>
                {t.quiz.questions[question.id]?.right || question.right.text}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '10px', justifyItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.9, y: 6 }}
                onClick={() => {
                  triggerHaptic('selection');
                  setTradeoffValue(Math.max(0, tradeoffLeft - 1));
                }}
                className="sketchbook-border paper-interact"
                style={{ background: '#ffffff', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', width: '40px', height: '40px', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}
              >
                <ChevronLeft size={18} strokeWidth={2.8} />
              </motion.button>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Array.from({ length: tradeoffBudget }).map((_, index) => {
                  const selected = index < tradeoffLeft;

                  return (
                    <motion.button
                      key={`tradeoff-${index}`}
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.92, y: 4 }}
                      onClick={() => {
                        triggerHaptic('selection');
                        setTradeoffValue(index + 1);
                      }}
                      className="sketchbook-border paper-interact"
                      style={{ width: '28px', height: '28px', borderRadius: '999px', background: selected ? '#93c5fd' : '#f9a8d4', border: `3px solid ${selected ? '#2563eb' : '#db2777'}`, boxShadow: selected ? '0 4px 10px rgba(37, 99, 235, 0.18)' : '0 4px 10px rgba(219, 39, 119, 0.18)', cursor: 'pointer' }}
                    />
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.9, y: 6 }}
                onClick={() => {
                  triggerHaptic('selection');
                  setTradeoffValue(Math.min(tradeoffBudget, tradeoffLeft + 1));
                }}
                className="sketchbook-border paper-interact"
                style={{ background: '#ffffff', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', width: '40px', height: '40px', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}
              >
                <ChevronRight size={18} strokeWidth={2.8} />
              </motion.button>
            </div>

            <div style={{ fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: '0.95rem', textAlign: 'center' }}>
              {tradeoffLeft} / {tradeoffRight}
            </div>
          </div>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitTradeoff(question)}
              className="sketchbook-border paper-interact"
              style={{ background: '#0ea5e9', color: 'white', border: '3.5px solid #0284c7', borderBottom: '9.5px solid #0369a1', padding: isMobile ? '12px 32px' : '14px 48px', fontFamily: 'var(--font-main)', fontSize: '1.15rem', cursor: 'pointer', borderRadius: '24px', fontWeight: 'bold', boxShadow: '0 10px 24px rgba(14, 165, 233, 0.3)' }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}
      {question.type === 'confidenceChoice' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(question.options || []).map((option, index) => {
            const selected = confidenceSelection.optionIndex === index;

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
                whileTap={{ scale: 0.95, y: 8 }}
                onClick={() => {
                  triggerHaptic('selection');
                  setConfidenceSelection((previous) => ({ ...previous, optionIndex: index }));
                }}
                className="sketchbook-border paper-interact"
                style={{ background: selected ? '#eff6ff' : '#ffffff', border: `3.5px solid ${selected ? '#3b82f6' : '#cbd5e1'}`, borderBottom: `9.5px solid ${selected ? '#2563eb' : '#94a3b8'}`, padding: isMobile ? '16px 18px' : '18px 20px', fontFamily: 'var(--font-main)', color: selected ? '#1e40af' : '#1e293b', fontSize: '1.05rem', lineHeight: 1.35, textAlign: 'left', cursor: 'pointer', borderRadius: '24px', fontWeight: 'bold', boxShadow: selected ? '0 6px 0 rgba(37, 99, 235, 0.1)' : '0 4px 0 rgba(0,0,0,0.02)' }}
              >
                {t.quiz.questions[question.id]?.options?.[index] || option.text}
              </motion.button>
            );
          })}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '2px' }}>
            {[1, 2, 3].map((level) => {
              const active = confidenceSelection.level === level;
              const palette = level === 1
                ? { bg: '#f8fafc', border: '#cbd5e1', bottom: '#94a3b8', text: '#475569', activeBg: '#fef2f2', activeBorder: '#fca5a5', activeBottom: '#ef4444', activeText: '#7f1d1d' }
                : level === 2
                  ? { bg: '#f8fafc', border: '#cbd5e1', bottom: '#94a3b8', text: '#475569', activeBg: '#fffbeb', activeBorder: '#fcd34d', activeBottom: '#f59e0b', activeText: '#92400e' }
                  : { bg: '#f8fafc', border: '#cbd5e1', bottom: '#94a3b8', text: '#475569', activeBg: '#ecfeff', activeBorder: '#67e8f9', activeBottom: '#06b6d4', activeText: '#155e75' };
              const label = ({
                1: toMysteryLabelCase(t.quiz.intense.subtly),
                2: toMysteryLabelCase(t.quiz.intense.moderately),
                3: toMysteryLabelCase(t.quiz.intense.notably),
              })[level] || '';

              return (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.9, y: 6 }}
                  onClick={() => {
                    triggerHaptic('selection');
                    setConfidenceSelection((previous) => ({ ...previous, level }));
                  }}
                  className="sketchbook-border paper-interact"
                  style={{ background: active ? palette.activeBg : palette.bg, border: `3px solid ${active ? palette.activeBorder : palette.border}`, borderBottom: `7px solid ${active ? palette.activeBottom : palette.bottom}`, color: active ? palette.activeText : palette.text, padding: '10px 8px', fontFamily: 'var(--font-main)', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '16px', fontWeight: 'bold' }}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>

          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92, y: 10 }}
              onClick={() => onSubmitConfidenceChoice(question)}
              disabled={confidenceSelection.optionIndex == null}
              className="sketchbook-border paper-interact"
              style={{
                background: confidenceSelection.optionIndex != null ? '#0ea5e9' : '#94a3b8',
                color: 'white',
                border: '3.5px solid #0284c7',
                borderBottom: '9.5px solid #0369a1',
                opacity: confidenceSelection.optionIndex != null ? 1 : 0.6,
                padding: isMobile ? '12px 32px' : '14px 48px',
                fontFamily: 'var(--font-main)',
                fontSize: '1.15rem',
                cursor: confidenceSelection.optionIndex != null ? 'pointer' : 'not-allowed',
                borderRadius: '24px',
                fontWeight: 'bold',
                boxShadow: confidenceSelection.optionIndex != null ? '0 10px 24px rgba(14, 165, 233, 0.3)' : 'none'
              }}
            >
              {toMysteryLabelCase(t.quiz.btns.continue)}
            </motion.button>
          </div>
        </div>
      )}

      {question.type === 'stance' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px' }}>
            {(question.labels || [t.quiz.btns.false, t.quiz.intense.subtly, t.quiz.intense.moderately, t.quiz.btns.true]).map((label, index) => {
              const displayLabel = t.quiz.questions[question.id]?.options?.[index] || label;
              const palette = STANCE_PALETTES[index] || STANCE_PALETTES[0];
              const active = stanceSelection === index;

              return (
                <motion.button
                  key={typeof displayLabel === 'string' ? toMysteryLabelCase(displayLabel) : displayLabel}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.9, y: 8 }}
                  onClick={() => {
                    triggerHaptic('success');
                    onSubmitStance(question, index);
                  }}
                  className="sketchbook-border paper-interact"
                  style={{ background: active ? '#eff6ff' : palette.bg, border: `3.5px solid ${active ? '#3b82f6' : palette.border}`, borderBottom: `9.5px solid ${active ? '#2563eb' : palette.bottom}`, padding: isMobile ? '14px 10px' : '16px 12px', fontFamily: 'var(--font-main)', color: active ? '#1e40af' : palette.text, fontSize: isMobile ? '0.95rem' : '1rem', lineHeight: 1.2, cursor: 'pointer', textAlign: 'center', borderRadius: '20px', fontWeight: 'bold' }}
                >
                  {typeof displayLabel === 'string' ? toMysteryLabelCase(displayLabel) : displayLabel}
                </motion.button>
              );
            })}
          </div>
          <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
        </div>
      )}
    </motion.div>
  );
};

export default QuizQuestionStep;
