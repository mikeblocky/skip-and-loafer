import {
  applyCors,
  clampText,
  connectRedis,
  createEntityId,
  createTimestamp,
  createUniqueRoomId,
  decorateRoomMessages,
  listPublicRooms,
  sendJson,
  writeRoom,
} from '../../src/server/chatStore.js';

function sanitizeRoom(room) {
  if (!room) return room;
  const { creatorToken, ...safeRoom } = decorateRoomMessages(room);
  return safeRoom;
}

export default async function handler(req, res) {
  applyCors(res, 'GET, POST, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let client;
  try {
    client = await connectRedis();

    if (req.method === 'GET' || req.method === 'HEAD') {
      if ((req.query?.view || '') !== 'public') {
        return req.method === 'HEAD'
          ? res.status(405).end()
          : sendJson(res, 405, { error: 'Method not allowed' });
      }

      if (req.method === 'HEAD') return res.status(200).end();
      const rooms = await listPublicRooms(client, 40);
      return sendJson(res, 200, { rooms });
    }

    if (req.method === 'POST') {
      const {
        participantId,
        displayName,
        characterName,
        portraitSrc,
        intro,
        roomTitle,
        visibility,
      } = req.body || {};

      const creatorId = clampText(participantId, 80);
      const selectedCharacter = clampText(characterName, 40);
      const creatorName = clampText(displayName, 40) || selectedCharacter;
      const selectedPortrait = clampText(portraitSrc, 200);
      const openingIntro = clampText(intro, 280);
      const title = clampText(roomTitle, 80);
      const roomVisibility = clampText(visibility, 16) === 'public' ? 'public' : 'private';

      if (!creatorId || !selectedCharacter || !selectedPortrait) {
        return sendJson(res, 400, { error: 'Missing required room setup fields' });
      }

      if (!title) {
        return sendJson(res, 400, { error: 'Room title is required' });
      }

      const roomId = await createUniqueRoomId(client);
      const timestamp = createTimestamp();
      const creatorToken = createEntityId('creator');
      const reclaimPin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit Owner PIN
      const creatorReclaimCode = Math.random().toString(36).slice(2, 8).toUpperCase(); // 6-char Guest Key

      const creator = {
        id: creatorId,
        displayName: creatorName,
        characterName: selectedCharacter,
        portraitSrc: selectedPortrait,
        intro: openingIntro,
        isCreator: true,
        reclaimCode: creatorReclaimCode,
        joinedAt: timestamp,
      };

      const room = {
        roomId,
        title,
        visibility: roomVisibility,
        creatorId,
        creatorToken,
        reclaimPin,
        createdAt: timestamp,
        updatedAt: timestamp,
        participants: [creator],
        typingParticipants: {},
        messages: [
          {
            id: createEntityId('system'),
            type: 'system',
            systemKey: 'room_opened',
            actorId: creatorId,
            actorName: selectedCharacter,
            text: `${selectedCharacter} opened the room.`,
            createdAt: timestamp,
          },
        ],
      };

      await writeRoom(client, room);
      // Return the Pin ONLY during initial creation
      return sendJson(res, 200, { 
        room: sanitizeRoom(room), 
        creatorToken, 
        reclaimPin, 
        reclaimCode: creatorReclaimCode 
      });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('chat/rooms error:', err);
    return sendJson(res, 500, { error: err.message || 'Internal server error' });
  } finally {
    if (client) await client.disconnect().catch(() => {});
  }
}
