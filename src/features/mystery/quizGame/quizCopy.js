const EMPTY_QUESTION_COPY = Object.freeze({});

export const getLocalizedQuizQuestion = (t, questionId) => t?.quiz?.questions?.[questionId] || EMPTY_QUESTION_COPY;

export const getLocalizedQuizText = (t, questionId, key, fallback = '') => (
  getLocalizedQuizQuestion(t, questionId)?.[key] ?? fallback
);

export const getLocalizedQuizOption = (t, questionId, index, fallback = '') => (
  getLocalizedQuizQuestion(t, questionId)?.options?.[index] ?? fallback
);
