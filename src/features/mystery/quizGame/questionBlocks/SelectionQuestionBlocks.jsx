import React from 'react';
import { triggerHaptic } from '../../../../utils/haptics';
import DotSlider from '../DotSlider';
import {
  QuizActionButton,
  QuizChip,
  QuizInstruction,
  QuizPanel,
  QUIZ_BUTTON_PALETTES,
  QUIZ_PANEL_PALETTES,
} from '../QuizPrimitives';
import { toMysteryLabelCase } from '../ui';
import { toggleBoundedSelection } from './QuestionBlockPrimitives';

const ACTION_ROW_STYLE = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '8px',
};

const SLOT_CARD_STYLE = {
  background: 'var(--surface-card, #f8fafc)',
  border: '3px solid #cbd5e1',
  borderBottom: '7px solid #94a3b8',
  borderRadius: '18px',
  padding: '10px 12px',
  display: 'grid',
  gap: '6px',
};

const SLOT_TITLE_STYLE = {
  color: '#64748b',
  fontFamily: 'Sniglet, var(--font-main)',
  fontSize: '0.84rem',
  lineHeight: 1,
  fontWeight: '400',
};

const SLOT_LABEL_STYLE = {
  color: '#334155',
  fontFamily: 'var(--font-main)',
  fontSize: '0.86rem',
  lineHeight: 1.2,
  fontWeight: '700',
};

const selectionBadgeStyle = {
  minWidth: '28px',
  height: '28px',
  borderRadius: '12px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.95rem',
  lineHeight: 1,
  fontFamily: 'var(--font-main)',
  fontWeight: '700',
  boxShadow: '0 2px 0 rgba(0,0,0,0.05)',
};

const optionButtonStyle = (isMobile) => ({
  width: '100%',
  justifyContent: 'flex-start',
  textAlign: 'left',
  whiteSpace: 'normal',
  lineHeight: 1.35,
  height: 'auto',
  padding: isMobile ? '14px 16px' : '16px 20px',
});

const SelectionSlots = ({ count, getSlotTitle, getSlotLabel, style }) => (
  <div style={style}>
    {Array.from({ length: count }).map((_, slot) => (
      <div key={`slot-${slot}`} className="sketchbook-border" style={SLOT_CARD_STYLE}>
        <span style={SLOT_TITLE_STYLE}>{getSlotTitle(slot)}</span>
        <span style={SLOT_LABEL_STYLE}>{getSlotLabel(slot)}</span>
      </div>
    ))}
  </div>
);

export const MultiQuestion = React.memo(function MultiQuestion({
  getQuestionInstruction,
  isMobile,
  multiSelection,
  onSubmitMulti,
  question,
  setMultiSelection,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {question.options.map((option, index) => {
        const selected = multiSelection.includes(index);

        return (
          <QuizActionButton
            key={index}
            isMobile={isMobile}
            aria-pressed={selected}
            palette={{
              background: 'var(--surface-card, #ffffff)',
              borderColor: selected ? '#3b82f6' : '#cbd5e1',
              bottomColor: selected ? '#2563eb' : '#94a3b8',
              color: 'var(--text-primary, #334155)',
              shadow: selected ? '0 4px 12px rgba(37, 99, 235, 0.1)' : '0 4px 0 rgba(0,0,0,0.02)',
            }}
            whileHover={{ scale: 1.02, x: isMobile ? 0 : 6, y: -2 }}
            whileTap={{ scale: 0.95, y: 8 }}
            onClick={() => {
              triggerHaptic('selection');
              setMultiSelection((previous) => {
                const maxSelect = question.maxSelect || 2;
                return toggleBoundedSelection(previous, index, maxSelect);
              });
            }}
            style={optionButtonStyle(isMobile)}
          >
            {selected ? '\u2713 ' : ''}{option.text}
          </QuizActionButton>
        );
      })}
      <QuizInstruction isMobile={isMobile}>{getQuestionInstruction(question)}</QuizInstruction>
      <div style={ACTION_ROW_STYLE}>
        <QuizActionButton isMobile={isMobile} onClick={() => onSubmitMulti(question)} disabled={!multiSelection.length} palette={QUIZ_BUTTON_PALETTES.blue}>
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </QuizActionButton>
      </div>
    </div>
  );
});

export const RankQuestion = React.memo(function RankQuestion({
  getQuestionInstruction,
  isMobile,
  onSubmitRank,
  question,
  rankSelection,
  setRankSelection,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {question.options.map((option, index) => {
        const rankPosition = rankSelection.indexOf(index);
        const selected = rankPosition !== -1;
        const palette = rankPosition === 0
          ? { bg: 'var(--surface-card, #ecfdf5)', border: '#34d399', shadow: '#059669', badgeBg: 'var(--surface-panel, #d1fae5)', badgeBorder: '#10b981', badgeText: 'var(--text-primary, #065f46)' }
          : rankPosition === 1
            ? { bg: 'var(--surface-card, #fff7ed)', border: '#fb923c', shadow: '#ea580c', badgeBg: 'var(--surface-panel, #ffedd5)', badgeBorder: '#f97316', badgeText: 'var(--text-primary, #9a3412)' }
            : { bg: 'var(--surface-card, #ffffff)', border: '#cbd5e1', shadow: '#94a3b8', badgeBg: 'var(--surface-card, #f8fafc)', badgeBorder: '#cbd5e1', badgeText: 'var(--text-muted, #94a3b8)' };

        return (
          <QuizActionButton
            key={index}
            isMobile={isMobile}
            aria-pressed={selected}
            palette={{ background: palette.bg, borderColor: palette.border, bottomColor: palette.shadow, color: '#1e293b', shadow: `0 6px 0 ${palette.shadow}15` }}
            whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
            whileTap={{ scale: 0.94, y: 8 }}
            onClick={() => {
              triggerHaptic('selection');
              setRankSelection((previous) => toggleBoundedSelection(previous, index, 2));
            }}
            style={{ ...optionButtonStyle(isMobile), display: 'flex', alignItems: 'center', gap: '12px', padding: isMobile ? '14px 16px' : '18px 20px' }}
          >
            <span aria-hidden="true" style={{ ...selectionBadgeStyle, border: `3px solid ${palette.badgeBorder}`, background: palette.badgeBg, color: palette.badgeText }}>
              {selected ? rankPosition + 1 : ''}
            </span>
            <span>{option.text}</span>
          </QuizActionButton>
        );
      })}
      <QuizInstruction isMobile={isMobile}>{getQuestionInstruction(question)}</QuizInstruction>
      <div style={ACTION_ROW_STYLE}>
        <QuizActionButton isMobile={isMobile} onClick={() => onSubmitRank(question)} disabled={rankSelection.length < 2} palette={QUIZ_BUTTON_PALETTES.violet}>
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </QuizActionButton>
      </div>
    </div>
  );
});

export const IpsativeQuestion = React.memo(function IpsativeQuestion({
  getQuestionInstruction,
  ipsativeLeast,
  ipsativeMost,
  isMobile,
  onSubmitIpsative,
  question,
  setIpsativeLeast,
  setIpsativeMost,
  t,
}) {
  const isReady = ipsativeMost != null && ipsativeLeast != null && ipsativeMost !== ipsativeLeast;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {(question.options || []).map((option, index) => {
        const isMost = ipsativeMost === index;
        const isLeast = ipsativeLeast === index;

        return (
          <QuizPanel
            key={index}
            palette={{ background: 'var(--surface-card, #ffffff)', borderColor: isMost ? '#10b981' : isLeast ? '#f43f5e' : '#cbd5e1', bottomColor: isMost ? '#059669' : isLeast ? '#e11d48' : '#94a3b8', shadow: '0 6px 0 rgba(0,0,0,0.02)' }}
            style={{ padding: isMobile ? '14px 16px' : '18px 20px', gap: '14px' }}
          >
            <div style={{ color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.35, fontWeight: '700' }}>
              {option.text}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <QuizActionButton
                isMobile={isMobile}
                aria-pressed={isMost}
                onClick={() => {
                  triggerHaptic('selection');
                  setIpsativeMost((previous) => (previous === index ? null : index));
                  if (ipsativeLeast === index) setIpsativeLeast(null);
                }}
                palette={{ background: 'var(--surface-card, #f8fafc)', borderColor: isMost ? '#10b981' : '#cbd5e1', bottomColor: isMost ? '#059669' : '#94a3b8', color: 'var(--text-primary, #64748b)', shadow: '0 4px 10px rgba(15, 23, 42, 0.05)' }}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '16px', fontSize: '0.95rem' }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.9, y: 8 }}
              >
                {toMysteryLabelCase(t.quiz.btns.mostLikeMe)}
              </QuizActionButton>
              <QuizActionButton
                isMobile={isMobile}
                aria-pressed={isLeast}
                onClick={() => {
                  triggerHaptic('selection');
                  setIpsativeLeast((previous) => (previous === index ? null : index));
                  if (ipsativeMost === index) setIpsativeMost(null);
                }}
                palette={{ background: 'var(--surface-card, #f8fafc)', borderColor: isLeast ? '#f43f5e' : '#cbd5e1', bottomColor: isLeast ? '#e11d48' : '#94a3b8', color: 'var(--text-primary, #64748b)', shadow: '0 4px 10px rgba(15, 23, 42, 0.05)' }}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '16px', fontSize: '0.95rem' }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.9, y: 8 }}
              >
                {toMysteryLabelCase(t.quiz.btns.leastLikeMe)}
              </QuizActionButton>
            </div>
          </QuizPanel>
        );
      })}
      <QuizInstruction isMobile={isMobile}>{getQuestionInstruction(question)}</QuizInstruction>
      <div style={ACTION_ROW_STYLE}>
        <QuizActionButton isMobile={isMobile} onClick={() => onSubmitIpsative(question)} disabled={!isReady} palette={QUIZ_BUTTON_PALETTES.sky}>
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </QuizActionButton>
      </div>
    </div>
  );
});

export const SpectrumQuestion = React.memo(function SpectrumQuestion({
  getQuestionInstruction,
  isMobile,
  onSubmitSpectrum,
  question,
  setSpectrumValue,
  spectrumValue,
  t,
}) {
  const leftLabel = question.leftLabel;
  const rightLabel = question.rightLabel;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
      <DotSlider isMobile={isMobile} value={spectrumValue} onChange={setSpectrumValue} leftLabel={leftLabel} rightLabel={rightLabel} />
      <div style={{ fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: '0.95rem' }}>
        {spectrumValue === 3 ? toMysteryLabelCase(t.quiz.intense.moderately) : spectrumValue < 3 ? `${3 - spectrumValue} ${t.quiz.of} ${leftLabel}` : `${spectrumValue - 3} ${t.quiz.of} ${rightLabel}`}
      </div>
      <QuizInstruction isMobile={isMobile} style={{ marginTop: '-4px' }}>
        {getQuestionInstruction(question)}
      </QuizInstruction>
      <QuizActionButton isMobile={isMobile} onClick={() => onSubmitSpectrum(question)} palette={QUIZ_BUTTON_PALETTES.sky}>
        {toMysteryLabelCase(t.quiz.btns.continue)}
      </QuizActionButton>
    </div>
  );
});

export const AllocationQuestion = React.memo(function AllocationQuestion({
  allocationBudget,
  allocationPoints,
  getQuestionInstruction,
  isMobile,
  onAdjustAllocation,
  onSubmitAllocation,
  question,
  t,
  totalAllocated,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {(question.options || []).map((option, index) => {
        const points = allocationPoints[index] || 0;
        return (
          <QuizPanel
            key={index}
            palette={QUIZ_PANEL_PALETTES.neutral}
            style={{ padding: isMobile ? '14px 16px' : '16px 20px', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '14px', boxShadow: '0 4px 0 rgba(0,0,0,0.02)' }}
          >
            <div style={{ color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.35, fontWeight: '700' }}>
              {option.text}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <QuizActionButton
                isMobile={isMobile}
                disabled={points <= 0}
                onClick={() => onAdjustAllocation(question, index, -1)}
                palette={{ background: 'var(--surface-card, #f8fafc)', borderColor: '#cbd5e1', bottomColor: '#94a3b8', color: 'var(--text-primary, #64748b)', shadow: '0 4px 10px rgba(15, 23, 42, 0.05)' }}
                style={{ width: '36px', height: '36px', padding: 0, borderRadius: '12px', fontSize: '1.2rem' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, y: 4 }}
              >
                -
              </QuizActionButton>
              <div style={{ minWidth: '32px', textAlign: 'center', fontFamily: 'var(--font-main)', color: '#1e40af', fontSize: '1.2rem', fontWeight: '700' }}>
                {points}
              </div>
              <QuizActionButton
                isMobile={isMobile}
                disabled={totalAllocated >= allocationBudget}
                onClick={() => onAdjustAllocation(question, index, 1)}
                palette={{ background: '#eff6ff', borderColor: '#3b82f6', bottomColor: '#2563eb', color: '#2563eb', shadow: '0 4px 10px rgba(37, 99, 235, 0.14)' }}
                style={{ width: '36px', height: '36px', padding: 0, borderRadius: '12px', fontSize: '1.2rem' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, y: 4 }}
              >
                +
              </QuizActionButton>
            </div>
          </QuizPanel>
        );
      })}
      <QuizChip palette={{ background: 'var(--surface-card, #ffffff)', borderColor: '#bfdbfe', bottomColor: '#93c5fd', color: 'var(--text-primary, #1e40af)' }} style={{ alignSelf: 'center', padding: '8px 14px', fontSize: '0.92rem' }}>
        {toMysteryLabelCase(t.quiz.pointsUsed)}: {totalAllocated} / {allocationBudget}
      </QuizChip>
      <QuizInstruction isMobile={isMobile}>{getQuestionInstruction(question)}</QuizInstruction>
      <div style={ACTION_ROW_STYLE}>
        <QuizActionButton isMobile={isMobile} onClick={() => onSubmitAllocation(question)} disabled={totalAllocated !== allocationBudget} palette={QUIZ_BUTTON_PALETTES.blue} style={{ fontSize: '1.2rem' }}>
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </QuizActionButton>
      </div>
    </div>
  );
});

export const DriftQuestion = React.memo(function DriftQuestion({
  driftSelection,
  driftTarget,
  getQuestionInstruction,
  isMobile,
  onSubmitDrift,
  question,
  setDriftSelection,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'grid', gap: '10px' }}>
        {(question.options || []).map((option, index) => {
          const order = driftSelection.indexOf(index);
          const selected = order !== -1;
          return (
            <QuizActionButton
              key={index}
              isMobile={isMobile}
              aria-pressed={selected}
              palette={{ background: 'var(--surface-card, #ffffff)', borderColor: selected ? '#06b6d4' : '#cbd5e1', bottomColor: selected ? '#0891b2' : '#94a3b8', color: 'var(--text-primary, #1e293b)', shadow: selected ? '0 8px 18px rgba(6, 182, 212, 0.18)' : '0 4px 0 rgba(0,0,0,0.02)' }}
              whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
              whileTap={{ scale: 0.95, y: 8 }}
              onClick={() => {
                triggerHaptic('selection');
                setDriftSelection((previous) => toggleBoundedSelection(previous, index, driftTarget));
              }}
              style={{ width: '100%', padding: isMobile ? '14px 16px' : '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', alignItems: 'center', textAlign: 'left', whiteSpace: 'normal', height: 'auto' }}
            >
              <span aria-hidden="true" style={{ ...selectionBadgeStyle, width: '30px', minWidth: '30px', border: `3px solid ${selected ? '#06b6d4' : '#cbd5e1'}`, background: 'var(--surface-card, #f8fafc)', color: selected ? '#67e8f9' : 'var(--text-muted, #94a3b8)' }}>
                {selected ? order + 1 : ''}
              </span>
              <span style={{ fontSize: '1.02rem' }}>{option.text}</span>
            </QuizActionButton>
          );
        })}
      </div>
      <SelectionSlots
        count={driftTarget}
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}
        getSlotTitle={(slot) => `#${slot + 1}`}
        getSlotLabel={(slot) => {
          const selectedIndex = driftSelection[slot];
          return selectedIndex != null ? question.options?.[selectedIndex]?.text : '...';
        }}
      />
      <QuizInstruction isMobile={isMobile}>{getQuestionInstruction(question)}</QuizInstruction>
      <div style={ACTION_ROW_STYLE}>
        <QuizActionButton isMobile={isMobile} onClick={() => onSubmitDrift(question)} disabled={driftSelection.length < driftTarget} palette={QUIZ_BUTTON_PALETTES.cyan}>
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </QuizActionButton>
      </div>
    </div>
  );
});
