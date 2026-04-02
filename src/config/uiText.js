import { APP_UI_TEXT } from './appUiText';
import en from './locales/en';
import es from './locales/es';
import pt from './locales/pt';
import fr from './locales/fr';
import de from './locales/de';
import it from './locales/it';
import ja from './locales/ja';

const FULL_LOCALES = {
  en,
  es,
  pt,
  fr,
  de,
  it,
  ja,
};

const FULLY_REVIEWED_LOCALES = new Set(['en', 'ja']);

const mergeLocale = (baseLocale, shellLocale = {}) => ({
  ...baseLocale,
  ...shellLocale,
  tabs: {
    ...(baseLocale?.tabs || {}),
    ...(shellLocale?.tabs || {}),
  },
});

export const UI_TEXT = Object.fromEntries(
  Object.entries(FULL_LOCALES).map(([code, locale]) => {
    const shellLocale = APP_UI_TEXT[code] || {};
    const baseLocale = FULLY_REVIEWED_LOCALES.has(code) ? locale : en;
    return [code, mergeLocale(baseLocale, shellLocale)];
  }),
);

export default UI_TEXT;
