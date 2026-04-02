const JAPANESE_CHARACTER_NAMES = {
  Mitsumi: { name: '岩倉 美津未', fullName: '岩倉 美津未' },
  Shima: { name: '志摩 聡介', fullName: '志摩 聡介' },
  Mika: { name: '江頭 ミカ', fullName: '江頭 ミカ' },
  Yuzuki: { name: '村重 結月', fullName: '村重 結月' },
  Makoto: { name: '久留米 誠', fullName: '久留米 誠' },
  Mukai: { name: '迎井 司', fullName: '迎井 司' },
  Yamada: { name: '山田 建斗', fullName: '山田 建斗' },
  Takamine: { name: '高嶺 十貴子', fullName: '高嶺 十貴子' },
  Kanechika: { name: '兼近 鳴海', fullName: '兼近 鳴海' },
  Kazakami: { name: '風上 紘人', fullName: '風上 紘人' },
  Chris: { name: '西城 梨々華', fullName: '西城 梨々華' },
  Ririka: { name: '福永 玖里寿', fullName: '福永 玖里寿' },
  Nao: { name: 'ナオちゃん / 岩倉 直樹', fullName: 'ナオちゃん / 岩倉 直樹' },
  Fumi: { name: 'ふみ', fullName: 'ふみ' },
};

export const getCharacterDisplayName = (key, uiLanguage = 'en') => {
  if (uiLanguage === 'ja') {
    return JAPANESE_CHARACTER_NAMES[key]?.name || key;
  }

  return key;
};

export const getCharacterFullName = (key, uiLanguage = 'en', fallback = key) => {
  if (uiLanguage === 'ja') {
    return JAPANESE_CHARACTER_NAMES[key]?.fullName || fallback;
  }

  return fallback;
};

