import {
  MessageCircle, MessageCircleHeart, PlusCircle, UserPlus, UserRoundPlus, DoorOpen,
  ArrowLeft, ArrowDown, RefreshCw, LoaderCircle, MoreHorizontal, Send, ImagePlus, Check, CheckCircle2, Copy, X, PencilLine, Trash2, CornerUpLeft, Bomb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHAT_FONT_FAMILY, BUTTON_STYLE, INPUT_STYLE, SPIN_ICON_STYLE, PANEL_STYLE, MAX_MESSAGE_LENGTH } from '../chatConstants';
import { formatTime, getStoredCreatorToken } from '../chatStorage';
import { getPaletteByIndex } from '../chatPalette';
import { getRoomPreviewText, getRoomLastMessageTime, getRoomDisplayName } from '../chatUtils';
import { triggerHaptic } from '../../../utils/haptics';
import { RoomStackAvatar, ChatFaceAvatar, LiveSessionTimer } from './ChatAvatars';
import { PortraitPicker } from './ChatPickers';
import { PORTRAIT_DATA } from '../../mystery/mysteryData';
import { ChatMessageRow, ReadReceiptList } from './ChatMessageRow';
import { DrawingPad } from './DrawingPad';
import { ChatMembersPanel } from './ChatMembersPanel';
import { ChatSettingsSheet } from './ChatSettingsSheet';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const withAlpha = (hex, alpha = '22') => {
  const normalized = String(hex || '').replace('#', '');
  if (normalized.length !== 6) return hex || '#ffffff';
  return `#${normalized}${alpha}`;
};

export function ChatActiveRoom({
  isMobile,
  copy,
  state: {
    room, chatOpen, savedRooms, visiblePublicRooms, busyAction,
    filteredSavedRooms, roomSearch, participants, activeParticipantId,
    typingParticipants, activeParticipantPalette: _activeParticipantPalette, composerActive, messageDraft,
    messageListRef, messageInputRef, drawingOpen, drawingDraft,
    drawingBrushSize, drawingMode, drawingBrushColor, settingsOpen,
    pinInput, isCreator, activeParticipant, profile, statusMessage, errorMessage,
    selectedPortrait, drawingCanvasRef, entryTime,
    replyToMessage, editingMessage, typingFocused,
  },
  actions
}) {
  const [lobbyTab, setLobbyTab] = useState('list'); // 'create' | 'join' | 'list'
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const caretCanvasRef = useRef(null);
  const caretMirrorRef = useRef(null);
  const caretRef = useRef(null);
  const caretTrailRef = useRef(null);
  const caretFrameRef = useRef(0);

  const handleLobbyTabPress = (tabId) => {
    triggerHaptic('selection');
    setLobbyTab(tabId);
  };

  const handleHeaderAction = (action, hapticType = 'tap') => {
    triggerHaptic(hapticType);
    action?.();
  };

  const {
    handleStartRoomFlow, openSavedRoom, setChatOpen, handleLeaveView, setRoomSearch,
    handleManualRefresh, setSettingsOpen,
    setComposerActive, setTypingFocused,
    setMessageDraft, setDrawingDraft, handleSendMessage, setDrawingOpen, setDrawingBrushSize,
    setDrawingMode, setDrawingBrushColor, clearDrawingDraft, handleUndoDrawing, handleRedoDrawing, handleFillCanvas,
    setPinInput, handleUpdateRoomVisibility, handleCopyRoomCode, handleCopyRoomChat,
    handleSwitchCharacter, handleSwitchPalette, handleEndRoom, handleReclaimOwnership, handleRedeemPin,
    setReplyToMessage, setEditingMessage, updateProfileField, restoreDrawingFromDataUrl,
    handleReact, scrollToMessageId, takeDrawingSnapshot, handleUpdateRoomTitle
  } = actions;

  const liveParticipants = (participants || []).map((p) => {
    if (p.id === activeParticipantId) {
      const portrait = PORTRAIT_DATA.find((pd) => pd.name === (profile?.characterName || 'Mitsumi')) || PORTRAIT_DATA[0];
      return {
        ...p,
        characterName: profile?.characterName || 'Mitsumi',
        portraitSrc: portrait.src,
        paletteIndex: typeof profile?.paletteIndex === 'number' ? profile.paletteIndex : 5,
      };
    }
    return p;
  });

  const activeParticipantPalette = getPaletteByIndex(
    typeof profile?.paletteIndex === 'number' ? profile.paletteIndex : 5
  );
  const bannerBackground = `linear-gradient(180deg, ${withAlpha(activeParticipantPalette.bg, '7A')} 0%, rgba(255, 255, 255, 0.98) 100%)`;
  const bannerShadow = `0 8px 24px ${withAlpha(activeParticipantPalette.border, '20')}`;
  const bannerBorder = activeParticipantPalette.border;

  const composerAvatarSize = isMobile ? 34 : 38;
  const composerButtonSize = 40;
  const composerIconSize = 18;
  const composerIsBusy = busyAction === 'message';
  const hasComposerDraft = Boolean(messageDraft.trim() || drawingDraft);
  const showComposerAvatar = !typingFocused && !composerIsBusy && !hasComposerDraft;
  const composerExpanded = typingFocused || composerIsBusy || drawingDraft || drawingOpen;

  const syncComposerCaret = () => {
    const textarea = messageInputRef.current;
    const caret = caretRef.current;
    const trail = caretTrailRef.current;
    if (!textarea || !caret || !trail || !typingFocused || composerIsBusy) {
      if (caret) {
        caret.style.opacity = '0';
      }
      if (trail) {
        trail.style.opacity = '0';
      }
      return;
    }

    const computed = window.getComputedStyle(textarea);
    const selectionStart = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : textarea.value.length;
    const mirror = caretMirrorRef.current || (caretMirrorRef.current = document.createElement('div'));
    const marker = mirror.firstChild instanceof window.HTMLSpanElement ? mirror.firstChild : document.createElement('span');

    mirror.style.position = 'absolute';
    mirror.style.left = '-99999px';
    mirror.style.top = '0';
    mirror.style.visibility = 'hidden';
    mirror.style.pointerEvents = 'none';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.overflowWrap = 'break-word';
    mirror.style.wordBreak = 'break-word';
    mirror.style.boxSizing = computed.boxSizing || 'border-box';
    mirror.style.font = computed.font || `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    mirror.style.fontFamily = computed.fontFamily;
    mirror.style.fontSize = computed.fontSize;
    mirror.style.fontWeight = computed.fontWeight;
    mirror.style.lineHeight = computed.lineHeight;
    mirror.style.letterSpacing = computed.letterSpacing;
    mirror.style.textTransform = computed.textTransform;
    mirror.style.textIndent = computed.textIndent;
    mirror.style.padding = computed.padding;
    mirror.style.border = computed.border;
    mirror.style.width = `${textarea.clientWidth}px`;
    mirror.style.height = 'auto';
    mirror.style.maxWidth = 'none';

    marker.textContent = '\u200b';
    mirror.textContent = textarea.value.slice(0, selectionStart);
    mirror.appendChild(marker);

    if (mirror.parentNode !== document.body) {
      document.body.appendChild(mirror);
    }

    const markerRect = marker.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();
    const x = (markerRect.left - mirrorRect.left) - textarea.scrollLeft;
    const y = (markerRect.top - mirrorRect.top) - textarea.scrollTop;
    const lineHeight = Number.parseFloat(computed.lineHeight) || Number.parseFloat(computed.fontSize) * 1.35 || 18;

    const caretHeight = `${Math.max(16, lineHeight)}px`;
    const caretTransform = `translate3d(${Math.round(x)}px, ${Math.round(y - 2)}px, 0)`;

    caret.style.height = caretHeight;
    caret.style.opacity = '1';
    caret.style.transform = caretTransform;

    trail.style.height = caretHeight;
    trail.style.opacity = '0.22';
    trail.style.transform = caretTransform;
  };

  const queueComposerCaretSync = () => {
    cancelAnimationFrame(caretFrameRef.current);
    caretFrameRef.current = requestAnimationFrame(syncComposerCaret);
  };

  useLayoutEffect(() => {
    const textarea = messageInputRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
    queueComposerCaretSync();
  }, [messageDraft, messageInputRef, drawingDraft, drawingOpen, typingFocused, composerIsBusy]);

  useEffect(() => () => {
    cancelAnimationFrame(caretFrameRef.current);
    caretMirrorRef.current?.remove();
  }, []);

  useEffect(() => {
    const scroller = messageListRef.current;
    if (!scroller) {
      setShowScrollToBottom(false);
      return undefined;
    }

    let frameId = 0;
    const updateScrollButtonVisibility = () => {
      const hasOverflow = scroller.scrollHeight > scroller.clientHeight + 48;
      const distanceFromBottom = scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight);
      setShowScrollToBottom(hasOverflow && distanceFromBottom > 40);
    };

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateScrollButtonVisibility);
    };

    updateScrollButtonVisibility();
    scroller.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      cancelAnimationFrame(frameId);
      scroller.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [messageListRef, room?.roomId, room?.messages?.length, typingParticipants?.length]);

  const scrollMessageListToBottom = () => {
    const scroller = messageListRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      top: scroller.scrollHeight,
      behavior: 'smooth',
    });
    setShowScrollToBottom(false);
  };

  return (
    <>
      {(statusMessage || errorMessage) && !chatOpen && (
        <div
          style={{
            ...PANEL_STYLE,
            width: '100%',
            maxWidth: '880px',
            alignSelf: 'center',
            padding: '14px 18px',
            background: errorMessage ? '#fff1f2' : '#f0fdf4',
            borderColor: errorMessage ? '#fda4af' : '#86efac',
            borderBottomColor: errorMessage ? '#fb7185' : '#4ade80',
            color: errorMessage ? '#9f1239' : '#166534',
            fontSize: '0.94rem',
            marginBottom: '4px',
          }}
        >
          {errorMessage || statusMessage}
        </div>
      )}

      {!chatOpen && (
        <div
          style={{
            ...PANEL_STYLE,
            width: '100%',
            maxWidth: isMobile ? '720px' : '1240px',
            margin: '0 auto',
            alignSelf: 'center',
            padding: isMobile ? '18px 16px' : '28px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '260px 1fr',
            gap: isMobile ? '18px' : '32px',
            minHeight: isMobile ? 'auto' : '680px',
          }}
        >
          {/* Sidebar Tabs */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '12px', overflowX: isMobile ? 'auto' : 'visible' }}>
            {[
              { id: 'create', icon: PlusCircle, label: copy.createLabel },
              { id: 'join', icon: UserRoundPlus, label: copy.joinLabel },
              { id: 'list', icon: MessageCircle, label: copy.roomDirectory },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleLobbyTabPress(tab.id)}
                style={{
                  ...BUTTON_STYLE,
                  flex: 1,
                  justifyContent: 'flex-start',
                  padding: '14px 18px',
                  background: lobbyTab === tab.id ? '#fce7f3' : '#ffffff',
                  color: lobbyTab === tab.id ? '#9d174d' : '#475569',
                  borderColor: lobbyTab === tab.id ? '#f472b6' : '#cbd5e1',
                  borderBottomColor: lobbyTab === tab.id ? '#db2777' : '#94a3b8',
                }}
              >
                <tab.icon size={18} strokeWidth={2.4} />
                {tab.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button
              onClick={() => handleHeaderAction(handleLeaveView, 'tap')}
              style={{
                ...BUTTON_STYLE,
                justifyContent: 'flex-start',
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

          {/* Right Content Area */}
          <div style={{ minWidth: 0 }}>
            {lobbyTab === 'list' && (
              <div style={{ display: 'grid', gap: '14px' }}>
                <div
                  style={{
                    display: 'grid',
                    gap: '8px',
                    padding: isMobile ? '4px 2px 0' : '0',
                  }}
                >
                  <div style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: isMobile ? '1.3rem' : '1.4rem', color: '#0f172a', fontWeight: 400, lineHeight: 1 }}>
                    {copy.roomDirectory}
                  </div>
                  <div style={{ color: '#64748b', fontSize: isMobile ? '0.88rem' : '0.94rem', lineHeight: 1.35 }}>
                    {copy.featuredRooms}
                  </div>
                </div>

                <div
                  className="hide-scrollbar"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: isMobile ? '12px' : '16px',
                    maxHeight: isMobile ? 'calc(100svh - 280px)' : '540px',
                    overflowY: 'auto',
                    padding: isMobile ? '2px 0 8px' : '2px',
                  }}
                >
                  {[...savedRooms, ...visiblePublicRooms.filter((pr) => !savedRooms.some((sr) => sr.roomId === pr.roomId))].map((savedRoom, index) => {
                    const palette = getPaletteByIndex(index);
                    const isCurrentRoom = savedRoom.roomId === room.roomId;
                    return (
                      <button
                        key={savedRoom.roomId}
                        onClick={() => handleHeaderAction(() => openSavedRoom(savedRoom.roomId), 'selection')}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          textAlign: 'left',
                          padding: isMobile ? '14px 14px 12px' : '16px',
                          borderRadius: '22px',
                          border: `1.5px solid ${isCurrentRoom ? palette.border : '#dbe2ea'}`,
                          background: isCurrentRoom ? `linear-gradient(180deg, ${palette.bg}66 0%, #ffffff 70%)` : '#ffffff',
                          borderBottom: `5px solid ${isCurrentRoom ? palette.border : '#cbd5e1'}`,
                          boxShadow: isCurrentRoom ? `0 10px 22px ${palette.border}18` : '0 6px 14px rgba(15, 23, 42, 0.05)',
                          cursor: 'pointer',
                        }}
                      >
                        <RoomStackAvatar participants={savedRoom.participants || []} size={isMobile ? 44 : 48} />
                        <div style={{ minWidth: 0, flex: 1, display: 'grid', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ color: '#0f172a', fontSize: isMobile ? '1rem' : '1.05rem', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getRoomDisplayName(savedRoom, copy)}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.76rem', flexShrink: 0 }}>{formatTime(savedRoom.updatedAt)}</div>
                          </div>
                          <div style={{ color: '#64748b', fontSize: isMobile ? '0.82rem' : '0.84rem', lineHeight: 1.3, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{getRoomPreviewText(savedRoom, copy)}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                            <span style={{ ...PANEL_STYLE, border: '1px solid #dbe2ea', borderBottom: '2px solid #cbd5e1', borderRadius: '999px', padding: '2px 7px', fontSize: '0.68rem', background: '#ffffff', color: '#64748b', boxShadow: 'none' }}>
                              {(savedRoom.participants || []).length} {copy.activePlayers.toLowerCase()}
                            </span>
                            <span style={{ ...PANEL_STYLE, border: '1px solid #dbe2ea', borderBottom: '2px solid #cbd5e1', borderRadius: '999px', padding: '2px 7px', fontSize: '0.68rem', background: '#ffffff', color: '#64748b', boxShadow: 'none' }}>
                              {(savedRoom.visibility || 'private') === 'public' ? copy.publicRoom : copy.privateRoom}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(lobbyTab === 'create' || lobbyTab === 'join') && (
              <div
                className="hide-scrollbar"
                style={{
                  display: 'grid',
                  gap: '24px',
                  maxHeight: isMobile ? 'none' : '640px',
                  overflowY: 'auto',
                  padding: '2px'
                }}
              >
                <div style={{ color: '#64748b', fontSize: '1rem', fontStyle: 'italic', padding: '40px', textAlign: 'center', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '24px' }}>
                  {lobbyTab === 'create' ? "Configure your new room in the lobby..." : "Enter a code to join a room..."}
                  <div style={{ marginTop: '20px' }}>
                    <button
                      onClick={() => handleHeaderAction(() => handleStartRoomFlow(lobbyTab), 'tap')}
                      style={{ ...BUTTON_STYLE, padding: '12px 24px', background: '#0d9488', color: '#fff', borderColor: '#0f766e', borderBottomColor: '#134e4a' }}
                    >
                      {lobbyTab === 'create' ? copy.createLabel : copy.joinLabel}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {chatOpen && (
        <div
          style={{
            width: '100%',
            maxWidth: '100%',
            alignSelf: 'center',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '340px minmax(0, 1fr)',
            gap: '20px',
            position: 'relative',
            minHeight: isMobile ? 'calc(100svh - 100px)' : 'calc(100vh - 100px)',
            height: isMobile ? 'calc(100svh - 100px)' : 'calc(100vh - 100px)',
            maxHeight: isMobile ? 'calc(100svh - 100px)' : 'calc(100vh - 100px)',
            overflow: 'hidden',
          }}
        >
          {!isMobile && (
            <div style={{ position: 'sticky', top: '24px', height: 'fit-content' }}>
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
                isMobile={isMobile}
              />
            </div>
          )}

          <div
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.86)), 
                           repeating-linear-gradient(transparent, transparent 31px, rgba(191, 219, 254, 0.55) 32px), 
                           #fcfcfd`,
              padding: isMobile ? '8px' : '12px',
              flex: 1,
              minWidth: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%',
              maxWidth: '100%',
              alignSelf: 'stretch',
              overflow: 'hidden',
              border: `2px solid ${withAlpha(activeParticipantPalette.border, '55')}`,
              borderBottom: `7px solid ${activeParticipantPalette.border}`,
              borderRadius: '28px',
              boxShadow: isMobile ? 'none' : `0 18px 42px ${withAlpha(activeParticipantPalette.border, '1A')}`,
              position: 'relative', // Anchor the absolute drawing overlay
            }}
          >
            {drawingOpen && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2000,
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '0' : '20px',
                backdropFilter: isMobile ? 'none' : 'blur(12px)',
                borderRadius: isMobile ? '0' : '26px',
                touchAction: 'none',
                WebkitTouchCallout: 'none',
              }}>
                <div
                  data-no-tab-swipe="1"
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <DrawingPad
                    canvasRef={drawingCanvasRef}
                    isMobile={isMobile}
                    palette={activeParticipantPalette}
                    brushSize={drawingBrushSize}
                    mode={drawingMode}
                    color={drawingBrushColor}
                    onBrushSizeChange={setDrawingBrushSize}
                    onModeChange={setDrawingMode}
                    onColorChange={setDrawingBrushColor}
                    onClear={clearDrawingDraft}
                    onUndo={handleUndoDrawing}
                    onRedo={handleRedoDrawing}
                    onFill={handleFillCanvas}
                    onSnapshot={takeDrawingSnapshot}
                    onSave={(dataUrl) => {
                      setDrawingDraft(dataUrl);
                      setDrawingOpen(false);
                      setComposerActive(true);
                    }}
                    onClose={() => setDrawingOpen(false)}
                    copy={copy}
                  />
                </div>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 18px',
                background: bannerBackground,
                border: `3.5px solid ${bannerBorder}`,
                borderBottom: `7px solid ${bannerBorder}`,
                borderRadius: '24px',
                boxShadow: isMobile ? 'none' : bannerShadow,
                zIndex: 10,
              }}
            >
              <button
                type="button"
                onClick={() => handleHeaderAction(isMobile ? () => setChatOpen(false) : handleManualRefresh, isMobile ? 'tap' : 'selection')}
                disabled={!isMobile && busyAction === 'refresh'}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '999px',
                  border: `1px solid ${bannerBorder}`,
                  background: activeParticipantPalette.bg,
                  color: activeParticipantPalette.text,
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
              <div style={{ minWidth: 0, textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <RoomStackAvatar participants={liveParticipants} size={40} />
                <div
                  style={{ minWidth: 0, overflow: 'hidden' }}
                >
                  <div
                    style={{
                      color: activeParticipantPalette.text,
                      fontFamily: CHAT_FONT_FAMILY,
                      fontSize: isMobile ? '1.04rem' : '1.16rem',
                      fontWeight: 400,
                      lineHeight: 1.05,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {getRoomDisplayName(room, copy)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ color: activeParticipantPalette.text, fontSize: '0.82rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, whiteSpace: 'nowrap' }}>
                      {(liveParticipants || []).length} {copy.activePlayers.toLowerCase()}
                    </div>
                    <span style={{ color: activeParticipantPalette.border, flexShrink: 0 }}>•</span>
                    <div style={{ color: activeParticipantPalette.text, fontSize: '0.82rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, whiteSpace: 'nowrap' }}>
                      {formatTime(getRoomLastMessageTime(room))}
                    </div>
                    {entryTime && (
                      <>
                        <span style={{ color: activeParticipantPalette.border, flexShrink: 0 }}>•</span>
                        <LiveSessionTimer entryTime={entryTime} copy={copy} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleHeaderAction(handleLeaveView, 'tap')}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '999px',
                    border: `1px solid ${bannerBorder}`,
                    borderBottom: `2px solid ${bannerBorder}`,
                    background: '#ffffff',
                    color: activeParticipantPalette.text,
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
                  onClick={() => handleHeaderAction(() => setSettingsOpen(true), 'selection')}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '999px',
                    border: `1px solid ${bannerBorder}`,
                    borderBottom: `2px solid ${bannerBorder}`,
                    background: '#ffffff',
                    color: activeParticipantPalette.text,
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
              className="chat-scroller hide-scrollbar"
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                padding: isMobile ? '10px 4px 60px' : '12px 10px 40px',
                scrollPaddingBottom: '100px',
                scrollBehavior: 'smooth',
                position: 'relative',
                minHeight: 0,
              }}
            >
              {!(room?.messages?.length) && (
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
              {(room?.messages || []).map((message, index) => {
                const author = (liveParticipants || []).find((participant) => participant.id === message.authorId);
                const isOwnMessage = message.authorId === activeParticipantId;
                return (
                  <ChatMessageRow
                    key={message.id}
                    message={message}
                    author={author}
                    palette={isOwnMessage ? activeParticipantPalette : (author?.paletteIndex !== undefined ? getPaletteByIndex(author.paletteIndex) : getPaletteByIndex(Math.max((liveParticipants || []).findIndex((p) => p.id === author?.id), 0)))}
                    isOwnMessage={isOwnMessage}
                    isMobile={isMobile}
                    fallbackPortraitSrc={selectedPortrait.src}
                    copy={copy}
                    index={index}
                    allMessages={room?.messages || []}
                    participants={liveParticipants}
                    activeParticipantId={activeParticipantId}
                    lastReadMap={room.lastReadMap}
                    isOwnParticipant={!!activeParticipantId}
                    onSelectReply={setReplyToMessage}
                    onSelectEdit={setEditingMessage}
                    onRemixDrawing={(dataUrl) => {
                      restoreDrawingFromDataUrl(dataUrl);
                      setDrawingOpen(true);
                      setComposerActive(true);
                    }}
                    onReact={handleReact}
                    onScrollToMessage={scrollToMessageId}
                    messageDirection={profile.messageDirection}
                  />
                );
              })}
              <AnimatePresence initial={false}>
                {!!(typingParticipants || []).length && (
                  <motion.div
                    key="typing-indicator"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingLeft: '4px',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <ChatFaceAvatar
                      src={typingParticipants[0]?.portraitSrc}
                      name={typingParticipants[0]?.characterName}
                      palette={getPaletteByIndex(Math.max((liveParticipants || []).findIndex((p) => p.id === typingParticipants[0].id), 0))}
                      size={28}
                    />
                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                        padding: '8px 12px',
                        borderRadius: '20px 20px 20px 10px',
                        background: '#fffefc',
                        border: `2.2px solid ${getPaletteByIndex(Math.max((liveParticipants || []).findIndex((p) => p.id === typingParticipants[0].id), 0)).border}`,
                        borderBottom: `5px solid ${getPaletteByIndex(Math.max((liveParticipants || []).findIndex((p) => p.id === typingParticipants[0].id), 0)).border}`,
                        boxShadow: '0 8px 16px rgba(15, 23, 42, 0.05)',
                      }}
                    >
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: dot * 0.16 }}
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '999px',
                            background: getPaletteByIndex(Math.max((liveParticipants || []).findIndex((p) => p.id === typingParticipants[0].id), 0)).border,
                            display: 'block'
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '6px',
                padding: isMobile ? '10px 12px' : '12px 16px',
                background: 'transparent',
                border: 'none',
                flexShrink: 0,
                transition: 'box-shadow 180ms ease, border-color 180ms ease, border-bottom-color 180ms ease',
                position: 'relative',
              }}
            >

              <AnimatePresence initial={false}>
                {drawingDraft && !drawingOpen && (
                  <motion.div
                    key="drawing-draft"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
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
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {(replyToMessage || editingMessage) && (
                  <motion.div
                    key="reply-edit-banner"
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: '8px',
                      padding: '11px 12px',
                      background: '#ffffff',
                      border: '2px solid #e2e8f0',
                      borderBottom: '4px solid #cbd5e1',
                      borderRadius: '18px',
                      marginBottom: '6px',
                      position: 'relative',
                      zIndex: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: editingMessage ? '#f97316' : '#10b981',
                        background: editingMessage ? '#fff7ed' : '#ecfdf5',
                        padding: '3px 10px',
                        borderRadius: '10px',
                        border: `1.5px solid ${editingMessage ? '#ffedd5' : '#d1fae5'}`,
                        flexShrink: 0,
                      }}>
                        {editingMessage ? <PencilLine size={12} /> : <CornerUpLeft size={12} />}
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 400,
                          fontFamily: CHAT_FONT_FAMILY,
                          whiteSpace: 'nowrap',
                          lineHeight: 1.2,
                        }}>
                          {editingMessage ? 'Editing message' : `Replying to ${(editingMessage || replyToMessage)?.senderName || 'User'}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyToMessage(null);
                          setEditingMessage(null);
                          if (editingMessage) setMessageDraft('');
                        }}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <div style={{
                        flex: 1,
                        color: '#475569',
                        fontSize: '0.94rem',
                        whiteSpace: 'pre-wrap',
                        fontFamily: CHAT_FONT_FAMILY,
                        lineHeight: 1.3,
                        fontWeight: 400,
                        wordBreak: 'break-word',
                      }}>
                        {(editingMessage || replyToMessage)?.text || ((editingMessage || replyToMessage)?.drawing ? 'Drawn message' : '...')}
                      </div>
                      {(editingMessage || replyToMessage)?.drawing && (
                        <img
                          src={(editingMessage || replyToMessage).drawing}
                          alt="thumbnail"
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #f1f5f9', background: '#fff', flexShrink: 0 }}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={false}
                animate={{
                  boxShadow: composerExpanded ? '0 12px 24px rgba(15, 23, 42, 0.06)' : '0 6px 16px rgba(15, 23, 42, 0.04)',
                }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  gap: '2px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 8px',
                  borderRadius: '18px',
                  border: `2px solid ${composerActive ? `${activeParticipantPalette.border}66` : 'rgba(214, 223, 235, 0.95)'}`,
                  borderBottom: `5px solid ${composerActive ? activeParticipantPalette.border : '#cbd5e1'}`,
                  background: 'transparent',
                  backdropFilter: 'none',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: 0, padding: '1px 6px' }}>
                  <motion.div
                    initial={false}
                    animate={{
                      width: composerAvatarSize,
                      opacity: showComposerAvatar ? 1 : 0,
                      scale: showComposerAvatar ? 1 : 0.92,
                    }}
                    transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.8 }}
                    style={{
                      width: composerAvatarSize,
                      height: composerAvatarSize,
                      overflow: 'hidden',
                      flexShrink: 0,
                      pointerEvents: 'none',
                      marginRight: '2px',
                    }}
                  >
                    <div style={{ width: composerAvatarSize, height: composerAvatarSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChatFaceAvatar
                        src={profile?.portraitSrc || selectedPortrait.src}
                        name={profile?.characterName || 'User'}
                        palette={activeParticipantPalette}
                        size={composerAvatarSize}
                        variant="flat"
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={false}
                    animate={{
                      x: showComposerAvatar ? 0 : -(composerAvatarSize + 8),
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.85 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: `${composerAvatarSize + 6}px`,
                      padding: showComposerAvatar ? '5px 10px 5px 10px' : '5px 10px 5px 6px',
                      background: 'transparent',
                      borderRadius: '14px',
                      flex: 1,
                      border: 'none',
                      boxShadow: 'none',
                      minWidth: 0,
                    }}
                  >
                      <div style={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', alignItems: 'stretch' }}>
                        <textarea
                          value={messageDraft}
                          onChange={(event) => {
                            setMessageDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH));
                            queueComposerCaretSync();
                          }}
                          onInput={queueComposerCaretSync}
                          onFocus={() => {
                            setComposerActive(true);
                            setTypingFocused(true);
                            queueComposerCaretSync();
                          }}
                          onBlur={() => {
                            setTypingFocused(false);
                            setComposerActive(false);
                            if (caretRef.current) caretRef.current.style.opacity = '0';
                          }}
                          onSelect={queueComposerCaretSync}
                          onClick={queueComposerCaretSync}
                          onKeyUp={queueComposerCaretSync}
                          onMouseUp={queueComposerCaretSync}
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
                            minWidth: 0,
                            minHeight: '42px',
                            maxHeight: '220px',
                          resize: 'none',
                          border: 'none',
                          background: 'transparent',
                          color: '#1e293b',
                          padding: '10px 8px 8px',
                          fontFamily: CHAT_FONT_FAMILY,
                          fontSize: isMobile ? '0.98rem' : '1.03rem',
                          fontWeight: 400,
                          lineHeight: 1.35,
                            overflowY: 'auto',
                            outline: 'none',
                            alignSelf: 'stretch',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            transition: 'opacity 120ms ease',
                            caretColor: 'transparent',
                            position: 'relative',
                            zIndex: 1,
                          }}
                          className="hide-scrollbar"
                        />
                        <span
                          ref={caretRef}
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '3px',
                            height: '18px',
                            borderRadius: '999px',
                            background: `linear-gradient(180deg, ${activeParticipantPalette.border} 0%, ${withAlpha(activeParticipantPalette.border, 'CC')} 100%)`,
                            boxShadow: `0 0 0 2px ${withAlpha(activeParticipantPalette.border, '10')}, 0 0 10px ${withAlpha(activeParticipantPalette.border, '16')}`,
                            pointerEvents: 'none',
                            transform: 'translate3d(0, 0, 0)',
                            transformOrigin: 'center top',
                            zIndex: 2,
                            willChange: 'transform, opacity',
                            opacity: 0,
                            transition: 'opacity 80ms ease',
                          }}
                        />
                        <span
                          ref={caretTrailRef}
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '14px',
                            height: '18px',
                            borderRadius: '999px',
                            background: `linear-gradient(90deg, ${withAlpha(activeParticipantPalette.border, '00')} 0%, ${withAlpha(activeParticipantPalette.border, '25')} 50%, ${withAlpha(activeParticipantPalette.border, '00')} 100%)`,
                            filter: 'blur(1px)',
                            pointerEvents: 'none',
                            transform: 'translate3d(0, 0, 0)',
                            transformOrigin: 'center center',
                            zIndex: 1,
                            willChange: 'transform, opacity',
                            opacity: 0,
                            transition: 'transform 65ms cubic-bezier(0.22, 1, 0.36, 1), opacity 120ms ease',
                          }}
                        />
                      </div>
                  </motion.div>
                  <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                    <motion.button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleHeaderAction(() => setDrawingOpen(!drawingOpen), 'selection')}
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: `${composerButtonSize}px`,
                        height: `${composerButtonSize}px`,
                        borderRadius: '14px',
                        background: drawingOpen ? `${activeParticipantPalette.bg}` : '#ffffff',
                        color: drawingOpen ? activeParticipantPalette.text : '#64748b',
                        border: `2.2px solid ${drawingOpen ? activeParticipantPalette.border : '#dbe2ea'}`,
                        borderBottomWidth: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 120ms ease',
                      }}
                    >
                      <PencilLine size={composerIconSize} strokeWidth={2.3} />
                    </motion.button>
                    <motion.button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleSendMessage}
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={(!messageDraft.trim() && !drawingDraft) || composerIsBusy}
                      style={{
                        width: `${composerButtonSize}px`,
                        height: `${composerButtonSize}px`,
                        background: activeParticipantPalette.border,
                        color: '#ffffff',
                        border: `2px solid ${activeParticipantPalette.border}`,
                        borderBottom: `5px solid ${activeParticipantPalette.shadow || activeParticipantPalette.border}`,
                        borderRadius: '14px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 8px 18px ${activeParticipantPalette.border}33`,
                        opacity: (!messageDraft.trim() && !drawingDraft) || composerIsBusy ? 0.45 : 1,
                        alignSelf: 'center',
                      }}
                      aria-label={copy.sendAction}
                    >
                      <AnimatePresence initial={false} mode="wait">
                        {composerIsBusy ? (
                          <motion.span
                            key="send-loading"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.14, ease: 'easeOut' }}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <LoaderCircle size={composerIconSize} style={SPIN_ICON_STYLE} />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="send-ready"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.14, ease: 'easeOut' }}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Send size={composerIconSize} strokeWidth={2.7} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
              <AnimatePresence initial={false}>
                {showScrollToBottom && (
                  <motion.button
                    key="scroll-to-bottom"
                    type="button"
                    onClick={() => handleHeaderAction(scrollMessageListToBottom, 'selection')}
                    initial={{ opacity: 0, y: 10, scale: 0.88 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.88 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    whileHover={{ y: -1, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      position: 'absolute',
                      right: isMobile ? '12px' : '16px',
                      bottom: isMobile ? '104px' : '112px',
                      width: '38px',
                      height: '38px',
                      borderRadius: '999px',
                      border: `1.5px solid ${activeParticipantPalette.border}`,
                      borderBottom: `4px solid ${activeParticipantPalette.border}`,
                      background: '#ffffff',
                      color: activeParticipantPalette.text,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 25,
                      boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
                      backdropFilter: 'blur(10px)',
                    }}
                    aria-label="Scroll to latest messages"
                    title="Scroll to latest messages"
                  >
                    <ArrowDown size={16} strokeWidth={2.4} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          {settingsOpen && (
            <ChatSettingsSheet
              isMobile={isMobile}
              room={room}
              participants={liveParticipants}
              activeParticipantId={activeParticipantId}
              selectedCharacter={profile?.characterName || 'Mitsumi'}
              currentPaletteIndex={typeof profile?.paletteIndex === 'number' ? profile.paletteIndex : 5}
              onPortraitSelect={handleSwitchCharacter}
              onPaletteSelect={handleSwitchPalette}
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
              onTitleChange={handleUpdateRoomTitle}
              messageDirection={profile?.messageDirection || 'right'}
              onDirectionChange={(val) => updateProfileField('messageDirection', val)}
              busyAction={busyAction}
              isCreator={isCreator}
              copy={copy}
            />
          )}
        </div>
      )}
    </>
  );
}
