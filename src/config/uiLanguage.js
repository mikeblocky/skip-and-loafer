import { IS_PRODUCTION_SERVER } from './runtimeFlags';

export const SUPPORTED_UI_LANGUAGES = ['en', 'es', 'pt', 'fr', 'de', 'it', 'ja'];

export const getSupportedUiLanguages = () => (
  IS_PRODUCTION_SERVER
    ? SUPPORTED_UI_LANGUAGES.filter((code) => code !== 'ja')
    : SUPPORTED_UI_LANGUAGES
);

export const detectUiLanguageFromLocation = () => {
  if (typeof navigator === 'undefined') return 'en';

  const localeCandidates = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ].filter(Boolean);

  for (const locale of localeCandidates) {
    const code = String(locale).toLowerCase();
    if (code.startsWith('es')) return 'es';
    if (code.startsWith('pt')) return 'pt';
    if (code.startsWith('fr')) return 'fr';
    if (code.startsWith('de')) return 'de';
    if (code.startsWith('it')) return 'it';
    if (code.startsWith('ja')) return 'ja';
    if (code.startsWith('en')) return 'en';
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (timeZone.includes('Madrid') || timeZone.includes('Mexico') || timeZone.includes('Buenos_Aires')) return 'es';
  if (timeZone.includes('Sao_Paulo') || timeZone.includes('Lisbon')) return 'pt';
  if (timeZone.includes('Paris')) return 'fr';
  if (timeZone.includes('Berlin')) return 'de';
  if (timeZone.includes('Rome')) return 'it';
  if (timeZone.includes('Tokyo')) return 'ja';
  return 'en';
};

export const getInitialUiLanguage = (storageKey) => {
  const supportedUiLanguages = getSupportedUiLanguages();

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved && supportedUiLanguages.includes(saved)) return saved;
    const detected = detectUiLanguageFromLocation();
    return supportedUiLanguages.includes(detected) ? detected : 'en';
  } catch {
    const detected = detectUiLanguageFromLocation();
    return supportedUiLanguages.includes(detected) ? detected : 'en';
  }
};
