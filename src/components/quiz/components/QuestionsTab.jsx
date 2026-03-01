import QuestionsSetupSection from './questions/QuestionsSetupSection';
import QuestionsPlayingSection from './questions/QuestionsPlayingSection';
import QuestionsFinishedSection from './questions/QuestionsFinishedSection';

const QuestionsTab = ({
  isMobile,
  t,
  gameState,
  normalizedQuestions,
  availableQuestionCount,
  availableQuestionSetOptions,
  playerName,
  setPlayerName,
  questionSet,
  setQuestionSet,
  difficultyMode,
  setDifficultyMode,
  startQuiz,
  currentQuestion,
  currentIndex,
  questions,
  score,
  timeLeft,
  setShowMenuConfirm,
  showMenuConfirm,
  resetQuiz,
  isQuestionBankLoading,
  orderingHintLines,
  selectedChoice,
  handleChoiceSelect,
  feedback,
}) => (
  <>
    {gameState === 'setup' && (
      <QuestionsSetupSection
        isMobile={isMobile}
        t={t}
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
      />
    )}

    {gameState === 'playing' && currentQuestion && (
      <QuestionsPlayingSection
        isMobile={isMobile}
        t={t}
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

    {gameState === 'finished' && (
      <QuestionsFinishedSection
        isMobile={isMobile}
        t={t}
        score={score}
        questions={questions}
        playerName={playerName}
        resetQuiz={resetQuiz}
      />
    )}
  </>
);

export default QuestionsTab;
