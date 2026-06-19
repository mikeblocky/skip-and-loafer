import { useCallback, useEffect, useRef } from 'react';
import { BASE_SNAP_STICKER } from '../stickerCamConstants';
import { hitTest } from '../stickerCamUtils';

function useLivePointerControls({
  applyCameraControls,
  cameraZoomRef,
  containerRef,
  grabRef,
  inertiaRef,
  liveRef,
  panel,
  pausedRef,
  setCameraZoomValue,
  setFocusPoint,
  setSelectedLiveId,
  toCvCoords,
}) {
  const cameraPinchRef = useRef(null);
  const focusTimeoutRef = useRef(null);
  const livePtrsRef = useRef({});
  const liveDragRef = useRef(null);
  const livePinchRef = useRef(null);

  const clearFocusTimeout = useCallback(() => {
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = null;
  }, []);

  const handleLivePointerDown = useCallback((e) => {
    if (panel) return;
    if (pausedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const focusRect = containerRef.current?.getBoundingClientRect();
    if (focusRect) {
      const x = Math.max(0, Math.min(1, (e.clientX - focusRect.left) / focusRect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - focusRect.top) / focusRect.height));
      setFocusPoint({ x, y });
      applyCameraControls({ x, y });
      clearFocusTimeout();
      focusTimeoutRef.current = setTimeout(() => setFocusPoint(null), 720);
    }

    const pos = toCvCoords(e.clientX, e.clientY);
    livePtrsRef.current[e.pointerId] = pos;
    const count = Object.keys(livePtrsRef.current).length;
    const live = liveRef.current;

    if (count === 1) {
      const sid = hitTest(live, pos.x, pos.y);
      if (sid != null) {
        const s = live.find(st => st.id === sid);
        setSelectedLiveId(sid);
        liveDragRef.current = { id: sid, offX: pos.x - s.x, offY: pos.y - s.y };
        if (grabRef) grabRef.current = null;
        if (inertiaRef) inertiaRef.current = null;
      } else {
        setSelectedLiveId(null);
        liveDragRef.current = null;
      }
    } else if (count === 2) {
      const pts = Object.values(livePtrsRef.current);
      const [p1, p2] = pts;
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
      const sid = liveDragRef.current?.id;
      const s = sid ? live.find(st => st.id === sid) : null;
      if (s) {
        livePinchRef.current = { id: s.id, initDist: dist, initAngle: angle, initW: s.w || BASE_SNAP_STICKER, initH: s.h || BASE_SNAP_STICKER, initR: s.rotation };
        liveDragRef.current = null;
        cameraPinchRef.current = null;
      } else {
        cameraPinchRef.current = { initDist: Math.max(1, dist), initZoom: cameraZoomRef.current };
        liveDragRef.current = null;
      }
    }
  }, [applyCameraControls, cameraZoomRef, clearFocusTimeout, containerRef, grabRef, inertiaRef, liveRef, panel, pausedRef, setFocusPoint, setSelectedLiveId, toCvCoords]);

  const handleLivePointerMove = useCallback((e) => {
    if (!liveDragRef.current && !livePinchRef.current && !cameraPinchRef.current) return;
    const pos = toCvCoords(e.clientX, e.clientY);
    livePtrsRef.current[e.pointerId] = pos;
    const live = liveRef.current;

    if (liveDragRef.current) {
      const { id, offX, offY } = liveDragRef.current;
      const idx = live.findIndex(s => s.id === id);
      if (idx >= 0) live[idx] = { ...live[idx], x: pos.x - offX, y: pos.y - offY, vx: 0, vy: 0 };
    }

    if (livePinchRef.current) {
      const pts = Object.values(livePtrsRef.current);
      if (pts.length >= 2) {
        const [p1, p2] = pts;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        const { id, initDist, initAngle, initW, initH, initR } = livePinchRef.current;
        const scale = dist / initDist;
        const idx = live.findIndex(s => s.id === id);
        if (idx >= 0) live[idx] = {
          ...live[idx],
          h: Math.max(40, initH * scale),
          rotation: initR + (angle - initAngle),
          vx: 0,
          vy: 0,
          w: Math.max(40, initW * scale),
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        };
      }
    }

    if (cameraPinchRef.current && !livePinchRef.current) {
      const pts = Object.values(livePtrsRef.current);
      if (pts.length >= 2) {
        const [p1, p2] = pts;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        setCameraZoomValue(cameraPinchRef.current.initZoom * (dist / cameraPinchRef.current.initDist));
      }
    }
  }, [liveRef, setCameraZoomValue, toCvCoords]);

  const handleLivePointerUp = useCallback((e) => {
    delete livePtrsRef.current[e.pointerId];
    const remaining = Object.keys(livePtrsRef.current).length;
    if (remaining === 0) {
      liveDragRef.current = null;
      livePinchRef.current = null;
      cameraPinchRef.current = null;
    } else if (remaining < 2) {
      cameraPinchRef.current = null;
    }
  }, []);

  useEffect(() => clearFocusTimeout, [clearFocusTimeout]);

  return {
    clearFocusTimeout,
    handleLivePointerDown,
    handleLivePointerMove,
    handleLivePointerUp,
    liveDragRef,
    livePinchRef,
    livePtrsRef,
  };
}

export { useLivePointerControls };
