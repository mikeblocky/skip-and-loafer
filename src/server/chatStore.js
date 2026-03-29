import { createClient } from 'redis';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_PREFIX = 'chat:room:';
const ROOM_INDEX_KEY = 'chat:rooms:index';
const MAX_UPDATE_ATTEMPTS = 8;

export function createRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is required for chat persistence');
  }

  const client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.error('Redis Client Error', err));
  return client;
}

export function roomKey(roomId) {
  const normalizedId = String(roomId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${ROOM_PREFIX}${normalizedId}`;
}

export function generateRoomId() {
  let key = '';
  for (let i = 0; i < 8; i += 1) {
    key += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return key;
}

export function createTimestamp() {
  return new Date().toISOString();
}

export function createEntityId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function connectRedis() {
  const client = createRedisClient();
  await client.connect();
  return client;
}

export async function readRoom(client, roomId) {
  const raw = await client.get(roomKey(roomId));
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function readRoomIndex(client) {
  const raw = await client.get(ROOM_INDEX_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return Array.isArray(parsed) ? parsed : [];
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
