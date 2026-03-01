import FallbackImage from './FallbackImage';

const MangaReaderSpreadView = ({
    pages,
    pL,
    pR,
    rtl,
    isMobile,
    handleTap,
    onPD,
    onPM,
    onPU,
    zoom,
    panOffset,
    isPanning,
    isWheeling,
}) => (
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
);

export default MangaReaderSpreadView;
