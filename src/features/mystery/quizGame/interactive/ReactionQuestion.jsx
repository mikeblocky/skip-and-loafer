import { motion } from 'framer-motion';
import { toMysteryLabelCase } from '../ui';
import { instructionStyle } from './utils';

const ReactionQuestion = ({
  beginReaction,
  getQuestionInstruction,
  isMobile,
  localizedQuestion,
  onSubmitReaction,
  question,
  reactionState,
  t,
  tapReaction,
}) => {
  const isJapanese = t.questionsSuffix === '問';

  const readyLabel = t.quiz.interactionUi?.readyLabel || (isJapanese ? '準備完了' : 'Ready');
  const tooEarlyLabel = t.quiz.interactionUi?.tooEarly || (isJapanese ? '早すぎる' : 'Too early');
  const startReactionLabel = t.quiz.interactionUi?.startReaction || (isJapanese ? '反射テスト開始' : 'Start reflex test');
  const waitForSignalLabel = t.quiz.interactionUi?.waitForSignal || (isJapanese ? '合図を待ってください' : 'Wait for the signal');
  const tapNowLabel = t.quiz.interactionUi?.tapNow || (isJapanese ? '今タップ' : 'Tap now');

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%' }}>
        <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '7px solid #2563eb', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
          <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>
            {localizedQuestion.quickLabel || question.quickLabel}
          </span>
          <span style={{ color: '#1e3a8a', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
            {reactionState.latency != null ? `${Math.round(reactionState.latency)} ${t.quiz.interactionUi?.milliseconds || 'ms'}` : readyLabel}
          </span>
          {reactionState.latency != null && (
            <span style={{ color: '#2563eb', fontFamily: 'var(--font-main)', fontSize: '0.82rem', fontWeight: 500 }}>
              {reactionState.latency < 220
                ? (isJapanese ? '超高速の反応です！' : 'Lightning fast reflexes!')
                : reactionState.latency < 350
                  ? (isJapanese ? 'かなり速いです！' : 'Great speed! Very sharp.')
                  : reactionState.latency < 500
                    ? (isJapanese ? 'いい反応です！' : 'Pretty good!')
                    : (isJapanese ? '反応を記録しました。' : 'Reflexes recorded.')}
            </span>
          )}
        </div>
        <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3px solid #f9a8d4', borderBottom: '7px solid #db2777', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
          <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>
            {localizedQuestion.slowLabel || question.slowLabel}
          </span>
          <span style={{ color: '#9d174d', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
            {reactionState.falseStart ? tooEarlyLabel : (localizedQuestion.steadyLabel || question.steadyLabel)}
          </span>
          {reactionState.latency != null && (
            <span style={{ color: '#be185d', fontFamily: 'var(--font-main)', fontSize: '0.82rem', fontWeight: 500 }}>
              {reactionState.latency < 220
                ? (isJapanese ? '一瞬で反応しました！' : 'You reacted instantly!')
                : reactionState.latency < 350
                  ? (isJapanese ? 'とても速い反応です。' : 'Very quick response.')
                  : reactionState.latency < 500
                    ? (isJapanese ? '落ち着いた速さです。' : 'Measured speed.')
                    : (isJapanese ? 'タップを記録しました。' : 'Tap recorded.')}
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
          {reactionState.phase === 'idle' && startReactionLabel}
          {reactionState.phase === 'arming' && waitForSignalLabel}
          {reactionState.phase === 'cue' && tapNowLabel}
          {reactionState.phase === 'done' && reactionState.falseStart && (
            <>
              {tooEarlyLabel}
              <br />
              <span style={{ color: '#64748b', fontSize: isMobile ? '1.05rem' : '1.13rem', fontWeight: 500 }}>
                {isJapanese ? '反応が早すぎました。集中力は記録されています。' : 'Reflexes recorded as too early. Focus captured.'}
              </span>
            </>
          )}
          {reactionState.phase === 'done' && !reactionState.falseStart && reactionState.latency != null && `${Math.round(reactionState.latency)} ${t.quiz.interactionUi?.milliseconds || 'ms'}`}
          {reactionState.phase === 'done' && !reactionState.falseStart && (
            <>
              <br />
              <span style={{ color: '#64748b', fontSize: isMobile ? '1.05rem' : '1.13rem', fontWeight: 500 }}>
                {reactionState.latency < 220
                  ? (isJapanese ? '信じられない速さです。ほぼ即反応でした。' : 'Unbelievable reflexes! You tapped almost instantly.')
                  : reactionState.latency < 350
                    ? (isJapanese ? 'かなり鋭い反応です。' : 'Very sharp! Your reaction is above average.')
                    : reactionState.latency < 500
                      ? (isJapanese ? 'いい感じです！' : 'Good job!')
                      : (isJapanese ? '結果を記録しました。' : 'Results captured.')}
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
  );
};

export default ReactionQuestion;
