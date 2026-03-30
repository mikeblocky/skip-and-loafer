import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { History as HistoryIcon, ListChecks, Trophy } from 'lucide-react';
import { TabSelector } from '../sync/syncSharedComponents';
import { CONTENT_SLIDE, TRANSITION_TAB } from '../../components/shared/animationPresets';
import { UI_TEXT } from './quizText';
import QuestionsTab from './components/QuestionsTab';
import LeaderboardTab from './components/LeaderboardTab';
import HistoryTab from './components/HistoryTab';
import { useQuizGameController } from './hooks/useQuizGameController';
import { useQuizTabNavigation } from './hooks/useQuizTabNavigation';
import { toUiLabelCase } from '../../utils/textCase';

const QuizPageView = ({ isMobile, uiLanguage = 'en', subtabShortcut }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;

  const tabs = useMemo(
    () => [
      { id: 'questions', title: t.questionsTab, color: '#dc2626', icon: ListChecks },
      { id: 'leaderboard', title: t.leaderboardTab, color: '#b45309', icon: Trophy },
      { id: 'history', title: t.historyTab, color: '#6366f1', icon: HistoryIcon },
    ],
    [t.historyTab, t.leaderboardTab, t.questionsTab],
  );

  const { activeTab, setActiveTab } = useQuizTabNavigation({
    subtabShortcut,
    tabsLength: tabs.length,
  });

  const {
    playerName,
    setPlayerName,
    questionSet,
    setQuestionSet,
    difficultyMode,
    setDifficultyMode,
    gameState,
    questions,
    currentIndex,
    timeLeft,
    selectedChoice,
    score,
    feedback,
    showMenuConfirm,
    setShowMenuConfirm,
    usingGlobalLeaderboard,
    isQuestionBankLoading,
    normalizedQuestions,
    availableQuestionCount,
    availableQuestionSetOptions,
    currentQuestion,
    orderingHintLines,
    displayedLeaderboard,
    displayedHistory,
    startQuiz,
    handleChoiceSelect,
    resetQuiz,
  } = useQuizGameController({ t });

  return (
    <div
      style={{
        width: '100%',
        padding: isMobile ? '24px 8px 10px 8px' : '28px 40px',
        minHeight: isMobile ? 'auto' : '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flex: 1,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: isMobile ? '20px' : '32px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0',
          position: 'relative',
          width: '100%',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 24px',
            borderRadius: '22px',
            background: '#ffffff',
            border: '3px solid #ef4444',
            borderBottom: '9px solid #b91c1c',
            boxShadow: '0 10px 0 rgba(239, 68, 68, 0.12)',
            zIndex: 1,
          }}
        >
          <Trophy size={isMobile ? 22 : 20} style={{ color: '#dc2626' }} />
          <span
            style={{
              fontFamily: '"Sniglet", "Coming Soon", cursive',
              color: '#dc2626',
              fontSize: isMobile ? '1.42rem' : '1.3rem',
              fontWeight: '400',
              letterSpacing: '0.2px',
              lineHeight: 1,
            }}
            >
            {toUiLabelCase(t.header)}
          </span>
        </motion.div>
        <div style={{ position: isMobile ? 'static' : 'absolute', right: isMobile ? 'auto' : '0' }}>
          <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} tabs={tabs} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={CONTENT_SLIDE.initial}
          animate={CONTENT_SLIDE.animate}
          exit={CONTENT_SLIDE.exit}
          transition={TRANSITION_TAB}
          className="hide-scrollbar"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: activeTab !== 0 && !isMobile ? 'auto' : 'visible',
            maxHeight: activeTab !== 0 && !isMobile ? 'min(560px, calc(100vh - 280px))' : 'none',
            padding: '4px',
          }}
        >
          {activeTab === 0 && (
            <QuestionsTab
              isMobile={isMobile}
              t={t}
              gameState={gameState}
              normalizedQuestions={normalizedQuestions}
              availableQuestionCount={availableQuestionCount}
              availableQuestionSetOptions={availableQuestionSetOptions}
              playerName={playerName}
              setPlayerName={setPlayerName}
              questionSet={questionSet}
              setQuestionSet={setQuestionSet}
              difficultyMode={difficultyMode}
              setDifficultyMode={setDifficultyMode}
              startQuiz={startQuiz}
              currentQuestion={currentQuestion}
              currentIndex={currentIndex}
              questions={questions}
              score={score}
              timeLeft={timeLeft}
              setShowMenuConfirm={setShowMenuConfirm}
              showMenuConfirm={showMenuConfirm}
              resetQuiz={resetQuiz}
              isQuestionBankLoading={isQuestionBankLoading}
              orderingHintLines={orderingHintLines}
              selectedChoice={selectedChoice}
              handleChoiceSelect={handleChoiceSelect}
              feedback={feedback}
            />
          )}

          {activeTab === 1 && (
            <LeaderboardTab
              isMobile={isMobile}
              t={t}
              usingGlobalLeaderboard={usingGlobalLeaderboard}
              displayedLeaderboard={displayedLeaderboard}
            />
          )}

          {activeTab === 2 && (
            <HistoryTab
              isMobile={isMobile}
              t={t}
              displayedHistory={displayedHistory}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showMenuConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '24px'
            }}
          >
            <motion.div 
              initial={{ scale: 0.85, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ 
                background: '#fff', 
                border: '4px solid #1f2937', 
                borderBottom: '10px solid #1f2937', 
                borderRadius: '28px', 
                padding: isMobile ? '24px' : '32px', 
                display: 'grid', 
                gap: '24px', 
                width: '100%',
                maxWidth: '440px',
                boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
                textAlign: 'center'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: isMobile ? '1.2rem' : '1.4rem', lineHeight: 1.2 }}>{t.returnMenuConfirmTitle}</span>
                <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1.05rem', lineHeight: 1.3 }}>{t.returnMenuConfirmBody}</span>
              </div>
              <div style={{ display: 'flex', gap: '14px' }}>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.9, y: 8 }}
                  onClick={() => setShowMenuConfirm(false)}
                  style={{ flex: 1, border: '3.5px solid #cbd5e1', borderBottom: '8px solid #94a3b8', background: '#f8fafc', color: '#475569', borderRadius: '22px', padding: '14px', fontFamily: 'var(--font-main)', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  {t.stayQuiz}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.9, y: 8 }}
                  onClick={resetQuiz}
                  style={{ flex: 1, border: '3.5px solid #b91c1c', borderBottom: '8px solid #991b1b', background: '#ef4444', color: '#fff', borderRadius: '22px', padding: '14px', fontFamily: 'var(--font-main)', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  {t.leaveQuiz}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizPageView;



