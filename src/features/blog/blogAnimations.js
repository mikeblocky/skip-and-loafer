const TILTS = [-1.5, 1, -2, 1.5, -1, 2];
 
export const getBlogListItemInitial = (index) => ({
  opacity: 0,
  y: -80,
  scale: 0.8,
  rotate: index % 2 === 0 ? -3 : 3,
});
 
export const getBlogListItemAnimate = (index) => ({ 
  opacity: 1, 
  y: 0, 
  scale: 1,
  rotate: TILTS[index % TILTS.length] 
});
 
export const getBlogListItemTransition = (index) => ({
  delay: index * 0.1,
  type: 'spring',
  stiffness: 500,
  damping: 14,
  mass: 1,
});
