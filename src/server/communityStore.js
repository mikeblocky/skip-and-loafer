/* global process */
import { PostgresKeyValueClient } from './postgres.js';

const SIGNATURES_KEY = 'community:signatures';
const FAN_GALLERY_KEY = 'community:fan-gallery';


export const SIGNATURE_LIMIT = 80;
export const FAN_GALLERY_LIMIT = 20;


class MemoryClient {
  constructor() {
    this.storage = new Map();
  }

  async connect() {
    return this;
  }

  async disconnect() {
    return this;
  }

  async get(key) {
    return this.storage.get(key) || null;
  }

  async set(key, value) {
    this.storage.set(key, value);
    return 'OK';
  }

  on() {
    return this;
  }
}

const memoryClient = new MemoryClient();

export function createRedisClient() {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (process.env.NODE_ENV === 'development' || !databaseUrl) {
    return memoryClient;
  }

  return new PostgresKeyValueClient();
}

export async function connectRedis() {
  const client = createRedisClient();
  await client.connect();
  return client;
}

export function clampText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export function createEntityId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createTimestamp() {
  return new Date().toISOString();
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

async function readList(client, key) {
  const raw = await client.get(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeList(client, key, items) {
  await client.set(key, JSON.stringify(items));
  return items;
}

export async function listSignatures(client) {
  return readList(client, SIGNATURES_KEY);
}

export async function addSignature(client, entry) {
  const current = await listSignatures(client);
  const next = [entry, ...current].slice(0, SIGNATURE_LIMIT);
  await writeList(client, SIGNATURES_KEY, next);
  return next;
}

export async function listFanGalleryEntries(client) {
  return readList(client, FAN_GALLERY_KEY);
}

export async function addFanGalleryEntry(client, entry) {
  const current = await listFanGalleryEntries(client);
  const next = [entry, ...current].slice(0, FAN_GALLERY_LIMIT);
  await writeList(client, FAN_GALLERY_KEY, next);
  return next;
}
