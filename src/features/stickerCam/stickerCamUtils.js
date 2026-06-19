import { BASE_SNAP_STICKER } from './stickerCamConstants';

// ── Finger state & gesture classification ─────────────────────────────────────
function getFingerStates(lm) {
  // Thumb: compare tip(4) to IP joint(3) horizontally relative to hand direction
  const thumbOpen = Math.hypot(lm[4].x - lm[2].x, lm[4].y - lm[2].y) >
                    Math.hypot(lm[3].x - lm[2].x, lm[3].y - lm[2].y) * 1.1;
  const fingers = [thumbOpen];
  for (let f = 1; f <= 4; f++) {
    const tip = [8, 12, 16, 20][f - 1];
    const pip = [6, 10, 14, 18][f - 1];
    const tipDist = Math.hypot(lm[tip].x - lm[0].x, lm[tip].y - lm[0].y);
    const pipDist = Math.hypot(lm[pip].x - lm[0].x, lm[pip].y - lm[0].y);
    fingers.push(tipDist > pipDist * 1.1);
  }
  return fingers; // [thumb, index, middle, ring, pinky]
}

function classifyGesture(lm) {
  const [thumb, index, middle, ring, pinky] = getFingerStates(lm);
  if (!index && !middle && !ring && !pinky && !thumb)  return 'fist';
  if (index && middle && ring && pinky && thumb)        return 'open';
  if (index && middle && !ring && !pinky && !thumb)     return 'peace';
  if (index && !middle && !ring && !pinky && !thumb)    return 'point';
  if (!index && !middle && !ring && !pinky && thumb)    return 'thumbup';
  if (index && !middle && !ring && pinky && !thumb)     return 'rock';
  if (thumb && !index && !middle && !ring && pinky)     return 'shaka';
  return 'other';
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function lmPx(lm, cw, ch, vw, vh, mirror = false, zoom = 1) {
  const x = mirror ? 1 - lm.x : lm.x;
  const safeZoom = Math.max(1, zoom || 1);
  const scale = Math.max(cw / vw, ch / vh) * safeZoom;
  const sw = cw / scale;
  const sh = ch / scale;
  const sx = Math.max(0, (vw - sw) / 2);
  const sy = Math.max(0, (vh - sh) / 2);
  return { x: (x * vw - sx) * scale, y: (lm.y * vh - sy) * scale };
}

function drawVideoFrame(ctx, video, cw, ch, mirror = false, zoom = 1) {
  const vw = video.videoWidth || cw;
  const vh = video.videoHeight || ch;
  const scale = Math.max(cw / vw, ch / vh) * Math.max(1, zoom || 1);
  const sw = cw / scale;
  const sh = ch / scale;
  const sx = Math.max(0, (vw - sw) / 2);
  const sy = Math.max(0, (vh - sh) / 2);
  ctx.save();
  if (mirror) {
    ctx.translate(cw, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
  ctx.restore();
}

function hitTest(live, px, py) {
  let bestId = null, bestD = Infinity;
  for (const s of live) {
    const d = Math.hypot(px - s.x, py - s.y);
    if (d < Math.max(s.w, s.h) * 0.58 && d < bestD) { bestD = d; bestId = s.id; }
  }
  return bestId;
}

function drawNotebook(ctx, cw, ch) {
  ctx.fillStyle = '#fafaf2'; ctx.fillRect(0, 0, cw, ch);
  ctx.strokeStyle = 'rgba(255,150,150,0.75)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(72, 0); ctx.lineTo(72, ch); ctx.stroke();
  ctx.strokeStyle = 'rgba(170,205,240,0.85)'; ctx.lineWidth = 1;
  for (let y = 30; y < ch; y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
  }
}

function applyBackground(dctx, video, catMask, maskW, maskH, cw, ch, mode, fgCv, bgCv, mirror = false, zoom = 1) {
  const fgCtx = fgCv.getContext('2d');
  const bgCtx = bgCv.getContext('2d');

  if (mode === 'hidePerson') {
    dctx.clearRect(0, 0, cw, ch);
    bgCtx.filter = 'blur(22px)'; drawVideoFrame(bgCtx, video, cw, ch, mirror, zoom); bgCtx.filter = 'none';
    dctx.drawImage(bgCv, 0, 0); return;
  }

  const maskImg = new ImageData(maskW, maskH);
  const md = maskImg.data;
  for (let i = 0; i < catMask.length; i++) {
    const cat = catMask[i];
    const isPerson = cat > 0, isFace = cat === 3;
    const alpha = (mode === 'hideFace' ? (isPerson && !isFace) : isPerson) ? 255 : 0;
    md[i * 4] = md[i * 4 + 1] = md[i * 4 + 2] = 255;
    md[i * 4 + 3] = alpha;
  }

  fgCtx.clearRect(0, 0, cw, ch); drawVideoFrame(fgCtx, video, cw, ch, mirror, zoom);
  const maskCv = new OffscreenCanvas(maskW, maskH);
  maskCv.getContext('2d').putImageData(maskImg, 0, 0);
  fgCtx.globalCompositeOperation = 'destination-in';
  if (mirror) {
    fgCtx.save(); fgCtx.translate(cw, 0); fgCtx.scale(-1, 1); fgCtx.drawImage(maskCv, 0, 0, cw, ch); fgCtx.restore();
  } else {
    fgCtx.drawImage(maskCv, 0, 0, cw, ch);
  }
  fgCtx.globalCompositeOperation = 'source-over';

  bgCtx.clearRect(0, 0, cw, ch);
  if (mode === 'blur') {
    bgCtx.filter = 'blur(18px)'; drawVideoFrame(bgCtx, video, cw, ch, mirror, zoom); bgCtx.filter = 'none';
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
    drawVideoFrame(bgCtx, video, cw, ch, mirror, zoom);
  }

  dctx.clearRect(0, 0, cw, ch); dctx.drawImage(bgCv, 0, 0); dctx.drawImage(fgCv, 0, 0);

  if (mode === 'hideFace') {
    let minX = maskW, minY = maskH, maxX = 0, maxY = 0, found = false;
    for (let y = 0; y < maskH; y++) for (let x = 0; x < maskW; x++) {
      if (catMask[y * maskW + x] === 3) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        found = true;
      }
    }
    if (found) {
      const sx = cw / maskW, sy = ch / maskH, pad = 18;
      const rawFx = mirror ? (maskW - maxX) * sx : minX * sx;
      const fx = Math.max(0, rawFx - pad), fy = Math.max(0, minY * sy - pad);
      const fw = Math.min(cw - fx, (maxX - minX) * sx + pad * 2);
      const fh = Math.min(ch - fy, (maxY - minY) * sy + pad * 2);
      const TILE = 15;
      const tiny = new OffscreenCanvas(Math.max(1, Math.ceil(fw / TILE)), Math.max(1, Math.ceil(fh / TILE)));
      const tinyCtx = tiny.getContext('2d');
      if (mirror) {
        tinyCtx.translate(tiny.width, 0);
        tinyCtx.scale(-1, 1);
        tinyCtx.drawImage(video, cw - fx - fw, fy, fw, fh, 0, 0, tiny.width, tiny.height);
      } else {
        tinyCtx.drawImage(video, fx, fy, fw, fh, 0, 0, tiny.width, tiny.height);
      }
      dctx.imageSmoothingEnabled = false;
      dctx.drawImage(tiny, 0, 0, tiny.width, tiny.height, fx, fy, fw, fh);
      dctx.imageSmoothingEnabled = true;
    }
  }
}

// ── Snap helpers ──────────────────────────────────────────────────────────────
function hitTestSnap(stickers, x, y) {
  const sorted = [...stickers].sort((a, b) => b.zIndex - a.zIndex);
  for (const s of sorted) {
    const w = (s.w ?? BASE_SNAP_STICKER) * (s.scale ?? 1);
    const h = (s.h ?? BASE_SNAP_STICKER) * (s.scale ?? 1);
    if (Math.hypot(x - s.x, y - s.y) < Math.max(w, h) * 0.6) return s;
  }
  return null;
}

function getRelPos(e, el) {
  const r = el.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function downloadCanvas(canvas, filename = 'sticker-snap.png') {
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 6000);
  }, 'image/png');
}

export {
  applyBackground,
  classifyGesture,
  downloadCanvas,
  drawVideoFrame,
  drawNotebook,
  getRelPos,
  hitTest,
  hitTestSnap,
  lmPx,
};
