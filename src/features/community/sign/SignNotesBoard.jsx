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
  { background: '#fff8be', border: '#facc15', bottom: '#eab308', accent: '#a16207' },
  { background: '#fee2e2', border: '#fda4af', bottom: '#fb7185', accent: '#be123c' },
  { background: '#dbeafe', border: '#93c5fd', bottom: '#60a5fa', accent: '#1d4ed8' },
  { background: '#dcfce7', border: '#86efac', bottom: '#4ade80', accent: '#15803d' },
  { background: '#fce7f3', border: '#f9a8d4', bottom: '#f472b6', accent: '#be185d' },
  { background: '#ede9fe', border: '#c4b5fd', bottom: '#a78bfa', accent: '#6d28d9' },
  { background: '#ffedd5', border: '#fdba74', bottom: '#fb923c', accent: '#c2410c' },
  { background: '#ecfeff', border: '#67e8f9', bottom: '#22d3ee', accent: '#0f766e' },
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
}) => (
  <div
    style={{
      columns: isMobile ? 2 : 3,
      columnGap: isMobile ? '10px' : '14px',
      marginTop: isMobile ? '14px' : '20px',
      minHeight: noteBoardMinHeight,
      paddingBottom: '8px',
      position: 'relative',
      overflow: 'visible',
      opacity: isResettingCanvas ? 0.26 : 1,
      transform: isResettingCanvas ? 'translateY(8px) scale(0.992)' : 'translateY(0) scale(1)',
      transition: 'opacity 180ms ease, transform 180ms ease',
      pointerEvents: isResettingCanvas ? 'none' : 'auto',
    }}
    ref={notesBoardRef}
  >
    {!isLoading && entries.length === 0 && (
      <CommunityEmptyState message={emptyMessage} />
    )}

    <AnimatePresence initial={false}>
      {entries.map((entry, index) => {
        const palette = NOTE_PALETTES[index % NOTE_PALETTES.length];
        const stackLayout = getEntryStackLayout(entry, index);
        const gesture = noteGestures[entry.id] || { scale: 1, rotate: 0 };
        const cardDragConstraints = isMobile ? undefined : noteDragConstraints;

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
              delay: Math.min(index * 0.03, 0.18),
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
                  background: '#fffdf7',
                  borderColor: palette.border,
                  bottomColor: palette.bottom,
                  radius: '26px',
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
                <p style={{ margin: 0, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.95rem' : '1rem' }}>
                  {entry.message}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <span
                  className="sketchbook-border"
                  style={createCommunityTimestampStyle({
                    borderColor: palette.border,
                    bottomColor: palette.bottom,
                    background: '#ffffff',
                    color: palette.accent,
                  })}
                >
                  {formatCommunityTimestamp(entry.createdAt, uiLanguage)}
                </span>
              </div>
            </div>
          </motion.article>
        );
      })}
    </AnimatePresence>
  </div>
);

export default memo(SignNotesBoard);
