import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Sticker, Download, Trash2, ArrowLeft, ZoomIn, ZoomOut, RotateCw, ChevronUp, ChevronDown, FlipHorizontal, Crop } from 'lucide-react';
import { BASE_SNAP_STICKER } from './stickerCamConstants';
import { downloadCanvas, getRelPos, hitTestSnap } from './stickerCamUtils';
import { StickerPicker } from './StickerCamPanels';
import { gestureHint, toolbar } from './stickerCamStyles';
import { CtrlBtn, Sep, ToolBtn } from './stickerCamUi';

function drawImageContain(ctx, image, x, y, width, height) {
  const naturalWidth = image.naturalWidth || width;
  const naturalHeight = image.naturalHeight || height;
  const imageRatio = naturalWidth / naturalHeight;
  const boxRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;

  if (imageRatio > boxRatio) {
    drawHeight = width / imageRatio;
  } else {
    drawWidth = height * imageRatio;
  }

  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function getCoverSourceRect(imageWidth, imageHeight, targetRatio) {
  const imageRatio = imageWidth / imageHeight;
  if (imageRatio > targetRatio) {
    const sh = imageHeight;
    const sw = sh * targetRatio;
    return { sx: (imageWidth - sw) / 2, sy: 0, sw, sh };
  }
  const sw = imageWidth;
  const sh = sw / targetRatio;
  return { sx: 0, sy: (imageHeight - sh) / 2, sw, sh };
}

const CROP_PRESETS = [
  { id: 'free', label: 'Free', ratio: null },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '4:5', label: '4:5', ratio: 4 / 5 },
  { id: '9:16', label: '9:16', ratio: 9 / 16 },
  { id: '3:2', label: '3:2', ratio: 3 / 2 },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampCropRect(rect) {
  const w = clamp(rect.w, 24, 100);
  const h = clamp(rect.h, 24, 100);
  return {
    h,
    w,
    x: clamp(rect.x, 0, 100 - w),
    y: clamp(rect.y, 0, 100 - h),
  };
}

function makePresetCrop(ratio, current = { x: 8, y: 8, w: 84, h: 84 }) {
  if (!ratio) return current;
  let w = 84;
  let h = w / ratio;
  if (h > 84) {
    h = 84;
    w = h * ratio;
  }
  return clampCropRect({
    h,
    w,
    x: 50 - w / 2,
    y: 50 - h / 2,
  });
}

const themedMobileTray = {
  background: 'linear-gradient(135deg, #fff7ed 0%, #ecfeff 50%, #fdf2f8 100%)',
  borderTop: '3px solid #bae6fd',
  boxShadow: '0 -10px 26px rgba(14,165,233,0.12)',
};

const themedIconButton = (color, active = false) => ({
  height: 44,
  borderRadius: 14,
  border: `2px solid ${color}`,
  borderBottom: `5px solid ${color}`,
  background: active ? '#ffffff' : 'rgba(255,255,255,0.86)',
  color,
  display: 'grid',
  placeItems: 'center',
  boxShadow: `0 6px 16px ${color}1f`,
});

// ── SnapEditView ──────────────────────────────────────────────────────────────
const SnapEditView = memo(function SnapEditView({
  snapUrl, snapSize, onBack, stickers, setStickers, panel, setPanel, initialMirrored = false, themedCamera = false,
}) {
  const containerRef  = useRef(null);
  const wrapRef       = useRef(null);
  const bgCanvasRef   = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 640, height: 480 });
  const [selectedId, setSelectedId] = useState(null);
  const [simpleEditor, setSimpleEditor] = useState(false);
  const [mirrored, setMirrored] = useState(initialMirrored);
  const [cropMode, setCropMode] = useState(false);
  const [cropPreset, setCropPreset] = useState('free');
  const [cropView, setCropView] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const [cropDraft, setCropDraft] = useState({ x: 8, y: 8, w: 84, h: 84 });
  const nextIdRef     = useRef(200);
  const ptrsRef       = useRef({});
  const dragRef       = useRef(null);
  const pinchRef      = useRef(null);
  const cropDragRef   = useRef(null);
  const stickersRef   = useRef(stickers);
  useEffect(() => { stickersRef.current = stickers; }, [stickers]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px), (pointer: coarse) and (max-width: 900px)');
    const update = () => setSimpleEditor(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const baseRatio = (snapSize?.width && snapSize?.height) ? snapSize.width / snapSize.height : 4 / 3;
    const ratio = baseRatio * (cropView.w / cropView.h);
    const updateSize = () => {
      const rect = wrap.getBoundingClientRect();
      const maxW = Math.max(240, rect.width);
      const maxH = Math.max(180, rect.height);
      let width = maxW;
      let height = width / ratio;
      if (height > maxH) {
        height = maxH;
        width = height * ratio;
      }
      setStageSize({ width: Math.round(width), height: Math.round(height) });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(wrap);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [cropView.h, cropView.w, snapSize]);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas || !snapUrl) return undefined;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(stageSize.width * dpr));
    const height = Math.max(1, Math.round(stageSize.height * dpr));
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const baseRatio = (snapSize?.width && snapSize?.height) ? snapSize.width / snapSize.height : image.naturalWidth / image.naturalHeight;
      let { sx, sy, sw, sh } = getCoverSourceRect(image.naturalWidth, image.naturalHeight, baseRatio);
      sx += sw * cropView.x;
      sy += sh * cropView.y;
      sw *= cropView.w;
      sh *= cropView.h;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
    };
    image.src = snapUrl;
    return undefined;
  }, [cropView, snapUrl, stageSize.height, stageSize.width]);

  const bringToFront = useCallback((id) => {
    setStickers(prev => {
      const maxZ = prev.length > 0 ? Math.max(...prev.map(s => s.zIndex)) : 0;
      return prev.map(s => s.id === id ? { ...s, zIndex: maxZ + 1 } : s);
    });
  }, [setStickers]);

  const addSnapSticker = useCallback((src) => {
    const c = containerRef.current;
    const cx = c ? c.offsetWidth  / 2 + (Math.random() - 0.5) * 120 : 200;
    const cy = c ? c.offsetHeight / 2 + (Math.random() - 0.5) * 80  : 200;
    const id = nextIdRef.current++;
    const maxZ = stickersRef.current.length > 0
      ? Math.max(...stickersRef.current.map(s => s.zIndex)) : 0;
    setStickers(prev => [...prev, {
      id, src, x: cx, y: cy, scale: 1,
      w: BASE_SNAP_STICKER,
      h: BASE_SNAP_STICKER,
      rotation: (Math.random() - 0.5) * 20,
      zIndex: maxZ + 1,
    }]);
    setPanel(null);
    setSelectedId(id);
  }, [setStickers, setPanel]);

  const deleteSelected = useCallback(() => {
    setStickers(prev => prev.filter(s => s.id !== selectedId));
    dragRef.current = null;
    setSelectedId(null);
  }, [selectedId, setStickers]);

  const adjust = useCallback((patch) => {
    setStickers(prev => prev.map(s => s.id === selectedId ? { ...s, ...patch } : s));
  }, [selectedId, setStickers]);

  const moveLayer = useCallback((dir) => {
    setStickers(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(s => s.id === selectedId);
      if (dir === 'up' && idx < sorted.length - 1) {
        const other = sorted[idx + 1];
        return prev.map(s => s.id === selectedId ? { ...s, zIndex: other.zIndex }
          : s.id === other.id ? { ...s, zIndex: sorted[idx].zIndex } : s);
      } else if (dir === 'down' && idx > 0) {
        const other = sorted[idx - 1];
        return prev.map(s => s.id === selectedId ? { ...s, zIndex: other.zIndex }
          : s.id === other.id ? { ...s, zIndex: sorted[idx].zIndex } : s);
      }
      return prev;
    });
  }, [selectedId, setStickers]);

  const setCropPresetValue = useCallback((presetId) => {
    const preset = CROP_PRESETS.find(item => item.id === presetId) ?? CROP_PRESETS[0];
    setCropPreset(preset.id);
    setCropDraft(current => makePresetCrop(preset.ratio, current));
  }, []);

  const applyCrop = useCallback(() => {
    setCropView(current => {
      const draft = clampCropRect(cropDraft);
      return {
        h: current.h * draft.h / 100,
        w: current.w * draft.w / 100,
        x: current.x + current.w * draft.x / 100,
        y: current.y + current.h * draft.y / 100,
      };
    });
    setCropDraft({ x: 0, y: 0, w: 100, h: 100 });
    setCropPreset('free');
    setCropMode(false);
  }, [cropDraft]);

  const resetCrop = useCallback(() => {
    setCropView({ x: 0, y: 0, w: 1, h: 1 });
    setCropDraft({ x: 8, y: 8, w: 84, h: 84 });
    setCropPreset('free');
  }, []);

  const startCropDrag = useCallback((e, mode) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    cropDragRef.current = {
      mode,
      start: getRelPos(e, containerRef.current),
      rect: cropDraft,
    };
  }, [cropDraft]);

  const moveCropDrag = useCallback((e) => {
    if (!cropDragRef.current) return;
    e.stopPropagation();
    const c = containerRef.current;
    if (!c) return;
    const pos = getRelPos(e, c);
    const { mode, rect, start } = cropDragRef.current;
    const dx = (pos.x - start.x) / c.offsetWidth * 100;
    const dy = (pos.y - start.y) / c.offsetHeight * 100;
    const ratio = CROP_PRESETS.find(item => item.id === cropPreset)?.ratio ?? null;
    let next = { ...rect };

    if (mode === 'move') {
      next.x = rect.x + dx;
      next.y = rect.y + dy;
    } else {
      const left = mode.includes('w') ? rect.x + dx : rect.x;
      const top = mode.includes('n') ? rect.y + dy : rect.y;
      const right = mode.includes('e') ? rect.x + rect.w + dx : rect.x + rect.w;
      const bottom = mode.includes('s') ? rect.y + rect.h + dy : rect.y + rect.h;
      next = { x: left, y: top, w: right - left, h: bottom - top };
      if (ratio) {
        if (Math.abs(dx) > Math.abs(dy)) next.h = next.w / ratio;
        else next.w = next.h * ratio;
        if (mode.includes('w')) next.x = rect.x + rect.w - next.w;
        if (mode.includes('n')) next.y = rect.y + rect.h - next.h;
      }
    }

    setCropDraft(clampCropRect(next));
  }, [cropPreset]);

  const endCropDrag = useCallback((e) => {
    if (cropDragRef.current) e.stopPropagation();
    cropDragRef.current = null;
  }, []);

  const onDown = useCallback((e) => {
    if (e.target.closest('[data-snap-ctrl]')) return;
    if (cropMode) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getRelPos(e, containerRef.current);
    ptrsRef.current[e.pointerId] = pos;
    const count = Object.keys(ptrsRef.current).length;

    if (count === 1) {
      const hit = hitTestSnap(stickersRef.current, pos.x, pos.y);
      if (hit) {
        setSelectedId(hit.id);
        bringToFront(hit.id);
        dragRef.current = { id: hit.id, offX: pos.x - hit.x, offY: pos.y - hit.y };
      } else {
        setSelectedId(null);
        dragRef.current = null;
      }
    } else if (count === 2) {
      const pts = Object.values(ptrsRef.current);
      const [p1, p2] = pts;
      const dist  = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
      const mid   = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const sid   = dragRef.current?.id ?? hitTestSnap(stickersRef.current, mid.x, mid.y)?.id;
      const s     = stickersRef.current.find(st => st.id === sid);
      if (s) {
        pinchRef.current = { id: s.id, initDist: dist, initAngle: angle, initScale: s.scale, initRot: s.rotation };
        dragRef.current  = null;
        setSelectedId(s.id);
      }
    }
  }, [bringToFront]);

  const onMove = useCallback((e) => {
    const pos = getRelPos(e, containerRef.current);
    ptrsRef.current[e.pointerId] = pos;
    if (dragRef.current) {
      const { id, offX, offY } = dragRef.current;
      setStickers(prev => prev.map(s => s.id === id
        ? { ...s, x: pos.x - offX, y: pos.y - offY } : s));
    }
    if (pinchRef.current) {
      const pts = Object.values(ptrsRef.current);
      if (pts.length >= 2) {
        const [p1, p2] = pts;
        const dist  = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        const { id, initDist, initAngle, initScale, initRot } = pinchRef.current;
        const scale    = Math.max(0.2, Math.min(7, (dist / initDist) * initScale));
        const rotation = initRot + (angle - initAngle);
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        setStickers(prev => prev.map(s => s.id === id
          ? { ...s, scale, rotation, x: mx, y: my } : s));
      }
    }
  }, [setStickers]);

  const onUp = useCallback((e) => {
    delete ptrsRef.current[e.pointerId];
    const rem = Object.keys(ptrsRef.current).length;
    if (rem === 0) { dragRef.current = null; pinchRef.current = null; }
    else if (rem === 1 && pinchRef.current) {
      const id = pinchRef.current.id;
      pinchRef.current = null;
      const [ptr] = Object.values(ptrsRef.current);
      const s = stickersRef.current.find(st => st.id === id);
      if (s) dragRef.current = { id, offX: ptr.x - s.x, offY: ptr.y - s.y };
    }
  }, []);

  const saveSnap = useCallback(() => {
    const c = containerRef.current;
    if (!c || !snapUrl) return;
    const baseW = snapSize?.width || c.offsetWidth * 2;
    const baseH = snapSize?.height || c.offsetHeight * 2;
    const W = Math.max(1, Math.round(baseW * cropView.w));
    const H = Math.max(1, Math.round(baseH * cropView.h));
    const scaleX = W / c.offsetWidth;
    const scaleY = H / c.offsetHeight;
    const stickerScale = Math.min(scaleX, scaleY);
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const bg = new Image(); bg.crossOrigin = 'anonymous';
    bg.onload = () => {
      const baseRatio = (snapSize?.width && snapSize?.height) ? snapSize.width / snapSize.height : bg.naturalWidth / bg.naturalHeight;
      let { sx, sy, sw, sh } = getCoverSourceRect(bg.naturalWidth, bg.naturalHeight, baseRatio);
      sx += sw * cropView.x;
      sy += sh * cropView.y;
      sw *= cropView.w;
      sh *= cropView.h;
      ctx.save();
      if (mirrored) {
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(bg, sx, sy, sw, sh, 0, 0, W, H);
      ctx.restore();
      const sorted = [...stickersRef.current].sort((a, b) => a.zIndex - b.zIndex);
      if (!sorted.length) { downloadCanvas(canvas); return; }
      let pending = sorted.length;
      for (const s of sorted) {
        const si = new Image(); si.crossOrigin = 'anonymous';
        si.onload = () => {
          ctx.save(); ctx.translate(s.x * scaleX, s.y * scaleY);
          ctx.rotate(s.rotation * Math.PI / 180);
          const w = (s.w ?? BASE_SNAP_STICKER) * (s.scale ?? 1) * stickerScale;
          const h = (s.h ?? BASE_SNAP_STICKER) * (s.scale ?? 1) * stickerScale;
          drawImageContain(ctx, si, -w / 2, -h / 2, w, h); ctx.restore();
          if (--pending === 0) downloadCanvas(canvas);
        };
        si.onerror = () => { if (--pending === 0) downloadCanvas(canvas); };
        si.src = s.src;
      }
    };
    bg.src = snapUrl;
  }, [cropView, mirrored, snapUrl, snapSize]);

  const sel = stickers.find(s => s.id === selectedId);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', boxSizing:'border-box', paddingBottom: simpleEditor ? 'calc(env(safe-area-inset-bottom, 0px) + 72px)' : 0, background:themedCamera ? 'linear-gradient(135deg, #fff7ed 0%, #ecfeff 50%, #fdf2f8 100%)' : '#000', overflow:'hidden' }}>
      <div ref={wrapRef} style={{ flex:1, minHeight:0, display:'flex', alignItems:'center', justifyContent:'center', padding: simpleEditor ? '0' : '8px', overflow:'hidden' }}>
      <div
        ref={containerRef}
        style={{ position:'relative', width:stageSize.width, height:stageSize.height, overflow:'hidden', touchAction:'none', userSelect:'none', borderRadius: simpleEditor ? 18 : 22, background:'#05050d', border: themedCamera ? '3px solid rgba(255,255,255,0.88)' : (simpleEditor ? '1px solid rgba(255,255,255,0.14)' : undefined), boxShadow: themedCamera ? '0 18px 38px rgba(14,165,233,0.14), 0 8px 0 rgba(251,191,36,0.16)' : undefined }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas
          ref={bgCanvasRef}
          style={{
            position:'absolute',
            inset:0,
            width:'100%',
            height:'100%',
            pointerEvents:'none',
            transform: mirrored ? 'scaleX(-1)' : 'none',
          }}
        />

        {stickers.map(s => {
          const width = (s.w ?? BASE_SNAP_STICKER) * (s.scale ?? 1);
          const height = (s.h ?? BASE_SNAP_STICKER) * (s.scale ?? 1);
          const isSelected = s.id === selectedId;
          return (
            <div key={s.id} style={{
              position:'absolute', left:s.x, top:s.y, width, height,
              transform:`translate(-50%,-50%) rotate(${s.rotation}deg)`,
              zIndex: Math.round(s.zIndex), pointerEvents:'none',
              outline: isSelected ? '2px solid rgba(255,255,255,0.9)' : 'none',
              outlineOffset: 4, borderRadius: 4,
            }}>
              <img src={s.src} alt="" draggable={false} style={{
                width:'100%', height:'100%', objectFit:'contain', display:'block',
                filter: isSelected
                  ? 'drop-shadow(0 0 8px rgba(255,255,255,0.78)) drop-shadow(0 2px 6px rgba(0,0,0,0.5))'
                  : 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))',
              }} />
            </div>
          );
        })}

        {sel && !simpleEditor && (() => {
          const halfH  = (sel.h ?? BASE_SNAP_STICKER) * (sel.scale ?? 1) / 2;
          const cw     = containerRef.current?.offsetWidth ?? 400;
          const ctrlW  = 270;
          const left   = Math.max(4, Math.min(sel.x - ctrlW / 2, cw - ctrlW - 4));
          const top    = Math.max(6, sel.y - halfH - 52);
          return (
            <div data-snap-ctrl="1"
              style={{
                position:'absolute', left, top, zIndex:2000,
                display:'flex', gap:5, alignItems:'center',
                background:'rgba(0,0,0,0.82)', backdropFilter:'blur(10px)',
                border:'1.5px solid rgba(251,191,36,0.45)',
                borderRadius:14, padding:'5px 10px',
                boxShadow:'0 4px 20px rgba(0,0,0,0.55)',
              }}
              onPointerDown={e => e.stopPropagation()}
            >
              <CtrlBtn color="#f87171" onClick={deleteSelected} title="Delete"><Trash2 size={13} /></CtrlBtn>
              <Sep />
              <CtrlBtn color="#94a3b8" onClick={() => moveLayer('up')}   title="Bring forward"><ChevronUp size={13} /></CtrlBtn>
              <CtrlBtn color="#94a3b8" onClick={() => moveLayer('down')} title="Send backward"><ChevronDown size={13} /></CtrlBtn>
              <Sep />
              <CtrlBtn color="#a78bfa" onClick={() => adjust({ rotation: sel.rotation + 15 })} title="Rotate 15°"><RotateCw size={13} /></CtrlBtn>
              <CtrlBtn color="#6ee7b7" onClick={() => adjust({ scale: Math.min(7, sel.scale + 0.25) })} title="Bigger"><ZoomIn size={13} /></CtrlBtn>
              <CtrlBtn color="#f97316" onClick={() => adjust({ scale: Math.max(0.2, sel.scale - 0.25) })} title="Smaller"><ZoomOut size={13} /></CtrlBtn>
            </div>
          );
        })()}

        {stickers.length === 0 && !panel && (
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', textAlign:'center' }}>
            <div style={{ color:'rgba(255,255,255,0.72)', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.88rem', background:'rgba(0,0,0,0.5)', borderRadius:12, padding:'8px 18px', border:'1px solid rgba(255,255,255,0.14)' }}>
              Tap Stickers to add one
            </div>
          </div>
        )}

        {panel === 'stickers' && (
          <StickerPicker onSelect={addSnapSticker} onClose={() => setPanel(null)} hint={simpleEditor ? 'Choose a sticker for this snap' : 'Pick a sticker to place'} mobile={simpleEditor} />
        )}

        {cropMode && (
          <>
            <div style={{ position:'absolute', inset:0, zIndex:1400, background:'rgba(0,0,0,0.38)', pointerEvents:'none' }} />
            <div
              data-snap-ctrl="1"
              onPointerDown={e => startCropDrag(e, 'move')}
              onPointerMove={moveCropDrag}
              onPointerUp={endCropDrag}
              onPointerCancel={endCropDrag}
              style={{
                position:'absolute',
                left:`${cropDraft.x}%`,
                top:`${cropDraft.y}%`,
                width:`${cropDraft.w}%`,
                height:`${cropDraft.h}%`,
                zIndex:1500,
                border:'2px solid rgba(255,255,255,0.95)',
                boxShadow:'0 0 0 9999px rgba(0,0,0,0.34), 0 0 18px rgba(255,255,255,0.28)',
                cursor:'move',
                touchAction:'none',
              }}
            >
              <div style={{ position:'absolute', inset:'33.333% 0 auto 0', borderTop:'1px solid rgba(255,255,255,0.42)' }} />
              <div style={{ position:'absolute', inset:'66.666% 0 auto 0', borderTop:'1px solid rgba(255,255,255,0.42)' }} />
              <div style={{ position:'absolute', inset:'0 auto 0 33.333%', borderLeft:'1px solid rgba(255,255,255,0.42)' }} />
              <div style={{ position:'absolute', inset:'0 auto 0 66.666%', borderLeft:'1px solid rgba(255,255,255,0.42)' }} />
              {['nw', 'ne', 'sw', 'se'].map(handle => (
                <button
                  key={handle}
                  type="button"
                  aria-label={`Resize ${handle}`}
                  onPointerDown={e => startCropDrag(e, handle)}
                  onPointerMove={moveCropDrag}
                  onPointerUp={endCropDrag}
                  onPointerCancel={endCropDrag}
                  style={{
                    position:'absolute',
                    width:22,
                    height:22,
                    borderRadius:'50%',
                    border:'2px solid #050505',
                    background:'#fff',
                    cursor:`${handle}-resize`,
                    left: handle.includes('w') ? -11 : undefined,
                    right: handle.includes('e') ? -11 : undefined,
                    top: handle.includes('n') ? -11 : undefined,
                    bottom: handle.includes('s') ? -11 : undefined,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
      </div>

      {cropMode && (
        <div
          data-snap-ctrl="1"
          style={{
            display:'grid',
            gridTemplateColumns:'1fr auto',
            gap:8,
            alignItems:'center',
            overflowX:'auto',
            padding:'7px 10px',
            background:themedCamera ? themedMobileTray.background : '#050505',
            borderTop:themedCamera ? themedMobileTray.borderTop : '1px solid rgba(255,255,255,0.12)',
            boxShadow:themedCamera ? themedMobileTray.boxShadow : undefined,
            flexShrink:0,
          }}
        >
          <div style={{ display:'flex', gap:4, overflowX:'auto', scrollbarWidth:'none', background:themedCamera ? 'linear-gradient(135deg, #fff7ed, #ecfeff)' : 'rgba(255,255,255,0.06)', border:themedCamera ? '2px solid #bae6fd' : '1px solid rgba(255,255,255,0.14)', borderRadius:14, padding:4 }}>
            {CROP_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setCropPresetValue(preset.id)}
                style={{
                  border:0,
                  borderRadius:10,
                  background:cropPreset === preset.id ? (themedCamera ? '#fef3c7' : 'rgba(255,255,255,0.88)') : 'transparent',
                  color:cropPreset === preset.id ? (themedCamera ? '#92400e' : '#050505') : (themedCamera ? '#64748b' : '#fff'),
                  flex:'0 0 auto',
                  fontFamily:'Sniglet, var(--font-hand)',
                  fontSize:11,
                  minHeight:30,
                  minWidth:44,
                  padding:'0 9px',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:6, flex:'0 0 auto' }}>
            <button onClick={resetCrop} title="Reset crop" style={themedCamera ? { ...themedIconButton('#f59e0b'), width:38, fontFamily:'Sniglet, var(--font-hand)', fontSize:14 } : { width:36, height:36, border:'1px solid rgba(255,255,255,0.22)', borderRadius:12, background:'rgba(255,255,255,0.08)', color:'#fff', display:'grid', placeItems:'center', fontFamily:'Sniglet, var(--font-hand)', fontSize:14 }}>↺</button>
            <button onClick={applyCrop} title="Apply crop" style={themedCamera ? { ...themedIconButton('#10b981'), width:38, fontFamily:'Sniglet, var(--font-hand)', fontSize:15 } : { width:36, height:36, border:'1px solid rgba(110,231,183,0.48)', borderRadius:12, background:'rgba(110,231,183,0.2)', color:'#bbf7d0', display:'grid', placeItems:'center', fontFamily:'Sniglet, var(--font-hand)', fontSize:15 }}>✓</button>
            <button onClick={() => setCropMode(false)} title="Done cropping" style={themedCamera ? { ...themedIconButton('#64748b'), width:38, fontFamily:'Sniglet, var(--font-hand)', fontSize:15 } : { width:36, height:36, border:'1px solid rgba(255,255,255,0.72)', borderRadius:12, background:'rgba(255,255,255,0.9)', color:'#050505', display:'grid', placeItems:'center', fontFamily:'Sniglet, var(--font-hand)', fontSize:15 }}>×</button>
          </div>
        </div>
      )}

      {sel && simpleEditor && (
        <div
          data-snap-ctrl="1"
          style={{
            display:'grid',
            gridTemplateColumns:'repeat(6, minmax(0, 1fr))',
            gap:8,
            padding:'8px 12px 4px',
            background:'#000',
            borderTop:'1px solid rgba(255,255,255,0.1)',
            flexShrink:0,
          }}
          onPointerDown={e => e.stopPropagation()}
        >
          <button onClick={deleteSelected} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Delete"><Trash2 size={18} /></button>
          <button onClick={() => moveLayer('down')} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Send backward"><ChevronDown size={18} /></button>
          <button onClick={() => moveLayer('up')} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Bring forward"><ChevronUp size={18} /></button>
          <button onClick={() => adjust({ rotation: sel.rotation + 15 })} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Rotate"><RotateCw size={18} /></button>
          <button onClick={() => adjust({ scale: Math.max(0.2, sel.scale - 0.25) })} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Smaller"><ZoomOut size={18} /></button>
          <button onClick={() => adjust({ scale: Math.min(7, sel.scale + 0.25) })} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Bigger"><ZoomIn size={18} /></button>
        </div>
      )}

      {simpleEditor ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(0, 1fr))', gap:8, padding:'8px 12px 10px', background:themedCamera ? themedMobileTray.background : '#000', borderTop:themedCamera ? themedMobileTray.borderTop : '1px solid rgba(255,255,255,0.1)', boxShadow:themedCamera ? themedMobileTray.boxShadow : undefined, flexShrink:0 }}>
          <button onClick={onBack} style={themedCamera ? themedIconButton('#64748b') : { height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Back"><ArrowLeft size={18} /></button>
          <button onClick={() => setPanel(p => p === 'stickers' ? null : 'stickers')} style={themedCamera ? { ...themedIconButton('#ec4899'), display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'Sniglet, var(--font-hand)', fontSize:12 } : { height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'Sniglet, var(--font-hand)', fontSize:12 }}><Sticker size={16} /> {stickers.length}</button>
          <button onClick={() => setCropMode(v => !v)} style={themedCamera ? themedIconButton('#06b6d4', cropMode) : { height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background: cropMode ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Crop"><Crop size={18} /></button>
          <button onClick={() => setMirrored(v => !v)} style={themedCamera ? themedIconButton('#8b5cf6', mirrored) : { height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background: mirrored ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Flip"><FlipHorizontal size={18} /></button>
          <button onClick={saveSnap} style={themedCamera ? themedIconButton('#f59e0b') : { height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.86)', background:'rgba(255,255,255,0.92)', color:'#050505', display:'grid', placeItems:'center' }} title="Save"><Download size={18} /></button>
        </div>
      ) : (
        <>
          <div style={{ ...toolbar, background: themedCamera ? 'linear-gradient(135deg, rgba(255,247,237,0.96), rgba(236,254,255,0.96) 52%, rgba(253,242,248,0.96))' : toolbar.background, borderTop: themedCamera ? '2px solid #fbcfe8' : toolbar.borderTop }}>
            <ToolBtn color="#94a3b8" onClick={onBack} title="Back" themed={themedCamera}><ArrowLeft size={16} /></ToolBtn>
            <ToolBtn color={mirrored ? '#38bdf8' : '#64748b'} onClick={() => setMirrored(v => !v)} title="Mirror image" active={mirrored} themed={themedCamera}>
              <FlipHorizontal size={16} />
            </ToolBtn>
            <ToolBtn color="#8b5cf6" onClick={() => setPanel(p => p === 'stickers' ? null : 'stickers')} title="Stickers" themed={themedCamera}>
              <Sticker size={16} /> {stickers.length > 0 ? stickers.length : ''}
            </ToolBtn>
            <ToolBtn color={cropMode ? '#6ee7b7' : '#38bdf8'} onClick={() => setCropMode(v => !v)} title="Crop" active={cropMode} themed={themedCamera}>
              <Crop size={16} />
            </ToolBtn>
            {stickers.length > 0 && (
              <ToolBtn color="#f87171" onClick={() => { setStickers([]); setSelectedId(null); }} title="Clear stickers" themed={themedCamera}>
                <Trash2 size={14} />
              </ToolBtn>
            )}
            <ToolBtn color="#fbbf24" onClick={saveSnap} title="Save photo" themed={themedCamera}><Download size={16} /></ToolBtn>
          </div>

          <div style={gestureHint}>
            👆 Tap to select &nbsp;·&nbsp; 🖱️ Drag to move &nbsp;·&nbsp; 🤌 Pinch to resize & rotate &nbsp;·&nbsp; ↑↓ to layer
          </div>
        </>
      )}
    </div>
  );
});

export default SnapEditView;
