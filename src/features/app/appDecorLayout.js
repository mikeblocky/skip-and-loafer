import { CHARACTER_DATA } from '../../data/characters';
import { COVER_IMAGES } from '../../data/coverImages';

const DEFAULT_VIEWPORT = {
  width: 1200,
  height: 800,
};

const getViewport = () => {
  if (typeof window === 'undefined') return DEFAULT_VIEWPORT;

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const createInitialCardPositions = () => {
  const viewport = getViewport();

  return COVER_IMAGES.map(() => ({
    x: Math.random() * Math.max(viewport.width - 220, 0),
    y: Math.random() * Math.max(viewport.height - 180, 0),
    rotation: Math.random() * 20 - 10,
  }));
};

export const createStickerLayoutById = () => {
  const shuffled = CHARACTER_DATA.map((character) => character.id);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  const splitIndex = Math.ceil(shuffled.length / 2);
  const leftIds = shuffled.slice(0, splitIndex);
  const rightIds = shuffled.slice(splitIndex);
  const layout = {};

  leftIds.forEach((id, index) => {
    layout[id] = { side: 'left', rank: index, count: leftIds.length };
  });

  rightIds.forEach((id, index) => {
    layout[id] = { side: 'right', rank: index, count: rightIds.length };
  });

  return layout;
};
