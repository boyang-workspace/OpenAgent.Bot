-- Humanity Countdown: a small, anonymous public voting game.

CREATE TABLE humanity_capabilities (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  canonical_text TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'human_only' CHECK (status IN ('human_only','taken','archived')),
  yes_threshold REAL NOT NULL DEFAULT 0.75,
  minimum_effective_votes INTEGER NOT NULL DEFAULT 200,
  threshold_since TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  taken_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE humanity_votes (
  id TEXT PRIMARY KEY,
  capability_id TEXT NOT NULL REFERENCES humanity_capabilities(id) ON DELETE CASCADE,
  anonymous_user_id TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('yes','not_yet')),
  ip_hash TEXT,
  user_agent_hash TEXT,
  abuse_flag INTEGER NOT NULL DEFAULT 0 CHECK (abuse_flag IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(capability_id, anonymous_user_id)
);
CREATE INDEX idx_humanity_votes_capability_updated ON humanity_votes(capability_id, updated_at DESC);
CREATE INDEX idx_humanity_votes_anon_updated ON humanity_votes(anonymous_user_id, updated_at DESC);

CREATE TABLE humanity_submissions (
  id TEXT PRIMARY KEY,
  raw_text TEXT NOT NULL,
  normalized_text TEXT,
  anonymous_user_id TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'raw' CHECK (processing_status IN ('raw','processed','flagged')),
  cluster_id TEXT,
  matched_capability_id TEXT REFERENCES humanity_capabilities(id) ON DELETE SET NULL,
  spam_score REAL,
  ai_note TEXT,
  admin_status TEXT NOT NULL DEFAULT 'pending' CHECK (admin_status IN ('pending','approved','merged','rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_humanity_submissions_review ON humanity_submissions(processing_status, admin_status, created_at DESC);

CREATE TABLE humanity_taken_events (
  id TEXT PRIMARY KEY,
  capability_id TEXT NOT NULL UNIQUE REFERENCES humanity_capabilities(id) ON DELETE CASCADE,
  taken_at TEXT NOT NULL,
  yes_percentage_at_taken REAL NOT NULL,
  effective_votes_at_taken REAL NOT NULL,
  countdown_before INTEGER NOT NULL,
  countdown_after INTEGER NOT NULL
);

CREATE TABLE humanity_daily_metrics (
  metric_date TEXT NOT NULL,
  capability_id TEXT NOT NULL REFERENCES humanity_capabilities(id) ON DELETE CASCADE,
  raw_yes_votes INTEGER NOT NULL,
  raw_not_yet_votes INTEGER NOT NULL,
  weighted_yes REAL NOT NULL,
  weighted_not_yet REAL NOT NULL,
  yes_percentage REAL NOT NULL,
  effective_vote_count REAL NOT NULL,
  status TEXT NOT NULL,
  PRIMARY KEY (metric_date, capability_id)
);
