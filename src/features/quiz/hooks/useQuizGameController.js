import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadQuizQuestions } from '../../../data/quizQuestionBankLoader';
import { triggerHaptic } from '../../../utils/haptics';
import { QUESTION_SET_OPTIONS, QUESTION_TIME_SECONDS, getQuestionTimeSeconds } from '../quizConstants';
import {
  buildBellCurveQuizPool,
  dedupeQuestionsByPrompt,
  getOrderingHintLines,
  normalizeQuizDifficulties,
  shuffle,
  shuffleQuestionChoices,
  sortLeaderboard,
  upsertLeaderboard,
} from '../quizUtils';
import {
  getGlobalLeaderboard,
  getGlobalResults,
  getRecentQuestionIdSet,
  getStoredHistory,
  getStoredLeaderboard,
  submitGlobalLeaderboardScore,
  submitGlobalResult,
  updateRecentQuestionIds,
} from '../quizPersistence';

export const useQuizGameController = ({ t }) => {
  const [playerName, setPlayerName] = useState('');
  const [questionSet, setQuestionSet] = useState('');
  const [difficultyMode, setDifficultyMode] = useState('');
  const [gameState, setGameState] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showMenuConfirm, setShowMenuConfirm] = useState(false);
  const [savedResult, setSavedResult] = useState(false);
  const [leaderboard, setLeaderboard] = useState(() => sortLeaderboard(getStoredLeaderboard()));
  const [usingGlobalLeaderboard, setUsingGlobalLeaderboard] = useState(true);
  const [history, setHistory] = useState(() => getStoredHistory());
  const [questionBank, setQuestionBank] = useState([]);
  const [isQuestionBankLoading, setIsQuestionBankLoading] = useState(true);

  const normalizedQuestions = useMemo(
    () => dedupeQuestionsByPrompt(normalizeQuizDifficulties(questionBank)),
    [questionBank],
  );

  const currentQuestion = questions[currentIndex] || null;
  const orderingHintLines = useMemo(() => getOrderingHintLines(currentQuestion), [currentQuestion]);
  const displayedLeaderboard = useMemo(() => sortLeaderboard(leaderboard), [leaderboard]);
  const displayedHistory = useMemo(
    () => [...history].sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0)),
    [history],
  );
  const availableQuestionCount = useMemo(() => {
    if (difficultyMode === 'random-bell') return normalizedQuestions.length;
    return normalizedQuestions.filter((question) => question.difficulty === difficultyMode).length;
  }, [difficultyMode, normalizedQuestions]);

  const availableQuestionSetOptions = useMemo(() => {
    const defaults = QUESTION_SET_OPTIONS
      .filter((option) => Number(option.key) <= availableQuestionCount)
      .map((option) => ({ ...option }));

    if (availableQuestionCount > 0 && defaults.length === 0) {
      return [{ key: String(availableQuestionCount), label: String(availableQuestionCount) }];
    }

    if (!defaults.some((option) => Number(option.key) === availableQuestionCount) && availableQuestionCount > 0) {
      return [...defaults, { key: String(availableQuestionCount), label: String(availableQuestionCount) }]
        .sort((a, b) => Number(a.key) - Number(b.key));
    }

    return defaults;
  }, [availableQuestionCount]);

  useEffect(() => {
    if (!questionSet) return;
    if (availableQuestionSetOptions.length === 0) return;
    const selectedCount = Number(questionSet);
    const isAvailable = availableQuestionSetOptions.some((option) => Number(option.key) === selectedCount);
    if (isAvailable) return;

    const fallback = availableQuestionSetOptions[availableQuestionSetOptions.length - 1];
    if (fallback?.key && fallback.key !== questionSet) {
      setQuestionSet(fallback.key);
    }
  }, [availableQuestionSetOptions, questionSet]);

  useEffect(() => {
    let cancelled = false;

    loadQuizQuestions()
      .then((questions) => {
        if (cancelled) return;
        setQuestionBank(Array.isArray(questions) ? questions : []);
      })
      .catch(() => {
        if (cancelled) return;
        setQuestionBank([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsQuestionBankLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getGlobalLeaderboard(), getGlobalResults()])
      .then(([leaderboardEntries, historyEntries]) => {
        if (cancelled) return;
        setLeaderboard(leaderboardEntries);
        setHistory(historyEntries);
        setUsingGlobalLeaderboard(true);
      })
      .catch(() => {
        if (cancelled) return;
        setUsingGlobalLeaderboard(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return undefined;
    if (selectedChoice !== null) return undefined;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState, selectedChoice]);

  const goToNextQuestion = useCallback(() => {
    setSelectedChoice(null);
    setFeedback('');

    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= questions.length) {
        setGameState('finished');
        return prev;
      }

      const nextQuestion = questions[nextIndex];
      setTimeLeft(getQuestionTimeSeconds(nextQuestion?.difficulty, difficultyMode));
      return nextIndex;
    });
  }, [difficultyMode, questions.length]);

  useEffect(() => {
    if (gameState !== 'finished' || savedResult) return;

    const nextHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: (playerName || 'Player').trim().slice(0, 24) || 'Player',
      score,
      total: questions.length,
      difficultyMode,
      questionSet,
      playedAt: Date.now(),
    };

    Promise.all([
      submitGlobalLeaderboardScore({ name: nextHistoryItem.name, score }),
      submitGlobalResult(nextHistoryItem),
    ])
      .then(([leaderboardEntries, historyEntries]) => {
        setLeaderboard(leaderboardEntries);
        setHistory(historyEntries);
        setUsingGlobalLeaderboard(true);
      })
      .catch(() => {
        const fallbackLeaderboard = upsertLeaderboard(leaderboard, nextHistoryItem.name, score);
        const fallbackHistory = [nextHistoryItem, ...history].slice(0, 30);
        setLeaderboard(fallbackLeaderboard);
        setHistory(fallbackHistory);
        setUsingGlobalLeaderboard(false);
      });

    setSavedResult(true);
  }, [difficultyMode, gameState, history, leaderboard, playerName, questionSet, questions.length, savedResult, score]);

  useEffect(() => {
    if (gameState !== 'playing' || selectedChoice !== null || timeLeft > 0) return;

    setFeedback(t.timeout);
    const timeoutId = setTimeout(goToNextQuestion, 900);
    return () => clearTimeout(timeoutId);
  }, [gameState, goToNextQuestion, selectedChoice, t.timeout, timeLeft]);

  const startQuiz = () => {
    if (isQuestionBankLoading || normalizedQuestions.length === 0) return;
    if (!playerName.trim() || !questionSet || !difficultyMode) return;

    const resolvedCount = Number(questionSet);
    const modeKey = `${difficultyMode}:${questionSet}`;
    const recentIdSet = getRecentQuestionIdSet(modeKey);
    let selectedQuestions = [];

    if (difficultyMode === 'random-bell') {
      const filtered = normalizedQuestions.filter((question) => !recentIdSet.has(question.id));
      const sourcePool = filtered.length >= resolvedCount ? filtered : normalizedQuestions;
      selectedQuestions = buildBellCurveQuizPool(sourcePool, resolvedCount);
    } else {
      const pool = dedupeQuestionsByPrompt(
        normalizedQuestions.filter((question) => question.difficulty === difficultyMode),
      );
      const targetCount = Math.min(Number(questionSet), pool.length);
      const filtered = pool.filter((question) => !recentIdSet.has(question.id));
      const preferredPool = filtered.length >= targetCount ? filtered : pool;
      selectedQuestions = shuffle(preferredPool).slice(0, targetCount);
    }

    selectedQuestions = dedupeQuestionsByPrompt(selectedQuestions);

    if (selectedQuestions.length < resolvedCount) {
      const selectedIds = new Set(selectedQuestions.map((question) => question.id));
      const fallbackPool = normalizedQuestions.filter((question) => !selectedIds.has(question.id));
      selectedQuestions = [
        ...selectedQuestions,
        ...shuffle(dedupeQuestionsByPrompt(fallbackPool)).slice(0, resolvedCount - selectedQuestions.length),
      ];
    }

    if (selectedQuestions.length === 0) return;

    const preparedQuestions = selectedQuestions.map((question) => shuffleQuestionChoices(question));

    updateRecentQuestionIds(modeKey, selectedQuestions);
    setQuestions(preparedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedChoice(null);
    setFeedback('');
    setSavedResult(false);
    setTimeLeft(getQuestionTimeSeconds(preparedQuestions[0]?.difficulty, difficultyMode));
    setShowMenuConfirm(false);
    triggerHaptic('medium');
    setGameState('playing');
  };

  const handleChoiceSelect = (choiceIndex) => {
    if (!currentQuestion || selectedChoice !== null || gameState !== 'playing') return;

    setSelectedChoice(choiceIndex);
    if (choiceIndex === currentQuestion.answer) {
      setScore((prev) => prev + 1);
      setFeedback(t.correct);
      triggerHaptic('success');
    } else {
      setFeedback(t.wrong);
      triggerHaptic('warning');
    }

    setTimeout(goToNextQuestion, 900);
  };

  const resetQuiz = () => {
    setGameState('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setTimeLeft(QUESTION_TIME_SECONDS);
    setSelectedChoice(null);
    setScore(0);
    setFeedback('');
    setShowMenuConfirm(false);
    setSavedResult(false);
    triggerHaptic('selection');
  };

  return {
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
  };
};
