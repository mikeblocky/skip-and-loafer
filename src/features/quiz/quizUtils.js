import { DIFFICULTY_OPTIONS, QUESTION_TIME_BY_DIFFICULTY, QUESTION_TIME_RANDOM_SECONDS } from './quizConstants';

export const shuffle = (array) => {
  const next = [...array];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
};

export const shuffleQuestionChoices = (question) => {
  if (!question || !Array.isArray(question.choices) || question.choices.length === 0) return question;

  const indexedChoices = question.choices.map((choice, index) => ({ choice, index }));
  const shuffledChoices = shuffle(indexedChoices);
  const remappedAnswerIndex = shuffledChoices.findIndex((entry) => entry.index === question.answer);

  return {
    ...question,
    choices: shuffledChoices.map((entry) => entry.choice),
    answer: remappedAnswerIndex >= 0 ? remappedAnswerIndex : question.answer,
  };
};

const normalizePromptKey = (prompt) => (prompt || '').toLowerCase().replace(/\s+/g, ' ').trim();

export const dedupeQuestionsByPrompt = (questions) => {
  const seen = new Set();
  const deduped = [];
  for (const question of questions) {
    const key = normalizePromptKey(question.prompt);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(question);
  }
  return deduped;
};

const ORDERING_EVENT_HINTS = {
  136: [
    '1. Cultural Festival Play',
    "2. Mika's Valentine's Confession",
    "3. Mitsumi & Shima's Trial Dating",
    "4. Maharu's Visit to Tokyo",
  ],
};

const ORDERING_EVENT_HINTS_JA = {
  136: [
    '1. 文化祭の劇',
    '2. ミカのバレンタイン告白',
    '3. 美津未と志摩の試し交際',
    '4. 真春の東京訪問',
  ],
};

export const getOrderingHintLines = (question, uiLanguage = 'en') => {
  if (!question) return [];
  if (uiLanguage === 'ja' && Array.isArray(ORDERING_EVENT_HINTS_JA[question.id])) return ORDERING_EVENT_HINTS_JA[question.id];
  if (Array.isArray(ORDERING_EVENT_HINTS[question.id])) return ORDERING_EVENT_HINTS[question.id];

  if (!/(arrange|chronolog|sequence|order)/i.test(question.prompt || '')) return [];

  const usesNumericPattern = (question.choices || []).every((choice) => /^\s*\d+(\s*->\s*\d+)+\s*$/.test(choice || ''));
  if (!usesNumericPattern) return [];

  return [
    '1. Cultural Festival Play',
    "2. Mika's Valentine's Confession",
    "3. Mitsumi & Shima's Trial Dating",
    "4. Maharu's Visit to Tokyo",
  ];
};

export const normalizeQuizDifficulties = (questions) => {
  return questions.map((question) => {
    if (['easy', 'medium', 'hard', 'really-hard'].includes(question.difficulty)) {
      return question;
    }

    if (question.id <= 20) return { ...question, difficulty: 'easy' };
    if (question.id <= 40) return { ...question, difficulty: 'medium' };
    if (question.id <= 70) return { ...question, difficulty: 'hard' };
    return { ...question, difficulty: 'really-hard' };
  });
};

export const getDifficultyLabel = (difficultyKey, t) => {
  if (difficultyKey === 'easy') return t?.difficultyEasy || 'Easy';
  if (difficultyKey === 'medium') return t?.difficultyMedium || 'Medium';
  if (difficultyKey === 'hard') return t?.difficultyHard || 'Hard';
  if (difficultyKey === 'really-hard') return t?.difficultyReallyHard || 'Really hard';
  if (difficultyKey === 'random-bell') return t?.difficultyRandom || t?.randomBell || 'Random';
  return DIFFICULTY_OPTIONS.find((option) => option.key === difficultyKey)?.label || difficultyKey;
};

export const getQuestionSetLabel = (setKey, t) => {
  void t;
  return setKey;
};

export const withOpacity = (hexColor, alphaHex = '22') => `${hexColor}${alphaHex}`;

const QUESTION_SET_COLORS = {
  10: '#22c55e',
  20: '#10b981',
  30: '#14b8a6',
  35: '#3b82f6',
  50: '#06b6d4',
  75: '#8b5cf6',
  100: '#f59e0b',
};

export const getQuestionSetChipColor = (setKey) => QUESTION_SET_COLORS[Number(setKey)] || '#6b7280';

export const normalizeScoreToHundred = (score) => {
  const safeScore = Number(score) || 0;
  return Math.max(0, Math.min(100, safeScore));
};

export const getDifficultyChipLabel = (key) => {
  if (key === 'easy') return 'Easy';
  if (key === 'medium') return 'Medium';
  if (key === 'hard') return 'Hard';
  if (key === 'really-hard') return 'Really hard';
  return 'Random';
};

export const getDifficultyTimerLabel = (key, uiLanguage = 'en') => {
  if (uiLanguage === 'ja') {
    if (key === 'random-bell') return `${QUESTION_TIME_RANDOM_SECONDS}秒`;
    const seconds = QUESTION_TIME_BY_DIFFICULTY[key] || QUESTION_TIME_BY_DIFFICULTY.medium;
    return `${seconds}秒`;
  }

  if (key === 'random-bell') return `${QUESTION_TIME_RANDOM_SECONDS}s`;
  const seconds = QUESTION_TIME_BY_DIFFICULTY[key] || QUESTION_TIME_BY_DIFFICULTY.medium;
  return `${seconds}s`;
};

export const buildBellCurveQuizPool = (questions, desiredCount) => {
  const byDifficulty = {
    easy: questions.filter((question) => question.difficulty === 'easy'),
    medium: questions.filter((question) => question.difficulty === 'medium'),
    hard: questions.filter((question) => question.difficulty === 'hard'),
    'really-hard': questions.filter((question) => question.difficulty === 'really-hard'),
  };

  const weights = [
    { key: 'easy', weight: 1 },
    { key: 'medium', weight: 3 },
    { key: 'hard', weight: 3 },
    { key: 'really-hard', weight: 1 },
  ];
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  const safeDesiredCount = Math.max(1, Math.min(desiredCount, questions.length));

  const targetCounts = {};
  let allocated = 0;
  const fractions = [];

  for (const item of weights) {
    const rawTarget = (safeDesiredCount * item.weight) / totalWeight;
    const baseTarget = Math.floor(rawTarget);
    targetCounts[item.key] = baseTarget;
    allocated += baseTarget;
    fractions.push({ key: item.key, fraction: rawTarget - baseTarget });
  }

  let remaining = safeDesiredCount - allocated;
  fractions.sort((a, b) => b.fraction - a.fraction);
  for (const item of fractions) {
    if (remaining <= 0) break;
    targetCounts[item.key] += 1;
    remaining -= 1;
  }

  let selected = [];
  for (const item of weights) {
    selected = [...selected, ...shuffle(byDifficulty[item.key]).slice(0, Math.min(targetCounts[item.key], byDifficulty[item.key].length))];
  }

  if (selected.length < safeDesiredCount) {
    const selectedIds = new Set(selected.map((question) => question.id));
    const remainderPool = shuffle(questions.filter((question) => !selectedIds.has(question.id)));
    selected = [...selected, ...remainderPool.slice(0, safeDesiredCount - selected.length)];
  }

  return shuffle(selected).slice(0, safeDesiredCount);
};

export const sortLeaderboard = (entries) => {
  return [...entries].sort((a, b) => {
    if (normalizeScoreToHundred(b.bestScore) !== normalizeScoreToHundred(a.bestScore)) {
      return normalizeScoreToHundred(b.bestScore) - normalizeScoreToHundred(a.bestScore);
    }
    if (a.played !== b.played) return a.played - b.played;
    return (a.name || '').localeCompare(b.name || '');
  });
};

export const upsertLeaderboard = (entries, name, score) => {
  const normalizedName = (name || 'Player').trim().slice(0, 24) || 'Player';
  const existing = entries.find((entry) => entry.name.toLowerCase() === normalizedName.toLowerCase());
  if (!existing) {
    return sortLeaderboard([
      ...entries,
      {
        name: normalizedName,
        bestScore: normalizeScoreToHundred(score),
        played: 1,
        updatedAt: Date.now(),
      },
    ]);
  }

  const updated = entries.map((entry) => {
    if (entry.name.toLowerCase() !== normalizedName.toLowerCase()) return entry;
    return {
      ...entry,
      name: normalizedName,
      bestScore: Math.max(normalizeScoreToHundred(entry.bestScore), normalizeScoreToHundred(score)),
      played: (entry.played || 0) + 1,
      updatedAt: Date.now(),
    };
  });
  return sortLeaderboard(updated);
};
