/* VITE_CACHE_BUST_3 */
import {
  ArrowRight, PlusCircle, RefreshCw, UserRoundPlus, LoaderCircle, MessageCircle, DoorOpen, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  CHAT_FONT_FAMILY, BUTTON_STYLE, INPUT_STYLE, SPIN_ICON_STYLE, PANEL_STYLE
} from '../chatConstants';
import { triggerHaptic } from '../../../utils/haptics';
import { getPaletteByIndex, normalizeRoomCode } from '../chatStorage';
import { getRoomPreviewText, getRoomDisplayName } from '../chatUtils';
import { RoomStackAvatar, ChatFaceAvatar } from './ChatAvatars';
import { PortraitPicker } from './ChatPickers';
import { PORTRAIT_DATA } from '../../mystery/mysteryData';

export function ChatLobby({
  isMobile,
  copy,
  state: {
    room, mode, roomTitle, roomCode, roomVisibility,
    busyAction, statusMessage, errorMessage,
    savedRooms, visiblePublicRooms, profile
  },
  actions: {
    handleStartRoomFlow, setRoomTitle, setRoomCode, setRoomVisibility,
    handleReconnect, openSavedRoom, handleCreateRoom, handleJoinRoom,
    updateProfileField
  }
}) {
  const activePalette = profile ? getPaletteByIndex(profile.paletteIndex) : { bg: '#ffffff', text: '#000000', border: '#e2e8f0' };

  const handleStartFlow = (tabId) => {
    triggerHaptic('selection');
    handleStartRoomFlow(tabId);
  };

  const handleReconnectPress = () => {
    triggerHaptic('tap');
    handleReconnect();
  };

  const handleOpenRoom = (roomId) => {
    triggerHaptic('selection');
    openSavedRoom(roomId);
  };

  const handleFlowAction = () => {
    triggerHaptic('tap');
    if (mode === 'create') {
      handleCreateRoom();
    } else {
      handleJoinRoom();
    }
  };

  const renderDesktop = () => (
    <div style={{ display: 'grid', gap: '28px', width: '100%', position: 'relative' }}>
      {!room && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 24px', borderRadius: '24px', background: '#ffffff', border: '3.5px solid #0d9488', borderBottom: '9.5px solid #0d9488', boxShadow: '0 8px 18px rgba(13, 148, 136, 0.12)', zIndex: 1,
          }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <MessageCircle size={14} strokeWidth={2.4} />
            </div>
            <span style={{ color: '#0d9488', fontSize: '1.3rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY }}>{copy.headerLabel || 'Character chat'}</span>
          </motion.div>
        </div>
      )}

      {!room && (
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.96rem', lineHeight: 1.45, padding: '0 24px', marginBottom: '12px', maxWidth: '800px', margin: '0 auto 16px' }}>
          {copy.subtitle}
        </div>
      )}

      {!room && (
        <div style={{ ...PANEL_STYLE, padding: '12px 18px', background: '#fffdfb', borderWidth: '3px', borderBottomWidth: '7px', borderColor: '#fdba74', borderBottomColor: '#f97316', color: '#9a3412', display: 'flex', flexWrap: 'wrap', gap: '8px 24px', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', boxShadow: '0 8px 16px rgba(249, 115, 22, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 400, color: '#c2410c', fontFamily: CHAT_FONT_FAMILY }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
             {copy.safetyTitle}:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', color: '#9a3412', justifyContent: 'center' }}>
            {(Array.isArray(copy.safetyNotice) ? copy.safetyNotice : [copy.safetyNotice]).slice(0, 3).map((line, index) => (
              <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.88rem', lineHeight: 1.35, opacity: 0.9 }}>
                <span style={{ flexShrink: 0, color: '#f97316', fontWeight: 400 }}>•</span>
                <span style={{ fontFamily: CHAT_FONT_FAMILY }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...PANEL_STYLE, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#ffffff', borderBottomWidth: '10px', flex: 1, minHeight: '820px', overflow: 'visible' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', paddingTop: '8px', paddingBottom: '18px', borderBottom: '2.5px solid #f1f5f9', position: 'relative', zIndex: 2 }} className="hide-scrollbar">
          {profile && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { id: 'create', icon: PlusCircle, label: copy.createLabel },
                { id: 'join', icon: UserRoundPlus, label: copy.joinLabel },
                { id: 'saved', icon: RefreshCw, label: 'Room directory' }
              ].map((tab) => {
                const isActive = mode === tab.id;
                return (
                  <button key={tab.id} onClick={() => handleStartFlow(tab.id)} style={{
                    ...BUTTON_STYLE, padding: '14px 22px', background: isActive ? activePalette.bg : '#ffffff', color: isActive ? activePalette.text : '#64748b', borderColor: isActive ? activePalette.border : '#e2e8f0', borderBottomColor: isActive ? activePalette.border : '#cbd5e1', borderBottomWidth: isActive ? 6 : 4, whiteSpace: 'nowrap', fontSize: '1.05rem',
                  }} className="paper-interact">
                    <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2.1} /><span style={{ fontWeight: 400 }}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ flex: 1 }} /><button onClick={handleReconnectPress} style={{ ...BUTTON_STYLE, padding: '12px 18px', background: '#ffffff', color: '#64748b', borderColor: '#e2e8f0', borderBottomColor: '#cbd5e1', borderBottomWidth: 4, fontSize: '0.94rem' }}>
            <RefreshCw size={17} strokeWidth={2.4} />{copy.reconnect || 'Reconnect'}
          </button>
        </div>
        <div className="hide-scrollbar" style={{ minWidth: 0, display: 'grid', gap: '24px', alignContent: 'start', height: '100%', overflowY: 'auto', paddingRight: '8px' }}>
          {mode === 'saved' && renderSavedRoomsList()}
          {(mode === 'create' || mode === 'join') && renderFlowContent()}
        </div>
      </div>
    </div>
  );

  const renderMobile = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      {!room && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', marginTop: '12px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 18px', borderRadius: '24px', background: '#ffffff', border: '3px solid #0d9488', borderBottom: '6px solid #0d9488', boxShadow: '0 6px 12px rgba(13, 148, 136, 0.1)', zIndex: 1,
          }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <MessageCircle size={12} strokeWidth={2.4} />
            </div>
            <span style={{ color: '#0d9488', fontSize: '1.2rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY }}>{copy.headerLabel || 'Character chat'}</span>
          </motion.div>
        </div>
      )}

      {!room && (
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.86rem', lineHeight: 1.4, padding: '0 8px', marginBottom: '4px', maxWidth: '800px', margin: '0 auto 8px' }}>
          {copy.subtitle}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', paddingTop: '8px', paddingBottom: '18px' }} className="hide-scrollbar">
        {[
          { id: 'create', icon: PlusCircle, label: 'Create' },
          { id: 'join', icon: UserRoundPlus, label: 'Join' },
          { id: 'saved', icon: RefreshCw, label: 'Rooms' }
        ].map((tab) => {
          const isActive = mode === tab.id;
          return (
          <button key={tab.id} onClick={() => handleStartFlow(tab.id)} style={{
              ...BUTTON_STYLE,
              padding: '10px 14px',
              background: isActive ? activePalette.bg : '#ffffff',
              color: isActive ? activePalette.text : '#64748b',
              borderColor: isActive ? activePalette.border : '#e2e8f0',
              borderBottomColor: isActive ? activePalette.border : '#cbd5e1',
              borderBottomWidth: isActive ? 5 : 4,
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              flex: 1
            }} className="paper-interact">
              <tab.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontWeight: 400 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'visible' }}>
        {mode === 'saved' ? renderSavedRoomsList() : renderFlowContent()}
      </div>

      <div style={{ 
        ...PANEL_STYLE, padding: '14px', background: '#fffefc', borderColor: '#fde68a', borderBottomColor: '#f59e0b',
        borderRadius: '20px', marginTop: 'auto', display: 'flex', gap: '12px', alignItems: 'center'
      }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
          <Info size={20} strokeWidth={2.5} />
        </div>
        <p style={{ margin: 0, fontSize: '0.84rem', color: '#92400e', lineHeight: 1.35, fontFamily: CHAT_FONT_FAMILY }}>
          {copy.safetyTitle}: <span style={{ fontWeight: 400 }}>{copy.safetyNotice[0]}</span>
        </p>
      </div>
    </div>
  );

  const renderSavedRoomsList = () => (
    <div style={{ display: 'grid', gap: isMobile ? '12px' : '18px' }}>
      <div style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: isMobile ? '1.1rem' : '1.4rem', color: '#0f172a', fontWeight: 400 }}>
        {copy.roomDirectory}
      </div>
      <div className="hide-scrollbar" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: isMobile ? '12px' : '16px', padding: '2px' }}>
        {[...savedRooms, ...visiblePublicRooms.filter((pr) => !savedRooms.some((sr) => sr.roomId === pr.roomId))].map((r, i) => (
          <button key={r.roomId} onClick={() => handleOpenRoom(r.roomId)} style={{
            display: 'flex', alignItems: 'center', gap: '16px', padding: isMobile ? '14px' : '16px 20px', background: '#ffffff', border: '2.5px solid #e2e8f0', borderRadius: '24px', borderBottomWidth: '7px', boxShadow: '0 4px 0 rgba(0,0,0,0.02)', transition: 'transform 120ms ease'
          }} className="paper-interact">
            <RoomStackAvatar participants={r.participants || []} size={isMobile ? 38 : 42} />
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'grid', gap: '2px' }}>
              <div style={{ color: '#0f172a', fontSize: isMobile ? '0.96rem' : '1.05rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getRoomDisplayName(r, copy)}</div>
              <div style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{getRoomPreviewText(r, copy)}</div>
            </div>
            <ArrowRight size={20} color="#94a3b8" strokeWidth={2.5} flexShrink={0} />
          </button>
        ))}
        {!savedRooms.length && !visiblePublicRooms.length && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>{copy.noRooms || 'No rooms available'}</div>
        )}
      </div>
    </div>
  );

  const renderFlowContent = () => (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px', background: '#ffffff', border: '3.5px solid #e2e8f0', borderRadius: '28px', padding: isMobile ? '18px' : '28px', borderBottomWidth: '10px', boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', paddingBottom: '16px', borderBottom: '1px dashed #e2e8f0', marginBottom: '4px' }}>
          <ChatFaceAvatar src={PORTRAIT_DATA.find(pd => pd.name === profile.characterName)?.src || PORTRAIT_DATA[0].src} name={profile.characterName} palette={activePalette} size={isMobile ? 56 : 72} />
          <div style={{ minWidth: 0, display: 'grid', gap: '2px' }}>
            <div style={{ color: '#0f172a', fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 400, fontFamily: CHAT_FONT_FAMILY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{roomTitle || (mode === 'create' ? copy.roomTitlePlaceholder : copy.roomCodePlaceholder)}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', fontFamily: CHAT_FONT_FAMILY }}>1 {copy.personLabel || 'person'}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '20px', background: mode === 'create' ? '#ec4899' : '#3b82f6', borderRadius: '999px' }} />
            <span style={{ fontSize: '1rem', fontWeight: 400, color: '#475569', fontFamily: CHAT_FONT_FAMILY }}>{mode === 'create' ? copy.roomTitleLabel : copy.roomCodeLabel}</span>
          </div>
          {mode === 'create' ? (
            <input value={roomTitle} onChange={(e) => setRoomTitle(e.target.value.slice(0, 80))} placeholder={copy.roomTitlePlaceholder} required style={{ ...INPUT_STYLE, padding: isMobile ? '14px 18px' : '16px 20px', fontSize: '1.05rem', background: '#ffffff', borderRadius: '20px' }} />
          ) : (
            <input value={roomCode} onChange={(e) => setRoomCode(normalizeRoomCode(e.target.value))} placeholder={copy.roomCodePlaceholder} style={{ ...INPUT_STYLE, padding: isMobile ? '14px 18px' : '16px 20px', fontSize: '1.1rem', background: '#ffffff', borderRadius: '20px', letterSpacing: '0.15em', textTransform: 'uppercase' }} />
          )}
        </div>
        {mode === 'create' && (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}><div style={{ width: '4px', height: '24px', background: '#cbd5e1', borderRadius: '999px' }} /><span style={{ fontSize: '1.05rem', fontWeight: 400, color: '#475569', fontFamily: CHAT_FONT_FAMILY }}>{copy.visibilityLabel}</span></div>
            <div style={{ display: 'flex', gap: isMobile ? '8px' : '14px' }}>
              {['private', 'public'].map((v) => (
                <button key={v} type="button" onClick={() => setRoomVisibility(v)} style={{
                  ...BUTTON_STYLE, padding: isMobile ? '12px' : '14px 20px', flex: 1, borderRadius: '20px', background: roomVisibility === v ? '#ffffff' : 'transparent', color: roomVisibility === v ? '#1d4ed8' : '#64748b', borderColor: roomVisibility === v ? '#bfdbfe' : '#e2e8f0', borderWidth: '3.5px', borderBottomWidth: '7.5px', borderBottomColor: roomVisibility === v ? '#2563eb' : '#cbd5e1', fontSize: isMobile ? '0.9rem' : '1rem'
                }}>{v === 'public' ? copy.publicRoom : copy.privateRoom}</button>
              ))}
            </div>
          </div>
        )}
        <motion.button type="button" onClick={handleFlowAction} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={!!busyAction || (mode === 'create' && !roomTitle.trim())} style={{ ...BUTTON_STYLE, padding: isMobile ? '16px' : '20px', marginTop: '8px', background: mode === 'create' ? '#ec4899' : '#3b82f6', color: '#ffffff', borderColor: 'transparent', borderRadius: '24px', fontSize: isMobile ? '1.1rem' : '1.2rem', borderBottomColor: 'rgba(0,0,0,0.24)', borderBottomWidth: '10px' }}>
          {(busyAction === 'create' || busyAction === 'join') && <LoaderCircle size={22} style={SPIN_ICON_STYLE} />}
          {mode === 'create' ? <PlusCircle size={22} /> : <DoorOpen size={22} />}
          {mode === 'create' ? copy.createAction : copy.joinAction}
        </motion.button>
      </div>
      <div style={{ background: '#fafafb', border: '3.5px solid #f0f1f4', borderRadius: '32px', padding: isMobile ? '16px' : '24px', display: 'grid', gap: '20px', borderBottomWidth: '9.5px', boxShadow: '0 8px 0 rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'grid', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '4px', height: '24px', background: '#94a3b8', borderRadius: '999px' }} /><span style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 400, color: '#475569', fontFamily: CHAT_FONT_FAMILY }}>{copy.portraitLabel}</span></div>
          <span style={{ color: '#94a3b8', fontSize: '0.84rem', paddingLeft: '14px' }}>{copy.publicHint}</span>
        </div>
        <PortraitPicker isMobile={isMobile} profile={profile} selectedCharacter={profile.characterName} onSelect={(n) => updateProfileField('characterName', n)} onSelectPalette={(i) => updateProfileField('paletteIndex', i)} disabled={!!busyAction} compact={true} copy={copy} />
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 0 }}>
       {(statusMessage || errorMessage) && !isMobile && (
        <div style={{ ...PANEL_STYLE, padding: '8px 14px', background: errorMessage ? '#fff1f2' : '#f0fdf4', borderColor: errorMessage ? '#fda4af' : '#86efac', borderBottomColor: errorMessage ? '#fb7185' : '#4ade80', color: errorMessage ? '#9f1239' : '#166534', fontSize: '0.88rem', lineHeight: 1.4, marginBottom: '16px' }}>
          {errorMessage || statusMessage}
        </div>
       )}
       {isMobile ? renderMobile() : renderDesktop()}
    </div>
  );
}
