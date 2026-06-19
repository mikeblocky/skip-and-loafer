import stickersGalleryPaths from '../gallery/data/stickersGallery';
import { CHARACTER_DATA } from '../../data/characters';

// ── MediaPipe CDN ─────────────────────────────────────────────────────────────
const WASM_CDN   = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const SEG_MODEL  = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// ── Pinch hysteresis ──────────────────────────────────────────────────────────
const PINCH_ON  = 0.050;
const PINCH_OFF = 0.085;

// ── Physics constants ─────────────────────────────────────────────────────────
const DRAG_LERP        = 0.30;
const INERTIA_FRICTION = 0.85;
const INERTIA_MIN      = 0.4;
const PHYS_DAMPEN      = 0.92;
const PHYS_ANG_DAMPEN  = 0.88;
const DWELL_FRAMES     = 50;
const DWELL_MOVE_MAX   = 32;
const TWO_HAND_DEBOUNCE = 10;
const REPULSION_RADIUS  = 220;
const REPULSION_FORCE   = 18;
const MAX_TRACKED_HANDS  = 4;

// ── Seg canvas size ───────────────────────────────────────────────────────────
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

// ── Face anchor landmark indices ──────────────────────────────────────────────
const FACE_ANCHORS = {
  hat:     10,   // forehead
  glasses: 168,  // nose bridge
  nose:    4,    // nose tip
  lCheek:  234,  // left cheek
  rCheek:  454,  // right cheek
  chin:    152,  // chin
};

// ── Background modes ──────────────────────────────────────────────────────────
const BG_MODES = [
  { id: 'none',       label: 'Normal',          needsSeg: false },
  { id: 'blur',       label: 'Blur background', needsSeg: true  },
  { id: 'black',      label: 'Black',           needsSeg: true  },
  { id: 'white',      label: 'White',           needsSeg: true  },
  { id: 'gradient',   label: 'Gradient',        needsSeg: true  },
  { id: 'notebook',   label: 'Notebook',        needsSeg: true  },
  { id: 'hidePerson', label: 'Hide person',     needsSeg: true  },
  { id: 'hideFace',   label: 'Hide face',       needsSeg: true  },
];

// ── Sticker sources ───────────────────────────────────────────────────────────
const CHARACTER_SRCS    = CHARACTER_DATA.map(c => c.src);
const ALL_STICKER_SRCS  = [...CHARACTER_SRCS, ...stickersGalleryPaths];

// ── Snap sticker base size (CSS px at scale=1) ────────────────────────────────
const BASE_SNAP_STICKER = 120;

// ── Gesture vocab & hold thresholds ──────────────────────────────────────────
const GESTURE_HOLD = { fist: 25, open: 20, point: 0, peace: 22, thumbup: 20, rock: 18, shaka: 18, other: 0, idle: 0 };
const GESTURE_LABELS = { fist: 'Fist', open: 'Open hand', point: 'Point', peace: 'Peace', thumbup: 'Thumbs up', rock: 'Rock', shaka: 'Shaka', other: '', idle: '' };

export {
  ALL_STICKER_SRCS,
  BASE_SNAP_STICKER,
  BG_MODES,
  CONNECTIONS,
  DRAG_LERP,
  DWELL_FRAMES,
  DWELL_MOVE_MAX,
  FACE_ANCHORS,
  FACE_MODEL,
  GESTURE_HOLD,
  GESTURE_LABELS,
  HAND_MODEL,
  INERTIA_FRICTION,
  INERTIA_MIN,
  MAX_TRACKED_HANDS,
  PHYS_ANG_DAMPEN,
  PHYS_DAMPEN,
  PINCH_OFF,
  PINCH_ON,
  REPULSION_FORCE,
  REPULSION_RADIUS,
  SEG_H,
  SEG_MODEL,
  SEG_W,
  TWO_HAND_DEBOUNCE,
  WASM_CDN,
};
