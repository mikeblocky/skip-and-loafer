function getLatestChatMessage(messages = []) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.type === 'message') {
      return message;
    }
  }

  return null;
}

export function getRoomPreviewText(room, copy) {
  if (!room) return '';
  const latestMessage = getLatestChatMessage(room.messages || []);
  if (!latestMessage) return copy.noMessages;
  if (latestMessage.text) return latestMessage.text;
  if (latestMessage.drawing) return `${copy.drawingLabel} sent`;
  return copy.noMessages;
}

export function getRoomLastMessageTime(room) {
  if (!room) return 0;
  const latestMessage = getLatestChatMessage(room.messages || []);
  return latestMessage ? latestMessage.createdAt : room.updatedAt;
}

export function getSystemMessageText(message, participants = []) {
  if (!message || message.type !== 'system') return '';

  const systemKey = message.systemKey || message.systemType || message.event;
  const actorId = message.actorId || message.participantId || message.userId;
  const actor = actorId ? (participants || []).find((participant) => participant.id === actorId) : null;
  const actorName = actor?.characterName || message.actorName || message.characterName || '';

  if (systemKey === 'room_opened' || systemKey === 'opened') {
    return actorName ? `${actorName} opened the room.` : (message.text || '');
  }

  if (systemKey === 'room_joined' || systemKey === 'joined') {
    return actorName ? `${actorName} joined the room.` : (message.text || '');
  }

  return message.text || '';
}

export function getRoomDisplayName(room, copy) {
  if (!room) return '';
  // If the room title exists and isn't just a generic code (basic alphanumeric uppercase check)
  if (room.title && !/^[A-Z0-9]{8}$/.test(room.title)) return room.title;
  
  // If it's a code, try to find a meaningful participant name
  const otherParticipants = (room.participants || []).filter(p => !p.isMe);
  if (otherParticipants.length > 0) {
    if (otherParticipants.length === 1) return `Chat with ${otherParticipants[0].characterName}`;
    return `Chat with ${otherParticipants[0].characterName} +${otherParticipants.length - 1}`;
  }
  
  return room.title || copy.room;
}

export function mergeRoomDirectoryRooms(savedRooms = [], publicRooms = []) {
  const seenRoomIds = new Set();
  const mergedRooms = [];

  for (const room of [...savedRooms, ...publicRooms]) {
    const roomId = room?.roomId;
    if (!roomId || seenRoomIds.has(roomId)) continue;
    seenRoomIds.add(roomId);
    mergedRooms.push(room);
  }

  return mergedRooms;
}

export function createRoomCatalogEntry(room) {
  if (!room?.roomId) return null;

  const latestMessage = getLatestChatMessage(room.messages || []);

  return {
    roomId: room.roomId,
    title: room.title || room.roomId,
    visibility: room.visibility || 'private',
    updatedAt: room.updatedAt || latestMessage?.createdAt || 0,
    creatorId: room.creatorId || '',
    participants: Array.isArray(room.participants)
      ? room.participants.map((participant) => ({
          id: participant.id,
          characterName: participant.characterName,
          portraitSrc: participant.portraitSrc,
          paletteIndex: participant.paletteIndex,
          isCreator: !!participant.isCreator,
        }))
      : [],
    messages: latestMessage ? [latestMessage] : [],
  };
}

export function areRoomCatalogEntriesEqual(previousEntry, nextEntry) {
  if (previousEntry === nextEntry) return true;
  if (!previousEntry || !nextEntry) return false;
  if (
    previousEntry.roomId !== nextEntry.roomId
    || previousEntry.title !== nextEntry.title
    || previousEntry.visibility !== nextEntry.visibility
    || previousEntry.updatedAt !== nextEntry.updatedAt
    || previousEntry.creatorId !== nextEntry.creatorId
  ) {
    return false;
  }

  const previousParticipants = previousEntry.participants || [];
  const nextParticipants = nextEntry.participants || [];
  if (previousParticipants.length !== nextParticipants.length) {
    return false;
  }

  for (let index = 0; index < previousParticipants.length; index += 1) {
    const previousParticipant = previousParticipants[index];
    const nextParticipant = nextParticipants[index];
    if (
      previousParticipant?.id !== nextParticipant?.id
      || previousParticipant?.characterName !== nextParticipant?.characterName
      || previousParticipant?.portraitSrc !== nextParticipant?.portraitSrc
      || previousParticipant?.paletteIndex !== nextParticipant?.paletteIndex
      || previousParticipant?.isCreator !== nextParticipant?.isCreator
    ) {
      return false;
    }
  }

  const previousMessage = previousEntry.messages?.[0];
  const nextMessage = nextEntry.messages?.[0];
  return (
    previousMessage?.id === nextMessage?.id
    && previousMessage?.type === nextMessage?.type
    && previousMessage?.authorId === nextMessage?.authorId
    && previousMessage?.text === nextMessage?.text
    && previousMessage?.drawing === nextMessage?.drawing
    && previousMessage?.createdAt === nextMessage?.createdAt
  );
}
