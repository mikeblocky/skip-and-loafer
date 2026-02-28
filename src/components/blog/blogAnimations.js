export const getBlogListItemInitial = (index) => ({
  opacity: 0,
  y: 12,
  rotate: index % 2 === 0 ? -0.35 : 0.35,
});

export const BLOG_LIST_ITEM_ANIMATE = { opacity: 1, y: 0, rotate: 0 };

export const getBlogListItemTransition = (index) => ({
  delay: index * 0.04,
  duration: 0.25,
});
