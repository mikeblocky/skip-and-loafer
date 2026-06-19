import { useCallback } from 'react';
import { downloadCanvas, lmPx } from '../stickerCamUtils';

function useLiveStickerActions({
  displayCvRef,
  faceAnchorPick,
  faceLmsRef,
  gatherRef,
  grabRef,
  inertiaRef,
  liveDragRef,
  livePinchRef,
  liveRef,
  mirrorCamRef,
  nextIdRef,
  renderZoom,
  requestStickerRedraw,
  selectedLiveId,
  setFaceAnchorPick,
  setLiveEditVersion,
  setPanel,
  setSelectedLiveId,
  setStickerCount,
  twoRef,
  videoRef,
}) {
  const addSticker = useCallback((src) => {
    const dcv = displayCvRef.current;
    const dpr = window.devicePixelRatio || 1;
    const id = nextIdRef.current++;

    if (faceAnchorPick) {
      const { lmIdx } = faceAnchorPick;
      const faceLms = faceLmsRef.current;
      const video = videoRef.current;
      const cw = dcv?.width ?? 640;
      const ch = dcv?.height ?? 480;
      const vw = video?.videoWidth ?? 640;
      const vh = video?.videoHeight ?? 480;
      let startX = cw / 2;
      let startY = ch / 2;

      if (faceLms?.[lmIdx]) {
        const p = lmPx(faceLms[lmIdx], cw, ch, vw, vh, mirrorCamRef.current, renderZoom);
        startX = p.x;
        startY = p.y;
      }

      liveRef.current = [...liveRef.current, {
        angularVel: 0,
        faceAnchor: { lmIdx, offX: 0, offY: 0 },
        h: 0,
        id,
        rotation: 0,
        src,
        vx: 0,
        vy: 0,
        w: 0,
        x: startX,
        y: startY,
        zIndex: id,
      }];
      setFaceAnchorPick(null);
    } else {
      const cx = dcv ? dcv.width / 2 + (Math.random() - 0.5) * 140 * dpr : 320;
      const cy = dcv ? dcv.height / 2 + (Math.random() - 0.5) * 100 * dpr : 240;
      liveRef.current = [...liveRef.current, {
        angularVel: 0,
        h: 0,
        id,
        rotation: (Math.random() - 0.5) * 22,
        src,
        vx: 0,
        vy: 0,
        w: 0,
        x: cx,
        y: cy,
        zIndex: id,
      }];
    }

    setStickerCount(c => c + 1);
    setSelectedLiveId(id);
    setPanel(null);
  }, [displayCvRef, faceAnchorPick, faceLmsRef, liveRef, mirrorCamRef, nextIdRef, renderZoom, setFaceAnchorPick, setPanel, setSelectedLiveId, setStickerCount, videoRef]);

  const clearStickers = useCallback(() => {
    liveRef.current = [];
    setStickerCount(0);
    setSelectedLiveId(null);
    grabRef.current = null;
    twoRef.current = null;
    inertiaRef.current = null;
    liveDragRef.current = null;
    livePinchRef.current = null;
  }, [grabRef, inertiaRef, liveDragRef, livePinchRef, liveRef, setSelectedLiveId, setStickerCount, twoRef]);

  const gatherStickers = useCallback(() => {
    gatherRef.current = { frames: 0 };
  }, [gatherRef]);

  const adjustSelectedLive = useCallback((updater) => {
    if (!selectedLiveId) return;
    const idx = liveRef.current.findIndex(s => s.id === selectedLiveId);
    if (idx < 0) {
      setSelectedLiveId(null);
      return;
    }
    const current = liveRef.current[idx];
    const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    liveRef.current[idx] = { ...next, angularVel: 0, vx: 0, vy: 0 };
    setLiveEditVersion(v => v + 1);
    requestStickerRedraw();
  }, [liveRef, requestStickerRedraw, selectedLiveId, setLiveEditVersion, setSelectedLiveId]);

  const deleteSelectedLive = useCallback(() => {
    if (!selectedLiveId) return;
    liveRef.current = liveRef.current.filter(s => s.id !== selectedLiveId);
    setStickerCount(liveRef.current.length);
    setSelectedLiveId(null);
    requestStickerRedraw();
  }, [liveRef, requestStickerRedraw, selectedLiveId, setSelectedLiveId, setStickerCount]);

  const savePhoto = useCallback(() => {
    const dcv = displayCvRef.current;
    if (!dcv) return;
    const out = document.createElement('canvas');
    out.width = dcv.width;
    out.height = dcv.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(dcv, 0, 0);
    downloadCanvas(out, 'sticker-live.png');
  }, [displayCvRef]);

  return {
    addSticker,
    adjustSelectedLive,
    clearStickers,
    deleteSelectedLive,
    gatherStickers,
    savePhoto,
  };
}

export { useLiveStickerActions };
