import { useState, useEffect } from 'react';
import { getPaletteByIndex } from '../chatPalette';
import { CHAT_FONT_FAMILY } from '../chatConstants';

export function CharacterAvatar({ src, name, palette, size = 72, padding = 8 }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        boxSizing: 'border-box',
        borderRadius: '999px',
        background: '#ffffff',
        border: `4px solid ${palette.border}`,
        padding: `${padding}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 10px 20px ${palette.border}22`,
      }}
    >
      <img
        src={src}
        alt={name}
        draggable="false"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 10px rgba(15, 23, 42, 0.15))',
        }}
      />
    </div>
  );
}

export function ChatFaceAvatar({ src, name, palette, size = 34, variant = 'default' }) {
  const isFlat = variant === 'flat';
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        boxSizing: 'border-box',
        borderRadius: '999px',
        background: isFlat ? 'transparent' : '#ffffff',
        border: isFlat ? `3px solid ${palette.border}` : `4.5px solid ${palette.border}`,
        overflow: 'hidden',
        boxShadow: isFlat ? 'none' : `0 8px 16px ${palette.border}22`,
        flexShrink: 0,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <img
        src={src}
        alt={name}
        draggable="false"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}

export function RoomStackAvatar({ participants, size = 44 }) {
  const visibleParticipants = (participants || []).slice(0, 3);
  const itemSize = visibleParticipants.length <= 1 ? size : Math.round(size * 0.9);
  const overlap = Math.round(itemSize * 0.38);
  const containerWidth = visibleParticipants.length <= 1 ? itemSize : itemSize + ((visibleParticipants.length - 1) * overlap);

  return (
    <div style={{ position: 'relative', width: `${containerWidth}px`, height: `${itemSize}px`, flexShrink: 0, marginRight: visibleParticipants.length > 1 ? '8px' : '0' }}>
      {visibleParticipants.map((participant, index) => {
        const palette = getPaletteByIndex(participant.paletteIndex !== undefined ? participant.paletteIndex : index);
        return (
          <div
            key={`${participant.id}_${index}`}
            style={{
              position: 'absolute',
              left: `${index * overlap}px`,
              top: 0,
              width: `${itemSize}px`,
              height: `${itemSize}px`,
              boxSizing: 'border-box',
              borderRadius: '999px',
              overflow: 'hidden',
              background: '#ffffff',
              border: `2.2px solid ${palette.border}`,
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
              zIndex: 10 - index, // Earlier participants are behind
              transition: 'transform 0.2s ease',
            }}
          >
            <img
              src={participant.portraitSrc}
              alt={participant.characterName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              draggable="false"
            />
          </div>
        );
      })}
    </div>
  );
}

export function LiveSessionTimer({ entryTime, copy }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diffMs = Math.max(0, now - entryTime);
  const diffSec = Math.floor(diffMs / 1000) % 60;
  const diffMin = Math.floor(diffMs / (1000 * 60)) % 60;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

  const durationStr = [
    diffHrs > 0 ? `${diffHrs}h` : '',
    diffMin > 0 || diffHrs > 0 ? `${diffMin}m` : '',
    `${diffSec}s`
  ].filter(Boolean).join(' ');

  const dateStr = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric',
  }).format(now);

  return (
    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: CHAT_FONT_FAMILY, whiteSpace: 'nowrap', flexShrink: 0, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
      <span style={{ color: '#10b981', fontWeight: 400 }}>{durationStr}</span>
      <span style={{ opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis' }}>{dateStr}</span>
    </div>
  );
}
