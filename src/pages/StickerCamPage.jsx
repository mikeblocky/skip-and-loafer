import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraOff, Sticker, FlipHorizontal, Aperture, Pause, SlidersHorizontal, Trash2, Magnet, SwitchCamera, Circle } from 'lucide-react';
import {
  BASE_SNAP_STICKER, BG_MODES, CONNECTIONS, DRAG_LERP, DWELL_FRAMES, DWELL_MOVE_MAX,
  FACE_ANCHORS, FACE_MODEL, GESTURE_HOLD, GESTURE_LABELS, HAND_MODEL,
  INERTIA_FRICTION, INERTIA_MIN, MAX_TRACKED_HANDS, PHYS_ANG_DAMPEN,
  PHYS_DAMPEN, PINCH_OFF, PINCH_ON, REPULSION_FORCE, REPULSION_RADIUS,
  SEG_H, SEG_MODEL, SEG_W, TWO_HAND_DEBOUNCE, WASM_CDN, ALL_STICKER_SRCS,
} from '../features/stickerCam/stickerCamConstants';
import { OneEuroFilter } from '../features/stickerCam/trackingFilters';
import {
  applyBackground, classifyGesture, downloadCanvas, drawNotebook, drawVideoFrame, hitTest, lmPx,
} from '../features/stickerCam/stickerCamUtils';
import { BgPicker, ControlPanel, FaceAnchorPicker, StickerPicker } from '../features/stickerCam/StickerCamPanels';
import SnapEditView from '../features/stickerCam/SnapEditView';
import { gestureHint, primaryBtn, toolbar } from '../features/stickerCam/stickerCamStyles';
import { StatusChip, ToolBtn } from '../features/stickerCam/stickerCamUi';

const ASPECT_RATIOS = [
  { id: '9:16', label: '9:16', value: 9 / 16 },
  { id: '4:5', label: '4:5', value: 4 / 5 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '3:2', label: '3:2', value: 3 / 2 },
  { id: '1:1', label: '1:1', value: 1 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
];

const CAMERA_FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'soft', label: 'Soft', css: 'brightness(1.06) contrast(0.96) saturate(1.08)' },
  { id: 'pop', label: 'Pop', css: 'brightness(1.04) contrast(1.12) saturate(1.28)' },
  { id: 'film', label: 'Film', css: 'contrast(0.95) saturate(0.86) sepia(0.18)' },
  { id: 'dream', label: 'Dream', css: 'brightness(1.09) contrast(0.9) saturate(1.16) hue-rotate(-8deg)' },
  { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.08)' },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StickerCamPage() {
  const [stream,         setStream]         = useState(null);
  const [camError,       setCamError]       = useState(null);
  const [facingMode,     setFacingMode]     = useState('user');
  const [handStatus,     setHandStatus]     = useState('idle');
  const [segStatus,      setSegStatus]      = useState('idle');
  const [faceStatus,     setFaceStatus]     = useState('idle');
  const [bgMode,         setBgMode]         = useState('none');
  const [stickerCount,   setStickerCount]   = useState(0);
  const [panel,          setPanel]          = useState(null);
  const [showSkeleton,   setShowSkeleton]   = useState(true);
  const [showFaceMesh,   setShowFaceMesh]   = useState(false);
  const [trackingPaused, setTrackingPaused] = useState(false);
  const [hideCam,        setHideCam]        = useState(false);
  const [mirrorCam,      setMirrorCam]      = useState(true);
  const [aspectRatio,    setAspectRatio]    = useState('9:16');
  const [cameraFilter,   setCameraFilter]   = useState('none');
  const [stageSize,      setStageSize]      = useState({ width: 640, height: 480 });
  const [simplePhone,    setSimplePhone]    = useState(false);
  const [snapUrl,        setSnapUrl]        = useState(null);
  const [snapSize,       setSnapSize]       = useState({ width: 640, height: 480 });
  const [snapStickers,   setSnapStickers]   = useState([]);
  const [snapPanel,      setSnapPanel]      = useState(null);
  const [snapFlash,      setSnapFlash]      = useState(false);
  const [selectedLiveId, setSelectedLiveId] = useState(null);
  const [liveEditVersion, setLiveEditVersion] = useState(0);
  const [faceAnchorPick, setFaceAnchorPick] = useState(null); // {name, lmIdx} waiting for sticker pick

  // DOM refs
  const videoRef     = useRef(null);
  const displayCvRef = useRef(null);
  const handCvRef    = useRef(null);
  const segCvRef     = useRef(null);
  const containerRef = useRef(null);
  const stageWrapRef = useRef(null);
  const hintElRef    = useRef(null);
  const rafRef       = useRef(null);

  // Model refs
  const landmarkerRef = useRef(null);
  const segmenterRef  = useRef(null);
  const faceLmRef     = useRef(null);

  // rAF-synced refs
  const bgModeRef        = useRef('none');
  const showSkeletonRef  = useRef(true);
  const showFaceMeshRef  = useRef(false);
  const pausedRef        = useRef(false);
  const hideCamRef       = useRef(false);
  const facingModeRef    = useRef('user');
  const mirrorCamRef     = useRef(true);
  const simplePhoneRef   = useRef(false);
  const cameraFilterRef  = useRef('none');
  const selectedLiveIdRef = useRef(null);

  useEffect(() => { bgModeRef.current       = bgMode;         }, [bgMode]);
  useEffect(() => { showSkeletonRef.current = showSkeleton;   }, [showSkeleton]);
  useEffect(() => { showFaceMeshRef.current = showFaceMesh;   }, [showFaceMesh]);
  useEffect(() => { pausedRef.current       = trackingPaused; }, [trackingPaused]);
  useEffect(() => { hideCamRef.current      = hideCam;        }, [hideCam]);
  useEffect(() => { facingModeRef.current   = facingMode;     }, [facingMode]);
  useEffect(() => { mirrorCamRef.current    = mirrorCam;      }, [mirrorCam]);
  useEffect(() => { simplePhoneRef.current  = simplePhone;    }, [simplePhone]);
  useEffect(() => { cameraFilterRef.current = cameraFilter;   }, [cameraFilter]);
  useEffect(() => { selectedLiveIdRef.current = selectedLiveId; }, [selectedLiveId]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px), (pointer: coarse) and (max-width: 900px)');
    const update = () => {
      setSimplePhone(query.matches);
      if (query.matches) setAspectRatio('9:16');
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Live sticker state (mutated in rAF loop — no React state)
  const liveRef     = useRef([]);
  const imgCache    = useRef({});
  const nextIdRef   = useRef(1);

  // One Euro Filter per hand/landmark
  const oefRef = useRef({});

  // Interaction refs
  const pinchActive   = useRef(Array.from({ length: MAX_TRACKED_HANDS }, () => false));
  const grabRef       = useRef(null);
  const twoRef        = useRef(null);
  const inertiaRef    = useRef(null);
  const prevPinch     = useRef(Array.from({ length: MAX_TRACKED_HANDS }, () => null));
  const pinchVel      = useRef(Array.from({ length: MAX_TRACKED_HANDS }, () => ({ x: 0, y: 0 })));
  const targetPos     = useRef(null);
  const dwellRef      = useRef(null);
  const gatherRef     = useRef(null);
  const twoHandFrames = useRef(0);
  const fgCvRef       = useRef(null);
  const bgCvRef       = useRef(null);
  const snapBaseCvRef = useRef(null);
  const smoothedLmRef = useRef({});      // stores last smoothed landmarks per hand

  // Gesture state machine
  const gestStateRef = useRef({
    gesture:     Array.from({ length: MAX_TRACKED_HANDS }, () => 'idle'),
    holdFrames:  Array.from({ length: MAX_TRACKED_HANDS }, () => 0),
    cooldown:    Array.from({ length: MAX_TRACKED_HANDS }, () => 0),
    lastFired:   Array.from({ length: MAX_TRACKED_HANDS }, () => 'idle'),
  });

  // Face landmarks (last seen)
  const faceLmsRef = useRef(null);

  // External snap trigger ref (gesture peace fires it)
  const takeSnapRef = useRef(null);

  const requestStickerRedraw = useCallback(() => {
    const dcv = displayCvRef.current;
    if (!dcv) return;
    const ctx = dcv.getContext('2d');
    ctx?.clearRect(0, 0, 1, 1);
  }, []);

  // Mouse/touch drag on live canvas stickers
  const livePtrsRef  = useRef({});
  const liveDragRef  = useRef(null);
  const livePinchRef = useRef(null);

  // ── OEF helpers ──────────────────────────────────────────────────────────
  const getOEF = useCallback((handIdx, lmIdx) => {
    const map = oefRef.current;
    if (!map[handIdx]) map[handIdx] = {};
    if (!map[handIdx][lmIdx]) map[handIdx][lmIdx] = {
      x: new OneEuroFilter(30, 1.5, 0.07, 1.0),
      y: new OneEuroFilter(30, 1.5, 0.07, 1.0),
      z: new OneEuroFilter(30, 1.0, 0.03, 1.0),
    };
    return map[handIdx][lmIdx];
  }, []);

  const smoothLandmarksOEF = useCallback((handIdx, raw, ts) => {
    return raw.map((l, i) => {
      const f = getOEF(handIdx, i);
      return { x: f.x.filter(l.x, ts), y: f.y.filter(l.y, ts), z: f.z.filter(l.z, ts) };
    });
  }, [getOEF]);

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async (facing) => {
    const mode = facing ?? facingModeRef.current;
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 2560 },
          height: { ideal: 1440 },
          frameRate: { ideal: 60, max: 60 },
          advanced: [
            { focusMode: 'continuous' },
            { exposureMode: 'continuous' },
            { whiteBalanceMode: 'continuous' },
          ],
        },
        audio: false,
      });
      setStream(s); setCamError(null);
      if (facing) setFacingMode(facing);
    } catch (e) {
      setCamError(e.name === 'NotAllowedError'
        ? 'Camera permission denied. Allow access and try again.'
        : 'Camera error: ' + e.message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, [stream]);

  const flipCamera = useCallback(() => {
    startCamera(facingModeRef.current === 'user' ? 'environment' : 'user');
  }, [startCamera]);

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream, snapUrl]);

  useEffect(() => () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (landmarkerRef.current) landmarkerRef.current.close();
    if (segmenterRef.current) segmenterRef.current.close();
    if (faceLmRef.current) faceLmRef.current.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load models ────────────────────────────────────────────────────────────
  const loadHands = useCallback(async () => {
    if (landmarkerRef.current || handStatus === 'loading') return;
    setHandStatus('loading');
    try {
      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vis = await FilesetResolver.forVisionTasks(WASM_CDN);
      landmarkerRef.current = await HandLandmarker.createFromOptions(vis, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO', numHands: MAX_TRACKED_HANDS, minHandDetectionConfidence: 0.72, minHandPresenceConfidence: 0.72, minTrackingConfidence: 0.78,
      });
      setHandStatus('ready');
    } catch { setHandStatus('error'); }
  }, [handStatus]);

  const loadSegmenter = useCallback(async () => {
    if (segmenterRef.current || segStatus === 'loading') return;
    setSegStatus('loading');
    try {
      const { ImageSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vis = await FilesetResolver.forVisionTasks(WASM_CDN);
      segmenterRef.current = await ImageSegmenter.createFromOptions(vis, {
        baseOptions: { modelAssetPath: SEG_MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO', outputCategoryMask: true, outputConfidenceMasks: false,
      });
      setSegStatus('ready');
    } catch { setSegStatus('error'); }
  }, [segStatus]);

  const loadFace = useCallback(async () => {
    if (faceLmRef.current || faceStatus === 'loading') return;
    setFaceStatus('loading');
    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vis = await FilesetResolver.forVisionTasks(WASM_CDN);
      faceLmRef.current = await FaceLandmarker.createFromOptions(vis, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
      setFaceStatus('ready');
      setShowFaceMesh(true);
    } catch { setFaceStatus('error'); }
  }, [faceStatus]);

  useEffect(() => {
    const m = BG_MODES.find(b => b.id === bgMode);
    if (m?.needsSeg && !segmenterRef.current) loadSegmenter();
  }, [bgMode, loadSegmenter]);

  const startAll = useCallback(async () => {
    await startCamera();
    if (!simplePhone) loadHands();
  }, [startCamera, loadHands, simplePhone]);

  // ── Snap photo ────────────────────────────────────────────────────────────
  const takeSnap = useCallback(async () => {
    if (!stream) return;
    setSnapFlash(true);
    setTimeout(() => setSnapFlash(false), 320);

    let url;
    const base = snapBaseCvRef.current ?? displayCvRef.current;
    if (!base) return;
    url = base.toDataURL('image/jpeg', 0.95);
    setSnapSize({ width: base.width, height: base.height });

    const orderedLive = [...liveRef.current].sort((a, b) => a.id - b.id);
    const nextSnapStickers = orderedLive
      .filter(s => !s.faceAnchor && s.src && (s.w || s.h))
      .map((s, index) => ({
        id: s.id,
        src: s.src,
        x: s.x / (window.devicePixelRatio || 1),
        y: s.y / (window.devicePixelRatio || 1),
        w: (s.w || BASE_SNAP_STICKER) / (window.devicePixelRatio || 1),
        h: (s.h || BASE_SNAP_STICKER) / (window.devicePixelRatio || 1),
        scale: 1,
        rotation: s.rotation || 0,
        zIndex: index + 1,
      }));

    setSnapUrl(url);
    setSnapStickers(nextSnapStickers);
    setSnapPanel(null);
  }, [stream]);

  // Store stable ref so rAF gesture handler can call it
  useEffect(() => { takeSnapRef.current = takeSnap; }, [takeSnap]);

  useEffect(() => {
    if (snapUrl) return undefined;
    const wrap = stageWrapRef.current;
    if (!wrap) return undefined;

    const active = ASPECT_RATIOS.find(r => r.id === aspectRatio) ?? ASPECT_RATIOS[0];
    const updateSize = () => {
      const rect = wrap.getBoundingClientRect();
      const maxW = Math.max(240, rect.width);
      const maxH = Math.max(180, rect.height);
      let width = maxW;
      let height = width / active.value;
      if (height > maxH) {
        height = maxH;
        width = height * active.value;
      }
      setStageSize({
        width: Math.max(240, Math.round(width)),
        height: Math.max(180, Math.round(height)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(wrap);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [aspectRatio, snapUrl]);

  // ── toCvCoords ────────────────────────────────────────────────────────────
  const toCvCoords = useCallback((clientX, clientY) => {
    const cont = containerRef.current;
    const dcv  = displayCvRef.current;
    if (!cont || !dcv) return { x: 0, y: 0 };
    const rect = cont.getBoundingClientRect();
    let cx = (clientX - rect.left) / rect.width  * dcv.width;
    let cy = (clientY - rect.top)  / rect.height * dcv.height;
    return { x: cx, y: cy };
  }, []);

  // ── Mouse/touch drag on live canvas stickers ──────────────────────────────
  const handleLivePointerDown = useCallback((e) => {
    if (panel) return;
    if (pausedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
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
        inertiaRef.current  = null;
        grabRef.current     = null;
      } else {
        setSelectedLiveId(null);
        liveDragRef.current = null;
      }
    } else if (count === 2) {
      const pts = Object.values(livePtrsRef.current);
      const [p1, p2] = pts;
      const dist  = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
      const sid   = liveDragRef.current?.id;
      const s     = sid ? live.find(st => st.id === sid) : null;
      if (s) {
        livePinchRef.current = { id: s.id, initDist: dist, initAngle: angle, initW: s.w || 120, initH: s.h || 120, initR: s.rotation };
        liveDragRef.current  = null;
      }
    }
  }, [panel, toCvCoords]);

  const handleLivePointerMove = useCallback((e) => {
    if (!liveDragRef.current && !livePinchRef.current) return;
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
        const dist  = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        const { id, initDist, initAngle, initW, initH, initR } = livePinchRef.current;
        const scale = dist / initDist;
        const idx   = live.findIndex(s => s.id === id);
        if (idx >= 0) live[idx] = {
          ...live[idx],
          w: Math.max(40, initW * scale), h: Math.max(40, initH * scale),
          rotation: initR + (angle - initAngle),
          x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, vx: 0, vy: 0,
        };
      }
    }
  }, [toCvCoords]);

  const handleLivePointerUp = useCallback((e) => {
    delete livePtrsRef.current[e.pointerId];
    if (Object.keys(livePtrsRef.current).length === 0) {
      liveDragRef.current  = null;
      livePinchRef.current = null;
    }
  }, []);

  // ── rAF render + tracking loop ─────────────────────────────────────────────
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

      const dpr = window.devicePixelRatio || 1;
      const cw  = Math.round((cont.clientWidth  || 640) * dpr);
      const ch  = Math.round((cont.clientHeight || 480) * dpr);
      if (dcv.width !== cw || dcv.height !== ch) {
        const oldW = dcv.width || cw;
        const oldH = dcv.height || ch;
        dcv.width = cw; dcv.height = ch;
        if (hcv) { hcv.width = cw; hcv.height = ch; }
        if (oldW && oldH && (oldW !== cw || oldH !== ch)) {
          const sx = cw / oldW;
          const sy = ch / oldH;
          const sizeScale = Math.min(sx, sy);
          liveRef.current = liveRef.current.map(s => ({
            ...s,
            x: s.x * sx,
            y: s.y * sy,
            w: s.w ? s.w * sizeScale : s.w,
            h: s.h ? s.h * sizeScale : s.h,
          }));
        }
        fgCvRef.current = null; bgCvRef.current = null;
      }

      const vw = video.videoWidth  || 640;
      const vh = video.videoHeight || 480;
      const mirrored = mirrorCamRef.current;
      const activeFilter = CAMERA_FILTERS.find(f => f.id === cameraFilterRef.current) ?? CAMERA_FILTERS[0];
      const toScreen = (lm) => lmPx(lm, cw, ch, vw, vh, mirrored);
      const dctx = dcv.getContext('2d');
      dctx.imageSmoothingEnabled = true;
      dctx.imageSmoothingQuality = 'high';
      dctx.filter = activeFilter.css;
      const ts = performance.now();

      if (!fgCvRef.current || fgCvRef.current.width !== cw) {
        fgCvRef.current = new OffscreenCanvas(cw, ch);
        bgCvRef.current = new OffscreenCanvas(cw, ch);
      }
      if (!snapBaseCvRef.current || snapBaseCvRef.current.width !== cw || snapBaseCvRef.current.height !== ch) {
        snapBaseCvRef.current = document.createElement('canvas');
        snapBaseCvRef.current.width = cw;
        snapBaseCvRef.current.height = ch;
      }

      const mode = bgModeRef.current;
      const seg  = segmenterRef.current;

      // ── Draw video / background ─────────────────────────────────────────
      if (hideCamRef.current) {
        dctx.clearRect(0, 0, cw, ch);
        if (mode === 'black') { dctx.fillStyle = '#1a1a2e'; dctx.fillRect(0, 0, cw, ch); }
        else if (mode === 'white') { dctx.fillStyle = '#ffffff'; dctx.fillRect(0, 0, cw, ch); }
        else if (mode === 'gradient') {
          const g = dctx.createLinearGradient(0, 0, cw, ch);
          g.addColorStop(0, '#1e1b4b'); g.addColorStop(0.5, '#7c3aed'); g.addColorStop(1, '#f472b6');
          dctx.fillStyle = g; dctx.fillRect(0, 0, cw, ch);
        } else if (mode === 'notebook') { drawNotebook(dctx, cw, ch); }
        else { dctx.fillStyle = '#fafaf2'; dctx.fillRect(0, 0, cw, ch); }
      } else if (mode !== 'none' && seg && segCv) {
        segCv.getContext('2d').drawImage(video, 0, 0, SEG_W, SEG_H);
        try {
          const res = seg.segmentForVideo(segCv, ts);
          const cat = res.categoryMask?.getAsUint8Array();
          const mw  = res.categoryMask?.width  ?? SEG_W;
          const mh  = res.categoryMask?.height ?? SEG_H;
          if (cat) applyBackground(dctx, video, cat, mw, mh, cw, ch, mode, fgCvRef.current, bgCvRef.current, mirrored);
          else drawVideoFrame(dctx, video, cw, ch, mirrored);
        } catch { drawVideoFrame(dctx, video, cw, ch, mirrored); }
      } else {
        drawVideoFrame(dctx, video, cw, ch, mirrored);
      }
      dctx.filter = 'none';

      const snapBaseCtx = snapBaseCvRef.current?.getContext('2d');
      if (snapBaseCtx) {
        snapBaseCtx.clearRect(0, 0, cw, ch);
        snapBaseCtx.drawImage(dcv, 0, 0);
      }

      // ── Gather animation ────────────────────────────────────────────────
      const live = liveRef.current;
      if (gatherRef.current) {
        gatherRef.current.frames++;
        for (let i = 0; i < live.length; i++) {
          const s = live[i];
          const hw = (s.w || 70) / 2, hh = (s.h || 70) / 2, pad = 24;
          const tx = Math.max(hw + pad, Math.min(cw - hw - pad, s.x));
          const ty = Math.max(hh + pad, Math.min(ch - hh - pad, s.y));
          live[i] = { ...live[i], x: s.x + (tx - s.x) * 0.14, y: s.y + (ty - s.y) * 0.14, vx: 0, vy: 0 };
        }
        if (gatherRef.current.frames >= 50) gatherRef.current = null;
      }

      // ── Face tracking ───────────────────────────────────────────────────
      const faceLandmarker = faceLmRef.current;
      if (faceLandmarker) {
        try {
          const faceRes = faceLandmarker.detectForVideo(video, ts);
          const fLms = faceRes?.faceLandmarks?.[0];
          faceLmsRef.current = fLms ?? null;
        } catch { faceLmsRef.current = null; }
      }

      // ── Update face-anchored sticker positions ──────────────────────────
      const faceLms = faceLmsRef.current;
      if (faceLms && live.length > 0) {
        for (let i = 0; i < live.length; i++) {
          const s = live[i];
          if (!s.faceAnchor) continue;
          const lm = faceLms[s.faceAnchor.lmIdx];
          if (!lm) continue;
          const p = toScreen(lm);
          live[i] = { ...live[i], x: p.x + s.faceAnchor.offX, y: p.y + s.faceAnchor.offY, vx: 0, vy: 0 };
        }
      }

      // ── Sticker physics (velocity + angular velocity) ───────────────────
      const mouseDragId = liveDragRef.current?.id ?? null;
      const handGrabId  = grabRef.current?.id ?? null;
      for (let i = 0; i < live.length; i++) {
        const s = live[i];
        if (s.faceAnchor) continue;
        if (s.id === mouseDragId || s.id === handGrabId) continue;
        const vx = (s.vx ?? 0) * PHYS_DAMPEN;
        const vy = (s.vy ?? 0) * PHYS_DAMPEN;
        const av = (s.angularVel ?? 0) * PHYS_ANG_DAMPEN;
        if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05 && Math.abs(av) < 0.05) continue;
        let nx = s.x + vx, ny = s.y + vy, nr = s.rotation + av * (180 / Math.PI);
        const hw = (s.w || 70) / 2, hh = (s.h || 70) / 2;
        let bounced = false;
        if (nx - hw < 0)  { nx = hw;  live[i] = { ...live[i], vx: Math.abs(vx) * 0.6 }; bounced = true; }
        if (nx + hw > cw) { nx = cw - hw; live[i] = { ...live[i], vx: -Math.abs(vx) * 0.6 }; bounced = true; }
        if (ny - hh < 0)  { ny = hh;  live[i] = { ...live[i], vy: Math.abs(vy) * 0.6 }; bounced = true; }
        if (ny + hh > ch) { ny = ch - hh; live[i] = { ...live[i], vy: -Math.abs(vy) * 0.6 }; bounced = true; }
        live[i] = { ...live[i], x: nx, y: ny, rotation: nr, vx: bounced ? live[i].vx : vx, vy: bounced ? live[i].vy : vy, angularVel: av };
      }

      // ── Draw live stickers ──────────────────────────────────────────────
      const grabId = grabRef.current?.id ?? liveDragRef.current?.id ?? selectedLiveIdRef.current ?? null;
      const drawLive = [...live].sort((a, b) => (a.zIndex ?? a.id) - (b.zIndex ?? b.id));
      for (const s of drawLive) {
        let img = imgCache.current[s.src];
        if (!img) {
          img = new Image();
          img.decoding = 'async';
          img.onload = requestStickerRedraw;
          img.src = s.src;
          imgCache.current[s.src] = img;
        }
        if (s.w === 0 && img.complete && img.naturalWidth > 0) {
          const MAX = 140 * dpr;
          const ar  = img.naturalWidth / img.naturalHeight;
          const w = ar >= 1 ? MAX : MAX * ar;
          const h = ar >= 1 ? MAX / ar : MAX;
          const idx = live.findIndex(ss => ss.id === s.id);
          if (idx >= 0) live[idx] = { ...live[idx], w, h };
          continue;
        }
        if (img.complete && img.naturalWidth > 0 && s.w > 0) {
          const grabbed = s.id === grabId;
          dctx.save();
          dctx.translate(s.x, s.y);
          dctx.rotate(s.rotation * Math.PI / 180);
          dctx.shadowColor = 'rgba(0,0,0,0.38)';
          dctx.shadowBlur  = grabbed ? 18 : 10;
          dctx.drawImage(img, -s.w / 2, -s.h / 2, s.w, s.h);
          dctx.shadowBlur = 0;
          if (grabbed) {
            dctx.strokeStyle = 'rgba(251,191,36,0.9)';
            dctx.lineWidth = 3 * dpr; dctx.setLineDash([6 * dpr, 4 * dpr]);
            dctx.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h);
            dctx.setLineDash([]);
          }
          if (s.faceAnchor) {
            dctx.strokeStyle = 'rgba(249,168,212,0.7)';
            dctx.lineWidth = 2 * dpr; dctx.setLineDash([4 * dpr, 4 * dpr]);
            dctx.strokeRect(-s.w / 2 - 4, -s.h / 2 - 4, s.w + 8, s.h + 8);
            dctx.setLineDash([]);
          }
          dctx.restore();
        }
      }

      // ── Inertia ─────────────────────────────────────────────────────────
      const ix = inertiaRef.current;
      if (ix) {
        const ixIdx = live.findIndex(s => s.id === ix.id);
        if (ixIdx >= 0) {
          live[ixIdx] = { ...live[ixIdx], x: live[ixIdx].x + ix.vx, y: live[ixIdx].y + ix.vy };
          ix.vx *= INERTIA_FRICTION; ix.vy *= INERTIA_FRICTION;
          if (Math.abs(ix.vx) < INERTIA_MIN && Math.abs(ix.vy) < INERTIA_MIN) inertiaRef.current = null;
        } else { inertiaRef.current = null; }
      }

      // ── Hand tracking ────────────────────────────────────────────────────
      const landmarker = landmarkerRef.current;
      const hctx = hcv?.getContext('2d');
      if (hcv && hctx) hctx.clearRect(0, 0, cw, ch);

      const pinchPoints = [];
      let hintText = '';
      const gst = gestStateRef.current;

      // ── Draw face mesh (optional) ────────────────────────────────────────
      if (hcv && hctx && showFaceMeshRef.current && faceLms) {
        hctx.save();
        hctx.strokeStyle = 'rgba(249,168,212,0.35)';
        hctx.lineWidth = 1 * dpr;
        // Draw a simplified subset of face mesh edges (lips, eyes, outline)
        const FACE_EDGES = [[10,338],[338,297],[297,332],[332,284],[284,251],[251,389],[389,356],[356,454],[454,323],[323,361],[361,288],[288,397],[397,365],[365,379],[379,378],[378,400],[400,377],[377,152],[152,148],[148,176],[176,149],[149,150],[150,136],[136,172],[172,58],[58,132],[132,93],[93,234],[234,127],[127,162],[162,21],[21,54],[54,103],[103,67],[67,109],[109,10]];
        for (const [a, b] of FACE_EDGES) {
          const pa = toScreen(faceLms[a]), pb = toScreen(faceLms[b]);
          hctx.beginPath(); hctx.moveTo(pa.x, pa.y); hctx.lineTo(pb.x, pb.y); hctx.stroke();
        }
        // Highlight anchor points
        for (const [, lmIdx] of Object.entries(FACE_ANCHORS)) {
          const p = toScreen(faceLms[lmIdx]);
          hctx.beginPath(); hctx.arc(p.x, p.y, 4 * dpr, 0, Math.PI * 2);
          hctx.fillStyle = 'rgba(249,168,212,0.8)'; hctx.fill();
        }
        hctx.restore();
      }

      if (landmarker && !simplePhoneRef.current) {
        let handRes;
        try { handRes = landmarker.detectForVideo(video, ts); } catch { /* skip */ }
        const hands = handRes?.landmarks ?? [];

        // Detect gestures per hand (outside paused check so we always classify)
        const gestures = [];
        for (let i = 0; i < Math.min(hands.length, MAX_TRACKED_HANDS); i++) {
          const raw = hands[i];
          const lm  = smoothLandmarksOEF(i, raw, ts);
          smoothedLmRef.current[i] = lm;
          gestures.push(classifyGesture(lm));
        }

        for (let i = 0; i < Math.min(hands.length, MAX_TRACKED_HANDS); i++) {
          const lm  = smoothedLmRef.current[i];
          const tp  = toScreen(lm[4]);
          const ip  = toScreen(lm[8]);
          const nd  = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
          const was = pinchActive.current[i] ?? false;
          const now = was ? nd < PINCH_OFF : nd < PINCH_ON;
          pinchActive.current[i] = now;
          const px = (tp.x + ip.x) / 2, py = (tp.y + ip.y) / 2;
          if (now) pinchPoints.push({ x: px, y: py, handIdx: i });

          const pv = pinchVel.current[i] || (pinchVel.current[i] = { x: 0, y: 0 });
          const pp = prevPinch.current[i];
          if (now && pp) { pv.x = pv.x * 0.5 + (px - pp.x) * 0.5; pv.y = pv.y * 0.5 + (py - pp.y) * 0.5; }
          else if (!now) { pv.x = 0; pv.y = 0; }
          prevPinch.current[i] = now ? { x: px, y: py } : null;

          if (hcv && hctx && showSkeletonRef.current) {
            const col = now ? 'rgba(251,191,36,0.88)' : 'rgba(255,255,255,0.55)';
            hctx.strokeStyle = col; hctx.lineWidth = 2.5 * dpr; hctx.lineCap = 'round';
            for (const [a, b] of CONNECTIONS) {
              const pa = toScreen(lm[a]), pb = toScreen(lm[b]);
              hctx.beginPath(); hctx.moveTo(pa.x, pa.y); hctx.lineTo(pb.x, pb.y); hctx.stroke();
            }
            for (let j = 0; j < lm.length; j++) {
              const p = toScreen(lm[j]), key = j === 4 || j === 8;
              hctx.beginPath(); hctx.arc(p.x, p.y, (key ? 6.5 : 3.5) * dpr, 0, Math.PI * 2);
              hctx.fillStyle = key ? (now ? '#fbbf24' : '#e2e8f0') : 'rgba(255,255,255,0.6)';
              hctx.fill();
            }
          }
          if (hcv && hctx && now) {
            hctx.beginPath(); hctx.arc(px, py, 22 * dpr, 0, Math.PI * 2);
            hctx.fillStyle = 'rgba(251,191,36,0.15)'; hctx.fill();
            hctx.strokeStyle = '#fbbf24'; hctx.lineWidth = 2.5 * dpr; hctx.stroke();
          }

          // ── Gesture HUD badge ─────────────────────────────────────────────
          if (hcv && hctx && !pausedRef.current) {
            const g = gestures[i] ?? 'idle';
            if (g !== 'idle' && g !== 'other') {
              const wristP = toScreen(lm[0]);
              const badgeX = wristP.x, badgeY = wristP.y + 36 * dpr;
              const label  = GESTURE_LABELS[g] ?? '';
              const hold   = gst.holdFrames[i];
              const thresh = GESTURE_HOLD[g] ?? 0;
              hctx.save();
              // Badge background
              hctx.font = `bold ${13 * dpr}px sans-serif`;
              const tw = hctx.measureText(label).width;
              const bw = tw + 16 * dpr, bh = 20 * dpr;
              hctx.fillStyle = 'rgba(0,0,0,0.65)';
              hctx.beginPath();
              hctx.roundRect(badgeX - bw / 2, badgeY - bh / 2, bw, bh, 6 * dpr);
              hctx.fill();
              hctx.fillStyle = '#ffffff';
              hctx.textAlign = 'center'; hctx.textBaseline = 'middle';
              hctx.fillText(label, badgeX, badgeY);
              // Hold progress ring
              if (thresh > 0 && hold > 0) {
                const prog = Math.min(1, hold / thresh);
                const ring_r = 28 * dpr;
                hctx.beginPath();
                hctx.arc(wristP.x, wristP.y - 8 * dpr, ring_r, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
                hctx.strokeStyle = prog >= 1 ? '#34d399' : '#a78bfa';
                hctx.lineWidth = 3.5 * dpr; hctx.stroke();
              }
              hctx.restore();
            }
          }
        }

        for (let i = hands.length; i < MAX_TRACKED_HANDS; i++) {
          pinchActive.current[i] = false; prevPinch.current[i] = null;
          smoothedLmRef.current[i] = undefined;
          oefRef.current[i] = {};
        }

        // Hover glow
        if (!pausedRef.current && !grabRef.current && hctx) {
          for (let i = 0; i < Math.min(hands.length, MAX_TRACKED_HANDS); i++) {
            if (!pinchActive.current[i] && smoothedLmRef.current[i]) {
              const tip = toScreen(smoothedLmRef.current[i][8]);
              const sid = hitTest(live, tip.x, tip.y);
              if (sid !== null) {
                const hs = live.find(s => s.id === sid);
                if (hs) {
                  hctx.beginPath(); hctx.arc(hs.x, hs.y, Math.max(hs.w || 70, hs.h || 70) * 0.56, 0, Math.PI * 2);
                  hctx.strokeStyle = 'rgba(196,181,253,0.75)'; hctx.lineWidth = 2.5 * dpr;
                  hctx.setLineDash([6 * dpr, 4 * dpr]); hctx.stroke(); hctx.setLineDash([]);
                  hintText = '👆 Open — pinch to grab';
                }
                break;
              }
            }
          }
        }

        const activePinchPoints = pinchPoints.slice(0, 2);
        const gestureInputBusy = activePinchPoints.length > 0 || grabRef.current || twoRef.current;

        // Pointing acts like a soft lab-style magnetic cursor for fine placement.
        if (!pausedRef.current && !grabRef.current && activePinchPoints.length === 0) {
          for (let i = 0; i < Math.min(hands.length, MAX_TRACKED_HANDS); i++) {
            if ((gestures[i] ?? 'idle') !== 'point' || !smoothedLmRef.current[i]) continue;
            const tip = toScreen(smoothedLmRef.current[i][8]);
            let bestIdx = -1, bestD = Infinity;
            for (let si = 0; si < live.length; si++) {
              if (live[si].faceAnchor) continue;
              const d = Math.hypot(live[si].x - tip.x, live[si].y - tip.y);
              if (d < bestD) { bestD = d; bestIdx = si; }
            }
            if (bestIdx >= 0 && bestD < 280 * dpr) {
              const s = live[bestIdx];
              live[bestIdx] = {
                ...s,
                vx: (tip.x - s.x) * 0.035,
                vy: (tip.y - s.y) * 0.035,
                angularVel: (s.angularVel ?? 0) * 0.65,
              };
              hintText = '☝️ Point magnet';
            }
          }
        }

        // ── Gesture state machine ───────────────────────────────────────────
        if (!pausedRef.current) {
          for (let i = 0; i < Math.min(hands.length, MAX_TRACKED_HANDS); i++) {
            const g = gestures[i] ?? 'idle';
            if (gestureInputBusy) {
              gst.gesture[i] = 'idle';
              gst.holdFrames[i] = 0;
              gst.lastFired[i] = 'idle';
              continue;
            }
            if (gst.cooldown[i] > 0) { gst.cooldown[i]--; gst.gesture[i] = g; continue; }

            if (g === gst.gesture[i]) {
              gst.holdFrames[i]++;
            } else {
              gst.gesture[i] = g; gst.holdFrames[i] = 0;
            }

            const thresh = GESTURE_HOLD[g] ?? 0;
            if (thresh > 0 && gst.holdFrames[i] >= thresh && gst.lastFired[i] !== g) {
              gst.lastFired[i] = g;
              gst.cooldown[i] = 40; // 40-frame cooldown after fire

              const lm = smoothedLmRef.current[i];
              const palmP = lm ? toScreen(lm[9]) : null;

              if (g === 'peace') {
                // Peace → snap photo
                if (takeSnapRef.current) takeSnapRef.current();

              } else if (g === 'fist') {
                // Fist → delete nearest sticker to palm
                if (palmP && live.length > 0) {
                  let bestIdx = -1, bestD = Infinity;
                  for (let si = 0; si < live.length; si++) {
                    const d = Math.hypot(live[si].x - palmP.x, live[si].y - palmP.y);
                    if (d < bestD) { bestD = d; bestIdx = si; }
                  }
                  if (bestIdx >= 0 && bestD < 200 * dpr) {
                    liveRef.current = live.filter((_, idx) => idx !== bestIdx);
                    setStickerCount(c => Math.max(0, c - 1));
                    grabRef.current = null;
                  }
                }

              } else if (g === 'open') {
                // Open palm → repulsion pulse
                if (palmP) {
                  for (let si = 0; si < live.length; si++) {
                    if (live[si].faceAnchor) continue;
                    const dx = live[si].x - palmP.x, dy = live[si].y - palmP.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    if (dist < REPULSION_RADIUS * dpr) {
                      const force = (1 - dist / (REPULSION_RADIUS * dpr)) * REPULSION_FORCE;
                      live[si] = { ...live[si], vx: (dx / dist) * force, vy: (dy / dist) * force };
                    }
                  }
                }

              } else if (g === 'thumbup') {
                // Thumbs up → clone nearest sticker
                if (palmP && live.length > 0) {
                  let nearest = null, bestD = Infinity;
                  for (const s of live) {
                    const d = Math.hypot(s.x - palmP.x, s.y - palmP.y);
                    if (d < bestD) { bestD = d; nearest = s; }
                  }
                  if (nearest && bestD < 250 * dpr) {
                    const id = nextIdRef.current++;
                    liveRef.current = [...liveRef.current, {
                      ...nearest, id,
                      x: nearest.x + 60 * dpr, y: nearest.y - 40 * dpr,
                      rotation: nearest.rotation + (Math.random() - 0.5) * 30,
                      vx: (Math.random() - 0.5) * 8, vy: -6,
                      faceAnchor: undefined,
                    }];
                    setStickerCount(c => c + 1);
                  }
                }

              } else if (g === 'rock') {
                // Rock → spin stickers in range
                if (palmP) {
                  for (let si = 0; si < live.length; si++) {
                    if (live[si].faceAnchor) continue;
                    const d = Math.hypot(live[si].x - palmP.x, live[si].y - palmP.y);
                    if (d < 250 * dpr) {
                      live[si] = { ...live[si], angularVel: (Math.random() > 0.5 ? 1 : -1) * (0.1 + Math.random() * 0.15) };
                    }
                  }
                }

              } else if (g === 'shaka') {
                // Shaka → bounce all stickers
                for (let si = 0; si < live.length; si++) {
                  if (live[si].faceAnchor) continue;
                  live[si] = {
                    ...live[si],
                    vx: (Math.random() - 0.5) * 20,
                    vy: -(8 + Math.random() * 10),
                    angularVel: (Math.random() - 0.5) * 0.2,
                  };
                }
              }
            } else if (g !== gst.gesture[i]) {
              gst.lastFired[i] = 'idle';
            }
          }
          for (let i = hands.length; i < MAX_TRACKED_HANDS; i++) {
            gst.gesture[i] = 'idle'; gst.holdFrames[i] = 0; gst.cooldown[i] = 0; gst.lastFired[i] = 'idle';
          }
        }

        // ── Hand sticker interaction ──────────────────────────────────────────
        if (pausedRef.current) {
          if (grabRef.current) { grabRef.current = null; targetPos.current = null; inertiaRef.current = null; }
          dwellRef.current = null;
          hintText = '⏸ Paused';

        } else if (activePinchPoints.length === 2) {
          twoHandFrames.current++;
          const p1 = activePinchPoints[0], p2 = activePinchPoints[1];
          const dist  = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
          const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;

          if (twoHandFrames.current < TWO_HAND_DEBOUNCE) {
            if (grabRef.current) {
              const { id, offX, offY } = grabRef.current;
              const pp = activePinchPoints[0];
              const sIdx = live.findIndex(s => s.id === id);
              if (sIdx >= 0) {
                const tx = pp.x - offX, ty = pp.y - offY;
                if (!targetPos.current) targetPos.current = { x: tx, y: ty };
                targetPos.current.x += (tx - targetPos.current.x) * DRAG_LERP;
                targetPos.current.y += (ty - targetPos.current.y) * DRAG_LERP;
                live[sIdx] = { ...live[sIdx], x: targetPos.current.x, y: targetPos.current.y };
              }
            }
          } else {
            if (!twoRef.current) {
              const sid = grabRef.current?.id ?? hitTest(live, mx, my);
              if (sid != null) {
                const s = live.find(s => s.id === sid);
                if (s) {
                  twoRef.current = { id: sid, initDist: dist, initAngle: angle, initW: s.w || 140, initH: s.h || 140, initR: s.rotation };
                  grabRef.current = { id: sid, offX: 0, offY: 0, handIdx: p1.handIdx }; inertiaRef.current = null;
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

        } else if (activePinchPoints.length === 1) {
          twoHandFrames.current = 0; twoRef.current = null;
          const pp = activePinchPoints[0];
          if (!grabRef.current) {
            const sid = hitTest(live, pp.x, pp.y);
            if (sid != null) {
              const s = live.find(s => s.id === sid);
              if (s) {
                grabRef.current = { id: sid, offX: pp.x - s.x, offY: pp.y - s.y, handIdx: pp.handIdx };
                targetPos.current = { x: s.x, y: s.y }; inertiaRef.current = null; dwellRef.current = null;
              }
            } else {
              if (!dwellRef.current) {
                dwellRef.current = { x: pp.x, y: pp.y, frames: 0 };
              } else {
                const moved = Math.hypot(pp.x - dwellRef.current.x, pp.y - dwellRef.current.y);
                if (moved > DWELL_MOVE_MAX) dwellRef.current = { x: pp.x, y: pp.y, frames: 0 };
                else {
                  dwellRef.current.frames++;
                  if (hcv && hctx) {
                    const prog = dwellRef.current.frames / DWELL_FRAMES;
                    const { x: dx, y: dy } = dwellRef.current;
                    hctx.beginPath(); hctx.arc(dx, dy, 28 * dpr, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
                    hctx.strokeStyle = '#a78bfa'; hctx.lineWidth = 4 * dpr; hctx.stroke();
                    hctx.fillStyle = prog > 0.6 ? '#a78bfa' : 'rgba(167,139,250,0.7)';
                    hctx.font = `bold ${22 * dpr}px sans-serif`;
                    hctx.textAlign = 'center'; hctx.textBaseline = 'middle';
                    hctx.fillText('+', dx, dy);
                  }
                  if (dwellRef.current.frames >= DWELL_FRAMES) {
                    const src = ALL_STICKER_SRCS[Math.floor(Math.random() * ALL_STICKER_SRCS.length)];
                    const id  = nextIdRef.current++;
                    const newS = { id, src, x: dwellRef.current.x, y: dwellRef.current.y, w: 0, h: 0, rotation: (Math.random() - 0.5) * 30, vx: 0, vy: 0, angularVel: 0 };
                    liveRef.current = [...live, newS];
                    setStickerCount(c => c + 1);
                    grabRef.current = { id, offX: 0, offY: 0, handIdx: pp.handIdx };
                    targetPos.current = { x: newS.x, y: newS.y };
                    dwellRef.current = null;
                  }
                }
              }
              hintText = dwellRef.current && dwellRef.current.frames > 10
                ? '✨ Hold to spawn random sticker…'
                : '✋ Pinch over sticker to grab';
            }
          } else {
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
            hintText = '✊ Grabbing';
          }

        } else {
          twoHandFrames.current = 0;
          if (grabRef.current) {
            const { id } = grabRef.current;
            const vel  = pinchVel.current[grabRef.current.handIdx ?? 0] || pinchVel.current[0] || { x: 0, y: 0 };
            const sIdx = live.findIndex(s => s.id === id);
            if (sIdx >= 0 && (Math.abs(vel.x) > INERTIA_MIN || Math.abs(vel.y) > INERTIA_MIN))
              inertiaRef.current = { id, vx: vel.x * 2.2, vy: vel.y * 2.2 };
          }
          grabRef.current = null; twoRef.current = null;
          targetPos.current = null; dwellRef.current = null;
          if (!hintText && hands.length > 0) hintText = '✋ Pinch over sticker to grab';
        }

        if (hands.length === 0) hintText = '';
      }

      if (hintElRef.current && hintElRef.current.textContent !== hintText) {
        hintElRef.current.textContent = hintText;
        hintElRef.current.style.opacity = hintText ? '1' : '0';
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, smoothLandmarksOEF]);

  // ── Live sticker management ────────────────────────────────────────────────
  const addSticker = useCallback((src) => {
    const dcv = displayCvRef.current;
    const dpr = window.devicePixelRatio || 1;
    if (faceAnchorPick) {
      // Place face-anchored sticker
      const { lmIdx } = faceAnchorPick;
      const faceLms = faceLmsRef.current;
      const id = nextIdRef.current++;
      const video = videoRef.current;
      const cw = dcv?.width ?? 640, ch = dcv?.height ?? 480;
      const vw = video?.videoWidth ?? 640, vh = video?.videoHeight ?? 480;
      let startX = cw / 2, startY = ch / 2;
      if (faceLms?.[lmIdx]) {
        const p = lmPx(faceLms[lmIdx], cw, ch, vw, vh, mirrorCamRef.current);
        startX = p.x; startY = p.y;
      }
      liveRef.current = [...liveRef.current, {
        id, src, x: startX, y: startY, w: 0, h: 0, rotation: 0, vx: 0, vy: 0, angularVel: 0,
        zIndex: id,
        faceAnchor: { lmIdx, offX: 0, offY: 0 },
      }];
      setStickerCount(c => c + 1);
      setSelectedLiveId(id);
      setFaceAnchorPick(null);
      setPanel(null);
      return;
    }
    const cx  = dcv ? dcv.width  / 2 + (Math.random() - 0.5) * 140 * dpr : 320;
    const cy  = dcv ? dcv.height / 2 + (Math.random() - 0.5) * 100 * dpr : 240;
    const id  = nextIdRef.current++;
    liveRef.current = [...liveRef.current, { id, src, x: cx, y: cy, w: 0, h: 0, rotation: (Math.random() - 0.5) * 22, vx: 0, vy: 0, angularVel: 0, zIndex: id }];
    setStickerCount(c => c + 1);
    setSelectedLiveId(id);
    setPanel(null);
  }, [faceAnchorPick]);

  const clearStickers = useCallback(() => {
    liveRef.current = []; setStickerCount(0);
    setSelectedLiveId(null);
    grabRef.current = null; twoRef.current = null; inertiaRef.current = null;
    liveDragRef.current = null; livePinchRef.current = null;
  }, []);

  const gatherStickers = useCallback(() => { gatherRef.current = { frames: 0 }; }, []);

  const adjustSelectedLive = useCallback((updater) => {
    if (!selectedLiveId) return;
    const idx = liveRef.current.findIndex(s => s.id === selectedLiveId);
    if (idx < 0) {
      setSelectedLiveId(null);
      return;
    }
    const current = liveRef.current[idx];
    const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    liveRef.current[idx] = { ...next, vx: 0, vy: 0, angularVel: 0 };
    setLiveEditVersion(v => v + 1);
    requestStickerRedraw();
  }, [requestStickerRedraw, selectedLiveId]);

  const deleteSelectedLive = useCallback(() => {
    if (!selectedLiveId) return;
    liveRef.current = liveRef.current.filter(s => s.id !== selectedLiveId);
    setStickerCount(liveRef.current.length);
    setSelectedLiveId(null);
    requestStickerRedraw();
  }, [requestStickerRedraw, selectedLiveId]);

  const savePhoto = useCallback(() => {
    const dcv = displayCvRef.current; if (!dcv) return;
    const out = document.createElement('canvas');
    out.width = dcv.width; out.height = dcv.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(dcv, 0, 0);
    downloadCanvas(out, 'sticker-live.png');
  }, []);

  // ── Face anchor picking ────────────────────────────────────────────────────
  const startFaceAnchorPick = useCallback((name, lmIdx) => {
    setFaceAnchorPick({ name, lmIdx });
    setPanel('stickers');
  }, []);

  // ── Snap mode ─────────────────────────────────────────────────────────────
  if (snapUrl) {
    return (
      <SnapEditView
        snapUrl={snapUrl}
        snapSize={snapSize}
        onBack={() => {
          setSnapUrl(null);
          requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
        }}
        stickers={snapStickers}
        setStickers={setSnapStickers}
        panel={snapPanel}
        setPanel={setSnapPanel}
      />
    );
  }

  const hasCamera = !!stream;
  const bgLabel   = BG_MODES.find(b => b.id === bgMode)?.label ?? '🎥 Normal';
  const isFront   = facingMode === 'user';
  const activeAspect = ASPECT_RATIOS.find(r => r.id === aspectRatio) ?? ASPECT_RATIOS[0];
  const selectedLive = liveRef.current.find(s => s.id === selectedLiveId);
  const stageStyle = {
    position: 'relative',
    flex: '0 0 auto',
    overflow: 'hidden',
    width: stageSize.width,
    height: stageSize.height,
    alignSelf: 'center',
    background: '#05050d',
    borderRadius: simplePhone ? 24 : 22,
    boxShadow: simplePhone ? 'none' : undefined,
    border: simplePhone ? '1px solid rgba(255,255,255,0.14)' : undefined,
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', boxSizing:'border-box', paddingBottom: simplePhone ? 'calc(env(safe-area-inset-bottom, 0px) + 72px)' : 0, background: simplePhone ? '#000' : '#06060f', overflow:'hidden', alignItems:'stretch' }}>
      <div ref={stageWrapRef} style={{ flex:1, minHeight:0, display:'flex', alignItems:'flex-start', justifyContent:'center', padding: simplePhone ? '0' : '8px 8px 0', overflow:'hidden' }}>
        <div ref={containerRef} style={stageStyle}>

        <video ref={videoRef} autoPlay playsInline muted
          style={{ position:'absolute', opacity:0, pointerEvents:'none', width:1, height:1 }} />
        <canvas ref={segCvRef} width={SEG_W} height={SEG_H}
          style={{ position:'absolute', opacity:0, pointerEvents:'none', width:1, height:1 }} />

        <canvas ref={displayCvRef}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />

        <canvas ref={handCvRef}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />

        {hasCamera && (
          <div
            style={{ position:'absolute', inset:0, zIndex:50, cursor:'crosshair', touchAction:'none' }}
            onPointerDown={handleLivePointerDown}
            onPointerMove={handleLivePointerMove}
            onPointerUp={handleLivePointerUp}
            onPointerCancel={handleLivePointerUp}
          />
        )}

        {!hasCamera && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, background: simplePhone ? '#111118' : undefined }}>
            <div style={{ width:88, height:88, borderRadius:'50%', background: simplePhone ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border: simplePhone ? '1px solid rgba(255,255,255,0.28)' : '2px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CameraOff size={38} color={simplePhone ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.22)'} />
            </div>
            {camError
              ? <p style={{ color:'#fca5a5', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.9rem', textAlign:'center', maxWidth:280, margin:0 }}>{camError}</p>
              : <p style={{ color: simplePhone ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.28)', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.95rem', margin:0 }}>{simplePhone ? 'Open camera' : 'Tap to start camera & hand tracking'}</p>
            }
            <button onClick={startAll} style={simplePhone ? { ...primaryBtn, background:'rgba(255,255,255,0.94)', border:'1px solid rgba(255,255,255,0.84)', borderBottom:'3px solid rgba(255,255,255,0.58)', color:'#050505', boxShadow:'0 8px 26px rgba(0,0,0,0.28)' } : primaryBtn}><Camera size={17} /> {simplePhone ? 'Start Camera' : 'Start Camera + Hand Tracking'}</button>
          </div>
        )}

        {hasCamera && !simplePhone && (
          <div ref={hintElRef}
            style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.62)', backdropFilter:'blur(6px)', border:'1px solid rgba(251,191,36,0.4)', borderRadius:20, padding:'5px 16px', color:'#fde68a', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.82rem', pointerEvents:'none', whiteSpace:'nowrap', zIndex:200, opacity:0, transition:'opacity 0.2s' }} />
        )}

        {hasCamera && !simplePhone && (
          <div style={{ position:'absolute', top:12, right:12, display:'flex', flexDirection:'column', gap:5, alignItems:'flex-end', zIndex:200, pointerEvents:'none' }}>
            <StatusChip label={`Hands: ${handStatus}`} color={handStatus==='ready'?'#34d399':handStatus==='loading'?'#fbbf24':'#94a3b8'} />
            {bgMode !== 'none' && <StatusChip label={`Seg: ${segStatus}`} color={segStatus==='ready'?'#34d399':segStatus==='loading'?'#fbbf24':'#94a3b8'} />}
            {faceStatus !== 'idle' && <StatusChip label={`Face: ${faceStatus}`} color={faceStatus==='ready'?'#f9a8d4':faceStatus==='loading'?'#fbbf24':'#94a3b8'} />}
          </div>
        )}

        {snapFlash && (
          <div style={{ position:'absolute', inset:0, background:'white', zIndex:400, animation:'snapFlashAnim 0.32s ease-out forwards', pointerEvents:'none' }} />
        )}

        {simplePhone && hasCamera && (
          <>
            <div style={{ position:'absolute', top:10, left:10, right:10, zIndex:180, display:'flex', justifyContent:'space-between', alignItems:'center', pointerEvents:'none' }}>
              <div style={{ display:'flex', gap:6, pointerEvents:'auto' }}>
                <button onClick={flipCamera} style={{ width:38, height:38, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.35)', background:'rgba(0,0,0,0.34)', color:'white', display:'grid', placeItems:'center', backdropFilter:'blur(10px)' }}><SwitchCamera size={17} /></button>
                <button onClick={() => setMirrorCam(v => !v)} style={{ width:38, height:38, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.35)', background: mirrorCam ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.34)', color:'white', display:'grid', placeItems:'center', backdropFilter:'blur(10px)' }}><FlipHorizontal size={16} /></button>
              </div>
              <div style={{ pointerEvents:'auto', display:'flex', gap:5, background:'rgba(0,0,0,0.28)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:999, padding:4, backdropFilter:'blur(12px)' }}>
                {ASPECT_RATIOS.filter(r => ['9:16','4:5','1:1'].includes(r.id)).map(r => (
                  <button key={r.id} onClick={() => setAspectRatio(r.id)} style={{ border:0, borderRadius:999, padding:'6px 9px', color:'white', background: aspectRatio === r.id ? 'rgba(255,255,255,0.28)' : 'transparent', fontFamily:'Sniglet, var(--font-hand)', fontSize:12 }}>{r.label}</button>
                ))}
              </div>
            </div>
            <div style={{ position:'absolute', right:9, top:64, bottom:96, zIndex:180, display:'flex', flexDirection:'column', justifyContent:'center', gap:7, pointerEvents:'auto' }}>
              {CAMERA_FILTERS.map(f => (
                <button key={f.id} onClick={() => setCameraFilter(f.id)} style={{ writingMode:'vertical-rl', transform:'rotate(180deg)', border:'1px solid rgba(255,255,255,0.28)', borderRadius:999, padding:'9px 5px', minHeight:54, color:'white', background: cameraFilter === f.id ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.34)', backdropFilter:'blur(10px)', fontFamily:'Sniglet, var(--font-hand)', fontSize:11 }}>
                  {f.label}
                </button>
              ))}
            </div>
          </>
        )}

        {trackingPaused && hasCamera && !simplePhone && (
          <div onClick={() => setTrackingPaused(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.28)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:150, cursor:'pointer' }}>
            <div style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', border:'1.5px solid rgba(251,191,36,0.4)', borderRadius:20, padding:'10px 22px', color:'#fde68a', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:8 }}>
              <Pause size={16} /> Paused — tap to resume
            </div>
          </div>
        )}

        {faceAnchorPick && !simplePhone && (
          <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', background:'rgba(249,168,212,0.15)', backdropFilter:'blur(8px)', border:'1.5px solid rgba(249,168,212,0.5)', borderRadius:20, padding:'6px 18px', color:'#f9a8d4', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.82rem', zIndex:200, pointerEvents:'none', whiteSpace:'nowrap' }}>
            📌 Now pick a sticker to anchor to {faceAnchorPick.name}
          </div>
        )}

        {panel === 'stickers' && (
          <StickerPicker
            onSelect={addSticker}
            onClose={() => { setPanel(null); setFaceAnchorPick(null); }}
            hint={faceAnchorPick ? `Picking sticker for face anchor: ${faceAnchorPick.name}` : simplePhone ? 'Choose a sticker for your photo' : 'Pick a sticker — or pinch & hold in empty space to spawn'}
            mobile={simplePhone}
          />
        )}
        {panel === 'bg' && <BgPicker current={bgMode} onChange={setBgMode} onClose={() => setPanel(null)} />}
        {panel === 'face' && !simplePhone && (
          <FaceAnchorPicker
            onSelect={startFaceAnchorPick}
            onClose={() => setPanel(null)}
          />
        )}
        {panel === 'controls' && !simplePhone && (
          <ControlPanel
            hasCamera={hasCamera}
            bgLabel={bgLabel}
            onBg={() => setPanel('bg')}
            faceStatus={faceStatus}
            onFace={faceStatus === 'idle' ? loadFace : () => setPanel('face')}
            showFaceMesh={showFaceMesh}
            onToggleMesh={() => setShowFaceMesh(v => !v)}
            trackingPaused={trackingPaused}
            onTogglePause={() => setTrackingPaused(v => !v)}
            hideCam={hideCam}
            onToggleHideCam={() => setHideCam(v => !v)}
            showSkeleton={showSkeleton}
            onToggleSkeleton={() => setShowSkeleton(v => !v)}
            stickerCount={stickerCount}
            onGather={gatherStickers}
            onSave={savePhoto}
            onClose={() => setPanel(null)}
          />
        )}
        </div>
      </div>

      {simplePhone ? (
        <div style={{ background:'#000', borderTop:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
          {selectedLive && (
            <div data-snap-ctrl="1" style={{ display:'grid', gridTemplateColumns:'repeat(6, minmax(0,1fr))', gap:8, padding:'8px 14px 0' }}>
              <button onClick={deleteSelectedLive} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Delete"><Trash2 size={17} /></button>
              <button onClick={() => adjustSelectedLive(s => ({ ...s, zIndex: (s.zIndex ?? 1) - 1 }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Send backward">-</button>
              <button onClick={() => adjustSelectedLive(s => ({ ...s, zIndex: (s.zIndex ?? 1) + 1 }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Bring forward">+</button>
              <button onClick={() => adjustSelectedLive(s => ({ ...s, rotation: (s.rotation ?? 0) + 15 }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Rotate"><SlidersHorizontal size={17} /></button>
              <button onClick={() => adjustSelectedLive(s => ({ ...s, w: Math.max(36, (s.w || 120) * 0.86), h: Math.max(36, (s.h || 120) * 0.86) }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Smaller">S</button>
              <button onClick={() => adjustSelectedLive(s => ({ ...s, w: Math.min(stageSize.width, (s.w || 120) * 1.16), h: Math.min(stageSize.height, (s.h || 120) * 1.16) }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Bigger">L</button>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'56px 1fr 56px', alignItems:'center', gap:12, padding:'8px 18px 10px' }}>
            <button onClick={() => setPanel(p => p==='stickers'?null:'stickers')} style={{ width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }}><Sticker size={21} /></button>
            {hasCamera ? (
              <button onClick={takeSnap} style={{ justifySelf:'center', width:74, height:74, borderRadius:'50%', border:'5px solid rgba(255,255,255,0.92)', background:'transparent', color:'white', display:'grid', placeItems:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.9)' }}><Circle size={34} fill="currentColor" /></button>
            ) : (
              <button onClick={startAll} style={{ justifySelf:'center', width:74, height:74, borderRadius:'50%', border:'5px solid rgba(255,255,255,0.92)', background:'transparent', color:'white', display:'grid', placeItems:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.35)' }}><Camera size={30} /></button>
            )}
            {hasCamera ? (
              <button onClick={() => setCameraFilter((current) => {
                const idx = CAMERA_FILTERS.findIndex(f => f.id === current);
                return CAMERA_FILTERS[(idx + 1) % CAMERA_FILTERS.length].id;
              })} style={{ width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center', fontFamily:'Sniglet, var(--font-hand)', fontSize:11, fontWeight:700 }}>
                FX
              </button>
            ) : (
              <button onClick={stopCamera} style={{ width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }}><CameraOff size={20} /></button>
            )}
          </div>
        </div>
      ) : (
      <div style={toolbar}>
        {!hasCamera
          ? <ToolBtn color="#4d9cff" onClick={startAll}><Camera size={16} /> Start</ToolBtn>
          : <ToolBtn color="#f87171" onClick={stopCamera}><CameraOff size={16} /> Stop</ToolBtn>
        }
        {hasCamera && (
          <ToolBtn color="#22d3ee" onClick={flipCamera}>
            <FlipHorizontal size={16} /> {isFront ? 'Rear' : 'Selfie'}
          </ToolBtn>
        )}
        {hasCamera && (
          <ToolBtn color={mirrorCam ? '#38bdf8' : '#64748b'} onClick={() => setMirrorCam(v => !v)}>
            <FlipHorizontal size={16} /> {mirrorCam ? 'Mirrored' : 'Unmirrored'}
          </ToolBtn>
        )}
        {!simplePhone && ASPECT_RATIOS.map(r => (
          <ToolBtn key={r.id} color={aspectRatio === r.id ? '#6ee7b7' : '#64748b'} onClick={() => setAspectRatio(r.id)}>
            {r.label}
          </ToolBtn>
        ))}
        {hasCamera && (
          <ToolBtn color="#f472b6" onClick={takeSnap}>
            <Aperture size={17} /> Snap!
          </ToolBtn>
        )}
        <ToolBtn color="#8b5cf6" onClick={() => setPanel(p => p==='stickers'?null:'stickers')}>
          <Sticker size={16} /> Stickers{stickerCount > 0 ? ` (${stickerCount})` : ''}
        </ToolBtn>
        {stickerCount > 0 && !simplePhone && (
          <>
            <ToolBtn color="#a78bfa" onClick={gatherStickers}>
              <Magnet size={16} /> Gather
            </ToolBtn>
            <ToolBtn color="#f97316" onClick={clearStickers}>
              <Trash2 size={16} /> Clear
            </ToolBtn>
          </>
        )}
        {simplePhone && (
          <ToolBtn color="#fbbf24" onClick={savePhoto}><Aperture size={16} /> Save</ToolBtn>
        )}
        {!simplePhone && (
          <ToolBtn color="#c4b5fd" onClick={() => setPanel(p => p==='controls'?null:'controls')}>
            <SlidersHorizontal size={16} /> More
          </ToolBtn>
        )}
      </div>
      )}

      {hasCamera && handStatus === 'ready' && !trackingPaused && !simplePhone && (
        <div style={gestureHint}>
          🖱️ Drag sticker &nbsp;·&nbsp; ✊ Pinch grab &nbsp;·&nbsp; ✌️ Peace→Snap &nbsp;·&nbsp; ✊ Fist→Delete &nbsp;·&nbsp; 🖐 Palm→Repulse &nbsp;·&nbsp; 👍 Clone &nbsp;·&nbsp; 🤘 Spin &nbsp;·&nbsp; 🤙 Bounce all
        </div>
      )}

      <style>{`
        @keyframes snapFlashAnim { from { opacity:1; } to { opacity:0; } }
      `}</style>
    </div>
  );
}

