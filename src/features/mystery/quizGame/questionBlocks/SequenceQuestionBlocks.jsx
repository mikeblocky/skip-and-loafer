import React from 'react';
import { triggerHaptic } from '../../../../utils/haptics';
import { QUIZ_BUTTON_PALETTES } from '../QuizPrimitives';
import { getLocalizedQuizOption } from '../quizCopy';
import { toMysteryLabelCase } from '../ui';
import {
  QuestionContinueAction,
  QuestionInstructionBlock,
  QuestionOrderButton,
  QuestionSelectionSlots,
  toggleBoundedSelection,
} from './QuestionBlockPrimitives';

export const Sort4Question = React.memo(function Sort4Question({
  getQuestionInstruction,
  isMobile,
  onSubmitSort4,
  question,
  setSortSelection,
  sortSelection,
  sortTarget,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'grid', gap: '10px' }}>
        {(question.options || []).map((option, index) => {
          const order = sortSelection.indexOf(index);
          const selected = order !== -1;

          return (
            <QuestionOrderButton
              key={index}
              isMobile={isMobile}
              selected={selected}
              order={order}
              label={getLocalizedQuizOption(t, question.id, index, option.text)}
              onClick={() => {
                triggerHaptic('selection');
                setSortSelection((previous) => toggleBoundedSelection(previous, index, sortTarget));
              }}
              palette={selected
                ? { background: '#eff6ff', borderColor: '#60a5fa', bottomColor: '#2563eb', color: '#1d4ed8', shadow: '0 8px 18px rgba(37, 99, 235, 0.16)' }
                : { background: '#ffffff', borderColor: '#cbd5e1', bottomColor: '#94a3b8', color: '#1e293b', shadow: '0 4px 0 rgba(0,0,0,0.02)' }}
              badgePalette={selected
                ? { borderColor: '#60a5fa', background: '#dbeafe', color: '#1d4ed8', size: '32px', fontSize: '0.95rem' }
                : { borderColor: '#cbd5e1', background: '#f8fafc', color: '#94a3b8', size: '32px', fontSize: '0.95rem' }}
              layout="row"
              whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
              whileTap={{ scale: 0.95, y: 8 }}
              labelStyle={{ fontSize: '1.02rem' }}
            />
          );
        })}
      </div>

      <QuestionSelectionSlots
        count={sortTarget}
        containerStyle={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}
        slotStyle={{ flex: '1 1 120px' }}
        getSlotTitle={(slot) => (
          slot === 0
            ? toMysteryLabelCase(t.quiz.btns.mostLikeMe)
            : slot === (sortTarget - 1)
              ? toMysteryLabelCase(t.quiz.btns.leastLikeMe)
              : `#${slot + 1}`
        )}
        getSlotLabel={(slot) => {
          const selectedIndex = sortSelection[slot];
          return selectedIndex != null
            ? getLocalizedQuizOption(t, question.id, selectedIndex, question.options?.[selectedIndex]?.text)
            : '...';
        }}
      />

      <QuestionInstructionBlock isMobile={isMobile}>{getQuestionInstruction(question)}</QuestionInstructionBlock>
      <QuestionContinueAction
        isMobile={isMobile}
        onClick={() => onSubmitSort4(question)}
        disabled={sortSelection.length < sortTarget}
        palette={QUIZ_BUTTON_PALETTES.blue}
      >
        {toMysteryLabelCase(t.quiz.btns.continue)}
      </QuestionContinueAction>
    </div>
  );
});

export const PairMatchQuestion = React.memo(function PairMatchQuestion({
  getQuestionInstruction,
  isMobile,
  onSubmitPairMatch,
  pairMatchSelection,
  pairTarget,
  question,
  setPairMatchSelection,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
        {(question.options || []).map((option, index) => {
          const selected = pairMatchSelection.includes(index);
          const order = pairMatchSelection.indexOf(index);

          return (
            <QuestionOrderButton
              key={index}
              isMobile={isMobile}
              selected={selected}
              order={order}
              label={getLocalizedQuizOption(t, question.id, index, option.text)}
              onClick={() => {
                triggerHaptic('selection');
                setPairMatchSelection((previous) => toggleBoundedSelection(previous, index, pairTarget));
              }}
              palette={selected
                ? { background: '#eff6ff', borderColor: '#60a5fa', bottomColor: '#2563eb', color: '#1d4ed8', shadow: '0 8px 18px rgba(37, 99, 235, 0.16)' }
                : { background: '#ffffff', borderColor: '#cbd5e1', bottomColor: '#94a3b8', color: '#334155', shadow: '0 4px 0 rgba(0,0,0,0.02)' }}
              badgePalette={selected
                ? { borderColor: '#60a5fa', background: '#dbeafe', color: '#1d4ed8' }
                : { borderColor: '#cbd5e1', background: '#f8fafc', color: '#94a3b8' }}
              layout="stack"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95, y: 8 }}
            />
          );
        })}
      </div>

      <QuestionSelectionSlots
        count={pairTarget}
        containerStyle={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}
        getSlotTitle={(slot) => `#${slot + 1}`}
        getSlotLabel={(slot) => {
          const selectedIndex = pairMatchSelection[slot];
          return selectedIndex != null
            ? getLocalizedQuizOption(t, question.id, selectedIndex, question.options?.[selectedIndex]?.text)
            : '...';
        }}
      />

      <QuestionInstructionBlock isMobile={isMobile}>{getQuestionInstruction(question)}</QuestionInstructionBlock>
      <QuestionContinueAction
        isMobile={isMobile}
        onClick={() => onSubmitPairMatch(question)}
        disabled={pairMatchSelection.length < pairTarget}
        palette={QUIZ_BUTTON_PALETTES.blue}
        marginTop="6px"
      >
        {toMysteryLabelCase(t.quiz.btns.continue)}
      </QuestionContinueAction>
    </div>
  );
});

export const ConstellationQuestion = React.memo(function ConstellationQuestion({
  constellationSelection,
  constellationTarget,
  getQuestionInstruction,
  isMobile,
  onSubmitConstellation,
  question,
  setConstellationSelection,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 2fr' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
        {(question.options || []).map((option, index) => {
          const selected = constellationSelection.includes(index);
          const order = constellationSelection.indexOf(index);

          return (
            <QuestionOrderButton
              key={index}
              isMobile={isMobile}
              selected={selected}
              order={order}
              label={getLocalizedQuizOption(t, question.id, index, option.text)}
              onClick={() => {
                triggerHaptic('selection');
                setConstellationSelection((previous) => toggleBoundedSelection(previous, index, constellationTarget));
              }}
              palette={selected
                ? { background: '#eff6ff', borderColor: '#60a5fa', bottomColor: '#2563eb', color: '#1d4ed8', shadow: '0 8px 18px rgba(37, 99, 235, 0.16)' }
                : { background: '#ffffff', borderColor: '#cbd5e1', bottomColor: '#94a3b8', color: '#334155', shadow: '0 4px 0 rgba(0,0,0,0.02)' }}
              badgePalette={selected
                ? { borderColor: '#60a5fa', background: '#dbeafe', color: '#1d4ed8' }
                : { borderColor: '#cbd5e1', background: '#f8fafc', color: '#94a3b8' }}
              layout="stack"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95, y: 8 }}
            />
          );
        })}
      </div>

      <QuestionSelectionSlots
        count={constellationTarget}
        containerStyle={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}
        getSlotTitle={(slot) => `#${slot + 1}`}
        getSlotLabel={(slot) => {
          const selectedIndex = constellationSelection[slot];
          return selectedIndex != null
            ? getLocalizedQuizOption(t, question.id, selectedIndex, question.options?.[selectedIndex]?.text)
            : '...';
        }}
      />

      <QuestionInstructionBlock isMobile={isMobile}>{getQuestionInstruction(question)}</QuestionInstructionBlock>
      <QuestionContinueAction
        isMobile={isMobile}
        onClick={() => onSubmitConstellation(question)}
        disabled={constellationSelection.length < constellationTarget}
        palette={QUIZ_BUTTON_PALETTES.violet}
        marginTop="6px"
      >
        {toMysteryLabelCase(t.quiz.btns.continue)}
      </QuestionContinueAction>
    </div>
  );
});
