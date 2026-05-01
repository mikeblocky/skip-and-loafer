const EMPTY_QUESTION_COPY = Object.freeze({});

const resolveQuizCopyValue = (value, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const localized = value.en ?? Object.values(value).find((entry) => typeof entry === 'string');
    return typeof localized === 'string' ? localized : fallback;
  }
  return fallback;
};

export const getLocalizedQuizQuestion = (t, questionId) => t?.quiz?.questions?.[questionId] || EMPTY_QUESTION_COPY;

export const getLocalizedQuizText = (t, questionId, key, fallback = '') => (
  resolveQuizCopyValue(getLocalizedQuizQuestion(t, questionId)?.[key], fallback)
);

export const getLocalizedQuizOption = (t, questionId, index, fallback = '') => (
  resolveQuizCopyValue(getLocalizedQuizQuestion(t, questionId)?.options?.[index], fallback)
);
