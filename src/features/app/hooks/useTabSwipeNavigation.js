import { useRef, useCallback } from 'react';
import { triggerHaptic } from '../../../utils/haptics';

export const useTabSwipeNavigation = ({ activePage, setActivePage, tabPages, readerChapter }) => {
  const touchSwipeStartRef = useRef(null);

  const handleMainTouchStart = useCallback((event) => {
    if (event.touches.length !== 1) {
      touchSwipeStartRef.current = null;
      return;
    }

    const target = event.target;
    if (target?.closest?.('button, a, input, textarea, select, label, [role="button"], [role="link"], [data-no-tab-swipe="1"]')) {
      touchSwipeStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchSwipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleMainTouchEnd = useCallback((event) => {
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

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const elapsed = Date.now() - start.time;

    if (elapsed > 650) return;
    if (absX < 56) return;
    if (absX < absY * 1.25) return;

    const currentIndex = tabPages.indexOf(activePage);
    if (currentIndex === -1) return;

    if (currentIndex === 0) {
      triggerHaptic('selection');
      setActivePage(tabPages[1]);
      return;
    }

    if (currentIndex === tabPages.length - 1) {
      triggerHaptic('selection');
      setActivePage(tabPages[tabPages.length - 2]);
      return;
    }

    if (dx < 0) {
      const previousIndex = Math.max(0, currentIndex - 1);
      if (previousIndex !== currentIndex) {
        triggerHaptic('selection');
        setActivePage(tabPages[previousIndex]);
      }
      return;
    }

    const nextIndex = Math.min(tabPages.length - 1, currentIndex + 1);
    if (nextIndex !== currentIndex) {
      triggerHaptic('selection');
      setActivePage(tabPages[nextIndex]);
    }
  }, [readerChapter, activePage, setActivePage, tabPages]);

  return { handleMainTouchStart, handleMainTouchEnd };
};
