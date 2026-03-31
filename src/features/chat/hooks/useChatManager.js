import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UI_TEXT } from '../../../config/uiText';
import { triggerHaptic } from '../../../utils/haptics';
import { PORTRAIT_DATA } from '../../mystery/mysteryData';
import {
  createChatRoom,
  endChatRoom,
  fetchChatRoom,
  fetchPublicChatRooms,
  joinChatRoom,
  sendChatMessage,
  setChatReadState,
  setChatTypingState,
  updateChatRoomSettings,
} from '../chatApi';
import {
  ACTIVE_ROOM_POLL_INTERVAL_MS,
  BANNED_ROOM_IDS,
  DEFAULT_CHAT_COPY,
  DRAWING_COLORS,
  POLL_INTERVAL_MS,
  getLocalizedChatCopy,
  TYPING_DEBOUNCE_MS,
} from '../chatConstants';
import {
  formatTime,
  getNormalizedRoomId,
  getStoredCreatorToken,
  getStoredIdentityKey,
  getStoredParticipant,
  getUniversalUserId,
  isRoomMarkedMissing,
  markRoomMissing,
  readCatalogCache,
  readLastRoomId,
  readMemberships,
  readProfile,
  readSavedRoomIds,
  readChatOpenState,
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
  writeChatOpenState,
  readEntryTime,
  writeEntryTime,
} from '../chatStorage';
import { getPaletteByIndex } from '../chatPalette';
import {
  areRoomCatalogEntriesEqual,
  createRoomCatalogEntry,
  getSystemMessageText,
  mergeRoomDirectoryRooms,
} from '../chatUtils';

export function useChatManager(isMobile, uiLanguage = 'en', syncData = null) {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const copy = useMemo(
    () => ({ ...DEFAULT_CHAT_COPY, ...(UI_TEXT.en.chat || {}), ...getLocalizedChatCopy(uiLanguage), ...(t.chat || {}) }),
    [t],
  );
  const initialProfile = useMemo(() => readProfile(), []);
  const initialLastRoomId = useMemo(() => readLastRoomId(), []);
  const [savedLastRoomId, setSavedLastRoomId] = useState(initialLastRoomId);
  const [chatOpen, setChatOpen] = useState(() => readChatOpenState());
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [roomCatalog, setRoomCatalog] = useState(() => readCatalogCache());
  const [savedRoomIds, setSavedRoomIds] = useState(() => readSavedRoomIds());
  const [publicRooms, setPublicRooms] = useState([]);
  const [mode, setMode] = useState(() => localStorage.getItem('skip_chat_mode_v1') || 'saved'); 
  const [profile, setProfile] = useState(initialProfile);
  const [roomVisibility, setRoomVisibility] = useState('private');
  const [roomTitle, setRoomTitle] = useState('Sketchbook Hangout');
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
  const [drawingBrushSize, setDrawingBrushSize] = useState(5);
  const [drawingBrushColor, setDrawingBrushColor] = useState(DRAWING_COLORS[0]);
  const [drawingMode, setDrawingMode] = useState('brush'); 
  const [drawingSnapshots, setDrawingSnapshots] = useState([]);
  const [drawingRedoStack, setDrawingRedoStack] = useState([]);
  const [composerActive, setComposerActive] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [sendPulse, setSendPulse] = useState(0);
  const [typingFocused, setTypingFocused] = useState(false);
  const [entryTime, setEntryTime] = useState(null);

  const portraitByName = useMemo(
    () => Object.fromEntries(PORTRAIT_DATA.map((portrait) => [portrait.name, portrait])),
    [],
  );

  const selectedPortrait = portraitByName[profile.characterName] || PORTRAIT_DATA[0];

  const messageListRef = useRef(null);
  const messageInputRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const drawingActiveRef = useRef(false);
  const drawingDraftRef = useRef('');
  const drawingBrushSizeRef = useRef(drawingBrushSize);
  const drawingBrushColorRef = useRef(drawingBrushColor);
  const drawingModeRef = useRef(drawingMode);
  const profileRef = useRef(profile);
  const selectedPortraitRef = useRef(selectedPortrait);
  const typingTimeoutRef = useRef(null);
  const threadScrollStateRef = useRef({ roomId: '', messageCount: 0 });
  const lastActionTimestampRef = useRef(0);

  useEffect(() => {
    profileRef.current = profile;
    selectedPortraitRef.current = selectedPortrait;
  }, [profile, selectedPortrait]);

  useEffect(() => {
    localStorage.setItem('skip_chat_mode_v1', mode);
  }, [mode]);

  useEffect(() => {
    const handleSync = () => {
      // Reload everything from localStorage when a sync pull completes
      setProfile(readProfile());
      setSavedRoomIds(readSavedRoomIds());
      setRoomCatalog(readCatalogCache());
      setSavedLastRoomId(readLastRoomId());
    };
    window.addEventListener('skip_sync_complete', handleSync);
    
    // Proactive refresh: ensure membership rooms are in savedRoomIds on boot
    const membershipIds = Object.keys(readMemberships());
    if (membershipIds.length > 0) {
      setSavedRoomIds(current => {
        const next = [...new Set([...(current || []), ...membershipIds])].slice(0, 50);
        if (next.length !== current.length) writeSavedRoomIds(next);
        return next;
      });
    }

    return () => {
      window.removeEventListener('skip_sync_complete', handleSync);
    };
  }, []);

  useEffect(() => {
    // Clear reply and edit state when switching rooms
    setReplyToMessage(null);
    setEditingMessage(null);
  }, [room?.roomId]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages, room change, or typing activity
    if (messageListRef.current) {
      const isNearBottom = messageListRef.current.scrollHeight - messageListRef.current.scrollTop <= messageListRef.current.clientHeight + 250;
      if (isNearBottom || room?.messages?.length > 0) {
        // Small delay to ensure browser layout is stable, especially on mobile
        const timer = setTimeout(() => {
          if (messageListRef.current) {
            messageListRef.current.scrollTo({
              top: messageListRef.current.scrollHeight,
              behavior: (room?.messages?.length > 1) ? 'smooth' : 'auto' // Instant on first join, smooth on new messages
            });
          }
        }, 32);
        return () => clearTimeout(timer);
      }
    }
  }, [room?.messages?.length, room?.typingParticipants, room?.roomId]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!room?.roomId || !activeParticipantId || !room?.messages?.length) return undefined;

    const latestMessage = [...room.messages].slice().reverse().find((message) => message?.id);
    if (!latestMessage?.id) return undefined;

    const isNearBottom = !messageList
      || (messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight) < 180;

    if (!isNearBottom) return undefined;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setChatReadState(room.roomId, {
        participantId: activeParticipantId,
        lastReadMessageId: latestMessage.id,
      }).catch(() => {});
    }, 48);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeParticipantId, messageListRef, room?.roomId, room?.messages?.length, room?.messages?.[room?.messages?.length - 1]?.id, chatOpen]);

  const participants = room?.participants || [];
  const savedRooms = useMemo(
    () =>
      (savedRoomIds || [])
        .filter((id) => !(BANNED_ROOM_IDS || []).includes(id))
        .filter((id) => !isRoomMarkedMissing(id))
        .map((roomId) => {
          if (room?.roomId === roomId) return room;
          const cached = roomCatalog[roomId];
          if (cached) return cached;
          // Return a placeholder for rooms that are in history but not in cache
          return { roomId, title: `Room ${roomId}`, messages: [], participants: [], updatedAt: 0, placeholder: true };
        }),
    [room, roomCatalog, savedRoomIds],
  );
  const savedRoomIdSet = useMemo(
    () => new Set((savedRoomIds || []).map((roomId) => getNormalizedRoomId(roomId))),
    [savedRoomIds],
  );
  const visiblePublicRooms = useMemo(
    () => (publicRooms || [])
      .filter((publicRoom) => !isRoomMarkedMissing(publicRoom.roomId))
      .filter((publicRoom) => !savedRoomIdSet.has(getNormalizedRoomId(publicRoom.roomId)))
      .filter((publicRoom) => !(BANNED_ROOM_IDS || []).includes(publicRoom.roomId)),
    [publicRooms, savedRoomIdSet],
  );
  const roomDirectoryRooms = useMemo(
    () => mergeRoomDirectoryRooms(savedRooms, visiblePublicRooms),
    [savedRooms, visiblePublicRooms],
  );
  const filteredSavedRooms = useMemo(() => {
    const query = roomSearch.trim().toLowerCase();
    const matchRoom = (savedRoom) => {
      const searchable = [
        savedRoom.title,
        savedRoom.roomId,
        ...(savedRoom.participants || []).map((p) => p.characterName),
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
    () => (participants || []).filter((p) => room?.typingParticipants?.[p.id] && p.id !== activeParticipantId),
    [activeParticipantId, participants, room?.typingParticipants],
  );
  const activeParticipant =
    (room?.participants || []).find((p) => p.id === activeParticipantId) ||
    (activeParticipantId
      ? {
          id: activeParticipantId,
          characterName: profile.characterName,
          portraitSrc: selectedPortrait.src,
        }
      : null);
  const activeParticipantIndex = Math.max(
    (participants || []).findIndex((p) => p.id === activeParticipantId),
    0,
  );
  const activeParticipantPalette = getPaletteByIndex(
    activeParticipant?.paletteIndex !== undefined 
      ? activeParticipant.paletteIndex 
      : (activeParticipantIndex || profile.paletteIndex)
  );
  const isCreator = !!room && !!activeParticipant && (room.creatorId === activeParticipantId || !!activeParticipant.isCreator);
  const updateRoomCatalogCache = useCallback((rooms) => {
    const nextRooms = (Array.isArray(rooms) ? rooms : [rooms]).filter(Boolean);
    if (!nextRooms.length) return;

    setRoomCatalog((current) => {
      let hasChanges = false;
      const next = { ...current };

      nextRooms.forEach((roomSnapshot) => {
        const catalogEntry = createRoomCatalogEntry(roomSnapshot);
        if (!catalogEntry?.roomId) return;
        if (areRoomCatalogEntriesEqual(current[catalogEntry.roomId], catalogEntry)) return;
        next[catalogEntry.roomId] = catalogEntry;
        hasChanges = true;
      });

      if (!hasChanges) return current;

      writeCatalogCache(next);
      return next;
    });
  }, []);

  const persistLastRoomId = useCallback((nextRoomId) => {
    writeLastRoomId(nextRoomId);
    setSavedLastRoomId(nextRoomId);
    syncData?.pushNow();
  }, [syncData]);

  const rememberSavedRoom = useCallback((nextRoomId) => {
    if (!nextRoomId) return;
    const normalizedId = getNormalizedRoomId(nextRoomId);
    if ((BANNED_ROOM_IDS || []).includes(normalizedId)) return;

    setSavedRoomIds((current) => {
      const next = [normalizedId, ...current.filter((id) => id !== normalizedId)].slice(0, 30);
      writeSavedRoomIds(next);
      syncData?.pushNow();
      return next;
    });
  }, [syncData]);

  const forgetSavedRoom = useCallback((roomId) => {
    if (!roomId) return;
    const normalizedId = getNormalizedRoomId(roomId);
    setSavedRoomIds((current) => {
      const next = current.filter((id) => id !== normalizedId);
      writeSavedRoomIds(next);
      syncData?.pushNow();
      return next;
    });
    setRoomCatalog((current) => {
      if (!current[normalizedId]) return current;
      const next = { ...current };
      delete next[normalizedId];
      writeCatalogCache(next);
      return next;
    });
  }, [syncData]);
  const removeRoomFromPublicRooms = useCallback((roomId) => {
    if (!roomId) return;
    const normalizedId = getNormalizedRoomId(roomId);
    setPublicRooms((current) =>
      current.filter((publicRoom) => getNormalizedRoomId(publicRoom.roomId) !== normalizedId),
    );
  }, []);
  const retireRoomLocally = useCallback((roomId) => {
    if (!roomId) return;
    const normalizedId = getNormalizedRoomId(roomId);
    if (!normalizedId) return;

    markRoomMissing(normalizedId);
    forgetSavedRoom(normalizedId);
    removeStoredParticipant(normalizedId);
    removeStoredCreatorToken(normalizedId);
    removeRoomFromPublicRooms(normalizedId);

    if (getNormalizedRoomId(readLastRoomId()) === normalizedId) {
      persistLastRoomId('');
    }
  }, [forgetSavedRoom, persistLastRoomId, removeRoomFromPublicRooms]);

  const handleMissingRoom = useCallback((missingRoomId, message) => {
    if (!missingRoomId) return;

    retireRoomLocally(missingRoomId);
    setRoomCode(missingRoomId);
    setRoom(null);
    setChatOpen(false);
    setSettingsOpen(false);
    setTypingFocused(false);
    setActiveParticipantId('');
    setStatusMessage(message || `Room ${missingRoomId} is no longer active.`);
    setErrorMessage('');
  }, [retireRoomLocally]);

  const resolveRoomSession = useCallback(async (targetRoomId, { autoJoinPublic = false } = {}) => {
    const { room: fetchedRoom } = await fetchChatRoom(targetRoomId);
    const userId = getUniversalUserId();
    const creatorToken = getStoredCreatorToken(targetRoomId);

    const participantStillPresent = !!(fetchedRoom.participants || []).find((p) => p.id === userId);
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

    const existingId = getStoredParticipant(targetRoomId);
    if (!shouldJoin) {
      const { room: fetchedRoom, reclaimPin: fetchedPin } = await fetchChatRoom(targetRoomId, creatorToken);
      return {
        room: fetchedRoom,
        participantId: existingId || userId,
        reclaimPin: fetchedPin,
      };
    }

    const { room: nextRoom, participantId, reclaimCode, reclaimPin } = await joinChatRoom(targetRoomId, {
      participantId: existingId || userId,
      characterName: profileRef.current.characterName,
      portraitSrc: selectedPortraitRef.current.src,
      paletteIndex: profileRef.current.paletteIndex,
    }, creatorToken);

    const resolvedId = participantId || existingId || userId;
    return { room: nextRoom, participantId: resolvedId, reclaimCode, reclaimPin };
  }, []);



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
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, [messageDraft]);

  useEffect(() => {
    if (editingMessage?.text) {
      setMessageDraft(editingMessage.text);
      setComposerActive(true);
      messageInputRef.current?.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    if (!room?.roomId) return;
    updateRoomCatalogCache(room);
  }, [room, updateRoomCatalogCache]);

  useEffect(() => {
    if (!room?.visibility) return;
    setRoomVisibility(room.visibility === 'public' ? 'public' : 'private');
  }, [room?.visibility]);

  useEffect(() => {
    writeChatOpenState(chatOpen);
  }, [chatOpen]);

  useEffect(() => {
    if (!drawingOpen) return;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 1000;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    context.scale(dpr, dpr);

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size, size);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.miterLimit = 2;
    context.strokeStyle = drawingBrushColorRef.current;
    context.lineWidth = drawingBrushSizeRef.current;

    if (drawingDraftRef.current) {
      const image = new Image();
      image.onload = () => {
        // Draw at logical size 1000x1000, context will scale it correctly to pixel size
        context.drawImage(image, 0, 0, 1000, 1000);
      };
      image.src = drawingDraftRef.current;
      setDrawingSnapshots([]);
      setDrawingRedoStack([]);
    }

    let strokePoints = [];
    const drawLineSegment = (p0, p1) => {
      context.beginPath();
      context.moveTo(p0.x, p0.y);
      context.lineTo(p1.x, p1.y);
      context.stroke();
    };

    const drawCubicSegment = (p0, p1, p2, p3) => {
      const control1 = {
        x: p1.x + ((p2.x - p0.x) / 6),
        y: p1.y + ((p2.y - p0.y) / 6),
      };
      const control2 = {
        x: p2.x - ((p3.x - p1.x) / 6),
        y: p2.y - ((p3.y - p1.y) / 6),
      };

      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, p2.x, p2.y);
      context.stroke();
    };

    const drawTailSegment = (p0, p1, p2) => {
      context.beginPath();
      context.moveTo(p0.x, p0.y);
      context.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
      context.stroke();
    };

    const appendPoint = (point) => {
      const lastPoint = strokePoints[strokePoints.length - 1];
      if (!lastPoint) {
        strokePoints.push(point);
        return;
      }

      if (point.x === lastPoint.x && point.y === lastPoint.y) {
        return;
      }

      strokePoints.push(point);

      if (strokePoints.length === 2) {
        drawLineSegment(strokePoints[0], strokePoints[1]);
        return;
      }

      if (strokePoints.length === 3) {
        const [p0, p1, p2] = strokePoints;
        drawTailSegment(p0, p1, p2);
        return;
      }

      while (strokePoints.length >= 4) {
        const [p0, p1, p2, p3] = strokePoints;
        drawCubicSegment(p0, p1, p2, p3);
        strokePoints.shift();
      }
    };

    const getPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      const source = event.touches?.[0] || event;
      const scaleX = 1000 / rect.width;
      const scaleY = 1000 / rect.height;
      return {
        x: (source.clientX - rect.left) * scaleX,
        y: (source.clientY - rect.top) * scaleY,
      };
    };

    const start = (event) => {
      if (event.touches && event.touches.length > 1) return;
      if (event.pointerType === 'touch' && event.isPrimary === false) return;
      if (event.pointerType === 'touch' && !event.isPrimary) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      drawingActiveRef.current = true;
      const currentSnapshot = canvas.toDataURL('image/png');
      setDrawingSnapshots((current) => [...current.slice(-29), currentSnapshot]);
      setDrawingRedoStack([]);

      strokePoints = [getPoint(event)];
      const isEraser = drawingModeRef.current === 'eraser';
      context.strokeStyle = isEraser ? '#ffffff' : drawingBrushColorRef.current;
      context.lineWidth = drawingBrushSizeRef.current;
      context.beginPath();
      context.moveTo(strokePoints[0].x, strokePoints[0].y);
      if (canvas.setPointerCapture && event.pointerId !== undefined) {
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          // ignore pointer capture failures
        }
      }
    };

    const move = (event) => {
      if (!drawingActiveRef.current) return;
      if (event.touches && event.touches.length > 1) return;
      if (event.pointerType === 'touch' && event.isPrimary === false) return;
      
      event.preventDefault();
      event.stopPropagation();
      const samples = typeof event.getCoalescedEvents === 'function'
        ? event.getCoalescedEvents()
        : [event];
      for (const sample of samples) {
        appendPoint(getPoint(sample));
      }
    };

    const end = () => {
      if (!drawingActiveRef.current) return;
      drawingActiveRef.current = false;
      if (strokePoints.length === 1) {
        const [point] = strokePoints;
        context.beginPath();
        context.arc(point.x, point.y, Math.max(context.lineWidth / 2, 1), 0, Math.PI * 2);
        context.fillStyle = context.strokeStyle;
        context.fill();
      } else if (strokePoints.length === 2) {
        const [p0, p1] = strokePoints;
        drawLineSegment(p0, p1);
      } else if (strokePoints.length >= 3) {
        const tail = strokePoints.slice(-3);
        if (tail.length === 3) {
          const [p0, p1, p2] = tail;
          drawTailSegment(p0, p1, p2);
        }
      }
      strokePoints = [];
      context.closePath();
      setDrawingDraft(canvas.toDataURL('image/png'));
    };

    const supportsRawUpdate = typeof window !== 'undefined' && 'onpointerrawupdate' in window;
    const moveEventName = supportsRawUpdate ? 'pointerrawupdate' : 'pointermove';

    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener(moveEventName, move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);

    return () => {
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener(moveEventName, move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [drawingOpen, sendPulse]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList || !room?.roomId) return;

    const previous = threadScrollStateRef.current;
    const nextMessageCount = (room?.messages || []).length;
    const typingCount = (typingParticipants || []).length;
    
    const isRoomChange = previous.roomId && previous.roomId !== room.roomId;
    const hasNewMessage = previous.messageCount !== nextMessageCount;
    const hasTypingChange = previous.typingCount !== typingCount;

    if (isRoomChange || hasNewMessage || hasTypingChange) {
      const isNearBottom = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 120;
      if (isRoomChange || isNearBottom) {
        messageList.scrollTo({
          top: messageList.scrollHeight,
          behavior: isRoomChange ? 'auto' : 'smooth',
        });
      }
    }

    threadScrollStateRef.current = {
      roomId: room.roomId,
      messageCount: nextMessageCount,
      typingCount,
    };
  }, [room?.roomId, room?.messages?.length, typingParticipants?.length]);

  useEffect(() => {
    if (!room?.roomId || !activeParticipantId) return undefined;

    const hasDraft = !!messageDraft?.trim() || !!drawingDraft || typingFocused;
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
  }, [activeParticipantId, drawingOpen, drawingDraft, messageDraft, room?.roomId, typingFocused]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const lastRoomId = savedLastRoomId;
    const normalizedLastId = lastRoomId ? getNormalizedRoomId(lastRoomId) : null;

    if (!lastRoomId || (BANNED_ROOM_IDS || []).includes(normalizedLastId)) {
      if (normalizedLastId && (BANNED_ROOM_IDS || []).includes(normalizedLastId)) {
        persistLastRoomId('');
        forgetSavedRoom(normalizedLastId);
      }
      setHydrating(false);
      return undefined;
    }

    let cancelled = false;
    resolveRoomSession(lastRoomId)
      .then(({ room: nextRoom, participantId, reclaimCode, reclaimPin }) => {
        if (cancelled) return;
        setRoom(nextRoom);
        setRoomCode(nextRoom.roomId);
        setActiveParticipantId(participantId);
        if (reclaimCode) writeIdentityKey(nextRoom.roomId, reclaimCode);
        if (reclaimPin) writeRoomPin(nextRoom.roomId, reclaimPin);
        if (participantId) {
          setStoredParticipant(nextRoom.roomId, participantId);
        }
        setStatusMessage((copy.reconnectedRoomStatus || 'Reconnected to {roomId}.').replace('{roomId}', nextRoom.roomId));
        persistLastRoomId(nextRoom.roomId);
        rememberSavedRoom(nextRoom.roomId);
        updateRoomCatalogCache(nextRoom);

        // Note: We don't overwrite local profile from server record anymore to avoid "drifting"
        // back to defaults when a user intentionally changes character in the lobby.
        // Instead, the push-sync or the rejoin call handles server-side updates.

        // If we are auto-reconnecting on refresh, let's also ensure the chat is open if it doesn't conflict
        if (readChatOpenState()) {
          setChatOpen(true);
        }

        // Restore entry time if available
        const savedEntryTime = readEntryTime(nextRoom.roomId);
        if (savedEntryTime) {
          setEntryTime(savedEntryTime);
        } else {
          const now = Date.now();
          setEntryTime(now);
          writeEntryTime(nextRoom.roomId, now);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.status !== 404) {
          setErrorMessage(error.message);
        } else {
          handleMissingRoom(lastRoomId, `Room ${lastRoomId} is no longer active.`);
        }
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [handleMissingRoom, rememberSavedRoom, persistLastRoomId, resolveRoomSession, savedLastRoomId, updateRoomCatalogCache]); // Keep dependencies minimal to avoid loops

  useEffect(() => {
    if (!(savedRoomIds || []).length) return undefined;

    let cancelled = false;

    const syncSavedRooms = async () => {
      const filteredIds = (savedRoomIds || [])
        .filter((id) => !(BANNED_ROOM_IDS || []).includes(id))
        .filter((id) => !isRoomMarkedMissing(id));
      if (!filteredIds.length) return;

      const results = await Promise.all(
        filteredIds.map(async (savedRoomId) => {
          try {
            const { room: nextRoom } = await fetchChatRoom(savedRoomId);
            return { roomId: savedRoomId, room: nextRoom };
          } catch (error) {
            return { roomId: savedRoomId, error };
          }
        }),
      );

      if (cancelled) return;

      const nextCatalogRooms = [];
      const endedRooms = [];

      results.forEach(({ roomId: fId, room: fRoom, error: fError }) => {
        if (fRoom) {
          nextCatalogRooms.push(fRoom);
        } else if (fError?.status === 404) {
          // Auto-clean: if room is gone from Redis, stop tracking it
          retireRoomLocally(fId);
        }
      });

      if (nextCatalogRooms.length) {
        updateRoomCatalogCache(nextCatalogRooms);
      }

      if (!(endedRooms || []).length) return;

      if (room?.roomId && endedRooms.includes(room.roomId)) {
        setRoom(null);
        setActiveParticipantId('');
        setChatOpen(false);
        setStatusMessage(`Room ${room.roomId} has ended.`);
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
  }, [retireRoomLocally, room?.roomId, savedRoomIds, updateRoomCatalogCache]);

  useEffect(() => {
    let cancelled = false;

    const refreshPublicRooms = async () => {
      try {
        const rooms = await fetchPublicChatRooms();
        if (!cancelled) {
          setPublicRooms((rooms || []).filter((publicRoom) => !isRoomMarkedMissing(publicRoom.roomId)));
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
        // Trust-lock: Skip polling if we just made a local change
        const timeSinceLastAction = Date.now() - lastActionTimestampRef.current;
        if (timeSinceLastAction < 2500) return;

        const { room: nextRoom } = await fetchChatRoom(roomId);
        if (cancelled) return;
        setRoom((prev) => {
          if (!prev || !nextRoom || prev.roomId !== nextRoom.roomId) return nextRoom;
          // Use high-precision floor comparison to guard against stale polling
          const prevTime = new Date(prev.updatedAt || 0).getTime();
          const nextTime = new Date(nextRoom.updatedAt || 0).getTime();
          
          if (nextTime <= prevTime) {
            return prev;
          }
          return nextRoom;
        });
        if (!silent) {
          // Success status messages suppressed
        }
        setErrorMessage('');
      } catch (error) {
        if (cancelled) return;

        if (error.status === 404) {
          handleMissingRoom(roomId, `Room ${roomId} has ended.`);
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
  }, [handleMissingRoom, room?.roomId]);

  const updateProfileField = useCallback((key, value) => {
    setProfile((current) => {
      const next = typeof key === 'object' ? { ...current, ...key } : { ...current, [key]: value };
      writeProfile(next);
      syncData?.pushNow();
      
      // Proactively update active room with new profile settings if connected
      if (room?.roomId && activeParticipantId) {
        const patch = { participantId: activeParticipantId };
        if (typeof key === 'string') {
          if (key === 'characterName') patch.characterName = value;
          if (key === 'paletteIndex') patch.paletteIndex = value;
        } else {
          if (key.characterName) patch.characterName = key.characterName;
          if (key.paletteIndex !== undefined) patch.paletteIndex = key.paletteIndex;
        }

        if (patch.characterName || patch.paletteIndex !== undefined) {
          updateChatRoomSettings(room.roomId, patch).catch(e => console.error('Silent profile sync failed:', e));
        }
      }

      return next;
    });
  }, [syncData, room?.roomId, activeParticipantId]);

  const clearDrawingDraft = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    setDrawingDraft('');
    setDrawingSnapshots([]);
    setDrawingRedoStack([]);
  }, []);

  const restoreDrawingFromDataUrl = useCallback((dataUrl) => {
    setDrawingDraft(dataUrl || '');
    
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    if (!dataUrl) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 1000, 1000);
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 1000, 1000);
      context.drawImage(image, 0, 0, 1000, 1000);
    };
    image.src = dataUrl;
  }, []);

  const takeDrawingSnapshot = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const currentData = canvas.toDataURL('image/png');
    setDrawingSnapshots((current) => [...current.slice(-19), currentData]);
  }, []);

  const handleUndoDrawing = useCallback(() => {
    if (drawingSnapshots.length === 0) return;
    
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    
    const currentDraft = canvas.toDataURL('image/png');
    const previous = drawingSnapshots[drawingSnapshots.length - 1];
    
    setDrawingRedoStack((current) => [...current, currentDraft]);
    setDrawingSnapshots((current) => current.slice(0, -1));
    restoreDrawingFromDataUrl(previous);
  }, [drawingSnapshots, restoreDrawingFromDataUrl]);

  const handleRedoDrawing = useCallback(() => {
    if (drawingRedoStack.length === 0) return;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const currentDraft = canvas.toDataURL('image/png');
    const next = drawingRedoStack[drawingRedoStack.length - 1];

    setDrawingSnapshots((current) => [...current, currentDraft]);
    setDrawingRedoStack((current) => current.slice(0, -1));
    restoreDrawingFromDataUrl(next);
  }, [drawingRedoStack, restoreDrawingFromDataUrl]);
  const handleFillCanvas = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    
    // Snapshot for Undo
    const currentData = canvas.toDataURL('image/png');
    setDrawingSnapshots((current) => [...current.slice(-29), currentData]);
    setDrawingRedoStack([]);

    context.fillStyle = drawingBrushColorRef.current;
    context.fillRect(0, 0, 1000, 1000);
    setDrawingDraft(canvas.toDataURL('image/png'));
  }, []);
  const validateProfile = useCallback(() => {
    if (!profile.characterName) return 'Pick a portrait card first.';
    return '';
  }, [profile]);

  const handleNuke = useCallback(async () => {
    if (!window.confirm('NUKE ALL CHAT DATA? This cannot be undone.')) return;
    setBusyAction('nuke');
    try {
      const resp = await fetch('/api/chat/nuke', { method: 'POST' });
      const data = await resp.json();
      if (data.success) {
        setRoom(null);
        setMode('lobby');
        setSavedRoomIds([]);
        localStorage.removeItem('skip_chat_room_list_v1');
        localStorage.removeItem('skip_chat_memberships_v1');
        localStorage.removeItem('skip_chat_last_room_v1');
        setStatusMessage('System Nuked.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, []);

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
    
    // Check if we already have an entry time for this room (e.g. from a previous session today)
    // or if this is a fresh entry.
    const existingEntryTime = readEntryTime(nextRoom.roomId);
    if (existingEntryTime) {
      setEntryTime(existingEntryTime);
    } else {
      const now = Date.now();
      setEntryTime(now);
      writeEntryTime(nextRoom.roomId, now);
    }
    
    updateRoomCatalogCache(nextRoom);

    // Ensure our local profile state matches what we used to join/reclaim
    const me = (nextRoom.participants || []).find(p => p.id === participantId);
    if (me) {
      updateProfileField('characterName', me.characterName);
      if (typeof me.paletteIndex === 'number') updateProfileField('paletteIndex', me.paletteIndex);
    }

    triggerHaptic('success');
  }, [persistLastRoomId, rememberSavedRoom, updateProfileField, updateRoomCatalogCache]);

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
      handleRoomConnected(nextRoom, participantId, (copy.roomLiveStatus || 'Room {roomId} is live.').replace('{roomId}', nextRoom.roomId));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [copy.roomTitleRequired, handleRoomConnected, profile, roomTitle, roomVisibility, selectedPortrait.src, validateProfile]);

  const handleJoinRoom = useCallback(async () => {
    const trimmedCode = roomCode.trim();
    if (!trimmedCode) {
      setErrorMessage(copy.roomCodeRequired || 'Enter a room code.');
      return;
    }

    const validationError = validateProfile();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const normalizedRoomCode = getNormalizedRoomId(trimmedCode);
    if (normalizedRoomCode.length < 5) {
      setErrorMessage(copy.roomCodeInvalid || 'Enter a valid room code.');
      return;
    }

    setBusyAction('join');

    try {
      const { room: nextRoom, participantId: joinedId, reclaimCode, reclaimPin } = await resolveRoomSession(normalizedRoomCode);
      if (reclaimCode) {
        writeIdentityKey(nextRoom.roomId, reclaimCode);
      }
      if (reclaimPin) {
        writeRoomPin(nextRoom.roomId, reclaimPin);
      }
      handleRoomConnected(nextRoom, joinedId, (copy.joinedRoomStatus || 'Joined {roomId}.').replace('{roomId}', nextRoom.roomId));
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
        throw new Error(data.error || (copy.failedToRedeemKey || 'Failed to redeem key'));
      }

      const { room: nextRoom, creatorToken, reclaimedParticipantId, reclaimCode, reclaimPin } = await response.json();
      
      if (creatorToken) {
        setStoredCreatorToken(nextRoom.roomId, creatorToken);
      }
      if (reclaimPin) {
        writeRoomPin(nextRoom.roomId, reclaimPin);
      }
      if (reclaimCode) {
        writeIdentityKey(nextRoom.roomId, reclaimCode);
      }
      
      handleRoomConnected(nextRoom, reclaimedParticipantId || participantId, copy.identityReclaimed || 'Identity reclaimed successfully!');
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
      const { room: nextRoom } = await fetchChatRoom(room.roomId);
      setRoom(nextRoom);
      updateRoomCatalogCache(nextRoom);
      setStatusMessage((copy.roomRefreshedStatus || 'Room {roomId} refreshed.').replace('{roomId}', room.roomId));
      setErrorMessage('');
      } catch (error) {
        if (error.status === 404) {
          handleMissingRoom(room.roomId, (copy.roomInactiveStatus || 'Room {roomId} is no longer active.').replace('{roomId}', room.roomId));
        } else {
          setErrorMessage(error.message);
        }
      } finally {
        setBusyAction('');
      }
  }, [handleMissingRoom, room, updateRoomCatalogCache]);

  const handleSendMessage = useCallback(async () => {
    const trimmed = messageDraft.trim();
    const drawing = sanitizeDrawingDataUrl(drawingDraft);
    const currentId = activeParticipantId || getUniversalUserId();

    if (!room?.roomId || !currentId || (!trimmed && !drawing)) {
      return;
    }

    setBusyAction('message');
    setSendPulse((current) => current + 1);
    lastActionTimestampRef.current = Date.now();

    // Optimistic Update for "send message" (not edit)
    if (!editingMessage) {
      const optimisticId = `optimistic_${Date.now()}`;
      const optimisticMsg = {
        id: optimisticId,
        type: 'message',
        authorId: currentId,
        text: trimmed || '',
        drawing: drawing || undefined,
        repliedToId: replyToMessage?.id || null,
        createdAt: Date.now(),
        sending: true,
      };

      setRoom(prev => {
        if (!prev || prev.roomId !== room.roomId) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), optimisticMsg],
          // Buffer the updatedAt slightly to ensure the server response is ignored if stale
          updatedAt: new Date(Date.now() + 1000).toISOString() 
        };
      });
      setMessageDraft('');
      clearDrawingDraft();
      setDrawingOpen(false);
      setTypingFocused(false);
      setComposerActive(false);
      setReplyToMessage(null);
    } else {
      // Optimistic Update for Edit
      setRoom(prev => {
        if (!prev || prev.roomId !== room.roomId) return prev;
        const updatedMessages = [...(prev.messages || [])];
        const msgIndex = updatedMessages.findIndex(m => m.id === editingMessage.id);
        if (msgIndex === -1) return prev;

        updatedMessages[msgIndex] = {
          ...updatedMessages[msgIndex],
          text: trimmed || '',
          drawing: drawing || undefined,
          isEdited: true
        };
        return { 
          ...prev, 
          messages: updatedMessages, 
          updatedAt: new Date(Date.now() + 1000).toISOString() // Buffer against stale polling
        };
      });
    }
    
    try {
      const body = {
        participantId: currentId,
        text: trimmed || '',
        drawing: drawing || undefined,
        repliedToId: replyToMessage?.id,
        action: editingMessage ? 'edit' : 'message',
        messageId: editingMessage?.id,
        isEdited: !!editingMessage,
      };

      const nextRoom = await sendChatMessage(room.roomId, body);

      setChatTypingState(room.roomId, { participantId: activeParticipantId, isTyping: false }).catch(() => {});
      setRoom(nextRoom);
      
      if (editingMessage) {
        setMessageDraft('');
        clearDrawingDraft();
        setDrawingOpen(false);
        setTypingFocused(false);
        setComposerActive(false);
        setReplyToMessage(null);
        setEditingMessage(null);
      }
      
      setStatusMessage(editingMessage ? 'Message updated.' : 'Message delivered.');
      setErrorMessage('');
      triggerHaptic('selection');
    } catch (error) {
      if (error.status === 404) {
        handleMissingRoom(room.roomId, `Room ${room.roomId} is no longer active.`);
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, clearDrawingDraft, drawingDraft, editingMessage, handleMissingRoom, messageDraft, replyToMessage, room?.roomId, setDrawingOpen]);

  const scrollToMessageId = useCallback((messageId) => {
    if (!messageId) return;
    const element = document.getElementById(`chat-msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight flash
      element.style.transition = 'background-color 0.5s ease';
      const originalBg = element.style.backgroundColor;
      element.style.backgroundColor = 'rgba(255, 243, 205, 0.4)';
      setTimeout(() => {
        element.style.backgroundColor = originalBg;
      }, 1000);
    }
  }, []);

  const handleUpdateRoomVisibility = useCallback(async (visibility) => {
    if (!room?.roomId || !activeParticipantId || !isCreator) return;
    setBusyAction('settings');
    try {
      const nextRoom = await updateChatRoomSettings(room.roomId, { visibility, participantId: activeParticipantId });
      setRoom(nextRoom);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, isCreator, room?.roomId]);

  const handleUpdateRoomTitle = useCallback(async (title) => {
    if (!room?.roomId || !activeParticipantId || !isCreator) return;
    const trimmed = String(title || '').trim().slice(0, 80);
    if (!trimmed) return;
    
    setBusyAction('settings');
    try {
      const nextRoom = await updateChatRoomSettings(room.roomId, { title: trimmed, participantId: activeParticipantId });
      setRoom(nextRoom);
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
        paletteIndex: profile.paletteIndex,
      }, creatorToken);
      
      updateProfileField('characterName', nextCharacterName);
      setRoom(nextRoom);
      setStatusMessage(`Switched to ${nextCharacterName}.`);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, portraitByName, profile.paletteIndex, room?.roomId, updateProfileField]);

  const handleSwitchPalette = useCallback(async (nextPaletteIndex) => {
    if (!room?.roomId || !activeParticipantId) {
      updateProfileField('paletteIndex', nextPaletteIndex);
      return;
    }

    const currentPortrait = portraitByName[profile.characterName];
    const creatorToken = getStoredCreatorToken(room.roomId);

    setBusyAction('switch-palette');
    try {
      const { room: nextRoom } = await joinChatRoom(room.roomId, {
        participantId: activeParticipantId,
        characterName: profile.characterName,
        portraitSrc: currentPortrait?.src || '',
        paletteIndex: nextPaletteIndex,
      }, creatorToken);
      
      updateProfileField('paletteIndex', nextPaletteIndex);
      setRoom(nextRoom);
      setStatusMessage('Color palette updated.');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, portraitByName, profile.characterName, room?.roomId, updateProfileField]);

  const handleEndRoom = useCallback(async () => {
    if (!room?.roomId || !activeParticipantId) return;
    if (!window.confirm(`End room ${room.roomId}? This removes the live chat for everyone in it.`)) return;

    setBusyAction('end');
    try {
      await endChatRoom(room.roomId, { participantId: activeParticipantId });
      retireRoomLocally(room.roomId);
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
  }, [activeParticipantId, retireRoomLocally, room]);

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
    setChatOpen(false);
    setSettingsOpen(false);
    setTypingFocused(false);
    setActiveParticipantId(getStoredParticipant(room.roomId));
  }, [activeParticipantId, room]);

  const handleCopyRoomCode = useCallback(async () => {
    if (!room?.roomId) return;

    try {
      await navigator.clipboard.writeText(room.roomId);
      setStatusMessage((copy.copiedRoomCodeStatus || 'Copied {roomId}.').replace('{roomId}', room.roomId));
      setErrorMessage('');
    } catch {
      setErrorMessage(copy.roomCodeCopyError || 'Could not copy the room code from this browser.');
    }
  }, [room?.roomId]);

  const handleCopyRoomChat = useCallback(async () => {
    if (!room) return;

    const transcript = (room.messages || [])
      .map((message) => {
        if (message.type === 'system') {
          return `[${formatTime(message.createdAt)}] ${getSystemMessageText(message, room.participants || [])}`;
        }

        const author = (room.participants || []).find((participant) => participant.id === message.authorId);
        const authorName = message.authorId === activeParticipantId ? copy.you : (author?.characterName || 'Unknown');
        const content = [message.text, message.drawing ? `[${copy.drawingLabel}]` : ''].filter(Boolean).join(' ');
        return `[${formatTime(message.createdAt)}] ${authorName}: ${content}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(transcript);
      setStatusMessage((copy.copiedRoomChatStatus || 'Copied chat from {roomTitle}.').replace('{roomTitle}', room.title));
      setErrorMessage('');
    } catch {
      setErrorMessage(copy.roomChatCopyError || 'Could not copy the room chat from this browser.');
    }
  }, [activeParticipantId, copy.drawingLabel, copy.you, room]);

  const openSavedRoom = useCallback(async (nextRoomId) => {
    if (!nextRoomId) return;

    setBusyAction('switch');
    try {
      if (room?.roomId && activeParticipantId) {
        setChatTypingState(room.roomId, { participantId: activeParticipantId, isTyping: false }).catch(() => {});
      }
      const { room: nextRoom, participantId, reclaimCode, reclaimPin } = await resolveRoomSession(nextRoomId, { autoJoinPublic: true });
      if (reclaimCode) writeIdentityKey(nextRoom.roomId, reclaimCode);
      if (reclaimPin) writeRoomPin(nextRoom.roomId, reclaimPin);
      handleRoomConnected(nextRoom, participantId, `Opened ${nextRoom.title}.`);
    } catch (error) {
      if (error.status === 404) {
        handleMissingRoom(nextRoomId, `Room ${nextRoomId} is no longer active.`);
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setBusyAction('');
    }
  }, [activeParticipantId, handleMissingRoom, resolveRoomSession, room?.roomId]);

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

  const handleReact = useCallback(async (messageId, emoji) => {
    if (!room?.roomId || !activeParticipantId || !messageId || !emoji) return;
    
    lastActionTimestampRef.current = Date.now();

    // Optimistic Reaction Update
    setRoom((prev) => {
      if (!prev || prev.roomId !== room.roomId) return prev;
      const updatedMessages = [...(prev.messages || [])];
      const msgIndex = updatedMessages.findIndex((m) => m.id === messageId);
      if (msgIndex === -1) return prev;

      const message = { ...updatedMessages[msgIndex] };
      const reactions = { ...(message.reactions || {}) };
      const currentUsers = reactions[emoji] || [];

      if (currentUsers.includes(activeParticipantId)) {
        reactions[emoji] = currentUsers.filter((id) => id !== activeParticipantId);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...currentUsers, activeParticipantId];
      }

      updatedMessages[msgIndex] = { ...message, reactions };
      return { 
        ...prev, 
        messages: updatedMessages, 
        updatedAt: new Date(Date.now() + 1000).toISOString() // Buffer against stale polling
      };
    });

    try {
      const nextRoom = await sendChatMessage(room.roomId, {
        action: 'react',
        participantId: activeParticipantId,
        messageId,
        emoji
      });
      setRoom(nextRoom);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [activeParticipantId, room]);

  const handleReconnect = useCallback(async () => {
    const lastRoomId = readLastRoomId();
    if (!lastRoomId) return;

    setBusyAction('sync');
    try {
      const { room: nextRoom, participantId, reclaimCode } = await resolveRoomSession(lastRoomId);
      if (reclaimCode) writeIdentityKey(nextRoom.roomId, reclaimCode);
      handleRoomConnected(nextRoom, participantId, (copy.reconnectedRoomStatus || 'Reconnected to {roomId}.').replace('{roomId}', nextRoom.roomId));
    } catch (error) {
      if (error.status === 404) {
        handleMissingRoom(lastRoomId, (copy.roomInactiveStatus || 'Room {roomId} is no longer active.').replace('{roomId}', lastRoomId));
      } else {
        persistLastRoomId('');
        setErrorMessage(error.message);
      }
    } finally {
      setBusyAction('');
    }
  }, [copy.reconnectedRoomStatus, copy.roomInactiveStatus, handleMissingRoom, handleRoomConnected, persistLastRoomId, resolveRoomSession]);

  const onSelectReply = useCallback((message) => {
    setEditingMessage(null);
    setReplyToMessage(message);
    setComposerActive(true);
    messageInputRef.current?.focus();
  }, []);

  const onSelectEdit = useCallback((message) => {
    setReplyToMessage(null);
    setEditingMessage(message);
    setComposerActive(true);
    messageInputRef.current?.focus();
  }, []);

  return {
    state: {
      t, copy, initialProfile, initialLastRoomId, savedLastRoomId,
      replyToMessage, editingMessage, roomCatalog, savedRoomIds,
      publicRooms, mode, profile, roomVisibility, roomTitle, roomCode,
      messageDraft, room, activeParticipantId, statusMessage, pinInput,
      showPinEntry, errorMessage, busyAction, hydrating, drawingOpen,
      drawingDraft, drawingBrushSize, drawingBrushColor, drawingMode, drawingSnapshots, drawingRedoStack,
      composerActive, chatOpen, settingsOpen, roomSearch, sendPulse, typingFocused,
      selectedPortrait, participants, activeParticipant, savedRooms, visiblePublicRooms, roomDirectoryRooms,
      filteredSavedRooms, isCreator, activeParticipantPalette,
      typingParticipants, entryTime
    },
    actions: {
      setSavedLastRoomId, setReplyToMessage, setEditingMessage,
      setRoomCatalog, setSavedRoomIds, setPublicRooms, setMode, setProfile,
      setRoomVisibility, setRoomTitle, setRoomCode, setMessageDraft, setRoom,
      setActiveParticipantId, setStatusMessage, setPinInput, setErrorMessage, setBusyAction,
      setHydrating, setDrawingOpen, setDrawingDraft, setDrawingBrushSize, setDrawingBrushColor,
      setDrawingMode, setComposerActive, setChatOpen, setSettingsOpen, setRoomSearch,
      setSendPulse, setTypingFocused, handleStartRoomFlow, updateProfileField, 
      forgetSavedRoom, persistLastRoomId, rememberSavedRoom,  
      clearDrawingDraft, restoreDrawingFromDataUrl, handleUndoDrawing, handleRedoDrawing, handleFillCanvas, validateProfile,
      handleRoomConnected, handleCreateRoom, handleJoinRoom, handleRedeemPin, handleManualRefresh,
      handleSendMessage, handleUpdateRoomVisibility, handleUpdateRoomTitle, handleReact,
      handleSwitchCharacter, handleSwitchPalette, handleEndRoom, handleReclaimOwnership, handleLeaveView,
      handleCopyRoomCode, handleCopyRoomChat, openSavedRoom, handleReconnect, handleNuke,
      scrollToMessageId, onSelectReply, onSelectEdit,
      takeDrawingSnapshot,
    },
    refs: {
      messageListRef, messageInputRef, drawingCanvasRef, drawingActiveRef, drawingDraftRef,
      drawingBrushSizeRef, drawingBrushColorRef, drawingModeRef
    }
  };
}
