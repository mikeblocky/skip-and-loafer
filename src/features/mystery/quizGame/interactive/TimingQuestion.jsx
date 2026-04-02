import { motion } from 'framer-motion';
import { toMysteryLabelCase } from '../ui';
import { instructionStyle } from './utils';

const TimingQuestion = ({
  beginTiming,
  getQuestionInstruction,
  isMobile,
  localizedQuestion,
  onSubmitTiming,
  question,
  stopTiming,
  t,
  timingState,
}) => {
  const isJapanese = t.questionsSuffix === '問';
  const targetLabel = t.quiz.interactionUi?.targetLabel || (isJapanese ? 'ターゲット' : 'Target');
  const inMotionLabel = t.quiz.interactionUi?.inMotion || (isJapanese ? '移動中' : 'In motion');
  const startMeterLabel = t.quiz.interactionUi?.startMeter || (isJapanese ? 'メーター開始' : 'Start meter');
  const stopMeterLabel = t.quiz.interactionUi?.stopMeter || (isJapanese ? 'メーター停止' : 'Stop meter');

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%' }}>
        <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '7px solid #2563eb', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
          <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>
            {localizedQuestion.bullseyeLabel || question.bullseyeLabel}
          </span>
          <span style={{ color: '#1e3a8a', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
            {timingState.accuracy != null ? `${Math.round(timingState.accuracy * 100)}%` : targetLabel}
          </span>
          {timingState.accuracy != null && (
            <span style={{ color: '#2563eb', fontFamily: 'var(--font-main)', fontSize: '0.82rem', fontWeight: 500 }}>
              {timingState.accuracy > 0.85
                ? (isJapanese ? '完璧です。ど真ん中です。' : 'Perfect! Right in the zone.')
                : timingState.accuracy > 0.65
                  ? (isJapanese ? 'かなり近いです。あと少しです。' : 'Very close! Just a bit off.')
                  : (isJapanese ? '少しずれました。' : 'You were a bit off the mark.')}
            </span>
          )}
        </div>
        <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3px solid #f9a8d4', borderBottom: '7px solid #db2777', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
          <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>
            {localizedQuestion.wideLabel || question.wideLabel}
          </span>
          <span style={{ color: '#9d174d', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
            {timingState.phase === 'running' ? inMotionLabel : (localizedQuestion.nearLabel || question.nearLabel)}
          </span>
          {timingState.accuracy != null && (
            <span style={{ color: '#be185d', fontFamily: 'var(--font-main)', fontSize: '0.82rem', fontWeight: 500 }}>
              {timingState.accuracy < 0.35
                ? (isJapanese ? '目標がゴールです。' : 'The target is the goal.')
                : timingState.accuracy < 0.65
                  ? (isJapanese ? 'かなり近いです。あと少し精度が必要です。' : 'Almost there! Just a little more precision.')
                  : (isJapanese ? 'かなり近いです！' : 'Pretty close!')}
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
            {toMysteryLabelCase(timingState.phase === 'running' ? stopMeterLabel : startMeterLabel)}
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
  );
};

export default TimingQuestion;
