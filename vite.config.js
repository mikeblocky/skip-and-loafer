import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ── Local dev API plugin (simulates Vercel serverless functions) ──
function localSyncApiPlugin() {
  const store = new Map();
  const globalReadsStore = new Map();
  const chatRoomsStore = new Map();
  const communitySignaturesStore = [];
  const communityFanGalleryStore = [];
  const TTL_MS = 36 * 24 * 60 * 60 * 1000; // 36 days (matches Redis TTL)
  const COMMUNITY_SIGNATURE_LIMIT = 80;
  const COMMUNITY_FAN_GALLERY_LIMIT = 20;
  const MAX_COMMUNITY_IMAGE_DATA_URL_LENGTH = 8000000;
  const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function generateKey() {
    let key = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) key += '-';
      key += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }
    return key;
  }

  function purgeExpired() {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now - v.createdAt > TTL_MS) store.delete(k);
    }
  }

  function isExpired(entry) {
    return Date.now() - entry.createdAt > TTL_MS;
  }

  function createChatEntityId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function createLocalEntityId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function clampText(value, maxLength) {
    return String(value || '').trim().slice(0, maxLength);
  }

  function sanitizeDrawingDataUrl(value) {
    const normalized = String(value || '').trim();
    if (!normalized.startsWith('data:image/png;base64,')) return '';
    if (normalized.length > 250000) return '';
    return normalized;
  }

  function sanitizeCommunityImageDataUrl(value) {
    const normalized = String(value || '').trim();
    if (!/^data:image\/[^;]+;base64,/i.test(normalized)) return '';
    if (normalized.length > MAX_COMMUNITY_IMAGE_DATA_URL_LENGTH) return '';
    return normalized;
  }

  function normalizePositiveInt(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return null;
    return Math.round(number);
  }

  function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  }

  function readJsonBody(req, res, onSuccess) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        onSuccess(JSON.parse(body || '{}'));
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON body' });
      }
    });
  }

  return {
    name: 'local-sync-api',
    configureServer(server) {
      // POST /api/sync/create
      server.middlewares.use('/api/sync/create', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { data, key: existingKey } = JSON.parse(body);
            if (!data || typeof data !== 'object') {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing or invalid "data" field' }));
              return;
            }
            if (JSON.stringify(data).length > 51200) {
              res.statusCode = 413;
              res.end(JSON.stringify({ error: 'Payload too large (max 50KB)' }));
              return;
            }

            purgeExpired();

            // Update existing key — refresh TTL on update
            if (existingKey && store.has(existingKey)) {
              store.set(existingKey, { data, createdAt: Date.now() });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ key: existingKey }));
              return;
            }

            // Generate new key
            let key;
            let attempts = 0;
            do { key = generateKey(); attempts++; } while (store.has(key) && attempts < 10);

            store.set(key, { data, createdAt: Date.now() });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ key }));
          } catch {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });

      // GET /api/sync/claim?key=...&peek=true
      server.middlewares.use((req, res, next) => {
        const urlObj = new URL(req.url, 'http://localhost');
        if (!urlObj.pathname.startsWith('/api/sync/claim') || req.method !== 'GET') return next();

        purgeExpired(); // Also purge on read

        const key = decodeURIComponent(urlObj.searchParams.get('key') || '');
        const peek = urlObj.searchParams.get('peek') === 'true';

        if (!key) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing key parameter' }));
          return;
        }

        const entry = store.get(key);

        res.setHeader('Content-Type', 'application/json');

        if (!entry || isExpired(entry)) {
          if (entry) store.delete(key);
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Key not found or expired' }));
          return;
        }

        const { data } = entry;
        if (!peek) store.delete(key);
        res.end(JSON.stringify({ data }));
      });

      // POST /api/reads/increment
      server.middlewares.use('/api/reads/increment', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { chapter } = JSON.parse(body);
            if (chapter == null) {
              res.statusCode = 400; res.end(JSON.stringify({ error: 'Missing chapter number' }));
              return;
            }
            const current = globalReadsStore.get(String(chapter)) || 0;
            const newCount = current + 1;
            globalReadsStore.set(String(chapter), newCount);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ chapter, count: newCount }));
          } catch {
            res.statusCode = 500; res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });

      // GET /api/reads/top
      server.middlewares.use('/api/reads/top', (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const leaderboard = Array.from(globalReadsStore.entries())
            .map(([chapter, count]) => ({ chapter: parseFloat(chapter), count: parseInt(count, 10) }))
            .filter(e => e.count > 0 && !isNaN(e.chapter))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ leaderboard }));
        } catch {
          res.statusCode = 500; res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });

      server.middlewares.use('/api/community/signatures', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          sendJson(res, 200, {});
          return;
        }

        if (req.method === 'GET') {
          sendJson(res, 200, { signatures: [...communitySignaturesStore] });
          return;
        }

        if (req.method !== 'POST') return next();

        readJsonBody(req, res, (body) => {
          const name = clampText(body.name, 48);
          const message = clampText(body.message, 280);

          if (!name) {
            sendJson(res, 400, { error: 'Name is required' });
            return;
          }

          if (!message) {
            sendJson(res, 400, { error: 'Message is required' });
            return;
          }

          const entry = {
            id: createLocalEntityId('sign'),
            name,
            message,
            createdAt: nowIso(),
          };

          communitySignaturesStore.unshift(entry);
          communitySignaturesStore.splice(COMMUNITY_SIGNATURE_LIMIT);

          sendJson(res, 200, { entry, signatures: [...communitySignaturesStore] });
        });
      });

      server.middlewares.use('/api/community/fan-gallery', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          sendJson(res, 200, {});
          return;
        }

        if (req.method === 'GET') {
          sendJson(res, 200, { entries: [...communityFanGalleryStore] });
          return;
        }

        if (req.method !== 'POST') return next();

        readJsonBody(req, res, (body) => {
          const imageDataUrl = sanitizeCommunityImageDataUrl(body.imageDataUrl);
          const name = clampText(body.name, 60);
          const description = clampText(body.description, 240);
          const mimeType = clampText(body.mimeType, 24);
          const width = normalizePositiveInt(body.width);
          const height = normalizePositiveInt(body.height);

          if (!imageDataUrl) {
            sendJson(res, 400, { error: 'A sanitized image upload is required' });
            return;
          }

          const entry = {
            id: createLocalEntityId('fan'),
            name,
            description,
            imageDataUrl,
            mimeType,
            width,
            height,
            createdAt: nowIso(),
          };

          communityFanGalleryStore.unshift(entry);
          communityFanGalleryStore.splice(COMMUNITY_FAN_GALLERY_LIMIT);

          sendJson(res, 200, { entry, entries: [...communityFanGalleryStore] });
        });
      });

      // Optional local chat room API for Vite dev server
      server.middlewares.use((req, res, next) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;
        if (!pathname.startsWith('/api/chat/rooms')) return next();

        const segments = pathname.split('/').filter(Boolean);
        const roomId = segments[3] ? decodeURIComponent(segments[3]).toUpperCase() : '';
        const action = segments[4] || '';

        if (pathname === '/api/chat/rooms' && req.method === 'POST') {
          readJsonBody(req, res, (body) => {
            const action = body.action || '';
            
            if (action === 'join') {
              // Handle join logic...
              return;
            }

            const participantId = clampText(body.participantId, 80);
            const characterName = clampText(body.characterName, 40);
            const displayName = clampText(body.displayName, 40) || characterName;
            const portraitSrc = clampText(body.portraitSrc, 200);
            const intro = clampText(body.intro, 280);
            const roomTitleInput = clampText(body.roomTitle, 80);
            const roomTitle = roomTitleInput || (characterName ? `Chat with ${characterName}` : `${displayName || 'Roleplay'} room`);
            const visibility = clampText(body.visibility, 16) === 'public' ? 'public' : 'private';

            if (!participantId || !characterName || !portraitSrc) {
              sendJson(res, 400, { error: 'Missing required room setup fields' });
              return;
            }

            let nextRoomId;
            let attempts = 0;
            do {
              nextRoomId = generateKey();
              attempts += 1;
            } while (chatRoomsStore.has(nextRoomId) && attempts < 10);

            const timestamp = nowIso();
            const room = {
              roomId: nextRoomId,
              title: roomTitle,
              visibility,
              creatorId: participantId,
              createdAt: timestamp,
              updatedAt: timestamp,
              typingParticipants: {},
              participants: [
                {
                  id: participantId,
                  displayName,
                  characterName,
                  portraitSrc,
                  intro,
                  isCreator: true,
                  joinedAt: timestamp,
                },
              ],
              messages: [
                {
                  id: createChatEntityId('system'),
                  type: 'system',
                  text: `${characterName} opened the room.`,
                  createdAt: timestamp,
                },
              ],
            };

            chatRoomsStore.set(nextRoomId, room);
            sendJson(res, 200, { room, creatorToken: 'mock-token', reclaimPin: '1234', reclaimCode: 'mock-code' });
          });
          return;
        }

        if (pathname === '/api/chat/rooms' && req.method === 'GET') {
          const rooms = Array.from(chatRoomsStore.values())
            .filter((room) => (room.visibility || 'private') === 'public')
            .sort((left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime())
            .slice(0, 40);
          sendJson(res, 200, { rooms });
          return;
        }

        if (segments.length === 4 && req.method === 'GET' && roomId) {
          const room = chatRoomsStore.get(roomId);
          if (!room) {
            sendJson(res, 404, { error: 'Room not found' });
            return;
          }

          sendJson(res, 200, { room });
          return;
        }

        if (segments.length === 4 && req.method === 'POST' && roomId) {
          readJsonBody(req, res, (body) => {
            const action = body.action || '';
            const room = chatRoomsStore.get(roomId);
            if (!room) {
              sendJson(res, 404, { error: 'Room not found' });
              return;
            }

            if (action === 'join') {
              const participantId = clampText(body.participantId, 80);
              const characterName = clampText(body.characterName, 40);
              const displayName = clampText(body.displayName, 40) || characterName;
              const portraitSrc = clampText(body.portraitSrc, 200);
              const intro = clampText(body.intro, 280);

              if (!participantId || !characterName || !portraitSrc) {
                sendJson(res, 400, { error: 'Missing join fields' });
                return;
              }

              const timestamp = nowIso();
              const existingIndex = room.participants.findIndex((participant) => participant.id === participantId);
              const nextParticipants = [...room.participants];
              const nextMessages = [...room.messages];

              if (existingIndex >= 0) {
                nextParticipants[existingIndex] = {
                  ...nextParticipants[existingIndex],
                  displayName,
                  characterName,
                  portraitSrc,
                  intro: intro || nextParticipants[existingIndex].intro || '',
                };
              } else {
                nextParticipants.push({
                  id: participantId,
                  displayName,
                  characterName,
                  portraitSrc,
                  intro: intro || '',
                  isCreator: false,
                  joinedAt: timestamp,
                });

                nextMessages.push({
                  id: createChatEntityId('system'),
                  type: 'system',
                  text: `${characterName} joined the room.`,
                  createdAt: timestamp,
                });
              }

              const nextRoom = {
                ...room,
                participants: nextParticipants,
                messages: nextMessages,
                typingParticipants: {
                  ...(room.typingParticipants || {}),
                  [participantId]: false,
                },
                updatedAt: timestamp,
              };

              chatRoomsStore.set(roomId, nextRoom);
              sendJson(res, 200, { room: nextRoom, participantId, reclaimCode: 'mock-code', reclaimPin: '1234' });
              return;
            }

            if (action === 'message' || action === 'edit') {
              const participantId = clampText(body.participantId, 80);
              const text = clampText(body.text, 500);
              const drawing = sanitizeDrawingDataUrl(body.drawing);
              const author = room.participants.find((p) => p.id === participantId);

              if (!participantId || (!text && !drawing)) {
                sendJson(res, 400, { error: 'Missing message fields' });
                return;
              }

              if (!author) {
                sendJson(res, 403, { error: 'You must join the room before sending messages' });
                return;
              }

              const timestamp = nowIso();
              const nextRoom = {
                ...room,
                updatedAt: timestamp,
                typingParticipants: {
                  ...(room.typingParticipants || {}),
                  [participantId]: false,
                },
                messages: (action === 'edit' && body.messageId) 
                  ? (room.messages || []).map(m => m.id === body.messageId ? { ...m, text, drawing, updatedAt: timestamp } : m)
                  : [
                      ...room.messages,
                      {
                        id: createChatEntityId('message'),
                        type: 'message',
                        authorId: participantId,
                        text,
                        drawing,
                        repliedToId: body.repliedToId || null,
                        createdAt: timestamp,
                      },
                    ],
              };

              chatRoomsStore.set(roomId, nextRoom);
              sendJson(res, 200, { room: nextRoom });
              return;
            }

            if (action === 'typing') {
              const participantId = clampText(body.participantId, 80);
              const isTyping = !!body.isTyping;
              const author = room.participants.find((p) => p.id === participantId);

              if (!participantId) {
                sendJson(res, 400, { error: 'Missing typing fields' });
                return;
              }

              if (!author) {
                sendJson(res, 403, { error: 'You must join the room before updating typing state' });
                return;
              }

              const nextRoom = {
                ...room,
                updatedAt: nowIso(),
                typingParticipants: {
                  ...(room.typingParticipants || {}),
                  [participantId]: isTyping,
                },
              };

              chatRoomsStore.set(roomId, nextRoom);
              sendJson(res, 200, { room: nextRoom });
              return;
            }

            if (action === 'settings') {
              const participantId = clampText(body.participantId, 80);
              const visibility = clampText(body.visibility, 16) === 'public' ? 'public' : 'private';

              if (!participantId) {
                sendJson(res, 400, { error: 'Missing room settings fields' });
                return;
              }

              if (room.creatorId !== participantId) {
                sendJson(res, 403, { error: 'Only the room creator can change room settings' });
                return;
              }

              const nextRoom = {
                ...room,
                visibility,
                title: clampText(body.title, 80) || room.title,
                updatedAt: nowIso(),
              };

              chatRoomsStore.set(roomId, nextRoom);
              sendJson(res, 200, { room: nextRoom });
              return;
            }

            if (action === 'end') {
              const participantId = clampText(body.participantId, 80);
              if (!participantId) {
                sendJson(res, 400, { error: 'Missing end-session fields' });
                return;
              }

              if (room.creatorId !== participantId) {
                sendJson(res, 403, { error: 'Only the room creator can end this session' });
                return;
              }

              chatRoomsStore.delete(roomId);
              sendJson(res, 200, { ended: true });
              return;
            }

            sendJson(res, 400, { error: 'Unknown action' });
          });
          return;
        }

        return next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localSyncApiPlugin()],
})
