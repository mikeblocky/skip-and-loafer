import { FALLBACK_COLORS } from '../chat/chatPalette';

export const PORTRAIT_DATA = [
  { name: 'Fumi', src: '/portrait/fumi.png' },
  { name: 'Kazakami', src: '/portrait/kazakami.png' },
  { name: 'Yamada', src: '/portrait/yamada.png' },
  { name: 'Makoto', src: '/portrait/makoto.png' },
  { name: 'Mika', src: '/portrait/mika.png' },
  { name: 'Mitsumi', src: '/portrait/mitsumi.png' },
  { name: 'Nao', src: '/portrait/nao.png' },
  { name: 'Kanechika', src: '/portrait/kanechika.png' },
  { name: 'Omiso', src: '/portrait/omiso.webp' },
  { name: 'Oshio', src: '/portrait/oshio.webp' },
  { name: 'Satonosuke', src: '/portrait/satonosuke.png' },
  { name: 'Shima', src: '/portrait/shima.png' },
  { name: 'Takemine', src: '/portrait/tokiko.png' },
  { name: 'Mukai', src: '/portrait/mukai.png' },
  { name: 'Yuzuki', src: '/portrait/yuzuki.png' },
  { name: 'Chris', src: '/portrait/chris.png' },
  { name: 'Ririka', src: '/portrait/rirka.webp' },
  { name: 'Ujiie', src: '/portrait/ujie.png' },
];

const NAME_TO_UI_KEY = {
  Fumi: 'Fumino',
  Kazakami: 'Hiroto',
  Takemine: 'Tokiko',
};

export const getCharacterPrediction = (name, t) => {
  const key = NAME_TO_UI_KEY[name] || name;
  return t.quiz.characters[key]?.prediction || 'A nice day awaits you!';
};
