/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronLeft, ChevronRight, ArrowRightLeft,
    ZoomIn, ZoomOut, BookOpen, Layers, ArrowLeftToLine, ArrowRightToLine,
    AlignVerticalSpaceAround, SlidersHorizontal, SkipBack, StepBack, StepForward, ArrowUpToLine,
    File
} from 'lucide-react';

const MODE = { SINGLE: 'single', SPREAD: 'spread', SCROLL: 'scroll' };

const FallbackImage = ({ src, forwardedRef, ...props }) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        setCurrentSrc(src);
        setAttempts(0);
    }, [src]);

    const handleError = () => {
        if (attempts === 0) {
            setCurrentSrc(prev => prev.endsWith('.jpg') ? prev.replace('.jpg', '.png') : prev.replace('.png', '.jpg'));
            setAttempts(1);
        } else if (attempts === 1) {
            setCurrentSrc(prev => prev.replace(/\.(jpg|png)$/, '.jpeg'));
            setAttempts(2);
        } else if (attempts === 2) {
            setCurrentSrc(prev => prev.replace(/\.jpeg$/, '.webp'));
            setAttempts(3);
        }
    };

    return <img src={currentSrc} ref={forwardedRef} onError={handleError} {...props} />;
};

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

const MangaReader = ({ chapter, pages, onClose, onNextChapter, onPrevChapter, isMobile, onChapterFinished, getRemainingCooldown }) => {
    const pKey = `skip_page_${chapter?.number}`;
    const [page, setPage] = useState(() => {
        const saved = localStorage.getItem(pKey);
        try {
            const p = saved ? Number(saved) : 0;
            const lastPageIndex = (pages?.length || 1) - 1;
            // If the user previously finished this chapter (left off on the last page), reset to beginning
            if (p === lastPageIndex && lastPageIndex > 0) return 0;
            return Math.max(0, Math.min(p, lastPageIndex));
        } catch (e) { return 0; }
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
    const [isWheeling, setIsWheeling] = useState(false);
    const [showOverlay, setShowOverlay] = useState(true);
    const [previewPage, setPreviewPage] = useState(null);
    const [isNavHovered, setIsNavHovered] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [showEndPopup, setShowEndPopup] = useState(false);
    const [autoNextCountdown, setAutoNextCountdown] = useState(15);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const panStart = useRef({ x: 0, y: 0 });
    const hideRef = useRef(null);
    const total = pages.length;

    // Track if we've already marked this chapter finished to prevent rapid-fire increments
    const hasMarkedFinishedRef = useRef(false);
    useEffect(() => {
        hasMarkedFinishedRef.current = false;
    }, [chapter?.number]);

    // Mark chapter as finished when end popup shows
    useEffect(() => {
        if (showEndPopup && onChapterFinished && !hasMarkedFinishedRef.current) {
            hasMarkedFinishedRef.current = true;
            onChapterFinished(chapter.number);

            // Instantly sync the local cooldown state so the UI exactly matches reality
            if (getRemainingCooldown) {
                setCooldownRemaining(getRemainingCooldown(chapter.number));
            }
        }
    }, [showEndPopup, onChapterFinished, chapter.number, getRemainingCooldown]);

    // Auto-advance & Cooldown countdowns
    useEffect(() => {
        let timer;
        let cdTimer;

        if (showEndPopup) {
            // Auto Next
            timer = setInterval(() => {
                setAutoNextCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setShowEndPopup(false);
                        if (onNextChapter) {
                            onNextChapter();
                        } else if (onClose) {
                            onClose();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Read Cooldown Tracking
            if (getRemainingCooldown) {
                const initialCd = getRemainingCooldown(chapter.number);
                setCooldownRemaining(initialCd);
                if (initialCd > 0) {
                    cdTimer = setInterval(() => {
                        setCooldownRemaining(prev => {
                            if (prev <= 1) {
                                clearInterval(cdTimer);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                }
            }
        } else {
            setAutoNextCountdown(15);
            // Don't arbitrarily reset cooldownRemaining here so it doesn't flash 0 if quickly reopened
        }
        return () => {
            clearInterval(timer);
            clearInterval(cdTimer);
        };
    }, [showEndPopup, onNextChapter, getRemainingCooldown, chapter.number]);

    const isModeSwitching = useRef(false);

    // Track scroll intersections
    const imgRefs = useRef([]);
    useEffect(() => {
        if (mode !== MODE.SCROLL) return;
        const observer = new IntersectionObserver((entries) => {
            if (isModeSwitching.current) return;
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
            isModeSwitching.current = true;
            const scrollToPage = () => {
                const el = imgRefs.current[page];
                if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
            };
            scrollToPage();

            // Try again after a short delay to account for image loading expanding the container
            const t = setTimeout(() => {
                scrollToPage();
                isModeSwitching.current = false;
            }, 300);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]); // intentionally only running on mode change, not page change

    const scrollContainerRef = useRef(null);
    const prevZoom = useRef(zoom);

    useLayoutEffect(() => {
        if (mode === MODE.SCROLL && scrollContainerRef.current && zoom !== prevZoom.current) {
            const el = scrollContainerRef.current;
            const ratio = zoom / prevZoom.current;
            const centerY = el.scrollTop + el.clientHeight / 2;
            el.scrollTop = centerY * ratio - el.clientHeight / 2;
        }
        prevZoom.current = zoom;
    }, [zoom, mode]);

    const spreadIdx = Math.floor(page / 2) * 2;
    const pL = spreadIdx;
    const pR = Math.min(spreadIdx + 1, total - 1);

    const nudge = useCallback(() => {
        setShowOverlay(true);
        clearTimeout(hideRef.current);
        hideRef.current = setTimeout(() => { setShowOverlay(false); }, 4000);
    }, []);

    useEffect(() => { nudge(); return () => clearTimeout(hideRef.current); }, [nudge]);

    const go = useCallback((delta) => {
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
            const next = Math.max(0.5, Math.min(4, +(z + d).toFixed(3)));
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
            if (e.key === 'ArrowRight') rtl ? go(-s) : go(s);
            else if (e.key === 'ArrowLeft') rtl ? go(s) : go(-s);
            else if (e.key === 'Escape') onClose();
            else if (e.key === '+' || e.key === '=') { if (e.ctrlKey || e.metaKey) e.preventDefault(); doZoom(0.25); }
            else if (e.key === '-') { if (e.ctrlKey || e.metaKey) e.preventDefault(); doZoom(-0.25); }
            else if (e.key === '0') { if (e.ctrlKey || e.metaKey) e.preventDefault(); resetZoom(); }
            else if (e.key === '1') { setMode(MODE.SINGLE); resetZoom(); }
            else if (e.key === '2') { setMode(MODE.SPREAD); resetZoom(); }
            else if (e.key === '3') { setMode(MODE.SCROLL); resetZoom(); }
            else if (e.key.toLowerCase() === 'r') setRtl(r => !r);
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [mode, rtl, go, doZoom, resetZoom, nudge, onClose]);

    /* prevent native pinch-to-zoom and ctrl-wheel scaling on the body, allow trackpad panning */
    const wheelTimeout = useRef(null);
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                setIsWheeling(true);
                clearTimeout(wheelTimeout.current);
                wheelTimeout.current = setTimeout(() => setIsWheeling(false), 150);

                // Trackpad pinch zoom scaling map. 0.005 makes it smoother and less aggressive.
                doZoom(-e.deltaY * 0.005);
            } else {
                if (mode === 'scroll') return;
                e.preventDefault();
                // Discrete mouse wheel usually has 0 deltaX and larger integer deltaY
                const isMouseWheel = Math.abs(e.deltaX) === 0 && Math.abs(e.deltaY) >= 30;

                if (isMouseWheel || zoom === 1) {
                    // Smooth mouse wheel zoom
                    // We purposely do NOT set isWheeling here so the CSS transition handles smoothing.
                    doZoom(e.deltaY > 0 ? -0.25 : 0.25);
                } else if (zoom > 1) {
                    // Trackpad two-finger panning for Single/Spread modes
                    setIsWheeling(true);
                    clearTimeout(wheelTimeout.current);
                    wheelTimeout.current = setTimeout(() => setIsWheeling(false), 150);

                    setPanOffset(prev => ({
                        x: prev.x - e.deltaX,
                        y: prev.y - e.deltaY
                    }));
                }
            }
        };
        // must be added as passive: false to prevent default
        document.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            document.removeEventListener('wheel', handleWheel);
        };
    }, [doZoom, zoom, mode]);

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
        if (isPanning) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;

        if (mode === MODE.SCROLL) {
            if (pct > 0.3 && pct < 0.7) { nudge(); setShowOverlay(s => !s); return; }
            nudge();

            // Edge navigation for scroll mode (move pages by scrolling viewport)
            const scrollAmount = window.innerHeight * 0.85;
            if (pct >= 0.7) {
                e.currentTarget.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            } else {
                e.currentTarget.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
            }
            return;
        }

        // Edge navigation while zoomed for single/spread
        if (zoom > 1) {
            if (pct < 0.15) {
                const s = mode === MODE.SPREAD ? 2 : 1;
                rtl ? go(s) : go(-s);
                setPanOffset({ x: 0, y: 0 });
            } else if (pct > 0.85) {
                const s = mode === MODE.SPREAD ? 2 : 1;
                rtl ? go(-s) : go(s);
                setPanOffset({ x: 0, y: 0 });
            }
            return;
        }

        if (pct > 0.3 && pct < 0.7) { nudge(); setShowOverlay(s => !s); return; }
        nudge();
        const s = mode === MODE.SPREAD ? 2 : 1;
        if (pct >= 0.7) { rtl ? go(-s) : go(s); }
        else { rtl ? go(s) : go(-s); }
    };


    const canPrev = rtl ? page < total - 1 : page > 0;
    const canNext = rtl ? page > 0 : page < total - 1;
    const btnSize = isMobile ? 36 : 40;
    const iconMain = isMobile ? 14 : 18;

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
                touchAction: mode === MODE.SCROLL ? 'pan-x pan-y' : 'none'
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
                                <Fab onClick={() => { const s = mode === MODE.SPREAD ? 2 : 1; rtl ? go(s) : go(-s); }}
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
                                <Fab onClick={() => { const s = mode === MODE.SPREAD ? 2 : 1; rtl ? go(-s) : go(s); }}
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
                    <FallbackImage src={pages[page]} alt={`${page + 1}`} draggable="false"
                        style={{
                            maxHeight: '100vh', maxWidth: '100vw', objectFit: 'contain',
                            display: 'block', margin: 'auto',
                            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                            transition: (isPanning || isWheeling) ? 'none' : 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
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
                        transition: (isPanning || isWheeling) ? 'none' : 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
                        willChange: 'transform'
                    }}>
                        <FallbackImage src={pages[pL]} alt={`${pL + 1}`} draggable="false"
                            style={{ maxHeight: '100vh', maxWidth: isMobile ? '49vw' : '49vw', objectFit: 'contain', margin: '0 -1px', display: 'block' }} />
                        {pL !== pR && (
                            <FallbackImage src={pages[pR]} alt={`${pR + 1}`} draggable="false"
                                style={{ maxHeight: '100vh', maxWidth: isMobile ? '49vw' : '49vw', objectFit: 'contain', margin: '0 -1px', display: 'block' }} />
                        )}
                    </div>
                </div>
            )}

            {/* ═══ SCROLL ═══ */}
            {mode === MODE.SCROLL && (
                <div className="hide-scrollbar"
                    ref={scrollContainerRef}
                    onClick={handleTap}
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
                        flex: 1, overflow: 'auto', textAlign: 'center'
                    }}>
                    <div style={{
                        width: isMobile ? `${100 * zoom}%` : `${720 * zoom}px`,
                        display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                        margin: '0 auto', verticalAlign: 'top',
                        transition: (isWheeling || mode === MODE.SCROLL) ? 'none' : 'width 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
                        gap: 0, lineHeight: 0, fontSize: 0,
                    }}>
                        {pages.map((p, i) => (
                            <FallbackImage key={i} src={p} alt={`${i + 1}`} draggable="false"
                                forwardedRef={(el) => imgRefs.current[i] = el}
                                data-index={i}
                                loading="eager"
                                onLoad={() => {
                                    if (i === page && isModeSwitching.current) {
                                        imgRefs.current[page]?.scrollIntoView({ behavior: 'instant', block: 'start' });
                                        isModeSwitching.current = false;
                                    }
                                }}
                                style={{ display: 'block', width: '100%', maxWidth: '100%', objectFit: 'contain', margin: 0, padding: 0, verticalAlign: 'bottom', marginTop: i > 0 ? '-1px' : 0 }} />
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
                                    display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: isMobile ? '2px' : '8px',
                                    background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(12px)',
                                    borderRadius: isMobile ? '16px' : '20px',
                                    padding: isMobile ? '4px 6px' : '10px 8px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    overflowX: isMobile ? 'auto' : 'visible',
                                    overflowY: isMobile ? 'visible' : 'auto',
                                    maxWidth: '100%', maxHeight: '100%'
                                }}>
                                {/* Return to First Page */}
                                <div style={{ position: 'relative' }}>
                                    <Fab onClick={() => {
                                        setShowEndPopup(false);
                                        setPage(0);
                                        if (mode === MODE.SCROLL && imgRefs.current[0]) {
                                            imgRefs.current[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                    }} size={btnSize} disabled={page === 0}>
                                        {mode === MODE.SCROLL ? <ArrowUpToLine size={iconMain} /> : (rtl ? <StepForward size={iconMain} /> : <StepBack size={iconMain} />)}
                                    </Fab>
                                    {!isMobile && isNavHovered && (
                                        <div style={{
                                            position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '14px',
                                            background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(6px)', padding: '4px 8px', borderRadius: '6px',
                                            color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-hand)',
                                            whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            {mode === MODE.SCROLL ? 'Back to Top' : 'First Page'}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    width: isMobile ? '1px' : '18px', height: isMobile ? '18px' : '1px',
                                    background: 'rgba(255,255,255,0.1)', margin: isMobile ? '0 2px' : '2px 0'
                                }} />

                                {/* Modes */}
                                {[
                                    { m: MODE.SINGLE, I: File, label: 'Single', key: '1' },
                                    { m: MODE.SPREAD, I: BookOpen, label: 'Spread', key: '2' },
                                    { m: MODE.SCROLL, I: AlignVerticalSpaceAround, label: 'Scroll', key: '3' },
                                ].map(({ m, I: ModeIcon, label, key }) => (
                                    <div key={m} style={{ position: 'relative' }}>
                                        <Fab active={mode === m} size={btnSize}
                                            onClick={() => { setMode(m); resetZoom(); }}>
                                            <ModeIcon size={iconMain} />
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
                                {mode !== MODE.SCROLL && (
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
                                                Direction <span style={{ color: '#ff9ec6', background: 'rgba(255,158,198,0.15)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.55rem' }}>{rtl ? 'Right-to-Left' : 'Left-to-Right'}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontFamily: 'var(--font-hand)', color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>
                                    Chapter {chapter.number} ended
                                </span>
                                {cooldownRemaining === 0 ? (
                                    <motion.span
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.4 }}
                                        style={{
                                            fontFamily: 'var(--font-hand)', color: '#ff9ec6', fontSize: '0.78rem',
                                            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        ✓ +1 read counted!
                                    </motion.span>
                                ) : (
                                    <span style={{
                                        fontFamily: 'var(--font-hand)', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem',
                                        marginTop: '4px'
                                    }}>
                                        Reread count in {cooldownRemaining}s
                                    </span>
                                )}
                            </div>
                            <Fab onClick={() => setShowEndPopup(false)} size={28} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)' }}>
                                <X size={16} />
                            </Fab>
                        </div>

                        <div style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontFamily: 'var(--font-hand)', color: 'rgba(255,255,255,0.7)',
                            background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <span>{onNextChapter ? 'Auto-next in ' : 'Auto-close in '} <strong style={{ color: '#ff9ec6' }}>{autoNextCountdown}s</strong>...</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                            <Fab disabled={!onPrevChapter} onClick={() => { setShowEndPopup(false); onPrevChapter?.(); }} size={36} style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold', background: 'rgba(255,255,255,0.08)' }}>
                                Previous chapter
                            </Fab>
                            <Fab active={true} onClick={() => {
                                setShowEndPopup(false);
                                if (onNextChapter) onNextChapter();
                                else if (onClose) onClose();
                            }} size={36} style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold' }}>
                                {onNextChapter ? 'Next chapter' : 'Close reader'}
                            </Fab>
                        </div>
                        <Fab onClick={() => {
                            setShowEndPopup(false);
                            setPage(0);
                            if (mode === MODE.SCROLL && imgRefs.current[0]) {
                                imgRefs.current[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }} size={32} style={{ width: '100%', marginTop: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-hand)', fontWeight: 'bold', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                            {mode === MODE.SCROLL ? 'Return to Top' : 'Return to first page'}
                        </Fab>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div >
    );
};

export default MangaReader;
