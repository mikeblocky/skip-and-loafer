import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, Download, Plus, Trash2, Settings2, ArrowRight, Type,
  X, Activity, Spline, Minus, Navigation, Circle, Square,
  Image as ImageIcon, Zap, Layers, Edit3, Grid, Map as MapIcon, 
  StickyNote, Waves, CircleDashed, Share2, UserPlus, Palette,
  Video, Maximize, Minimize, ChevronLeft, ArrowLeft, MoveHorizontal
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { triggerHaptic } from '../../utils/haptics';
import GIF from 'gif.js';
import { createPortal } from 'react-dom';

// --- Constants & Config ---

const PALETTE = [
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

const GROUP_COLORS = [
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

const LINE_STYLES = [
  { id: 'solid', label: 'Solid', dash: '0' },
  { id: 'dashed', label: 'Dashed', dash: '8,8' },
  { id: 'dotted', label: 'Dotted', dash: '2,6' },
];

const LINE_SHAPES = [
  { id: 'straight', label: 'Straight', icon: Minus },
  { id: 'curve', label: 'Curve', icon: Spline },
  { id: 'step', label: 'Step', icon: Navigation },
  { id: 'zigzag', label: 'Zigzag', icon: Activity },
  { id: 'wave', label: 'Wave', icon: Waves },
];

const ARROW_MODES = [
  { id: 'none', label: 'None' },
  { id: 'forward', label: 'Forward' },
  { id: 'both', label: 'Both' },
];

const LINE_THICKNESS = [
  { id: 'thin', label: 'Thin', width: 2 },
  { id: 'regular', label: 'Regular', width: 4 },
  { id: 'bold', label: 'Bold', width: 7 },
];

const NODE_SHAPES = [
  { id: 'polaroid', label: 'Polaroid', icon: Square },
  { id: 'circle', label: 'Badge', icon: Circle },
  { id: 'clear', label: 'Clear', icon: ImageIcon },
];

const NODE_SIZES = [
  { id: 'small', label: 'Small', px: 64 },
  { id: 'regular', label: 'Regular', px: 88 },
  { id: 'large', label: 'Large', px: 120 },
];

const HUB_SIZES = [
  { id: 'regular', label: 'Dot', px: 16 },
  { id: 'large', label: 'Nexus', px: 32 },
];

const NODE_ANIMATIONS = [
  { id: 'none', label: 'None' },
  { id: 'float', label: 'Floating' },
  { id: 'pulse', label: 'Pulsing' },
];

const BACKGROUNDS = [
  { id: 'dots', label: 'Dot grid', bg: '#ffffff', css: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNjYmQ1ZTEiLz48L3N2Zz4=")', size: '30px 30px' },
  { id: 'grid', label: 'Blueprint', bg: '#f8fafc', css: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsIDE2MywgMTg0LCAwLjE1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+")', size: '40px 40px' },
  { id: 'paper', label: 'Lined paper', bg: '#fffefc', css: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjMyIj48bGluZSB4MT0iMCIgeTE9IjMxIiB4Mj0iMTAwJSIgeTI9IjMxIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==")', size: '100% 32px' },
  { id: 'cork', label: 'Corkboard', bg: '#fef3c7', css: 'none', size: 'auto' },
];

// --- Geometry Helpers ---

const getNodeRadius = (node, isMobile = false) => {
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

const getAdjustedEndpoints = (x1, y1, x2, y2, r1, r2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < r1 + r2) return { ax: x1, ay: y1, bx: x2, by: y2 };

  return {
    ax: x1 + (dx * r1) / dist,
    ay: y1 + (dy * r1) / dist,
    bx: x2 - (dx * r2) / dist,
    by: y2 - (dy * r2) / dist
  };
};

const getMidpoint = (x1, y1, x2, y2, shape, offset) => {
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

const generatePath = (x1, y1, x2, y2, shape, offset = 0) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;

  const nx = dy / dist;
  const ny = -dx / dist;

  // Helper to apply bend to a point at progress t [0...1]
  const getBentPoint = (t) => {
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    // Quadratic bend formula: 4 * t * (1-t) * offset
    const bendAmount = 4 * t * (1 - t) * offset;
    return {
      x: px + nx * bendAmount,
      y: py + ny * bendAmount
    };
  };

  if (shape === 'curve') {
    const cx = (x1 + x2) / 2 + nx * (offset || Math.min(dist * 0.3, 120));
    const cy = (y1 + y2) / 2 + ny * (offset || Math.min(dist * 0.3, 120));
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  }

  if (shape === 'straight') {
    if (!offset || offset === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const mid = getBentPoint(0.5);
    const cx = (x1 + x2) / 2 + nx * offset * 2; // Q control point needs to be double for mid to match offset
    const cy = (y1 + y2) / 2 + ny * offset * 2;
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  }
  
  if (shape === 'step') {
    const mx = (x1 + x2) / 2;
    // Step doesn't bend well with offset, but we can shift it
    return `M ${x1} ${y1} L ${mx + nx * offset} ${y1 + ny * offset} L ${mx + nx * offset} ${y2 + ny * offset} L ${x2} ${y2}`;
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
        const pmx = pm.x + nx * waveAmp * sign;
        const pmy = pm.y + ny * waveAmp * sign;
        path += ` Q ${pmx} ${pmy} ${p1.x} ${p1.y}`;
    }
    return path;
  }

  return `M ${x1} ${y1} L ${x2} ${y2}`;
};

// --- Main Component ---

const RelationshipMap = ({ isMobile, portraitData, t, onBack }) => {
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) await containerRef.current.requestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [boardTitle, setBoardTitle] = useState("Relationship map");
  const [titlePos, setTitlePos] = useState({ x: 1500, y: 80 });
  
  // Data State
  const [nodes, setNodes] = useState([]); 
  const [groups, setGroups] = useState([]);
  const [links, setLinks] = useState([]);
  const [memos, setMemos] = useState([]);
  
  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null); 
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMapSettings, setShowMapSettings] = useState(false);
  
  const [bgStyle, setBgStyle] = useState('dots');
  const [customBgColor, setCustomBgColor] = useState('#ffffff');
  const [isPanMode, setIsPanMode] = useState(false);

  // Interactive State
  const [draggingItems, setDraggingItems] = useState([]);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [resizingGroup, setResizingGroup] = useState(null);
  const [resizingNode, setResizingNode] = useState(null);
  const [resizingCurve, setResizingCurve] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sidebarWidth = 280;
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const characterMap = useMemo(() => {
    const map = {};
    portraitData.forEach(p => map[p.name] = p);
    return map;
  }, [portraitData]);

  // Load / Save
  useEffect(() => {
    const saved = localStorage.getItem('skip_loafer_map_v4');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.nodes) {
          // Migration: Yamato -> Yamada
          const migratedNodes = data.nodes.map(n => n.charName === 'Yamato' ? { ...n, charName: 'Yamada' } : n);
          setNodes(migratedNodes);
        }
        if (data.groups) {
          // migrate old size-based groups to width/height
          setGroups(data.groups.map(g => g.width ? g : { ...g, width: 400, height: 400 }));
        }
        if (data.links) setLinks(data.links);
        if (data.memos) setMemos(data.memos);
        if (data.bgStyle) setBgStyle(data.bgStyle);
        if (data.customBgColor) setCustomBgColor(data.customBgColor);
        if (data.boardTitle) setBoardTitle(data.boardTitle);
        if (data.titlePos) setTitlePos(data.titlePos);
      } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && scrollContainerRef.current) {
      setTimeout(() => {
        const c = scrollContainerRef.current;
        c.scrollLeft = titlePos.x - c.clientWidth / 2;
        c.scrollTop = titlePos.y - c.clientHeight / 2;
      }, 50);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('skip_loafer_map_v4', JSON.stringify({ nodes, groups, links, memos, bgStyle, customBgColor, boardTitle, titlePos }));
    }
  }, [nodes, groups, links, memos, bgStyle, customBgColor, boardTitle, titlePos, isLoaded]);

  const selectItem = (id, type) => {
    if (id) setShowAddMenu(false);
    if (type === 'title') {
      setSelectedId(null);
      setSelectedType(null);
      return;
    }
    setSelectedId(id);
    setSelectedType(type);
  };

  const clearSelection = () => {
    setSelectedId(null);
    setSelectedType(null);
    setIsConnecting(false);
    setShowMapSettings(false);
  };

  const getStartCoords = (offsetX = 0, offsetY = 0) => {
    const container = scrollContainerRef.current;
    if (container) {
      return {
        x: container.scrollLeft + container.clientWidth / 2 - offsetX,
        y: container.scrollTop + container.clientHeight / 2 - offsetY
      };
    }
    return { x: 800, y: 800 };
  };

  // --- Actions ---

  const handleAddCharacter = (charName) => {
    triggerHaptic('selection');
    const { x, y } = getStartCoords(44, 44);
    setNodes([...nodes, { id: `node-${Date.now()}`, type: 'character', charName, x, y, shape: 'polaroid', size: 'regular', animation: 'none', borderColor: '#e2e8f0' }]);
    setShowAddMenu(false);
  };

  const handleAddHub = () => {
    triggerHaptic('selection');
    const { x, y } = getStartCoords(8, 8);
    setNodes([...nodes, { id: `hub-${Date.now()}`, type: 'hub', x, y, color: '#94a3b8', size: 'regular', charName: 'Nexus', charNamePos: 'bottom' }]);
  };

  const handleAddGroup = () => {
    triggerHaptic('selection');
    const { x, y } = getStartCoords(200, 200);
    setGroups([...groups, { id: `group-${Date.now()}`, x, y, width: 400, height: 400, title: 'Social Circle', colorIndex: 0, shape: 'circle', titlePosition: 'top' }]);
  };

  const handleAddMemo = () => {
    triggerHaptic('selection');
    const { x, y } = getStartCoords(80, 70);
    setMemos([...memos, { id: `memo-${Date.now()}`, x, y, text: '', color: PALETTE[5].color }]);
  };

  const deleteSelected = () => {
    triggerHaptic('impactLight');
    if (selectedType === 'node') {
      setNodes(nodes.filter(n => n.id !== selectedId));
      setLinks(links.filter(l => l.from !== selectedId && l.to !== selectedId));
    } else if (selectedType === 'link') {
      setLinks(links.filter(l => l.id !== selectedId));
    } else if (selectedType === 'memo') {
      setMemos(memos.filter(m => m.id !== selectedId));
    } else if (selectedType === 'group') {
      setGroups(groups.filter(g => g.id !== selectedId));
    }
    clearSelection();
  };

  const handleReset = () => {
    if (window.confirm("Erase everything and start a new map?")) {
      setNodes([]); setGroups([]); setLinks([]); setMemos([]);
      clearSelection();
      triggerHaptic('notificationSuccess');
    }
  };

  // --- Pointers & Dragging ---

  const handleCanvasPointerDown = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === 'svg') {
      clearSelection();
      setIsPanning(true);
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handleItemPointerDown = (e, id, type) => {
    e.stopPropagation();
    if (isSaving) return;

    if (isConnecting && selectedType === 'node' && type === 'node' && selectedId !== id) {
      triggerHaptic('impactLight');
      const newLink = {
        id: `link-${Date.now()}`, from: selectedId, to: id,
        color: '#f472b6', style: 'solid', shape: 'straight', arrow: 'forward', thickness: 'regular', animated: false, label: '', logic: 'standard'
      };
      setLinks([...links, newLink]);
      setIsConnecting(false);
      clearSelection();
      return;
    }

    if (isPanMode && isMobile) {
      setIsPanning(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    triggerHaptic('selection');
    selectItem(id, type);
    
    // Build array of items to drag. If group, find all contents to move them together!
    let items = [{ id, type }];
    if (type === 'group') {
      const g = groups.find(x => x.id === id);
      if (g) {
        nodes.forEach(n => {
          const r = getNodeRadius(n);
          if (n.x >= g.x && n.x + r*2 <= g.x + g.width && n.y >= g.y && n.y + r*2 <= g.y + g.height) {
            items.push({ id: n.id, type: 'node' });
          }
        });
        memos.forEach(m => {
          if (m.x >= g.x && m.x + 180 <= g.x + g.width && m.y >= g.y && m.y + 120 <= g.y + g.height) {
            items.push({ id: m.id, type: 'memo' });
          }
        });
        groups.forEach(otherG => {
          if (otherG.id !== g.id && otherG.x >= g.x && otherG.x + otherG.width <= g.x + g.width && otherG.y >= g.y && otherG.y + otherG.height <= g.y + g.height) {
            items.push({ id: otherG.id, type: 'group' });
          }
        });
      }
    }
    
    if (type === 'title') items = [{ id: 'title', type: 'title' }];
    if (type === 'sidebar') {
      setIsResizingSidebar(true);
      return;
    }
    setDraggingItems(items);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    e.target.setPointerCapture(e.pointerId);
  };

  const handleResizePointerDown = (e, id) => {
    e.stopPropagation();
    setResizingGroup(id);
    e.target.setPointerCapture(e.pointerId);
  };
  const handleCurvePointerDown = (e, id) => {
    e.stopPropagation();
    triggerHaptic('selection');
    setResizingCurve(id);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft -= e.movementX;
        scrollContainerRef.current.scrollTop -= e.movementY;
      }
      return;
    }

    if (resizingGroup) {
      setGroups(prev => prev.map(g => g.id === resizingGroup ? { ...g, width: Math.max(150, g.width + e.movementX), height: Math.max(150, g.height + e.movementY) } : g));
      return;
    }

    if (resizingNode) {
      setNodes(prev => prev.map(n => n.id === resizingNode ? { ...n, customRadius: Math.max(20, (n.customRadius || getNodeRadius(n)) + (e.movementX + e.movementY) / 2) } : n));
      return;
    }

    if (resizingCurve) {
      const link = links.find(l => l.id === resizingCurve);
      if (!link) return;
      const fromNode = nodes.find(n => n.id === link.from);
      const toNode = nodes.find(n => n.id === link.to);
      if (!fromNode || !toNode) return;
      
      const r1 = getNodeRadius(fromNode, true); const r2 = getNodeRadius(toNode, true);
      const x1 = fromNode.x + r1; const y1 = fromNode.y + r1;
      const x2 = toNode.x + r2; const y2 = toNode.y + r2;
      
      const dx = x2 - x1; const dy = y2 - y1;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist === 0) return;
      
      const nx = dy / dist; const ny = -dx / dist;
      const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left) * (3000 / rect.width);
      const canvasY = (e.clientY - rect.top) * (3000 / rect.height);
      
      const vmx = canvasX - midX; const vmy = canvasY - midY;
      const newOffset = vmx * nx + vmy * ny;
      
      setLinks(prev => prev.map(l => l.id === resizingCurve ? { ...l, curveOffset: newOffset } : l));
      return;
    }

    if (isResizingSidebar) {
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = rect.right - e.clientX;
      // Not actually used with fixed width, but kept for logic
      return;
    }

    if (draggingItems.length > 0) {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      setDragStartPos({ x: e.clientX, y: e.clientY });
      
      if (draggingItems[0].type === 'title') {
        setTitlePos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        return;
      }
      setNodes(prev => prev.map(n => draggingItems.some(i => i.id === n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n));
      setMemos(prev => prev.map(m => draggingItems.some(i => i.id === m.id) ? { ...m, x: m.x + dx, y: m.y + dy } : m));
      setGroups(prev => prev.map(g => draggingItems.some(i => i.id === g.id) ? { ...g, x: g.x + dx, y: g.y + dy } : g));
    }
  };

  const handlePointerUp = (e) => {
    setIsPanning(false);
    setDraggingItems([]);
    setResizingGroup(null);
    setResizingNode(null);
    setResizingCurve(null);
    setIsResizingSidebar(false);
    if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
  };

  // --- Updaters ---
  const updateItemProperty = (collection, setCollection, id, prop, value) => {
    setCollection(collection.map(item => item.id === id ? { ...item, [prop]: value } : item));
  };

  // --- Export (Image & GIF) ---
  const getBounds = () => {
    let minX = 1500, minY = 1500, maxX = 1500, maxY = 1500;
    if (nodes.length > 0 || memos.length > 0 || groups.length > 0) {
      minX = 4000; minY = 4000; maxX = 0; maxY = 0;
      nodes.forEach(n => {
        const radius = getNodeRadius(n);
        minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + radius * 2); maxY = Math.max(maxY, n.y + radius * 2 + 40);
      });
      memos.forEach(m => {
        minX = Math.min(minX, m.x); minY = Math.min(minY, m.y);
        maxX = Math.max(maxX, m.x + 200); maxY = Math.max(maxY, m.y + 160);
      });
      groups.forEach(g => {
        minX = Math.min(minX, g.x); minY = Math.min(minY, g.y);
        maxX = Math.max(maxX, g.x + g.width); maxY = Math.max(maxY, g.y + g.height);
      });
    }
    const pad = 120;
    const cX = Math.max(0, minX - pad);
    const cY = Math.max(0, minY - pad - 80); 
    const cW = Math.min(3000 - cX, (maxX - minX) + pad * 2);
    const cH = Math.min(3000 - cY, (maxY - minY) + pad * 2 + 80);
    return { cX, cY, cW, cH };
  };

  const performHtml2Canvas = async (opts) => {
    const activeBg = bgStyle === 'custom' ? { bg: customBgColor, css: 'none', size: 'auto' } : BACKGROUNDS.find(b => b.id === bgStyle);
    
    const container = scrollContainerRef.current;
    const oldX = container.scrollLeft;
    const oldY = container.scrollTop;
    container.scrollLeft = 0;
    container.scrollTop = 0;

    const result = await html2canvas(canvasRef.current, {
      backgroundColor: activeBg.bg, scale: opts.scale || 2.5, x: opts.cX, y: opts.cY, width: opts.cW, height: opts.cH,
      useCORS: true, allowTaint: true, logging: false, scrollX: 0, scrollY: 0, windowWidth: 3000, windowHeight: 3000,
      onclone: (clonedDoc) => {
        const board = clonedDoc.querySelector('.map-canvas');
        if (board) {
          board.style.border = 'none'; board.style.boxShadow = 'none'; board.style.borderRadius = '0';
          board.style.background = activeBg.bg; board.style.backgroundImage = activeBg.css; board.style.backgroundSize = activeBg.size;
        }
      }
    });

    container.scrollLeft = oldX;
    container.scrollTop = oldY;
    return result;
  };

  const handleSaveImage = async () => {
    if (!canvasRef.current || isSaving) return;
    setIsSaving(true);
    clearSelection();
    triggerHaptic('selection');
    const bounds = getBounds();

    setTimeout(async () => {
      try {
        const canvas = await performHtml2Canvas(bounds);
        const link = document.createElement('a');
        link.download = `${boardTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        triggerHaptic('notificationSuccess');
      } catch (err) { console.error(err); } finally { setIsSaving(false); }
    }, 600);
  };

  const handleSaveGif = async () => {
    if (!canvasRef.current || isSaving) return;
    setIsSaving(true);
    clearSelection();
    triggerHaptic('selection');
    const bounds = getBounds();

    setTimeout(async () => {
      try {
        // Fetch worker to bypass cross-origin restrictions
        const workerRes = await fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js');
        const workerBlob = await workerRes.blob();
        const workerUrl = URL.createObjectURL(workerBlob);

        bounds.scale = 1.0; 
        
        const gif = new GIF({
          workers: 2,
          quality: 10,
          workerScript: workerUrl
        });

        for (let i = 0; i < 12; i++) {
          const progress = i / 12;
          
          document.querySelectorAll('.anim-node').forEach(el => {
            const type = el.getAttribute('data-anim');
            if (type === 'float') {
                el.style.transform = `translateY(${Math.sin(progress * Math.PI * 2) * -10}px)`;
            } else if (type === 'pulse') {
                el.style.transform = `scale(${1 + Math.sin(progress * Math.PI * 2) * 0.08})`;
            }
          });

          document.querySelectorAll('.anim-line').forEach(el => {
            el.style.strokeDasharray = '12 12';
            el.style.strokeDashoffset = -20 * progress;
          });

          const canvas = await performHtml2Canvas(bounds);
          gif.addFrame(canvas, { delay: 100 });
        }
        
        document.querySelectorAll('.anim-node').forEach(el => el.style.transform = '');
        document.querySelectorAll('.anim-line').forEach(el => el.style.strokeDashoffset = '');

        gif.on('finished', function(blob) {
          const link = document.createElement('a');
          link.download = `${boardTitle.toLowerCase().replace(/\s+/g, '-')}-animated.gif`;
          link.href = URL.createObjectURL(blob);
          link.click();
          setIsSaving(false);
          triggerHaptic('notificationSuccess');
          URL.revokeObjectURL(workerUrl);
        });

        gif.render();
      } catch (err) { 
        console.error("GIF Render Failed:", err); 
        alert("Failed to create GIF. Try a smaller board or static image.");
        setIsSaving(false); 
      }
    }, 600);
  };

  // --- Renderers ---

  const renderNodeShape = (node, isSelected) => {
    if (node.type === 'hub') {
      const radius = getNodeRadius(node, isMobile);
      return <div style={{ width: radius*2, height: radius*2, borderRadius: '50%', background: node.color, border: isSelected ? '4px solid #334155' : '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} />;
    }

    const charData = characterMap[node.charName];
    const src = charData?.src || '';
    const radius = getNodeRadius(node, isMobile);
    const size = radius * 2;
    const isFloating = node.animation === 'float' && !isSaving; // Let animations run during GIF rendering
    const isPulsing = node.animation === 'pulse' && !isSaving;
    const animationStyle = isFloating ? { animation: 'mapNodeFloat 3s ease-in-out infinite' } : isPulsing ? { animation: 'mapNodePulse 2s ease-in-out infinite' } : {};
    const borderColor = node.borderColor || (isSelected ? 'var(--pop-blue)' : 'rgba(0,0,0,0.08)');
    const borderWidth = isSelected ? '4px' : (node.borderColor && node.borderColor !== '#e2e8f0' ? '4px' : '2px');

    if (node.shape === 'circle') {
      return (
        <div style={{
          width: size, height: size, borderRadius: '50%', border: `${borderWidth} solid ${borderColor}`,
          boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden', backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
          transition: 'all 0.2s ease', ...animationStyle
        }}><img src={src} alt="" style={{ opacity: 0, width: '1px', height: '1px' }} crossOrigin="anonymous" /></div>
      );
    }
    if (node.shape === 'clear') {
      return (
        <div style={{
          width: size, height: size, borderRadius: '12px', border: isSelected ? '3px solid var(--pop-blue)' : 'none',
          boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.15)' : 'none', overflow: 'hidden', backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
          transition: 'all 0.2s ease', ...animationStyle
        }}><img src={src} alt="" style={{ opacity: 0, width: '1px', height: '1px' }} crossOrigin="anonymous" /></div>
      );
    }
    return (
      <div style={{ 
        width: size, height: size, background: 'white', padding: size > 80 ? '6px' : '4px', borderRadius: '6px',
        border: `${borderWidth} solid ${borderColor}`, boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.15)' : '2px 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden', transition: 'all 0.2s ease', ...animationStyle
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '2px', overflow: 'hidden', backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <img src={src} alt="" style={{ opacity: 0, width: '1px', height: '1px' }} crossOrigin="anonymous" />
        </div>
      </div>
    );
  };

  const activeBg = bgStyle === 'custom' ? { bg: customBgColor, css: 'none', size: 'auto' } : BACKGROUNDS.find(b => b.id === bgStyle);

  // --- Editor Panels ---
  
  const renderEditorSidebar = () => {
    if (showAddMenu && !isMobile) {
      return (
        <motion.div 
          initial={{ x: 300, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          exit={{ x: 300, opacity: 0 }}
          className="property-sidebar hide-scroll"
          style={{ width: '320px', background: '#f8fafc', borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', overflowY: 'auto' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontFamily: 'var(--font-paper)', fontSize: '1.4rem', color: '#1e293b' }}>Add to map</h4>
            <button onClick={() => setShowAddMenu(false)} style={{ background: '#e2e8f0', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Elements</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button onClick={handleAddGroup} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 4px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
                <CircleDashed size={18} color="var(--pop-blue)" />
                <span style={{ fontSize: '10px', fontWeight: '800' }}>Circle</span>
              </button>
              <button onClick={handleAddHub} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 4px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
                <Share2 size={18} color="var(--pop-blue)" />
                <span style={{ fontSize: '10px', fontWeight: '800' }}>Nexus</span>
              </button>
              <button onClick={handleAddMemo} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 4px', background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: '12px', cursor: 'pointer' }}>
                <StickyNote size={18} color="#d97706" />
                <span style={{ fontSize: '10px', fontWeight: '800' }}>Memo</span>
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Characters</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {portraitData.map(p => (
                <motion.div 
                  whileHover={{ y: -2, scale: 1.05 }}
                  key={p.name} 
                  onClick={() => handleAddCharacter(p.name)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '8px 4px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px' }}
                >
                  <img src={p.src} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#475569', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }
    return (
      <motion.div 
        initial={isMobile ? { y: '100%' } : { x: 300, opacity: 0 }}
        animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
        exit={isMobile ? { y: '100%' } : { x: 300, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="property-sidebar hide-scroll"
        style={{ 
          width: isMobile ? '100%' : '320px', 
          height: isMobile ? 'auto' : '100%',
          maxHeight: isMobile ? '75dvh' : '100%',
          background: isMobile ? 'white' : '#f8fafc', 
          borderLeft: isMobile ? 'none' : '2px solid #e2e8f0',
          borderTop: isMobile ? '1px solid #e2e8f0' : 'none',
          display: 'flex', flexDirection: 'column', zIndex: 10020, 
          position: isMobile ? 'fixed' : 'relative', 
          bottom: 0,
          right: 0, 
          top: isMobile ? 'auto' : 0,
          borderRadius: isMobile ? '32px 32px 0 0' : '0',
          boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.1)' : 'none',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        {isMobile && <div className="bottom-sheet-handle" />}
        
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             {selectedType === 'node' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(() => {
                    const node = nodes.find(n => n.id === selectedId);
                    if (node?.type === 'hub') return <div style={{ width: 24, height: 24, borderRadius: '50%', background: node.color }} />;
                    const charData = portraitData.find(p => p.name === node?.charName);
                    return charData ? <img src={charData.src} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} /> : null;
                  })()}
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-paper)', color: '#1e293b' }}>{nodes.find(n => n.id === selectedId)?.charName || 'Nexus'}</h3>
                </div>
             )}
             {selectedType !== 'node' && (
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-paper)', color: '#1e293b' }}>{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} settings</h3>
             )}
          </div>
          <button onClick={clearSelection} style={{ background: '#e2e8f0', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
        </div>
        
        <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {selectedType === 'link' && (() => {
            const link = links.find(l => l.id === selectedId);
            if (!link) return null;
            const fromNode = nodes.find(n => n.id === link.from);
            const toNode = nodes.find(n => n.id === link.to);
            const fromChar = portraitData.find(p => p.name === fromNode?.charName);
            const toChar = portraitData.find(p => p.name === toNode?.charName);

            return (
              <>
                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', border: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {fromChar && <img src={fromChar.src} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />}
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b' }}>{fromNode?.charName || 'Nexus'}</span>
                  </div>
                   <div style={{ flex: 1, height: '2px', background: '#e2e8f0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(() => {
                      const mode = link.arrow || 'forward';
                      if (mode === 'both') return <MoveHorizontal size={14} color="#94a3b8" />;
                      if (mode === 'backward') return <ArrowLeft size={14} color="#94a3b8" />;
                      if (mode === 'none') return <div style={{ width: '8px', height: '2px', background: '#e2e8f0' }} />;
                      return <ArrowRight size={14} color="#94a3b8" />;
                    })()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {toChar && <img src={toChar.src} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />}
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b' }}>{toNode?.charName || 'Nexus'}</span>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Relationship label</div>
                  <input value={link.label} onChange={(e) => updateItemProperty(links, setLinks, selectedId, 'label', e.target.value)} placeholder="e.g. Best Friend, Rival..." style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '600' }} />
                </div>
                
                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Label position</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'top', label: 'Top' },
                      { id: 'bottom', label: 'Bottom' },
                      { id: 'left', label: 'Left' },
                      { id: 'right', label: 'Right' }
                    ].map(p => (
                      <button key={p.id} onClick={() => updateItemProperty(links, setLinks, selectedId, 'labelPos', p.id)} style={{ padding: '8px 4px', fontSize: '10px', fontWeight: '800', background: (link.labelPos || 'top') === p.id ? 'var(--pop-blue)' : '#f8fafc', color: (link.labelPos || 'top') === p.id ? 'white' : '#64748b', border: 'none', borderRadius: '10px' }}>{p.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Connection color</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {PALETTE.map(c => <button key={c.name} onClick={() => updateItemProperty(links, setLinks, selectedId, 'color', c.color)} style={{ aspectRatio: '1', background: c.color, border: 'none', borderRadius: '50%', cursor: 'pointer', transition: 'transform 0.1s', transform: link.color === c.color ? 'scale(1.1)' : 'scale(1)', boxShadow: link.color === c.color ? `0 0 0 3px white, 0 0 0 5px ${c.color}` : 'none' }} /> )}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Path shape</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {LINE_SHAPES.map(s => { const Icon = s.icon; return <button key={s.id} onClick={() => updateItemProperty(links, setLinks, selectedId, 'shape', s.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px', fontSize: '10px', fontWeight: '800', background: link.shape === s.id ? 'var(--pop-blue)' : '#f8fafc', color: link.shape === s.id ? 'white' : '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer' }}> <Icon size={16} /> {s.label} </button>; })}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                   <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Line</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {LINE_STYLES.map(s => <button key={s.id} onClick={() => updateItemProperty(links, setLinks, selectedId, 'style', s.id)} style={{ padding: '6px', fontSize: '11px', fontWeight: '800', background: link.style === s.id ? '#cbd5e1' : '#f8fafc', color: link.style === s.id ? '#0f172a' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{s.label}</button> )}
                      </div>
                   </div>
                   <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Flow</div>
                      <button onClick={() => updateItemProperty(links, setLinks, selectedId, 'animated', !link.animated)} style={{ width: '100%', height: '100%', padding: '10px', fontSize: '11px', fontWeight: '800', background: link.animated ? 'var(--pop-pink)' : '#f8fafc', color: link.animated ? 'white' : '#475569', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Zap size={16}/> {link.animated ? "Active" : "Static"}</button>
                   </div>
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>Direction</div>
                    <button onClick={() => {
                      const newFrom = link.to;
                      const newTo = link.from;
                      updateItemProperty(links, setLinks, selectedId, 'from', newFrom);
                      updateItemProperty(links, setLinks, selectedId, 'to', newTo);
                    }} style={{ background: 'transparent', border: 'none', color: 'var(--pop-blue)', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Swap</button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'forward', icon: ArrowRight },
                      { id: 'backward', icon: ArrowLeft },
                      { id: 'both', icon: MoveHorizontal },
                      { id: 'none', icon: Minus }
                    ].map(d => {
                      const Icon = d.icon;
                      return (
                        <button key={d.id} onClick={() => updateItemProperty(links, setLinks, selectedId, 'arrow', d.id)} style={{ flex: 1, padding: '8px', background: (link.arrow || 'forward') === d.id ? 'var(--pop-blue)' : '#f8fafc', color: (link.arrow || 'forward') === d.id ? 'white' : '#64748b', border: 'none', borderRadius: '10px' }}>
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Relationship type</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'standard', label: 'Standard' },
                      { id: 'union', label: 'Union' },
                      { id: 'exclusion', label: 'Exclusion' }
                    ].map(t => (
                      <button key={t.id} onClick={() => updateItemProperty(links, setLinks, selectedId, 'logic', t.id)} style={{ padding: '8px 4px', fontSize: '10px', fontWeight: '800', background: (link.logic || 'standard') === t.id ? '#cbd5e1' : '#f8fafc', color: (link.logic || 'standard') === t.id ? '#0f172a' : '#64748b', border: 'none', borderRadius: '10px' }}>{t.label}</button>
                    ))}
                  </div>
                </div>

                <button onClick={deleteSelected} style={{ width: '100%', padding: '12px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Trash2 size={16} /> Delete link
                </button>
              </>
            );
          })()}

          {selectedType === 'node' && (() => {
            const node = nodes.find(n => n.id === selectedId);
            if (!node) return null;
            if (node.type === 'hub') {
              return (
                <>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Nexus name</div>
                    <input value={node.charName || ''} onChange={(e) => updateItemProperty(nodes, setNodes, selectedId, 'charName', e.target.value)} placeholder="Nexus name..." style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '600' }} />
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Nexus size</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {HUB_SIZES.map(s => <button key={s.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'size', s.id)} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: '800', background: node.size === s.id ? 'var(--pop-blue)' : '#f8fafc', color: node.size === s.id ? 'white' : '#64748b', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>{s.label}</button> )}
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Label position</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {[
                        { id: 'top', label: 'Top' },
                        { id: 'bottom', label: 'Bottom' },
                        { id: 'left', label: 'Left' },
                        { id: 'right', label: 'Right' }
                      ].map(p => (
                        <button key={p.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'charNamePos', p.id)} style={{ padding: '8px 4px', fontSize: '10px', fontWeight: '800', background: (node.charNamePos || 'bottom') === p.id ? 'var(--pop-blue)' : '#f8fafc', color: (node.charNamePos || 'bottom') === p.id ? 'white' : '#64748b', border: 'none', borderRadius: '10px' }}>{p.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Nexus color</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {PALETTE.map(c => <button key={c.name} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'color', c.color)} style={{ aspectRatio: '1', background: c.color, border: 'none', borderRadius: '50%', cursor: 'pointer', transition: 'transform 0.1s', transform: node.color === c.color ? 'scale(1.1)' : 'scale(1)', boxShadow: node.color === c.color ? `0 0 0 3px white, 0 0 0 5px ${c.color}` : 'none' }} /> )}
                    </div>
                  </div>
                  <button onClick={deleteSelected} style={{ width: '100%', padding: '12px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Trash2 size={16} /> Delete nexus
                  </button>
                </>
              );
            }
            return (
              <>
                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Frame style</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {NODE_SHAPES.map(s => { const Icon = s.icon; return <button key={s.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'shape', s.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px', fontSize: '10px', fontWeight: '800', background: node.shape === s.id ? 'var(--pop-blue)' : '#f8fafc', color: node.shape === s.id ? 'white' : '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer' }}> <Icon size={16} /> {s.label} </button>; })}
                  </div>
                </div>
                
                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Avatar size</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {NODE_SIZES.map(s => <button key={s.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'size', s.id)} style={{ flex: 1, padding: '8px', fontSize: '11px', fontWeight: '800', background: node.size === s.id ? '#cbd5e1' : '#f8fafc', color: node.size === s.id ? '#0f172a' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{s.label}</button> )}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Label position</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'top', label: 'Top' },
                      { id: 'bottom', label: 'Bottom' },
                      { id: 'left', label: 'Left' },
                      { id: 'right', label: 'Right' }
                    ].map(p => (
                      <button key={p.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'charNamePos', p.id)} style={{ padding: '8px 4px', fontSize: '10px', fontWeight: '800', background: (node.charNamePos || 'bottom') === p.id ? 'var(--pop-blue)' : '#f8fafc', color: (node.charNamePos || 'bottom') === p.id ? 'white' : '#64748b', border: 'none', borderRadius: '10px' }}>{p.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Presence effect</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {NODE_ANIMATIONS.map(s => <button key={s.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'animation', s.id)} style={{ flex: 1, padding: '8px', fontSize: '11px', fontWeight: '800', background: node.animation === s.id ? 'var(--pop-pink)' : '#f8fafc', color: node.animation === s.id ? 'white' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{s.label}</button> )}
                  </div>
                </div>

                {(() => {
                  const nodeLinks = links.filter(l => l.from === selectedId || l.to === selectedId);
                  if (nodeLinks.length === 0) return null;
                  return (
                    <div style={{ background: 'white', padding: '12px', borderRadius: '16px', border: '1.5px solid #f1f5f9' }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Active connections ({nodeLinks.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {nodeLinks.map(l => {
                          const isFrom = l.from === selectedId;
                          const otherId = isFrom ? l.to : l.from;
                          const otherNode = nodes.find(n => n.id === otherId);
                          const otherChar = portraitData.find(p => p.name === otherNode?.charName);
                          return (
                            <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isFrom ? <ArrowRight size={12} color="var(--pop-blue)" /> : <ArrowLeft size={12} color="#94a3b8" />}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {otherChar && <img src={otherChar.src} style={{ width: '16px', height: '16px', borderRadius: '50%' }} />}
                                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b' }}>{otherNode?.charName || 'Nexus'}</span>
                                </div>
                              </div>
                              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>{l.label || (isFrom ? 'Outgoing' : 'Incoming')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <button onClick={deleteSelected} style={{ width: '100%', padding: '12px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Trash2 size={16} /> Delete character
                </button>
              </>
            );
          })()}

          {selectedType === 'group' && (() => {
            const group = groups.find(g => g.id === selectedId);
            if (!group) return null;

            const gX = Number(group.x);
            const gY = Number(group.y);
            const gW = Number(group.width || 300);
            const gH = Number(group.height || 300);
            const gCenterX = gX + gW / 2;
            const gCenterY = gY + gH / 2;
            const isCircle = group.shape === 'circle';

            // Recursive helper to find all members and sub-circles
            const getCircleContent = (targetCircle, visited = new Set()) => {
              if (visited.has(targetCircle.id)) return { members: [], circles: [] };
              visited.add(targetCircle.id);

              const tcX = Number(targetCircle.x);
              const tcY = Number(targetCircle.y);
              const tcW = Number(targetCircle.width || 300);
              const tcH = Number(targetCircle.height || 300);
              const tcCenterX = tcX + tcW / 2;
              const tcCenterY = tcY + tcH / 2;
              const isCircle = targetCircle.shape === 'circle';

              const innerMembers = nodes.filter(n => {
                const r = getNodeRadius(n, isMobile);
                const nX = Number(n.x) + r;
                const nY = Number(n.y) + r;

                if (isCircle) {
                  const dx = nX - tcCenterX;
                  const dy = nY - tcCenterY;
                  const radius = Math.min(tcW, tcH) / 2;
                  return Math.sqrt(dx * dx + dy * dy) < (radius + r * 0.5);
                } else {
                  return (
                    nX > tcX - r * 0.5 && 
                    nX < tcX + tcW + r * 0.5 && 
                    nY > tcY - r * 0.5 && 
                    nY < tcY + tcH + r * 0.5
                  );
                }
              });

              const innerCircles = groups.filter(g => {
                if (g.id === targetCircle.id) return false;
                const subX = Number(g.x) + Number(g.width || 300) / 2;
                const subY = Number(g.y) + Number(g.height || 300) / 2;
                
                if (isCircle) {
                  const dx = subX - tcCenterX;
                  const dy = subY - tcCenterY;
                  return Math.sqrt(dx * dx + dy * dy) < (Math.min(tcW, tcH) / 2);
                } else {
                  return subX > tcX && subX < tcX + tcW && subY > tcY && subY < tcY + tcH;
                }
              });

              // Initial spatial members
              let allMembers = [...innerMembers];
              let allCircles = [...innerCircles];

              // Add characters connected via 'Union' logic to any current member
              const addUnionMembers = (currentMembers) => {
                let added = false;
                const newMembers = [...currentMembers];
                
                links.forEach(l => {
                  if (l.logic === 'union') {
                    const fromIn = newMembers.some(m => m.id === l.from);
                    const toIn = newMembers.some(m => m.id === l.to);
                    
                    if (fromIn && !toIn) {
                      const targetNode = nodes.find(n => n.id === l.to);
                      if (targetNode) { newMembers.push(targetNode); added = true; }
                    } else if (toIn && !fromIn) {
                      const sourceNode = nodes.find(n => n.id === l.from);
                      if (sourceNode) { newMembers.push(sourceNode); added = true; }
                    }
                  }
                });
                
                if (added) {
                  const unique = Array.from(new Map(newMembers.map(m => [m.id, m])).values());
                  return addUnionMembers(unique);
                }
                return currentMembers;
              };

              allMembers = addUnionMembers(allMembers);

              innerCircles.forEach(child => {
                const childContent = getCircleContent(child, visited);
                allMembers = [...allMembers, ...childContent.members];
                allCircles = [...allCircles, ...childContent.circles];
              });

              // Deduplicate members
              allMembers = Array.from(new Map(allMembers.map(m => [m.id, m])).values());
              return { members: allMembers, circles: allCircles };
            };

            const content = getCircleContent(group);
            const finalMembers = content.members;
            const internalLinks = links.filter(l => 
              finalMembers.some(m => m.id === l.from) && 
              finalMembers.some(m => m.id === l.to)
            );

            return (
              <>
                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Circle name</div>
                  <input value={group.title} onChange={(e) => updateItemProperty(groups, setGroups, selectedId, 'title', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '700' }} />
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Label position</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'top', label: 'Top' },
                      { id: 'bottom', label: 'Bottom' },
                      { id: 'left', label: 'Left' },
                      { id: 'right', label: 'Right' }
                    ].map(p => (
                      <button key={p.id} onClick={() => updateItemProperty(groups, setGroups, selectedId, 'titlePosition', p.id)} style={{ padding: '8px 4px', fontSize: '10px', fontWeight: '800', background: (group.titlePosition || 'top') === p.id ? 'var(--pop-blue)' : '#f8fafc', color: (group.titlePosition || 'top') === p.id ? 'white' : '#64748b', border: 'none', borderRadius: '10px' }}>{p.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', border: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Total members ({finalMembers.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {finalMembers.length === 0 ? (
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span>No characters inside</span>
                          <span style={{ fontSize: '8px', opacity: 0.7 }}>Pos: {Math.round(gX)},{Math.round(gY)} Size: {Math.round(gW)}x{Math.round(gH)}</span>
                        </div>
                      ) : finalMembers.map(m => {
                        const char = portraitData.find(p => p.name === m.charName);
                        return (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            {char && <img src={char.src} style={{ width: '14px', height: '14px', borderRadius: '50%' }} />}
                            <span style={{ fontSize: '9px', fontWeight: '800', color: '#475569' }}>{m.charName || 'Nexus'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {content.circles.length > 0 && (
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Sub-circles ({content.circles.length})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {content.circles.map(c => (
                          <div key={c.id} style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '8px' }}>{c.title || 'Untitled Circle'}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {internalLinks.length > 0 && (
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Internal relationships ({internalLinks.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {internalLinks.map(l => {
                          const fNode = nodes.find(n => n.id === l.from);
                          const tNode = nodes.find(n => n.id === l.to);
                          
                          // Find the smallest sub-circle that contains both
                          const containingCircle = content.circles.find(c => {
                            const cX = Number(c.x); const cY = Number(c.y);
                            const cW = Number(c.width || 300); const cH = Number(c.height || 300);
                            const cR = Math.min(cW, cH) / 2;
                            const isC = c.shape === 'circle';
                            const fR = getNodeRadius(fNode, isMobile);
                            const tR = getNodeRadius(tNode, isMobile);
                            
                            const inF = isC ? (Math.sqrt(Math.pow((fNode.x+fR)-(cX+cW/2),2)+Math.pow((fNode.y+fR)-(cY+cH/2),2)) < cR+fR*0.5) : (fNode.x+fR > cX && fNode.x+fR < cX+cW && fNode.y+fR > cY && fNode.y+fR < cY+cH);
                            const inT = isC ? (Math.sqrt(Math.pow((tNode.x+tR)-(cX+cW/2),2)+Math.pow((tNode.y+tR)-(cY+cH/2),2)) < cR+tR*0.5) : (tNode.x+tR > cX && tNode.x+tR < cX+cW && tNode.y+tR > cY && tNode.y+tR < cY+cH);
                            return inF && inT;
                          });

                          return (
                            <div key={l.id} style={{ fontSize: '10px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '6px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: '800' }}>{fNode?.charName}</span>
                                <ArrowRight size={10} color="#94a3b8" />
                                <span style={{ fontWeight: '800' }}>{tNode?.charName}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>{l.label || 'Connected'}</span>
                                <span style={{ fontSize: '8px', fontWeight: '800', color: 'var(--pop-blue)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                  in {containingCircle ? (containingCircle.title || 'Sub-circle') : (group.title || 'Circle')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Circle color</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {GROUP_COLORS.map((c, i) => <button key={c.name} onClick={() => updateItemProperty(groups, setGroups, selectedId, 'colorIndex', i)} style={{ aspectRatio: '1', background: c.border, border: 'none', borderRadius: '50%', cursor: 'pointer', transition: 'transform 0.1s', transform: group.colorIndex === i ? 'scale(1.1)' : 'scale(1)', boxShadow: group.colorIndex === i ? `0 0 0 3px white, 0 0 0 5px ${c.border}` : 'none' }} /> )}
                  </div>
                </div>
                <button onClick={deleteSelected} style={{ width: '100%', padding: '12px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Trash2 size={16} /> Delete circle
                </button>
              </>
            );
          })()}

          {selectedType === 'memo' && (() => {
            const memo = memos.find(m => m.id === selectedId);
            if (!memo) return null;
            return (
              <>
                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Memo color</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {PALETTE.map(c => <button key={c.name} onClick={() => updateItemProperty(memos, setMemos, selectedId, 'color', c.color)} style={{ aspectRatio: '1', background: c.color, border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.1s', transform: memo.color === c.color ? 'scale(1.1)' : 'scale(1)', boxShadow: memo.color === c.color ? `0 0 0 3px white, 0 0 0 5px #cbd5e1` : 'none' }} /> )}
                  </div>
                </div>
                <button onClick={deleteSelected} style={{ width: '100%', padding: '12px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Trash2 size={16} /> Delete memo
                </button>
              </>
            );
          })()}
        </div>
      </motion.div>
    );
  };

  const mapContent = (
    <div ref={containerRef} data-no-tab-swipe="1" className={`relationship-map mystery-ui ${isFullscreen ? 'is-fullscreen' : ''}`} style={{ 
      display: 'flex', flexDirection: 'column', 
      ...(isFullscreen || isMobile ? {
        background: '#f8fafc', height: isMobile ? '100dvh' : '100vh', width: '100vw',
        position: isMobile ? 'fixed' : 'relative', top: 0, left: 0, zIndex: 2147483647
      } : {
        height: 'calc(100vh - 120px)', minHeight: '600px'
      }),
      overflow: 'hidden' 
    }}>
      
      <style>
        {`
          .relationship-map:not(.is-fullscreen) {
             width: 100%;
             max-width: 1600px;
             margin: 0 auto;
             position: relative;
             z-index: 10;
          }
          @keyframes mapLineFlow { to { stroke-dashoffset: -20; } }
          @keyframes mapNodeFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes mapNodePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
          .hide-scroll::-webkit-scrollbar { display: none; }
          
          /* Mobile Specific Styles */
          .mobile-dock {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 24px;
            padding: 8px;
            display: flex;
            gap: 8px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            z-index: 1000;
            width: max-content;
            max-width: 95vw;
          }

          .dock-btn {
            width: 48px;
            height: 48px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            color: #475569;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }

          .mobile-bottom-dock {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(25px);
            border: 1.5px solid rgba(255, 255, 255, 0.4);
            border-radius: 16px;
            padding: 3px 6px;
            display: flex;
            gap: 2px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            width: max-content;
            max-width: 98vw;
          }

          .dock-btn {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            color: #475569;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }

          .dock-btn.active {
            background: var(--pop-blue);
            color: white;
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
          }

          .dock-btn:active {
            transform: scale(0.9);
          }

          .dock-btn-primary {
            background: var(--pop-pink);
            color: white;
            box-shadow: 0 4px 10px rgba(244, 114, 182, 0.3);
          }

          .bottom-sheet-handle {
            width: 32px;
            height: 4px;
            background: #e2e8f0;
            border-radius: 2px;
            margin: 8px auto;
          }

          .character-card {
            background: #f8fafc;
            border-radius: 10px;
            padding: 4px;
            text-align: center;
            border: 1.5px solid transparent;
            transition: all 0.2s ease;
          }

          .character-card:active {
            transform: scale(0.95);
            border-color: var(--pop-pink);
          }
        `}
      </style>

      {/* Mobile Bottom Dock / Desktop Horizontal Toolbar */}
      {!isSaving && (!isMobile || (!selectedId && !showMapSettings && !showAddMenu)) && (
        isMobile ? (
          <div style={{ position: 'fixed', bottom: '8px', left: 0, width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 2147483647 }}>
            <motion.div 
              initial={{ y: 100 }} 
              animate={{ y: 0 }} 
              className="mobile-bottom-dock"
              style={{ pointerEvents: 'auto' }}
            >
              <button className="dock-btn" onClick={onBack} style={{ color: '#64748b' }}>
                <ChevronLeft size={18} />
              </button>
              <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: 'auto 2px' }} />
              <button className={`dock-btn ${isPanMode ? 'active' : ''}`} onClick={() => { setIsPanMode(!isPanMode); triggerHaptic('selection'); }}>
                <Navigation size={18} style={{ transform: isPanMode ? 'rotate(45deg)' : 'none' }} />
              </button>
              <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: 'auto 2px' }} />
              <button className="dock-btn dock-btn-primary" onClick={() => setShowAddMenu(!showAddMenu)}>
                <Plus size={18} />
              </button>
              <button 
                className={`dock-btn ${isConnecting ? 'active' : ''}`} 
                onClick={() => { if (selectedType === 'node') { setIsConnecting(!isConnecting); } else alert("Select a character or nexus first!"); }}
              >
                <ArrowRight size={18} />
              </button>
              <button className="dock-btn" onClick={() => setShowMapSettings(!showMapSettings)}>
                <Settings2 size={18} />
              </button>
              <button className="dock-btn" onClick={handleSaveImage}>
                <Download size={18} />
              </button>
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="hide-scroll" style={{ 
            display: 'flex', overflowX: 'auto', gap: '8px', padding: '8px 12px', 
            background: 'rgba(255,255,255,0.98)', borderBottom: '2px solid #e2e8f0',
            alignItems: 'center', WebkitOverflowScrolling: 'touch', flexShrink: 0,
            position: 'relative', zIndex: 500
          }}>
            <button onClick={() => setShowAddMenu(!showAddMenu)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'var(--pop-pink)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}>
              <UserPlus size={14} /> Person
            </button>
            <button onClick={handleAddGroup} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}>
              <CircleDashed size={14} /> Circle
            </button>
            <button onClick={handleAddHub} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}>
              <Share2 size={14} /> Nexus
            </button>
            <button onClick={handleAddMemo} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: '8px', color: '#d97706', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}>
              <StickyNote size={14} /> Memo
            </button>
            
            <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 2px' }} />

            <button onClick={() => { if (selectedType === 'node') { setIsConnecting(!isConnecting); } else alert("Select a character or nexus first!"); }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: isConnecting ? 'var(--pop-blue)' : 'white', border: isConnecting ? '1.5px solid var(--pop-blue)' : '1.5px solid #cbd5e1', borderRadius: '8px', color: isConnecting ? 'white' : '#4b5563', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}
            >
              <ArrowRight size={14} /> {isConnecting ? "Tap target..." : "Link"}
            </button>

            {selectedId && (
              <button onClick={deleteSelected} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fee2e2', border: '1.5px solid #fecaca', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <Trash2 size={14} />
              </button>
            )}

            <div style={{ flex: 1, minWidth: '20px' }} />

            <button onClick={toggleFullscreen} style={{ display: 'flex', alignItems: 'center', padding: '6px', background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#64748b', cursor: 'pointer' }} title="Toggle Fullscreen">
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            <button onClick={() => setShowMapSettings(!showMapSettings)} style={{ display: 'flex', alignItems: 'center', padding: '6px', background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', cursor: 'pointer', position: 'relative' }}>
              <MapIcon size={16} />
            </button>
            <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', padding: '6px', background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#64748b', cursor: 'pointer' }}>
              <RotateCcw size={16} />
            </button>
            <button onClick={handleSaveImage} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}>
              <Download size={14} /> PNG
            </button>
          </motion.div>
        )
      )}

      {/* Main Area: Canvas + Editor */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden', position: 'relative', marginBottom: isMobile ? '60px' : 0 }}>
        
        {/* Settings Drawer (Mobile-First) */}
        <AnimatePresence>
          {showMapSettings && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 100 }} 
              style={{ 
                position: 'fixed', 
                bottom: 0, left: 0, right: 0,
                background: 'white', 
                padding: isMobile ? '16px 16px 32px' : '20px', 
                borderRadius: isMobile ? '24px 24px 0 0' : '24px', 
                boxShadow: '0 -10px 40px rgba(0,0,0,0.15)', 
                zIndex: 10002, 
                width: '100%', 
                borderTop: '1px solid #f1f5f9' 
              }}
            >
              {isMobile && <div className="bottom-sheet-handle" />}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>Map settings</h4>
                <button onClick={() => setShowMapSettings(false)} style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Canvas background</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {BACKGROUNDS.map(bg => (
                      <button key={bg.id} onClick={() => setBgStyle(bg.id)} style={{ padding: '8px 4px', borderRadius: '10px', cursor: 'pointer', background: bgStyle === bg.id ? 'var(--pop-blue)' : '#f8fafc', color: bgStyle === bg.id ? 'white' : '#475569', border: 'none', fontWeight: '800', fontSize: '9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <Grid size={14} /> {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>Custom color</div>
                    <input type="color" value={customBgColor} onChange={(e) => { setBgStyle('custom'); setCustomBgColor(e.target.value); }} style={{ width: '100%', height: '32px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }} />
                  </div>
                  <button onClick={handleReset} style={{ flex: 1, height: '32px', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: '800', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '14px' }}>
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>Title settings</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input value={boardTitle} onChange={(e) => setBoardTitle(e.target.value)} placeholder="Map title..." style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '13px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setMapTitleStyle('minimal')} style={{ flex: 1, padding: '8px', fontSize: '11px', fontWeight: '800', background: mapTitleStyle === 'minimal' ? 'var(--pop-blue)' : '#f8fafc', color: mapTitleStyle === 'minimal' ? 'white' : '#64748b', border: 'none', borderRadius: '8px' }}>Minimal</button>
                  <button onClick={() => setMapTitleStyle('paper')} style={{ flex: 1, padding: '8px', fontSize: '11px', fontWeight: '800', background: mapTitleStyle === 'paper' ? 'var(--pop-blue)' : '#f8fafc', color: mapTitleStyle === 'paper' ? 'white' : '#64748b', border: 'none', borderRadius: '8px' }}>Paper</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Canvas Container */}
        <div 
          ref={scrollContainerRef}
          style={{ 
            flex: 1, overflow: 'auto', position: 'relative', background: '#cbd5e1',
            overscrollBehavior: 'none', touchAction: 'pan-x pan-y', cursor: isPanning ? 'grabbing' : 'default'
          }}
        >
          <div 
            ref={canvasRef}
            className="map-canvas"
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ 
              width: '3000px', height: '3000px', position: 'absolute', top: 0, left: 0,
              background: activeBg.bg, backgroundImage: activeBg.css, backgroundSize: activeBg.size,
              overflow: 'hidden', touchAction: 'none'
            }}
          >
            <div className="map-board-title" style={{ position: 'absolute', top: titlePos.y, left: titlePos.x, transform: 'translateX(-50%)', zIndex: 10, width: 'max-content', maxWidth: 'min(1400px, 90vw)', cursor: draggingItems.some(i=>i.id==='title') ? 'grabbing' : 'grab' }} onPointerDown={(e) => handleItemPointerDown(e, 'title', 'title')}>
              {!isSaving && isEditingTitle ? (
                <div style={{ background: 'rgba(255,255,255,0.98)', borderRadius: '24px', padding: isMobile ? '12px 24px' : '20px 40px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', borderBottom: '4px dashed var(--pop-blue)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: isMobile ? '280px' : '500px' }}>
                  <input 
                    autoFocus 
                    value={boardTitle} 
                    onChange={(e) => setBoardTitle(e.target.value)} 
                    onBlur={() => setIsEditingTitle(false)} 
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)} 
                    style={{ 
                      fontFamily: 'var(--font-paper)', 
                      fontSize: isMobile ? '1.8rem' : '2.8rem', 
                      textAlign: 'center', 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#1e293b', 
                      outline: 'none', 
                      width: '100%',
                      padding: '0'
                    }} 
                  />
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', fontWeight: '800' }}>Press Enter to save</div>
                </div>
              ) : (
                <div onClick={() => !isSaving && setIsEditingTitle(true)} style={{ textAlign: 'center', padding: isMobile ? '8px 20px 12px' : '12px 40px 18px', borderRadius: '24px', background: isSaving ? 'transparent' : 'rgba(255,255,255,0.7)', backdropFilter: isSaving ? 'none' : 'blur(8px)', textShadow: isSaving ? '0 2px 10px rgba(255,255,255,0.9)' : 'none', border: isSaving ? 'none' : '1px solid rgba(0,0,0,0.05)', display: 'block' }}>
                  <h2 style={{ fontFamily: 'var(--font-paper)', color: '#1e293b', margin: 0, fontSize: isSaving ? (isMobile ? '1.4rem' : '2rem') : (isMobile ? '1.6rem' : '2.4rem'), cursor: isSaving ? 'default' : 'pointer', textAlign: 'center', lineHeight: '1', display: 'inline-block' }}>
                    {boardTitle}
                  </h2>
                  {!isSaving && <Edit3 size={isMobile ? 18 : 24} color="var(--pop-blue)" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '12px' }} />}
                </div>
              )}
            </div>

            {/* Groups Layer */}
            {groups.map(group => {
              const c = GROUP_COLORS[group.colorIndex];
              const isSelected = selectedId === group.id;
              return (
                <div 
                  key={group.id} 
                  onPointerDown={(e) => handleItemPointerDown(e, group.id, 'group')} 
                  style={{ 
                    position: 'absolute', 
                    left: group.x, top: group.y, 
                    width: group.width, height: group.height, 
                    background: c.bg, 
                    border: isSelected ? `4px dashed ${c.border}` : `2px dashed ${c.border}`, 
                    borderRadius: group.shape === 'circle' ? '50%' : '32px', 
                    zIndex: 0, 
                    cursor: draggingItems.some(i=>i.id===group.id) ? 'grabbing' : 'grab', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'visible'
                  }}
                >
                  <div style={{ 
                    position: 'absolute',
                    width: 'max-content',
                    ...(group.titlePosition === 'bottom' ? { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' } : 
                       group.titlePosition === 'left' ? { right: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' } : 
                       group.titlePosition === 'right' ? { left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' } : 
                       { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }),
                    background: 'white', 
                    padding: '8px 16px 12px', 
                    borderRadius: '20px', 
                    border: `2px solid ${c.border}`, 
                    color: '#334155', 
                    fontWeight: 'bold', 
                    fontFamily: 'var(--font-paper)', 
                    fontSize: '1.1rem', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', 
                    display: 'block', 
                    textAlign: 'center',
                    lineHeight: '1',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}>
                    {group.title}
                  </div>
                  {isSelected && !isSaving && (
                    <div onPointerDown={(e) => handleResizePointerDown(e, group.id)} style={{ position: 'absolute', right: -6, bottom: -6, width: 24, height: 24, background: 'var(--pop-blue)', border: '3px solid white', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
                  )}
                  {isSelected && !isSaving && isMobile && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      style={{ position: 'absolute', bottom: 'calc(100% + 40px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.3)', zIndex: 100 }}
                    >
                      <button onClick={(e) => { e.stopPropagation(); deleteSelected(); triggerHaptic('selection'); }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} /></button>
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* SVG Lines Layer */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              <defs>
                {PALETTE.map(c => (
                  <React.Fragment key={`markers-${c.color}`}>
                    <marker id={`arrow-${c.color.replace('#', '')}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L6,3 z" fill={c.color} />
                    </marker>
                    <marker id={`arrow-start-${c.color.replace('#', '')}`} markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M6,0 L6,6 L0,3 z" fill={c.color} />
                    </marker>
                  </React.Fragment>
                ))}
              </defs>

              {links.map(link => {
                const fromNode = nodes.find(n => n.id === link.from);
                const toNode = nodes.find(n => n.id === link.to);
                if (!fromNode || !toNode) return null;

                const style = LINE_STYLES.find(s => s.id === link.style);
                const thicknessInfo = LINE_THICKNESS.find(t => t.id === link.thickness) || LINE_THICKNESS[1];
                const isSelected = selectedId === link.id;

                const r1 = getNodeRadius(fromNode, isMobile);
                const r2 = getNodeRadius(toNode, isMobile);
                const cx1 = fromNode.x + r1; const cy1 = fromNode.y + r1;
                const cx2 = toNode.x + r2; const cy2 = toNode.y + r2;

                const { ax, ay, bx, by } = getAdjustedEndpoints(cx1, cy1, cx2, cy2, r1 + 4, r2 + 4);
                const dPath = generatePath(ax, ay, bx, by, link.shape || 'straight', link.curveOffset);
                const mid = getMidpoint(ax, ay, bx, by, link.shape || 'straight', link.curveOffset);

                const logic = link.logic || 'standard';
                const arrowMode = link.arrow || 'forward';

                return (
                  <g key={link.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); triggerHaptic('selection'); selectItem(link.id, 'link'); }}>
                    {isSelected && <path d={dPath} stroke={link.color} strokeWidth={thicknessInfo.width + 6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3" />}
                    
                    {logic === 'union' ? (
                      <>
                        <path className={link.animated ? "anim-line" : ""} d={generatePath(ax, ay, bx, by, link.shape || 'straight', (link.curveOffset || 0) - 3)} stroke={link.color} strokeWidth={thicknessInfo.width} strokeDasharray={link.animated && !isSaving ? '12 12' : style?.dash} markerEnd={(arrowMode === 'forward' || arrowMode === 'both') ? `url(#arrow-${link.color.replace('#', '')})` : ''} markerStart={(arrowMode === 'backward' || arrowMode === 'both') ? `url(#arrow-start-${link.color.replace('#', '')})` : ''} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: link.animated && !isSaving ? 'mapLineFlow 0.8s linear infinite' : 'none' }} />
                        <path className={link.animated ? "anim-line" : ""} d={generatePath(ax, ay, bx, by, link.shape || 'straight', (link.curveOffset || 0) + 3)} stroke={link.color} strokeWidth={thicknessInfo.width} strokeDasharray={link.animated && !isSaving ? '12 12' : style?.dash} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: link.animated && !isSaving ? 'mapLineFlow 0.8s linear infinite' : 'none' }} />
                      </>
                    ) : (
                      <path className={link.animated ? "anim-line" : ""} d={dPath} stroke={link.color} strokeWidth={thicknessInfo.width} strokeDasharray={logic === 'exclusion' ? '8,4' : link.animated && !isSaving ? '12 12' : style?.dash} markerEnd={(arrowMode === 'forward' || arrowMode === 'both') ? `url(#arrow-${link.color.replace('#', '')})` : ''} markerStart={(arrowMode === 'backward' || arrowMode === 'both') ? `url(#arrow-start-${link.color.replace('#', '')})` : ''} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: link.animated && !isSaving ? 'mapLineFlow 0.8s linear infinite' : 'none' }} />
                    )}

                    {/* Exclusion Cross */}
                    {logic === 'exclusion' && (
                      <g transform={`translate(${mid.x},${mid.y}) rotate(45)`}>
                        <line x1="-8" y1="0" x2="8" y2="0" stroke={link.color} strokeWidth="3" />
                        <line x1="0" y1="-8" x2="0" y2="8" stroke={link.color} strokeWidth="3" />
                      </g>
                    )}

                    <path d={dPath} stroke="transparent" strokeWidth="30" fill="none" />
                    {link.label && (() => {
                      const dx = bx - ax; const dy = by - ay;
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const nx = dist > 0 ? dy / dist : 0;
                      const ny = dist > 0 ? -dx / dist : -1;
                      const tx = dist > 0 ? dx / dist : 1;
                      const ty = dist > 0 ? dy / dist : 0;

                      const labelPos = link.labelPos || 'top';
                      let lx = mid.x;
                      let ly = mid.y;
                      const baseOffset = 25;

                      if (labelPos === 'top') { lx += nx * baseOffset; ly += ny * baseOffset; }
                      else if (labelPos === 'bottom') { lx -= nx * baseOffset; ly -= ny * baseOffset; }
                      else if (labelPos === 'left') { lx -= tx * baseOffset * 2; ly -= ty * baseOffset * 2; }
                      else if (labelPos === 'right') { lx += tx * baseOffset * 2; ly += ty * baseOffset * 2; }

                      return (
                        <g transform={`translate(${lx}, ${ly})`}>
                          <rect x={-(link.label.length * 4.5 + 12)} y="-14" width={link.label.length * 9 + 24} height="28" fill="white" rx="14" stroke={link.color} strokeWidth="2" />
                          <text x="0" y="-1" dominantBaseline="central" fill={link.color} style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-paper)', textAnchor: 'middle' }}>{link.label}</text>
                        </g>
                      );
                    })()}
                    {isSelected && !isSaving && isMobile && (
                      <foreignObject x={mid.x - 40} y={mid.y - 60} width="80" height="50">
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', justifyContent: 'center' }}>
                          <button onClick={(e) => { e.stopPropagation(); deleteSelected(); triggerHaptic('selection'); }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', color: '#ef4444', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}><Trash2 size={18} /></button>
                        </motion.div>
                      </foreignObject>
                    )}
                    {isSelected && !isSaving && (
                      <circle 
                        cx={mid.x} 
                        cy={mid.y} 
                        r={isMobile ? "12" : "10"} 
                        fill="white" 
                        stroke={link.color} 
                        strokeWidth="3" 
                        style={{ cursor: 'crosshair', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} 
                        onPointerDown={(e) => { e.stopPropagation(); handleCurvePointerDown(e, link.id); }} 
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Memos Layer */}
            {memos.map(memo => (
              <div key={memo.id} style={{ position: 'absolute', left: memo.x, top: memo.y, zIndex: selectedId === memo.id ? 12 : 3, width: '180px', background: memo.color, borderRadius: '12px', boxShadow: selectedId === memo.id ? '0 12px 30px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: selectedId === memo.id ? '2px solid var(--pop-blue)' : '2px solid rgba(0,0,0,0.05)' }}>
                <div onPointerDown={(e) => handleItemPointerDown(e, memo.id, 'memo')} style={{ height: '24px', background: 'rgba(0,0,0,0.06)', cursor: draggingItems.some(i=>i.id===memo.id) ? 'grabbing' : 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none' }}><div style={{ width: '30px', height: '4px', background: 'rgba(0,0,0,0.15)', borderRadius: '2px' }} /></div>
                <textarea onPointerDown={e => e.stopPropagation()} onFocus={() => selectItem(memo.id, 'memo')} style={{ flex: 1, border: 'none', background: 'transparent', resize: 'vertical', padding: '12px', outline: 'none', fontFamily: 'var(--font-paper)', fontSize: '15px', color: '#334155', minHeight: '80px' }} placeholder="Write a note..." value={memo.text} onChange={e => updateItemProperty(memos, setMemos, memo.id, 'text', e.target.value)} />
                {selectedId === memo.id && !isSaving && isMobile && (
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
                    <button onClick={(e) => { e.stopPropagation(); deleteSelected(); triggerHaptic('selection'); }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', color: '#ef4444', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}><Trash2 size={18} /></button>
                  </motion.div>
                )}
              </div>
            ))}

            {/* Nodes & Hubs Layer */}
            {nodes.map(node => {
              const size = getNodeRadius(node, isMobile) * 2;
              const isSelected = selectedId === node.id;
              return (
                <div className={node.animation !== 'none' ? "anim-node" : ""} data-anim={node.animation} key={node.id} onPointerDown={(e) => handleItemPointerDown(e, node.id, 'node')} style={{ position: 'absolute', left: node.x, top: node.y, width: size, height: size, zIndex: isSelected ? 10 : 2, cursor: isConnecting ? 'crosshair' : (draggingItems.some(i=>i.id===node.id) ? 'grabbing' : 'grab'), touchAction: 'none' }}>
                  {renderNodeShape(node, isSelected)}
                  
                  {isSelected && !isSaving && isMobile && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      style={{ 
                        position: 'absolute', 
                        bottom: 'calc(100% + 40px)', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        display: 'flex', 
                        gap: '8px',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        padding: '6px',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        zIndex: 100
                      }}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsConnecting(!isConnecting); triggerHaptic('selection'); }}
                        style={{ width: '36px', height: '36px', borderRadius: '10px', background: isConnecting ? 'var(--pop-blue)' : '#f1f5f9', color: isConnecting ? 'white' : '#475569', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <ArrowRight size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteSelected(); }}
                        style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  )}

                  {isSelected && !isSaving && !isMobile && (
                    <div onPointerDown={(e) => { e.stopPropagation(); setResizingNode(node.id); e.target.setPointerCapture(e.pointerId); }} style={{ position: 'absolute', right: -10, bottom: -10, width: 28, height: 28, background: 'var(--pop-blue)', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 11, border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                       <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                    </div>
                  )}
                  {(node.charName || node.type === 'hub') && (
                    <div style={{ 
                      position: 'absolute', 
                      ...(node.charNamePos === 'top' ? { bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' } : 
                         node.charNamePos === 'left' ? { right: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)' } : 
                         node.charNamePos === 'right' ? { left: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)' } : 
                         { top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }),
                      background: 'white', borderRadius: '10px', 
                      fontSize: '13px', fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', 
                      fontFamily: 'var(--font-paper)', pointerEvents: 'none', 
                      display: 'block', 
                      textAlign: 'center',
                      lineHeight: '1',
                      padding: '8px 14px 10px',
                      zIndex: 1
                    }}>
                      {node.charName || (node.type === 'hub' ? 'Nexus' : '')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor Panel (Sidebar / Bottom Sheet) */}
        <AnimatePresence>
          {(selectedId || (showAddMenu && !isMobile)) && renderEditorSidebar()}
        </AnimatePresence>

      </div>

      {/* Add Character Drawer (Mobile-Only Floating) */}
      <AnimatePresence>
        {showAddMenu && isMobile && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }} 
            style={{ 
              position: 'fixed', 
              bottom: 0, left: 0, right: 0,
              background: 'white', 
              padding: '20px 20px 40px', 
              borderRadius: '32px 32px 0 0', 
              boxShadow: '0 -20px 60px rgba(0,0,0,0.2)', 
              zIndex: 10005, 
              width: '100%', 
              maxHeight: '80vh', 
              overflowY: 'auto',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            <div className="bottom-sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-paper)', fontSize: '1.25rem', color: '#1e293b' }}>Add to map</h4>
              <button onClick={() => setShowAddMenu(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '12px' }}>Elements</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <button className="character-card" onClick={handleAddGroup} style={{ border: '1px solid #e2e8f0' }}>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}><CircleDashed size={24} color="var(--pop-blue)" /></div>
                  <div style={{ fontSize: '11px', marginTop: '6px', fontWeight: 'bold' }}>Circle</div>
                </button>
                <button className="character-card" onClick={handleAddHub} style={{ border: '1px solid #e2e8f0' }}>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}><Share2 size={24} color="var(--pop-blue)" /></div>
                  <div style={{ fontSize: '11px', marginTop: '6px', fontWeight: 'bold' }}>Nexus</div>
                </button>
                <button className="character-card" onClick={handleAddMemo} style={{ border: '1px solid #e2e8f0' }}>
                  <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}><StickyNote size={24} color="#d97706" /></div>
                  <div style={{ fontSize: '11px', marginTop: '6px', fontWeight: 'bold' }}>Memo</div>
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '12px' }}>Characters</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
                {portraitData.map(p => (
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    key={p.name} 
                    onClick={() => handleAddCharacter(p.name)}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '6px', 
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '12px',
                      transition: 'background 0.2s',
                      background: '#f8fafc',
                      border: '1.5px solid #f1f5f9'
                    }}
                  >
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#475569', fontFamily: 'var(--font-paper)', textAlign: 'center', lineHeight: '1.2' }}>{p.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return isMobile ? createPortal(mapContent, document.body) : mapContent;
};

export default RelationshipMap;
