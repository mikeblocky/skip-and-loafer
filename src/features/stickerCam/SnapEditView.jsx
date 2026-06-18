import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Sticker, Download, Trash2, ArrowLeft, ZoomIn, ZoomOut, RotateCw, ChevronUp, ChevronDown } from 'lucide-react';
import { BASE_SNAP_STICKER } from './stickerCamConstants';
import { downloadCanvas, getRelPos, hitTestSnap } from './stickerCamUtils';
import { StickerPicker } from './StickerCamPanels';
import { gestureHint, toolbar } from './stickerCamStyles';
import { CtrlBtn, Sep, ToolBtn } from './stickerCamUi';

// ── SnapEditView ──────────────────────────────────────────────────────────────
const SnapEditView = memo(function SnapEditView({
  snapUrl, onBack, stickers, setStickers, panel, setPanel,
}) {
  const containerRef  = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const nextIdRef     = useRef(200);
  const ptrsRef       = useRef({});
  const dragRef       = useRef(null);
  const pinchRef      = useRef(null);
  const stickersRef   = useRef(stickers);
  useEffect(() => { stickersRef.current = stickers; }, [stickers]);

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
    const SCALE = 2;
    const W = c.offsetWidth * SCALE, H = c.offsetHeight * SCALE;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const bg = new Image(); bg.crossOrigin = 'anonymous';
    bg.onload = () => {
      const iAR = bg.naturalWidth / bg.naturalHeight, cAR = W / H;
      let sx, sy, sw, sh;
      if (iAR > cAR) { sh = bg.naturalHeight; sw = sh * cAR; sx = (bg.naturalWidth - sw) / 2; sy = 0; }
      else { sw = bg.naturalWidth; sh = sw / cAR; sx = 0; sy = (bg.naturalHeight - sh) / 2; }
      ctx.drawImage(bg, sx, sy, sw, sh, 0, 0, W, H);
      const sorted = [...stickersRef.current].sort((a, b) => a.zIndex - b.zIndex);
      if (!sorted.length) { downloadCanvas(canvas); return; }
      let pending = sorted.length;
      for (const s of sorted) {
        const si = new Image(); si.crossOrigin = 'anonymous';
        si.onload = () => {
          ctx.save(); ctx.translate(s.x * SCALE, s.y * SCALE);
          ctx.rotate(s.rotation * Math.PI / 180);
          const size = BASE_SNAP_STICKER * s.scale * SCALE;
          ctx.drawImage(si, -size / 2, -size / 2, size, size); ctx.restore();
          if (--pending === 0) downloadCanvas(canvas);
        };
        si.onerror = () => { if (--pending === 0) downloadCanvas(canvas); };
        si.src = s.src;
      }
    };
    bg.src = snapUrl;
  }, [snapUrl]);

  const sel = stickers.find(s => s.id === selectedId);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#06060f', overflow:'hidden' }}>
      <div
        ref={containerRef}
        style={{ position:'relative', flex:1, overflow:'hidden', touchAction:'none', userSelect:'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <img src={snapUrl} alt="" draggable={false}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none', display:'block' }} />

        {stickers.map(s => {
          const size = BASE_SNAP_STICKER * s.scale;
          const isSelected = s.id === selectedId;
          return (
            <div key={s.id} style={{
              position:'absolute', left:s.x, top:s.y, width:size, height:size,
              transform:`translate(-50%,-50%) rotate(${s.rotation}deg)`,
              zIndex: Math.round(s.zIndex), pointerEvents:'none',
              outline: isSelected ? '2.5px dashed rgba(251,191,36,0.85)' : 'none',
              outlineOffset: 4, borderRadius: 4,
            }}>
              <img src={s.src} alt="" draggable={false} style={{
                width:'100%', height:'100%', objectFit:'contain', display:'block',
                filter: isSelected
                  ? 'drop-shadow(0 0 10px rgba(251,191,36,0.9)) drop-shadow(0 2px 6px rgba(0,0,0,0.5))'
                  : 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))',
              }} />
            </div>
          );
        })}

        {sel && (() => {
          const halfH  = BASE_SNAP_STICKER * sel.scale / 2;
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
            <div style={{ color:'rgba(255,255,255,0.45)', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.88rem', background:'rgba(0,0,0,0.5)', borderRadius:12, padding:'8px 18px', border:'1px solid rgba(255,255,255,0.1)' }}>
              📌 Tap "Stickers" to add one
            </div>
          </div>
        )}

        {panel === 'stickers' && (
          <StickerPicker onSelect={addSnapSticker} onClose={() => setPanel(null)} hint="Pick a sticker to place" />
        )}
      </div>

      <div style={toolbar}>
        <ToolBtn color="#94a3b8" onClick={onBack}><ArrowLeft size={16} /> Back</ToolBtn>
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
    </div>
  );
});

export default SnapEditView;
