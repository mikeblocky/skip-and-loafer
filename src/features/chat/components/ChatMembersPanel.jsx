import { DoorOpen, PlusCircle, RefreshCw, Search, UserRoundPlus } from 'lucide-react';
import { CHAT_FONT_FAMILY, PANEL_STYLE } from '../chatConstants';
import { formatTime, getPaletteByIndex, getUniversalUserId } from '../chatStorage';
import { RoomStackAvatar } from './ChatAvatars';
import { getRoomPreviewText, getRoomLastMessageTime } from '../chatUtils';
import { triggerHaptic } from '../../../utils/haptics';

export function ChatMembersPanel({ savedRooms, publicRooms, activeRoomId, activeRoom, searchValue, onSearchChange, onOpenRoom, onCreateRoom, onJoinRoom, onExitCharacter, copy, isMobile }) {
  const handleOpenRoom = (roomId) => {
    triggerHaptic('selection');
    onOpenRoom(roomId);
  };

  const handleAction = (action) => {
    if (!action) return undefined;
    return () => {
      triggerHaptic('tap');
      action();
    };
  };

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
    gap: '3px',
    padding: '2px 5px',
    borderRadius: '6px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    fontSize: '0.62rem',
    color: '#64748b',
    lineHeight: 1,
    whiteSpace: 'nowrap'
  };

  const renderRoomCard = (room, index, sectionLabel) => {
    const isCurrent = room.roomId === activeRoomId;
    const myParticipant = (room.participants || []).find(p => p.id === getUniversalUserId());
    const palette = getPaletteByIndex(myParticipant?.paletteIndex !== undefined ? myParticipant.paletteIndex : index);
    const roomPreview = getRoomPreviewText(room, copy);

    return (
      <button
        type="button"
        onClick={() => handleOpenRoom(room.roomId)}
        key={`${sectionLabel}_${room.roomId}`}
        style={{
          display: 'grid',
          gap: '6px',
          padding: '8px 10px',
          borderRadius: '18px',
          background: isCurrent ? `linear-gradient(180deg, ${palette.bg}66 0%, #ffffff 74%)` : '#ffffff',
          border: `1.5px solid ${isCurrent ? palette.border : '#dbe7f3'}`,
          borderBottom: `5px solid ${isCurrent ? palette.border : '#c7d7ea'}`,
          boxShadow: isCurrent ? `0 10px 20px ${palette.border}18` : '0 5px 12px rgba(15, 23, 42, 0.04)',
          textAlign: 'left',
          cursor: 'pointer',
          width: '100%',
          overflow: 'hidden',
          transition: 'all 160ms ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}>
            <RoomStackAvatar participants={room.participants || []} size={32} />
          </div>
          <div style={{ minWidth: 0, flex: 1, display: 'grid', gap: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', width: '100%' }}>
              <div style={{ color: palette.text, fontSize: '1rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25 }}>
                {room.title}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.74rem', fontFamily: CHAT_FONT_FAMILY, flexShrink: 0, paddingTop: '3px' }}>
                {formatTime(getRoomLastMessageTime(room))}
              </div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: CHAT_FONT_FAMILY, width: '100%', wordBreak: 'break-word', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {roomPreview}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '4px', overflow: 'hidden', width: '100%' }}>
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
  const currentRoomPalette = getPaletteByIndex(
    (currentRoomCard?.participants || []).find((participant) => participant.id === getUniversalUserId())?.paletteIndex
    ?? (currentRoomCard?.participants || [])[0]?.paletteIndex
    ?? 0
  );
  const roomGroups = [
    { key: 'saved', label: copy.yourRooms, rooms: savedRooms, tint: '#ec4899' },
    { key: 'public', label: copy.publicRooms, rooms: publicRooms, tint: '#3b82f6' },
  ];

  return (
    <div
      style={{
        ...PANEL_STYLE,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: 'auto',
        maxHeight: isMobile ? 'calc(100svh - 180px)' : 'calc(100vh - 140px)',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #fffefc 0%, #ffffff 100%)',
        fontFamily: CHAT_FONT_FAMILY,
        fontWeight: 400,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '12px',
          padding: '14px',
          borderRadius: '22px',
          background: `linear-gradient(180deg, ${currentRoomPalette.bg}66 0%, #ffffff 64%)`,
          border: `1.5px solid ${currentRoomPalette.border}55`,
          borderBottom: `6px solid ${currentRoomPalette.border}`,
          boxShadow: `0 10px 20px ${currentRoomPalette.border}12`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'grid', gap: '6px', minWidth: 0 }}>
            <div style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: '1.14rem', color: '#0f172a', fontWeight: 400, lineHeight: 1 }}>{copy.roomDirectoryHeading || copy.headerLabel || 'Chat'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ ...metaChipStyle, color: '#9d174d', borderColor: '#fbcfe8', background: '#fff5fb' }}>
                {copy.yourRooms} {savedRooms.length}
              </span>
              <span style={{ ...metaChipStyle, color: '#1d4ed8', borderColor: '#bfdbfe', background: '#f5f9ff' }}>
                {copy.publicRooms} {publicRooms.length}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {[
              { icon: PlusCircle, onClick: onCreateRoom, label: copy.createLabel },
              { icon: UserRoundPlus, onClick: onJoinRoom, label: copy.joinLabel },
              { icon: DoorOpen, onClick: activeRoom ? onExitCharacter : undefined, label: copy.exitCharacter },
            ].map(({ icon: Icon, onClick, label }, index) => (
              <button
                key={index}
                type="button"
                onClick={handleAction(onClick)}
                disabled={!onClick}
                style={{
                  ...actionButtonStyle,
                  opacity: onClick ? 1 : 0.45,
                  width: '30px',
                  height: '30px',
                  borderColor: currentRoomPalette.border,
                  borderBottomColor: currentRoomPalette.border,
                }}
                aria-label={label}
                title={label}
              >
                <Icon size={14} strokeWidth={2.1} />
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            background: '#ffffff',
            border: `1px solid ${currentRoomPalette.border}30`,
            borderRadius: '18px',
            boxShadow: `0 6px 14px ${currentRoomPalette.border}12`,
          }}
        >
          <Search size={14} strokeWidth={2.2} style={{ color: currentRoomPalette.border }} />
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
              fontSize: '0.9rem',
              fontFamily: CHAT_FONT_FAMILY,
              fontWeight: 400,
            }}
          />
        </div>

        {currentRoomCard && (
          <button
            type="button"
            onClick={() => handleOpenRoom(currentRoomCard.roomId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '20px',
              background: `linear-gradient(180deg, ${currentRoomPalette.bg}66 0%, #ffffff 68%)`,
              border: `1.5px solid ${currentRoomPalette.border}55`,
              borderBottom: `5px solid ${currentRoomPalette.border}`,
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: `0 10px 20px ${currentRoomPalette.border}12`,
            }}
          >
            <RoomStackAvatar participants={currentRoomCard.participants || []} size={42} />
            <div style={{ minWidth: 0, flex: 1, display: 'grid', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ color: '#0f172a', fontSize: '1.08rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, flex: 1, wordBreak: 'break-word', lineHeight: 1.25 }}>
                  {currentRoomCard.title}
                </div>
                <span style={{ ...metaChipStyle, fontSize: '0.72rem', padding: '3.5px 7px', flexShrink: 0, color: currentRoomPalette.text, borderColor: `${currentRoomPalette.border}55` }}>{copy.liveRoom}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, wordBreak: 'break-word', lineHeight: 1.3 }}>
                {getRoomPreviewText(currentRoomCard, copy)}
              </div>
            </div>
          </button>
        )}
      </div>

      <div
        className="hide-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          alignContent: 'start',
          gap: '10px',
          overflowY: 'auto',
          paddingRight: '2px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {!(savedRooms || []).length && !(publicRooms || []).length && (
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
          (group.rooms || []).length ? (
            <div key={group.key} style={{ display: 'grid', gap: '7px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '0 2px' }}>
              <div style={{ color: group.tint, fontSize: '0.86rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{group.label}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{(group.rooms || []).length}</div>
            </div>
              {group.rooms.map((room, index) => renderRoomCard(room, index + (group.key === 'public' ? savedRooms.length : 0), group.key))}
            </div>
          ) : null
        ))}

        {!(publicRooms || []).length && (
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
