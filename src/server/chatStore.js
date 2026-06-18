/* global process */
import { PostgresKeyValueClient } from './postgres.js';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_PREFIX = 'chat:room:';
const ROOM_INDEX_KEY = 'chat:rooms:index';
const MAX_UPDATE_ATTEMPTS = 8;
const BANNED_ROOM_IDS = ['EFYXT4CX'];

class MemoryClient {
  constructor() {
    this.storage = new Map();
  }

  async connect() { return this; }
  async get(key) { return this.storage.get(key) || null; }
  async set(key, value) { this.storage.set(key, value); return 'OK'; }
  async del(key) { this.storage.delete(key); return 1; }
  async exists(key) { return this.storage.has(key) ? 1 : 0; }
  async watch() { return 'OK'; }
  async unwatch() { return 'OK'; }
  async disconnect() { return this; }
  multi() {
    const queue = [];
    return {
      set: (key, value) => { queue.push(() => this.set(key, value)); return this; },
      del: (key) => { queue.push(() => this.del(key)); return this; },
      exec: async () => {
        for (const op of queue) await op();
        return ['OK'];
      }
    };
  }
  on() { return this; }
}

const memoryClient = new MemoryClient();

export function createRedisClient() {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const isDev = process.env.NODE_ENV === 'development' || !databaseUrl;
  
  if (isDev) {
    if (!databaseUrl) {
      console.log('--- Chat Store: Using Local Memory Mode (Dev) ---');
    }
    return memoryClient;
  }

  return new PostgresKeyValueClient();
}

export function roomKey(roomId) {
  const normalizedId = String(roomId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${ROOM_PREFIX}${normalizedId}`;
}

export function generateRoomId() {
  let key = '';
  while (true) {
    key = '';
    for (let i = 0; i < 8; i += 1) {
      key += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }
    if (!BANNED_ROOM_IDS.includes(key)) return key;
  }
}

export function createTimestamp() {
  return new Date().toISOString();
}

export function createEntityId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getParticipantCharacterName(room, participantId) {
  const participant = (room?.participants || []).find((p) => p.id === participantId);
  return participant?.characterName || '';
}

function decorateSystemMessage(room, message, index) {
  if (!message || message.type !== 'system') return message;

  const nextMessage = { ...message };
  const existingKey = nextMessage.systemKey || nextMessage.systemType || nextMessage.event;
  const text = String(nextMessage.text || '');

  if (existingKey === 'room_opened' || (index === 0 && /opened the room\.$/i.test(text))) {
    nextMessage.systemKey = 'room_opened';
    nextMessage.actorId = nextMessage.actorId || room?.creatorId || null;
    if (!nextMessage.actorName) {
      nextMessage.actorName = getParticipantCharacterName(room, nextMessage.actorId) || text.replace(/ opened the room\.$/i, '');
    }
    return nextMessage;
  }

  if (existingKey === 'room_joined' || /joined the room\.$/i.test(text)) {
    nextMessage.systemKey = 'room_joined';
    if (!nextMessage.actorId) {
      const matchedParticipant = (room?.participants || []).find((participant) =>
        String(participant.joinedAt || '') === String(nextMessage.createdAt || '') ||
        String(participant.updatedAt || '') === String(nextMessage.createdAt || '')
      );
      if (matchedParticipant) {
        nextMessage.actorId = matchedParticipant.id;
      }
    }
    if (!nextMessage.actorName) {
      nextMessage.actorName = getParticipantCharacterName(room, nextMessage.actorId) || text.replace(/ joined the room\.$/i, '');
    }
    return nextMessage;
  }

  return message;
}

export function decorateRoomMessages(room) {
  if (!room || !Array.isArray(room.messages)) return room;

  return {
    ...room,
    messages: room.messages.map((message, index) => decorateSystemMessage(room, message, index)),
  };
}

export async function connectRedis() {
  const client = createRedisClient();
  await client.connect();
  return client;
}

export async function readRoom(client, roomId) {
  if (BANNED_ROOM_IDS.includes(String(roomId || '').toUpperCase())) return null;
  const raw = await client.get(roomKey(roomId));
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function readRoomIndex(client) {
  const raw = await client.get(ROOM_INDEX_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  const ids = Array.isArray(parsed) ? parsed : [];
  return ids.filter((id) => !BANNED_ROOM_IDS.includes(id));
}

export async function writeRoomIndex(client, roomIds) {
  await client.set(ROOM_INDEX_KEY, JSON.stringify(roomIds));
  return roomIds;
}

export async function addRoomToIndex(client, roomId) {
  const currentIds = await readRoomIndex(client);
  if (currentIds.includes(roomId)) return currentIds;
  const nextIds = [roomId, ...currentIds];
  await writeRoomIndex(client, nextIds);
  return nextIds;
}

export async function removeRoomFromIndex(client, roomId) {
  const currentIds = await readRoomIndex(client);
  if (!currentIds.includes(roomId)) return currentIds;
  const nextIds = currentIds.filter((currentRoomId) => currentRoomId !== roomId);
  await writeRoomIndex(client, nextIds);
  return nextIds;
}

export async function writeRoom(client, room) {
  await client.set(roomKey(room.roomId), JSON.stringify(room));
  await addRoomToIndex(client, room.roomId);
  return room;
}

export async function createUniqueRoomId(client) {
  let attempts = 0;
  while (attempts < 12) {
    const roomId = generateRoomId();
    const exists = await client.exists(roomKey(roomId));
    if (!exists) return roomId;
    attempts += 1;
  }

  throw new Error('Unable to allocate room ID');
}

export async function updateRoom(client, roomId, updater, { deleteOnNull = false } = {}) {
  const key = roomKey(roomId);

  for (let attempt = 0; attempt < MAX_UPDATE_ATTEMPTS; attempt += 1) {
    await client.watch(key);

    const currentRaw = await client.get(key);
    const currentRoom = currentRaw ? JSON.parse(currentRaw) : null;
    const nextRoom = await updater(currentRoom);

    if (nextRoom === undefined) {
      await client.unwatch();
      return currentRoom;
    }

    const transaction = client.multi();
    if (nextRoom === null && deleteOnNull) {
      transaction.del(key);
    } else {
      transaction.set(key, JSON.stringify(nextRoom));
    }

    const result = await transaction.exec();
    if (result) {
      return nextRoom;
    }
  }

  throw new Error('Chat room update conflict');
}

export async function listPublicRooms(client, limit = 40) {
  const roomIds = await readRoomIndex(client);
  const rooms = await Promise.all(roomIds.map((roomId) => readRoom(client, roomId)));

  return rooms
    .filter(Boolean)
    .filter((room) => (room.visibility || 'private') === 'public')
    .sort((left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime())
    .slice(0, limit);
}

export function clampText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export function sendJson(res, status, body) {
  return res.status(status).json(body);
}

export function applyCors(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
}
