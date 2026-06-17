/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { MODE } from './constants';
import { getMangaReaderText } from './mangaReaderText';
import MangaReaderControlBar from './MangaReaderControlBar';
import MangaReaderEndPopup from './MangaReaderEndPopup';
import MangaReaderProgressBar from './MangaReaderProgressBar';
import MangaReaderTopOverlay from './MangaReaderTopOverlay';
import MangaReaderSideArrows from './MangaReaderSideArrows';
import MangaReaderSingleView from './MangaReaderSingleView';
import MangaReaderSpreadView from './MangaReaderSpreadView';
import MangaReaderScrollView from './MangaReaderScrollView';

/* No page-turn animation — simple instant swap */

const MangaReader = ({ chapter, pages, onClose, onNextChapter, onPrevChapter, isMobile, onChapterFinished, getRemainingCooldown, uiLanguage = 'en' }) => {
    const t = getMangaReaderText(uiLanguage);
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

    const isScroll = mode === MODE.SCROLL;

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
            <MangaReaderTopOverlay
                showOverlay={showOverlay}
                showNav={showNav}
                isMobile={isMobile}
                btnSize={btnSize}
                iconMain={iconMain}
                onClose={onClose}
                chapter={chapter}
                page={page}
                total={total}
                mode={mode}
                spreadIdx={spreadIdx}
                uiLanguage={uiLanguage}
            />

            <MangaReaderSideArrows
                mode={mode}
                showNav={showNav}
                isMobile={isMobile}
                rtl={rtl}
                go={go}
                canPrev={canPrev}
                canNext={canNext}
            />

            {/* ═══ SINGLE ═══ */}
            {mode === MODE.SINGLE && (
                <MangaReaderSingleView
                    pages={pages}
                    page={page}
                    handleTap={handleTap}
                    onPD={onPD}
                    onPM={onPM}
                    onPU={onPU}
                    zoom={zoom}
                    panOffset={panOffset}
                    isPanning={isPanning}
                    isWheeling={isWheeling}
                />
            )}

            {/* ═══ SPREAD ═══ */}
            {mode === MODE.SPREAD && (
                <MangaReaderSpreadView
                    pages={pages}
                    pL={pL}
                    pR={pR}
                    rtl={rtl}
                    isMobile={isMobile}
                    handleTap={handleTap}
                    onPD={onPD}
                    onPM={onPM}
                    onPU={onPU}
                    zoom={zoom}
                    panOffset={panOffset}
                    isPanning={isPanning}
                    isWheeling={isWheeling}
                />
            )}

            {/* ═══ SCROLL ═══ */}
            {mode === MODE.SCROLL && (
                <MangaReaderScrollView
                    scrollContainerRef={scrollContainerRef}
                    handleTap={handleTap}
                    onPD={onPD}
                    onPM={onPM}
                    onPU={onPU}
                    setShowEndPopup={setShowEndPopup}
                    isAtBottom={isAtBottom}
                    setIsAtBottom={setIsAtBottom}
                    isMobile={isMobile}
                    zoom={zoom}
                    isWheeling={isWheeling}
                    mode={mode}
                    pages={pages}
                    page={page}
                    imgRefs={imgRefs}
                    isModeSwitching={isModeSwitching}
                />
            )}

            {/* ═══ BOTTOM CONTROLS ═══ */}
            <MangaReaderControlBar
                showNav={showNav}
                isMobile={isMobile}
                isNavHovered={isNavHovered}
                setIsNavHovered={setIsNavHovered}
                setShowEndPopup={setShowEndPopup}
                setPage={setPage}
                mode={mode}
                imgRefs={imgRefs}
                btnSize={btnSize}
                page={page}
                rtl={rtl}
                iconMain={iconMain}
                t={t}
                setMode={setMode}
                resetZoom={resetZoom}
                setRtl={setRtl}
                doZoom={doZoom}
                zoom={zoom}
            />


            {/* ═══ END POPUP ═══ */}
            <MangaReaderEndPopup
                showEndPopup={showEndPopup}
                isMobile={isMobile}
                chapterNumber={chapter.displayNumber ?? chapter.number}
                cooldownRemaining={cooldownRemaining}
                autoNextCountdown={autoNextCountdown}
                onNextChapter={onNextChapter}
                onPrevChapter={onPrevChapter}
                onClose={onClose}
                setShowEndPopup={setShowEndPopup}
                setPage={setPage}
                mode={mode}
                imgRefs={imgRefs}
                t={t}
            />

        </motion.div >
    );
};

export default MangaReader;
