/**
 * Sticker Cam — Hand-tracking sticker booth
 *
 * INTERACTION
 *   One-hand pinch over a sticker → grab & drag (drag-lerp + release inertia)
 *   Two-hand pinch simultaneously   → scale + rotate
 *   Hold pinch in empty space       → dwell progress → spawn sticker
 *
 * RENDERING
 *   Two stacked <canvas> elements in natural video space; CSS scaleX(-1) mirrors
 *   both so the user sees a selfie view.  Stickers are drawn with ctx.scale(-1,1)
 *   to counter-mirror the CSS flip — so text/art faces the right way.
 *
 * BACKGROUND EFFECTS
 *   MediaPipe ImageSegmenter loaded on demand when a segmentation-backed mode is
 *   selected.  bgMode is kept in a ref updated by a separate useEffect so the
 *   render-loop closure always reads the current value without restarting.
 */

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  Camera, CameraOff, Sticker, Download, Trash2, X,
  Eye, EyeOff, Layers, Magnet, Pause, Play, VideoOff,
} from 'lucide-react';
import stickersGalleryPaths from '../features/gallery/data/stickersGallery';
import { CHARACTER_DATA } from '../data/characters';

// ── MediaPipe CDN ─────────────────────────────────────────────────────────────
const WASM_CDN   = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const SEG_MODEL  = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';

// ── Pinch hysteresis ──────────────────────────────────────────────────────────
const PINCH_ON  = 0.050;
const PINCH_OFF = 0.085;

// ── Smoothing constants ───────────────────────────────────────────────────────
const LM_ALPHA        = 0.38;   // EMA for landmark jitter reduction
const DRAG_LERP       = 0.30;   // lerp α for smooth sticker following
const INERTIA_FRICTION = 0.85;
const INERTIA_MIN      = 0.4;   // px/frame below which inertia stops
const DWELL_FRAMES       = 50;  // frames of held pinch in empty space → spawn sticker
const DWELL_MOVE_MAX     = 32;  // px — if pinch moves farther, reset dwell
const TWO_HAND_DEBOUNCE  = 10;  // both hands must pinch this many frames before scale activates

// ── Segmentation canvas size (fed to model) ───────────────────────────────────
const SEG_W = 640, SEG_H = 360;

// ── Skeleton connections ──────────────────────────────────────────────────────
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

// ── Background modes ──────────────────────────────────────────────────────────
const BG_MODES = [
  { id: 'none',       label: '🎥 Normal',      needsSeg: false },
  { id: 'blur',       label: '🌫️ Blur BG',     needsSeg: true  },
  { id: 'black',      label: '⬛ Black',        needsSeg: true  },
  { id: 'white',      label: '⬜ White',        needsSeg: true  },
  { id: 'gradient',   label: '🌈 Gradient',     needsSeg: true  },
  { id: 'notebook',   label: '📓 Notebook',     needsSeg: true  },
  { id: 'hidePerson', label: '👻 Vanish',       needsSeg: true  },
  { id: 'hideFace',   label: '🙈 Hide Face',    needsSeg: true  },
];

// ── Character sticker sources (in picker, cycled by dwell gesture) ────────────
const CHARACTER_SRCS = CHARACTER_DATA.map(c => c.src);

// ── MediaPipe normalised → canvas pixels (object-fit:cover crop) ──────────────
function lmPx(lm, cw, ch, vw, vh) {
  const vAR = vw / vh, cAR = cw / ch;
  if (cAR >= vAR) {
    const s = cw / vw, sh = vh * s, cy = (sh - ch) / 2;
    return { x: lm.x * cw, y: lm.y * sh - cy };
  }
  const s = ch / vh, sw = vw * s, cx = (sw - cw) / 2;
  return { x: lm.x * sw - cx, y: lm.y * ch };
}

// ── Find sticker id closest to a point (within grab radius) ──────────────────
function hitTest(live, px, py) {
  let bestId = null, bestD = Infinity;
  for (const s of live) {
    const d = Math.hypot(px - s.x, py - s.y);
    if (d < Math.max(s.w, s.h) * 0.58 && d < bestD) { bestD = d; bestId = s.id; }
  }
  return bestId;
}

// ── EMA landmark smoother ─────────────────────────────────────────────────────
function smoothLandmarks(smoothMap, handIdx, raw) {
  const prev = smoothMap[handIdx];
  if (!prev) { smoothMap[handIdx] = raw.map(l => ({ ...l })); return smoothMap[handIdx]; }
  smoothMap[handIdx] = raw.map((l, i) => ({
    x: prev[i].x * (1 - LM_ALPHA) + l.x * LM_ALPHA,
    y: prev[i].y * (1 - LM_ALPHA) + l.y * LM_ALPHA,
    z: prev[i].z * (1 - LM_ALPHA) + l.z * LM_ALPHA,
  }));
  return smoothMap[handIdx];
}

// ── Notebook background pattern ───────────────────────────────────────────────
function drawNotebook(ctx, cw, ch) {
  ctx.fillStyle = '#fafaf2';
  ctx.fillRect(0, 0, cw, ch);
  // Red margin line
  ctx.strokeStyle = 'rgba(255,150,150,0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(72, 0); ctx.lineTo(72, ch); ctx.stroke();
  // Blue ruled lines
  ctx.strokeStyle = 'rgba(170,205,240,0.85)';
  ctx.lineWidth = 1;
  for (let y = 30; y < ch; y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
  }
}

// ── Background compositing (needs segmentation mask) ──────────────────────────
function applyBackground(dctx, video, catMask, maskW, maskH, cw, ch, mode, fgCv, bgCv) {
  const fgCtx = fgCv.getContext('2d');
  const bgCtx = bgCv.getContext('2d');

  // hidePerson: skip person compositing — just draw background without the person
  if (mode === 'hidePerson') {
    dctx.clearRect(0, 0, cw, ch);
    bgCtx.filter = 'blur(22px)';
    bgCtx.drawImage(video, 0, 0, cw, ch);
    bgCtx.filter = 'none';
    dctx.drawImage(bgCv, 0, 0);
    return;
  }

  // Build alpha mask: person = opaque, bg = transparent
  const maskImg = new ImageData(maskW, maskH);
  const md = maskImg.data;
  for (let i = 0; i < catMask.length; i++) {
    const cat = catMask[i];
    const isPerson = cat > 0;
    const isFace   = cat === 3;
    const alpha = (mode === 'hideFace' ? (isPerson && !isFace) : isPerson) ? 255 : 0;
    md[i * 4] = md[i * 4 + 1] = md[i * 4 + 2] = 255;
    md[i * 4 + 3] = alpha;
  }

  // Foreground: person pixels only
  fgCtx.clearRect(0, 0, cw, ch);
  fgCtx.drawImage(video, 0, 0, cw, ch);
  const maskCv = new OffscreenCanvas(maskW, maskH);
  maskCv.getContext('2d').putImageData(maskImg, 0, 0);
  fgCtx.globalCompositeOperation = 'destination-in';
  fgCtx.drawImage(maskCv, 0, 0, cw, ch);
  fgCtx.globalCompositeOperation = 'source-over';

  // Background
  bgCtx.clearRect(0, 0, cw, ch);
  if (mode === 'blur') {
    bgCtx.filter = 'blur(18px)';
    bgCtx.drawImage(video, 0, 0, cw, ch);
    bgCtx.filter = 'none';
  } else if (mode === 'black') {
    bgCtx.fillStyle = '#000'; bgCtx.fillRect(0, 0, cw, ch);
  } else if (mode === 'white') {
    bgCtx.fillStyle = '#fff'; bgCtx.fillRect(0, 0, cw, ch);
  } else if (mode === 'gradient') {
    const g = bgCtx.createLinearGradient(0, 0, cw, ch);
    g.addColorStop(0, '#1e1b4b'); g.addColorStop(0.5, '#7c3aed'); g.addColorStop(1, '#f472b6');
    bgCtx.fillStyle = g; bgCtx.fillRect(0, 0, cw, ch);
  } else if (mode === 'notebook') {
    drawNotebook(bgCtx, cw, ch);
  } else if (mode === 'hideFace') {
    bgCtx.drawImage(video, 0, 0, cw, ch);
  }

  // Composite: bg first, then person on top
  dctx.clearRect(0, 0, cw, ch);
  dctx.drawImage(bgCv, 0, 0);
  dctx.drawImage(fgCv, 0, 0);

  // Pixelate face for hideFace mode
  if (mode === 'hideFace') {
    let minX = maskW, minY = maskH, maxX = 0, maxY = 0, found = false;
    for (let y = 0; y < maskH; y++) {
      for (let x = 0; x < maskW; x++) {
        if (catMask[y * maskW + x] === 3) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
          found = true;
        }
      }
    }
    if (found) {
      const sx = cw / maskW, sy = ch / maskH, pad = 18;
      const fx = Math.max(0, minX * sx - pad), fy = Math.max(0, minY * sy - pad);
      const fw = Math.min(cw - fx, (maxX - minX) * sx + pad * 2);
      const fh = Math.min(ch - fy, (maxY - minY) * sy + pad * 2);
      const TILE = 15;
      const tiny = new OffscreenCanvas(Math.max(1, Math.ceil(fw / TILE)), Math.max(1, Math.ceil(fh / TILE)));
      tiny.getContext('2d').drawImage(video, fx, fy, fw, fh, 0, 0, tiny.width, tiny.height);
      dctx.imageSmoothingEnabled = false;
      dctx.drawImage(tiny, 0, 0, tiny.width, tiny.height, fx, fy, fw, fh);
      dctx.imageSmoothingEnabled = true;
    }
  }
}

// ── StickerPicker ─────────────────────────────────────────────────────────────
const StickerPicker = memo(({ onSelect, onClose }) => {
  const allPaths = [...CHARACTER_SRCS, ...stickersGalleryPaths];
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0, zIndex:300,
      background:'rgba(8,8,20,0.97)', backdropFilter:'blur(14px)',
      borderTop:'2px solid rgba(255,255,255,0.08)',
      display:'flex', flexDirection:'column', maxHeight:'48%',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 4px', flexShrink:0 }}>
        <span style={{ color:'#c4b5fd', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.9rem' }}>
          Pick a sticker — or pinch &amp; hold in empty space to spawn
        </span>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:4, lineHeight:1 }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(66px,1fr))', gap:6, padding:'4px 10px 16px', overflowY:'auto' }}>
        {allPaths.map(src => (
          <button key={src} onClick={() => onSelect(src)}
            style={{ background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.08)', borderRadius:10, padding:5, cursor:'pointer', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.12s,transform 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(196,181,253,0.2)'; e.currentTarget.style.transform='scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform=''; }}
          >
            <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
          </button>
        ))}
      </div>
    </div>
  );
});

// ── BgPicker ──────────────────────────────────────────────────────────────────
const BgPicker = memo(({ current, onChange, onClose }) => (
  <div style={{
    position:'absolute', bottom:0, left:0, right:0, zIndex:300,
    background:'rgba(8,8,20,0.97)', backdropFilter:'blur(14px)',
    borderTop:'2px solid rgba(255,255,255,0.08)',
    padding:'12px 14px 18px', display:'flex', flexDirection:'column', gap:10,
  }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ color:'#6ee7b7', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.9rem' }}>Background</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:4 }}><X size={18} /></button>
    </div>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {BG_MODES.map(m => (
        <button key={m.id} onClick={() => { onChange(m.id); onClose(); }}
          style={{
            padding:'8px 14px', borderRadius:12,
            background: current === m.id ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${current === m.id ? '#6ee7b7' : 'rgba(255,255,255,0.1)'}`,
            borderBottom: `4px solid ${current === m.id ? '#34d399' : 'rgba(255,255,255,0.08)'}`,
            color: current === m.id ? '#6ee7b7' : 'rgba(255,255,255,0.7)',
            fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.85rem', cursor:'pointer',
            transition:'background 0.12s',
          }}
        >{m.label}</button>
      ))}
    </div>
  </div>
));

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StickerCamPage() {
  const [stream,       setStream]       = useState(null);
  const [camError,     setCamError]     = useState(null);
  const [handStatus,   setHandStatus]   = useState('idle');
  const [segStatus,    setSegStatus]    = useState('idle');
  const [bgMode,       setBgMode]       = useState('none');
  const [stickerCount,    setStickerCount]    = useState(0);
  const [panel,           setPanel]           = useState(null);   // null|'stickers'|'bg'
  const [showSkeleton,    setShowSkeleton]    = useState(true);
  const [trackingPaused,  setTrackingPaused]  = useState(false);
  const [hideCam,         setHideCam]         = useState(false);

  // DOM refs
  const videoRef      = useRef(null);
  const displayCvRef  = useRef(null);
  const handCvRef     = useRef(null);
  const segCvRef      = useRef(null);
  const containerRef  = useRef(null);
  const hintElRef     = useRef(null);
  const rafRef        = useRef(null);

  // Model refs
  const landmarkerRef = useRef(null);
  const segmenterRef  = useRef(null);

  // ── Refs that the rAF loop reads — kept in sync by their own useEffects ──────
  // These MUST be declared before the render-loop useEffect.
  const bgModeRef        = useRef('none');
  const showSkeletonRef  = useRef(true);
  const pausedRef        = useRef(false);
  const hideCamRef       = useRef(false);

  useEffect(() => { bgModeRef.current       = bgMode;          }, [bgMode]);
  useEffect(() => { showSkeletonRef.current = showSkeleton;    }, [showSkeleton]);
  useEffect(() => { pausedRef.current       = trackingPaused;  }, [trackingPaused]);
  useEffect(() => { hideCamRef.current      = hideCam;         }, [hideCam]);

  // ── Live sticker state (mutated in rAF loop, never synced back from React) ───
  const liveRef       = useRef([]);
  const imgCache      = useRef({});
  const nextIdRef     = useRef(1);
  const dwellSrcIdx   = useRef(0);  // which character to spawn next via dwell

  // Interaction refs
  const smoothLmMap   = useRef({});
  const pinchActive   = useRef([false, false]);
  const grabRef       = useRef(null);   // { id, offX, offY }
  const twoRef        = useRef(null);   // { id, initDist, initAngle, initW, initH, initR }
  const inertiaRef    = useRef(null);   // { id, vx, vy }
  const prevPinch     = useRef([null, null]);
  const pinchVel      = useRef([{ x: 0, y: 0 }, { x: 0, y: 0 }]);
  const targetPos     = useRef(null);
  const dwellRef        = useRef(null);   // { x, y, frames } — dwell-to-spawn state
  const gatherRef       = useRef(null);   // { frames } — gather-stickers-to-view animation
  const twoHandFrames   = useRef(0);      // debounce counter before two-hand scale activates

  // Background compositing canvases (lazily sized)
  const fgCvRef = useRef(null);
  const bgCvRef = useRef(null);

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(s); setCamError(null);
    } catch (e) {
      setCamError(e.name === 'NotAllowedError'
        ? 'Camera permission denied. Allow access and try again.'
        : 'Camera error: ' + e.message);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (landmarkerRef.current) landmarkerRef.current.close();
    if (segmenterRef.current) segmenterRef.current.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load hand tracker ──────────────────────────────────────────────────────
  const loadHands = useCallback(async () => {
    if (landmarkerRef.current || handStatus === 'loading') return;
    setHandStatus('loading');
    try {
      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vis = await FilesetResolver.forVisionTasks(WASM_CDN);
      landmarkerRef.current = await HandLandmarker.createFromOptions(vis, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO', numHands: 2,
      });
      setHandStatus('ready');
    } catch { setHandStatus('error'); }
  }, [handStatus]);

  // ── Load segmenter (on demand) ─────────────────────────────────────────────
  const loadSegmenter = useCallback(async () => {
    if (segmenterRef.current || segStatus === 'loading') return;
    setSegStatus('loading');
    try {
      const { ImageSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vis = await FilesetResolver.forVisionTasks(WASM_CDN);
      segmenterRef.current = await ImageSegmenter.createFromOptions(vis, {
        baseOptions: { modelAssetPath: SEG_MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
      setSegStatus('ready');
    } catch { setSegStatus('error'); }
  }, [segStatus]);

  useEffect(() => {
    const m = BG_MODES.find(b => b.id === bgMode);
    if (m?.needsSeg && !segmenterRef.current) loadSegmenter();
  }, [bgMode, loadSegmenter]);

  const startAll = useCallback(async () => {
    await startCamera();
    loadHands();
  }, [startCamera, loadHands]);

  // ── Render + interaction loop ──────────────────────────────────────────────
  useEffect(() => {
    if (!stream) return;

    function loop() {
      const video = videoRef.current;
      const dcv   = displayCvRef.current;
      const hcv   = handCvRef.current;
      const segCv = segCvRef.current;
      const cont  = containerRef.current;
      if (!video || !dcv || !cont || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop); return;
      }

      const cw = cont.clientWidth  || 640;
      const ch = cont.clientHeight || 480;
      if (dcv.width !== cw || dcv.height !== ch) {
        dcv.width = cw; dcv.height = ch;
        if (hcv) { hcv.width = cw; hcv.height = ch; }
        fgCvRef.current = null; bgCvRef.current = null;
      }

      const vw = video.videoWidth  || 640;
      const vh = video.videoHeight || 480;
      const dctx = dcv.getContext('2d');
      const ts   = performance.now();

      // ── Ensure compositing canvases are sized ──────────────────────────────
      if (!fgCvRef.current || fgCvRef.current.width !== cw) {
        fgCvRef.current = new OffscreenCanvas(cw, ch);
        bgCvRef.current = new OffscreenCanvas(cw, ch);
      }

      // ── Background / video frame ───────────────────────────────────────────
      const mode = bgModeRef.current;   // always current — updated by useEffect
      const seg  = segmenterRef.current;

      if (hideCamRef.current) {
        // Hidden-cam: draw a plain background — no video drawn, but hand tracking still runs
        dctx.clearRect(0, 0, cw, ch);
        if (mode === 'black') {
          dctx.fillStyle = '#1a1a2e'; dctx.fillRect(0, 0, cw, ch);
        } else if (mode === 'white') {
          dctx.fillStyle = '#ffffff'; dctx.fillRect(0, 0, cw, ch);
        } else if (mode === 'gradient') {
          const g = dctx.createLinearGradient(0, 0, cw, ch);
          g.addColorStop(0, '#1e1b4b'); g.addColorStop(0.5, '#7c3aed'); g.addColorStop(1, '#f472b6');
          dctx.fillStyle = g; dctx.fillRect(0, 0, cw, ch);
        } else if (mode === 'notebook') {
          drawNotebook(dctx, cw, ch);
        } else {
          dctx.fillStyle = '#fafaf2'; dctx.fillRect(0, 0, cw, ch);
        }
      } else if (mode !== 'none' && seg && segCv) {
        segCv.getContext('2d').drawImage(video, 0, 0, SEG_W, SEG_H);
        try {
          const res = seg.segmentForVideo(segCv, ts);
          const cat = res.categoryMask?.getAsUint8Array();
          const mw  = res.categoryMask?.width  ?? SEG_W;
          const mh  = res.categoryMask?.height ?? SEG_H;
          if (cat) {
            applyBackground(dctx, video, cat, mw, mh, cw, ch, mode, fgCvRef.current, bgCvRef.current);
          } else {
            dctx.drawImage(video, 0, 0, cw, ch);
          }
        } catch { dctx.drawImage(video, 0, 0, cw, ch); }
      } else {
        dctx.drawImage(video, 0, 0, cw, ch);
      }

      // ── Draw stickers ──────────────────────────────────────────────────────
      const live = liveRef.current;
      const grabId = grabRef.current?.id ?? null;

      // Gather animation: ease off-screen/edge stickers back into view
      if (gatherRef.current) {
        gatherRef.current.frames++;
        for (let i = 0; i < live.length; i++) {
          const s = live[i];
          const hw = (s.w || 70) / 2, hh = (s.h || 70) / 2;
          const pad = 24;
          const tx = Math.max(hw + pad, Math.min(cw - hw - pad, s.x));
          const ty = Math.max(hh + pad, Math.min(ch - hh - pad, s.y));
          live[i] = { ...live[i], x: s.x + (tx - s.x) * 0.14, y: s.y + (ty - s.y) * 0.14 };
        }
        if (gatherRef.current.frames >= 50) gatherRef.current = null;
      }

      for (const s of live) {
        let img = imgCache.current[s.src];
        if (!img) { img = new Image(); img.src = s.src; imgCache.current[s.src] = img; }
        // Fix sticker to natural aspect ratio on first loaded frame (spawned with w=0)
        if (s.w === 0 && img.complete && img.naturalWidth > 0) {
          const MAX = 140;
          const ar  = img.naturalWidth / img.naturalHeight;
          const w = ar >= 1 ? MAX : MAX * ar;
          const h = ar >= 1 ? MAX / ar : MAX;
          const sIdx = live.findIndex(ss => ss.id === s.id);
          if (sIdx >= 0) live[sIdx] = { ...live[sIdx], w, h };
          continue; // skip draw this frame; next frame it'll have correct dimensions
        }
        if (img.complete && img.naturalWidth > 0 && s.w > 0) {
          const grabbed = s.id === grabId;
          dctx.save();
          dctx.translate(s.x, s.y);
          dctx.rotate(s.rotation * Math.PI / 180);
          // Counter-mirror so the sticker appears un-flipped in CSS scaleX(-1) view
          dctx.scale(-1, 1);
          dctx.shadowColor = 'rgba(0,0,0,0.35)';
          dctx.shadowBlur  = grabbed ? 14 : 8;
          dctx.drawImage(img, -s.w / 2, -s.h / 2, s.w, s.h);
          dctx.shadowBlur = 0;
          if (grabbed) {
            dctx.strokeStyle = 'rgba(251,191,36,0.85)';
            dctx.lineWidth = 3; dctx.setLineDash([6, 4]);
            dctx.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h);
            dctx.setLineDash([]);
          }
          dctx.restore();
        }
      }

      // ── Inertia ────────────────────────────────────────────────────────────
      const ix = inertiaRef.current;
      if (ix) {
        const ixIdx = live.findIndex(s => s.id === ix.id);
        if (ixIdx >= 0) {
          live[ixIdx] = { ...live[ixIdx], x: live[ixIdx].x + ix.vx, y: live[ixIdx].y + ix.vy };
          ix.vx *= INERTIA_FRICTION; ix.vy *= INERTIA_FRICTION;
          if (Math.abs(ix.vx) < INERTIA_MIN && Math.abs(ix.vy) < INERTIA_MIN) {
            inertiaRef.current = null;
          }
        } else {
          inertiaRef.current = null;
        }
      }

      // ── Hand tracking ──────────────────────────────────────────────────────
      const landmarker = landmarkerRef.current;
      const hctx = hcv?.getContext('2d');
      if (hcv && hctx) hctx.clearRect(0, 0, cw, ch);

      const pinchPoints = [];
      let hintText = '';

      if (landmarker) {
        let handRes;
        try { handRes = landmarker.detectForVideo(video, ts); } catch { /* skip frame */ }
        const hands = handRes?.landmarks ?? [];

        for (let i = 0; i < Math.min(hands.length, 2); i++) {
          const raw = hands[i];
          const lm  = smoothLandmarks(smoothLmMap.current, i, raw);

          const tp    = lmPx(lm[4],  cw, ch, vw, vh);
          const ip    = lmPx(lm[8],  cw, ch, vw, vh);
          const ndist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);

          const was = pinchActive.current[i] ?? false;
          const now = was ? ndist < PINCH_OFF : ndist < PINCH_ON;
          pinchActive.current[i] = now;

          const px = (tp.x + ip.x) / 2;
          const py = (tp.y + ip.y) / 2;
          if (now) pinchPoints.push({ x: px, y: py, handIdx: i });

          // Velocity tracking for release inertia
          const pv = pinchVel.current[i];
          const pp = prevPinch.current[i];
          if (now && pp) {
            pv.x = pv.x * 0.5 + (px - pp.x) * 0.5;
            pv.y = pv.y * 0.5 + (py - pp.y) * 0.5;
          } else if (!now) { pv.x = 0; pv.y = 0; }
          prevPinch.current[i] = now ? { x: px, y: py } : null;

          // Draw skeleton
          if (hcv && hctx && showSkeletonRef.current) {
            const col = now ? 'rgba(251,191,36,0.88)' : 'rgba(255,255,255,0.55)';
            hctx.strokeStyle = col; hctx.lineWidth = 2.5; hctx.lineCap = 'round';
            for (const [a, b] of CONNECTIONS) {
              const pa = lmPx(lm[a], cw, ch, vw, vh);
              const pb = lmPx(lm[b], cw, ch, vw, vh);
              hctx.beginPath(); hctx.moveTo(pa.x, pa.y); hctx.lineTo(pb.x, pb.y); hctx.stroke();
            }
            for (let j = 0; j < lm.length; j++) {
              const p = lmPx(lm[j], cw, ch, vw, vh);
              const key = j === 4 || j === 8;
              hctx.beginPath(); hctx.arc(p.x, p.y, key ? 6.5 : 3.5, 0, Math.PI * 2);
              hctx.fillStyle = key ? (now ? '#fbbf24' : '#e2e8f0') : 'rgba(255,255,255,0.6)';
              hctx.fill();
            }
          }

          // Pinch ring glow
          if (hcv && hctx && now) {
            hctx.beginPath(); hctx.arc(px, py, 22, 0, Math.PI * 2);
            hctx.fillStyle = 'rgba(251,191,36,0.15)'; hctx.fill();
            hctx.strokeStyle = '#fbbf24'; hctx.lineWidth = 2.5; hctx.stroke();
          }
        }

        // Clear smoothed state for hands that disappeared
        for (let i = hands.length; i < 2; i++) {
          pinchActive.current[i] = false;
          prevPinch.current[i]   = null;
          smoothLmMap.current[i] = undefined;
        }

        // ── Hover highlight: glow the sticker nearest to any open-hand index tip ─
        if (!pausedRef.current && !grabRef.current && hctx) {
          for (let i = 0; i < Math.min(hands.length, 2); i++) {
            if (!pinchActive.current[i] && smoothLmMap.current[i]) {
              const tip = lmPx(smoothLmMap.current[i][8], cw, ch, vw, vh);
              const sid = hitTest(live, tip.x, tip.y);
              if (sid !== null) {
                const hs = live.find(s => s.id === sid);
                if (hs) {
                  const r = Math.max(hs.w || 70, hs.h || 70) * 0.56;
                  hctx.beginPath();
                  hctx.arc(hs.x, hs.y, r, 0, Math.PI * 2);
                  hctx.strokeStyle = 'rgba(196,181,253,0.75)';
                  hctx.lineWidth = 2.5;
                  hctx.setLineDash([6, 4]);
                  hctx.stroke();
                  hctx.setLineDash([]);
                  hintText = '👆 Open — pinch to grab';
                }
                break;
              }
            }
          }
        }

        // ── Sticker interaction ──────────────────────────────────────────────
        if (pausedRef.current) {
          // Paused: drop any grab silently, block all new interaction
          if (grabRef.current) { grabRef.current = null; targetPos.current = null; inertiaRef.current = null; }
          dwellRef.current = null;
          hintText = '⏸ Paused — tap Resume to interact';

        } else if (pinchPoints.length === 2) {
          // Two-hand: scale + rotate (with debounce to prevent accidental activation)
          twoHandFrames.current++;
          const p1 = pinchPoints[0], p2 = pinchPoints[1];
          const dist  = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
          const mx    = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;

          if (twoHandFrames.current < TWO_HAND_DEBOUNCE) {
            // Debouncing — hold single-grab if active
            if (grabRef.current) {
              const { id, offX, offY } = grabRef.current;
              const pp = pinchPoints[0];
              const sIdx = live.findIndex(s => s.id === id);
              if (sIdx >= 0) {
                const tx = pp.x - offX, ty = pp.y - offY;
                if (!targetPos.current) targetPos.current = { x: tx, y: ty };
                targetPos.current.x += (tx - targetPos.current.x) * DRAG_LERP;
                targetPos.current.y += (ty - targetPos.current.y) * DRAG_LERP;
                live[sIdx] = { ...live[sIdx], x: targetPos.current.x, y: targetPos.current.y };
              }
            }
            hintText = grabRef.current ? '✊ Grabbing…' : '👀 Ready to scale…';
          } else {
            // Two-hand mode active
            if (!twoRef.current) {
              const sid = grabRef.current?.id ?? hitTest(live, mx, my);
              if (sid != null) {
                const s = live.find(s => s.id === sid);
                if (s) {
                  twoRef.current = { id: sid, initDist: dist, initAngle: angle, initW: s.w || 140, initH: s.h || 140, initR: s.rotation };
                  grabRef.current = { id: sid, offX: 0, offY: 0 };
                  inertiaRef.current = null;
                }
              }
            }
            if (twoRef.current) {
              const { id, initDist, initAngle, initW, initH, initR } = twoRef.current;
              const sIdx = live.findIndex(s => s.id === id);
              if (sIdx >= 0) {
                const scale = dist / initDist;
                live[sIdx] = { ...live[sIdx], w: Math.max(40, initW * scale), h: Math.max(40, initH * scale), rotation: initR + (angle - initAngle), x: mx, y: my };
              }
            }
            hintText = '🤌 Both hands — scale & rotate';
          }
          dwellRef.current = null;

        } else if (pinchPoints.length === 1) {
          twoHandFrames.current = 0;
          twoRef.current = null;
          const pp = pinchPoints[0];

          if (!grabRef.current) {
            const sid = hitTest(live, pp.x, pp.y);
            if (sid != null) {
              // Grab existing sticker
              const s = live.find(s => s.id === sid);
              if (s) {
                grabRef.current = { id: sid, offX: pp.x - s.x, offY: pp.y - s.y };
                targetPos.current = { x: s.x, y: s.y };
                inertiaRef.current = null;
                dwellRef.current = null;
              }
            } else {
              // Empty space — dwell to spawn
              if (!dwellRef.current) {
                dwellRef.current = { x: pp.x, y: pp.y, frames: 0 };
              } else {
                const moved = Math.hypot(pp.x - dwellRef.current.x, pp.y - dwellRef.current.y);
                if (moved > DWELL_MOVE_MAX) {
                  dwellRef.current = { x: pp.x, y: pp.y, frames: 0 };
                } else {
                  dwellRef.current.frames++;
                  // Draw progress ring + plus icon on hand canvas
                  if (hcv && hctx) {
                    const prog = dwellRef.current.frames / DWELL_FRAMES;
                    const { x: dx, y: dy } = dwellRef.current;
                    hctx.beginPath();
                    hctx.arc(dx, dy, 28, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
                    hctx.strokeStyle = '#a78bfa'; hctx.lineWidth = 4; hctx.stroke();
                    hctx.beginPath(); hctx.arc(dx, dy, 30, 0, Math.PI * 2);
                    hctx.strokeStyle = 'rgba(167,139,250,0.25)'; hctx.lineWidth = 1.5; hctx.stroke();
                    hctx.fillStyle = prog > 0.6 ? '#a78bfa' : 'rgba(167,139,250,0.7)';
                    hctx.font = 'bold 22px sans-serif';
                    hctx.textAlign = 'center'; hctx.textBaseline = 'middle';
                    hctx.fillText('+', dx, dy);
                  }

                  if (dwellRef.current.frames >= DWELL_FRAMES) {
                    // Spawn sticker!
                    const src = CHARACTER_SRCS[dwellSrcIdx.current % CHARACTER_SRCS.length];
                    dwellSrcIdx.current++;
                    const id = nextIdRef.current++;
                    const newS = { id, src, x: dwellRef.current.x, y: dwellRef.current.y, w: 0, h: 0, rotation: (Math.random() - 0.5) * 16 };
                    liveRef.current = [...live, newS];
                    setStickerCount(c => c + 1);
                    grabRef.current = { id, offX: 0, offY: 0 };
                    targetPos.current = { x: newS.x, y: newS.y };
                    dwellRef.current = null;
                  }
                }
              }
              hintText = dwellRef.current
                ? (dwellRef.current.frames > 10 ? '✨ Hold to spawn sticker…' : '✋ Pinch over sticker to grab')
                : '✋ Pinch over sticker to grab';
            }
          } else {
            // Currently grabbing — drag
            dwellRef.current = null;
            const { id, offX, offY } = grabRef.current;
            const sIdx = live.findIndex(s => s.id === id);
            if (sIdx >= 0) {
              const tx = pp.x - offX, ty = pp.y - offY;
              if (!targetPos.current) targetPos.current = { x: tx, y: ty };
              targetPos.current.x += (tx - targetPos.current.x) * DRAG_LERP;
              targetPos.current.y += (ty - targetPos.current.y) * DRAG_LERP;
              live[sIdx] = { ...live[sIdx], x: targetPos.current.x, y: targetPos.current.y };
            }
            hintText = '✊ Grabbing — drag to move';
          }

        } else {
          // No pinch → release with inertia
          twoHandFrames.current = 0;
          if (grabRef.current) {
            const { id } = grabRef.current;
            const vel = pinchVel.current[0];
            const sIdx = live.findIndex(s => s.id === id);
            if (sIdx >= 0 && (Math.abs(vel.x) > INERTIA_MIN || Math.abs(vel.y) > INERTIA_MIN)) {
              inertiaRef.current = { id, vx: vel.x * 2.2, vy: vel.y * 2.2 };
            }
          }
          grabRef.current   = null;
          twoRef.current    = null;
          targetPos.current = null;
          dwellRef.current  = null;
          if (!hintText) hintText = hands.length > 0 ? '✋ Open — pinch over a sticker to grab' : '';
        }

        if (hands.length === 0) hintText = '';
      }

      // Update hint via direct DOM mutation to avoid rAF→React state→re-render cycle
      if (hintElRef.current) {
        if (hintElRef.current.textContent !== hintText) {
          hintElRef.current.textContent = hintText;
          hintElRef.current.style.opacity = hintText ? '1' : '0';
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // Only restart the loop when the stream changes (bgMode, showSkeleton use refs)
  }, [stream]);

  // ── Sticker management ─────────────────────────────────────────────────────
  const addSticker = useCallback(src => {
    const cv = displayCvRef.current;
    const cx = cv ? cv.width  / 2 + (Math.random() - 0.5) * 140 : 320;
    const cy = cv ? cv.height / 2 + (Math.random() - 0.5) * 100 : 240;
    const id = nextIdRef.current++;
    const newS = { id, src, x: cx, y: cy, w: 0, h: 0, rotation: (Math.random() - 0.5) * 18 };
    liveRef.current = [...liveRef.current, newS];
    setStickerCount(c => c + 1);
    setPanel(null);
  }, []);

  const clearStickers = useCallback(() => {
    liveRef.current = [];
    setStickerCount(0);
    grabRef.current = null; twoRef.current = null; inertiaRef.current = null;
  }, []);

  const gatherStickers = useCallback(() => {
    gatherRef.current = { frames: 0 };
  }, []);

  // ── Save canvas as PNG ─────────────────────────────────────────────────────
  const savePhoto = useCallback(() => {
    const dcv = displayCvRef.current;
    if (!dcv) return;
    const out = document.createElement('canvas');
    out.width = dcv.width; out.height = dcv.height;
    const ctx = out.getContext('2d');
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(dcv, -out.width, 0); ctx.restore();
    const a = document.createElement('a');
    a.href = out.toDataURL('image/png'); a.download = 'sticker-snap.png'; a.click();
  }, []);

  const hasCamera = !!stream;
  const bgLabel   = BG_MODES.find(b => b.id === bgMode)?.label ?? '🎥 Normal';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#06060f', position:'relative', overflow:'hidden' }}>
      <div style={{
        position:'absolute',
        top:12,
        left:12,
        zIndex:220,
        display:'flex',
        alignItems:'center',
        gap:8,
        padding:'6px 12px',
        borderRadius:14,
        background:'rgba(6,182,212,0.16)',
        border:'1.5px solid rgba(103,232,249,0.44)',
        borderBottom:'4px solid rgba(8,145,178,0.55)',
        color:'#a5f3fc',
        fontFamily:'Sniglet, var(--font-hand)',
        fontSize:'0.82rem',
        pointerEvents:'none',
        boxShadow:'0 8px 22px rgba(0,0,0,0.18)',
      }}>
        <Camera size={15} />
        Sticker Cam TEMP
      </div>

      {/* Canvas area */}
      <div ref={containerRef} style={{ position:'relative', flex:1, overflow:'hidden' }}>

        <video ref={videoRef} autoPlay playsInline muted
          style={{ position:'absolute', opacity:0, pointerEvents:'none', width:1, height:1 }} />

        <canvas ref={segCvRef} width={SEG_W} height={SEG_H}
          style={{ position:'absolute', opacity:0, pointerEvents:'none', width:1, height:1 }} />

        {/* Display canvas — CSS mirror for selfie view */}
        <canvas ref={displayCvRef}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', transform:'scaleX(-1)' }} />

        {/* Hand overlay canvas — CSS mirror to match display */}
        <canvas ref={handCvRef}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', transform:'scaleX(-1)', pointerEvents:'none' }} />

        {/* No-camera placeholder */}
        {!hasCamera && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
            <div style={{ width:88, height:88, borderRadius:'50%', background:'rgba(255,255,255,0.04)', border:'2px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CameraOff size={38} color="rgba(255,255,255,0.22)" />
            </div>
            {camError
              ? <p style={{ color:'#fca5a5', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.9rem', textAlign:'center', maxWidth:280, margin:0 }}>{camError}</p>
              : <p style={{ color:'rgba(255,255,255,0.28)', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.95rem', margin:0 }}>Tap to start camera &amp; hand tracking</p>
            }
            <button onClick={startAll} style={primaryBtn}>
              <Camera size={17} /> Start Camera + Hand Tracking
            </button>
          </div>
        )}

        {/* Hint badge — updated directly via DOM ref to avoid rAF→React re-render */}
        {hasCamera && (
          <div ref={hintElRef}
            style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.62)', backdropFilter:'blur(6px)', border:'1px solid rgba(251,191,36,0.4)', borderRadius:20, padding:'5px 16px', color:'#fde68a', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.82rem', pointerEvents:'none', whiteSpace:'nowrap', zIndex:200, opacity:0, transition:'opacity 0.2s' }} />
        )}

        {/* Status chips */}
        {hasCamera && (
          <div style={{ position:'absolute', top:12, right:12, display:'flex', flexDirection:'column', gap:5, alignItems:'flex-end', zIndex:200, pointerEvents:'none' }}>
            <StatusChip label={`Hands: ${handStatus}`} color={handStatus==='ready'?'#34d399':handStatus==='loading'?'#fbbf24':'#94a3b8'} />
            {bgMode !== 'none' && <StatusChip label={`Seg: ${segStatus}`} color={segStatus==='ready'?'#34d399':segStatus==='loading'?'#fbbf24':'#94a3b8'} />}
          </div>
        )}

        {/* Pause overlay */}
        {trackingPaused && hasCamera && (
          <div onClick={() => setTrackingPaused(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.28)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:150, cursor:'pointer' }}>
            <div style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', border:'1.5px solid rgba(251,191,36,0.4)', borderRadius:20, padding:'10px 22px', color:'#fde68a', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:8 }}>
              <Pause size={16} /> Paused — tap to resume
            </div>
          </div>
        )}

        {/* Panels */}
        {panel === 'stickers' && <StickerPicker onSelect={addSticker} onClose={() => setPanel(null)} />}
        {panel === 'bg'       && <BgPicker current={bgMode} onChange={setBgMode} onClose={() => setPanel(null)} />}
      </div>

      {/* Toolbar */}
      <div style={toolbar}>
        {!hasCamera
          ? <ToolBtn color="#4d9cff" onClick={startAll}><Camera size={16} /> Start</ToolBtn>
          : <ToolBtn color="#f87171" onClick={stopCamera}><CameraOff size={16} /> Stop</ToolBtn>
        }

        <ToolBtn color="#8b5cf6" onClick={() => setPanel(p => p==='stickers'?null:'stickers')}>
          <Sticker size={16} /> Stickers{stickerCount>0?` (${stickerCount})`:''}
        </ToolBtn>

        <ToolBtn color="#6ee7b7" onClick={() => setPanel(p => p==='bg'?null:'bg')}>
          <Layers size={16} /> {bgLabel}
        </ToolBtn>

        {hasCamera && (
          <ToolBtn color={trackingPaused?'#fbbf24':'#94a3b8'} onClick={() => setTrackingPaused(v => !v)}>
            {trackingPaused ? <Play size={16} /> : <Pause size={16} />} {trackingPaused ? 'Resume' : 'Pause'}
          </ToolBtn>
        )}

        {hasCamera && (
          <ToolBtn color={hideCam?'#f472b6':'#64748b'} onClick={() => setHideCam(v => !v)}>
            <VideoOff size={16} /> {hideCam ? 'Show Cam' : 'Hide Cam'}
          </ToolBtn>
        )}

        <ToolBtn color={showSkeleton?'#38bdf8':'#475569'} onClick={() => setShowSkeleton(v => !v)}>
          {showSkeleton ? <Eye size={16} /> : <EyeOff size={16} />} Skeleton
        </ToolBtn>

        {stickerCount > 0 && (<>
          <ToolBtn color="#a78bfa" onClick={gatherStickers}><Magnet size={15} /> Gather</ToolBtn>
          <ToolBtn color="#f97316" onClick={clearStickers}><Trash2 size={15} /> Clear</ToolBtn>
        </>)}

        {hasCamera && (
          <ToolBtn color="#fbbf24" onClick={savePhoto}><Download size={16} /> Save</ToolBtn>
        )}
      </div>

      {/* Gesture guide */}
      {hasCamera && handStatus === 'ready' && !trackingPaused && (
        <div style={gestureHint}>
          ✊ Pinch sticker → drag &nbsp;·&nbsp; 🤌 Hold both hands pinched → resize/rotate &nbsp;·&nbsp; ⏳ Hold pinch in empty space → spawn
        </div>
      )}
    </div>
  );
}

// ── Tiny UI components ────────────────────────────────────────────────────────
const StatusChip = ({ label, color }) => (
  <div style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', border:`1px solid ${color}44`, borderRadius:10, padding:'3px 10px', display:'flex', alignItems:'center', gap:6 }}>
    <span style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0, boxShadow:`0 0 5px ${color}` }} />
    <span style={{ color, fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.75rem' }}>{label}</span>
  </div>
);

function ToolBtn({ color, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 13px', background:`${color}1a`, border:`1.5px solid ${color}44`, borderBottom:`4px solid ${color}66`, borderRadius:12, color, fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.86rem', cursor:'pointer', whiteSpace:'nowrap', transition:'background 0.12s, transform 0.1s' }}
      onMouseEnter={e => { e.currentTarget.style.background=`${color}2e`; e.currentTarget.style.transform='translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background=`${color}1a`; e.currentTarget.style.transform=''; }}
    >{children}</button>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const primaryBtn  = { display:'flex', alignItems:'center', gap:8, padding:'11px 24px', background:'#4d9cff', border:'none', borderBottom:'4px solid #1d4ed8', borderRadius:14, color:'white', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.95rem', cursor:'pointer', boxShadow:'0 4px 18px rgba(77,156,255,0.35)' };
const toolbar     = { display:'flex', gap:7, padding:'9px 12px', background:'rgba(6,6,15,0.97)', borderTop:'1px solid rgba(255,255,255,0.06)', flexWrap:'wrap', justifyContent:'center', flexShrink:0 };
const gestureHint = { textAlign:'center', padding:'5px 16px 9px', color:'rgba(255,255,255,0.28)', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.75rem', background:'rgba(6,6,15,0.97)', flexShrink:0 };
