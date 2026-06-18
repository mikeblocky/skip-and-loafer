CREATE TABLE IF NOT EXISTS sync_entries (
  key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sync_entries_expires_at_idx ON sync_entries (expires_at);

CREATE TABLE IF NOT EXISTS read_counts (
  chapter TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  difficulty_mode TEXT NOT NULL,
  question_set TEXT NOT NULL,
  played_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS quiz_results_played_at_idx ON quiz_results (played_at DESC);

CREATE TABLE IF NOT EXISTS quiz_leaderboard (
  name TEXT PRIMARY KEY,
  best_score INTEGER NOT NULL,
  played INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS quiz_leaderboard_score_idx
  ON quiz_leaderboard (best_score DESC, played ASC, name ASC);

CREATE TABLE IF NOT EXISTS signatures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'sign',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS signatures_created_at_idx ON signatures (created_at DESC);

CREATE TABLE IF NOT EXISTS fan_gallery (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_hash TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL DEFAULT '',
  width INTEGER,
  height INTEGER,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS fan_gallery_image_hash_idx ON fan_gallery (image_hash);
CREATE INDEX IF NOT EXISTS fan_gallery_created_at_idx ON fan_gallery (created_at DESC);
