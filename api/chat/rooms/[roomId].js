import {
  applyCors,
  clampText,
  connectRedis,
  createEntityId,
  createTimestamp,
  decorateRoomMessages,
  readRoom,
  removeRoomFromIndex,
  sendJson,
  updateRoom,
} from '../../../src/server/chatStore.js';
import { MAX_DRAWING_DATA_URL_LENGTH } from '../../../src/features/chat/chatConstants.js';

function sanitizeRoom(room) {
  if (!room) return room;
  // Note: We MUST NOT leak reclaimCode to other participants!
  const { creatorToken, reclaimPin, ...safeRoom } = decorateRoomMessages(room);
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
  if (normalized.length > MAX_DRAWING_DATA_URL_LENGTH) return '';
  return normalized;
}

export default async function handler(req, res) {
  applyCors(res, 'GET, POST, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const roomId = clampText(req.query?.roomId, 16).toUpperCase();
  if (!roomId) return sendJson(res, 400, { error: 'Missing room ID' });

  const headerCreatorToken = req.headers['x-creator-token'];

  let client;
  try {
    client = await connectRedis();

      if (req.method === 'GET' || req.method === 'HEAD') {
        const room = await readRoom(client, roomId);
        if (!room) {
          console.error(`[CHAT] Room not found in Redis: ${roomId}`);
          return req.method === 'HEAD'
            ? res.status(404).end()
            : sendJson(res, 404, { 
                error: 'Room not found', 
                debugId: roomId,
                serverTime: new Date().toISOString()
              });
        }
        if (req.method === 'HEAD') return res.status(200).end();

        const isOwner = headerCreatorToken && headerCreatorToken === room.creatorToken;
        const payload = { room: sanitizeRoom(room) };
        if (isOwner) {
          payload.reclaimPin = room.reclaimPin;
        }

        return sendJson(res, 200, payload);
      }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const action = clampText(req.body?.action, 20).toLowerCase();

    if (action === 'join') {
      const { characterName, portraitSrc, paletteIndex, participantId } = req.body || {};
      if (!roomId || !participantId || !characterName) {
        return sendJson(res, 400, { error: 'Missing roomId, participantId or characterName' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        const timestamp = Date.now();
        const existingIndex = currentRoom.participants.findIndex((p) => p.id === participantId);

        if (existingIndex >= 0) {
          const updatedParticipants = [...currentRoom.participants];
          updatedParticipants[existingIndex] = {
            ...updatedParticipants[existingIndex],
            characterName,
            portraitSrc,
            paletteIndex,
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
          paletteIndex,
          reclaimCode,
          joinedAt: timestamp,
          updatedAt: timestamp,
        };

        return {
          ...currentRoom,
          participants: [...currentRoom.participants, newParticipant],
          messages: [
            ...(currentRoom.messages || []),
            {
              id: createEntityId('system'),
              type: 'system',
              systemKey: 'room_joined',
              actorId: participantId,
              actorName: characterName,
              text: `${characterName} joined the room.`,
              createdAt: timestamp,
            },
          ],
          updatedAt: timestamp,
        };
      });

      const participant = room.participants.find((p) => p.id === participantId);
      const isOwner = headerCreatorToken && headerCreatorToken === room.creatorToken;
      return sendJson(res, 200, {
        room: sanitizeRoom(room),
        participantId,
        reclaimCode: participant?.reclaimCode,
        reclaimPin: isOwner ? room.reclaimPin : undefined,
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

      const cleanedCode = String(providedCode).trim().toUpperCase();
      const isMasterPinMatch = String(room.reclaimPin || '') === cleanedCode;
      
      const targetParticipant = room.participants.find((p) => {
        if (isMasterPinMatch) return p.id === newParticipantId;
        return p.reclaimCode === cleanedCode;
      });

      return sendJson(res, 200, {
        room: sanitizeRoom(room),
        creatorToken: room.creatorToken,
        reclaimPin: room.reclaimPin,
        reclaimedParticipantId: newParticipantId,
        reclaimCode: targetParticipant?.reclaimCode,
      });
    }

    if (action === 'message') {
      const participantId = clampText(req.body?.participantId, 80);
      const text = clampText(req.body?.text, 500);
      const drawing = sanitizeDrawingDataUrl(req.body?.drawing);
      const repliedToId = clampText(req.body?.repliedToId || req.body?.replyToId, 80);

      if (!participantId || (!text && !drawing)) {
        return sendJson(res, 400, { error: 'Missing message fields' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        const author = currentRoom.participants.find((p) => p.id === participantId);
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
              repliedToId: repliedToId || null,
              createdAt: timestamp,
            },
          ],
        };
      });

      return sendJson(res, 200, { room: sanitizeRoom(room) });
    }

    if (action === 'edit') {
      const participantId = clampText(req.body?.participantId, 80);
      const messageId = clampText(req.body?.messageId, 40);
      const text = clampText(req.body?.text, 500);
      const drawing = sanitizeDrawingDataUrl(req.body?.drawing);

      if (!participantId || !messageId || (!text && !drawing)) {
        return sendJson(res, 400, { error: 'Missing edit fields' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        const messageIndex = (currentRoom.messages || []).findIndex((m) => m.id === messageId);
        if (messageIndex === -1) {
          const error = new Error('Message not found');
          error.statusCode = 404;
          throw error;
        }

        const message = currentRoom.messages[messageIndex];
        if (message.authorId !== participantId) {
          const error = new Error('Only the author can edit this message');
          error.statusCode = 403;
          throw error;
        }

        const now = createTimestamp();
        const updatedMessages = [...currentRoom.messages];
        updatedMessages[messageIndex] = {
          ...message,
          text: text !== undefined ? text : message.text,
          drawing: drawing !== undefined ? drawing : message.drawing,
          isEdited: true,
          updatedAt: now,
        };

        return {
          ...currentRoom,
          messages: updatedMessages,
          updatedAt: now,
        };
      });

      return sendJson(res, 200, { room: sanitizeRoom(room) });
    }

    if (action === 'react') {
      const participantId = clampText(req.body?.participantId, 80);
      const messageId = clampText(req.body?.messageId, 40);
      const emoji = clampText(req.body?.emoji, 16);

      console.debug(`[CHAT] Reaction requested: room=${roomId}, user=${participantId}, msg=${messageId}, emoji=${emoji}`);

      if (!participantId || !messageId || !emoji) {
        return sendJson(res, 400, { error: 'Missing reaction fields' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        const messageIndex = (currentRoom.messages || []).findIndex((m) => m.id === messageId);
        if (messageIndex === -1) {
          const error = new Error('Message not found');
          error.statusCode = 404;
          throw error;
        }

        const timestamp = createTimestamp();
        const updatedMessages = [...currentRoom.messages];
        const message = updatedMessages[messageIndex];
        const reactions = message.reactions || {};
        const currentReactionsForEmoji = reactions[emoji] || [];

        // If user already reacted with THIS emoji, remove it (toggle off)
        // BUT the user said "Add emoji reactions", usually toggle is good.
        // Let's implement toggle.
        let nextReactionsForEmoji;
        if (currentReactionsForEmoji.includes(participantId)) {
          nextReactionsForEmoji = currentReactionsForEmoji.filter((id) => id !== participantId);
        } else {
          nextReactionsForEmoji = [...currentReactionsForEmoji, participantId];
        }

        const nextReactions = { ...reactions };
        if (nextReactionsForEmoji.length === 0) {
          delete nextReactions[emoji];
        } else {
          nextReactions[emoji] = nextReactionsForEmoji;
        }

        updatedMessages[messageIndex] = {
          ...message,
          reactions: nextReactions,
          updatedAt: timestamp,
        };

        return {
          ...currentRoom,
          messages: updatedMessages,
          updatedAt: timestamp,
        };
      });

      return sendJson(res, 200, { room: sanitizeRoom(room) });
    }

    if (action === 'read') {
      const participantId = clampText(req.body?.participantId, 80);
      const lastReadMessageId = clampText(req.body?.lastReadMessageId, 40);

      if (!participantId || !lastReadMessageId) {
        return sendJson(res, 400, { error: 'Missing read status fields' });
      }

      const room = await updateRoom(client, roomId, (currentRoom) => {
        if (!currentRoom) {
          const error = new Error('Room not found');
          error.statusCode = 404;
          throw error;
        }

        const lastReadMap = currentRoom.lastReadMap || {};
        if (lastReadMap[participantId] === lastReadMessageId) return currentRoom;

        const timestamp = createTimestamp();
        return {
          ...currentRoom,
          lastReadMap: {
            ...lastReadMap,
            [participantId]: lastReadMessageId,
          },
          updatedAt: timestamp,
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
      const nextVisibility = req.body?.visibility === 'public' ? 'public' : 'private';
      const nextTitle = clampText(req.body?.title, 80);

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
          visibility: nextVisibility || currentRoom.visibility,
          title: nextTitle || currentRoom.title,
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
