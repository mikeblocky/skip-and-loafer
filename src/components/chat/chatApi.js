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

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  return {
    room: requireRoom(payload),
    creatorToken: String(payload?.creatorToken || ''),
    reclaimPin: String(payload?.reclaimPin || ''),
    reclaimCode: String(payload?.reclaimCode || ''),
  };
}

export async function fetchChatRoom(roomId) {
  const response = await fetch(`/api/chat/rooms/${encodeURIComponent(roomId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return requireRoom(await parseResponse(response));
}

export async function fetchPublicChatRooms() {
  const response = await fetch('/api/chat/rooms?view=public', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const { rooms } = await parseResponse(response);
  return Array.isArray(rooms) ? rooms : [];
}

export async function joinChatRoom(roomId, body) {
  const payload = await postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'join' });
  return {
    room: requireRoom(payload),
    participantId: String(payload?.participantId || body?.participantId || ''),
    reclaimCode: String(payload?.reclaimCode || ''),
  };
}

export async function sendChatMessage(roomId, body) {
  return requireRoom(await postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'message' }));
}

export async function setChatTypingState(roomId, body) {
  return requireRoom(await postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'typing' }));
}

export async function updateChatRoomSettings(roomId, body) {
  return requireRoom(await postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'settings' }));
}

export async function endChatRoom(roomId, body) {
  return postJson(`/api/chat/rooms/${encodeURIComponent(roomId)}`, { ...body, action: 'end' });
}
