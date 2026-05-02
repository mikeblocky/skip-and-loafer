import { FALLBACK_COLORS } from '../chat/chatPalette';
import { getCharacterDisplayName } from '../../data/characterNames';

export const PORTRAIT_DATA = [
  { name: 'Fumi', src: '/icon/fumi.png' },
  { name: 'Kazakami', src: '/icon/kazakami.png' },
  { name: 'Makoto', src: '/icon/makoto.jpg' },
  { name: 'Mika', src: '/icon/mika.png' },
  { name: 'Mitsumi', src: '/icon/mitsumi.jpg' },
  { name: 'Nao', src: '/icon/nao.png' },
  { name: 'Kanechika', src: '/icon/kanechika.png' },
  { name: 'Omiso', src: '/icon/omiso.webp' },
  { name: 'Oshio', src: '/icon/oshio.webp' },
  { name: 'Satonosuke', src: '/icon/satonosuke.png' },
  { name: 'Shima', src: '/icon/shima.jpg' },
  { name: 'Takamine', src: '/icon/takamine.png' },
  { name: 'Mukai', src: '/icon/mukai.jpg' },
  { name: 'Yuzuki', src: '/icon/yuzuki.png' },
  { name: 'Chris', src: '/icon/chris.png' },
  { name: 'Ririka', src: '/icon/rirka.webp' },
  { name: 'Ujiie', src: '/icon/ujie.png' },
  { name: 'Yamada', src: '/icon/yamada.jpg' },
];

const NAME_TO_UI_KEY = {
  Fumi: 'Fumino',
  Kazakami: 'Hiroto',
  Takemine: 'Tokiko',
};

export const getCharacterPrediction = (name, t, uiLanguage = 'en') => {
  const key = NAME_TO_UI_KEY[name] || name;
  return t.quiz.characters[key]?.prediction || (
    uiLanguage === 'ja'
      ? `${getCharacterDisplayName(key, uiLanguage)}には、きっと良い一日が待っています。`
      : 'A nice day awaits you!'
  );
};
