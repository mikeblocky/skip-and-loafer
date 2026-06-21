import { useRef, useCallback } from 'react';
import { triggerHaptic } from '../../../utils/haptics';

const EDGE_SWIPE_ZONE_PX = 34;
const MIN_SWIPE_DISTANCE_PX = 90;
const MAX_SWIPE_TIME_MS = 800;
const HORIZONTAL_DOMINANCE_RATIO = 1.8;
const VERTICAL_CANCEL_RATIO = 1.15;

const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'textarea',
  'select',
  'label',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
  '[role="slider"]',
  '[data-no-tab-swipe="1"]',
].join(', ');

const hasHorizontalScrollParent = (target) => {
  let node = target;

  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const canScrollX = /(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth + 8;
      if (canScrollX) return true;
    }

    node = node.parentElement;
  }

  return false;
};

export const useTabSwipeNavigation = ({ activePage, setActivePage, tabPages, readerChapter }) => {
  const touchSwipeStartRef = useRef(null);

  const handleMainTouchStart = useCallback((event) => {
    if (document.body?.dataset?.lightboxOpen === '1') {
      touchSwipeStartRef.current = null;
      return;
    }

    if (event.touches.length !== 1) {
      touchSwipeStartRef.current = null;
      return;
    }

    const target = event.target;
    if (
      target?.closest?.(INTERACTIVE_SELECTOR)
      || hasHorizontalScrollParent(target)
    ) {
      touchSwipeStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const startedFromLeftEdge = touch.clientX <= EDGE_SWIPE_ZONE_PX;
    const startedFromRightEdge = viewportWidth > 0 && touch.clientX >= viewportWidth - EDGE_SWIPE_ZONE_PX;

    if (!startedFromLeftEdge && !startedFromRightEdge) {
      touchSwipeStartRef.current = null;
      return;
    }

    touchSwipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      edge: startedFromLeftEdge ? 'left' : 'right',
      cancelled: false,
    };
  }, []);

  const handleMainTouchMove = useCallback((event) => {
    if (!touchSwipeStartRef.current || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const start = touchSwipeStartRef.current;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absY > 18 && absY > absX * VERTICAL_CANCEL_RATIO) {
      touchSwipeStartRef.current = { ...start, cancelled: true };
    }
  }, []);

  const handleMainTouchEnd = useCallback((event) => {
    if (document.body?.dataset?.lightboxOpen === '1') {
      touchSwipeStartRef.current = null;
      return;
    }

    if (!touchSwipeStartRef.current || event.changedTouches.length !== 1) {
      touchSwipeStartRef.current = null;
      return;
    }

    if (readerChapter) {
      touchSwipeStartRef.current = null;
      return;
    }

    const touch = event.changedTouches[0];
    const start = touchSwipeStartRef.current;
    touchSwipeStartRef.current = null;

    if (start.cancelled) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const elapsed = Date.now() - start.time;

    if (elapsed > MAX_SWIPE_TIME_MS) return;
    if (absX < MIN_SWIPE_DISTANCE_PX) return;
    if (absX < absY * HORIZONTAL_DOMINANCE_RATIO) return;

    const currentIndex = tabPages.indexOf(activePage);
    if (currentIndex === -1) return;

    const wantsPreviousTab = start.edge === 'left' && dx > 0;
    const wantsNextTab = start.edge === 'right' && dx < 0;

    if (wantsPreviousTab) {
      const previousIndex = currentIndex - 1;
      if (previousIndex >= 0) {
        triggerHaptic('selection');
        setActivePage(tabPages[previousIndex]);
      }
      return;
    }

    if (wantsNextTab) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < tabPages.length) {
        triggerHaptic('selection');
        setActivePage(tabPages[nextIndex]);
      }
    }
  }, [readerChapter, activePage, setActivePage, tabPages]);

  return { handleMainTouchStart, handleMainTouchMove, handleMainTouchEnd };
};
