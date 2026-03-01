import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { History as HistoryIcon, ListChecks, Trophy } from 'lucide-react';
import { TabSelector } from '../sync/syncSharedComponents';
import { CONTENT_SLIDE, TRANSITION_TAB } from '../shared/animationPresets';
import { UI_TEXT } from './quizText';
import QuestionsTab from './components/QuestionsTab';
import LeaderboardTab from './components/LeaderboardTab';
import HistoryTab from './components/HistoryTab';
import { useQuizGameController } from './hooks/useQuizGameController';
import { useQuizTabNavigation } from './hooks/useQuizTabNavigation';

const QuizPageView = ({ isMobile, uiLanguage = 'en', subtabShortcut }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;

  const tabs = useMemo(
    () => [
      { id: 'questions', title: t.questionsTab, color: '#ef4444', icon: ListChecks },
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
        overflow: 'visible',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'space-between',
          marginBottom: isMobile ? '16px' : '26px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', justifyContent: 'center' }}>
          <Trophy size={isMobile ? 24 : 22} style={{ color: '#ef4444' }} />
          <span
            style={{
              fontFamily: 'Sniglet, var(--font-main)',
              color: '#6b7280',
              fontSize: isMobile ? '1.5rem' : '1.3rem',
              fontWeight: 'normal',
            }}
          >
            {t.header}
          </span>
        </div>
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} tabs={tabs} />
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
    </div>
  );
};

export default QuizPageView;
