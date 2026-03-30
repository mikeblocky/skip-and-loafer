import React from 'react';
import { motion } from 'framer-motion';

void motion;
import { triggerHaptic } from '../../../utils/haptics';
import DotSlider from './DotSlider';
import { CHOICE_COLORS } from './config';
import { toMysteryLabelCase } from './ui';
import FlipQuestion from './interactive/FlipQuestion';
import ReactionQuestion from './interactive/ReactionQuestion';
import TimingQuestion from './interactive/TimingQuestion';
import {
  ConstellationQuestion,
  PairMatchQuestion,
  Sort4Question,
} from './questionBlocks/SequenceQuestionBlocks';
import {
  ConfidenceChoiceQuestion,
  HoldQuestion,
  RhythmQuestion,
  StanceQuestion,
  TradeoffQuestion,
} from './questionBlocks/AdvancedQuestionBlocks';
import {
  buildMemoryDeck,
  createInitialMemoryState,
  createInitialReactionState,
  createInitialTimingState,
  formatElapsedTime,
  instructionStyle,
} from './interactive/utils';

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
  const memoryDeck = React.useMemo(
    () => buildMemoryDeck({ portraitData, question }),
    [portraitData, question],
  );
  const [reactionState, setReactionState] = React.useState(createInitialReactionState);
  const [timingState, setTimingState] = React.useState(createInitialTimingState);
  const [memoryState, setMemoryState] = React.useState(() => createInitialMemoryState(question.type));

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
    setReactionState(createInitialReactionState());
    setTimingState(createInitialTimingState());
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
    setMemoryState(createInitialMemoryState(question.type));
  }, [question.id, question.type]);

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
        <FlipQuestion
          getQuestionInstruction={getQuestionInstruction}
          handleMemoryFlip={handleMemoryFlip}
          isMobile={isMobile}
          localizedQuestion={localizedQuestion}
          memoryDeck={memoryDeck}
          memoryState={memoryState}
          question={question}
          submitMemoryResult={submitMemoryResult}
          t={t}
        />
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
        <Sort4Question
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onSubmitSort4={onSubmitSort4}
          question={question}
          setSortSelection={setSortSelection}
          sortSelection={sortSelection}
          sortTarget={sortTarget}
          t={t}
        />
      )}

      {question.type === 'pairMatch' && (
        <PairMatchQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onSubmitPairMatch={onSubmitPairMatch}
          pairMatchSelection={pairMatchSelection}
          pairTarget={pairTarget}
          question={question}
          setPairMatchSelection={setPairMatchSelection}
          t={t}
        />
      )}
      {question.type === 'hold' && (
        <HoldQuestion
          getQuestionInstruction={getQuestionInstruction}
          holdActive={Boolean(holdTimerRef.current)}
          holdLevel={holdLevel}
          isMobile={isMobile}
          localizedQuestion={localizedQuestion}
          onSubmitHold={onSubmitHold}
          question={question}
          startHold={startHold}
          stopHold={stopHold}
          t={t}
        />
      )}

      {question.type === 'rhythm' && (
        <RhythmQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          localizedQuestion={localizedQuestion}
          onSubmitRhythm={onSubmitRhythm}
          question={question}
          rhythmPattern={rhythmPattern}
          t={t}
          tapRhythm={tapRhythm}
        />
      )}

      {question.type === 'constellation' && (
        <ConstellationQuestion
          constellationSelection={constellationSelection}
          constellationTarget={constellationTarget}
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onSubmitConstellation={onSubmitConstellation}
          question={question}
          setConstellationSelection={setConstellationSelection}
          t={t}
        />
      )}
      {question.type === 'reaction' && (
        <ReactionQuestion
          beginReaction={beginReaction}
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          localizedQuestion={localizedQuestion}
          onSubmitReaction={onSubmitReaction}
          question={question}
          reactionState={reactionState}
          t={t}
          tapReaction={tapReaction}
        />
      )}
      {question.type === 'timing' && (
        <TimingQuestion
          beginTiming={beginTiming}
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          localizedQuestion={localizedQuestion}
          onSubmitTiming={onSubmitTiming}
          question={question}
          stopTiming={stopTiming}
          t={t}
          timingState={timingState}
        />
      )}
      {question.type === 'tradeoff' && (
        <TradeoffQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onSubmitTradeoff={onSubmitTradeoff}
          question={question}
          setTradeoffValue={setTradeoffValue}
          t={t}
          tradeoffBudget={tradeoffBudget}
          tradeoffLeft={tradeoffLeft}
          tradeoffRight={tradeoffRight}
        />
      )}
      {question.type === 'confidenceChoice' && (
        <ConfidenceChoiceQuestion
          confidenceSelection={confidenceSelection}
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onSubmitConfidenceChoice={onSubmitConfidenceChoice}
          question={question}
          setConfidenceSelection={setConfidenceSelection}
          t={t}
        />
      )}

      {question.type === 'stance' && (
        <StanceQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onSubmitStance={onSubmitStance}
          question={question}
          stanceSelection={stanceSelection}
          t={t}
        />
      )}
    </motion.div>
  );
};

export default QuizQuestionStep;
