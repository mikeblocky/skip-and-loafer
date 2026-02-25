import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronLeft, ChevronRight, ArrowRightLeft,
    ZoomIn, ZoomOut, BookOpen, Layers, ArrowLeftToLine, ArrowRightToLine,
    AlignVerticalSpaceAround, SlidersHorizontal
} from 'lucide-react';

const MODE = { SINGLE: 'single', SPREAD: 'spread', SCROLL: 'scroll' };

/* No page-turn animation — simple instant swap */

/* ── Tiny floating button ── */
const Fab = ({ onClick, onPointerDown, active, disabled, children, size = 36, style = {} }) => (
    <motion.button
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        onPointerDown={(e) => { if (onPointerDown) { e.stopPropagation(); onPointerDown(e); } }}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.88 } : {}}
        style={{
            width: `${size}px`, height: `${size}px`, borderRadius: '10px',
            background: active ? 'rgba(255,158,198,0.22)' : 'rgba(255,255,255,0.07)',
            border: active ? '1.5px solid rgba(255,158,198,0.45)' : '1.5px solid rgba(255,255,255,0.1)',
            color: active ? '#ff9ec6' : disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)',
            cursor: disabled ? 'default' : 'pointer', pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: 'all 0.15s', flexShrink: 0,
            ...style,
        }}
    >{children}</motion.button>
);

const MangaReader = ({ chapter, pages, onClose, onNextChapter, onPrevChapter, isMobile }) => {
    const pKey = `skip_page_${chapter?.number}`;
    const [page, setPage] = useState(() => {
        const saved = localStorage.getItem(pKey);
        try { const p = saved ? Number(saved) : 0; return Math.max(0, Math.min(p, (pages?.length || 1) - 1)); } catch (e) { return 0; }
    });
    const [mode, setMode] = useState(() => localStorage.getItem('skip_mode') || MODE.SINGLE);
    const [rtl, setRtl] = useState(() => {
        const saved = localStorage.getItem('skip_rtl');
        return saved ? saved === 'true' : true;
    });

    useEffect(() => { localStorage.setItem(pKey, page); }, [page, pKey]);
    useEffect(() => { localStorage.setItem('skip_mode', mode); }, [mode]);
    useEffect(() => { localStorage.setItem('skip_rtl', rtl); }, [rtl]);
    const [zoom, setZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [turnDir, setTurnDir] = useState(1);
    const [showSlider, setShowSlider] = useState(false);
    const [showOverlay, setShowOverlay] = useState(true);
    const [previewPage, setPreviewPage] = useState(null);
    const [isNavHovered, setIsNavHovered] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [showEndPopup, setShowEndPopup] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });
    const hideRef = useRef(null);
    const total = pages.length;

    // Track scroll intersections
    const imgRefs = useRef([]);
    useEffect(() => {
        if (mode !== MODE.SCROLL) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setPage(Number(entry.target.dataset.index));
                }
            });
        }, { rootMargin: '-50% 0px -50% 0px' });

        const currentRefs = imgRefs.current;
        currentRefs.forEach(img => {
            if (img) observer.observe(img);
        });
        return () => {
            currentRefs.forEach(img => {
                if (img) observer.unobserve(img);
            });
            observer.disconnect();
        };
    }, [mode, pages]);

    // Scroll to current page when entering Scroll Mode
    useEffect(() => {
        if (mode === MODE.SCROLL) {
            const el = imgRefs.current[page];
            if (el) el.scrollIntoView({ behavior: 'instant' });
        }
    }, [mode]); // intentionally only running on mode change, not page change

    const spreadIdx = Math.floor(page / 2) * 2;
    const pL = spreadIdx;
    const pR = Math.min(spreadIdx + 1, total - 1);

    const nudge = useCallback(() => {
        setShowOverlay(true);
        clearTimeout(hideRef.current);
        hideRef.current = setTimeout(() => { setShowOverlay(false); }, 4000);
    }, []);
    useEffect(() => { nudge(); return () => clearTimeout(hideRef.current); }, [nudge]);

    const go = useCallback((delta, dir) => {
        setTurnDir(dir || (delta > 0 ? 1 : -1));
        setPage(p => {
            const next = p + delta;
            if (next >= total) {
                setShowEndPopup(true);
                return p;
            }
            return Math.max(0, Math.min(total - 1, next));
        });
    }, [total]);

    const doZoom = useCallback((d) => {
        setZoom(z => {
            const next = Math.max(0.5, Math.min(4, +(z + d).toFixed(2)));
            if (next === 1) setPanOffset({ x: 0, y: 0 });
            return next;
        });
    }, []);

    const resetZoom = useCallback(() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }, []);

    /* preload nearby images for fast loading */
    useEffect(() => {
        if (mode === MODE.SCROLL) {
            // In scroll mode, preload all pages
            pages.forEach(src => { const img = new Image(); img.src = src; });
        } else {
            // In single/spread, preload current ±3 pages
            for (let i = Math.max(0, page - 3); i <= Math.min(pages.length - 1, page + 3); i++) {
                const img = new Image(); img.src = pages[i];
            }
        }
    }, [pages, page, mode]);

    /* keyboard */
    useEffect(() => {
        const h = (e) => {
            if (e.target.tagName.toLowerCase() === 'input') return;
            nudge();
            const s = mode === MODE.SPREAD ? 2 : 1;
            if (e.key === 'ArrowRight') rtl ? go(-s, -1) : go(s, 1);
            else if (e.key === 'ArrowLeft') rtl ? go(s, 1) : go(-s, -1);
            else if (e.key === 'Escape') onClose();
            else if (e.key === '+' || e.key === '=') doZoom(0.25);
            else if (e.key === '-') doZoom(-0.25);
            else if (e.key === '0') resetZoom();
            else if (e.key === '1') { setMode(MODE.SINGLE); resetZoom(); }
            else if (e.key === '2') { setMode(MODE.SPREAD); resetZoom(); }
            else if (e.key === '3') { setMode(MODE.SCROLL); resetZoom(); }
            else if (e.key.toLowerCase() === 'r') setRtl(r => !r);
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [mode, rtl, go, doZoom, resetZoom, nudge, onClose]);

    /* ctrl+wheel */
    useEffect(() => {
        const h = (e) => { if (!e.ctrlKey) return; e.preventDefault(); doZoom(e.deltaY < 0 ? 0.15 : -0.15); };
        window.addEventListener('wheel', h, { passive: false });
        return () => window.removeEventListener('wheel', h);
    }, [doZoom]);

    /* pinch and pan */
    const activePointers = useRef(new Map());
    const initialPinchDist = useRef(null);
    const initialZoom = useRef(1);

    const onPD = (e) => {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);

        if (activePointers.current.size === 2) {
            setIsPanning(false);
            const pts = Array.from(activePointers.current.values());
            const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            initialPinchDist.current = dist;
            initialZoom.current = zoom;
        } else if (activePointers.current.size === 1) {
            if (zoom > 1) {
                setIsPanning(true);
                panStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
            }
        }
    };

    const onPM = (e) => {
        if (!activePointers.current.has(e.pointerId)) return;
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.current.size === 2) {
            const pts = Array.from(activePointers.current.values());
            const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            if (initialPinchDist.current) {
                const scale = dist / initialPinchDist.current;
                const nextZoom = Math.max(0.5, Math.min(4, +(initialZoom.current * scale).toFixed(2)));
                setZoom(nextZoom);
                if (nextZoom === 1) setPanOffset({ x: 0, y: 0 });
            }
        } else if (activePointers.current.size === 1 && isPanning) {
            setPanOffset({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
        }
    };

    const onPU = (e) => {
        activePointers.current.delete(e.pointerId);
        e.currentTarget.releasePointerCapture(e.pointerId);

        if (activePointers.current.size < 2) {
            initialPinchDist.current = null;
        }
        if (activePointers.current.size === 1 && zoom > 1) {
            const pt = Array.from(activePointers.current.values())[0];
            setIsPanning(true);
            panStart.current = { x: pt.x - panOffset.x, y: pt.y - panOffset.y };
        } else if (activePointers.current.size === 0) {
            setIsPanning(false);
        }
    };

    /* click zones */
    const handleTap = (e) => {
        if (mode === MODE.SCROLL || isPanning) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;

        // Edge navigation while zoomed
        if (zoom > 1) {
            if (pct < 0.15) {
                const s = mode === MODE.SPREAD ? 2 : 1;
                rtl ? go(s, 1) : go(-s, -1);
                setPanOffset({ x: 0, y: 0 });
            } else if (pct > 0.85) {
                const s = mode === MODE.SPREAD ? 2 : 1;
                rtl ? go(-s, -1) : go(s, 1);
                setPanOffset({ x: 0, y: 0 });
            }
            return;
        }

        if (pct > 0.3 && pct < 0.7) { nudge(); setShowOverlay(s => !s); return; }
        nudge();
        const s = mode === MODE.SPREAD ? 2 : 1;
        if (pct >= 0.7) { rtl ? go(-s, -1) : go(s, 1); }
        else { rtl ? go(s, 1) : go(-s, -1); }
    };


    const canPrev = rtl ? page < total - 1 : page > 0;
    const canNext = rtl ? page > 0 : page < total - 1;
    const btnSize = isMobile ? 44 : 40;
    const smallBtn = isMobile ? 34 : 36;
    const iconMain = isMobile ? 15 : 18;
    const iconSm = isMobile ? 13 : 15;

    /* progress bar helpers */
    const isScroll = mode === MODE.SCROLL;
    const effectiveRtl = isScroll ? false : rtl;
    const progressPct = total > 1 ? (page / (total - 1)) * 100 : 100;
    const handleProgressBar = (e, barEl) => {
        const rect = barEl.getBoundingClientRect();
        let pct = (e.clientX - rect.left) / rect.width;
        if (effectiveRtl) pct = 1 - pct;
        pct = Math.max(0, Math.min(1, pct));
        return Math.round(pct * (total - 1));
    };

    const showNav = showOverlay && !(isScroll && isAtBottom);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseMove={nudge} onTouchStart={nudge}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: '#0a0a0a',
                display: 'flex', flexDirection: 'column', userSelect: 'none',
                cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                touchAction: mode === MODE.SCROLL ? 'pan-y' : 'none'
            }}
        >
            {/* ═══ TOP-RIGHT: X ═══ */}
            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', top: isMobile ? '24px' : '12px', right: isMobile ? '8px' : '14px', zIndex: 100 }}
                    >
                        {/* Massive invisible hit area so the X button is extremely easy to tap */}
                        <div
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            style={{ padding: '24px', margin: '-12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'none' }}
                        >
                            <Fab onClick={onClose} size={btnSize} style={isMobile ? { background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' } : {}}>
                                <X size={iconMain} />
                            </Fab>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ TOP-LEFT: Chapter info ═══ */}
            <AnimatePresence>
                {showNav && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', top: isMobile ? '42px' : '16px',
                            left: isMobile ? 0 : '16px', right: isMobile ? 0 : 'auto', zIndex: 30,
                            display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '5px',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', pointerEvents: 'auto' }}>
                            <span style={{
                                fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.85rem' : '0.75rem',
                                fontWeight: 'bold', color: 'rgba(255,255,255,0.6)',
                            }}>
                                Chapter {chapter.number}
                                {chapter.title && (
                                    <span style={{
                                        fontSize: isMobile ? '0.7rem' : '0.62rem',
                                        color: 'rgba(255,255,255,0.3)', fontWeight: 'normal',
                                        maxWidth: isMobile ? '160px' : '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        marginLeft: '4px'
                                    }}> — {chapter.title}</span>
                                )}
                            </span>
                            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: isMobile ? '2px' : '0px' }}>
                                {mode === MODE.SPREAD ? `${spreadIdx + 1}–${Math.min(spreadIdx + 2, total)}` : page + 1} / {total}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ SIDE ARROWS < > ═══ */}
            {mode !== MODE.SCROLL && (
                <AnimatePresence>
                    {showNav && (
                        <>
                            {/* Left arrow */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute', left: isMobile ? '2px' : '6px',
                                    top: '50%', transform: 'translateY(-50%)', zIndex: 25,
                                }}
                            >
                                <Fab onClick={() => { const s = mode === MODE.SPREAD ? 2 : 1; rtl ? go(s, 1) : go(-s, -1); }}
                                    disabled={!canPrev} size={isMobile ? 44 : 42}
                                    style={{ background: isMobile ? 'transparent' : 'rgba(0,0,0,0.3)', border: 'none', color: isMobile ? 'rgba(255,255,255,0.15)' : undefined }}>
                                    <ChevronLeft size={isMobile ? 32 : 28} strokeWidth={1} />
                                </Fab>
                            </motion.div>
                            {/* Right arrow */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute', right: isMobile ? '2px' : '6px',
                                    top: '50%', transform: 'translateY(-50%)', zIndex: 25,
                                }}
                            >
                                <Fab onClick={() => { const s = mode === MODE.SPREAD ? 2 : 1; rtl ? go(-s, -1) : go(s, 1); }}
                                    disabled={!canNext} size={isMobile ? 44 : 42}
                                    style={{ background: isMobile ? 'transparent' : 'rgba(0,0,0,0.3)', border: 'none', color: isMobile ? 'rgba(255,255,255,0.15)' : undefined }}>
                                    <ChevronRight size={isMobile ? 32 : 28} strokeWidth={1} />
                                </Fab>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            )}

            {/* ═══ SINGLE ═══ */}
            {mode === MODE.SINGLE && (
                <div onClick={handleTap}
                    onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPU}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={pages[page]} alt={`${page + 1}`} draggable="false"
                        style={{
                            maxHeight: '100vh', maxWidth: '100vw', objectFit: 'contain',
                            display: 'block', margin: 'auto',
                            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                            transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            willChange: 'transform'
                        }} />
                </div>
            )}

            {/* ═══ SPREAD ═══ */}
            {mode === MODE.SPREAD && (
                <div onClick={handleTap}
                    onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPU}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex', gap: '0px',
                        alignItems: 'center', justifyContent: 'center',
                        direction: rtl ? 'rtl' : 'ltr',
                        transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                        transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        willChange: 'transform'
                    }}>
                        <img src={pages[pL]} alt={`${pL + 1}`} draggable="false"
                            style={{ maxHeight: '100vh', maxWidth: isMobile ? '49vw' : '49vw', objectFit: 'contain', margin: '0 -1px', display: 'block' }} />
                        {pL !== pR && (
                            <img src={pages[pR]} alt={`${pR + 1}`} draggable="false"
                                style={{ maxHeight: '100vh', maxWidth: isMobile ? '49vw' : '49vw', objectFit: 'contain', margin: '0 -1px', display: 'block' }} />
                        )}
                    </div>
                </div>
            )}

            {/* ═══ SCROLL ═══ */}
            {mode === MODE.SCROLL && (
                <div className="hide-scrollbar"
                    onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPU}
                    onScroll={(e) => {
                        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                        const atBottom = scrollHeight - scrollTop - clientHeight < 150;
                        if (atBottom !== isAtBottom) setIsAtBottom(atBottom);
                        if (scrollHeight - scrollTop - clientHeight <= 2) {
                            setShowEndPopup(true);
                        }
                    }}
                    style={{
                        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}>
                    <div style={{
                        transform: `scale(${zoom})`, transformOrigin: 'top center',
                        transition: 'transform 0.15s ease-out',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 0, lineHeight: 0, fontSize: 0,
                    }}>
                        {pages.map((p, i) => (
                            <img key={i} src={p} alt={`${i + 1}`} draggable="false"
                                ref={(el) => imgRefs.current[i] = el}
                                data-index={i}
                                loading="eager"
                                style={{ display: 'block', width: isMobile ? '100%' : '720px', maxWidth: '100%', objectFit: 'contain', margin: 0, padding: 0, verticalAlign: 'bottom', marginTop: i > 0 ? '-1px' : 0 }} />
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ BOTTOM CONTROLS ═══ */}
            <AnimatePresence>
                {showNav && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.12 }}
                        style={isMobile ? {
                            position: 'absolute', bottom: '50px',
                            left: '8px', right: '8px',
                            zIndex: 30, pointerEvents: 'none',
                        } : {
                            position: 'absolute', right: '60px', top: 'calc(50% - 150px)',
                            transform: 'translateY(-50%)',
                            zIndex: 30,
                        }}
                    >
                        {/* ─── UNIFIED CONTROL BAR ─── */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-end', width: '100%', pointerEvents: 'auto'
                        }}>
                            <div className="hide-scrollbar"
                                onMouseEnter={() => !isMobile && setIsNavHovered(true)}
                                onMouseLeave={() => !isMobile && setIsNavHovered(false)}
                                style={{
                                    display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: isMobile ? '4px' : '8px',
                                    background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(12px)',
                                    borderRadius: isMobile ? '16px' : '20px',
                                    padding: isMobile ? '6px 8px' : '10px 8px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    overflowX: isMobile ? 'auto' : 'visible',
                                    overflowY: isMobile ? 'visible' : 'auto',
                                    maxWidth: '100%', maxHeight: '100%'
                                }}>
                                {/* Modes */}
                                {[
                                    { m: MODE.SINGLE, I: BookOpen, label: 'Single', key: '1' },
                                    { m: MODE.SPREAD, I: Layers, label: 'Spread', key: '2' },
                                    { m: MODE.SCROLL, I: AlignVerticalSpaceAround, label: 'Scroll', key: '3' },
                                ].map(({ m, I, label, key }) => (
                                    <div key={m} style={{ position: 'relative' }}>
                                        <Fab active={mode === m} size={btnSize}
                                            onClick={() => { setMode(m); resetZoom(); }}>
                                            <I size={iconMain} />
                                        </Fab>
                                        {!isMobile && isNavHovered && (
                                            <div style={{
                                                position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '14px',
                                                background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(6px)', padding: '4px 8px', borderRadius: '6px',
                                                color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-hand)',
                                                whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                {label} <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>{key}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div style={{
                                    width: isMobile ? '1px' : '18px', height: isMobile ? '18px' : '1px',
                                    background: 'rgba(255,255,255,0.1)', margin: isMobile ? '0 2px' : '2px 0'
                                }} />

                                {/* RTL Toggle */}
                                <div style={{ position: 'relative' }}>
                                    <Fab onClick={() => setRtl(r => !r)} size={btnSize} style={isMobile ? { padding: '0 8px', width: 'auto' } : {}}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            {rtl ? <ArrowLeftToLine size={iconMain} /> : <ArrowRightToLine size={iconMain} />}
                                        </div>
                                    </Fab>
                                    {!isMobile && isNavHovered && (
                                        <div style={{
                                            position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '14px',
                                            background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(6px)', padding: '4px 8px', borderRadius: '6px',
                                            color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-hand)',
                                            whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            Direction <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>R</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    width: isMobile ? '1px' : '18px', height: isMobile ? '18px' : '1px',
                                    background: 'rgba(255,255,255,0.1)', margin: isMobile ? '0 2px' : '2px 0'
                                }} />

                                {/* Zoom */}
                                <div style={{ position: 'relative' }}>
                                    <Fab onClick={() => doZoom(-0.25)} disabled={zoom <= 0.5} size={btnSize}>
                                        <ZoomOut size={iconMain} />
                                    </Fab>
                                    {!isMobile && isNavHovered && (
                                        <div style={{
                                            position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '14px',
                                            background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(6px)', padding: '4px 8px', borderRadius: '6px',
                                            color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-hand)',
                                            whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            Zoom Out <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>-</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <Fab onClick={resetZoom} active={zoom !== 1} size={btnSize} style={isMobile ? { padding: '0 8px', width: 'auto' } : { height: 'auto', padding: '8px 0' }}>
                                        <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: isMobile ? '0.6rem' : '0.65rem' }}>
                                            {Math.round(zoom * 100)}%
                                        </span>
                                    </Fab>
                                    {!isMobile && isNavHovered && (
                                        <div style={{
                                            position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '14px',
                                            background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(6px)', padding: '4px 8px', borderRadius: '6px',
                                            color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-hand)',
                                            whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            Reset <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>0</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <Fab onClick={() => doZoom(0.25)} disabled={zoom >= 4} size={btnSize}>
                                        <ZoomIn size={iconMain} />
                                    </Fab>
                                    {!isMobile && isNavHovered && (
                                        <div style={{
                                            position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '14px',
                                            background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(6px)', padding: '4px 8px', borderRadius: '6px',
                                            color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-hand)',
                                            whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            Zoom In <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>+</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ PROGRESS BAR ═══ */}
            <AnimatePresence>
                {showNav && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.12 }}
                        style={{
                            position: 'absolute', bottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : 0,
                            left: isMobile ? '16px' : 0, right: isMobile ? '16px' : 0, zIndex: 40,
                            height: isMobile ? '36px' : '22px', cursor: 'pointer',
                            display: 'flex', alignItems: isMobile ? 'center' : 'flex-end',
                        }}
                        onPointerDown={(e) => {
                            const p = handleProgressBar(e, e.currentTarget);
                            setPreviewPage(p);
                            e.currentTarget.setPointerCapture(e.pointerId);
                        }}
                        onPointerMove={(e) => {
                            if (previewPage === null) return;
                            const p = handleProgressBar(e, e.currentTarget);
                            setPreviewPage(p);
                        }}
                        onPointerUp={(e) => {
                            if (previewPage !== null) {
                                if (mode === MODE.SCROLL) {
                                    imgRefs.current[previewPage]?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                    setTurnDir(previewPage > page ? 1 : -1);
                                    setPage(previewPage);
                                }
                                setPreviewPage(null);
                            }
                            e.currentTarget.releasePointerCapture(e.pointerId);
                        }}
                        onPointerCancel={() => setPreviewPage(null)}
                    >
                        {/* Preview tooltip */}
                        {previewPage !== null && (
                            <div style={{
                                position: 'absolute',
                                bottom: isMobile ? '40px' : '26px',
                                left: `${effectiveRtl ? 100 - (previewPage / (total - 1)) * 100 : (previewPage / (total - 1)) * 100}%`,
                                transform: 'translateX(-50%)',
                                background: 'rgba(20,20,20,0.92)', backdropFilter: 'blur(6px)',
                                borderRadius: '8px', padding: '4px 10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                pointerEvents: 'none', whiteSpace: 'nowrap',
                            }}>
                                <span style={{
                                    fontFamily: 'var(--font-hand)', fontSize: '0.75rem',
                                    fontWeight: 'bold', color: '#ff9ec6',
                                }}>{previewPage + 1} / {total}</span>
                            </div>
                        )}
                        {/* Track */}
                        <div style={{
                            width: '100%', height: isMobile ? '4px' : '6px',
                            background: 'rgba(255,255,255,0.25)',
                            borderRadius: '4px',
                            position: 'relative',
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, height: '100%',
                                left: effectiveRtl ? 'auto' : 0, right: effectiveRtl ? 0 : 'auto',
                                width: `${previewPage !== null ? (previewPage / (total - 1)) * 100 : progressPct}%`,
                                background: previewPage !== null ? '#ff9ec6' : 'rgba(255,158,198,0.85)',
                                borderRadius: '4px',
                                transition: previewPage !== null ? 'none' : 'width 0.15s ease-out',
                            }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ END POPUP ═══ */}
            <AnimatePresence>
                {showEndPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        style={{
                            position: 'absolute', top: isMobile ? '60px' : '40px', left: '50%',
                            zIndex: 10000,
                            background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,158,198,0.3)', borderRadius: '16px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: '12px', padding: '12px 16px',
                            width: 'auto', minWidth: 'min(280px, 90vw)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-hand)', color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>
                                Chapter {chapter.number} ended
                            </span>
                            <Fab onClick={() => setShowEndPopup(false)} size={28} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)' }}>
                                <X size={16} />
                            </Fab>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                            <Fab disabled={!onPrevChapter} onClick={() => { setShowEndPopup(false); onPrevChapter?.(); }} size={36} style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold', background: 'rgba(255,255,255,0.08)' }}>
                                Previous chapter
                            </Fab>
                            <Fab disabled={!onNextChapter} active={true} onClick={() => { setShowEndPopup(false); onNextChapter?.(); }} size={36} style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold' }}>
                                Next chapter
                            </Fab>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div >
    );
};

export default MangaReader;
