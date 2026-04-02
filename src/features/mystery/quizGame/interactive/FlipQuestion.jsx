import { motion } from 'framer-motion';
import { toMysteryLabelCase } from '../ui';
import {
  formatElapsedTime,
  instructionStyle,
  MEMORY_FALLBACK_COLORS,
} from './utils';

const FlipQuestion = ({
  getQuestionInstruction,
  handleMemoryFlip,
  isMobile,
  localizedQuestion,
  memoryDeck,
  memoryState,
  question,
  submitMemoryResult,
  t,
  uiLanguage = 'en',
}) => {
  const isJapanese = uiLanguage === 'ja' || t.questionsSuffix === '問';
  const timeLabel = question.timerLabel || localizedQuestion.timerLabel || (isJapanese ? '時間' : 'Time');
  const completedLabel = question.completedLabel || localizedQuestion.completedLabel || (isJapanese ? '完了' : 'Completed in');
  const fastResultLabel = question.fastResultLabel || localizedQuestion.fastResultLabel || (isJapanese ? '鋭い記憶' : 'Sharp memory');
  const steadyResultLabel = question.steadyResultLabel || localizedQuestion.steadyResultLabel || (isJapanese ? '安定した一致' : 'Steady matcher');
  const slowResultLabel = question.slowResultLabel || localizedQuestion.slowResultLabel || (isJapanese ? '慎重な一致' : 'Careful matcher');

  return (
    <fieldset
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        alignItems: 'center',
        border: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ ...instructionStyle(isMobile), textAlign: 'left', flex: 1 }}>
          {memoryState.phase === 'preview'
            ? (question.previewLabel || localizedQuestion.previewLabel || getQuestionInstruction(question))
            : (question.playLabel || localizedQuestion.playLabel || getQuestionInstruction(question))}
        </div>
        <div
          className="sketchbook-border"
          style={{
            background: '#eff6ff',
            border: '3px solid #93c5fd',
            borderBottom: '7px solid #60a5fa',
            color: '#1d4ed8',
            borderRadius: '18px',
            padding: '8px 14px',
            fontFamily: 'var(--font-main)',
            fontWeight: 'bold',
            minWidth: '106px',
            textAlign: 'center',
          }}
        >
          {timeLabel}
          {': '}
          {formatElapsedTime(memoryState.completedMs ?? memoryState.elapsedMs, uiLanguage)}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: isMobile ? '640px' : '820px',
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(4, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))',
          gap: isMobile ? '10px' : '14px',
        }}
      >
        {memoryDeck.map((card, index) => {
          const isMatched = memoryState.matchedPairIds.includes(card.pairId);
          const isFaceUp = memoryState.phase === 'preview'
            || isMatched
            || memoryState.flippedIds.includes(card.id)
            || memoryState.phase === 'complete';
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
                transition: { delay: index * 0.02 },
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
                      <img
                        src={card.src}
                        alt={card.name}
                        style={{
                          position: 'absolute',
                          inset: isMobile ? '4px 4px 22px 4px' : '8px 8px 38px 8px',
                          width: isMobile ? 'calc(100% - 8px)' : 'calc(100% - 16px)',
                          height: isMobile ? 'calc(100% - 26px)' : 'calc(100% - 46px)',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: `2px solid ${cardColors.border}`,
                          background: '#f8fafc',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          position: 'absolute',
                          inset: isMobile ? '4px 4px 22px 4px' : '8px 8px 38px 8px',
                          borderRadius: '12px',
                          border: `2px solid ${cardColors.border}`,
                          background: '#f1f5f9',
                          display: 'grid',
                          placeItems: 'center',
                          fontFamily: 'var(--font-hand)',
                          color: cardColors.text,
                          fontSize: isMobile ? '0.85rem' : '1.1rem',
                        }}
                      >
                        {card.name}
                      </div>
                    )}
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        marginTop: 'auto',
                        borderRadius: '8px',
                        padding: isMobile ? '2px 4px' : '4px 6px',
                        fontFamily: 'var(--font-main)',
                        fontWeight: 'bold',
                        color: cardColors.text,
                        fontSize: isMobile ? '0.78rem' : '0.92rem',
                        textAlign: 'center',
                        textShadow: '0 1px 1px rgba(255,255,255,0.7)',
                      }}
                    >
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
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '16px',
                        display: 'grid',
                        placeItems: 'center',
                        background: '#eff6ff',
                      }}
                    >
                      <div
                        style={{
                          width: '40%',
                          height: '40%',
                          border: '2.5px dashed #60a5fa',
                          borderRadius: '12px',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#1d4ed8',
                          fontFamily: 'var(--font-hand)',
                          fontSize: isMobile ? '1.2rem' : '1.4rem',
                          opacity: 0.6,
                        }}
                      >
                        ?
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {memoryState.modalOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: '100%', marginTop: '6px' }}
        >
          <div
            className="sketchbook-border"
            style={{
              background: '#fff7ed',
              border: '3.5px solid #fdba74',
              borderBottom: '9px solid #f97316',
              borderRadius: '24px',
              padding: isMobile ? '18px 16px' : '22px 20px',
              boxShadow: '0 10px 26px rgba(249, 115, 22, 0.15)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-hand)',
                fontSize: isMobile ? '1.45rem' : '1.7rem',
                color: '#9a3412',
                textAlign: 'center',
                marginBottom: '10px',
              }}
            >
              {completedLabel}
              {' '}
              {formatElapsedTime(memoryState.completedMs, uiLanguage)}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-main)',
                color: '#7c2d12',
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: '14px',
              }}
            >
              {memoryState.completedMs <= (question.fastThresholdMs || 24000)
                ? fastResultLabel
                : memoryState.completedMs <= (question.steadyThresholdMs || 40000)
                  ? steadyResultLabel
                  : slowResultLabel}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <button
                type="button"
                onClick={submitMemoryResult}
                className="sketchbook-border paper-interact"
                style={{
                  background: '#f97316',
                  color: '#fff',
                  border: '3px solid #ea580c',
                  borderBottom: '7px solid #c2410c',
                  borderRadius: '18px',
                  padding: '12px 18px',
                  fontFamily: 'var(--font-main)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {toMysteryLabelCase(t.quiz.btns.next)}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </fieldset>
  );
};

export default FlipQuestion;
