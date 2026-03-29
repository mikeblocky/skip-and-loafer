import {
  applyCors,
  clampText,
  connectRedis,
  createEntityId,
  createTimestamp,
  readRoom,
  removeRoomFromIndex,
  sendJson,
  updateRoom,
} from '../../../src/server/chatStore.js';

function sanitizeRoom(room) {
  if (!room) return room;
  // Note: We MUST NOT leak reclaimCode to other participants!
  const { creatorToken, reclaimPin, ...safeRoom } = room;
  return {
    ...safeRoom,
    participants: (room.participants || []).map((p) => {
      const { reclaimCode, ...other } = p;
      return other;
    }),
  };
}

function sanitizeDrawingDataUrl(value) {
  const normalized = String(value || '').trim();
  if (!normalized.startsWith('data:image/png;base64,')) return '';
  if (normalized.length > 250000) return '';
  return normalized;
}

export default async function handler(req, res) {
  applyCors(res, 'GET, POST, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const roomId = clampText(req.query?.roomId, 16).toUpperCase();
  if (!roomId) return sendJson(res, 400, { error: 'Missing room ID' });

  let client;
  try {
    client = await connectRedis();

    if (req.method === 'GET' || req.method === 'HEAD') {
      const room = await readRoom(client, roomId);
      if (!room) {
        return req.method === 'HEAD'
          ? res.status(404).end()
          : sendJson(res, 404, { error: 'Room not found' });
      }
      if (req.method === 'HEAD') return res.status(200).end();
      return sendJson(res, 200, { room: sanitizeRoom(room) });
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const action = clampText(req.body?.action, 20).toLowerCase();

    if (action === 'join') {
      const participantId = clampText(req.body?.participantId, 80);
      const characterName = clampText(req.body?.characterName, 40);
      const portraitSrc = clampText(req.body?.portraitSrc, 200);

      if (!participantId || !characterName || !portraitSrc) {
        return sendJson(res, 400, { error: 'Missing join fields' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        const existingParticipantIndex = currentRoom.participants.findIndex((p) => p.id === participantId);
        const timestamp = Date.now();

        if (existingParticipantIndex !== -1) {
          const updatedParticipants = [...currentRoom.participants];
          updatedParticipants[existingParticipantIndex] = {
            ...updatedParticipants[existingParticipantIndex],
            displayName: characterName,
            characterName,
            portraitSrc,
            updatedAt: timestamp,
          };
          return { ...currentRoom, participants: updatedParticipants, updatedAt: timestamp };
        }

        const reclaimCode = Math.random().toString(36).slice(2, 8).toUpperCase();
        const newParticipant = {
          id: participantId,
          displayName: characterName,
          characterName,
          portraitSrc,
          reclaimCode,
          joinedAt: timestamp,
          updatedAt: timestamp,
        };

        return {
          ...currentRoom,
          participants: [...currentRoom.participants, newParticipant],
          updatedAt: timestamp,
        };
      });

      const participant = room.participants.find((p) => p.id === participantId);
      return sendJson(res, 200, {
        room: sanitizeRoom(room),
        participantId,
        reclaimCode: participant?.reclaimCode,
      });
    }

    if (action === 'reclaim') {
      const { reclaimCode: providedCode, participantId: newParticipantId } = req.body || {};
      if (!providedCode || !newParticipantId) {
        return sendJson(res, 400, { error: 'Missing reclaim code or participant ID' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        const cleanedCode = String(providedCode).trim().toUpperCase();

        // Check 1: Master Pin (Ownership Transfer)
        const isMasterPinMatch = String(currentRoom.reclaimPin) === cleanedCode;

        // Check 2: Participant Identity Keys
        const targetParticipant = currentRoom.participants.find((p) => p.reclaimCode === cleanedCode);

        if (!isMasterPinMatch && !targetParticipant) {
          const error = new Error('Invalid reclaim code');
          error.statusCode = 401;
          throw error;
        }

        const timestamp = Date.now();
        const oldParticipantId = isMasterPinMatch ? currentRoom.creatorId : targetParticipant.id;

        // Swap the participant ID in the list
        const updatedParticipants = currentRoom.participants.map((p) => {
          if (p.id === oldParticipantId) {
            return { ...p, id: newParticipantId, updatedAt: timestamp };
          }
          // Ensure only one creator exists (the reclaimer) if it was a Master PIN match
          if (isMasterPinMatch) {
            return { ...p, isCreator: p.id === oldParticipantId, updatedAt: timestamp };
          }
          return p;
        });

        return {
          ...currentRoom,
          creatorId: isMasterPinMatch ? newParticipantId : currentRoom.creatorId,
          participants: updatedParticipants,
          updatedAt: timestamp,
        };
      });

      // Response with the actual creatorToken so the client can store it if they are now the owner
      return sendJson(res, 200, { room: sanitizeRoom(room), creatorToken: room.creatorToken, reclaimedParticipantId: newParticipantId });
    }

    if (action === 'message') {
      const participantId = clampText(req.body?.participantId, 80);
      const text = clampText(req.body?.text, 500);
      const drawing = sanitizeDrawingDataUrl(req.body?.drawing);

      if (!participantId || (!text && !drawing)) {
        return sendJson(res, 400, { error: 'Missing message fields' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        const author = currentRoom.participants.find((participant) => participant.id === participantId);
        if (!author) {
          const error = new Error('You must join the room before sending messages');
          error.statusCode = 403;
          throw error;
        }

        const timestamp = createTimestamp();
        return {
          ...currentRoom,
          updatedAt: timestamp,
          typingParticipants: {
            ...(currentRoom.typingParticipants || {}),
            [participantId]: false,
          },
          messages: [
            ...currentRoom.messages,
            {
              id: createEntityId('message'),
              type: 'message',
              authorId: participantId,
              text,
              drawing,
              createdAt: timestamp,
            },
          ],
        };
      });

      return sendJson(res, 200, { room: sanitizeRoom(room) });
    }

    if (action === 'typing') {
      const participantId = clampText(req.body?.participantId, 80);
      const isTyping = !!req.body?.isTyping;

      if (!participantId) {
        return sendJson(res, 400, { error: 'Missing typing fields' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        const author = currentRoom.participants.find((participant) => participant.id === participantId);
        if (!author) {
          const error = new Error('You must join the room before updating typing state');
          error.statusCode = 403;
          throw error;
        }

        return {
          ...currentRoom,
          updatedAt: createTimestamp(),
          typingParticipants: {
            ...(currentRoom.typingParticipants || {}),
            [participantId]: isTyping,
          },
        };
      });

      return sendJson(res, 200, { room: sanitizeRoom(room) });
    }

    if (action === 'settings') {
      const participantId = clampText(req.body?.participantId, 80);
      const nextVisibility = clampText(req.body?.visibility, 16) === 'public' ? 'public' : 'private';

      if (!participantId) {
        return sendJson(res, 400, { error: 'Missing room settings fields' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        if (currentRoom.creatorId !== participantId) {
          const error = new Error('Only the creator can change room settings');
          error.statusCode = 403;
          throw error;
        }

        return {
          ...currentRoom,
          visibility: nextVisibility,
          updatedAt: createTimestamp(),
        };
      });

      return sendJson(res, 200, { room: sanitizeRoom(room) });
    }

    if (action === 'end') {
      const participantId = clampText(req.body?.participantId, 80);

      if (!participantId) {
        return sendJson(res, 400, { error: 'Missing end-session fields' });
      }

      await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        if (currentRoom.creatorId !== participantId) {
          const error = new Error('Only the room creator can end this session');
          error.statusCode = 403;
          throw error;
        }

        return null;
      }, { deleteOnNull: true });
      await removeRoomFromIndex(client, roomId);

      return sendJson(res, 200, { ended: true });
    }

    return sendJson(res, 400, { error: 'Unsupported room action' });
  } catch (err) {
    console.error('chat/rooms/[roomId] error:', err);
    return sendJson(res, err.statusCode || 500, { error: err.message || 'Internal server error' });
  } finally {
    if (client) await client.disconnect().catch(() => {});
  }
}
