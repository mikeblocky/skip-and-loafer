import { useCallback, useEffect, useRef, useState } from 'react';
import { readBlogReaderState, writeBlogReaderState } from './blogShared';

export const useBlogReaderBehavior = ({
  isMobile,
  selectedBlog,
  selectedBlogId,
  markdownChunksLength,
  chunkStep,
  progressTarget,
  activeImageSrc,
  handleBackToList,
}) => {
  const [showFloatingControls, setShowFloatingControls] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [visibleChunkCount, setVisibleChunkCount] = useState(chunkStep);
  const [readerRefVersion, setReaderRefVersion] = useState(0);

  const listScrollRef = useRef(null);
  const readScrollRef = useRef(null);
  const staticControlsRef = useRef(null);
  const scrollParentRef = useRef(null);
  const controlsIdleTimerRef = useRef(null);
  const lastActivityAtRef = useRef(0);
  const lastFloatingWantedRef = useRef(false);
  const loadMoreRef = useRef(null);
  const restoredForBlogRef = useRef(null);
  const lastPersistAtRef = useRef(0);

  const findScrollParent = useCallback((node) => {
    if (!node) return null;
    let el = node.parentElement;
    while (el) {
      const style = getComputedStyle(el);
      if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) return el;
      el = el.parentElement;
    }
    return null;
  }, []);

  const scrollActivePaneToTop = useCallback(() => {
    const readEl = readScrollRef.current;
    const listEl = listScrollRef.current;
    const parent = scrollParentRef.current || findScrollParent(staticControlsRef.current);

    const readScrollable = !!(readEl && readEl.scrollHeight > readEl.clientHeight + 1);
    const listScrollable = !!(listEl && listEl.scrollHeight > listEl.clientHeight + 1);

    const target = selectedBlog
      ? (readScrollable ? readEl : parent)
      : (listScrollable ? listEl : parent);

    if (target && typeof target.scrollTo === 'function') {
      target.scrollTo({ top: 0, behavior: 'smooth' });
      window.setTimeout(() => {
        if ((target.scrollTop || 0) > 1) {
          target.scrollTop = 0;
        }
      }, 320);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 320);
  }, [selectedBlog, findScrollParent]);

  useEffect(() => {
    if (!selectedBlog) return undefined;

    let rafId = 0;
    let attempts = 0;
    const maxAttempts = 120;

    const waitForReaderNode = () => {
      if (readScrollRef.current) {
        setReaderRefVersion((prev) => prev + 1);
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        rafId = requestAnimationFrame(waitForReaderNode);
      }
    };

    waitForReaderNode();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [selectedBlog, markdownChunksLength]);

  useEffect(() => {
    if (!selectedBlog || markdownChunksLength === 0) return;
    if (restoredForBlogRef.current === selectedBlog.id) return;

    const saved = readBlogReaderState();
    if (!saved || saved.blogId !== selectedBlog.id) return;

    restoredForBlogRef.current = selectedBlog.id;
    setVisibleChunkCount(markdownChunksLength);

    const restore = () => {
      const node = readScrollRef.current;
      const parent = scrollParentRef.current || findScrollParent(staticControlsRef.current);
      if (!node && !parent) return;

      const contentIsScrollable = !!(node && node.scrollHeight > node.clientHeight + 1);
      const maxScroll = contentIsScrollable
        ? Math.max(1, node.scrollHeight - node.clientHeight)
        : Math.max(1, (parent?.scrollHeight || 0) - (parent?.clientHeight || 0));

      const fallbackTop = saved.progress > 0 ? saved.progress * maxScroll : 0;
      const nextTop = Math.max(0, Math.min(maxScroll, saved.scrollTop || fallbackTop));

      if (contentIsScrollable && node) {
        node.scrollTop = nextTop;
      } else if (parent && typeof parent.scrollTo === 'function') {
        parent.scrollTo({ top: nextTop, behavior: 'auto' });
      } else if (parent) {
        parent.scrollTop = nextTop;
      } else {
        window.scrollTo(0, nextTop);
      }

      progressTarget.set(maxScroll > 0 ? (nextTop / maxScroll) : 0);
    };

    let settleTimer = null;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restore();
        settleTimer = window.setTimeout(restore, 220);
      });
    });

    return () => {
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, [selectedBlog, markdownChunksLength, progressTarget, readerRefVersion, findScrollParent]);

  useEffect(() => {
    if (isMobile && selectedBlog) {
      setShowFloatingControls((prev) => (prev ? prev : true));
      lastFloatingWantedRef.current = true;
      return;
    }

    const node = staticControlsRef.current;
    if (!node) return;

    const observerRoot = findScrollParent(node);
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = !entry.isIntersecting;
        if (nextVisible === lastFloatingWantedRef.current) return;
        lastFloatingWantedRef.current = nextVisible;
        setShowFloatingControls(nextVisible);
      },
      { root: observerRoot, threshold: 0, rootMargin: '-8px 0px -8px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [selectedBlog, isMobile, findScrollParent]);

  useEffect(() => {
    const anchor = staticControlsRef.current;
    const parent = findScrollParent(anchor);
    scrollParentRef.current = parent;

    const listEl = listScrollRef.current;
    const contentEl = readScrollRef.current;

    if (parent) {
      parent.style.scrollBehavior = 'smooth';
    }

    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;

        const nextContentEl = readScrollRef.current;
        const contentIsScrollable = !!(nextContentEl && nextContentEl.scrollHeight > nextContentEl.clientHeight + 1);
        const parentScrollTop = parent?.scrollTop ?? window.scrollY ?? 0;

        const activeScrollTop = selectedBlog
          ? (contentIsScrollable ? (nextContentEl?.scrollTop || 0) : parentScrollTop)
          : (listEl?.scrollTop ?? parent?.scrollTop ?? 0);

        setShowBackToTop(activeScrollTop > 260);

        if (!selectedBlog) {
          progressTarget.set(0);
          return;
        }

        let nextProgress = 0;

        if (contentIsScrollable && nextContentEl) {
          const maxScroll = Math.max(1, nextContentEl.scrollHeight - nextContentEl.clientHeight);
          nextProgress = Math.max(0, Math.min(1, nextContentEl.scrollTop / maxScroll));
        } else if (parent) {
          const { scrollTop, scrollHeight, clientHeight } = parent;
          const maxScrollable = Math.max(1, scrollHeight - clientHeight);
          nextProgress = Math.max(0, Math.min(1, scrollTop / maxScrollable));
        }

        if (Math.abs(nextProgress - progressTarget.get()) > 0.0015) {
          progressTarget.set(nextProgress);
        }

        if (selectedBlog) {
          const now = Date.now();
          if (now - lastPersistAtRef.current > 350) {
            const persistedScroll = contentIsScrollable
              ? (nextContentEl?.scrollTop || 0)
              : (parent?.scrollTop || window.scrollY || 0);
            writeBlogReaderState({
              blogId: selectedBlog.id,
              scrollTop: persistedScroll,
              progress: nextProgress,
            });
            lastPersistAtRef.current = now;
          }
        }
      });
    };

    if (parent) parent.addEventListener('scroll', onScroll, { passive: true });
    if (contentEl) contentEl.addEventListener('scroll', onScroll, { passive: true });
    if (listEl) listEl.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (parent) parent.removeEventListener('scroll', onScroll);
      if (contentEl) contentEl.removeEventListener('scroll', onScroll);
      if (listEl) listEl.removeEventListener('scroll', onScroll);
      if (parent) parent.style.scrollBehavior = '';
    };
  }, [selectedBlog, findScrollParent, progressTarget, readerRefVersion]);

  useEffect(() => {
    setShowFloatingControls(false);
    progressTarget.set(0);
    setShowBackToTop(false);
    setVisibleChunkCount(chunkStep);
  }, [selectedBlogId, progressTarget, chunkStep]);

  useEffect(() => {
    const node = loadMoreRef.current;
    const root = readScrollRef.current;
    if (!node || !root || !selectedBlog || markdownChunksLength <= visibleChunkCount) return undefined;

    let rafId = null;

    const fillViewportIfNeeded = () => {
      const activeRoot = readScrollRef.current;
      if (!activeRoot) return;

      if (activeRoot.scrollHeight <= activeRoot.clientHeight + 24 && visibleChunkCount < markdownChunksLength) {
        setVisibleChunkCount((prev) => Math.min(prev + chunkStep, markdownChunksLength));
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        setVisibleChunkCount((prev) => Math.min(prev + chunkStep, markdownChunksLength));
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(fillViewportIfNeeded);
      },
      { root, threshold: 0, rootMargin: '720px 0px 720px 0px' }
    );

    observer.observe(node);
    fillViewportIfNeeded();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [selectedBlog, markdownChunksLength, visibleChunkCount, chunkStep, readerRefVersion]);

  useEffect(() => {
    if (!(isMobile && selectedBlog)) {
      if (controlsIdleTimerRef.current) {
        clearTimeout(controlsIdleTimerRef.current);
        controlsIdleTimerRef.current = null;
      }
      return;
    }

    const parent = scrollParentRef.current || findScrollParent(staticControlsRef.current);

    const resetIdle = () => {
      const now = Date.now();
      if (now - lastActivityAtRef.current < 180) return;
      lastActivityAtRef.current = now;

      setShowFloatingControls((prev) => (prev ? prev : true));
      if (controlsIdleTimerRef.current) clearTimeout(controlsIdleTimerRef.current);
      controlsIdleTimerRef.current = setTimeout(() => {
        setShowFloatingControls(false);
      }, 5000);
    };

    const opts = { passive: true };
    const targets = [window];
    if (parent) targets.push(parent);

    targets.forEach((target) => {
      target.addEventListener('touchstart', resetIdle, opts);
      target.addEventListener('pointerdown', resetIdle, opts);
      target.addEventListener('scroll', resetIdle, opts);
    });

    resetIdle();

    return () => {
      if (controlsIdleTimerRef.current) {
        clearTimeout(controlsIdleTimerRef.current);
        controlsIdleTimerRef.current = null;
      }

      targets.forEach((target) => {
        target.removeEventListener('touchstart', resetIdle);
        target.removeEventListener('pointerdown', resetIdle);
        target.removeEventListener('scroll', resetIdle);
      });
    };
  }, [isMobile, selectedBlog, findScrollParent]);

  useEffect(() => {
    if (isMobile || !selectedBlog) return;

    const onReaderShortcut = (event) => {
      if (activeImageSrc) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const targetTag = event.target?.tagName;
      const isTypingTarget = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT' || event.target?.isContentEditable;
      if (isTypingTarget) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleBackToList();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        scrollActivePaneToTop();
      }
    };

    window.addEventListener('keydown', onReaderShortcut);
    return () => window.removeEventListener('keydown', onReaderShortcut);
  }, [isMobile, selectedBlog, activeImageSrc, scrollActivePaneToTop, handleBackToList]);

  return {
    listScrollRef,
    readScrollRef,
    staticControlsRef,
    loadMoreRef,
    showFloatingControls,
    showBackToTop,
    visibleChunkCount,
    scrollActivePaneToTop,
    setVisibleChunkCount,
  };
};
