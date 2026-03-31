import { useCallback, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  Copy,
  DoorOpen,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  MessageCircleHeart,
  ShieldCheck,
  X,
  XCircle,
  PencilLine,
} from 'lucide-react';
import {
  BUTTON_STYLE,
  CHAT_FONT_FAMILY,
  INPUT_STYLE,
  SPIN_ICON_STYLE,
} from '../chatConstants';
import { getPaletteByIndex, getStoredIdentityKey, getStoredRoomPin } from '../chatStorage';
import { triggerHaptic } from '../../../utils/haptics';
import { ChatFaceAvatar, RoomStackAvatar } from './ChatAvatars';
import { PortraitPicker } from './ChatPickers';
import { PORTRAIT_DATA } from '../../mystery/mysteryData';

export function ChatSettingsSheet({
  isMobile,
  room,
  participants,
  selectedCharacter,
  currentPaletteIndex,
  onPortraitSelect,
  onPaletteSelect,
  onClose,
  onLeave,
  onEnd,
  onRedeemPin,
  onTitleChange,
  pinInput,
  setPinInput,
  onCopyCode,
  onCopyChat,
  onVisibilityChange,
  messageDirection,
  onDirectionChange,
  busyAction,
  isCreator,
  activeParticipantId,
  copy,
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(room.title);
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

  const liveParticipants = (participants || []).map((p) => {
    if (p.id === activeParticipantId) {
      const portrait = PORTRAIT_DATA.find((pd) => pd.name === selectedCharacter) || PORTRAIT_DATA[0];
      return {
        ...p,
        characterName: selectedCharacter,
        portraitSrc: portrait.src,
        paletteIndex: currentPaletteIndex,
      };
    }
    return p;
  });

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

  const withHaptic = (handler, type = 'tap') => () => {
    triggerHaptic(type);
    handler?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5000,
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'center',
          padding: isMobile ? '0' : '0 20px 20px',
        }}
      >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: isMobile ? '100vw' : 'min(760px, calc(100vw - 56px))',
          maxWidth: '100vw',
          maxHeight: isMobile ? '100dvh' : 'min(920px, calc(100vh - 42px))',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          background: '#fffefc',
          border: '1px solid #dbe2ea',
          overflowX: 'hidden',
          borderRadius: isMobile ? '0' : '28px',
          boxShadow: isMobile ? 'none' : '0 22px 52px rgba(15, 23, 42, 0.16)',
          padding: isMobile ? '12px 12px 64px' : '14px 14px',
          display: 'grid',
          gap: isMobile ? '12px' : '10px',
          boxSizing: 'border-box',
          margin: 0,
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
              <RoomStackAvatar participants={liveParticipants} size={76} />
              <div style={{ minWidth: 0, display: 'grid', gap: '4px', flex: 1 }}>
                {editingTitle ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value.slice(0, 80))}
                      style={{ ...INPUT_STYLE, padding: '6px 10px', fontSize: '1rem', height: '36px' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={withHaptic(() => {
                        onTitleChange(tempTitle);
                        setEditingTitle(false);
                      }, 'success')}
                      style={{ ...BUTTON_STYLE, padding: '6px 12px', background: '#f0fdf4', color: '#166534', borderColor: '#86efac' }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={withHaptic(() => {
                        setEditingTitle(false);
                        setTempTitle(room.title);
                      }, 'tap')}
                      style={{ ...BUTTON_STYLE, padding: '6px 12px', background: '#fff1f2', color: '#9f1239', borderColor: '#fda4af' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: isMobile ? '1.28rem' : '1.38rem', color: '#0f172a', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {room.title}
                    </div>
                    {isCreator && (
                      <button
                        type="button"
                        onClick={withHaptic(() => setEditingTitle(true), 'selection')}
                        style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                      >
                        <PencilLine size={16} />
                      </button>
                    )}
                  </div>
                )}
                <div style={{ color: '#64748b', fontSize: '1.08rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
                  {participants.length} {participants.length === 1 ? (copy.personLabel || 'person').toLowerCase() : copy.peopleLabel.toLowerCase()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={withHaptic(onClose, 'tap')}
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
                aria-label={copy.closeLabel}
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
                  profile={{ paletteIndex: currentPaletteIndex }}
                  onSelect={onPortraitSelect}
                  onSelectPalette={onPaletteSelect}
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
                <div className="hide-scrollbar" style={{ display: 'grid', gap: '8px', maxHeight: isMobile ? 'none' : '440px', overflowY: 'auto', paddingRight: '2px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {liveParticipants.map((participant, index) => {
                    const participantPalette = getPaletteByIndex(participant.paletteIndex !== undefined ? participant.paletteIndex : index);
                    return (
                      <div
                        key={participant.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '18px',
                          background: '#ffffff',
                          border: `1px solid ${participantPalette.border}66`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <ChatFaceAvatar src={participant.portraitSrc} name={participant.characterName} palette={participantPalette} size={42} />
                          <div style={{ color: participantPalette.text, fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, fontSize: '1.1rem' }}>{participant.characterName}</div>
                        </div>
                        {participant.isCreator && (
                        <div title={copy.roomCreatorLabel} style={{ color: '#eab308' }}>
                            <ShieldCheck size={18} strokeWidth={2.5} />
                          </div>
                        )}
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
                    <div style={{ flex: 1, padding: '10px 14px', borderRadius: '999px', background: '#f8fafc', border: '1.25px solid #dbe2ea', color: '#0f172a', fontSize: '1rem', letterSpacing: '0.08em', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
                      {room.roomId}
                    </div>
                    <button type="button" onClick={withHaptic(onCopyCode, 'tap')} style={{ ...BUTTON_STYLE, padding: '8px 12px', borderRadius: '14px', fontSize: '0.9rem' }}>
                      <Copy size={16} strokeWidth={2.3} />
                      {copy.copyCode}
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
                            onClick={withHaptic(() => onVisibilityChange(value), 'selection')}
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

                {/* Message Direction */}
                <div style={{ display: 'grid', gap: '8px', marginTop: '6px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.84rem', fontFamily: CHAT_FONT_FAMILY }}>{copy.messageSideLabel}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { value: 'right', label: copy.messageSideRight },
                      { value: 'left', label: copy.messageSideLeft },
                    ].map((opt) => {
                      const selected = (messageDirection || 'right') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={withHaptic(() => onDirectionChange(opt.value), 'selection')}
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
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
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
                  <button type="button" onClick={withHaptic(onCopyChat, 'tap')} style={controlButtonStyle}>
                    <MessageCircleHeart size={16} strokeWidth={2.3} />
                    <span>{copy.copyChat}</span>
                  </button>
                  <button type="button" onClick={withHaptic(onLeave, 'tap')} style={controlButtonStyle}>
                    <DoorOpen size={20} strokeWidth={2.4} />
                    <span>{copy.exitLabel || 'Exit room'}</span>
                  </button>
                  {isCreator && (
                    <button type="button" onClick={withHaptic(onEnd, 'success')} style={{ ...controlButtonStyle, background: '#fff1f2', color: '#be123c', borderColor: '#fda4af', borderBottomColor: '#fb7185' }}>
                      <XCircle size={16} strokeWidth={2.3} />
                      <span>{copy.endRoom}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sync & Identity Section */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>
                  <ShieldCheck size={18} strokeWidth={2.5} />
                  {copy.security || 'Sync & Identity'}
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {/* Sync Key (Global Identity) */}
                  <div style={{ display: 'grid', gap: '6px', background: '#ffffff', padding: '14px', borderRadius: '18px', border: '1.5px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.92rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{copy.syncKeyLabel || 'Global sync key'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, padding: '8px 12px', background: '#f1f5f9', borderRadius: '99px', fontSize: '1rem', color: '#334155', letterSpacing: '0.08em', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {showPersonalKey ? (localStorage.getItem('skip_syncKey') || copy.noSyncKey || '---') : '••••••••••••••••'}
                      </div>
                      <button type="button" onClick={withHaptic(() => setShowPersonalKey(!showPersonalKey), 'selection')} style={{ width: '42px', height: '42px', minWidth: '42px', borderRadius: '14px', border: '1.5px solid #dbe2ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', background: '#ffffff' }}>
                        {showPersonalKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button type="button" onClick={() => handleCopy(localStorage.getItem('skip_syncKey'))} style={{ width: '42px', height: '42px', minWidth: '42px', borderRadius: '14px', border: '1.5px solid #cbd5e1', borderBottomWidth: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: copiedKey ? '#f0fdf4' : '#ffffff', color: copiedKey ? '#22c55e' : '#475569', cursor: 'pointer' }}>
                        {copiedKey ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
                      </button>
                    </div>
                    
                    <div style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, marginTop: '4px', background: '#f1f5f9', padding: '10px 14px', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                      {copy.syncKeyHint}
                      <div style={{ marginTop: '5px', fontSize: '0.82rem', color: '#475569', fontWeight: 400 }}>
                        {copy.syncKeyDetails}
                      </div>
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
