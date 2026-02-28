export const UI_TEXT = {
  en: { chapters: 'Chapters', latest: 'latest', plusRead: '+1 read', timeLeft: 'Time left', unreadNotice: 'Notice: You have {count} unread chapter{suffix}!', unreadShort: '{count} unread chapter{suffix}!', chapterRange: 'Chapter', chaptersRange: 'Chapters', ongoing: 'ongoing', buyEN: 'Preorder/Buy EN', buyJP: 'Preorder/Buy JP', buyNative: 'Buy native', buyEnVolume: 'Buy English volume', buyJpVolume: 'Buy Japanese volume', buyNativeVolume: 'Buy native volume' },
  es: { chapters: 'Capítulos', latest: 'nuevo', plusRead: '+1 lectura', timeLeft: 'Tiempo restante', unreadNotice: 'Aviso: tienes {count} capítulo{suffix} sin leer!', unreadShort: '{count} capítulo{suffix} sin leer!', chapterRange: 'Capítulo', chaptersRange: 'Capítulos', ongoing: 'en curso', buyEN: 'Reservar/Comprar EN', buyJP: 'Reservar/Comprar JP', buyNative: 'Comprar local', buyEnVolume: 'Comprar volumen en inglés', buyJpVolume: 'Comprar volumen japonés', buyNativeVolume: 'Comprar volumen local' },
  pt: { chapters: 'Capítulos', latest: 'novo', plusRead: '+1 leitura', timeLeft: 'Tempo restante', unreadNotice: 'Aviso: você tem {count} capítulo{suffix} não lido!', unreadShort: '{count} capítulo{suffix} não lido!', chapterRange: 'Capítulo', chaptersRange: 'Capítulos', ongoing: 'em andamento', buyEN: 'Pré-venda/Comprar EN', buyJP: 'Pré-venda/Comprar JP', buyNative: 'Comprar local', buyEnVolume: 'Comprar volume em inglês', buyJpVolume: 'Comprar volume em japonês', buyNativeVolume: 'Comprar volume local' },
  fr: { chapters: 'Chapitres', latest: 'nouveau', plusRead: '+1 lecture', timeLeft: 'Temps restant', unreadNotice: 'Info : vous avez {count} chapitre{suffix} non lu !', unreadShort: '{count} chapitre{suffix} non lu !', chapterRange: 'Chapitre', chaptersRange: 'Chapitres', ongoing: 'en cours', buyEN: 'Précommander/Acheter EN', buyJP: 'Précommander/Acheter JP', buyNative: 'Acheter local', buyEnVolume: 'Acheter le volume anglais', buyJpVolume: 'Acheter le volume japonais', buyNativeVolume: 'Acheter le volume local' },
  de: { chapters: 'Kapitel', latest: 'neu', plusRead: '+1 gelesen', timeLeft: 'Verbleibende Zeit', unreadNotice: 'Hinweis: Du hast {count} ungelesene Kapitel{suffix}!', unreadShort: '{count} ungelesene Kapitel{suffix}!', chapterRange: 'Kapitel', chaptersRange: 'Kapitel', ongoing: 'laufend', buyEN: 'Vorbestellen/Kaufen EN', buyJP: 'Vorbestellen/Kaufen JP', buyNative: 'Lokal kaufen', buyEnVolume: 'Englischen Band kaufen', buyJpVolume: 'Japanischen Band kaufen', buyNativeVolume: 'Lokalen Band kaufen' },
  it: { chapters: 'Capitoli', latest: 'nuovo', plusRead: '+1 lettura', timeLeft: 'Tempo rimanente', unreadNotice: 'Avviso: hai {count} capitol{suffix} non letto!', unreadShort: '{count} capitol{suffix} non letto!', chapterRange: 'Capitolo', chaptersRange: 'Capitoli', ongoing: 'in corso', buyEN: 'Preordine/Compra EN', buyJP: 'Preordine/Compra JP', buyNative: 'Compra locale', buyEnVolume: 'Compra volume inglese', buyJpVolume: 'Compra volume giapponese', buyNativeVolume: 'Compra volume locale' },
  vi: { chapters: 'Chương', latest: 'mới nhất', plusRead: '+1 lượt đọc', timeLeft: 'Thời gian còn lại', unreadNotice: 'Lưu ý: bạn còn {count} chương chưa đọc!', unreadShort: 'Còn {count} chương chưa đọc!', chapterRange: 'Chương', chaptersRange: 'Các chương', ongoing: 'đang phát hành', buyEN: 'Đặt trước/Mua bản EN', buyJP: 'Đặt trước/Mua bản JP', buyNative: 'Mua bản địa phương', buyEnVolume: 'Mua tập tiếng Anh', buyJpVolume: 'Mua tập tiếng Nhật', buyNativeVolume: 'Mua tập bản địa phương' },
};

export const COUNTRY_CACHE_KEY = 'skip_countryCodeCache_v1';
export const COUNTRY_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

export const getCountryPluralSuffix = (lang, count) => {
  if (lang === 'it') return count > 1 ? 'i' : 'o';
  if (lang === 'de') return '';
  return count > 1 ? 's' : '';
};

const getVolumeWord = (uiLanguage = 'en') => {
  if (uiLanguage === 'es') return 'Volumen';
  if (uiLanguage === 'pt') return 'Volume';
  if (uiLanguage === 'fr') return 'Tome';
  if (uiLanguage === 'de') return 'Band';
  if (uiLanguage === 'it') return 'Volume';
  if (uiLanguage === 'vi') return 'Tập';
  return 'Volume';
};

export const getVolumeShortWord = (uiLanguage = 'en') => {
  if (uiLanguage === 'es') return 'Vol';
  if (uiLanguage === 'pt') return 'Vol';
  if (uiLanguage === 'fr') return 'T';
  if (uiLanguage === 'de') return 'Bd';
  if (uiLanguage === 'it') return 'Vol';
  if (uiLanguage === 'vi') return 'Tập';
  return 'Vol';
};

export const getVolumeTitle = (uiLanguage = 'en', volumeNumber) => `${getVolumeWord(uiLanguage)} ${volumeNumber}`;

export const getLocaleRegion = () => {
  const locale = navigator?.language || navigator?.languages?.[0] || '';
  const region = locale.split('-')?.[1]?.toUpperCase();
  return /^[A-Z]{2}$/.test(region || '') ? region : null;
};

const LANGUAGE_CODE_BY_COUNTRY = {
  ES: 'es',
  MX: 'es',
  PT: 'pt',
  BR: 'pt-BR',
  DE: 'de',
  IT: 'it',
  FR: 'fr',
  VN: 'vi',
};

const NATIVE_LANGUAGE_LABEL_FALLBACK = {
  en: { ES: 'Spanish', MX: 'Spanish', PT: 'Portuguese', BR: 'Brazilian Portuguese', DE: 'German', IT: 'Italian', FR: 'French', VN: 'Vietnamese' },
  es: { ES: 'español', MX: 'español', PT: 'portugués', BR: 'portugués brasileño', DE: 'alemán', IT: 'italiano', FR: 'francés', VN: 'vietnamita' },
  pt: { ES: 'espanhol', MX: 'espanhol', PT: 'português', BR: 'português brasileiro', DE: 'alemão', IT: 'italiano', FR: 'francês', VN: 'vietnamita' },
  fr: { ES: 'espagnol', MX: 'espagnol', PT: 'portugais', BR: 'portugais brésilien', DE: 'allemand', IT: 'italien', FR: 'français', VN: 'vietnamien' },
  de: { ES: 'Spanisch', MX: 'Spanisch', PT: 'Portugiesisch', BR: 'Brasilianisches Portugiesisch', DE: 'Deutsch', IT: 'Italienisch', FR: 'Französisch', VN: 'Vietnamesisch' },
  it: { ES: 'spagnolo', MX: 'spagnolo', PT: 'portoghese', BR: 'portoghese brasiliano', DE: 'tedesco', IT: 'italiano', FR: 'francese', VN: 'vietnamita' },
  vi: { ES: 'tiếng Tây Ban Nha', MX: 'tiếng Tây Ban Nha', PT: 'tiếng Bồ Đào Nha', BR: 'tiếng Bồ Đào Nha (Brazil)', DE: 'tiếng Đức', IT: 'tiếng Ý', FR: 'tiếng Pháp', VN: 'tiếng Việt' },
};

export const getNativeLanguageName = (countryCode, uiLanguage = 'en') => {
  if (!countryCode) return '';

  const langCode = LANGUAGE_CODE_BY_COUNTRY[countryCode];
  if (langCode) {
    try {
      if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
        const languageNames = new Intl.DisplayNames([uiLanguage, 'en'], { type: 'language' });
        const localized = languageNames.of(langCode);
        if (localized) return localized;
      }
    } catch {
    }
  }

  const fallbackByUi = NATIVE_LANGUAGE_LABEL_FALLBACK[uiLanguage] || NATIVE_LANGUAGE_LABEL_FALLBACK.en;
  return fallbackByUi[countryCode] || NATIVE_LANGUAGE_LABEL_FALLBACK.en[countryCode] || countryCode;
};

export const getNativeVolumeLabel = (uiLanguage, nativeLanguageName, t) => {
  if (!nativeLanguageName) return t.buyNativeVolume;

  if (uiLanguage === 'es') return `Comprar volumen en ${nativeLanguageName}`;
  if (uiLanguage === 'pt') return `Comprar volume em ${nativeLanguageName}`;
  if (uiLanguage === 'fr') return `Acheter le volume ${nativeLanguageName}`;
  if (uiLanguage === 'de') return `${nativeLanguageName}-Band kaufen`;
  if (uiLanguage === 'it') return `Compra volume ${nativeLanguageName}`;
  if (uiLanguage === 'vi') return `Mua tập ${nativeLanguageName}`;
  return `Buy ${nativeLanguageName} volume`;
};
