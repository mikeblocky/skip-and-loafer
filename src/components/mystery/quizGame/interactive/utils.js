import { ANIMAL_CARD_COLORS } from '../../../../data/animalQuizData';
import { CHARACTER_COLORS } from '../../../../data/characters';

export const shuffleArray = (items) => [...items].sort(() => Math.random() - 0.5);

export const formatElapsedTime = (elapsedMs = 0) => `${(elapsedMs / 1000).toFixed(1)}s`;

export const PUBLIC_MEMORY_PORTRAITS = [
  { name: 'Chris', src: '/portrait/chris.png' },
  { name: 'Fumi', src: '/portrait/fumi.png' },
  { name: 'Kanechika', src: '/portrait/kanechika.png' },
  { name: 'Kazakami', src: '/portrait/kazakami.png' },
  { name: 'Makoto', src: '/portrait/makoto.png' },
  { name: 'Mika', src: '/portrait/mika.png' },
  { name: 'Mitsumi', src: '/portrait/mitsumi.png' },
  { name: 'Mukai', src: '/portrait/mukai.png' },
  { name: 'Nao', src: '/portrait/nao.png' },
  { name: 'Omiso', src: '/portrait/omiso.webp' },
  { name: 'Oshio', src: '/portrait/oshio.webp' },
  { name: 'Ririka', src: '/portrait/rirka.webp' },
  { name: 'Satonosuke', src: '/portrait/satonosuke.png' },
  { name: 'Shima', src: '/portrait/shima.png' },
  { name: 'Tokiko', src: '/portrait/tokiko.png' },
  { name: 'Ujiie', src: '/portrait/ujie.png' },
  { name: 'Yamada', src: '/portrait/yamada.png' },
  { name: 'Yuzuki', src: '/portrait/yuzuki.png' },
];

export const MEMORY_FALLBACK_COLORS = [
  { bg: '#ffe4ec', border: '#f472b6', text: '#9d174d' },
  { bg: '#e0f2fe', border: '#38bdf8', text: '#075985' },
  { bg: '#fff1d6', border: '#fbbf24', text: '#92400e' },
  { bg: '#dcfce7', border: '#34d399', text: '#065f46' },
  { bg: '#f1edff', border: '#a78bfa', text: '#5b21b6' },
  { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  { bg: '#fce7f3', border: '#db2777', text: '#831843' },
];

export const getMemoryCardPalette = (name = '') => {
  if (ANIMAL_CARD_COLORS[name]) return ANIMAL_CARD_COLORS[name];

  const mappedKey = Object.keys(CHARACTER_COLORS).find(
    (key) => key.includes(name) || name.includes(key.split(' ')[0]),
  );

  if (mappedKey && CHARACTER_COLORS[mappedKey]) return CHARACTER_COLORS[mappedKey];
  return MEMORY_FALLBACK_COLORS[name.length % MEMORY_FALLBACK_COLORS.length];
};

export const instructionStyle = (isMobile) => ({
  marginTop: '2px',
  fontFamily: 'var(--font-hand)',
  color: '#64748b',
  fontSize: isMobile ? '0.95rem' : '1rem',
  textAlign: 'center',
  lineHeight: 1.35,
});

export const createInitialReactionState = () => ({
  phase: 'idle',
  latency: null,
  falseStart: false,
});

export const createInitialTimingState = () => ({
  phase: 'idle',
  progress: 0.12,
  direction: 1,
  accuracy: null,
});

export const createInitialMemoryState = (questionType) => ({
  phase: questionType === 'flip' ? 'preview' : 'idle',
  flippedIds: [],
  matchedPairIds: [],
  elapsedMs: 0,
  completedMs: null,
  resultTier: null,
  modalOpen: false,
});

export const buildMemoryDeck = ({ portraitData = [], question }) => {
  if (question.type !== 'flip') return [];

  const pairCount = question.pairCount || 5;
  const filteredPortraits = (portraitData || []).filter((item) => item?.src);
  const sourcePool = filteredPortraits.length ? filteredPortraits : PUBLIC_MEMORY_PORTRAITS;
  const sourcePortraits = shuffleArray(sourcePool).slice(0, pairCount);
  const fallbackPortraits = Array.from({ length: pairCount }, (_, index) => ({
    name: `Card ${index + 1}`,
    src: '',
  }));
  const chosen = sourcePortraits.length >= pairCount ? sourcePortraits : fallbackPortraits;

  return shuffleArray(
    chosen.flatMap((item, index) => ([
      {
        id: `${question.id}-${index}-a`,
        pairId: index,
        name: item.name,
        src: item.src,
        colors: getMemoryCardPalette(item.name),
      },
      {
        id: `${question.id}-${index}-b`,
        pairId: index,
        name: item.name,
        src: item.src,
        colors: getMemoryCardPalette(item.name),
      },
    ])),
  );
};
