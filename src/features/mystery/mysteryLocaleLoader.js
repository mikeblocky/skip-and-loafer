const DEFAULT_LANGUAGE = 'en';

const localeLoaders = import.meta.glob('../../config/locales/*.js');
const localePromiseCache = new Map();

const resolveLocaleKey = (uiLanguage = DEFAULT_LANGUAGE) => {
  const normalizedLanguage = typeof uiLanguage === 'string' ? uiLanguage.toLowerCase() : DEFAULT_LANGUAGE;
  const requestedKey = `../../config/locales/${normalizedLanguage}.js`;

  if (localeLoaders[requestedKey]) {
    return requestedKey;
  }

  return `../../config/locales/${DEFAULT_LANGUAGE}.js`;
};

const normalizeMysteryText = (localeModule) => {
  const locale = localeModule?.default || {};

  return {
    mystery: locale.mystery || {},
    quiz: locale.quiz || {},
  };
};

export function loadMysteryText(uiLanguage = DEFAULT_LANGUAGE) {
  const localeKey = resolveLocaleKey(uiLanguage);
  const cachedPromise = localePromiseCache.get(localeKey);

  if (cachedPromise) {
    return cachedPromise;
  }

  const nextPromise = localeLoaders[localeKey]().then(normalizeMysteryText);
  localePromiseCache.set(localeKey, nextPromise);
  return nextPromise;
}

export const preloadMysteryText = loadMysteryText;
