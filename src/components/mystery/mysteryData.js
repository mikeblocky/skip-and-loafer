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

export const FALLBACK_COLORS = [
  { bg: '#ffe4ec', border: '#f472b6', text: '#9d174d' },
  { bg: '#e0f2fe', border: '#38bdf8', text: '#075985' },
  { bg: '#fff1d6', border: '#fbbf24', text: '#92400e' },
  { bg: '#dcfce7', border: '#34d399', text: '#065f46' },
  { bg: '#f1edff', border: '#a78bfa', text: '#5b21b6' },
  { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  { bg: '#fce7f3', border: '#db2777', text: '#831843' },
];

export const getCharacterPrediction = (name, t) => {
  const key = NAME_TO_UI_KEY[name] || name;
  return t.quiz.characters[key]?.prediction || 'A nice day awaits you!';
};
