import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Sticker, Download, Trash2, ArrowLeft, ZoomIn, ZoomOut, RotateCw, ChevronUp, ChevronDown, FlipHorizontal } from 'lucide-react';
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

// ── SnapEditView ──────────────────────────────────────────────────────────────
const SnapEditView = memo(function SnapEditView({
  snapUrl, snapSize, onBack, stickers, setStickers, panel, setPanel, initialMirrored = false,
}) {
  const containerRef  = useRef(null);
  const wrapRef       = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 640, height: 480 });
  const [selectedId, setSelectedId] = useState(null);
  const [simpleEditor, setSimpleEditor] = useState(false);
  const [mirrored, setMirrored] = useState(initialMirrored);
  const nextIdRef     = useRef(200);
  const ptrsRef       = useRef({});
  const dragRef       = useRef(null);
  const pinchRef      = useRef(null);
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
    const ratio = (snapSize?.width && snapSize?.height) ? snapSize.width / snapSize.height : 4 / 3;
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
  }, [snapSize]);

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

  const onDown = useCallback((e) => {
    if (e.target.closest('[data-snap-ctrl]')) return;
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
    const W = snapSize?.width || c.offsetWidth * 2;
    const H = snapSize?.height || c.offsetHeight * 2;
    const scaleX = W / c.offsetWidth;
    const scaleY = H / c.offsetHeight;
    const stickerScale = Math.min(scaleX, scaleY);
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const bg = new Image(); bg.crossOrigin = 'anonymous';
    bg.onload = () => {
      const iAR = bg.naturalWidth / bg.naturalHeight, cAR = W / H;
      let sx, sy, sw, sh;
      if (iAR > cAR) { sh = bg.naturalHeight; sw = sh * cAR; sx = (bg.naturalWidth - sw) / 2; sy = 0; }
      else { sw = bg.naturalWidth; sh = sw / cAR; sx = 0; sy = (bg.naturalHeight - sh) / 2; }
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
  }, [mirrored, snapUrl, snapSize]);

  const sel = stickers.find(s => s.id === selectedId);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', boxSizing:'border-box', paddingBottom: simpleEditor ? 'calc(env(safe-area-inset-bottom, 0px) + 72px)' : 0, background:'#000', overflow:'hidden' }}>
      <div ref={wrapRef} style={{ flex:1, minHeight:0, display:'flex', alignItems:'center', justifyContent:'center', padding: simpleEditor ? '0' : '8px', overflow:'hidden' }}>
      <div
        ref={containerRef}
        style={{ position:'relative', width:stageSize.width, height:stageSize.height, overflow:'hidden', touchAction:'none', userSelect:'none', borderRadius: simpleEditor ? 18 : 22, background:'#05050d', border: simpleEditor ? '1px solid rgba(255,255,255,0.14)' : undefined }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <img src={snapUrl} alt="" draggable={false}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none', display:'block', transform: mirrored ? 'scaleX(-1)' : 'none' }} />

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
      </div>
      </div>

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
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:8, padding:'8px 12px 10px', background:'#000', borderTop:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
          <button onClick={onBack} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'Sniglet, var(--font-hand)', fontSize:12 }}><ArrowLeft size={16} /> Back</button>
          <button onClick={() => setPanel(p => p === 'stickers' ? null : 'stickers')} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'Sniglet, var(--font-hand)', fontSize:12 }}><Sticker size={16} /> {stickers.length}</button>
          <button onClick={() => setMirrored(v => !v)} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background: mirrored ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'Sniglet, var(--font-hand)', fontSize:12 }}><FlipHorizontal size={16} /> Flip</button>
          <button onClick={saveSnap} style={{ height:44, borderRadius:14, border:'1px solid rgba(255,255,255,0.86)', background:'rgba(255,255,255,0.92)', color:'#050505', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'Sniglet, var(--font-hand)', fontSize:12 }}><Download size={16} /> Save</button>
        </div>
      ) : (
        <>
          <div style={toolbar}>
            <ToolBtn color="#94a3b8" onClick={onBack}><ArrowLeft size={16} /> Back</ToolBtn>
            <ToolBtn color={mirrored ? '#38bdf8' : '#64748b'} onClick={() => setMirrored(v => !v)}>
              <FlipHorizontal size={16} /> {mirrored ? 'Mirrored' : 'Mirror'}
            </ToolBtn>
            <ToolBtn color="#8b5cf6" onClick={() => setPanel(p => p === 'stickers' ? null : 'stickers')}>
              <Sticker size={16} /> Stickers{stickers.length > 0 ? ` (${stickers.length})` : ''}
            </ToolBtn>
            {stickers.length > 0 && (
              <ToolBtn color="#f87171" onClick={() => { setStickers([]); setSelectedId(null); }}>
                <Trash2 size={14} /> Clear
              </ToolBtn>
            )}
            <ToolBtn color="#fbbf24" onClick={saveSnap}><Download size={16} /> Save Photo</ToolBtn>
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
