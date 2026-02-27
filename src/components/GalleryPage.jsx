import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Image as ImageIcon, Twitter, Tv, Book, Sticker, Globe, Megaphone, Users, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_CATEGORIES } from '../data/gallery';

const IMAGE_LOADED_CACHE = new Set();
const THUMBNAIL_CACHE = new Map();
const THUMBNAIL_PROMISE_CACHE = new Map();
const IMAGE_DIMENSION_CACHE = new Map();
const THUMBNAIL_MAX_WIDTH = 480;
const THUMBNAIL_QUALITY = 0.62;
const THUMBNAIL_MAX_CONCURRENT = 1;
const THUMBNAIL_QUEUE = [];
let thumbnailActiveJobs = 0;

const scheduleThumbnailIdle = (cb) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(cb, { timeout: 180 });
    return;
  }
  setTimeout(() => cb(), 16);
};

const runThumbnailQueue = () => {
  if (thumbnailActiveJobs >= THUMBNAIL_MAX_CONCURRENT) return;
  const task = THUMBNAIL_QUEUE.shift();
  if (!task) return;

  thumbnailActiveJobs += 1;
  scheduleThumbnailIdle(async () => {
    try {
      const image = new Image();
      image.decoding = 'async';
      image.loading = 'eager';

      await new Promise((done, reject) => {
        image.onload = done;
        image.onerror = reject;
        image.src = task.src;
      });

      IMAGE_DIMENSION_CACHE.set(task.src, {
        width: image.naturalWidth,
        height: image.naturalHeight,
      });

      const scale = Math.min(1, THUMBNAIL_MAX_WIDTH / image.naturalWidth);
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: true });

      if (!ctx) {
        THUMBNAIL_CACHE.set(task.src, task.src);
        task.resolve(task.src);
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/webp', THUMBNAIL_QUALITY);
      THUMBNAIL_CACHE.set(task.src, compressed);
      task.resolve(compressed);
    } catch {
      THUMBNAIL_CACHE.set(task.src, task.src);
      task.resolve(task.src);
    } finally {
      THUMBNAIL_PROMISE_CACHE.delete(task.src);
      thumbnailActiveJobs -= 1;
      runThumbnailQueue();
    }
  });
};

const TABS = [
  { id: 'takamatsu', title: "Takamatsu's tweets", short: 'Takamatsu', color: '#3b82f6', icon: Twitter },
  { id: 'official', title: 'Official tweets', short: 'Official', color: '#10b981', icon: Twitter },
  { id: 'anime', title: 'Anime', short: 'Anime', color: '#f59e0b', icon: Tv },
  { id: 'volumes', title: 'Volumes', short: 'Volumes', color: '#ef4444', icon: Book },
  { id: 'stickers', title: 'Stickers', short: 'Stickers', color: '#8b5cf6', icon: Sticker },
  { id: 'websites', title: 'Websites', short: 'Websites', color: '#06b6d4', icon: Globe },
  { id: 'promotions', title: 'Promotions', short: 'Promos', color: '#ec4899', icon: Megaphone },
  { id: 'characters', title: 'Characters', short: 'Chars', color: '#f97316', icon: Users },
];

function shuffleInSession(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function preloadImageDimensions(src) {
  if (IMAGE_DIMENSION_CACHE.has(src)) return IMAGE_DIMENSION_CACHE.get(src);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      IMAGE_DIMENSION_CACHE.set(src, dims);
      resolve(dims);
    };
    img.onerror = () => resolve({ width: 300, height: 400 });
    img.src = src;
  });
}

async function createThumbnail(src) {
  if (THUMBNAIL_CACHE.has(src)) return THUMBNAIL_CACHE.get(src);
  if (THUMBNAIL_PROMISE_CACHE.has(src)) return THUMBNAIL_PROMISE_CACHE.get(src);

  const promise = new Promise((resolve) => {
    THUMBNAIL_QUEUE.push({ src, resolve });
    runThumbnailQueue();
  });

  THUMBNAIL_PROMISE_CACHE.set(src, promise);
  return promise;
}

const GalleryThumb = ({ src, index, onClick, onLoaded, selectedBorderColor }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(() => THUMBNAIL_CACHE.get(src) || null);
  const [isLoaded, setIsLoaded] = useState(() => IMAGE_LOADED_CACHE.has(src));
  const dimensions = IMAGE_DIMENSION_CACHE.get(src);
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || isVisible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: '12px 0px', threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || thumbSrc) return;
    let alive = true;
    createThumbnail(src)
      .then((thumb) => {
        if (!alive) return;
        setThumbSrc(thumb);
      })
      .catch(() => {
        if (!alive) return;
        setThumbSrc(src);
      });
    return () => { alive = false; };
  }, [isVisible, src, thumbSrc]);

  return (
    <motion.div
      ref={cardRef}
      key={src}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.3 }}
      className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      style={{ border: selectedBorderColor ? `3px solid ${selectedBorderColor}` : '2px solid transparent', contentVisibility: 'auto', overflowAnchor: 'none' }}
      onClick={onClick}
    >
      <div style={{ 
        width: '100%', 
        background: 'transparent',
        aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : 'auto',
        minHeight: dimensions ? 'auto' : '200px'
      }}>
        {isVisible && (
          <img
            src={thumbSrc || src}
            alt={`Gallery artwork ${index + 1}`}
            className="block w-full h-auto object-contain"
            loading="lazy"
            decoding="async"
            fetchPriority={index < 2 ? 'high' : 'low'}
            onLoad={() => {
              if (!isLoaded) {
                IMAGE_LOADED_CACHE.add(src);
                setIsLoaded(true);
                onLoaded(src);
              }
            }}
          />
        )}
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" size={32} />
      </div>
    </motion.div>
  );
};

const TabSelector = ({ activeTab, setActiveTab, isMobile }) => (
  <div className="hide-scrollbar" style={{
    display: 'flex', gap: '6px', flexWrap: isMobile ? 'wrap' : 'nowrap',
    overflowX: isMobile ? 'visible' : 'auto', paddingBottom: '2px', alignItems: 'flex-end', justifyContent: isMobile ? 'center' : 'flex-start'
  }}>
    {TABS.map((tab, idx) => {
      const isActive = activeTab === idx;
      const Icon = tab.icon;
      return (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(idx)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: isMobile ? '6px 10px' : '8px 14px',
            background: isActive ? tab.color : '#f3f4f6',
            color: isActive ? '#fff' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'var(--font-hand)',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: isActive ? `0 4px 12px ${tab.color}40` : 'none',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
        >
          <Icon size={isMobile ? 14 : 16} />
          {isMobile ? tab.short : tab.title}
        </motion.button>
      );
    })}
  </div>
);

/* ─── Full-screen lightbox with dark blurred backdrop + zoom/pan ─── */
const Lightbox = ({ src, images, onClose, onNavigate, isMobile }) => {
  const overlayRef = useRef(null);
  const idx = images.indexOf(src);
  const hasPrev = idx > 0;
  const hasNext = idx < images.length - 1;

  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [isWheeling, setIsWheeling] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const activePointers = useRef(new Map());
  const initialPinchDist = useRef(null);
  const initialZoom = useRef(1);
  const initialPinchMid = useRef({ x: 0, y: 0 });
  const pinchPanStart = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const pendingGestureRef = useRef(null);
  const wheelTimeout = useRef(null);

  const doZoom = useCallback((d) => {
    setZoom(z => {
      const next = Math.max(0.5, Math.min(5, +(z + d).toFixed(3)));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }, []);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  // Reset zoom when navigating
  useEffect(() => { resetZoom(); }, [src, resetZoom]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && hasPrev) onNavigate(images[idx - 1]);
      else if (e.key === 'ArrowRight' && hasNext) onNavigate(images[idx + 1]);
      else if (e.key === '+' || e.key === '=') { if (e.ctrlKey || e.metaKey) e.preventDefault(); doZoom(0.25); }
      else if (e.key === '-') { if (e.ctrlKey || e.metaKey) e.preventDefault(); doZoom(-0.25); }
      else if (e.key === '0') { if (e.ctrlKey || e.metaKey) e.preventDefault(); resetZoom(); }
      else if (!isMobile && (e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'x')) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [idx, hasPrev, hasNext, images, onClose, onNavigate, doZoom, resetZoom, isMobile]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();

    if (e.ctrlKey) {
      // Trackpad pinch zoom
      setIsWheeling(true);
      clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => setIsWheeling(false), 150);
      doZoom(-e.deltaY * 0.005);
      return;
    }

    const isMouseWheel = Math.abs(e.deltaX) === 0 && Math.abs(e.deltaY) >= 30;

    // Ported from MangaReader behavior:
    // - Mouse wheel should zoom regardless of current zoom
    // - At base zoom, wheel also zooms
    if (isMouseWheel || zoom === 1) {
      doZoom(e.deltaY > 0 ? -0.25 : 0.25);
      return;
    }

    // Trackpad two-finger panning when zoomed in
    if (zoom > 1) {
      setIsWheeling(true);
      clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => setIsWheeling(false), 150);
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, [doZoom, zoom]);

  // Prevent browser/page zoom while viewer is open (ported behavior from MangaReader)
  useEffect(() => {
    const preventBrowserZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    document.addEventListener('wheel', preventBrowserZoom, { passive: false });
    return () => document.removeEventListener('wheel', preventBrowserZoom);
  }, []);

  // Pointer-based pinch & pan
  const onPD = (e) => {
    if (e.target instanceof Element && e.target.closest('[data-lightbox-control="true"]')) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    if (activePointers.current.size === 2) {
      setIsPanning(false);
      setIsPinching(true);
      const pts = Array.from(activePointers.current.values());
      initialPinchDist.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      initialZoom.current = zoom;
      initialPinchMid.current = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
      pinchPanStart.current = panOffset;
    } else if (activePointers.current.size === 1 && zoom > 1) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };
  const onPM = (e) => {
    if (!activePointers.current.has(e.pointerId)) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (initialPinchDist.current) {
        const scale = dist / initialPinchDist.current;
        const next = Math.max(0.5, Math.min(5, initialZoom.current * scale));
        const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        const dx = mid.x - initialPinchMid.current.x;
        const dy = mid.y - initialPinchMid.current.y;
        const nextPan = next === 1
          ? { x: 0, y: 0 }
          : { x: pinchPanStart.current.x + dx, y: pinchPanStart.current.y + dy };

        pendingGestureRef.current = { zoom: next, pan: nextPan };
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            const pending = pendingGestureRef.current;
            if (!pending) return;
            setZoom(pending.zoom);
            setPanOffset(pending.pan);
          });
        }
      }
    } else if (activePointers.current.size === 1 && isPanning) {
      setPanOffset({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    }
  };
  const onPU = (e) => {
    if (e.target instanceof Element && e.target.closest('[data-lightbox-control="true"]')) return;
    activePointers.current.delete(e.pointerId);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (activePointers.current.size < 2) {
      initialPinchDist.current = null;
      setIsPinching(false);
    }
    if (activePointers.current.size === 1 && zoom > 1) {
      const pt = Array.from(activePointers.current.values())[0];
      setIsPanning(true);
      panStart.current = { x: pt.x - panOffset.x, y: pt.y - panOffset.y };
    } else if (activePointers.current.size === 0) {
      setIsPanning(false);
    }
  };

  // Double-tap to toggle zoom
  const lastTapRef = useRef(0);
  const handleDoubleTap = (e) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.stopPropagation();
      if (zoom > 1) resetZoom();
      else doZoom(1);
    }
    lastTapRef.current = now;
  };

  useEffect(() => {
    const node = overlayRef.current;
    if (!node) return;
    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const overlay = (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        if (zoom <= 1) onClose();
        else resetZoom();
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2147483000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(10,10,10,0.78)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        touchAction: 'none',
      }}
    >
      {/* Close button */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        data-lightbox-control="true"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: isMobile ? '24px' : '12px', right: isMobile ? '8px' : '14px', zIndex: 10002 }}
      >
        <div
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ padding: '24px', margin: '-12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'none' }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{
              background: 'none', border: 'none',
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
            }}
          >
            <X size={24} />
          </motion.button>
        </div>
      </motion.div>

      {/* Prev / Next */}
      {hasPrev && (
        <div
          data-lightbox-control="true"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onNavigate(images[idx - 1]); resetZoom(); }}
          style={{
            position: 'absolute', left: isMobile ? 0 : '16px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10002, padding: '24px', margin: '-12px', cursor: 'pointer', touchAction: 'none'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            style={{
              background: 'none', border: 'none',
              width: isMobile ? 40 : 48, height: isMobile ? 40 : 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
            }}
          >
            <ChevronLeft size={32} />
          </motion.button>
        </div>
      )}

      {hasNext && (
        <div
          data-lightbox-control="true"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onNavigate(images[idx + 1]); resetZoom(); }}
          style={{
            position: 'absolute', right: isMobile ? 0 : '16px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10002, padding: '24px', margin: '-12px', cursor: 'pointer', touchAction: 'none'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            style={{
              background: 'none', border: 'none',
              width: isMobile ? 40 : 48, height: isMobile ? 40 : 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
            }}
          >
            <ChevronRight size={32} />
          </motion.button>
        </div>
      )}

      {/* Image with zoom & pan */}
      <div
        onPointerDown={onPD}
        onPointerMove={onPM}
        onPointerUp={onPU}
        onPointerCancel={onPU}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (zoom <= 1) onClose();
            else resetZoom();
          }
        }}
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none' }}
      >
        <motion.img
          key={src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          src={src}
          alt="Gallery artwork"
          draggable={false}
          onClick={(e) => { e.stopPropagation(); handleDoubleTap(e); }}
          style={{
            maxWidth: '100vw',
            maxHeight: '100vh',
            objectFit: 'contain',
            borderRadius: '0',
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transition: isWheeling || isPanning || isPinching ? 'none' : 'transform 0.2s ease-out',
            willChange: 'transform',
            userSelect: 'none',
            touchAction: 'none',
          }}
        />
      </div>

      {/* Counter */}
      <div style={{
        position: 'absolute', bottom: isMobile ? 24 : 32, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-hand)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)',
        background: 'none', padding: '4px 16px', pointerEvents: 'none'
      }}>
        {idx + 1} / {images.length}
      </div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
};

const GalleryPage = ({ isMobile }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState(() => new Set([TABS[0].id]));
  const [dimensionsReady, setDimensionsReady] = useState(() => new Set());
  const [, forceLoadedRefresh] = useState(0);

  const [orderedImagesByTab] = useState(() => {
    const initial = {};
    TABS.forEach((tab) => {
      const source = GALLERY_CATEGORIES[tab.id] || [];
      initial[tab.id] = shuffleInSession(source);
    });
    return initial;
  });

  // Preload initial tab dimensions immediately
  useEffect(() => {
    const firstTabId = TABS[0].id;
    const firstTabImages = orderedImagesByTab[firstTabId] || [];
    Promise.all(firstTabImages.map(src => preloadImageDimensions(src)))
      .then(() => {
        setDimensionsReady(prev => {
          const next = new Set(prev);
          next.add(firstTabId);
          return next;
        });
      });
  }, [orderedImagesByTab]);

  const currentTab = TABS[activeTab];
  const images = useMemo(() => orderedImagesByTab[currentTab.id] || [], [orderedImagesByTab, currentTab.id]);

  const handleClose = useCallback(() => setSelectedImage(null), []);
  const handleNavigate = useCallback((src) => setSelectedImage(src), []);

  const markLoaded = useCallback((src) => {
    if (!IMAGE_LOADED_CACHE.has(src)) {
      IMAGE_LOADED_CACHE.add(src);
      forceLoadedRefresh(v => v + 1);
    }
  }, []);

  useEffect(() => {
    if (!selectedImage) return;
    const i = images.indexOf(selectedImage);
    const toPreload = [images[i - 1], images[i + 1]].filter(Boolean);
    toPreload.forEach((url) => {
      if (IMAGE_LOADED_CACHE.has(url)) return;
      const img = new Image();
      img.onload = () => IMAGE_LOADED_CACHE.add(url);
      img.src = url;
    });
  }, [selectedImage, images]);

  // Clear selection when switching tabs
  useEffect(() => { setSelectedImage(null); }, [activeTab]);

  useEffect(() => {
    const tabId = TABS[activeTab].id;
    setVisitedTabs((prev) => {
      if (prev.has(tabId)) return prev;
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });

    // Aggressively pre-fetch all dimensions for this tab
    if (!dimensionsReady.has(tabId)) {
      const tabImages = orderedImagesByTab[tabId] || [];
      Promise.all(tabImages.map(src => preloadImageDimensions(src)))
        .then(() => {
          setDimensionsReady(prev => {
            const next = new Set(prev);
            next.add(tabId);
            return next;
          });
        });
    }
  }, [activeTab, orderedImagesByTab, dimensionsReady]);

  return (
    <div style={{ width: '100%', padding: isMobile ? '24px 8px 10px 8px' : '28px 40px', minHeight: isMobile ? 'auto' : '600px', display: 'flex', flexDirection: 'column', overflow: 'visible', flex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between', marginBottom: isMobile ? '16px' : '26px', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isMobile ? '16px' : '0', justifyContent: 'center' }}>
          <ImageIcon size={isMobile ? 24 : 22} style={{ color: '#8b5cf6' }} />
          <span style={{ fontFamily: 'var(--font-main)', color: '#6b7280', fontSize: isMobile ? '1.5rem' : '1.3rem', fontWeight: 'normal' }}>Gallery</span>
        </div>
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} />
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <Lightbox
            src={selectedImage}
            images={images}
            onClose={handleClose}
            onNavigate={handleNavigate}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>

      {/* Content area */}
      <div style={{ position: 'relative', flex: 1 }}>
        {TABS.map((tab, tabIndex) => {
          if (!visitedTabs.has(tab.id) && tabIndex !== activeTab) return null;
          const tabImages = orderedImagesByTab[tab.id] || [];
          const isActive = tabIndex === activeTab;
          const dimsReady = dimensionsReady.has(tab.id);

          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -8 }}
              transition={{ duration: 0.2 }}
              className="hide-scrollbar"
              style={{
                display: isActive ? 'block' : 'none',
                flex: 1,
                overflowY: isMobile ? 'visible' : 'auto',
                maxHeight: isMobile ? 'none' : 'min(550px, calc(100vh - 280px))',
                padding: '4px',
                overflowAnchor: 'none',
              }}
            >
              {!dimsReady ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTop: '3px solid #8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.9rem', color: '#9ca3af' }}>Loading gallery...</span>
                </div>
              ) : tabImages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
                  <ImageOff size={48} style={{ color: '#d1d5db' }} />
                  <span style={{ fontFamily: 'var(--font-hand)', fontSize: '1.1rem', color: '#9ca3af', fontWeight: 'bold' }}>No images yet — coming soon!</span>
                </div>
              ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4" style={{ overflowAnchor: 'none' }}>
                  {tabImages.map((src, index) => {
                    const isSelected = isActive && src === selectedImage;
                    return (
                      <GalleryThumb
                        key={src}
                        src={src}
                        index={index}
                        onLoaded={markLoaded}
                        selectedBorderColor={isSelected ? tab.color : null}
                        onClick={() => {
                          if (!isActive) return;
                          setSelectedImage(src);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GalleryPage;
