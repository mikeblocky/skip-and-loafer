const TILTS = [-1.5, 1, -2, 1.5, -1, 2];

export const getBlogListItemInitial = (index) => ({
  opacity: 0,
  y: 30,
  scale: 0.95,
  rotate: index % 2 === 0 ? -5 : 5,
});

export const getBlogListItemAnimate = (index) => ({ 
  opacity: 1, 
  y: 0, 
  scale: 1,
  rotate: TILTS[index % TILTS.length] 
});

export const getBlogListItemTransition = (index) => ({
  delay: index * 0.05,
  type: 'spring',
  stiffness: 220,
  damping: 22,
});
