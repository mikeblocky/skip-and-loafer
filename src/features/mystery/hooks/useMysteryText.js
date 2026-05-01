import en from '../../../config/locales/en';

const ENGLISH_MYSTERY_TEXT = Object.freeze({
  mystery: en.mystery || {},
  quiz: en.quiz || {},
});

export function useMysteryText() {
  return { text: ENGLISH_MYSTERY_TEXT, isReady: true };
}

export default useMysteryText;
