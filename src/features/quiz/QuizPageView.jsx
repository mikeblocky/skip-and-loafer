import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageLayout from '../../components/shared/paper/PageLayout';
import { History as HistoryIcon, ListChecks, Trophy } from 'lucide-react';
import { TabSelector } from '../sync/syncSharedComponents';
import { CONTENT_SLIDE, TRANSITION_TAB } from '../../components/shared/animationPresets';
import { QUIZ_UI_TEXT as UI_TEXT } from '../../i18n/quiz';
import QuestionsTab from './components/QuestionsTab';
import LeaderboardTab from './components/LeaderboardTab';
import HistoryTab from './components/HistoryTab';
import { useQuizGameController } from './hooks/useQuizGameController';
import { useQuizTabNavigation } from './hooks/useQuizTabNavigation';
import { toUiLabelCase } from '../../utils/textCase';
import usePageTitle from '../../hooks/shared/usePageTitle';
import { getUI } from '../../i18n/ui';
import PaperPageHeader from '../../components/shared/paper/PaperPageHeader';
import PaperHeadingBadge from '../../components/shared/paper/PaperHeadingBadge';

const QuizPageView = ({ isMobile, uiLanguage = 'en', subtabShortcut }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const tGlobal = getUI(uiLanguage);

  usePageTitle(tGlobal.tabs?.quiz?.label || 'Quiz');

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
  } = useQuizGameController({ t, uiLanguage });

  const totalPlayed = useMemo(() => displayedHistory.length, [displayedHistory]);

  const bestScorePercent = useMemo(() => {
    if (displayedHistory.length === 0) return 0;
    const percentages = displayedHistory.map((h) => {
      const total = h.total || 10;
      return Math.round((h.score / total) * 100);
    });
    return Math.max(...percentages);
  }, [displayedHistory]);

  const pillStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 22px',
    minWidth: '112px',
    minHeight: '54px',
    background: '#ffffff',
    borderRadius: '999px',
    fontFamily: '"Sniglet", "Coming Soon", cursive',
    fontSize: isMobile ? '0.94rem' : '1.1rem',
    fontWeight: '400',
    lineHeight: 1,
    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)',
  };

  const playedPillPalette = {
    border: '3px solid #fbbf24',
    borderBottom: '8.5px solid #f59e0b',
    color: '#92400e',
  };

  const bestPillPalette = {
    border: '3px solid #93c5fd',
    borderBottom: '8.5px solid #2563eb',
    color: '#1d4ed8',
  };

  return (
    <PageLayout isMobile={isMobile} style={{ minHeight: isMobile ? 'auto' : '600px' }}>
      {/* Redesigned, beautifully balanced Quiz Header Dashboard */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'center' : 'space-between',
          alignItems: 'center',
          gap: '14px',
          width: '100%',
          marginBottom: '20px',
          borderBottom: '2.5px dashed #cbd5e1',
          paddingBottom: '14px',
        }}
      >
        {/* Played / Best stats pills on the left */}
        {gameState === 'setup' ? (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0, x: isMobile ? 0 : -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              style={{ ...pillStyle, ...playedPillPalette }}
            >
              {uiLanguage === 'ja'
                ? `${totalPlayed}${t.historyPlayed || '回'}`
                : `${totalPlayed} ${t.historyPlayed || 'played'}`}
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0, x: isMobile ? 0 : -10 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              style={{ ...pillStyle, ...bestPillPalette }}
            >
              {uiLanguage === 'ja'
                ? `${t.bestScore || '最高'} ${bestScorePercent}%`
                : `${bestScorePercent}% ${t.bestScore || 'Best'}`}
            </motion.div>
          </div>
        ) : <div />}

        {/* Quiz Sub-tab Selector on the right */}
        <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end', minWidth: 0 }}>
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
            overflow: 'visible',
            minHeight: 0,
            padding: '4px 4px 24px',
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
                border: '2.5px solid #1f2937', 
                borderBottom: '6px solid #1f2937', 
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
                  whileHover={{ scale: 1.015, y: -1.5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMenuConfirm(false)}
                  style={{ flex: 1, border: '2.5px solid #cbd5e1', borderBottom: '6px solid #94a3b8', background: '#f8fafc', color: '#475569', borderRadius: '22px', padding: '14px', fontFamily: 'var(--font-main)', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  {t.stayQuiz}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.015, y: -1.5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetQuiz}
                  style={{ flex: 1, border: '2.5px solid #b91c1c', borderBottom: '6px solid #991b1b', background: '#ef4444', color: '#fff', borderRadius: '22px', padding: '14px', fontFamily: 'var(--font-main)', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  {t.leaveQuiz}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default QuizPageView;
