-- Retreat magazine CMS
-- Production schema for PostgreSQL 14+
-- Equivalent to schema/mysql.sql and src/schema.sql.

CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name_en VARCHAR(160) NOT NULL,
  full_name_si VARCHAR(160) NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('admin', 'contributor')),
  designation_en VARCHAR(160) NOT NULL DEFAULT '',
  designation_si VARCHAR(160) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL DEFAULT '',
  avatar_path VARCHAR(255) NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE categories (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug VARCHAR(40) NOT NULL UNIQUE,
  name_en VARCHAR(160) NOT NULL,
  name_si VARCHAR(160) NOT NULL,
  description_en VARCHAR(500) NOT NULL DEFAULT '',
  description_si VARCHAR(500) NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE magazines (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug VARCHAR(16) NOT NULL UNIQUE,
  month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year SMALLINT NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  title_si VARCHAR(200) NOT NULL,
  summary_en TEXT NOT NULL DEFAULT '',
  summary_si TEXT NOT NULL DEFAULT '',
  highlights_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_path VARCHAR(255) NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (year, month)
);

CREATE TABLE articles (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  magazine_id INTEGER REFERENCES magazines(id) ON DELETE SET NULL,
  title_en VARCHAR(220) NOT NULL,
  title_si VARCHAR(220) NOT NULL,
  body_en TEXT NOT NULL DEFAULT '',
  body_si TEXT NOT NULL DEFAULT '',
  excerpt_en VARCHAR(300) NOT NULL DEFAULT '',
  excerpt_si VARCHAR(300) NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'published')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  page_number SMALLINT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  target_month SMALLINT,
  target_year SMALLINT,
  reviewer_notes VARCHAR(1000) NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_articles_user ON articles(user_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_magazine ON articles(magazine_id);
CREATE INDEX idx_articles_target ON articles(target_year, target_month);

CREATE TABLE programs (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id INTEGER NOT NULL UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  target_group_en VARCHAR(220) NOT NULL DEFAULT '',
  target_group_si VARCHAR(220) NOT NULL DEFAULT '',
  venue_en VARCHAR(220) NOT NULL DEFAULT '',
  venue_si VARCHAR(220) NOT NULL DEFAULT '',
  participants INTEGER,
  outcomes_en TEXT NOT NULL DEFAULT '',
  outcomes_si TEXT NOT NULL DEFAULT '',
  metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE media (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  magazine_id INTEGER REFERENCES magazines(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  filename VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,
  mime VARCHAR(80) NOT NULL,
  caption_en VARCHAR(255) NOT NULL DEFAULT '',
  caption_si VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_media_article ON media(article_id);
CREATE INDEX idx_media_magazine ON media(magazine_id);

CREATE TABLE audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,
  entity VARCHAR(40) NOT NULL,
  entity_id INTEGER,
  detail VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_audit_created ON audit_log(created_at);
