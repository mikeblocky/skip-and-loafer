import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const isVideoSrc = (value) => /\.mp4($|\?)/i.test(value || '');

const ImageLightbox = ({ src, images, onClose, onNavigate, isMobile, altText = 'Artwork' }) => {
  const overlayRef = useRef(null);
  const idx = images.indexOf(src);
  const hasPrev = idx > 0;
  const hasNext = idx < images.length - 1;
  const isVideo = isVideoSrc(src);

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

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    resetZoom();
  }, [src, resetZoom]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft' && hasPrev) onNavigate(images[idx - 1]);
      else if (event.key === 'ArrowRight' && hasNext) onNavigate(images[idx + 1]);
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
  }, [idx, hasPrev, hasNext, images, onClose, onNavigate, doZoom, resetZoom, isMobile, isVideo]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
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

    if (activePointers.current.size === 2) {
      setIsPanning(false);
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
    } else if (activePointers.current.size === 1 && isPanning) {
      setPanOffset({ x: event.clientX - panStart.current.x, y: event.clientY - panStart.current.y });
    }
  };

  const onPointerUp = (event) => {
    if (isVideo) return;
    if (event.target instanceof Element && event.target.closest('[data-lightbox-control="true"]')) return;

    activePointers.current.delete(event.pointerId);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (activePointers.current.size < 2) {
      initialPinchDist.current = null;
      setIsPinching(false);
    }

    if (activePointers.current.size === 1 && zoom > 1) {
      const point = Array.from(activePointers.current.values())[0];
      setIsPanning(true);
      panStart.current = { x: point.x - panOffset.x, y: point.y - panOffset.y };
    } else if (activePointers.current.size === 0) {
      setIsPanning(false);
    }
  };

  const lastTapRef = useRef(0);
  const handleDoubleTap = (event) => {
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
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
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
          top: isMobile ? '24px' : '12px',
          right: isMobile ? '8px' : '14px',
          zIndex: 10002,
        }}
      >
        <div
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          style={{
            padding: '24px',
            margin: '-12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'none',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none',
              border: 'none',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <X size={24} />
          </motion.button>
        </div>
      </motion.div>

      {hasPrev && (
        <div
          data-lightbox-control="true"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerMove={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(images[idx - 1]);
            resetZoom();
          }}
          style={{
            position: 'absolute',
            left: isMobile ? 0 : '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10002,
            padding: '24px',
            margin: '-12px',
            cursor: 'pointer',
            touchAction: 'none',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none',
              border: 'none',
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <ChevronLeft size={32} />
          </motion.button>
        </div>
      )}

      {hasNext && (
        <div
          data-lightbox-control="true"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerMove={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(images[idx + 1]);
            resetZoom();
          }}
          style={{
            position: 'absolute',
            right: isMobile ? 0 : '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10002,
            padding: '24px',
            margin: '-12px',
            cursor: 'pointer',
            touchAction: 'none',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none',
              border: 'none',
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <ChevronRight size={32} />
          </motion.button>
        </div>
      )}

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(event) => {
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
          <motion.video
            key={src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
          <motion.img
            key={src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transition: isWheeling || isPanning || isPinching ? 'none' : 'transform 0.2s ease-out',
              willChange: 'transform',
              userSelect: 'none',
              touchAction: 'none',
            }}
          />
        )}
      </div>

      <div style={{
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
      }}>
        {idx + 1} / {images.length}
      </div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
};

export default ImageLightbox;
