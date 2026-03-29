import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  DoorOpen,
  Eraser,
  ImagePlus,
  LoaderCircle,
  MessageCircleHeart,
  MoreHorizontal,
  PencilLine,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  X,
  UserPlus,
  UserRoundPlus,
  XCircle,
  Fingerprint,
  KeyRound,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UI_TEXT } from '../config/uiText';
import { triggerHaptic } from '../utils/haptics';
import { PORTRAIT_DATA } from './mystery/mysteryData';
import {
  createChatRoom,
  endChatRoom,
  fetchChatRoom,
  fetchPublicChatRooms,
  joinChatRoom,
  sendChatMessage,
  setChatTypingState,
  updateChatRoomSettings,
} from './chat/chatApi';
import {
  ACTIVE_ROOM_POLL_INTERVAL_MS,
  BUTTON_STYLE,
  CHAT_FONT_FAMILY,
  DEFAULT_CHAT_COPY,
  DRAWING_COLORS,
  DRAWING_HEIGHT,
  DRAWING_WIDTH,
  INPUT_STYLE,
  MAX_MESSAGE_LENGTH,
  PANEL_STYLE,
  POLL_INTERVAL_MS,
  SPIN_ICON_STYLE,
  TYPING_DEBOUNCE_MS,
} from './chat/chatConstants';
import {
  createParticipantId,
  formatTime,
  getNormalizedRoomId,
  getPaletteByIndex,
  getStoredCreatorToken,
  getStoredIdentityKey,
  getStoredParticipant,
  getStoredRoomPin,
  getUniversalUserId,
  normalizeRoomCode,
  readCatalogCache,
  readLastRoomId,
  readProfile,
  readSavedRoomIds,
  removeStoredCreatorToken,
  removeStoredParticipant,
  sanitizeDrawingDataUrl,
  setStoredCreatorToken,
  setStoredParticipant,
  writeCatalogCache,
  writeIdentityKey,
  writeLastRoomId,
  writeProfile,
  writeRoomPin,
  writeSavedRoomIds,
} from './chat/chatStorage';

function CharacterAvatar({ src, name, palette, size = 72, padding = 8 }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '999px',
        background: '#ffffff',
        border: `3px solid ${palette.border}`,
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

function ChatFaceAvatar({ src, name, palette, size = 34 }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '999px',
        background: '#ffffff',
        border: `2.5px solid ${palette.border}`,
        overflow: 'hidden',
        boxShadow: `0 8px 16px ${palette.border}22`,
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

function ChatMessageRow({ message, author, palette, isOwnMessage, isMobile, fallbackPortraitSrc, copy, index, onTap }) {
  if (message.type === 'system') {
    return (
      <div
        style={{
          alignSelf: 'center',
          padding: '8px 14px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid rgba(148, 163, 184, 0.38)',
          color: '#64748b',
          fontSize: '0.92rem',
          fontFamily: CHAT_FONT_FAMILY,
          fontWeight: 400,
          textAlign: 'center',
          maxWidth: '88%',
          boxShadow: '0 8px 22px rgba(15, 23, 42, 0.05)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {message.text}
      </div>
    );
  }

  const isDrawingMessage = !!message.drawing;
  const drawingOnlyMessage = isDrawingMessage && !message.text;
  const bubbleBackground = isOwnMessage ? `${palette.bg}` : '#ffffff';
  const bubbleColor = isOwnMessage ? palette.text : '#1e293b';
  const bubbleBorder = `2px solid ${isOwnMessage ? palette.border : `${palette.border}55`}`;
  const bubbleBottomBorder = `6px solid ${isOwnMessage ? palette.border : `${palette.border}99`}`;
  const avatarSrc = author?.portraitSrc || fallbackPortraitSrc;
  const avatarName = author?.characterName || 'Character';
  const drawingPreviewSize = isMobile ? 260 : 380;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileTap={{ scale: 0.992 }}
      onTap={onTap}
      transition={{ delay: Math.min(index * 0.015, 0.12), duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        width: '100%',
        padding: isMobile ? '0 2px' : '0 4px',
      }}
    >
      <div
        style={{
          minWidth: 0,
          maxWidth: isDrawingMessage 
            ? (isMobile ? '88%' : '60%') 
            : (isOwnMessage ? (isMobile ? '78%' : '48%') : (isMobile ? '82%' : '56%')),
          display: 'grid',
          gap: '6px',
          justifyItems: isOwnMessage ? 'end' : 'start',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
            alignItems: 'center',
            gap: '6px',
            width: '100%',
          }}
        >
          {isOwnMessage ? (
            <>
              <span style={{ color: palette.text, fontSize: isMobile ? '0.88rem' : '0.94rem', lineHeight: 1.15, fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
                {copy.you}
              </span>
              <ChatFaceAvatar src={avatarSrc} name={avatarName} palette={palette} size={30} />
            </>
          ) : (
            <>
              <ChatFaceAvatar src={avatarSrc} name={avatarName} palette={palette} size={30} />
              <span style={{ color: palette.text, fontSize: isMobile ? '0.88rem' : '0.94rem', lineHeight: 1.15, fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
                {author?.characterName || 'Unknown'}
              </span>
            </>
          )}
        </div>
        <div
          style={{
            width: '100%',
            background: bubbleBackground,
            color: bubbleColor,
            borderRadius: isOwnMessage ? '22px 22px 10px 22px' : '22px 22px 22px 10px',
            padding: isDrawingMessage ? '6px' : '11px 15px',
            border: bubbleBorder,
            borderBottom: bubbleBottomBorder,
            boxShadow: '0 12px 26px rgba(15, 23, 42, 0.07)',
            display: 'grid',
            gap: message.text && message.drawing ? '8px' : '0',
            overflow: 'hidden',
          }}
        >
          {message.drawing && (
            <div
              style={{
                width: '100%',
                maxWidth: `${drawingPreviewSize}px`,
                justifySelf: isOwnMessage ? 'end' : 'start',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                aspectRatio: '1 / 1',
              }}
            >
              <img
                src={message.drawing}
                alt={copy.drawingLabel}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  background: '#ffffff',
                }}
              />
            </div>
          )}
          {!!message.text && (
            <div
              style={{
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: isMobile ? '1.02rem' : '1.08rem',
                fontFamily: CHAT_FONT_FAMILY,
                fontWeight: 400,
                padding: isDrawingMessage ? '4px 6px 6px' : '0',
              }}
            >
              {message.text}
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
            width: '100%',
            padding: isOwnMessage ? '0 6px 0 0' : '0 0 0 4px',
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: '0.82rem', letterSpacing: '0.01em', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function DrawingPad({ canvasRef, isMobile, palette, brushSize, brushMode, brushColor, onBrushSizeChange, onBrushModeChange, onBrushColorChange, onClear, onUndo, onClose, copy }) {
  const isEraser = brushMode === 'eraser';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        display: 'grid',
        gap: '12px',
        padding: isMobile ? '14px' : '16px',
        background: '#ffffff',
        border: '1px solid #dbe7f3',
        borderRadius: '22px',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        fontFamily: CHAT_FONT_FAMILY,
        fontWeight: 400,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {DRAWING_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onBrushColorChange(color);
                onBrushModeChange('brush');
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '999px',
                background: color,
                border: !isEraser && brushColor === color ? '2px solid #0f172a' : '2px solid #ffffff',
                boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.4)',
                cursor: 'pointer',
              }}
              aria-label={`Color ${color}`}
            />
          ))}
          <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 4px' }} />
          <button
            type="button"
            onClick={() => onBrushModeChange(isEraser ? 'brush' : 'eraser')}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: isEraser ? '#f1f5f9' : '#ffffff',
              border: '1.5px solid',
              borderColor: isEraser ? '#94a3b8' : '#dbe2ea',
              color: isEraser ? '#0f172a' : '#64748b',
              cursor: 'pointer',
            }}
            title={isEraser ? 'Switch to Brush' : 'Switch to Eraser'}
          >
            <Eraser size={18} strokeWidth={isEraser ? 2.5 : 2} />
          </button>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{copy.drawingBrush}</span>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={brushSize}
            onChange={(event) => onBrushSizeChange(Number(event.target.value))}
            style={{ width: isMobile ? '96px' : '120px', accentColor: palette.border }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={DRAWING_WIDTH}
          height={DRAWING_HEIGHT}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerMove={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: isMobile ? '320px' : '380px',
            aspectRatio: '1 / 1',
            height: 'auto',
            borderRadius: '18px',
            background: '#ffffff',
            border: `2px solid ${palette.border}`,
            touchAction: 'none',
            cursor: 'crosshair',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ color: '#64748b', fontSize: '0.82rem' }}>Draw with mouse or touch.</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onUndo}
            style={{
              ...BUTTON_STYLE,
              padding: '9px 11px',
              background: '#ffffff',
              color: '#475569',
              borderColor: '#cbd5e1',
              borderBottomColor: '#94a3b8',
            }}
          >
            <RefreshCw size={15} strokeWidth={2.2} />
            {copy.drawingUndo}
          </button>
          <button
            type="button"
            onClick={onClear}
            style={{
              ...BUTTON_STYLE,
              padding: '9px 11px',
              background: '#ffffff',
              color: '#475569',
              borderColor: '#cbd5e1',
              borderBottomColor: '#94a3b8',
            }}
          >
            <Eraser size={15} strokeWidth={2.3} />
            {copy.clearDrawing}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...BUTTON_STYLE,
              padding: '9px 11px',
              background: '#e0f2fe',
              color: '#0369a1',
              borderColor: '#7dd3fc',
              borderBottomColor: '#38bdf8',
            }}
          >
            <PencilLine size={15} strokeWidth={2.3} />
            {copy.drawingDone}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function RoomStackAvatar({ participants, size = 44 }) {
  const visibleParticipants = participants.slice(0, 3);
  const itemSize = visibleParticipants.length <= 1 ? size : Math.round(size * 0.76);
  const overlap = Math.round(itemSize * 0.56);
  const width = visibleParticipants.length <= 1 ? itemSize : itemSize + ((visibleParticipants.length - 1) * overlap);

  return (
    <div style={{ position: 'relative', width: `${width}px`, height: `${itemSize}px`, flexShrink: 0 }}>
      {visibleParticipants.map((participant, index) => {
        const palette = getPaletteByIndex(index);
        return (
          <div
            key={`${participant.id}_${index}`}
            style={{
              position: 'absolute',
              left: `${index * overlap}px`,
              top: 0,
              width: `${itemSize}px`,
              height: `${itemSize}px`,
              borderRadius: '999px',
              overflow: 'hidden',
              background: '#ffffff',
              border: `2px solid ${palette.border}`,
              boxShadow: '0 6px 14px rgba(15, 23, 42, 0.08)',
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

function getRoomPreviewText(room, copy) {
  const latestMessage = [...(room.messages || [])].reverse().find((message) => message.type === 'message');
  if (!latestMessage) return copy.noMessages;
  if (latestMessage.text) return latestMessage.text;
  if (latestMessage.drawing) return `${copy.drawingLabel} sent`;
  return copy.noMessages;
}

function ChatMembersPanel({ savedRooms, publicRooms, activeRoomId, activeRoom, searchValue, onSearchChange, onOpenRoom, onCreateRoom, onJoinRoom, onExitCharacter, copy }) {
  const actionButtonStyle = {
    width: '28px',
    height: '28px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #dbe2ea',
    borderBottom: '2px solid #cbd5e1',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    cursor: 'pointer',
    padding: 0,
  };

  const metaChipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 7px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #dbe2ea',
    fontSize: '0.68rem',
    color: '#64748b',
    lineHeight: 1,
  };

  const renderRoomCard = (room, index, sectionLabel) => {
    const palette = getPaletteByIndex(index);
    const isCurrent = room.roomId === activeRoomId;
    const roomPreview = getRoomPreviewText(room, copy);

    return (
      <button
        type="button"
        onClick={() => onOpenRoom(room.roomId)}
        key={`${sectionLabel}_${room.roomId}`}
        style={{
          display: 'grid',
          gap: '7px',
          padding: '10px 12px',
          borderRadius: '18px',
          background: isCurrent ? palette.bg : '#ffffff',
          border: `1px solid ${isCurrent ? palette.border : '#dbe7f3'}`,
          borderBottom: `4px solid ${isCurrent ? palette.border : '#c7d7ea'}`,
          boxShadow: isCurrent ? `0 8px 18px ${palette.border}18` : '0 5px 12px rgba(15, 23, 42, 0.04)',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
          <RoomStackAvatar participants={room.participants || []} size={40} />
          <div style={{ minWidth: 0, flex: 1, display: 'grid', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ color: palette.text, fontSize: '0.96rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {room.title}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, flexShrink: 0 }}>
                {formatTime(room.updatedAt)}
              </div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.77rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {roomPreview}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '50px' }}>
          <span style={metaChipStyle}>
            {(room.participants || []).length} {copy.activePlayers.toLowerCase()}
          </span>
          <span style={metaChipStyle}>
            {(room.visibility || 'private') === 'public' ? copy.publicRoom : copy.privateRoom}
          </span>
          {isCurrent && (
            <span style={{ ...metaChipStyle, color: palette.text, borderColor: `${palette.border}88`, background: '#ffffff' }}>
              {copy.liveRoom}
            </span>
          )}
        </div>
      </button>
    );
  };

  const currentRoomCard = activeRoom || savedRooms.find((room) => room.roomId === activeRoomId) || null;
  const roomGroups = [
    { key: 'saved', label: copy.yourRooms, rooms: savedRooms, tint: '#ec4899' },
    { key: 'public', label: copy.publicRooms, rooms: publicRooms, tint: '#3b82f6' },
  ];

  return (
    <div
      style={{
        ...PANEL_STYLE,
        padding: '14px',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        gap: '12px',
        height: '100%',
        overflow: 'hidden',
        background: '#fffefc',
        fontFamily: CHAT_FONT_FAMILY,
        fontWeight: 400,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '10px',
          padding: '12px',
          borderRadius: '20px',
          background: '#ffffff',
          border: '1px solid #dbe7f3',
          borderBottom: '5px solid #c7d7ea',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'grid', gap: '6px', minWidth: 0 }}>
            <div style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: '1.22rem', color: '#0f172a', fontWeight: 400 }}>Chat</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ ...metaChipStyle, color: '#9d174d', borderColor: '#fbcfe8', background: '#fff5fb' }}>
                {copy.yourRooms} {savedRooms.length}
              </span>
              <span style={{ ...metaChipStyle, color: '#1d4ed8', borderColor: '#bfdbfe', background: '#f5f9ff' }}>
                {copy.publicRooms} {publicRooms.length}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            {[
              { icon: PlusCircle, onClick: onCreateRoom, label: copy.createLabel },
              { icon: UserRoundPlus, onClick: onJoinRoom, label: copy.joinLabel },
              { icon: DoorOpen, onClick: activeRoom ? onExitCharacter : undefined, label: copy.exitCharacter },
              { icon: RefreshCw, onClick: activeRoomId ? () => onOpenRoom(activeRoomId) : undefined, label: copy.refresh },
            ].map(({ icon: Icon, onClick, label }, index) => (
              <button
                key={index}
                type="button"
                onClick={onClick}
                disabled={!onClick}
                style={{
                  ...actionButtonStyle,
                  opacity: onClick ? 1 : 0.45,
                }}
                aria-label={label}
                title={label}
              >
                <Icon size={13} strokeWidth={2.1} />
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 11px',
            background: '#f8fbff',
            border: '1px solid #dbe2ea',
            borderRadius: '16px',
          }}
        >
          <Search size={14} strokeWidth={2.2} style={{ color: '#94a3b8' }} />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={copy.searchRooms}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              color: '#334155',
              fontSize: '0.86rem',
              fontFamily: CHAT_FONT_FAMILY,
              fontWeight: 400,
            }}
          />
        </div>

        {currentRoomCard && (
          <button
            type="button"
            onClick={() => onOpenRoom(currentRoomCard.roomId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 11px',
              borderRadius: '16px',
              background: '#f8fbff',
              border: '1px solid #dbe7f3',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <RoomStackAvatar participants={currentRoomCard.participants || []} size={38} />
            <div style={{ minWidth: 0, flex: 1, display: 'grid', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ color: '#0f172a', fontSize: '1.05rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentRoomCard.title}
                </div>
                <span style={{ ...metaChipStyle, fontSize: '0.72rem', padding: '3.5px 7px' }}>{copy.liveRoom}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.88rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getRoomPreviewText(currentRoomCard, copy)}
              </div>
            </div>
          </button>
        )}
      </div>

      <div
        className="hide-scrollbar"
        style={{
          display: 'grid',
          alignContent: 'start',
          gap: '10px',
          overflowY: 'auto',
          paddingRight: '2px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {!savedRooms.length && !publicRooms.length && (
          <div
            style={{
              padding: '12px',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              background: '#ffffff',
              color: '#64748b',
              fontSize: '0.82rem',
              lineHeight: 1.55,
              fontFamily: CHAT_FONT_FAMILY,
              fontWeight: 400,
            }}
          >
            {copy.noRoomsSaved}
          </div>
        )}

        {roomGroups.map((group) => (
          group.rooms.length ? (
            <div key={group.key} style={{ display: 'grid', gap: '7px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '0 2px' }}>
                <div style={{ color: group.tint, fontSize: '0.86rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{group.label}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{group.rooms.length}</div>
              </div>
              {group.rooms.map((room, index) => renderRoomCard(room, index + (group.key === 'public' ? savedRooms.length : 0), group.key))}
            </div>
          ) : null
        ))}

        {!publicRooms.length && (
          <div
            style={{
              padding: '12px',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              background: '#ffffff',
              color: '#94a3b8',
              fontSize: '0.78rem',
              fontFamily: CHAT_FONT_FAMILY,
              fontWeight: 400,
            }}
          >
            {copy.noPublicRooms}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatSettingsSheet({
  isMobile,
  room,
  participants,
  selectedCharacter,
  onPortraitSelect,
  onClose,
  onLeave,
  onEnd,
  onReclaim,
  onRedeemPin,
  pinInput,
  setPinInput,
  onCopyCode,
  onCopyChat,
  onVisibilityChange,
  busyAction,
  isCreator,
  copy,
}) {
  const [showPersonalKey, setShowPersonalKey] = useState(false);
  const [showMasterPin, setShowMasterPin] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  const handleCopy = useCallback(async (text, isPin = false) => {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // Visual feedback and haptics
      if (isPin) {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      }
      triggerHaptic('success');
    } catch (err) {
      console.error('Failed to copy', err);
      // Fallback: try one more time or just fail gracefully
      triggerHaptic('error');
    }
  }, []);

  const controlButtonStyle = {
    ...BUTTON_STYLE,
    padding: '9px 11px',
    flexDirection: 'row',
    background: '#ffffff',
    color: '#475569',
    borderColor: '#cbd5e1',
    borderBottomColor: '#94a3b8',
    borderWidth: '2px',
    borderBottomWidth: '4px',
    borderRadius: '15px',
    minHeight: '42px',
    gap: '6px',
    fontSize: '0.9rem',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'rgba(15, 23, 42, 0.12)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: isMobile ? 'stretch' : 'center',
        padding: isMobile ? '0' : '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: isMobile ? '100%' : 'min(720px, calc(100vw - 56px))',
          maxHeight: isMobile ? 'calc(100vh - 18px)' : 'min(760px, calc(100vh - 48px))',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          background: '#fffefc',
          border: '1px solid #dbe2ea',
          borderRadius: isMobile ? '28px 28px 0 0' : '28px',
          boxShadow: '0 22px 52px rgba(15, 23, 42, 0.16)',
          padding: isMobile ? '16px 14px 26px' : '18px 16px',
          display: 'grid',
          gap: isMobile ? '14px' : '16px',
          fontFamily: CHAT_FONT_FAMILY,
          fontWeight: 400,
        }}
        className="hide-scrollbar"
      >
        <div
          style={{
            display: 'grid',
            gap: '10px',
            padding: isMobile ? '12px' : '14px',
            borderRadius: '22px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
            border: '1px solid #dbe2ea',
            borderBottom: '5px solid #cbd5e1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <RoomStackAvatar participants={participants} size={76} />
              <div style={{ minWidth: 0, display: 'grid', gap: '4px' }}>
                <div style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: isMobile ? '1.28rem' : '1.38rem', color: '#0f172a', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {room.title}
                </div>
                <div style={{ color: '#64748b', fontSize: '1.08rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
                  {participants.length} {participants.length === 1 ? (copy.personLabel || 'person').toLowerCase() : copy.peopleLabel.toLowerCase()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '999px',
                  border: '1.5px solid #dbe2ea',
                  borderBottom: '3.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s ease',
                }}
                aria-label="Close"
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
              gap: '16px',
              alignItems: 'start',
            }}
          >
            {/* Column 1: Identity & Social */}
            <div style={{ display: 'grid', gap: '14px' }}>
              {/* Portrait Picker */}
              <div
                style={{
                  display: 'grid',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '22px',
                  background: '#ffffff',
                  border: '1px solid #dbe2ea',
                  borderBottom: '4px solid #dbe2ea',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{copy.portraitLabel}</div>
                <PortraitPicker
                  isMobile={isMobile}
                  selectedCharacter={selectedCharacter}
                  onSelect={onPortraitSelect}
                  disabled={busyAction === 'switch-character'}
                  compact
                  copy={copy}
                />
              </div>

              {/* Participants List */}
              <div
                style={{
                  display: 'grid',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '22px',
                  background: '#ffffff',
                  border: '1px solid #dbe2ea',
                  borderBottom: '4px solid #dbe2ea',
                  alignContent: 'start',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{copy.peopleLabel}</div>
                <div className="hide-scrollbar" style={{ display: 'grid', gap: '8px', maxHeight: isMobile ? 'none' : '320px', overflowY: 'auto', paddingRight: '2px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {participants.map((participant, index) => {
                    const participantPalette = getPaletteByIndex(index);
                    return (
                      <div
                        key={participant.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '18px',
                          background: '#ffffff',
                          border: `1px solid ${participantPalette.border}66`,
                        }}
                      >
                        <ChatFaceAvatar src={participant.portraitSrc} name={participant.characterName} palette={participantPalette} size={42} />
                        <div style={{ color: participantPalette.text, fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, fontSize: '1.1rem' }}>{participant.characterName}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Management & Security */}
            <div style={{ display: 'grid', gap: '14px' }}>
              {/* Room ID & Settings (Moved to Top) */}
              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '22px',
                  background: '#ffffff',
                  border: '1px solid #dbe2ea',
                  borderBottom: '4px solid #dbe2ea',
                }}
              >
                {/* Room ID */}
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.84rem', fontFamily: CHAT_FONT_FAMILY }}>{copy.roomCodeLabel}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, padding: '10px 14px', borderRadius: '999px', background: '#f8fafc', border: '1.25px solid #dbe2ea', color: '#0f172a', fontSize: '1rem', letterSpacing: '0.08em', fontFamily: CHAT_FONT_FAMILY, fontWeight: 500 }}>
                      {room.roomId}
                    </div>
                    <button type="button" onClick={onCopyCode} style={{ ...BUTTON_STYLE, padding: '8px 12px', borderRadius: '14px', fontSize: '0.9rem' }}>
                      <Copy size={16} strokeWidth={2.3} />
                      {copy.copyCode.includes(' ') ? 'Copy' : copy.copyCode}
                    </button>
                  </div>
                </div>

                {/* Visibility */}
                <div style={{ display: 'grid', gap: '8px', marginTop: '4px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.84rem', fontFamily: CHAT_FONT_FAMILY }}>{copy.visibilityLabel}</div>
                  {isCreator ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['private', 'public'].map((value) => {
                        const selected = (room.visibility || 'private') === value;
                        const label = value === 'public' ? copy.publicRoom : copy.privateRoom;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => onVisibilityChange(value)}
                            disabled={busyAction === 'settings'}
                            style={{
                              ...BUTTON_STYLE,
                              flex: 1,
                              padding: '9px',
                              background: selected ? '#eff6ff' : '#ffffff',
                              color: selected ? '#1d4ed8' : '#475569',
                              borderColor: selected ? '#93c5fd' : '#dbe2ea',
                              borderBottomColor: selected ? '#2563eb' : '#94a3b8',
                              borderRadius: '12px',
                              fontSize: '0.92rem',
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: '99px', background: '#f8fafc', border: '1px solid #dbe2ea', fontSize: '0.92rem', color: '#475569', alignSelf: 'start' }}>
                      {(room.visibility || 'private') === 'public' ? copy.publicRoom : copy.privateRoom}
                    </div>
                  )}
                </div>
              </div>

              {/* Room Controls (Quick Actions) */}
              <div
                style={{
                  display: 'grid',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '22px',
                  background: '#ffffff',
                  border: '1px solid #dbe2ea',
                  borderBottom: '4px solid #dbe2ea',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{copy.roomControls}</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isCreator ? 3 : 2}, minmax(0, 1fr))`, gap: '9px' }}>
                  <button type="button" onClick={onCopyChat} style={controlButtonStyle}>
                    <MessageCircleHeart size={16} strokeWidth={2.3} />
                    <span>{copy.copyChat}</span>
                  </button>
                  <button type="button" onClick={onLeave} style={controlButtonStyle}>
                    <DoorOpen size={16} strokeWidth={2.3} />
                    <span>{copy.exitCharacter}</span>
                  </button>
                  {isCreator && (
                    <button type="button" onClick={onEnd} style={{ ...controlButtonStyle, background: '#fff1f2', color: '#be123c', borderColor: '#fda4af', borderBottomColor: '#fb7185' }}>
                      <XCircle size={16} strokeWidth={2.3} />
                      <span>{copy.endRoom}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Security & Reclaim Section */}
              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '22px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderBottom: '6px solid #94a3b8',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 500 }}>
                  <ShieldCheck size={18} strokeWidth={2.5} />
                  {copy.security || 'Security & Identity'}
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {/* Personal Identity Key */}
                  <div style={{ display: 'grid', gap: '6px', background: '#ffffff', padding: '12px', borderRadius: '18px', border: '1.5px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.92rem', fontFamily: CHAT_FONT_FAMILY }}>{copy.personalKeyLabel || 'Personal identity key'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, padding: '6px 12px', background: '#f1f5f9', borderRadius: '99px', fontSize: '1rem', color: '#334155', letterSpacing: '0.12em', fontFamily: CHAT_FONT_FAMILY, fontWeight: 500 }}>
                        {showPersonalKey ? (getStoredIdentityKey(room.roomId) || '------') : '......'}
                      </div>
                      <button type="button" onClick={() => setShowPersonalKey(!showPersonalKey)} style={{ width: '42px', height: '42px', borderRadius: '14px', border: '1.5px solid #dbe2ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', background: '#ffffff' }}>
                        {showPersonalKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button type="button" onClick={() => handleCopy(getStoredIdentityKey(room.roomId))} style={{ width: '42px', height: '42px', borderRadius: '14px', border: '1.5px solid #cbd5e1', borderBottomWidth: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: copiedKey ? '#f0fdf4' : '#ffffff', color: copiedKey ? '#22c55e' : '#475569', cursor: 'pointer' }}>
                        {copiedKey ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Master Pin (Owner Only) */}
                  {isCreator && (
                    <div style={{ display: 'grid', gap: '6px', background: '#fff1f2', padding: '12px', borderRadius: '18px', border: '1.5px solid #fecdd3' }}>
                      <div style={{ color: '#be123c', fontSize: '0.92rem', fontFamily: CHAT_FONT_FAMILY }}>{copy.reclaimPinLabel} (Creator only)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, padding: '6px 12px', background: '#ffffff', borderRadius: '99px', fontSize: '1rem', color: '#9d174d', letterSpacing: '0.12em', fontFamily: CHAT_FONT_FAMILY, fontWeight: 500 }}>
                          {showMasterPin ? (getStoredRoomPin(room.roomId) || '------') : '......'}
                        </div>
                        <button type="button" onClick={() => setShowMasterPin(!showMasterPin)} style={{ width: '42px', height: '42px', borderRadius: '14px', border: '1.5px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#be123c', cursor: 'pointer', background: '#ffffff' }}>
                          {showMasterPin ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button type="button" onClick={() => handleCopy(getStoredRoomPin(room.roomId), true)} style={{ width: '42px', height: '42px', borderRadius: '14px', border: '1.5px solid #fda4af', borderBottomWidth: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: copiedPin ? '#f0fdf4' : '#ffffff', color: copiedPin ? '#22c55e' : '#9d174d', cursor: 'pointer' }}>
                          {copiedPin ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reclaim Input (Smart Input) */}
                  <div
                    style={{
                      display: 'grid',
                      gap: '10px',
                      padding: '12px',
                      borderRadius: '18px',
                      background: '#f0f9ff',
                      border: '1.5px solid #bae6fd',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontSize: '0.82rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 500 }}>
                      <KeyRound size={16} strokeWidth={2.5} />
                      {copy.reclaimLabel} (Enter Key or PIN)
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder={copy.reclaimPinPlaceholder}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                        style={{
                          ...INPUT_STYLE,
                          flex: 1,
                          padding: '8px 14px',
                          letterSpacing: '0.12em',
                          textAlign: 'center',
                          fontSize: '1rem',
                          textTransform: 'uppercase',
                          borderRadius: '14px',
                          border: '2px solid #bae6fd',
                          background: '#ffffff',
                        }}
                      />
                      <button
                        type="button"
                        onClick={onRedeemPin}
                        disabled={busyAction === 'reclaim' || pinInput.length !== 6}
                        style={{
                          ...BUTTON_STYLE,
                          width: '46px',
                          height: '42px',
                          background: '#0ea5e9',
                          color: '#ffffff',
                          borderColor: '#0284c7',
                          borderBottomColor: '#0369a1',
                          borderRadius: '14px',
                          opacity: busyAction === 'reclaim' || pinInput.length !== 6 ? 0.6 : 1,
                        }}
                      >
                        {busyAction === 'reclaim' ? <LoaderCircle size={18} style={SPIN_ICON_STYLE} /> : <CheckCircle2 size={20} strokeWidth={2.5} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PortraitPicker({ isMobile, selectedCharacter, onSelect, disabled, compact = false, copy }) {
  const options = useMemo(
    () => PORTRAIT_DATA.map((portrait, index) => ({
      ...portrait,
      palette: getPaletteByIndex(index),
      tilt: index % 2 === 0 ? -1.5 : 1.5,
    })),
    [],
  );
  const selectedIndex = Math.max(options.findIndex((portrait) => portrait.name === selectedCharacter), 0);
  const activePortrait = options[selectedIndex] || options[0];
  const touchStartRef = useRef(null);

  const moveSelection = useCallback((direction) => {
    const nextIndex = (selectedIndex + direction + options.length) % options.length;
    onSelect(options[nextIndex].name);
  }, [onSelect, options, selectedIndex]);

  const handleLucky = useCallback(() => {
    if (options.length <= 1) return;
    let nextIndex = selectedIndex;
    while (nextIndex === selectedIndex) {
      nextIndex = Math.floor(Math.random() * options.length);
    }
    onSelect(options[nextIndex].name);
  }, [onSelect, options, selectedIndex]);

  return (
    <div style={{ display: 'grid', gap: compact ? '10px' : '14px', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
      <div
        onTouchStart={(event) => {
          touchStartRef.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const startX = touchStartRef.current;
          const endX = event.changedTouches[0]?.clientX ?? null;
          touchStartRef.current = null;
          if (startX == null || endX == null) return;
          const delta = endX - startX;
          if (Math.abs(delta) < 42) return;
          moveSelection(delta < 0 ? 1 : -1);
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '40px minmax(0, 1fr) 40px' : '48px minmax(0, 1fr) 48px',
          gap: compact ? '8px' : '12px',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => moveSelection(-1)}
          disabled={disabled}
          style={{
            width: compact ? '40px' : '48px',
            height: compact ? '40px' : '48px',
            borderRadius: '999px',
            border: '1px solid #dbe7f3',
            background: '#ffffff',
            color: '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: disabled ? 0.6 : 1,
            fontFamily: CHAT_FONT_FAMILY,
            fontWeight: 400,
          }}
          aria-label="Previous character"
        >
          <ChevronLeft size={compact ? 18 : 20} strokeWidth={2.4} />
        </button>

        <motion.button
          key={activePortrait.name}
          type="button"
          onClick={() => onSelect(activePortrait.name)}
          whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
          whileTap={disabled ? undefined : { scale: 0.98 }}
          disabled={disabled}
          initial={{ opacity: 0.85, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            ...BUTTON_STYLE,
            width: '100%',
            maxWidth: compact ? '180px' : (isMobile ? '236px' : '272px'),
            justifySelf: 'center',
            padding: compact ? '12px 10px' : '16px 14px',
            flexDirection: 'column',
            gap: compact ? '10px' : '14px',
            background: activePortrait.palette.bg,
            color: activePortrait.palette.text,
            border: `3.5px solid ${activePortrait.palette.border}`,
            borderBottom: `10px solid ${activePortrait.palette.border}`,
            boxShadow: `0 16px 30px ${activePortrait.palette.border}33`,
            minHeight: compact ? '176px' : (isMobile ? '228px' : '256px'),
            borderRadius: '26px',
            overflow: 'hidden',
            position: 'relative',
            opacity: disabled ? 0.7 : 1,
          }}
          className="paper-interact"
        >
          <img
            src={activePortrait.src}
            alt={activePortrait.name}
            draggable="false"
            style={{
              width: '100%',
              height: compact ? '118px' : (isMobile ? '156px' : '176px'),
              objectFit: 'contain',
              filter: 'drop-shadow(4px 8px 12px rgba(15, 23, 42, 0.18))',
            }}
          />
          <span
            style={{
              fontSize: compact ? '0.96rem' : (isMobile ? '1rem' : '1.08rem'),
              color: activePortrait.palette.text,
              background: '#ffffff',
              padding: '4px 18px',
              borderRadius: '999px',
              border: `3px solid ${activePortrait.palette.border}`,
              boxShadow: '0 4px 0 rgba(15, 23, 42, 0.05)',
              textAlign: 'center',
              fontFamily: CHAT_FONT_FAMILY,
              fontWeight: 400,
            }}
          >
            {activePortrait.name}
          </span>
        </motion.button>

        <button
          type="button"
          onClick={() => moveSelection(1)}
          disabled={disabled}
          style={{
            width: compact ? '40px' : '48px',
            height: compact ? '40px' : '48px',
            borderRadius: '999px',
            border: '1px solid #dbe7f3',
            background: '#ffffff',
            color: '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: disabled ? 0.6 : 1,
            fontFamily: CHAT_FONT_FAMILY,
            fontWeight: 400,
          }}
          aria-label="Next character"
        >
          <ChevronRight size={compact ? 18 : 20} strokeWidth={2.4} />
        </button>
      </div>

      <div style={{ display: 'grid', justifyItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={handleLucky}
          disabled={disabled}
          style={{
            ...BUTTON_STYLE,
            padding: compact ? '10px 12px' : '11px 14px',
            background: '#fff7ed',
            color: '#9a3412',
            borderColor: '#fdba74',
            borderBottomColor: '#f97316',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <RefreshCw size={compact ? 15 : 16} strokeWidth={2.4} />
          {copy?.luckyPick || "I'm feeling lucky"}
        </button>
        <div style={{ color: '#94a3b8', fontSize: compact ? '0.86rem' : '0.92rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
          {selectedIndex + 1}/{options.length}
        </div>
      </div>
    </div>
  );
}

const ChatPage = ({ isMobile, uiLanguage = 'en' }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const copy = useMemo(
    () => ({ ...DEFAULT_CHAT_COPY, ...(UI_TEXT.en.chat || {}), ...(t.chat || {}) }),
    [t],
  );
  const initialProfile = useMemo(() => readProfile(), []);
  const initialLastRoomId = useMemo(() => readLastRoomId(), []);
  const [savedLastRoomId, setSavedLastRoomId] = useState(initialLastRoomId);
  const [roomCatalog, setRoomCatalog] = useState(() => readCatalogCache());
  const [savedRoomIds, setSavedRoomIds] = useState(() => readSavedRoomIds());
  const [publicRooms, setPublicRooms] = useState([]);
  const [mode, setMode] = useState('create');
  const [profile, setProfile] = useState(initialProfile);
  const [roomVisibility, setRoomVisibility] = useState('private');
  const [roomTitle, setRoomTitle] = useState('');
  const [roomCode, setRoomCode] = useState(initialLastRoomId);
  const [messageDraft, setMessageDraft] = useState('');
  const [room, setRoom] = useState(null);
  const [activeParticipantId, setActiveParticipantId] = useState(() => getStoredParticipant(initialLastRoomId));
  const [statusMessage, setStatusMessage] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [hydrating, setHydrating] = useState(!!initialLastRoomId);
  const [drawingOpen, setDrawingOpen] = useState(false);
  const [drawingDraft, setDrawingDraft] = useState('');
  const [drawingBrushSize, setDrawingBrushSize] = useState(4);
  const [drawingBrushColor, setDrawingBrushColor] = useState(DRAWING_COLORS[0]);
  const [drawingMode, setDrawingMode] = useState('brush'); // 'brush' or 'eraser'
  const [drawingSnapshots, setDrawingSnapshots] = useState([]);
  const [composerActive, setComposerActive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [sendPulse, setSendPulse] = useState(0);
  const [typingFocused, setTypingFocused] = useState(false);
  const messageListRef = useRef(null);
  const messageInputRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const drawingActiveRef = useRef(false);
  const drawingDraftRef = useRef('');
  const drawingBrushSizeRef = useRef(drawingBrushSize);
  const drawingBrushColorRef = useRef(drawingBrushColor);
  const drawingModeRef = useRef(drawingMode);
  const typingTimeoutRef = useRef(null);
  const threadScrollStateRef = useRef({ roomId: '', messageCount: 0 });

  const portraitByName = useMemo(
    () => Object.fromEntries(PORTRAIT_DATA.map((portrait) => [portrait.name, portrait])),
    [],
  );

  const selectedPortrait = portraitByName[profile.characterName] || PORTRAIT_DATA[0];
  const participants = room?.participants || [];
  const savedRooms = useMemo(
    () =>
      savedRoomIds
        .map((roomId) => {
          if (room?.roomId === roomId) return room;
          return roomCatalog[roomId];
        })
        .filter(Boolean),
    [room, roomCatalog, savedRoomIds],
  );
  const visiblePublicRooms = useMemo(
    () => publicRooms.filter((publicRoom) => !savedRooms.some((savedRoom) => savedRoom.roomId === publicRoom.roomId)),
    [publicRooms, savedRooms],
  );
  const filteredSavedRooms = useMemo(() => {
    const query = roomSearch.trim().toLowerCase();
    const matchRoom = (savedRoom) => {
      const searchable = [
        savedRoom.title,
        savedRoom.roomId,
        ...(savedRoom.participants || []).map((participant) => participant.characterName),
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(query);
    };

    return {
      saved: query ? savedRooms.filter(matchRoom) : savedRooms,
      public: query ? visiblePublicRooms.filter(matchRoom) : visiblePublicRooms,
    };
  }, [roomSearch, savedRooms, visiblePublicRooms]);
  const typingParticipants = useMemo(
    () => participants.filter((participant) => room?.typingParticipants?.[participant.id] && participant.id !== activeParticipantId),
    [activeParticipantId, participants, room?.typingParticipants],
  );
  const activeParticipant = room?.participants?.find((participant) => participant.id === activeParticipantId) || null;
  const activeParticipantIndex = Math.max(participants.findIndex((participant) => participant.id === activeParticipantId), 0);
  const activeParticipantPalette = getPaletteByIndex(activeParticipantIndex);
  const isCreator = !!room && !!activeParticipant && (room.creatorId === activeParticipantId || !!activeParticipant.isCreator);

  const persistLastRoomId = useCallback((nextRoomId) => {
    writeLastRoomId(nextRoomId);
    setSavedLastRoomId(nextRoomId);
  }, []);

  const rememberSavedRoom = useCallback((nextRoomId) => {
    if (!nextRoomId) return;
    const normalizedId = getNormalizedRoomId(nextRoomId);
    setSavedRoomIds((current) => {
      const next = [normalizedId, ...current.filter((id) => id !== normalizedId)].slice(0, 20);
      writeSavedRoomIds(next);
      return next;
    });
  }, []);

  const forgetSavedRoom = useCallback((roomId) => {
    if (!roomId) return;
    const normalizedId = getNormalizedRoomId(roomId);
    setSavedRoomIds((current) => {
      const next = current.filter((id) => id !== normalizedId);
      writeSavedRoomIds(next);
      return next;
    });
    setRoomCatalog((current) => {
      if (!current[normalizedId]) return current;
      const next = { ...current };
      delete next[normalizedId];
      writeCatalogCache(next);
      return next;
    });
  }, []);

  const resolveRoomSession = useCallback(async (targetRoomId, { autoJoinPublic = false } = {}) => {
    const fetchedRoom = await fetchChatRoom(targetRoomId);
    const userId = getUniversalUserId();
    const creatorToken = getStoredCreatorToken(targetRoomId);

    const participantStillPresent = !!fetchedRoom.participants.find((p) => p.id === userId);
    const creatorNeedsReclaim = !!creatorToken && (fetchedRoom.creatorId !== userId);

    const shouldJoin =
      creatorNeedsReclaim
      || !getStoredIdentityKey(targetRoomId)
      || (
        !participantStillPresent
        && (
          !!creatorToken
          || (autoJoinPublic && (fetchedRoom.visibility || 'private') === 'public')
        )
      );

    if (!shouldJoin) {
      return {
        room: fetchedRoom,
        participantId: userId,
      };
    }

    const { room: nextRoom, participantId, reclaimCode } = await joinChatRoom(targetRoomId, {
      participantId: userId,
      characterName: profile.characterName,
      portraitSrc: selectedPortrait.src,
      creatorToken,
    });

    return {
      room: nextRoom,
      participantId: participantId || userId,
      reclaimCode,
    };
  }, [getStoredIdentityKey, profile.characterName, selectedPortrait.src]);

  useEffect(() => {
    writeProfile(profile);
  }, [profile]);

  useEffect(() => {
    drawingDraftRef.current = drawingDraft;
  }, [drawingDraft]);

  useEffect(() => {
    drawingBrushSizeRef.current = drawingBrushSize;
  }, [drawingBrushSize]);

  useEffect(() => {
    drawingBrushColorRef.current = drawingBrushColor;
  }, [drawingBrushColor]);

  useEffect(() => {
    drawingModeRef.current = drawingMode;
  }, [drawingMode]);

  useEffect(() => {
    const textarea = messageInputRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [messageDraft]);

  useEffect(() => {
    if (!room?.roomId) return;
    setRoomCatalog((current) => {
      const next = { ...current, [room.roomId]: room };
      writeCatalogCache(next);
      return next;
    });
  }, [room]);

  useEffect(() => {
    if (!room?.visibility) return;
    setRoomVisibility(room.visibility === 'public' ? 'public' : 'private');
  }, [room?.visibility]);

  useEffect(() => {
    if (!drawingOpen) return;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = drawingBrushColorRef.current;
    context.lineWidth = drawingBrushSizeRef.current;

    if (drawingDraftRef.current) {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = drawingDraftRef.current;
    }

    let lastPoint = null;

    const getPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      const source = event.touches?.[0] || event;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (source.clientX - rect.left) * scaleX,
        y: (source.clientY - rect.top) * scaleY,
      };
    };

    const start = (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const currentData = canvas.toDataURL('image/png');
      setDrawingSnapshots((current) => {
        // Only add if the last one is different or we are starting fresh
        if (current.length > 0 && current[current.length - 1] === currentData) return current;
        return [...current.slice(-19), currentData];
      });
      
      drawingActiveRef.current = true;
      lastPoint = getPoint(event);
      
      const isEraser = drawingModeRef.current === 'eraser';
      context.strokeStyle = isEraser ? '#ffffff' : drawingBrushColorRef.current;
      context.lineWidth = drawingBrushSizeRef.current;
      context.beginPath();
      context.moveTo(lastPoint.x, lastPoint.y);
    };

    const move = (event) => {
      if (!drawingActiveRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      const nextPoint = getPoint(event);
      const midPoint = {
        x: (lastPoint.x + nextPoint.x) / 2,
        y: (lastPoint.y + nextPoint.y) / 2,
      };
      context.quadraticCurveTo(lastPoint.x, lastPoint.y, midPoint.x, midPoint.y);
      context.stroke();
      lastPoint = nextPoint;
    };

    const end = () => {
      if (!drawingActiveRef.current) return;
      drawingActiveRef.current = false;
      context.lineTo(lastPoint.x, lastPoint.y);
      context.stroke();
      context.closePath();
      setDrawingDraft(canvas.toDataURL('image/png'));
    };

    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);

    return () => {
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };
  }, [drawingOpen, sendPulse]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList || !room?.roomId) return;

    const previous = threadScrollStateRef.current;
    const nextMessageCount = room.messages.length;
    const isRoomChange = previous.roomId && previous.roomId !== room.roomId;
    const hasNewMessage = previous.messageCount !== nextMessageCount;

    if (isRoomChange || hasNewMessage) {
      messageList.scrollTo({
        top: messageList.scrollHeight,
        behavior: isRoomChange ? 'auto' : 'smooth',
      });
    }

    threadScrollStateRef.current = {
      roomId: room.roomId,
      messageCount: nextMessageCount,
    };
  }, [room?.roomId, room?.messages?.length]);

  useEffect(() => {
    if (!room?.roomId || !activeParticipantId) return undefined;

    const hasDraft = !!messageDraft.trim() || !!drawingDraft || typingFocused;
    if (!hasDraft) {
      setChatTypingState(room.roomId, { participantId: activeParticipantId, isTyping: false }).catch(() => {});
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      return undefined;
    }

    setChatTypingState(room.roomId, { participantId: activeParticipantId, isTyping: true }).catch(() => {});
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      setChatTypingState(room.roomId, { participantId: activeParticipantId, isTyping: false }).catch(() => {});
      typingTimeoutRef.current = null;
    }, TYPING_DEBOUNCE_MS);

    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [activeParticipantId, drawingDraft, messageDraft, room?.roomId, typingFocused]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const lastRoomId = savedLastRoomId;
    if (!lastRoomId) {
      setHydrating(false);
      return undefined;
    }

    let cancelled = false;
    resolveRoomSession(lastRoomId)
      .then(({ room: nextRoom, participantId, reclaimCode }) => {
        if (cancelled) return;
        setRoom(nextRoom);
        setRoomCode(nextRoom.roomId);
        setActiveParticipantId(participantId);
        if (reclaimCode) writeIdentityKey(nextRoom.roomId, reclaimCode);
        if (participantId) {
          setStoredParticipant(nextRoom.roomId, participantId);
        }
        setStatusMessage(`Reconnected to ${nextRoom.roomId}.`);
        setErrorMessage('');
        rememberSavedRoom(nextRoom.roomId);
      })
      .catch((error) => {
        if (cancelled) return;
        removeStoredParticipant(lastRoomId);
        removeStoredCreatorToken(lastRoomId);
        persistLastRoomId('');
        forgetSavedRoom(lastRoomId);
        if (error.status === 404) {
          setStatusMessage(`The last room (${lastRoomId}) is no longer active.`);
        } else {
          setErrorMessage(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [forgetSavedRoom, persistLastRoomId, rememberSavedRoom, resolveRoomSession, savedLastRoomId]);

  useEffect(() => {
    if (!savedRoomIds.length) return undefined;

    let cancelled = false;

    const syncSavedRooms = async () => {
      const results = await Promise.all(
        savedRoomIds.map(async (savedRoomId) => {
          try {
            const nextRoom = await fetchChatRoom(savedRoomId);
            return { roomId: savedRoomId, room: nextRoom };
          } catch (error) {
            return { roomId: savedRoomId, error };
          }
        }),
      );

      if (cancelled) return;

      const nextCatalog = {};
      const endedRooms = [];

      results.forEach(({ roomId: fetchedRoomId, room: fetchedRoom, error }) => {
        if (fetchedRoom) {
          nextCatalog[fetchedRoomId] = fetchedRoom;
        } else if (error?.status === 404) {
          // Only remove if server definitively says the room is gone (404)
          endedRooms.push(fetchedRoomId);
        } else {
          // If server error (500, timeout), keep the cached metadata
          console.warn(`Sync failed for room ${fetchedRoomId}, keeping cached version.`, error);
        }
      });

      if (Object.keys(nextCatalog).length) {
        setRoomCatalog((current) => {
          const next = { ...current, ...nextCatalog };
          writeCatalogCache(next);
          return next;
        });
      }

      if (!endedRooms.length) return;

      endedRooms.forEach((endedRoomId) => {
        removeStoredParticipant(endedRoomId);
        forgetSavedRoom(endedRoomId);
        setRoomCatalog((current) => {
          const next = { ...current };
          delete next[endedRoomId];
          writeCatalogCache(next);
          return next;
        });
      });

      if (endedRooms.includes(savedLastRoomId)) {
        persistLastRoomId('');
      }

      if (room?.roomId && endedRooms.includes(room.roomId)) {
        setRoomCode(room.roomId);
        setRoom(null);
        setActiveParticipantId('');
        setChatOpen(false);
        setSettingsOpen(false);
        setStatusMessage(`Room ${room.roomId} has ended.`);
        setErrorMessage('');
      }
    };

    syncSavedRooms();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        syncSavedRooms();
      }
    }, POLL_INTERVAL_MS * 3);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [forgetSavedRoom, persistLastRoomId, room?.roomId, savedLastRoomId, savedRoomIds]);

  useEffect(() => {
    let cancelled = false;

    const refreshPublicRooms = async () => {
      try {
        const rooms = await fetchPublicChatRooms();
        if (!cancelled) {
          setPublicRooms(rooms);
        }
      } catch {
        if (!cancelled) {
          setPublicRooms([]);
        }
      }
    };

    refreshPublicRooms();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        refreshPublicRooms();
      }
    }, POLL_INTERVAL_MS * 2);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!room?.roomId) return undefined;

    let cancelled = false;
    const roomId = room.roomId;

    const refreshRoom = async ({ silent = false } = {}) => {
      try {
        const nextRoom = await fetchChatRoom(roomId);
        if (cancelled) return;
        setRoom(nextRoom);
        if (!silent) {
          setStatusMessage(`Room ${roomId} refreshed.`);
        }
        setErrorMessage('');
      } catch (error) {
        if (cancelled) return;

        if (error.status === 404) {
          removeStoredParticipant(roomId);
          persistLastRoomId('');
          forgetSavedRoom(roomId);
          setRoom(null);
          setActiveParticipantId('');
          setRoomCode(roomId);
          setStatusMessage(`Room ${roomId} has ended.`);
          setErrorMessage('');
          return;
        }

        if (!silent) {
          setErrorMessage(error.message);
        }
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        refreshRoom({ silent: true });
      }
    }, ACTIVE_ROOM_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [forgetSavedRoom, persistLastRoomId, room?.roomId]);

  const updateProfileField = useCallback((key, value) => {
    setProfile((current) => ({ ...current, [key]: value }));
  }, []);

  const clearDrawingDraft = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    setDrawingDraft('');
    setDrawingSnapshots([]);
  }, []);

  const restoreDrawingFromDataUrl = useCallback((dataUrl) => {
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    if (!dataUrl) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      setDrawingDraft('');
      return;
    }

    const image = new Image();
    image.onload = () => {
      // Clear and draw atomically inside onload to prevent white flash
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setDrawingDraft(canvas.toDataURL('image/png'));
    };
    image.src = dataUrl;
  }, []);

  const handleUndoDrawing = useCallback(() => {
    setDrawingSnapshots((current) => {
      if (!current.length) return current;
      const next = current.slice(0, -1);
      const prevState = next[next.length - 1];
      
      // If we are at the very beginning (no more snapshots), 
      // check if we have a current drawing that is NOT empty.
      // If we do, we restore to empty. Otherwise we just stop.
      restoreDrawingFromDataUrl(prevState || '');
      return next;
    });
  }, [restoreDrawingFromDataUrl]);

  const validateProfile = useCallback(() => {
    if (!profile.characterName) return 'Pick a portrait card first.';
    return '';
  }, [profile]);

  const handleRoomConnected = useCallback((nextRoom, participantId, successText) => {
    setRoom(nextRoom);
    setRoomCode(nextRoom.roomId);
    setActiveParticipantId(participantId);
    setStatusMessage(successText);
    setErrorMessage('');
    setMessageDraft('');
    setDrawingDraft('');
    setDrawingOpen(false);
    setComposerActive(false);
    setChatOpen(true);
    setSettingsOpen(false);
    setDrawingSnapshots([]);
    if (participantId) {
      setStoredParticipant(nextRoom.roomId, participantId);
    }
    rememberSavedRoom(nextRoom.roomId);
    persistLastRoomId(nextRoom.roomId);
    triggerHaptic('success');
  }, [persistLastRoomId, rememberSavedRoom]);

  const handleCreateRoom = useCallback(async () => {
    const validationError = validateProfile();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const trimmedRoomTitle = roomTitle.trim();
    if (!trimmedRoomTitle) {
      setErrorMessage(copy.roomTitleRequired || 'Add a room name before opening the room.');
      return;
    }

    const participantId = getUniversalUserId();
    setBusyAction('create');

    try {
      const { room: nextRoom, creatorToken, reclaimPin, reclaimCode } = await createChatRoom({
        participantId,
        characterName: profile.characterName,
        portraitSrc: selectedPortrait.src,
        roomTitle: trimmedRoomTitle,
        visibility: roomVisibility,
      });

      if (creatorToken) {
        setStoredCreatorToken(nextRoom.roomId, creatorToken);
      }
      if (reclaimPin) {
        writeRoomPin(nextRoom.roomId, reclaimPin);
      }
      if (reclaimCode) {
        writeIdentityKey(nextRoom.roomId, reclaimCode);
      }
      handleRoomConnected(nextRoom, participantId, `Room ${nextRoom.roomId} is live.`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [copy.roomTitleRequired, handleRoomConnected, profile, roomTitle, roomVisibility, selectedPortrait.src, validateProfile]);

  const handleJoinRoom = useCallback(async () => {
    const trimmedCode = roomCode.trim();
    if (!trimmedCode) {
      setErrorMessage('Enter a room code.');
      return;
    }

    const validationError = validateProfile();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const normalizedRoomCode = getNormalizedRoomId(trimmedCode);
    if (normalizedRoomCode.length < 5) {
      setErrorMessage('Enter a valid room code.');
      return;
    }

    setBusyAction('join');

    try {
      const { room: nextRoom, participantId: joinedId, reclaimCode } = await resolveRoomSession(normalizedRoomCode);
      if (reclaimCode) {
        writeIdentityKey(nextRoom.roomId, reclaimCode);
      }
      handleRoomConnected(nextRoom, joinedId, `Joined ${nextRoom.roomId}.`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [handleRoomConnected, profile, resolveRoomSession, roomCode, validateProfile]);

  const handleRedeemPin = useCallback(async () => {
    if (!room?.roomId) return;
    if (!pinInput.trim()) return;

    const participantId = getUniversalUserId();
    setBusyAction('reclaim');
    try {
      const response = await fetch(`/api/chat/rooms/${room.roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reclaim',
          reclaimCode: pinInput.trim(),
          participantId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to redeem key');
      }

      const { room: nextRoom, creatorToken, reclaimedParticipantId } = await response.json();
      
      // If we got a creatorToken back, the code we used was likely the Master Pin
      if (creatorToken) {
        setStoredCreatorToken(nextRoom.roomId, creatorToken);
        writeRoomPin(nextRoom.roomId, pinInput.trim());
      }
      
      // Always store the code we just used as our new identity key for this room
      writeIdentityKey(nextRoom.roomId, pinInput.trim().toUpperCase());
      
      handleRoomConnected(nextRoom, reclaimedParticipantId || participantId, 'Identity reclaimed successfully!');
      setPinInput('');
      setShowPinEntry(false);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [handleRoomConnected, pinInput, room?.roomId]);

  const handleManualRefresh = useCallback(async () => {
    if (!room?.roomId) return;

    setBusyAction('refresh');
    try {
      const nextRoom = await fetchChatRoom(room.roomId);
      setRoom(nextRoom);
      setStatusMessage(`Room ${room.roomId} refreshed.`);
      setErrorMessage('');
    } catch (error) {
      if (error.status === 404) {
        removeStoredParticipant(room.roomId);
        removeStoredCreatorToken(room.roomId);
        persistLastRoomId('');
        forgetSavedRoom(room.roomId);
        setRoom(null);
        setActiveParticipantId('');
        setStatusMessage(`Room ${room.roomId} has ended.`);
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setBusyAction('');
    }
  }, [forgetSavedRoom, persistLastRoomId, room]);

  const handleSendMessage = useCallback(async () => {
    const trimmed = messageDraft.trim();
    const drawing = sanitizeDrawingDataUrl(drawingDraft);
    if (!room?.roomId || !activeParticipantId || (!trimmed && !drawing)) return;

    setBusyAction('message');
    setSendPulse((current) => current + 1);
    try {
      const nextRoom = await sendChatMessage(room.roomId, {
        participantId: activeParticipantId,
        text: trimmed,
        drawing,
      });

      setChatTypingState(room.roomId, { participantId: activeParticipantId, isTyping: false }).catch(() => {});
      setRoom(nextRoom);
      setMessageDraft('');
      clearDrawingDraft();
      setDrawingOpen(false);
      setTypingFocused(false);
      setComposerActive(false);
      setStatusMessage('Message delivered.');
      setErrorMessage('');
      triggerHaptic('selection');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, clearDrawingDraft, drawingDraft, messageDraft, room?.roomId]);

  const handleUpdateRoomVisibility = useCallback(async (nextVisibility) => {
    if (!room?.roomId || !activeParticipantId || !isCreator) return;

    const normalizedVisibility = nextVisibility === 'public' ? 'public' : 'private';
    setBusyAction('settings');
    try {
      const nextRoom = await updateChatRoomSettings(room.roomId, {
        participantId: activeParticipantId,
        visibility: normalizedVisibility,
      });
      setRoom(nextRoom);
      setRoomVisibility(normalizedVisibility);
      setStatusMessage(`${nextRoom?.title || 'Room'} is now ${normalizedVisibility}.`);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, isCreator, room?.roomId]);

  const handleSwitchCharacter = useCallback(async (nextCharacterName) => {
    if (!room?.roomId || !activeParticipantId) {
      updateProfileField('characterName', nextCharacterName);
      return;
    }

    const nextPortrait = portraitByName[nextCharacterName];
    if (!nextPortrait) return;
    const creatorToken = getStoredCreatorToken(room.roomId);

    setBusyAction('switch-character');
    try {
      const { room: nextRoom } = await joinChatRoom(room.roomId, {
        participantId: activeParticipantId,
        characterName: nextCharacterName,
        portraitSrc: nextPortrait.src,
        creatorToken,
      });
      updateProfileField('characterName', nextCharacterName);
      setRoom(nextRoom);
      setStatusMessage(`Switched to ${nextCharacterName}.`);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, portraitByName, room?.roomId, updateProfileField]);

  const handleEndRoom = useCallback(async () => {
    if (!room?.roomId || !activeParticipantId) return;
    if (!window.confirm(`End room ${room.roomId}? This removes the live chat for everyone in it.`)) return;

    setBusyAction('end');
    try {
      await endChatRoom(room.roomId, { participantId: activeParticipantId });
      removeStoredParticipant(room.roomId);
      removeStoredCreatorToken(room.roomId);
      persistLastRoomId('');
      forgetSavedRoom(room.roomId);
      setStatusMessage(`Room ${room.roomId} ended.`);
      setErrorMessage('');
      setRoomCode(room.roomId);
      setRoom(null);
      setActiveParticipantId('');
      triggerHaptic('success');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction(''); 
    }
  }, [activeParticipantId, forgetSavedRoom, persistLastRoomId, room]);

  const handleReclaimOwnership = useCallback(async () => {
    if (!room?.roomId || !activeParticipantId) return;

    const creatorToken = getStoredCreatorToken(room.roomId);
    if (!creatorToken) return;

    setBusyAction('reclaim');
    try {
      const { room: nextRoom } = await joinChatRoom(room.roomId, {
        participantId: activeParticipantId,
        characterName: profile.characterName,
        portraitSrc: selectedPortrait.src,
        creatorToken,
      });
      setRoom(nextRoom);
      if (nextRoom.creatorId === activeParticipantId) {
        setStatusMessage('Ownership reclaimed successfully.');
        setErrorMessage('');
        triggerHaptic('success');
      } else {
        throw new Error('Server did not grant ownership. Code might be incorrect or expired.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, profile.characterName, room?.roomId, selectedPortrait.src]);

  const handleLeaveView = useCallback(() => {
    if (!room?.roomId) return;

    if (activeParticipantId) {
      setChatTypingState(room.roomId, { participantId: activeParticipantId, isTyping: false }).catch(() => {});
    }
    setStatusMessage(`Closed the local view for ${room.roomId}. You can reconnect while the room stays active.`);
    setErrorMessage('');
    setRoomCode(room.roomId);
    setRoom(null);
    setSettingsOpen(false);
    setTypingFocused(false);
    setActiveParticipantId(getStoredParticipant(room.roomId));
  }, [activeParticipantId, room]);

  const handleCopyRoomCode = useCallback(async () => {
    if (!room?.roomId) return;

    try {
      await navigator.clipboard.writeText(room.roomId);
      setStatusMessage(`Copied ${room.roomId}.`);
      setErrorMessage('');
    } catch {
      setErrorMessage('Could not copy the room code from this browser.');
    }
  }, [room?.roomId]);

  const handleCopyRoomChat = useCallback(async () => {
    if (!room) return;

    const transcript = room.messages
      .map((message) => {
        if (message.type === 'system') {
          return `[${formatTime(message.createdAt)}] ${message.text}`;
        }

        const author = room.participants.find((participant) => participant.id === message.authorId);
        const authorName = message.authorId === activeParticipantId ? copy.you : (author?.characterName || 'Unknown');
        const content = [message.text, message.drawing ? `[${copy.drawingLabel}]` : ''].filter(Boolean).join(' ');
        return `[${formatTime(message.createdAt)}] ${authorName}: ${content}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(transcript);
      setStatusMessage(`Copied chat from ${room.title}.`);
      setErrorMessage('');
    } catch {
      setErrorMessage('Could not copy the room chat from this browser.');
    }
  }, [activeParticipantId, copy.drawingLabel, copy.you, room]);

  const openSavedRoom = useCallback(async (nextRoomId) => {
    if (!nextRoomId) return;

    setBusyAction('switch');
    try {
      if (room?.roomId && activeParticipantId) {
        setChatTypingState(room.roomId, { participantId: activeParticipantId, isTyping: false }).catch(() => {});
      }
      const { room: nextRoom, participantId, reclaimCode } = await resolveRoomSession(nextRoomId, { autoJoinPublic: true });
      if (reclaimCode) writeIdentityKey(nextRoom.roomId, reclaimCode);
      handleRoomConnected(nextRoom, participantId, `Opened ${nextRoom.title}.`);
    } catch (error) {
      if (error.status === 404) {
        removeStoredParticipant(nextRoomId);
        removeStoredCreatorToken(nextRoomId);
        forgetSavedRoom(nextRoomId);
        if (savedLastRoomId === nextRoomId) {
          persistLastRoomId('');
        }
        setStatusMessage(`Room ${nextRoomId} is no longer active.`);
        setErrorMessage('');  
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, clearDrawingDraft, forgetSavedRoom, persistLastRoomId, rememberSavedRoom, resolveRoomSession, room?.roomId, savedLastRoomId]);

  const handleStartRoomFlow = useCallback((nextMode) => {
    if (room?.roomId && activeParticipantId) {
      setChatTypingState(room.roomId, { participantId: activeParticipantId, isTyping: false }).catch(() => {});
    }
    setMode(nextMode);
    setRoom(null);
    setChatOpen(false);
    setSettingsOpen(false);
    setStatusMessage('');
    setErrorMessage('');
    setMessageDraft('');
    setDrawingOpen(false);
    clearDrawingDraft();
    setTypingFocused(false);
    setComposerActive(false);
    setActiveParticipantId('');
    if (nextMode === 'create') {
      setRoomTitle('');
    } else {
      setRoomCode(savedLastRoomId || '');
    }
  }, [activeParticipantId, clearDrawingDraft, room?.roomId, savedLastRoomId]);

  const handleReconnect = useCallback(async () => {
    const lastRoomId = readLastRoomId();
    if (!lastRoomId) return;

    setBusyAction('sync');
    try {
      const { room: nextRoom, participantId, reclaimCode } = await resolveRoomSession(lastRoomId);
      if (reclaimCode) writeIdentityKey(nextRoom.roomId, reclaimCode);
      handleRoomConnected(nextRoom, participantId, `Reconnected to ${nextRoom.roomId}.`);
    } catch (error) {
      removeStoredParticipant(lastRoomId);
      removeStoredCreatorToken(lastRoomId);
      persistLastRoomId('');
      forgetSavedRoom(lastRoomId);
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [forgetSavedRoom, handleRoomConnected, persistLastRoomId, resolveRoomSession]);

  return (
    <div
      className="planner-container planner-page"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: isMobile ? 'auto' : '650px',
        padding: isMobile ? '24px 10px 12px' : '30px 34px',
        gap: '18px',
        overflow: 'visible',
        fontFamily: CHAT_FONT_FAMILY,
        fontWeight: 400,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: isMobile ? '2px' : '8px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '14px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 24px',
            borderRadius: '24px',
            background: '#ffffff',
            border: '3.5px solid #14b8a6',
            borderBottom: '9.5px solid #0f766e',
            boxShadow: '0 8px 18px rgba(20, 184, 166, 0.14)',
            zIndex: 1,
          }}
        >
          <MessageCircleHeart size={isMobile ? 26 : 22} strokeWidth={2.5} style={{ color: '#0f766e' }} />
          <span style={{ color: '#0f766e', fontSize: isMobile ? '1.55rem' : '1.45rem', lineHeight: 1, fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
            {copy.title}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '3px 8px' : '3px 9px',
              borderRadius: '999px',
              background: '#fde68a',
              color: '#92400e',
              border: '2px solid #f59e0b',
              borderBottom: '4px solid #d97706',
              fontSize: isMobile ? '0.72rem' : '0.76rem',
              lineHeight: 1,
              boxShadow: '0 2px 0 rgba(146,64,14,0.12)',
              flexShrink: 0,
            }}
          >
            Beta
          </span>
        </div>
      </div>

      {!room && (
        <div
          style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: isMobile ? '0.98rem' : '1.02rem',
            lineHeight: 1.65,
            padding: isMobile ? '0 6px' : '0 20px',
          }}
        >
          {copy.subtitle}
        </div>
      )}

      {!room && (
        <div
          style={{
            ...PANEL_STYLE,
            padding: isMobile ? '14px 16px' : '16px 20px',
            background: '#fff7ed',
            borderColor: '#fdba74',
            borderBottomColor: '#f97316',
            color: '#9a3412',
            display: 'grid',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '1rem', color: '#9a3412' }}>{copy.safetyTitle}</div>
          <div style={{ display: 'grid', gap: '6px', color: '#9a3412' }}>
            {(Array.isArray(copy.safetyNotice) ? copy.safetyNotice : [copy.safetyNotice]).map((line, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.92rem', lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(statusMessage || errorMessage) && (
        <div
          style={{
            ...PANEL_STYLE,
            padding: '14px 18px',
            background: errorMessage ? '#fff1f2' : '#f0fdf4',
            borderColor: errorMessage ? '#fda4af' : '#86efac',
            borderBottomColor: errorMessage ? '#fb7185' : '#4ade80',
            color: errorMessage ? '#9f1239' : '#166534',
            fontSize: '0.94rem',
          }}
        >
          {errorMessage || statusMessage}
        </div>
      )}

      {!room && (
        <div
          style={{
            ...PANEL_STYLE,
            padding: isMobile ? '18px 14px' : '22px',
            display: 'grid',
            gap: '20px',
            background: 'linear-gradient(180deg, #fffefc 0%, #fffafd 100%)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: isMobile ? '1.34rem' : '1.46rem', color: '#0f172a', fontWeight: 400 }}>
                {copy.roomDirectory}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.55 }}>
                {copy.featuredRooms}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleStartRoomFlow('create')}
                  style={{
                    ...BUTTON_STYLE,
                    padding: '13px 18px',
                    background: mode === 'create' ? '#fce7f3' : '#ffffff',
                    color: mode === 'create' ? '#9d174d' : '#475569',
                    borderColor: mode === 'create' ? '#f472b6' : '#dbe7f3',
                    borderBottomColor: mode === 'create' ? '#db2777' : '#bfd2e6',
                  }}
                >
                  <PlusCircle size={18} strokeWidth={2.5} />
                  {copy.createLabel}
                </button>
                <button
                  type="button"
                  onClick={() => handleStartRoomFlow('join')}
                  style={{
                    ...BUTTON_STYLE,
                    padding: '13px 18px',
                    background: mode === 'join' ? '#eff6ff' : '#ffffff',
                    color: mode === 'join' ? '#1d4ed8' : '#475569',
                    borderColor: mode === 'join' ? '#60a5fa' : '#dbe7f3',
                    borderBottomColor: mode === 'join' ? '#2563eb' : '#bfd2e6',
                  }}
                >
                  <UserRoundPlus size={18} strokeWidth={2.5} />
                  {copy.joinLabel}
                </button>
              </div>
            </div>

            <div
              style={{
                color: '#475569',
                background: '#f8fbff',
                border: '2px solid #dbe7f3',
                borderRadius: '20px',
                padding: '12px 16px',
                fontSize: '0.9rem',
                lineHeight: 1.45,
                maxWidth: isMobile ? '100%' : '390px',
              }}
            >
              {copy.roomRule}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 0.88fr) minmax(0, 1.12fr)',
              gap: '20px',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: '14px',
                background: '#ffffff',
                border: '1px solid #dbe7f3',
                borderRadius: '24px',
                padding: isMobile ? '14px' : '16px',
                boxShadow: '0 12px 26px rgba(15, 23, 42, 0.05)',
              }}
            >
              <label style={{ display: 'grid', gap: '8px' }}>
                <span style={{ color: '#334155', fontSize: '0.98rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY }}>
                  {mode === 'create' ? copy.roomTitleLabel : copy.roomCodeLabel}
                </span>
                {mode === 'create' ? (
                  <input
                    value={roomTitle}
                    onChange={(event) => setRoomTitle(event.target.value.slice(0, 80))}
                    placeholder={copy.roomTitlePlaceholder}
                    required
                    aria-invalid={!roomTitle.trim()}
                    style={INPUT_STYLE}
                  />
                ) : (
                  <input
                    value={roomCode}
                    onChange={(event) => setRoomCode(normalizeRoomCode(event.target.value))}
                    placeholder={copy.roomCodePlaceholder}
                    style={{ ...INPUT_STYLE, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                  />
                )}
              </label>

              {mode === 'create' && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ color: '#334155', fontSize: '0.98rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY }}>{copy.visibilityLabel}</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['private', 'public'].map((value) => {
                      const selected = roomVisibility === value;
                      const label = value === 'public' ? copy.publicRoom : copy.privateRoom;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRoomVisibility(value)}
                          style={{
                            ...BUTTON_STYLE,
                            padding: '11px 14px',
                            background: selected ? '#eff6ff' : '#ffffff',
                            color: selected ? '#1d4ed8' : '#475569',
                            borderColor: selected ? '#93c5fd' : '#dbe7f3',
                            borderBottomColor: selected ? '#2563eb' : '#bfd2e6',
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.45 }}>{copy.visibilityHint}</div>
                </div>
              )}

              {!room && savedLastRoomId && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ color: '#334155', fontSize: '0.94rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY }}>{copy.lastRoom}</div>
                  <button
                    type="button"
                    onClick={handleReconnect}
                    disabled={hydrating || !!busyAction}
                    style={{
                      ...BUTTON_STYLE,
                      padding: '14px 18px',
                      justifyContent: 'space-between',
                      background: 'linear-gradient(135deg, #fff7ed 0%, #fff1f2 100%)',
                      color: '#9a3412',
                      borderColor: '#fdba74',
                      borderBottomColor: '#f97316',
                      opacity: hydrating || !!busyAction ? 0.6 : 1,
                      width: '100%',
                      borderRadius: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <RefreshCw size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <div style={{ display: 'grid', gap: '1px', textAlign: 'left', minWidth: 0 }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{copy.reconnectLabel}</span>
                        <span style={{ fontSize: '0.78rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{savedLastRoomId}</span>
                      </div>
                    </div>
                    {(hydrating || busyAction === 'reconnect') ? <LoaderCircle size={18} style={SPIN_ICON_STYLE} /> : <ArrowRight size={18} strokeWidth={2.5} />}
                  </button>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.45 }}>{copy.reconnectHint}</div>
                </div>
              )}

              {!!savedRooms.length && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ color: '#ec4899', fontSize: '0.96rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY }}>{copy.yourRooms}</div>
                  <div
                    className="hide-scrollbar"
                    style={{
                      display: 'grid',
                      gap: '10px',
                      maxHeight: isMobile ? '260px' : '300px',
                      overflowY: 'auto',
                      paddingRight: '4px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    {savedRooms.map((savedRoom, index) => {
                      const palette = getPaletteByIndex(index);
                      const messageCount = (savedRoom.messages || []).filter((message) => message.type === 'message').length;

                      return (
                        <button
                          key={savedRoom.roomId}
                          type="button"
                          onClick={() => openSavedRoom(savedRoom.roomId)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px',
                            borderRadius: '20px',
                            border: `1px solid ${palette.border}66`,
                            background: '#ffffff',
                            cursor: 'pointer',
                          }}
                        >
                          <RoomStackAvatar participants={savedRoom.participants || []} size={44} />
                          <div style={{ minWidth: 0, flex: 1, display: 'grid', gap: '3px' }}>
                            <div style={{ color: '#0f172a', fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {savedRoom.title}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {getRoomPreviewText(savedRoom, copy)}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                              {messageCount} {copy.roomMessagesLabel.toLowerCase()} • {formatTime(savedRoom.updatedAt)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!!visiblePublicRooms.length && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ color: '#3b82f6', fontSize: '0.96rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY }}>{copy.publicRooms}</div>
                  <div
                    className="hide-scrollbar"
                    style={{
                      display: 'grid',
                      gap: '10px',
                      maxHeight: isMobile ? '220px' : '240px',
                      overflowY: 'auto',
                      paddingRight: '4px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    {visiblePublicRooms.map((publicRoom, index) => {
                      const palette = getPaletteByIndex(index + savedRooms.length);
                      const messageCount = (publicRoom.messages || []).filter((message) => message.type === 'message').length;

                      return (
                        <button
                          key={publicRoom.roomId}
                          type="button"
                          onClick={() => openSavedRoom(publicRoom.roomId)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px',
                            borderRadius: '20px',
                            border: `1px solid ${palette.border}66`,
                            background: '#ffffff',
                            cursor: 'pointer',
                          }}
                        >
                          <RoomStackAvatar participants={publicRoom.participants || []} size={44} />
                          <div style={{ minWidth: 0, flex: 1, display: 'grid', gap: '3px' }}>
                            <div style={{ color: '#0f172a', fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {publicRoom.title}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {getRoomPreviewText(publicRoom, copy)}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                              {messageCount} {copy.roomMessagesLabel.toLowerCase()} • {copy.publicRoom}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <motion.button
                type="button"
                onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={!!busyAction || hydrating || (mode === 'create' && !roomTitle.trim())}
                style={{
                  ...BUTTON_STYLE,
                  padding: '16px 18px',
                  background: mode === 'create' ? '#fce7f3' : '#eff6ff',
                  color: mode === 'create' ? '#9d174d' : '#1d4ed8',
                  borderColor: mode === 'create' ? '#f472b6' : '#60a5fa',
                  borderBottomColor: mode === 'create' ? '#db2777' : '#2563eb',
                  opacity: !!busyAction || hydrating || (mode === 'create' && !roomTitle.trim()) ? 0.65 : 1,
                  fontSize: '1rem',
                }}
              >
                {(busyAction === 'create' || busyAction === 'join') && <LoaderCircle size={18} style={SPIN_ICON_STYLE} />}
                {mode === 'create' ? <PlusCircle size={18} strokeWidth={2.5} /> : <DoorOpen size={18} strokeWidth={2.5} />}
                {mode === 'create' ? copy.createAction : copy.joinAction}
              </motion.button>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '12px',
                background: '#ffffff',
                border: '1px solid #dbe7f3',
                borderRadius: '24px',
                padding: isMobile ? '14px' : '16px',
                boxShadow: '0 12px 26px rgba(15, 23, 42, 0.05)',
              }}
            >
              <div style={{ display: 'grid', gap: '4px' }}>
                <div style={{ color: '#334155', fontSize: '0.98rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY }}>{copy.portraitLabel}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{copy.publicHint}</div>
              </div>
              <PortraitPicker
                isMobile={isMobile}
                selectedCharacter={profile.characterName}
                onSelect={(characterName) => updateProfileField('characterName', characterName)}
                disabled={!!busyAction || hydrating}
                copy={copy}
              />
            </div>
          </div>
        </div>
      )}

      {room && (
        <>
          {!chatOpen && (
            <div
              style={{
                ...PANEL_STYLE,
                width: '100%',
                maxWidth: '880px',
                alignSelf: 'center',
                padding: isMobile ? '18px 16px' : '22px 24px',
                display: 'grid',
                gap: '18px',
              }}
            >
              <div style={{ display: 'grid', gap: '6px', textAlign: 'center' }}>
                <div style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: isMobile ? '1.36rem' : '1.48rem', color: '#0f172a', fontWeight: 400 }}>
                  {copy.roomDirectory}
                </div>
                <div style={{ color: '#64748b', fontSize: '1rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{copy.featuredRooms}</div>
              </div>

              <div
                className="hide-scrollbar"
                style={{
                  display: 'grid',
                  gap: '12px',
                  maxHeight: isMobile ? 'calc(100vh - 290px)' : '420px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {[...savedRooms, ...visiblePublicRooms.filter((publicRoom) => !savedRooms.some((savedRoom) => savedRoom.roomId === publicRoom.roomId))].map((savedRoom, index) => {
                  const palette = getPaletteByIndex(index);
                  const isCurrentRoom = savedRoom.roomId === room.roomId;
                  const messageCount = (savedRoom.messages || []).filter((message) => message.type === 'message').length;
                  const visibilityLabel = savedRoom.visibility === 'public' ? copy.publicRoom : copy.privateRoom;

                  return (
                    <button
                      key={savedRoom.roomId}
                      type="button"
                      onClick={() => openSavedRoom(savedRoom.roomId)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px',
                        borderRadius: '22px',
                        border: `1px solid ${isCurrentRoom ? palette.border : '#dbe2ea'}`,
                        background: isCurrentRoom ? palette.bg : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <RoomStackAvatar participants={savedRoom.participants || []} size={48} />
                      <div style={{ minWidth: 0, flex: 1, display: 'grid', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ color: '#0f172a', fontSize: '1.08rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{savedRoom.title}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.82rem', flexShrink: 0, fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{formatTime(savedRoom.updatedAt)}</div>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
                          {getRoomPreviewText(savedRoom, copy)}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', color: '#94a3b8', fontSize: '0.82rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
                          <span>{(savedRoom.participants || []).length} {copy.activePlayers.toLowerCase()}</span>
                          <span>{messageCount} {copy.roomMessagesLabel.toLowerCase()}</span>
                          <span>{visibilityLabel}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  style={{
                    ...BUTTON_STYLE,
                    padding: '14px 18px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    borderColor: '#93c5fd',
                    borderBottomColor: '#2563eb',
                  }}
                >
                  <MessageCircleHeart size={18} strokeWidth={2.4} />
                  {copy.openChat}
                </button>
                <button
                  type="button"
                  onClick={() => handleStartRoomFlow('create')}
                  style={{
                    ...BUTTON_STYLE,
                    padding: '14px 18px',
                    background: '#fce7f3',
                    color: '#9d174d',
                    borderColor: '#f472b6',
                    borderBottomColor: '#db2777',
                  }}
                >
                  <PlusCircle size={18} strokeWidth={2.4} />
                  {copy.createLabel}
                </button>
                <button
                  type="button"
                  onClick={() => handleStartRoomFlow('join')}
                  style={{
                    ...BUTTON_STYLE,
                    padding: '14px 18px',
                    background: '#ffffff',
                    color: '#475569',
                    borderColor: '#cbd5e1',
                    borderBottomColor: '#94a3b8',
                  }}
                >
                  <UserRoundPlus size={18} strokeWidth={2.4} />
                  {copy.joinLabel}
                </button>
                <button
                  type="button"
                  onClick={handleLeaveView}
                  style={{
                    ...BUTTON_STYLE,
                    padding: '14px 18px',
                    background: '#ffffff',
                    color: '#475569',
                    borderColor: '#cbd5e1',
                    borderBottomColor: '#94a3b8',
                  }}
                >
                  <DoorOpen size={18} strokeWidth={2.4} />
                  {copy.exitCharacter}
                </button>
              </div>
            </div>
          )}

          {chatOpen && (
          <div
            style={{
              width: '100%',
              maxWidth: '1280px',
              alignSelf: 'center',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '430px minmax(0, 1fr)',
              gap: '16px',
              position: 'relative',
            }}
          >
            {!isMobile && (
              <ChatMembersPanel
                savedRooms={filteredSavedRooms.saved}
                publicRooms={filteredSavedRooms.public}
                activeRoomId={room.roomId}
                activeRoom={room}
                searchValue={roomSearch}
                onSearchChange={setRoomSearch}
                onOpenRoom={openSavedRoom}
                onCreateRoom={() => handleStartRoomFlow('create')}
                onJoinRoom={() => handleStartRoomFlow('join')}
                onExitCharacter={handleLeaveView}
                copy={copy}
              />
            )}

          <div
            style={{
              ...PANEL_STYLE,
              padding: isMobile ? '10px' : '12px',
              minHeight: isMobile ? 'calc(100vh - 148px)' : '880px',
              maxHeight: isMobile ? 'calc(100vh - 148px)' : '880px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%',
              maxWidth: '100%',
              alignSelf: 'center',
              overflow: 'hidden',
              backgroundColor: '#fcfcfd',
              backgroundImage:
                'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.86)), repeating-linear-gradient(transparent, transparent 31px, rgba(191, 219, 254, 0.55) 32px)',
              borderColor: '#d6dfeb',
              borderBottomColor: '#b7c7da',
              boxShadow: '0 20px 46px rgba(15, 23, 42, 0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                padding: isMobile ? '8px 10px' : '10px 12px',
                background: 'rgba(255, 255, 255, 0.82)',
                border: '1px solid rgba(214, 223, 235, 0.95)',
                borderRadius: '20px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <button
                type="button"
                onClick={isMobile ? (() => setChatOpen(false)) : handleManualRefresh}
                disabled={!isMobile && busyAction === 'refresh'}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '999px',
                  border: '1px solid #dbe2ea',
                  background: '#ffffff',
                  color: '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  opacity: !isMobile && busyAction === 'refresh' ? 0.6 : 1,
                }}
                aria-label={isMobile ? 'Back' : copy.refresh}
              >
                {!isMobile && busyAction === 'refresh' ? <LoaderCircle size={15} style={SPIN_ICON_STYLE} /> : (isMobile ? <ArrowLeft size={15} strokeWidth={2.2} /> : <RefreshCw size={15} strokeWidth={2.2} />)}
              </button>
              <div style={{ minWidth: 0, textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RoomStackAvatar participants={participants} size={40} />
                <div
                  style={{ minWidth: 0 }}
                >
                  <div
                    style={{
                      color: '#0f172a',
                      fontFamily: CHAT_FONT_FAMILY,
                      fontSize: isMobile ? '1.12rem' : '1.2rem',
                      fontWeight: 400,
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {room.title}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: '2px', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
                    {participants.length} {copy.activePlayers.toLowerCase()} • {formatTime(room.updatedAt)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleLeaveView}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '999px',
                    border: '1px solid #dbe2ea',
                    borderBottom: '2px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  aria-label={copy.exitCharacter}
                >
                  <DoorOpen size={17} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '999px',
                    border: '1px solid #dbe2ea',
                    borderBottom: '2px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  aria-label="Settings"
                >
                  <MoreHorizontal size={17} strokeWidth={2.2} />
                </button>
              </div>
            </div>
            <div
              ref={messageListRef}
              className="hide-scrollbar"
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: isMobile ? '6px 4px 10px' : '10px 12px 12px',
                overscrollBehavior: 'contain',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {!room.messages.length && (
                <div
                  style={{
                    color: '#64748b',
                    textAlign: 'center',
                    padding: '34px 16px',
                    background: 'rgba(255, 255, 255, 0.86)',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '20px',
                  }}
                >
                  {copy.noMessages}
                </div>
              )}
              {room.messages.map((message, index) => {
                const author = participants.find((participant) => participant.id === message.authorId);
                const isOwnMessage = message.authorId === activeParticipantId;
                return (
                  <ChatMessageRow
                    key={message.id}
                    message={message}
                    author={author}
                    palette={getPaletteByIndex(Math.max(participants.findIndex((participant) => participant.id === author?.id), 0))}
                    isOwnMessage={isOwnMessage}
                    isMobile={isMobile}
                    fallbackPortraitSrc={selectedPortrait.src}
                    copy={copy}
                    index={index}
                    onTap={() => {
                      setComposerActive(false);
                      setTypingFocused(false);
                    }}
                  />
                );
              })}
              {!!typingParticipants.length && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingLeft: '4px',
                    justifyContent: 'flex-start',
                  }}
                >
                  <ChatFaceAvatar
                    src={typingParticipants[0].portraitSrc}
                    name={typingParticipants[0].characterName}
                    palette={getPaletteByIndex(Math.max(participants.findIndex((participant) => participant.id === typingParticipants[0].id), 0))}
                    size={28}
                  />
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '20px 20px 20px 10px',
                      background: '#fffefc',
                      border: '2px solid rgba(203, 213, 225, 0.8)',
                      borderBottom: '5px solid #cbd5e1',
                      boxShadow: '0 8px 16px rgba(15, 23, 42, 0.05)',
                    }}
                  >
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: dot * 0.16 }}
                        style={{ width: '7px', height: '7px', borderRadius: '999px', background: typingParticipants[0] ? getPaletteByIndex(Math.max(participants.findIndex((participant) => participant.id === typingParticipants[0].id), 0)).border : '#94a3b8', display: 'block' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gap: '8px',
                padding: isMobile ? '8px' : '10px',
                background: 'rgba(255, 255, 255, 0.94)',
                border: `2px solid ${composerActive ? `${activeParticipantPalette.border}40` : 'rgba(214, 223, 235, 0.95)'}`,
                borderBottom: `7px solid ${composerActive ? activeParticipantPalette.border : '#cbd5e1'}`,
                borderRadius: '26px',
                boxShadow: composerActive ? '0 14px 30px rgba(15, 23, 42, 0.08)' : '0 10px 24px rgba(15, 23, 42, 0.06)',
                backdropFilter: 'blur(8px)',
              flexShrink: 0,
                transition: 'box-shadow 180ms ease, border-color 180ms ease, border-bottom-color 180ms ease',
            }}
          >
              {drawingOpen && (
                <DrawingPad
                  canvasRef={drawingCanvasRef}
                  isMobile={isMobile}
                  palette={activeParticipantPalette}
                  brushSize={drawingBrushSize}
                  brushMode={drawingMode}
                  brushColor={drawingBrushColor}
                  onBrushSizeChange={setDrawingBrushSize}
                  onBrushModeChange={setDrawingMode}
                  onBrushColorChange={setDrawingBrushColor}
                  onClear={clearDrawingDraft}
                  onUndo={handleUndoDrawing}
                  onClose={() => setDrawingOpen(false)}
                  copy={copy}
                />
              )}
              {drawingDraft && !drawingOpen && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 10px',
                    background: '#ffffff',
                    border: '1px solid #dbe2ea',
                    borderRadius: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={drawingDraft} alt={copy.drawingLabel} style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                    <div style={{ color: '#475569', fontSize: '0.84rem' }}>{copy.drawingLabel} ready</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearDrawingDraft();
                      setDrawingOpen(false);
                    }}
                    style={{
                      ...BUTTON_STYLE,
                      padding: '10px 12px',
                      background: '#ffffff',
                      color: '#475569',
                      borderColor: '#cbd5e1',
                      borderBottomColor: '#94a3b8',
                    }}
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                    {copy.removeDrawing}
                  </button>
                </div>
              )}
              <motion.div
                key={sendPulse}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    maxWidth: isMobile ? '100%' : '780px',
                    display: 'grid',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
                      gap: '8px',
                      alignItems: 'center',
                      padding: isMobile ? '6px 8px' : '7px 9px',
                      background: '#ffffff',
                      borderRadius: '20px',
                    }}
                  >
                    <ChatFaceAvatar
                      src={(activeParticipant?.portraitSrc || selectedPortrait.src)}
                      name={(activeParticipant?.characterName || selectedPortrait.name)}
                      palette={activeParticipantPalette}
                      size={34}
                    />
                    <textarea
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                      onFocus={() => {
                        setComposerActive(true);
                        setTypingFocused(true);
                      }}
                      onBlur={() => {
                        setTypingFocused(false);
                        if (!messageDraft.trim() && !drawingDraft && !drawingOpen) {
                          setComposerActive(false);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={copy.messagePlaceholder}
                      rows={1}
                      ref={messageInputRef}
                      style={{
                        width: '100%',
                        minHeight: composerActive ? '48px' : '38px',
                        maxHeight: '144px',
                        resize: 'none',
                        border: 'none',
                        background: 'transparent',
                        color: '#1e293b',
                        padding: composerActive ? '10px 2px' : '8px 2px',
                        fontFamily: CHAT_FONT_FAMILY,
                        fontSize: isMobile ? '1.08rem' : '1.12rem',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        overflowY: 'auto',
                        outline: 'none',
                        alignSelf: 'center',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                      }}
                      className="hide-scrollbar"
                    />
                    <motion.button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setComposerActive(true);
                        setDrawingOpen((current) => !current);
                      }}
                      whileHover={{ y: -1, scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '16px',
                        background: drawingOpen ? `${activeParticipantPalette.bg}` : '#ffffff',
                        color: drawingOpen ? activeParticipantPalette.text : '#64748b',
                        border: `2px solid ${drawingOpen ? activeParticipantPalette.border : '#dbe2ea'}`,
                        borderBottom: `5px solid ${drawingOpen ? activeParticipantPalette.border : '#cbd5e1'}`,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        alignSelf: 'center',
                      }}
                      aria-label={copy.drawAction}
                    >
                      {drawingOpen ? <X size={15} strokeWidth={2.3} /> : <PencilLine size={15} strokeWidth={2.3} />}
                    </motion.button>
                    <motion.button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleSendMessage}
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={(!messageDraft.trim() && !drawingDraft) || busyAction === 'message' || !activeParticipant}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: activeParticipantPalette.border,
                        color: '#ffffff',
                        border: `2px solid ${activeParticipantPalette.border}`,
                        borderBottom: `6px solid ${activeParticipantPalette.shadow || activeParticipantPalette.border}`,
                        borderRadius: '18px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 8px 18px ${activeParticipantPalette.border}33`,
                        opacity: (!messageDraft.trim() && !drawingDraft) || busyAction === 'message' || !activeParticipant ? 0.45 : 1,
                        alignSelf: 'center',
                      }}
                      aria-label={copy.sendAction}
                    >
                      {busyAction === 'message' ? <LoaderCircle size={16} style={SPIN_ICON_STYLE} /> : <Send size={16} strokeWidth={2.7} />}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          {settingsOpen && (
            <ChatSettingsSheet
              isMobile={isMobile}
              room={room}
              participants={participants}
              selectedCharacter={profile.characterName}
              onPortraitSelect={handleSwitchCharacter}
              onClose={() => setSettingsOpen(false)}
              onLeave={() => {
                setSettingsOpen(false);
                handleLeaveView();
              }}
              onEnd={() => {
                setSettingsOpen(false);
                handleEndRoom();
              }}
              onReclaim={() => {
                const token = getStoredCreatorToken(room.roomId);
                if (token) {
                  handleReclaimOwnership();
                  setSettingsOpen(false);
                } else {
                  // If no token, we just show the PIN entry within the sheet (handled internally now)
                }
              }}
              onRedeemPin={handleRedeemPin}
              pinInput={pinInput}
              setPinInput={setPinInput}
              onCopyCode={handleCopyRoomCode}
              onCopyChat={handleCopyRoomChat}
              onVisibilityChange={handleUpdateRoomVisibility}
              busyAction={busyAction}
              isCreator={isCreator}
              copy={copy}
            />
          )}
          </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatPage;
