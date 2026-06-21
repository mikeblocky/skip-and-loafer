export const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const SYNC_TTL_DAYS = 36;
export const MAX_SYNC_PAYLOAD_LENGTH = 10 * 1024 * 1024;
export const MAX_IMAGE_DATA_URL_LENGTH = 8_000_000;
export const MAX_JSON_BODY_LENGTH = 10 * 1024 * 1024;
export const MAX_COMMUNITY_JSON_BODY_LENGTH = 16 * 1024;
export const MAX_QUIZ_JSON_BODY_LENGTH = 8 * 1024;
export const MAX_READS_JSON_BODY_LENGTH = 512;
export const COMMUNITY_SIGNATURE_LIMIT = 80;
export const COMMUNITY_FAN_GALLERY_LIMIT = 20;

export const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const ALLOWED_QUIZ_DIFFICULTIES = new Set(['easy', 'normal', 'hard', 'expert']);
export const ALLOWED_QUIZ_SETS = new Set(['10', '20', 'all']);

export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
    "script-src 'self' 'wasm-unsafe-eval' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: data:",
    "connect-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com https://cloudflareinsights.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join('; '),
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Permitted-Cross-Domain-Policies': 'none',
};
