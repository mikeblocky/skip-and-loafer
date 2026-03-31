export const QUESTION_TIME_SECONDS = 45;

export const QUESTION_TIME_BY_DIFFICULTY = {
  easy: 30,
  medium: 30,
  hard: 45,
  'really-hard': 45,
};

export const QUESTION_TIME_RANDOM_SECONDS = 30;

export const getQuestionTimeSeconds = (difficultyKey, modeKey) => {
  if (modeKey === 'random-bell') return QUESTION_TIME_RANDOM_SECONDS;
  return QUESTION_TIME_BY_DIFFICULTY[difficultyKey] || QUESTION_TIME_SECONDS;
};

export const DIFFICULTY_OPTIONS = [
  { key: 'easy', label: 'Easy', color: '#22c55e' },
  { key: 'medium', label: 'Medium', color: '#3b82f6' },
  { key: 'hard', label: 'Hard', color: '#f97316' },
  { key: 'really-hard', label: 'Really hard', color: '#ef4444' },
];

export const QUESTION_SET_OPTIONS = [
  { key: '10', label: '10' },
  { key: '20', label: '20' },
  { key: '35', label: '35' },
  { key: '50', label: '50' },
  { key: '75', label: '75' },
  { key: '100', label: '100' },
];

export const DIFFICULTY_MODE_OPTIONS = [
  ...DIFFICULTY_OPTIONS.map((option) => ({ key: option.key, label: option.label, color: option.color })),
  { key: 'random-bell', label: 'Random', color: '#8b5cf6' },
];
