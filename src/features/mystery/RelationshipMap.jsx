import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, Download, Plus, Trash2, Settings2, ArrowRight, Type,
  X, Activity, Spline, Minus, Navigation, Circle, Square,
  Image as ImageIcon, Zap, Layers, Edit3, Grid, Map as MapIcon, 
  StickyNote, Waves, CircleDashed, Share2, UserPlus, Palette,
  Video, Maximize, Minimize
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { triggerHaptic } from '../../utils/haptics';
import GIF from 'gif.js';

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
  { id: 'dots', label: 'Dot Grid', bg: '#ffffff', css: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNjYmQ1ZTEiLz48L3N2Zz4=")', size: '30px 30px' },
  { id: 'grid', label: 'Blueprint', bg: '#f8fafc', css: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsIDE2MywgMTg0LCAwLjE1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+")', size: '40px 40px' },
  { id: 'paper', label: 'Lined Paper', bg: '#fffefc', css: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjMyIj48bGluZSB4MT0iMCIgeTE9IjMxIiB4Mj0iMTAwJSIgeTI9IjMxIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==")', size: '100% 32px' },
  { id: 'cork', label: 'Corkboard', bg: '#fef3c7', css: 'none', size: 'auto' },
];

// --- Geometry Helpers ---

const getNodeRadius = (node) => {
  if (!node) return 0;
  if (node.customRadius) return node.customRadius;
  if (node.type === 'hub') return node.size === 'large' ? 16 : 8;
  const sizeObj = NODE_SIZES.find(s => s.id === node.size) || NODE_SIZES[1];
  return sizeObj.px / 2;
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

const generatePath = (x1, y1, x2, y2, shape, offset) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (shape === 'curve') {
    if (dist === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const nx = dy / dist;
    const ny = -dx / dist;
    const curveOffset = offset !== undefined ? offset : Math.min(dist * 0.3, 120);
    const cx = (x1 + x2) / 2 + nx * curveOffset;
    const cy = (y1 + y2) / 2 + ny * curveOffset;
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  }
  
  if (shape === 'step') {
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`;
  }

  if (shape === 'zigzag') {
    if (dist < 20) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const zigs = Math.floor(dist / 18);
    const nx = dy / dist;
    const ny = -dx / dist;
    const amplitude = 12;
    let path = `M ${x1} ${y1}`;
    for (let i = 1; i < zigs; i++) {
      const t = i / zigs;
      const px = x1 + dx * t;
      const py = y1 + dy * t;
      const sign = i % 2 === 0 ? 1 : -1;
      path += ` L ${px + nx * amplitude * sign} ${py + ny * amplitude * sign}`;
    }
    path += ` L ${x2} ${y2}`;
    return path;
  }

  if (shape === 'wave') {
    if (dist < 30) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const waves = Math.floor(dist / 40);
    const step = 1 / waves;
    const nx = dy / dist * 15;
    const ny = -dx / dist * 15;
    let path = `M ${x1} ${y1}`;
    for (let i = 0; i < waves; i++) {
        const t0 = i * step;
        const t1 = (i + 1) * step;
        const tm = (t0 + t1) / 2;
        const px2 = x1 + dx * t1;
        const py2 = y1 + dy * t1;
        const pmx = x1 + dx * tm + (i % 2 === 0 ? nx : -nx);
        const pmy = y1 + dy * tm + (i % 2 === 0 ? ny : -ny);
        path += ` Q ${pmx} ${pmy} ${px2} ${py2}`;
    }
    return path;
  }

  return `M ${x1} ${y1} L ${x2} ${y2}`;
};

// --- Main Component ---

const RelationshipMap = ({ isMobile, portraitData, t }) => {
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

  // Interactive State
  const [draggingItems, setDraggingItems] = useState([]);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [resizingGroup, setResizingGroup] = useState(null);
  const [resizingNode, setResizingNode] = useState(null);
  const [resizingCurve, setResizingCurve] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(340);
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
        if (data.nodes) setNodes(data.nodes);
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
    setNodes([...nodes, { id: `hub-${Date.now()}`, type: 'hub', x, y, color: '#94a3b8', size: 'regular' }]);
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
        color: '#f472b6', style: 'solid', shape: 'straight', arrow: 'forward', thickness: 'regular', animated: false, label: ''
      };
      setLinks([...links, newLink]);
      setIsConnecting(false);
      clearSelection();
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
      
      const r1 = getNodeRadius(fromNode); const r2 = getNodeRadius(toNode);
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
      setSidebarWidth(Math.max(280, Math.min(800, newWidth)));
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
      const radius = getNodeRadius(node);
      return <div style={{ width: radius*2, height: radius*2, borderRadius: '50%', background: node.color, border: isSelected ? '4px solid #334155' : '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} />;
    }

    const src = characterMap[node.charName].src;
    const radius = getNodeRadius(node);
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
    if (!selectedId) return null;
    
    return (
      <AnimatePresence>
      <motion.div 
        initial={{ x: isMobile ? 0 : 300, y: isMobile ? 300 : 0, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: isMobile ? 0 : 300, y: isMobile ? 300 : 0, opacity: 0 }}
        style={{ 
          width: isMobile ? '100%' : `${sidebarWidth}px`, 
          height: isMobile ? '45vh' : 'calc(100% - 40px)',
          background: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(16px)',
          border: isMobile ? 'none' : '1px solid rgba(203, 213, 225, 0.5)',
          borderTop: isMobile ? '2px solid var(--pop-blue)' : '1px solid rgba(203, 213, 225, 0.5)',
          display: 'flex', flexDirection: 'column', zIndex: 1000, 
          position: isMobile ? 'fixed' : 'absolute', 
          bottom: 0,
          right: isMobile ? 0 : 20, 
          top: isMobile ? 'auto' : 0,
          borderRadius: isMobile ? '32px 32px 0 0' : '24px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        {isMobile && (
          <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '12px auto 0', flexShrink: 0 }} />
        )}
        {!isMobile && (
          <div 
            onPointerDown={(e) => {
              e.stopPropagation();
              setDraggingItems([{ id: 'sidebar', type: 'sidebar' }]);
              e.target.setPointerCapture(e.pointerId);
            }}
            style={{ position: 'absolute', left: -4, top: 0, bottom: 0, width: 8, cursor: 'col-resize', zIndex: 110 }}
          />
        )}
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontFamily: 'var(--font-paper)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings2 size={18}/> {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Properties
          </h3>
          <button onClick={clearSelection} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {selectedType === 'link' && (() => {
            const link = links.find(l => l.id === selectedId);
            if (!link) return null;
            return (
              <>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Label</div>
                  <input value={link.label} onChange={(e) => updateItemProperty(links, setLinks, selectedId, 'label', e.target.value)} placeholder="Relationship text..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-paper)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Color</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {PALETTE.map(c => <button key={c.name} onClick={() => updateItemProperty(links, setLinks, selectedId, 'color', c.color)} style={{ aspectRatio: '1', background: c.color, border: 'none', borderRadius: '50%', cursor: 'pointer', boxShadow: link.color === c.color ? `0 0 0 3px white, 0 0 0 5px ${c.color}` : 'none' }} /> )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Path Shape</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {LINE_SHAPES.map(s => { const Icon = s.icon; return <button key={s.id} onClick={() => updateItemProperty(links, setLinks, selectedId, 'shape', s.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', fontSize: '12px', fontWeight: 'bold', background: link.shape === s.id ? 'var(--pop-blue)' : 'white', color: link.shape === s.id ? 'white' : '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}> <Icon size={16} /> {s.label} </button>; })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Line Style</div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    {LINE_STYLES.map(s => <button key={s.id} onClick={() => updateItemProperty(links, setLinks, selectedId, 'style', s.id)} style={{ flex: 1, padding: '8px 4px', fontSize: '12px', fontWeight: 'bold', background: link.style === s.id ? '#cbd5e1' : 'white', color: link.style === s.id ? '#0f172a' : '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>{s.label}</button> )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {LINE_THICKNESS.map(s => <button key={s.id} onClick={() => updateItemProperty(links, setLinks, selectedId, 'thickness', s.id)} style={{ flex: 1, padding: '8px 4px', fontSize: '12px', fontWeight: 'bold', background: link.thickness === s.id ? '#cbd5e1' : 'white', color: link.thickness === s.id ? '#0f172a' : '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>{s.label}</button> )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Arrows</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {ARROW_MODES.map(s => <button key={s.id} onClick={() => updateItemProperty(links, setLinks, selectedId, 'arrow', s.id)} style={{ flex: 1, padding: '8px 4px', fontSize: '12px', fontWeight: 'bold', background: link.arrow === s.id ? '#cbd5e1' : 'white', color: link.arrow === s.id ? '#0f172a' : '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>{s.label}</button> )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Effects</div>
                  <button onClick={() => updateItemProperty(links, setLinks, selectedId, 'animated', !link.animated)} style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 'bold', background: link.animated ? 'var(--pop-pink)' : 'white', color: link.animated ? 'white' : '#475569', border: link.animated ? 'none' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}><Zap size={18}/> Energy Flow</button>
                </div>
              </>
            );
          })()}

          {selectedType === 'node' && (() => {
            const node = nodes.find(n => n.id === selectedId);
            if (!node) return null;
            if (node.type === 'hub') {
              return (
                <>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Nexus Size</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {HUB_SIZES.map(s => <button key={s.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'size', s.id)} style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 'bold', background: node.size === s.id ? 'var(--pop-blue)' : 'white', color: node.size === s.id ? 'white' : '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>{s.label}</button> )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Color Theme</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {PALETTE.map(c => <button key={c.name} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'color', c.color)} style={{ aspectRatio: '1', background: c.color, border: 'none', borderRadius: '50%', cursor: 'pointer', boxShadow: node.color === c.color ? `0 0 0 3px white, 0 0 0 5px ${c.color}` : 'none' }} /> )}
                    </div>
                  </div>
                </>
              );
            }
            return (
              <>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Frame Shape</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {NODE_SHAPES.map(s => { const Icon = s.icon; return <button key={s.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'shape', s.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 4px', fontSize: '12px', fontWeight: 'bold', background: node.shape === s.id ? 'var(--pop-blue)' : 'white', color: node.shape === s.id ? 'white' : '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}> <Icon size={18} /> {s.label} </button>; })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Border Color</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    <button onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'borderColor', '#e2e8f0')} style={{ aspectRatio: '1', background: '#e2e8f0', border: 'none', borderRadius: '50%', cursor: 'pointer', boxShadow: (!node.borderColor || node.borderColor === '#e2e8f0') ? `0 0 0 3px white, 0 0 0 5px #e2e8f0` : 'none' }} title="Default" />
                    {PALETTE.slice(0,9).map(c => <button key={c.name} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'borderColor', c.color)} style={{ aspectRatio: '1', background: c.color, border: 'none', borderRadius: '50%', cursor: 'pointer', boxShadow: node.borderColor === c.color ? `0 0 0 3px white, 0 0 0 5px ${c.color}` : 'none' }} /> )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Avatar Size</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {NODE_SIZES.map(s => <button key={s.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'size', s.id)} style={{ flex: 1, padding: '8px 4px', fontSize: '12px', fontWeight: 'bold', background: node.size === s.id ? '#cbd5e1' : 'white', color: node.size === s.id ? '#0f172a' : '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>{s.label}</button> )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Animation</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {NODE_ANIMATIONS.map(s => <button key={s.id} onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'animation', s.id)} style={{ flex: 1, padding: '8px 4px', fontSize: '12px', fontWeight: 'bold', background: node.animation === s.id ? 'var(--pop-pink)' : 'white', color: node.animation === s.id ? 'white' : '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>{s.label}</button> )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Name Position</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'top', label: 'Top' },
                      { id: 'bottom', label: 'Bottom' }
                    ].map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => updateItemProperty(nodes, setNodes, selectedId, 'charNamePos', p.id)} 
                        style={{ 
                          flex: 1, padding: '10px', fontSize: '13px', fontWeight: 'bold', 
                          background: (node.charNamePos || 'bottom') === p.id ? 'var(--pop-blue)' : 'white', 
                          color: (node.charNamePos || 'bottom') === p.id ? 'white' : '#64748b', 
                          border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' 
                        }}
                      >
                        {p.label}
                      </button> 
                    ))}
                  </div>
                </div>
              </>
            );
          })()}

          {selectedType === 'group' && (() => {
            const group = groups.find(g => g.id === selectedId);
            if (!group) return null;
            return (
              <>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Circle Name</div>
                  <input value={group.title} onChange={(e) => updateItemProperty(groups, setGroups, selectedId, 'title', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '15px', fontFamily: 'var(--font-paper)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Name Position</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'top', label: 'Top' },
                      { id: 'left', label: 'Left' },
                      { id: 'right', label: 'Right' },
                      { id: 'bottom', label: 'Bottom' }
                    ].map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => updateItemProperty(groups, setGroups, selectedId, 'titlePosition', p.id)} 
                        style={{ 
                          padding: '10px 2px', fontSize: '11px', fontWeight: 'bold', 
                          background: (group.titlePosition || 'top') === p.id ? 'var(--pop-blue)' : 'white', 
                          color: (group.titlePosition || 'top') === p.id ? 'white' : '#64748b', 
                          border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' 
                        }}
                      >
                        {p.label}
                      </button> 
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Area Shape</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                    <button onClick={() => updateItemProperty(groups, setGroups, selectedId, 'shape', 'circle')} style={{ padding: '10px', fontSize: '12px', fontWeight: 'bold', background: group.shape === 'circle' ? 'var(--pop-blue)' : 'white', color: group.shape === 'circle' ? 'white' : '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}><Circle size={16} style={{display:'inline', verticalAlign:'middle'}}/> Circle</button>
                    <button onClick={() => updateItemProperty(groups, setGroups, selectedId, 'shape', 'rect')} style={{ padding: '10px', fontSize: '12px', fontWeight: 'bold', background: group.shape === 'rect' ? 'var(--pop-blue)' : 'white', color: group.shape === 'rect' ? 'white' : '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}><Square size={16} style={{display:'inline', verticalAlign:'middle'}}/> Rectangle</button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Color Theme</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {GROUP_COLORS.map((c, i) => <button key={c.name} onClick={() => updateItemProperty(groups, setGroups, selectedId, 'colorIndex', i)} style={{ aspectRatio: '1', background: c.border, border: 'none', borderRadius: '50%', cursor: 'pointer', boxShadow: group.colorIndex === i ? `0 0 0 3px white, 0 0 0 5px ${c.border}` : 'none' }} /> )}
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#475569', display: 'flex', gap: '8px' }}>
                   <MapIcon size={16} /> Tip: Dragging a Circle will also move all people and memos placed inside it! Drag the bottom right corner of the circle to resize it.
                </div>
              </>
            );
          })()}

          {selectedType === 'memo' && (() => {
            const memo = memos.find(m => m.id === selectedId);
            if (!memo) return null;
            return (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Memo Color</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {PALETTE.map(c => <button key={c.name} onClick={() => updateItemProperty(memos, setMemos, selectedId, 'color', c.color)} style={{ aspectRatio: '1', background: c.color, border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: memo.color === c.color ? `0 0 0 3px white, 0 0 0 5px #cbd5e1` : 'none' }} /> )}
                </div>
              </div>
            );
          })()}
        </div>
      </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div ref={containerRef} className={`relationship-map mystery-ui ${isFullscreen ? 'is-fullscreen' : ''}`} style={{ 
      display: 'flex', flexDirection: 'column', 
      ...(isFullscreen || isMobile ? {
        background: '#f8fafc', height: isMobile ? '100dvh' : '100vh', width: '100vw',
        position: isMobile ? 'fixed' : 'relative', top: 0, left: 0, zIndex: 1000
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
        `}
      </style>

      {/* Toolbar */}
      {!isSaving && (
        <motion.div initial={{ y: isMobile ? 50 : -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="hide-scroll" style={{ 
          display: 'flex', overflowX: 'auto', gap: isMobile ? '4px' : '8px', padding: isMobile ? '8px 10px' : '12px', 
          background: 'rgba(255,255,255,0.98)', borderBottom: isMobile ? 'none' : '2px solid #e2e8f0',
          borderTop: isMobile ? '1px solid #e2e8f0' : 'none',
          alignItems: 'center', WebkitOverflowScrolling: 'touch', flexShrink: 0,
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 0 : 'auto',
          top: isMobile ? 'auto' : 0,
          left: 0, right: 0, zIndex: 500,
          boxShadow: isMobile ? '0 -4px 15px rgba(0,0,0,0.1)' : 'none'
        }}>
          <button onClick={() => setShowAddMenu(!showAddMenu)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '6px 10px' : '8px 14px', background: 'var(--pop-pink)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: isMobile ? '12px' : '14px' }}>
            <UserPlus size={isMobile ? 14 : 16} /> Person
          </button>
          <button onClick={handleAddGroup} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '6px 10px' : '8px 14px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: isMobile ? '12px' : '14px' }}>
            <CircleDashed size={isMobile ? 14 : 16} /> Circle
          </button>
          <button onClick={handleAddHub} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '6px 10px' : '8px 14px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: isMobile ? '12px' : '14px' }}>
            <Share2 size={isMobile ? 14 : 16} /> Nexus
          </button>
          <button onClick={handleAddMemo} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '6px 10px' : '8px 14px', background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: '8px', color: '#d97706', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: isMobile ? '12px' : '14px' }}>
            <StickyNote size={isMobile ? 14 : 16} /> Memo
          </button>
          
          <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 2px' }} />

          <button onClick={() => { if (selectedType === 'node') { setIsConnecting(!isConnecting); } else alert("Select a character or nexus first!"); }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '6px 10px' : '8px 14px', background: isConnecting ? 'var(--pop-blue)' : 'white', border: isConnecting ? '1.5px solid var(--pop-blue)' : '1.5px solid #cbd5e1', borderRadius: '8px', color: isConnecting ? 'white' : '#4b5563', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: isMobile ? '12px' : '14px' }}
          >
            <ArrowRight size={isMobile ? 14 : 16} /> {isConnecting ? (isMobile ? "Tap..." : "Tap target...") : "Link"}
          </button>

          {selectedId && (
            <button onClick={deleteSelected} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#fee2e2', border: '1.5px solid #fecaca', borderRadius: '10px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Trash2 size={16} />
            </button>
          )}

          <div style={{ flex: 1, minWidth: '20px' }} />

          <button onClick={toggleFullscreen} style={{ display: 'flex', alignItems: 'center', padding: '8px', background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          <button onClick={() => setShowMapSettings(!showMapSettings)} style={{ display: 'flex', alignItems: 'center', padding: '8px', background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '10px', color: '#475569', cursor: 'pointer', position: 'relative' }}>
            <MapIcon size={18} />
          </button>
          <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', padding: '8px', background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}>
            <RotateCcw size={18} />
          </button>
          <button onClick={handleSaveImage} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '6px 10px' : '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: isMobile ? '12px' : '14px' }}>
            <Download size={isMobile ? 14 : 18} /> PNG
          </button>
          {/* <button onClick={handleSaveGif} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'white', border: '2px solid var(--pop-blue)', borderRadius: '10px', color: 'var(--pop-blue)', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Video size={18} /> GIF
          </button> */}
        </motion.div>
      )}

      {/* Main Area: Canvas + Editor */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden', position: 'relative', marginBottom: isMobile ? '60px' : 0 }}>
        
        {/* Settings Overlay */}
        <AnimatePresence>
          {showMapSettings && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: 'absolute', right: 20, top: 20, background: 'white', padding: 24, borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 1000, width: 300, border: '2px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-paper)', fontSize: '1.4rem', color: '#1e293b' }}>Map Settings</h4>
                <button onClick={() => setShowMapSettings(false)} style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Canvas Background</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {BACKGROUNDS.map(bg => (
                    <button key={bg.id} onClick={() => setBgStyle(bg.id)} style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', background: bgStyle === bg.id ? 'var(--pop-blue)' : '#f8fafc', color: bgStyle === bg.id ? 'white' : '#475569', border: bgStyle === bg.id ? 'none' : '1.5px solid #e2e8f0', fontWeight: 'bold', fontSize: '1rem', fontFamily: 'var(--font-paper)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s ease' }}>
                      <Grid size={18} /> {bg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Custom Solid Color</div>
                <input type="color" value={customBgColor} onChange={(e) => { setBgStyle('custom'); setCustomBgColor(e.target.value); }} style={{ width: '100%', height: '48px', border: 'none', borderRadius: '12px', cursor: 'pointer', padding: 0 }} />
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
            <div className="map-board-title" onPointerDown={(e) => handleItemPointerDown(e, 'title', 'title')} style={{ position: 'absolute', top: titlePos.y, left: titlePos.x, transform: 'translateX(-50%)', zIndex: 10, width: 'max-content', maxWidth: 'min(1400px, 90vw)', cursor: draggingItems.some(i=>i.id==='title') ? 'grabbing' : 'grab' }}>
              {!isSaving && isEditingTitle ? (
                <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '16px', padding: '12px 24px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', borderBottom: '4px dashed var(--pop-blue)', display: 'flex', justifyContent: 'center' }}>
                  <input autoFocus value={boardTitle} onChange={(e) => setBoardTitle(e.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)} style={{ fontFamily: 'var(--font-paper)', fontSize: '2.4rem', textAlign: 'center', background: 'transparent', border: 'none', color: '#1e293b', outline: 'none', width: 'auto', minWidth: '300px' }} />
                </div>
              ) : (
                <div onClick={() => !isSaving && setIsEditingTitle(true)} style={{ textAlign: 'center', padding: '12px 40px', borderRadius: '20px', background: isSaving ? 'transparent' : 'rgba(255,255,255,0.7)', backdropFilter: isSaving ? 'none' : 'blur(8px)', textShadow: isSaving ? '0 2px 10px rgba(255,255,255,0.9)' : 'none', border: isSaving ? 'none' : '1px solid rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontFamily: 'var(--font-paper)', color: '#1e293b', margin: 0, fontSize: isSaving ? '2rem' : '2.4rem', cursor: isSaving ? 'default' : 'pointer', display: 'inline-block', textAlign: 'center' }}>
                    {boardTitle}
                  </h2>
                  {!isSaving && <Edit3 size={24} color="var(--pop-blue)" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '12px' }} />}
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
                    ...(group.titlePosition === 'bottom' ? { top: 'calc(100% + 4px)', left: '50%', transform: 'translateX(-50%)' } : 
                       group.titlePosition === 'left' ? { right: 'calc(100% + 4px)', top: '50%', transform: 'translateY(-50%)' } : 
                       group.titlePosition === 'right' ? { left: 'calc(100% + 4px)', top: '50%', transform: 'translateY(-50%)' } : 
                       { bottom: 'calc(100% + 4px)', left: '50%', transform: 'translateX(-50%)' }),
                    background: 'white', 
                    padding: '0 16px', 
                    height: '32px',
                    borderRadius: '20px', 
                    border: `2px solid ${c.border}`, 
                    color: '#334155', 
                    fontWeight: 'bold', 
                    fontFamily: 'var(--font-paper)', 
                    fontSize: '1.1rem', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', 
                    display: 'block', 
                    textAlign: 'center',
                    lineHeight: '32px',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}>
                    {group.title}
                  </div>
                  {isSelected && !isSaving && (
                    <div onPointerDown={(e) => handleResizePointerDown(e, group.id)} style={{ position: 'absolute', right: -6, bottom: -6, width: 24, height: 24, background: 'var(--pop-blue)', border: '3px solid white', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
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

                const r1 = getNodeRadius(fromNode);
                const r2 = getNodeRadius(toNode);
                const cx1 = fromNode.x + r1; const cy1 = fromNode.y + r1;
                const cx2 = toNode.x + r2; const cy2 = toNode.y + r2;

                const { ax, ay, bx, by } = getAdjustedEndpoints(cx1, cy1, cx2, cy2, r1 + 4, r2 + 4);
                const dPath = generatePath(ax, ay, bx, by, link.shape || 'straight', link.curveOffset);
                const mid = getMidpoint(ax, ay, bx, by, link.shape || 'straight', link.curveOffset);

                return (
                  <g key={link.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); triggerHaptic('selection'); selectItem(link.id, 'link'); }}>
                    {isSelected && <path d={dPath} stroke={link.color} strokeWidth={thicknessInfo.width + 6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3" />}
                    <path className={link.animated ? "anim-line" : ""} d={dPath} stroke={link.color} strokeWidth={thicknessInfo.width} strokeDasharray={link.animated && !isSaving ? '12 12' : style?.dash} markerEnd={link.arrow !== 'none' ? `url(#arrow-${link.color.replace('#', '')})` : ''} markerStart={link.arrow === 'both' ? `url(#arrow-start-${link.color.replace('#', '')})` : ''} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: link.animated && !isSaving ? 'mapLineFlow 0.8s linear infinite' : 'none' }} />
                    <path d={dPath} stroke="transparent" strokeWidth="30" fill="none" />
                    {link.label && (() => {
                      const dx = bx - ax; const dy = by - ay;
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const nx = dist > 0 ? dy / dist : 0;
                      const ny = dist > 0 ? -dx / dist : -1;
                      const labelOffset = 25;
                      const lx = mid.x + nx * labelOffset;
                      const ly = mid.y + ny * labelOffset;
                      return (
                        <g transform={`translate(${lx}, ${ly})`}>
                          <rect x={-(link.label.length * 4.5 + 12)} y="-14" width={link.label.length * 9 + 24} height="28" fill="white" rx="14" stroke={link.color} strokeWidth="2" />
                          <text x="0" y="5" fill={link.color} style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-paper)', textAnchor: 'middle' }}>{link.label}</text>
                        </g>
                      );
                    })()}
                    {isSelected && link.shape === 'curve' && !isSaving && (
                      <circle cx={mid.x} cy={mid.y} r="10" fill="white" stroke={link.color} strokeWidth="3" style={{ cursor: 'crosshair' }} onPointerDown={(e) => { e.stopPropagation(); handleCurvePointerDown(e, link.id); }} />
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
              </div>
            ))}

            {/* Nodes & Hubs Layer */}
            {nodes.map(node => {
              const size = getNodeRadius(node) * 2;
              const isSelected = selectedId === node.id;
              return (
                <div className={node.animation !== 'none' ? "anim-node" : ""} data-anim={node.animation} key={node.id} onPointerDown={(e) => handleItemPointerDown(e, node.id, 'node')} style={{ position: 'absolute', left: node.x, top: node.y, width: size, height: size, zIndex: isSelected ? 10 : 2, cursor: isConnecting ? 'crosshair' : (draggingItems.some(i=>i.id===node.id) ? 'grabbing' : 'grab'), touchAction: 'none' }}>
                  {renderNodeShape(node, isSelected)}
                  {isSelected && !isSaving && (
                    <div onPointerDown={(e) => { e.stopPropagation(); setResizingNode(node.id); e.target.setPointerCapture(e.pointerId); }} style={{ position: 'absolute', right: -10, bottom: -10, width: 28, height: 28, background: 'var(--pop-blue)', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 11, border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                       <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                    </div>
                  )}
                  {node.type === 'character' && (
                    <div style={{ 
                      position: 'absolute', 
                      ...(node.charNamePos === 'top' ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
                      left: '50%', transform: 'translateX(-50%)', 
                      background: 'white', padding: '0 14px', height: '28px', borderRadius: '10px', 
                      fontSize: '13px', fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', 
                      fontFamily: 'var(--font-paper)', pointerEvents: 'none', 
                      display: 'block', textAlign: 'center', lineHeight: '28px'
                    }}>
                      {node.charName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor Panel (Sidebar / Bottom Sheet) */}
        {renderEditorSidebar()}

      </div>

      {/* Add Character Overlay (Absolute Center) */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} style={{ position: 'fixed', top: isMobile ? '12px' : '20%', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: isMobile ? '16px' : '24px', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 1001, width: isMobile ? '94vw' : '360px', maxHeight: isMobile ? '70vh' : '60vh', overflowY: 'auto', border: '2px solid var(--pop-pink)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-paper)', fontSize: isMobile ? '1.2rem' : '1.4rem', color: '#1e293b' }}>Add Character</h4>
              <button onClick={() => setShowAddMenu(false)} style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? '8px' : '12px' }}>
              {portraitData.map(p => (
                <div key={p.name} onClick={() => handleAddCharacter(p.name)} style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.1s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', border: '2.5px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}><img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                  <div style={{ fontSize: '12px', marginTop: '8px', fontWeight: 'bold', color: '#475569', fontFamily: 'var(--font-paper)' }}>{p.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RelationshipMap;
