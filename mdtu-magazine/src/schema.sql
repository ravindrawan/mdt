PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name_en TEXT NOT NULL,
  full_name_si TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('admin', 'contributor')),
  designation_en TEXT NOT NULL DEFAULT '',
  designation_si TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  avatar_path TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_si TEXT NOT NULL,
  description_en TEXT NOT NULL DEFAULT '',
  description_si TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS magazines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_si TEXT NOT NULL,
  summary_en TEXT NOT NULL DEFAULT '',
  summary_si TEXT NOT NULL DEFAULT '',
  highlights_json TEXT NOT NULL DEFAULT '[]',
  cover_path TEXT NOT NULL DEFAULT '',
  back_path TEXT NOT NULL DEFAULT '',
  cover_copy_json TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (year, month)
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  magazine_id INTEGER REFERENCES magazines(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  title_si TEXT NOT NULL,
  body_en TEXT NOT NULL DEFAULT '',
  body_si TEXT NOT NULL DEFAULT '',
  excerpt_en TEXT NOT NULL DEFAULT '',
  excerpt_si TEXT NOT NULL DEFAULT '',
  byline_en TEXT NOT NULL DEFAULT '',
  byline_si TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'published')),
  featured INTEGER NOT NULL DEFAULT 0,
  page_number INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  target_month INTEGER,
  target_year INTEGER,
  reviewer_notes TEXT NOT NULL DEFAULT '',
  submitted_at TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
  start_date TEXT,
  end_date TEXT,
  target_group_en TEXT NOT NULL DEFAULT '',
  target_group_si TEXT NOT NULL DEFAULT '',
  venue_en TEXT NOT NULL DEFAULT '',
  venue_si TEXT NOT NULL DEFAULT '',
  participants INTEGER,
  outcomes_en TEXT NOT NULL DEFAULT '',
  outcomes_si TEXT NOT NULL DEFAULT '',
  metrics_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  magazine_id INTEGER REFERENCES magazines(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  mime TEXT NOT NULL,
  caption_en TEXT NOT NULL DEFAULT '',
  caption_si TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id INTEGER,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_user ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_magazine ON articles(magazine_id);
CREATE INDEX IF NOT EXISTS idx_articles_target ON articles(target_year, target_month);
CREATE INDEX IF NOT EXISTS idx_media_article ON media(article_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
