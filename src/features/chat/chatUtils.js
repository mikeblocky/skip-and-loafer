export function getRoomPreviewText(room, copy) {
  if (!room) return '';
  const latestMessage = [...(room.messages || [])].reverse().find((message) => message.type === 'message');
  if (!latestMessage) return copy.noMessages;
  if (latestMessage.text) return latestMessage.text;
  if (latestMessage.drawing) return `${copy.drawingLabel} sent`;
  return copy.noMessages;
}

export function getRoomLastMessageTime(room) {
  if (!room) return 0;
  const latestMessage = [...(room.messages || [])].reverse().find((message) => message.type === 'message');
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
