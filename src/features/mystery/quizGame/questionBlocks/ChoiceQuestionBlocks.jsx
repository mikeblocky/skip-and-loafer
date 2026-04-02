import React from 'react';
import { triggerHaptic } from '../../../../utils/haptics';
import DotSlider from '../DotSlider';
import { CHOICE_COLORS } from '../config';
import { QuizActionButton, QuizInstruction, QUIZ_BUTTON_PALETTES } from '../QuizPrimitives';
import { getLocalizedQuizOption, getLocalizedQuizText } from '../quizCopy';
import { formatQuizBinaryLabel } from '../jpHelpers';
import { toMysteryLabelCase } from '../ui';

const optionButtonStyle = (isMobile) => ({
  width: '100%',
  justifyContent: 'flex-start',
  textAlign: 'left',
  whiteSpace: 'normal',
  lineHeight: 1.35,
  height: 'auto',
  padding: isMobile ? '16px 18px' : '18px 24px',
});

const centeredFieldsetStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  alignItems: 'center',
  border: '0',
  padding: 0,
  margin: 0,
};

export const SliderQuestion = React.memo(function SliderQuestion({
  getQuestionInstruction,
  isMobile,
  onNextSlider,
  question,
  setSliderValue,
  sliderValue,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
      <DotSlider
        isMobile={isMobile}
        value={sliderValue}
        onChange={setSliderValue}
        leftLabel={getLocalizedQuizText(t, question.id, 'leftLabel', question.leftLabel)}
        rightLabel={getLocalizedQuizText(t, question.id, 'rightLabel', question.rightLabel)}
      />
      <QuizInstruction isMobile={isMobile} style={{ marginTop: isMobile ? '-10px' : '-6px' }}>
        {getQuestionInstruction(question)}
      </QuizInstruction>
      <QuizActionButton
        isMobile={isMobile}
        onClick={() => onNextSlider(question)}
        palette={QUIZ_BUTTON_PALETTES.blue}
        style={{ marginTop: isMobile ? '4px' : '12px' }}
      >
        {toMysteryLabelCase(t.quiz.btns.next)}
      </QuizActionButton>
    </div>
  );
});

export const ChoiceQuestion = React.memo(function ChoiceQuestion({
  getQuestionInstruction,
  isMobile,
  onApplyModifiers,
  question,
  t,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '14px', width: '100%' }}>
      {question.options.map((option, index) => {
        const colors = CHOICE_COLORS[index % CHOICE_COLORS.length];

        return (
          <QuizActionButton
            key={index}
            isMobile={isMobile}
            palette={{
              background: colors.bg,
              borderColor: colors.border,
              bottomColor: colors.shadow,
              color: colors.text,
              shadow: `0 6px 0 ${colors.shadow}20`,
            }}
            whileHover={{ scale: 1.03, x: isMobile ? 0 : 8, y: -2 }}
            whileTap={{ scale: 0.95, y: 8 }}
            onClick={() => {
              triggerHaptic('success');
              onApplyModifiers(option.modifiers, option.text, 'choice', { optionIndex: index });
            }}
            style={optionButtonStyle(isMobile)}
          >
            {getLocalizedQuizOption(t, question.id, index, option.text)}
          </QuizActionButton>
        );
      })}
      <QuizInstruction isMobile={isMobile}>{getQuestionInstruction(question)}</QuizInstruction>
    </div>
  );
});

export const GuessQuestion = React.memo(function GuessQuestion({
  getQuestionInstruction,
  isMobile,
  onApplyModifiers,
  question,
  t,
}) {
  return (
    <fieldset style={centeredFieldsetStyle}>
      <legend style={{ display: 'none' }}>{question.text}</legend>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '18px',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <QuizActionButton
          isMobile={isMobile}
          onClick={() => {
            triggerHaptic('success');
            onApplyModifiers(question.leftModifiers, question.leftLabel, 'guess', {
              optionIndex: 0,
              pairKey: question.pairKey,
              pairSlot: question.pairSlot,
              pairValue: -1,
            });
          }}
          palette={QUIZ_BUTTON_PALETTES.whiteSlate}
          style={{
            minWidth: '120px',
            minHeight: '48px',
            fontSize: '1.2rem',
            borderRadius: '16px',
            padding: '14px 18px',
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.95, y: 6 }}
        >
          {getLocalizedQuizText(t, question.id, 'leftLabel', question.leftLabel)}
        </QuizActionButton>
        <QuizActionButton
          isMobile={isMobile}
          onClick={() => {
            triggerHaptic('success');
            onApplyModifiers(question.rightModifiers, question.rightLabel, 'guess', {
              optionIndex: 1,
              pairKey: question.pairKey,
              pairSlot: question.pairSlot,
              pairValue: 1,
            });
          }}
          palette={QUIZ_BUTTON_PALETTES.whiteSlate}
          style={{
            minWidth: '120px',
            minHeight: '48px',
            fontSize: '1.2rem',
            borderRadius: '16px',
            padding: '14px 18px',
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.95, y: 6 }}
        >
          {getLocalizedQuizText(t, question.id, 'rightLabel', question.rightLabel)}
        </QuizActionButton>
      </div>
      <QuizInstruction isMobile={isMobile}>{getQuestionInstruction(question)}</QuizInstruction>
    </fieldset>
  );
});

export const YesNoQuestion = React.memo(function YesNoQuestion({
  getQuestionInstruction,
  isMobile,
  onApplyModifiers,
  question,
  uiLanguage,
  t,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '16px', width: '100%', justifyContent: 'center' }}>
        <QuizActionButton
          isMobile={isMobile}
          palette={{ background: '#ecfdf5', borderColor: '#10b981', bottomColor: '#059669', color: '#064e3b', shadow: '0 8px 0 rgba(16, 185, 129, 0.1)' }}
          onClick={() => {
            triggerHaptic('success');
            onApplyModifiers(question.yesModifiers, `${question.text} ・ ${formatQuizBinaryLabel(uiLanguage, true)}`, 'yesno', {
              optionIndex: 0,
              pairKey: question.pairKey,
              pairSlot: question.pairSlot,
              pairValue: question.pairReverse ? -1 : 1,
            });
          }}
          whileHover={{ scale: 1.06, rotate: -1.5, y: -4 }}
          whileTap={{ scale: 0.9, y: 12 }}
          style={{ flex: 1, padding: isMobile ? '16px 20px' : '18px 36px', fontSize: isMobile ? '1.2rem' : '1.35rem' }}
        >
          {toMysteryLabelCase(t.quiz.btns.true)}
        </QuizActionButton>
        <QuizActionButton
          isMobile={isMobile}
          palette={{ background: '#fff1f2', borderColor: '#f43f5e', bottomColor: '#e11d48', color: '#881337', shadow: '0 8px 0 rgba(244, 63, 94, 0.1)' }}
          onClick={() => {
            triggerHaptic('success');
            onApplyModifiers(question.noModifiers, `${question.text} ・ ${formatQuizBinaryLabel(uiLanguage, false)}`, 'yesno', {
              optionIndex: 1,
              pairKey: question.pairKey,
              pairSlot: question.pairSlot,
              pairValue: question.pairReverse ? 1 : -1,
            });
          }}
          whileHover={{ scale: 1.06, rotate: 1.5, y: -4 }}
          whileTap={{ scale: 0.9, y: 12 }}
          style={{ flex: 1, padding: isMobile ? '16px 20px' : '18px 36px', fontSize: isMobile ? '1.2rem' : '1.35rem' }}
        >
          {toMysteryLabelCase(t.quiz.btns.false)}
        </QuizActionButton>
      </div>
      <QuizInstruction isMobile={isMobile} style={{ width: '100%' }}>
        {getQuestionInstruction(question)}
      </QuizInstruction>
    </div>
  );
});

export const DuelQuestion = React.memo(function DuelQuestion({
  getQuestionInstruction,
  isMobile,
  onApplyModifiers,
  question,
  t,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '14px', width: '100%' }}>
        <QuizActionButton
          isMobile={isMobile}
          palette={{ background: '#eff6ff', borderColor: '#93c5fd', bottomColor: '#3b82f6', color: '#1e40af', shadow: '0 6px 0 rgba(37, 99, 235, 0.1)' }}
          onClick={() => {
            triggerHaptic('success');
            onApplyModifiers(question.left.modifiers, question.left.text, 'duel', { optionIndex: 0 });
          }}
          whileHover={{ scale: 1.04, x: isMobile ? 0 : -8, y: -2 }}
          whileTap={{ scale: 0.92, y: 10 }}
          style={{ flex: 1, ...optionButtonStyle(isMobile), padding: isMobile ? '16px 18px' : '20px 24px', fontSize: '1.05rem' }}
        >
          {getLocalizedQuizText(t, question.id, 'left', question.left.text)}
        </QuizActionButton>
        <QuizActionButton
          isMobile={isMobile}
          palette={{ background: '#fff1f2', borderColor: '#fca5a5', bottomColor: '#f43f5e', color: '#9d174d', shadow: '0 6px 0 rgba(244, 63, 94, 0.1)' }}
          onClick={() => {
            triggerHaptic('success');
            onApplyModifiers(question.right.modifiers, question.right.text, 'duel', { optionIndex: 1 });
          }}
          whileHover={{ scale: 1.04, x: isMobile ? 0 : 8, y: -2 }}
          whileTap={{ scale: 0.92, y: 10 }}
          style={{ flex: 1, ...optionButtonStyle(isMobile), padding: isMobile ? '16px 18px' : '20px 24px', fontSize: '1.05rem' }}
        >
          {getLocalizedQuizText(t, question.id, 'right', question.right.text)}
        </QuizActionButton>
      </div>
      <QuizInstruction isMobile={isMobile}>{getQuestionInstruction(question)}</QuizInstruction>
    </div>
  );
});

export const GridQuestion = React.memo(function GridQuestion({
  getQuestionInstruction,
  isMobile,
  onApplyModifiers,
  question,
  t,
}) {
  return (
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
                <QuizActionButton
                  key={index}
                  isMobile={isMobile}
                  palette={{ background: palette.bg, borderColor: palette.border, bottomColor: palette.shadow, color: palette.text, shadow: `0 6px 0 ${palette.shadow}18` }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.95, y: 8 }}
                  onClick={() => {
                    triggerHaptic('success');
                    onApplyModifiers(option.modifiers, option.text, 'grid', { optionIndex: index });
                  }}
                  style={{
                    minHeight: isMobile ? '108px' : '118px',
                    padding: isMobile ? '16px 14px' : '18px 16px',
                    fontSize: isMobile ? '0.98rem' : '1.02rem',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    whiteSpace: 'normal',
                    lineHeight: 1.28,
                    height: 'auto',
                  }}
                >
                  {getLocalizedQuizOption(t, question.id, index, option.text)}
                </QuizActionButton>
              );
            })}
          </div>
        </div>
      </div>
      <QuizInstruction isMobile={isMobile}>{getQuestionInstruction(question)}</QuizInstruction>
    </div>
  );
});
