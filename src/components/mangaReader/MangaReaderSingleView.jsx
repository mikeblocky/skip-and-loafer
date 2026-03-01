import FallbackImage from './FallbackImage';

const MangaReaderSingleView = ({ pages, page, handleTap, onPD, onPM, onPU, zoom, panOffset, isPanning, isWheeling }) => (
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
);

export default MangaReaderSingleView;
