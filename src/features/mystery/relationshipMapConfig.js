import {
  Activity, Spline, Minus, Navigation, Waves,
  Circle, Square, Image as ImageIcon,
} from 'lucide-react';

export const PALETTE = [
  { name: 'Love', color: '#f472b6' },
  { name: 'Friend', color: '#34d399' },
  { name: 'Rival', color: '#fb923c' },
  { name: 'Mystery', color: '#a78bfa' },
  { name: 'Enemy', color: '#ef4444' },
  { name: 'Family', color: '#f59e0b' },
  { name: 'Neutral', color: '#94a3b8' },
  { name: 'Colleague', color: '#60a5fa' },
  { name: 'Dark', color: '#334155' },
  { name: 'Light', color: '#f1f5f9' },
];

export const GROUP_COLORS = [
  { name: 'Yellow', bg: 'rgba(253, 230, 138, 0.3)', border: '#fcd34d' },
  { name: 'Pink', bg: 'rgba(251, 207, 232, 0.3)', border: '#f9a8d4' },
  { name: 'Blue', bg: 'rgba(147, 197, 253, 0.3)', border: '#93c5fd' },
  { name: 'Green', bg: 'rgba(134, 239, 172, 0.3)', border: '#86efac' },
  { name: 'Purple', bg: 'rgba(196, 181, 253, 0.3)', border: '#c4b5fd' },
  { name: 'Orange', bg: 'rgba(253, 186, 116, 0.3)', border: '#fb923c' },
  { name: 'Teal', bg: 'rgba(94, 234, 212, 0.3)', border: '#2dd4bf' },
  { name: 'Rose', bg: 'rgba(251, 113, 133, 0.3)', border: '#fb7185' },
  { name: 'Indigo', bg: 'rgba(165, 180, 252, 0.3)', border: '#a5b4fc' },
  { name: 'Amber', bg: 'rgba(252, 211, 77, 0.3)', border: '#fbbf24' },
];

export const LINE_STYLES = [
  { id: 'solid', label: 'Solid', dash: '0' },
  { id: 'dashed', label: 'Dashed', dash: '8,8' },
  { id: 'dotted', label: 'Dotted', dash: '2,6' },
];

export const LINE_SHAPES = [
  { id: 'straight', label: 'Straight', icon: Minus },
  { id: 'curve', label: 'Curve', icon: Spline },
  { id: 'step', label: 'Step', icon: Navigation },
  { id: 'zigzag', label: 'Zigzag', icon: Activity },
  { id: 'wave', label: 'Wave', icon: Waves },
];

export const ARROW_MODES = [
  { id: 'none', label: 'None' },
  { id: 'forward', label: 'Forward' },
  { id: 'both', label: 'Both' },
];

export const LINE_THICKNESS = [
  { id: 'thin', label: 'Thin', width: 2 },
  { id: 'regular', label: 'Regular', width: 4 },
  { id: 'bold', label: 'Bold', width: 7 },
];

export const NODE_SHAPES = [
  { id: 'polaroid', label: 'Polaroid', icon: Square },
  { id: 'circle', label: 'Badge', icon: Circle },
  { id: 'clear', label: 'Clear', icon: ImageIcon },
];

export const NODE_SIZES = [
  { id: 'small', label: 'Small', px: 64 },
  { id: 'regular', label: 'Regular', px: 88 },
  { id: 'large', label: 'Large', px: 120 },
];

export const HUB_SIZES = [
  { id: 'regular', label: 'Dot', px: 16 },
  { id: 'large', label: 'Nexus', px: 32 },
];

export const NODE_ANIMATIONS = [
  { id: 'none', label: 'None' },
  { id: 'float', label: 'Floating' },
  { id: 'pulse', label: 'Pulsing' },
];

export const BACKGROUNDS = [
  { id: 'dots', label: 'Dot grid', bg: '#ffffff', css: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNjYmQ1ZTEiLz48L3N2Zz4=")', size: '30px 30px' },
  { id: 'grid', label: 'Blueprint', bg: '#f8fafc', css: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsIDE2MywgMTg0LCAwLjE1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+")', size: '40px 40px' },
  { id: 'paper', label: 'Lined paper', bg: '#fffefc', css: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjMyIj48bGluZSB4MT0iMCIgeTE9IjMxIiB4Mj0iMTAwJSIgeTI9IjMxIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==")', size: '100% 32px' },
  { id: 'cork', label: 'Corkboard', bg: '#fef3c7', css: 'none', size: 'auto' },
];

// --- Geometry Helpers ---

export const getNodeRadius = (node, isMobile = false) => {
  if (!node) return 0;
  if (node.customRadius) return isMobile ? node.customRadius * 0.8 : node.customRadius;
  if (node.type === 'hub') {
    const base = node.size === 'large' ? 16 : 8;
    return isMobile ? base * 0.8 : base;
  }
  const sizeObj = NODE_SIZES.find(s => s.id === node.size) || NODE_SIZES[1];
  const basePx = sizeObj.px;
  return (isMobile ? basePx * 0.75 : basePx) / 2;
};

export const getAdjustedEndpoints = (x1, y1, x2, y2, r1, r2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < r1 + r2) return { ax: x1, ay: y1, bx: x2, by: y2 };
  return {
    ax: x1 + (dx * r1) / dist,
    ay: y1 + (dy * r1) / dist,
    bx: x2 - (dx * r2) / dist,
    by: y2 - (dy * r2) / dist,
  };
};

export const getMidpoint = (x1, y1, x2, y2, shape, offset) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  if (shape === 'curve') {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x: mx, y: my };
    const nx = dy / dist;
    const ny = -dx / dist;
    const curveOffset = offset !== undefined ? offset : Math.min(dist * 0.3, 120);
    return { x: mx + nx * curveOffset * 0.5, y: my + ny * curveOffset * 0.5 };
  }
  return { x: mx, y: my };
};

export const generatePath = (x1, y1, x2, y2, shape, offset = 0) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;

  const nx = dy / dist;
  const ny = -dx / dist;

  const getBentPoint = (t) => {
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const bendAmount = 4 * t * (1 - t) * offset;
    return { x: px + nx * bendAmount, y: py + ny * bendAmount };
  };

  if (shape === 'curve') {
    const cx = (x1 + x2) / 2 + nx * (offset || Math.min(dist * 0.3, 120));
    const cy = (y1 + y2) / 2 + ny * (offset || Math.min(dist * 0.3, 120));
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  }
  if (shape === 'straight') {
    if (!offset || offset === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const cx = (x1 + x2) / 2 + nx * offset * 2;
    const cy = (y1 + y2) / 2 + ny * offset * 2;
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  }
  if (shape === 'step') {
    const mx2 = (x1 + x2) / 2;
    return `M ${x1} ${y1} L ${mx2 + nx * offset} ${y1 + ny * offset} L ${mx2 + nx * offset} ${y2 + ny * offset} L ${x2} ${y2}`;
  }
  if (shape === 'zigzag') {
    if (dist < 20) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const zigs = Math.floor(dist / 18);
    const amplitude = 12;
    let path = `M ${x1} ${y1}`;
    for (let i = 1; i < zigs; i++) {
      const t = i / zigs;
      const bp = getBentPoint(t);
      const sign = i % 2 === 0 ? 1 : -1;
      path += ` L ${bp.x + nx * amplitude * sign} ${bp.y + ny * amplitude * sign}`;
    }
    path += ` L ${x2} ${y2}`;
    return path;
  }
  if (shape === 'wave') {
    if (dist < 30) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const waves = Math.floor(dist / 40);
    const step = 1 / waves;
    const waveAmp = 15;
    let path = `M ${x1} ${y1}`;
    for (let i = 0; i < waves; i++) {
      const t0 = i * step;
      const t1 = (i + 1) * step;
      const tm = (t0 + t1) / 2;
      const p1 = getBentPoint(t1);
      const pm = getBentPoint(tm);
      const sign = i % 2 === 0 ? 1 : -1;
      path += ` Q ${pm.x + nx * waveAmp * sign} ${pm.y + ny * waveAmp * sign} ${p1.x} ${p1.y}`;
    }
    return path;
  }
  return `M ${x1} ${y1} L ${x2} ${y2}`;
};
