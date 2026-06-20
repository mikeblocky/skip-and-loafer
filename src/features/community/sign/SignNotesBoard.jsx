import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CommunityEmptyState from '../CommunityEmptyState';
import {
  createCommunityStackLayout,
} from '../communityGestures';
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
  { x: -8, y: 0, rotate: -2.8 },
  { x: 6, y: 4, rotate: 2.2 },
  { x: -4, y: 1, rotate: -1.6 },
  { x: 7, y: 6, rotate: 3 },
  { x: -6, y: 2, rotate: -2.2 },
  { x: 5, y: 5, rotate: 1.8 },
];

function getEntryStackLayout(entry, index) {
  return createCommunityStackLayout(entry, index, {
    offsets: STACK_OFFSETS,
    fields: ['id', 'createdAt', 'name'],
    hashMultiplier: 31,
    spreadModulo: 3,
    spreadCenter: 1,
    spreadXStep: 2,
    rotationSpreadStep: 0.35,
  });
}

const SignNotesBoard = ({
  isMobile,
  entries,
  isLoading,
  emptyMessage,
  uiLanguage,
  notesBoardRef,
  noteBoardMinHeight,
  isResettingCanvas,
  canvasResetVersion,
  noteGestures,
  activeDraggedId,
  noteDragConstraints,
  stackOrderIndex,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onWheel,
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
        marginTop: isMobile ? '14px' : '20px',
        minHeight: noteBoardMinHeight,
        paddingBottom: '8px',
        position: 'relative',
        overflow: 'visible',
        opacity: isResettingCanvas ? 0.26 : 1,
        transform: isResettingCanvas ? 'translateY(8px) scale(0.992)' : 'translateY(0) scale(1)',
        transition: 'opacity 180ms ease, transform 180ms ease',
        pointerEvents: isResettingCanvas ? 'none' : 'auto',
        width: '100%',
      }}
      ref={notesBoardRef}
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
                const gesture = noteGestures[entry.id] || { scale: 1, rotate: 0 };
                const cardDragConstraints = isMobile ? undefined : noteDragConstraints;
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
                    initial={{ opacity: 0, y: 18, x: stackLayout.offsetX * 0.25, rotate: stackLayout.rotate - 0.45, scale: 0.985 }}
                    animate={{
                      opacity: 1,
                      y: stackLayout.offsetY,
                      x: isMobile ? stackLayout.offsetX * 0.18 : stackLayout.offsetX * 0.45,
                      rotate: isMobile ? stackLayout.rotate * 0.15 : stackLayout.rotate * 0.45,
                      scale: 1,
                    }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{
                      layout: { duration: 0.26, ease: 'easeOut' },
                      opacity: { duration: 0.22, ease: 'easeOut' },
                      y: { duration: 0.22, ease: 'easeOut' },
                      scale: { duration: 0.22, ease: 'easeOut' },
                      delay: Math.min(originalIndex * 0.03, 0.18),
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
                    {/* Corner washi tape accent for the message note */}
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
                          background: palette.background, // Use card's background instead of hardcoded white
                          borderColor: palette.border,
                          bottomColor: palette.bottom,
                          radius: '28px',
                          shadow: `0 14px 26px ${palette.shadow || 'rgba(15, 23, 42, 0.1)'}`,
                        }),
                        padding: isMobile ? '14px 14px 12px' : '18px 20px 16px',
                        display: 'grid',
                        gap: isMobile ? '8px' : '10px',
                        transform: `translateZ(0) scale(${gesture.scale}) rotate(${gesture.rotate}deg)`,
                        transformOrigin: 'center center',
                        willChange: 'transform',
                        transition: 'transform 120ms ease-out',
                      }}
                      onTouchStart={(event) => onTouchStart(entry.id, event)}
                      onTouchMove={(event) => onTouchMove(entry.id, event)}
                      onTouchEnd={(event) => onTouchEnd(entry.id, event)}
                      onTouchCancel={(event) => onTouchEnd(entry.id, event)}
                      onWheel={(event) => onWheel(entry.id, event)}
                    >
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: isMobile ? '0.95rem' : '1rem', color: palette.accent, lineHeight: 1, fontWeight: '400' }}>
                          {entry.name}
                        </span>
                        <p style={{ margin: 0, color: 'var(--text-secondary, #334155)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.95rem' : '1rem' }}>
                          {entry.message}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '6px', flexWrap: 'wrap' }}>
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
                        {entry.isPending && (
                          <span
                            className="sketchbook-border"
                            style={createCommunityTimestampStyle({
                              borderColor: '#bfdbfe',
                              bottomColor: '#60a5fa',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                            })}
                          >
                            pending sync
                          </span>
                        )}
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

export default memo(SignNotesBoard);
