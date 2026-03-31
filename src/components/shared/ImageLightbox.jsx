import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const isVideoSrc = (value) => /\.mp4($|\?)/i.test(value || '');

const SLIDE_COMMIT_DISTANCE = 88;
const SLIDE_LOCK_DISTANCE = 18;
const VERTICAL_DRIFT_LIMIT = 0.85;
const SLIDE_EDGE_RESISTANCE = 0.35;

const getControlMetrics = (isMobile) => {
  const buttonSize = isMobile ? 48 : 56;
  const closeButtonSize = isMobile ? 42 : 46;

  return {
    buttonSize,
    closeButtonSize,
    navInset: isMobile ? 10 : 18,
    topInset: isMobile ? 18 : 14,
    hitPadding: isMobile ? 16 : 20,
    borderRadius: Math.round(buttonSize * 0.3),
    closeRadius: Math.round(closeButtonSize * 0.28),
    borderWidth: isMobile ? 1.75 : 2,
    bottomBorderWidth: isMobile ? 2.25 : 2.5,
    navIconSize: Math.round(buttonSize * 0.48),
    closeIconSize: Math.round(closeButtonSize * 0.48),
  };
};

const getControlButtonStyle = ({ size, radius, borderWidth, bottomBorderWidth, elevated = false, isMobile = false }) => ({
  appearance: 'none',
  WebkitAppearance: 'none',
  padding: 0,
  margin: 0,
  width: size,
  height: size,
  minWidth: size,
  minHeight: size,
  boxSizing: 'border-box',
  border: `${borderWidth}px solid rgba(139, 92, 246, 0.42)`,
  borderBottom: `${bottomBorderWidth}px solid rgba(139, 92, 246, 0.52)`,
  borderRadius: `${radius}px`,
  background: elevated
    ? 'linear-gradient(180deg, rgba(255,255,255,0.76) 0%, rgba(246,243,255,0.7) 100%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(246,243,255,0.78) 100%)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  cursor: 'pointer',
  color: 'rgba(124, 58, 237, 0.88)',
  lineHeight: 0,
  opacity: elevated ? (isMobile ? 0.45 : 1.0) : 0.8,
  boxShadow: elevated
    ? '0 10px 18px rgba(15, 23, 42, 0.1)'
    : '0 8px 16px rgba(15, 23, 42, 0.08)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  transition: 'none',
});

const getControlIconStyle = () => ({
  width: '64%',
  height: '64%',
  flexShrink: 0,
  display: 'block',
});

const stopLightboxTouchEvent = (event) => {
  event.stopPropagation();
};

const stopLightboxTouchMoveEvent = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

const NavButton = ({ side, visible, onClick, metrics }) => (
  <div
    data-lightbox-control="true"
    onPointerDown={(event) => event.stopPropagation()}
    onPointerMove={(event) => event.stopPropagation()}
    onPointerUp={(event) => event.stopPropagation()}
    onClick={(event) => {
      event.stopPropagation();
      if (visible) onClick();
    }}
    style={{
      position: 'absolute',
      top: metrics.buttonSize < 52 ? '75%' : '50%',
      [side]: `${metrics.navInset}px`,
      width: `${metrics.buttonSize + metrics.hitPadding * 2}px`,
      height: `${metrics.buttonSize + metrics.hitPadding * 2}px`,
      marginTop: `${-(metrics.buttonSize + metrics.hitPadding * 2) / 2}px`,
      display: visible ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: visible ? 'pointer' : 'default',
      touchAction: 'none',
      zIndex: 10002,
      boxSizing: 'border-box',
    }}
  >
    <motion.button
      whileHover={{ opacity: 0.96 }}
      style={getControlButtonStyle({
        size: metrics.buttonSize,
        radius: metrics.borderRadius,
        borderWidth: metrics.borderWidth,
        bottomBorderWidth: metrics.bottomBorderWidth,
        elevated: true,
        isMobile: metrics.buttonSize < 52,
      })}
    >
      {side === 'left' ? (
        <ChevronLeft
          size={metrics.navIconSize}
          strokeWidth={2.5}
          style={getControlIconStyle()}
        />
      ) : (
        <ChevronRight
          size={metrics.navIconSize}
          strokeWidth={2.5}
          style={getControlIconStyle()}
        />
      )}
    </motion.button>
  </div>
);

const ImageLightbox = ({ src, images, onClose, onNavigate, isMobile, altText = 'Artwork' }) => {
  const overlayRef = useRef(null);
  const idx = images.indexOf(src);
  const hasPrev = idx > 0;
  const hasNext = idx < images.length - 1;
  const isVideo = isVideoSrc(src);
  const controlMetrics = getControlMetrics(isMobile);

  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [isWheeling, setIsWheeling] = useState(false);
  const [slideOffsetX, setSlideOffsetX] = useState(0);

  const panStart = useRef({ x: 0, y: 0 });
  const gestureStart = useRef({ x: 0, y: 0 });
  const activePointers = useRef(new Map());
  const initialPinchDist = useRef(null);
  const initialZoom = useRef(1);
  const initialPinchMid = useRef({ x: 0, y: 0 });
  const pinchPanStart = useRef({ x: 0, y: 0 });
  const isSlideDragging = useRef(false);
  const didDragRef = useRef(false);
  const rafRef = useRef(null);
  const pendingGestureRef = useRef(null);
  const wheelTimeout = useRef(null);

  const doZoom = useCallback((delta) => {
    setZoom((current) => {
      const next = Math.max(0.5, Math.min(5, +(current + delta).toFixed(3)));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const settleSlide = useCallback(() => {
    setSlideOffsetX(0);
    isSlideDragging.current = false;
  }, []);

  const navigateToImage = useCallback((nextSrc) => {
    settleSlide();
    onNavigate(nextSrc);
    resetZoom();
  }, [onNavigate, resetZoom, settleSlide]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    resetZoom();
    settleSlide();
    didDragRef.current = false;
  }, [src, resetZoom, settleSlide]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft' && hasPrev) navigateToImage(images[idx - 1]);
      else if (event.key === 'ArrowRight' && hasNext) navigateToImage(images[idx + 1]);
      else if (!isVideo && (event.key === '+' || event.key === '=')) {
        if (event.ctrlKey || event.metaKey) event.preventDefault();
        doZoom(0.25);
      } else if (!isVideo && event.key === '-') {
        if (event.ctrlKey || event.metaKey) event.preventDefault();
        doZoom(-0.25);
      } else if (!isVideo && event.key === '0') {
        if (event.ctrlKey || event.metaKey) event.preventDefault();
        resetZoom();
      } else if (!isMobile && (event.key.toLowerCase() === 'q' || event.key.toLowerCase() === 'x')) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, hasPrev, hasNext, images, onClose, navigateToImage, doZoom, resetZoom, isMobile, isVideo]);

  useEffect(() => {
    document.body.dataset.lightboxOpen = '1';
    document.body.style.overflow = 'hidden';
    return () => {
      delete document.body.dataset.lightboxOpen;
      document.body.style.overflow = '';
    };
  }, []);

  const handleWheel = useCallback((event) => {
    if (isVideo) return;
    event.preventDefault();

    if (event.ctrlKey) {
      setIsWheeling(true);
      clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => setIsWheeling(false), 150);
      doZoom(-event.deltaY * 0.005);
      return;
    }

    const isMouseWheel = Math.abs(event.deltaX) === 0 && Math.abs(event.deltaY) >= 30;

    if (isMouseWheel || zoom === 1) {
      doZoom(event.deltaY > 0 ? -0.25 : 0.25);
      return;
    }

    if (zoom > 1) {
      setIsWheeling(true);
      clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => setIsWheeling(false), 150);
      setPanOffset((prev) => ({ x: prev.x - event.deltaX, y: prev.y - event.deltaY }));
    }
  }, [doZoom, zoom, isVideo]);

  useEffect(() => {
    const preventBrowserZoom = (event) => {
      if (event.ctrlKey || event.metaKey) event.preventDefault();
    };
    document.addEventListener('wheel', preventBrowserZoom, { passive: false });
    return () => document.removeEventListener('wheel', preventBrowserZoom);
  }, []);

  const onPointerDown = (event) => {
    if (isVideo) return;
    if (event.target instanceof Element && event.target.closest('[data-lightbox-control="true"]')) return;

    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureStart.current = { x: event.clientX, y: event.clientY };
    didDragRef.current = false;

    if (activePointers.current.size === 2) {
      setIsPanning(false);
      settleSlide();
      setIsPinching(true);
      const points = Array.from(activePointers.current.values());
      initialPinchDist.current = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      initialZoom.current = zoom;
      initialPinchMid.current = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
      };
      pinchPanStart.current = panOffset;
    } else if (activePointers.current.size === 1 && zoom > 1) {
      setIsPanning(true);
      panStart.current = { x: event.clientX - panOffset.x, y: event.clientY - panOffset.y };
    } else if (activePointers.current.size === 1) {
      setIsPanning(false);
      settleSlide();
    }
  };

  const onPointerMove = (event) => {
    if (isVideo) return;
    if (!activePointers.current.has(event.pointerId)) return;
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.current.size === 2) {
      const points = Array.from(activePointers.current.values());
      const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

      if (initialPinchDist.current) {
        const scale = dist / initialPinchDist.current;
        const nextZoom = Math.max(0.5, Math.min(5, initialZoom.current * scale));
        const mid = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        const dx = mid.x - initialPinchMid.current.x;
        const dy = mid.y - initialPinchMid.current.y;
        const nextPan = nextZoom === 1
          ? { x: 0, y: 0 }
          : { x: pinchPanStart.current.x + dx, y: pinchPanStart.current.y + dy };

        pendingGestureRef.current = { zoom: nextZoom, pan: nextPan };

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
      return;
    }

    if (activePointers.current.size !== 1) return;

    const dx = event.clientX - gestureStart.current.x;
    const dy = event.clientY - gestureStart.current.y;

    if (zoom > 1 && isPanning) {
      didDragRef.current = true;
      setPanOffset({ x: event.clientX - panStart.current.x, y: event.clientY - panStart.current.y });
      return;
    }

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!isSlideDragging.current) {
      if (absX < SLIDE_LOCK_DISTANCE) return;
      if (absX <= absY / VERTICAL_DRIFT_LIMIT) return;
      isSlideDragging.current = true;
    }

    didDragRef.current = true;
    const isEdgeDrag = (dx > 0 && !hasPrev) || (dx < 0 && !hasNext);
    setSlideOffsetX(isEdgeDrag ? dx * SLIDE_EDGE_RESISTANCE : dx);
  };

  const onPointerUp = (event) => {
    if (isVideo) return;
    if (event.target instanceof Element && event.target.closest('[data-lightbox-control="true"]')) return;

    activePointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (activePointers.current.size < 2) {
      initialPinchDist.current = null;
      setIsPinching(false);
    }

    if (activePointers.current.size === 1 && zoom > 1) {
      const point = Array.from(activePointers.current.values())[0];
      setIsPanning(true);
      panStart.current = { x: point.x - panOffset.x, y: point.y - panOffset.y };
      return;
    }

    if (activePointers.current.size === 0 && isSlideDragging.current && zoom <= 1) {
      const shouldGoPrev = slideOffsetX >= SLIDE_COMMIT_DISTANCE && hasPrev;
      const shouldGoNext = slideOffsetX <= -SLIDE_COMMIT_DISTANCE && hasNext;

      if (shouldGoPrev) {
        navigateToImage(images[idx - 1]);
      } else if (shouldGoNext) {
        navigateToImage(images[idx + 1]);
      } else {
        settleSlide();
      }

      setIsPanning(false);
      return;
    }

    if (activePointers.current.size === 0) {
      setIsPanning(false);
      settleSlide();
    }
  };

  const lastTapRef = useRef(0);
  const handleDoubleTap = (event) => {
    if (didDragRef.current) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      event.stopPropagation();
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      data-no-tab-swipe="1"
      onTouchStartCapture={stopLightboxTouchEvent}
      onTouchMoveCapture={stopLightboxTouchMoveEvent}
      onTouchEndCapture={stopLightboxTouchEvent}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        if (didDragRef.current) return;
        if (zoom <= 1) onClose();
        else resetZoom();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(10,10,10,0.78)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        touchAction: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-lightbox-control="true"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        style={{
          position: 'absolute',
          top: `${controlMetrics.topInset}px`,
          right: `${controlMetrics.navInset}px`,
          zIndex: 10002,
        }}
      >
        <div
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          style={{
            padding: `${controlMetrics.hitPadding}px`,
            margin: '-12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'none',
          }}
        >
          <motion.button
            whileHover={{ opacity: 0.96 }}
            style={getControlButtonStyle({
              size: controlMetrics.closeButtonSize,
              radius: controlMetrics.closeRadius,
              borderWidth: controlMetrics.borderWidth,
              bottomBorderWidth: controlMetrics.bottomBorderWidth,
              elevated: false,
              isMobile: isMobile,
            })}
          >
            <X
              size={controlMetrics.closeIconSize}
              strokeWidth={2.5}
              style={getControlIconStyle()}
            />
          </motion.button>
        </div>
      </motion.div>

      {!isMobile && (
        <NavButton
          side="left"
          visible={hasPrev}
          onClick={() => navigateToImage(images[idx - 1])}
          metrics={controlMetrics}
        />
      )}

      {!isMobile && (
        <NavButton
          side="right"
          visible={hasNext}
          onClick={() => navigateToImage(images[idx + 1])}
          metrics={controlMetrics}
        />
      )}

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(event) => {
          if (didDragRef.current) return;
          if (event.target === event.currentTarget) {
            if (zoom <= 1 || isVideo) onClose();
            else resetZoom();
          }
        }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none',
        }}
      >
        {isVideo ? (
          <video
            src={src}
            controls
            autoPlay
            loop
            muted
            playsInline
            onClick={(event) => {
              event.stopPropagation();
            }}
            style={{
              maxWidth: '100vw',
              maxHeight: '100vh',
              objectFit: 'contain',
              borderRadius: '0',
              userSelect: 'none',
            }}
          />
        ) : (
          <img
            src={src}
            alt={altText}
            draggable={false}
            onClick={(event) => {
              event.stopPropagation();
              handleDoubleTap(event);
            }}
            style={{
              maxWidth: '100vw',
              maxHeight: '100vh',
              objectFit: 'contain',
              borderRadius: '0',
              transform: `translateX(${slideOffsetX}px) scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transition: isWheeling || isPanning || isPinching || isSlideDragging.current ? 'none' : 'transform 0.2s ease-out',
              willChange: 'transform',
              userSelect: 'none',
              touchAction: 'none',
            }}
          />
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? 24 : 32,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-hand)',
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.5)',
          background: 'none',
          padding: '4px 16px',
          pointerEvents: 'none',
        }}
      >
        {idx + 1} / {images.length}
      </div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
};

export default ImageLightbox;
