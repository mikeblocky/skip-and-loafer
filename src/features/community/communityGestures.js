export const MIN_GESTURE_SCALE = 0.9;
export const MAX_GESTURE_SCALE = 2.4;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getTouchDistance(touchA, touchB) {
  return Math.hypot(touchB.clientX - touchA.clientX, touchB.clientY - touchA.clientY);
}

export function getTouchAngle(touchA, touchB) {
  return Math.atan2(touchB.clientY - touchA.clientY, touchB.clientX - touchA.clientX) * (180 / Math.PI);
}

export function getWheelGestureAngle(deltaY, deltaX = 0) {
  return Math.max(-18, Math.min(18, (Math.atan2(deltaY, deltaX || 0.001) * 180) / Math.PI * 0.08));
}

export function createCommunityStackLayout(entry, index, {
  offsets,
  fields,
  hashMultiplier = 31,
  spreadModulo = 3,
  spreadCenter = 1,
  spreadXStep = 2,
  rotationSpreadStep = 0.35,
}) {
  const seedSource = fields.map((field) => entry?.[field] || '').join(':');
  let seed = 0;

  for (let fieldIndex = 0; fieldIndex < seedSource.length; fieldIndex += 1) {
    seed = (seed * hashMultiplier + seedSource.charCodeAt(fieldIndex)) >>> 0;
  }

  const variant = (seed + index) % offsets.length;
  const spread = (seed % spreadModulo) - spreadCenter;

  return {
    offsetX: offsets[variant].x + spread * spreadXStep,
    offsetY: offsets[variant].y,
    rotate: offsets[variant].rotate + spread * rotationSpreadStep,
    spread,
  };
}
