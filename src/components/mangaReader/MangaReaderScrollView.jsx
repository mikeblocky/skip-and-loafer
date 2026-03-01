import FallbackImage from './FallbackImage';

const MangaReaderScrollView = ({
    scrollContainerRef,
    handleTap,
    onPD,
    onPM,
    onPU,
    setShowEndPopup,
    isAtBottom,
    setIsAtBottom,
    isMobile,
    zoom,
    isWheeling,
    mode,
    pages,
    page,
    imgRefs,
    isModeSwitching,
}) => (
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
            transition: (isWheeling || mode === 'scroll') ? 'none' : 'width 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
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
);

export default MangaReaderScrollView;
