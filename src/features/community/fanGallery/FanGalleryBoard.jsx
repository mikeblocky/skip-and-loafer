import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CommunityEmptyState from '../CommunityEmptyState';
import { createCommunityStackLayout } from '../communityGestures';
import {
  COMMUNITY_FONT_FAMILY,
  createCommunityTimestampStyle,
  formatCommunityTimestamp,
} from '../communityTheme';
import { createPaperPanelStyle } from '../../../components/shared/paper/paperTheme';

const NOTE_PALETTES = [
  { background: 'var(--themed-note-bg-1, #fff8be)', border: 'var(--themed-note-border-1, #facc15)', bottom: 'var(--themed-note-bottom-1, #eab308)', accent: 'var(--themed-note-accent-1, #a16207)' },
  { background: 'var(--themed-note-bg-2, #fee2e2)', border: 'var(--themed-note-border-2, #fda4af)', bottom: 'var(--themed-note-bottom-2, #fb7185)', accent: 'var(--themed-note-accent-2, #be123c)' },
  { background: 'var(--themed-note-bg-3, #dbeafe)', border: 'var(--themed-note-border-3, #93c5fd)', bottom: 'var(--themed-note-bottom-3, #60a5fa)', accent: 'var(--themed-note-accent-3, #1d4ed8)' },
  { background: 'var(--themed-note-bg-4, #dcfce7)', border: 'var(--themed-note-border-4, #86efac)', bottom: 'var(--themed-note-bottom-4, #4ade80)', accent: 'var(--themed-note-accent-4, #15803d)' },
  { background: 'var(--themed-note-bg-5, #fce7f3)', border: 'var(--themed-note-border-5, #f9a8d4)', bottom: 'var(--themed-note-bottom-5, #f472b6)', accent: 'var(--themed-note-accent-5, #be185d)' },
  { background: 'var(--themed-note-bg-6, #ede9fe)', border: 'var(--themed-note-border-6, #c4b5fd)', bottom: 'var(--themed-note-bottom-6, #a78bfa)', accent: 'var(--themed-note-accent-6, #6d28d9)' },
  { background: 'var(--themed-note-bg-7, #ffedd5)', border: 'var(--themed-note-border-7, #fdba74)', bottom: 'var(--themed-note-bottom-7, #fb923c)', accent: 'var(--themed-note-accent-7, #c2410c)' },
  { background: 'var(--themed-note-bg-8, #ecfeff)', border: 'var(--themed-note-border-8, #67e8f9)', bottom: 'var(--themed-note-bottom-8, #22d3ee)', accent: 'var(--themed-note-accent-8, #0f766e)' },
];

const STACK_OFFSETS = [
  { x: -10, y: 0, rotate: -2.2 },
  { x: 7, y: 3, rotate: 1.8 },
  { x: -5, y: 2, rotate: -1.5 },
  { x: 8, y: 4, rotate: 2.4 },
  { x: -7, y: 1, rotate: -1.8 },
  { x: 6, y: 5, rotate: 1.6 },
];

function getEntryStackLayout(entry, index) {
  const layout = createCommunityStackLayout(entry, index, {
    offsets: STACK_OFFSETS,
    fields: ['id', 'createdAt', 'name', 'description'],
    hashMultiplier: 33,
    spreadModulo: 4,
    spreadCenter: 1,
    spreadXStep: 1.5,
    rotationSpreadStep: 0.2,
  });

  return {
    ...layout,
    imageTilt: layout.spread * 0.12,
  };
}

const FanGalleryBoard = ({
  isMobile,
  entries,
  isLoading,
  emptyMessage,
  uiLanguage,
  galleryBoardRef,
  galleryBoardMinHeight,
  isResettingCanvas,
  canvasResetVersion,
  galleryGestures,
  activeDraggedId,
  activeGalleryGestureId,
  galleryDragConstraints,
  stackOrderIndex,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onWheel,
  onSelectEntry,
}) => {
  const colsCount = isMobile ? 2 : 3;
  const columns = Array.from({ length: colsCount }, () => []);
  entries.forEach((entry, idx) => {
    columns[idx % colsCount].push({ entry, originalIndex: idx });
  });

  return (
    <div
      style={{
        display: entries.length === 0 ? 'block' : 'flex',
        gap: isMobile ? '10px' : '14px',
        marginTop: isMobile ? '12px' : '16px',
        minHeight: galleryBoardMinHeight,
        paddingBottom: '8px',
        position: 'relative',
        opacity: isResettingCanvas ? 0.22 : 1,
        transform: isResettingCanvas ? 'translateY(8px) scale(0.992)' : 'translateY(0) scale(1)',
        transition: 'opacity 180ms ease, transform 180ms ease',
        pointerEvents: isResettingCanvas ? 'none' : 'auto',
        width: '100%',
      }}
      ref={galleryBoardRef}
    >
      {!isLoading && entries.length === 0 ? (
        <CommunityEmptyState message={emptyMessage} />
      ) : (
        columns.map((columnEntries, colIdx) => (
          <div
            key={colIdx}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '20px' : '26px',
              minWidth: 0,
            }}
          >
            <AnimatePresence initial={false}>
              {columnEntries.map(({ entry, originalIndex }) => {
                const palette = NOTE_PALETTES[originalIndex % NOTE_PALETTES.length];
                const stackLayout = getEntryStackLayout(entry, originalIndex);
                const origin = stackLayout.offsetX < 0 ? 'left top' : 'right top';
                const gesture = galleryGestures[entry.id] || { scale: 1, rotate: 0 };
                const cardDragConstraints = isMobile ? undefined : galleryDragConstraints;
                const washiColor = ['pink', 'blue', 'yellow'][originalIndex % 3];
                const isLeft = originalIndex % 2 === 0;

                return (
                  <motion.article
                    key={`${entry.id}-${canvasResetVersion}`}
                    data-no-tab-swipe="1"
                    layout
                    drag
                    dragConstraints={cardDragConstraints}
                    dragElastic={isMobile ? 0.82 : 0.16}
                    dragMomentum={false}
                    onDragStart={() => onDragStart(entry.id)}
                    onDragEnd={() => onDragEnd(entry.id)}
                    whileDrag={{ scale: 1.015, rotate: 0 }}
                    initial={{ opacity: 0, y: 18, x: stackLayout.offsetX * 0.24, rotate: stackLayout.rotate - 0.4, scale: 0.985 }}
                    animate={{ opacity: 1, y: stackLayout.offsetY, x: isMobile ? stackLayout.offsetX * 0.18 : stackLayout.offsetX * 0.42, rotate: isMobile ? stackLayout.rotate * 0.15 : stackLayout.rotate * 0.42, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{
                      layout: { duration: 0.26, ease: 'easeOut' },
                      opacity: { duration: 0.22, ease: 'easeOut' },
                      y: { duration: 0.22, ease: 'easeOut' },
                      scale: { duration: 0.22, ease: 'easeOut' },
                      delay: Math.min(originalIndex * 0.025, 0.18),
                    }}
                    style={{
                      maxWidth: '100%',
                      position: 'relative',
                      zIndex: activeDraggedId === entry.id
                        ? 1000
                        : (stackOrderIndex[entry.id] || entries.length - originalIndex),
                      cursor: 'grab',
                      touchAction: 'none',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      boxShadow: 'none',
                    }}
                  >
                    {/* Corner washi tape — same as fan messages */}
                    <div
                      className={`washi-tape washi-tape--${washiColor}`}
                      style={{
                        top: '-6px',
                        left: isLeft ? '14px' : 'auto',
                        right: isLeft ? 'auto' : '14px',
                        transform: `rotate(${isLeft ? -12 : 12}deg)`,
                        width: '66px',
                        height: '18px',
                        zIndex: 10,
                      }}
                    />

                    <div
                      className="sketchbook-border"
                      style={{
                        ...createPaperPanelStyle({
                          background: palette.background,
                          borderColor: palette.border,
                          bottomColor: palette.bottom,
                          radius: '28px',
                          shadow: '0 14px 26px rgba(15,23,42,0.1)',
                        }),
                        padding: isMobile ? '12px 12px 12px' : '14px 14px 14px',
                        display: 'grid',
                        gap: isMobile ? '10px' : '12px',
                        transformOrigin: 'center center',
                        transform: `translateZ(0) scale(${gesture.scale}) rotate(${gesture.rotate}deg)`,
                        willChange: 'transform',
                        transition: 'transform 120ms ease-out',
                      }}
                      onTouchStart={(event) => onTouchStart(entry.id, event)}
                      onTouchMove={(event) => onTouchMove(entry.id, event)}
                      onTouchEnd={(event) => onTouchEnd(entry.id, event)}
                      onTouchCancel={(event) => onTouchEnd(entry.id, event)}
                      onWheel={(event) => onWheel(entry.id, event)}
                    >
                      {/* Image */}
                      <button
                        className="app-tactile sketchbook-border"
                        type="button"
                        onClick={() => onSelectEntry(entry.id, entry.imageDataUrl)}
                        style={{
                          border: 'none',
                          background: 'var(--surface-card, #ffffff)',
                          padding: 0,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          width: '100%',
                          maxWidth: '100%',
                          boxShadow: 'inset 0 0 0 2px var(--surface-card, rgba(255,255,255,0.95))',
                          transform: `rotate(${stackLayout.imageTilt * 0.4}deg)`,
                          transformOrigin: origin,
                        }}
                      >
                        <img
                          className="sketchbook-border"
                          src={entry.imageDataUrl}
                          alt={entry.description || entry.name || 'Gallery item'}
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                          style={{
                            width: '100%',
                            display: 'block',
                            maxWidth: '100%',
                            background: '#f8fafc',
                            objectFit: 'cover',
                            userSelect: 'none',
                            WebkitUserDrag: 'none',
                            pointerEvents: activeGalleryGestureId === entry.id ? 'none' : 'auto',
                            transform: `rotate(${(isMobile ? stackLayout.imageTilt * 0.35 : stackLayout.imageTilt * 0.4) * -0.35}deg)`,
                          }}
                          draggable={false}
                        />
                      </button>

                      {/* Name + description + timestamp — same layout as fan messages */}
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {(entry.name || entry.description) && (
                          <div style={{ display: 'grid', gap: '4px' }}>
                            {entry.name && (
                              <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: isMobile ? '0.95rem' : '1rem', color: palette.accent, lineHeight: 1, fontWeight: '400' }}>
                                {entry.name}
                              </span>
                            )}
                            {entry.description && (
                              <p style={{ margin: 0, color: 'var(--text-secondary, #334155)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                                {entry.description}
                              </p>
                            )}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <span
                            className="sketchbook-border"
                            style={createCommunityTimestampStyle({
                              borderColor: palette.border,
                              bottomColor: palette.bottom,
                              background: 'var(--surface-card, #ffffff)',
                              color: palette.accent,
                            })}
                          >
                            {formatCommunityTimestamp(entry.createdAt, uiLanguage)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        ))
      )}
    </div>
  );
};

export default memo(FanGalleryBoard);
