import { clearMissingRoomMark, getNormalizedRoomId, isRoomMarkedMissing, markRoomMissing } from './chatStorage';

async function parseResponse(response) {
  let payload = {};

  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const error = new Error(payload.error || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function postJson(url, body, creatorToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (creatorToken) headers['x-creator-token'] = creatorToken;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return parseResponse(response);
}

function requireRoom(payload) {
  if (!payload?.room || !payload.room.roomId) {
    throw new Error('Chat room response was invalid');
  }

  return payload.room;
}

export async function createChatRoom(body) {
  const payload = await postJson('/api/chat/rooms', body);
  clearMissingRoomMark(payload?.room?.roomId || body?.roomId);
  return {
    room: requireRoom(payload),
    creatorToken: String(payload?.creatorToken || ''),
    reclaimPin: String(payload?.reclaimPin || ''),
    reclaimCode: String(payload?.reclaimCode || ''),
  };
}

export async function fetchChatRoom(roomId, creatorToken) {
  const normalizedRoomId = getNormalizedRoomId(roomId);
  if (isRoomMarkedMissing(normalizedRoomId)) {
    const error = new Error('Room not found');
    error.status = 404;
    throw error;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (creatorToken) headers['x-creator-token'] = creatorToken;

  try {
    const response = await fetch(`/api/chat/rooms/${encodeURIComponent(roomId)}`, {
      method: 'GET',
      headers,
    });
    const payload = await parseResponse(response);
    clearMissingRoomMark(normalizedRoomId);
    return {
      room: requireRoom(payload),
      reclaimPin: payload.reclaimPin ? String(payload.reclaimPin) : undefined,
    };
  } catch (error) {
    if (error?.status === 404) {
      markRoomMissing(normalizedRoomId);
    }
    throw error;
  }
}

export async function fetchPublicChatRooms() {
  const response = await fetch('/api/chat/rooms?view=public', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const { rooms } = await parseResponse(response);
  return Array.isArray(rooms) ? rooms : [];
}

export async function joinChatRoom(roomId, body, creatorToken) {
  const payload = await postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'join' }, creatorToken);
  clearMissingRoomMark(roomId);
  return {
    room: requireRoom(payload),
    participantId: String(payload?.participantId || body?.participantId || ''),
    reclaimCode: String(payload?.reclaimCode || ''),
    reclaimPin: payload.reclaimPin ? String(payload.reclaimPin) : undefined,
  };
}

export async function sendChatMessage(roomId, body) {
  const { action = 'message', ...rest } = body;
  const payload = await postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...rest, action });
  clearMissingRoomMark(roomId);
  return requireRoom(payload);
}

export async function setChatTypingState(roomId, body) {
  const payload = await postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'typing' });
  clearMissingRoomMark(roomId);
  return requireRoom(payload);
}

export async function setChatReadState(roomId, body) {
  const payload = await postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'read' });
  clearMissingRoomMark(roomId);
  return requireRoom(payload);
}

export async function updateChatRoomSettings(roomId, body) {
  const payload = await postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'settings' });
  clearMissingRoomMark(roomId);
  return requireRoom(payload);
}

export async function endChatRoom(roomId, body) {
  return postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'end' });
}
