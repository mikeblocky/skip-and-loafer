import React from 'react';
import { triggerHaptic } from '../../../utils/haptics';
import { QuizStageFrame } from './QuizPrimitives';
import { getLocalizedQuizQuestion } from './quizCopy';
import { toMysteryLabelCase } from './ui';
import FlipQuestion from './interactive/FlipQuestion';
import ReactionQuestion from './interactive/ReactionQuestion';
import TimingQuestion from './interactive/TimingQuestion';
import {
  ChoiceQuestion,
  DuelQuestion,
  GridQuestion,
  GuessQuestion,
  SliderQuestion,
  YesNoQuestion,
} from './questionBlocks/ChoiceQuestionBlocks';
import {
  ConstellationQuestion,
  PairMatchQuestion,
  Sort4Question,
} from './questionBlocks/SequenceQuestionBlocks';
import {
  AllocationQuestion,
  DriftQuestion,
  IpsativeQuestion,
  MultiQuestion,
  RankQuestion,
  SpectrumQuestion,
} from './questionBlocks/SelectionQuestionBlocks';
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
  const localizedQuestion = getLocalizedQuizQuestion(t, question.id);
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
    <QuizStageFrame
      isMobile={isMobile}
      motionKey={question.id}
      currentStep={currentStep}
      totalQuestions={totalQuestions}
      progressLabel={`${toMysteryLabelCase(t.quiz.question)} ${currentStep} ${t.quiz.of} ${totalQuestions}`}
      questionLabel={localizedQuestion.text || question.text}
    >

      {question.type === 'slider' && (
        <SliderQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onNextSlider={onNextSlider}
          question={question}
          setSliderValue={setSliderValue}
          sliderValue={sliderValue}
          t={t}
        />
      )}

      {question.type === 'choice' && (
        <ChoiceQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onApplyModifiers={onApplyModifiers}
          question={question}
          t={t}
        />
      )}

      {question.type === 'guess' && (
        <GuessQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onApplyModifiers={onApplyModifiers}
          question={question}
          t={t}
        />
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
        <YesNoQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onApplyModifiers={onApplyModifiers}
          question={question}
          t={t}
        />
      )}

      {question.type === 'duel' && (
        <DuelQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onApplyModifiers={onApplyModifiers}
          question={question}
          t={t}
        />
      )}

      {question.type === 'multi' && (
        <MultiQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          multiSelection={multiSelection}
          onSubmitMulti={onSubmitMulti}
          question={question}
          setMultiSelection={setMultiSelection}
          t={t}
        />
      )}

      {question.type === 'rank2' && (
        <RankQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onSubmitRank={onSubmitRank}
          question={question}
          rankSelection={rankSelection}
          setRankSelection={setRankSelection}
          t={t}
        />
      )}

      {question.type === 'ipsative' && (
        <IpsativeQuestion
          getQuestionInstruction={getQuestionInstruction}
          ipsativeLeast={ipsativeLeast}
          ipsativeMost={ipsativeMost}
          isMobile={isMobile}
          onSubmitIpsative={onSubmitIpsative}
          question={question}
          setIpsativeLeast={setIpsativeLeast}
          setIpsativeMost={setIpsativeMost}
          t={t}
        />
      )}

      {question.type === 'spectrum' && (
        <SpectrumQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onSubmitSpectrum={onSubmitSpectrum}
          question={question}
          setSpectrumValue={setSpectrumValue}
          spectrumValue={spectrumValue}
          t={t}
        />
      )}

      {question.type === 'allocation' && (
        <AllocationQuestion
          allocationBudget={allocationBudget}
          allocationPoints={allocationPoints}
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onAdjustAllocation={onAdjustAllocation}
          onSubmitAllocation={onSubmitAllocation}
          question={question}
          t={t}
          totalAllocated={totalAllocated}
        />
      )}

      {question.type === 'drift' && (
        <DriftQuestion
          driftSelection={driftSelection}
          driftTarget={driftTarget}
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onSubmitDrift={onSubmitDrift}
          question={question}
          setDriftSelection={setDriftSelection}
          t={t}
        />
      )}


      {question.type === 'grid' && (
        <GridQuestion
          getQuestionInstruction={getQuestionInstruction}
          isMobile={isMobile}
          onApplyModifiers={onApplyModifiers}
          question={question}
          t={t}
        />
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
    </QuizStageFrame>
  );
};

export default QuizQuestionStep;
