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

const CARD_PALETTES = [
  { frame: '#fff8ef', border: '#f7b267', bottom: '#ea7c31', label: '#9a3412', shadow: 'rgba(234, 124, 49, 0.16)' },
  { frame: '#f6fbff', border: '#8dc8ff', bottom: '#4d9de0', label: '#1d4ed8', shadow: 'rgba(77, 157, 224, 0.16)' },
  { frame: '#fff5fb', border: '#f39acb', bottom: '#e0569f', label: '#9d174d', shadow: 'rgba(224, 86, 159, 0.16)' },
  { frame: '#f5fff8', border: '#77d59a', bottom: '#22a86f', label: '#166534', shadow: 'rgba(34, 168, 111, 0.16)' },
  { frame: '#f7f0ff', border: '#b98cff', bottom: '#8b5cf6', label: '#6d28d9', shadow: 'rgba(139, 92, 246, 0.16)' },
  { frame: '#fff1e6', border: '#ffb36b', bottom: '#f97316', label: '#9a3412', shadow: 'rgba(249, 115, 22, 0.16)' },
  { frame: '#eff6ff', border: '#93c5fd', bottom: '#2563eb', label: '#1e3a8a', shadow: 'rgba(37, 99, 235, 0.16)' },
  { frame: '#f0fdf4', border: '#86efac', bottom: '#16a34a', label: '#166534', shadow: 'rgba(22, 163, 74, 0.16)' },
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
}) => (
  <div
    style={{
      columns: isMobile ? 2 : 3,
      columnGap: isMobile ? '6px' : '20px',
      marginTop: isMobile ? '12px' : '16px',
      minHeight: galleryBoardMinHeight,
      paddingBottom: '8px',
      position: 'relative',
      opacity: isResettingCanvas ? 0.22 : 1,
      transform: isResettingCanvas ? 'translateY(8px) scale(0.992)' : 'translateY(0) scale(1)',
      transition: 'opacity 180ms ease, transform 180ms ease',
      pointerEvents: isResettingCanvas ? 'none' : 'auto',
    }}
    ref={galleryBoardRef}
  >
    {!isLoading && entries.length === 0 && (
      <CommunityEmptyState message={emptyMessage} />
    )}

    <AnimatePresence initial={false}>
      {entries.map((entry, index) => {
        const palette = CARD_PALETTES[index % CARD_PALETTES.length];
        const stackLayout = getEntryStackLayout(entry, index);
        const origin = stackLayout.offsetX < 0 ? 'left top' : 'right top';
        const gesture = galleryGestures[entry.id] || { scale: 1, rotate: 0 };
        const cardDragConstraints = isMobile ? undefined : galleryDragConstraints;

        return (
          <motion.article
            key={`${entry.id}-${canvasResetVersion}`}
            className="sketchbook-border"
            data-no-tab-swipe="1"
            layout
            drag
            dragConstraints={cardDragConstraints}
            dragElastic={isMobile ? 0.82 : 0.16}
            dragMomentum={false}
            onDragStart={() => onDragStart(entry.id)}
            onDragEnd={() => onDragEnd(entry.id)}
            whileDrag={{ scale: 1.03, rotate: 0 }}
            initial={{ opacity: 0, y: 18, x: stackLayout.offsetX * 0.24, rotate: stackLayout.rotate - 0.4, scale: 0.985 }}
            animate={{ opacity: 1, y: stackLayout.offsetY, x: isMobile ? stackLayout.offsetX * 0.32 : stackLayout.offsetX * 0.42, rotate: isMobile ? stackLayout.rotate * 0.32 : stackLayout.rotate * 0.42, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{
              layout: { duration: 0.26, ease: 'easeOut' },
              opacity: { duration: 0.22, ease: 'easeOut' },
              y: { duration: 0.22, ease: 'easeOut' },
              scale: { duration: 0.22, ease: 'easeOut' },
              delay: Math.min(index * 0.025, 0.18),
            }}
            style={{
              breakInside: 'avoid',
              maxWidth: '100%',
              marginBottom: isMobile ? '12px' : '18px',
              position: 'relative',
              zIndex: activeDraggedId === entry.id
                ? 1000
                : (stackOrderIndex[entry.id] || entries.length - index),
              cursor: 'grab',
              touchAction: 'none',
              background: 'transparent',
              border: 'none',
              padding: 0,
              boxShadow: 'none',
            }}
          >
            <div
              style={{
                ...createPaperPanelStyle({
                  background: palette.frame,
                  borderColor: palette.border,
                  bottomColor: palette.bottom,
                  radius: '26px',
                  shadow: `0 16px 28px ${palette.shadow}, 0 4px 10px rgba(15,23,42,0.09)`,
                }),
                padding: isMobile ? '12px' : '16px',
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
              <button
                className="app-tactile"
                type="button"
                onClick={() => onSelectEntry(entry.id, entry.imageDataUrl)}
                style={{
                  border: 'none',
                  background: '#ffffff',
                  padding: 0,
                  cursor: 'pointer',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '100%',
                  boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.95)',
                  transform: `rotate(${stackLayout.imageTilt * 0.4}deg)`,
                  transformOrigin: origin,
                }}
              >
                <img
                  src={entry.imageDataUrl}
                  alt={entry.description || entry.name || 'Gallery item'}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  style={{
                    width: '100%',
                    display: 'block',
                    maxWidth: '100%',
                    borderRadius: '20px',
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

              <div style={{ display: 'grid', gap: '6px' }}>
                {(entry.name || entry.description) && (
                  <div style={{ display: 'grid', gap: '4px' }}>
                    {entry.name && (
                      <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: palette.label, fontSize: isMobile ? '0.95rem' : '1.02rem', lineHeight: 1.2, fontWeight: '400' }}>
                        {entry.name}
                      </span>
                    )}
                    {entry.description && (
                      <p style={{ margin: 0, color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.9rem' : '0.98rem' }}>
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
                      background: '#ffffff',
                      color: palette.label,
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
);

export default memo(FanGalleryBoard);
