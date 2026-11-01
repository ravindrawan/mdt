-- Retreat magazine CMS
-- Production schema for MySQL 8+ / MariaDB 10.6+
-- Character set utf8mb4 is required for Sinhala text.
-- The bundled application runs on Node's built-in SQLite (src/schema.sql)
-- so it can start without a database server. Load this file when moving
-- the same tables to MySQL.

CREATE DATABASE IF NOT EXISTS mdtu_retreat
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mdtu_retreat;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(32) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name_en VARCHAR(160) NOT NULL,
  full_name_si VARCHAR(160) NOT NULL DEFAULT '',
  role ENUM('admin', 'contributor') NOT NULL,
  designation_en VARCHAR(160) NOT NULL DEFAULT '',
  designation_si VARCHAR(160) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL DEFAULT '',
  avatar_path VARCHAR(255) NOT NULL DEFAULT '',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(40) NOT NULL,
  name_en VARCHAR(160) NOT NULL,
  name_si VARCHAR(160) NOT NULL,
  description_en VARCHAR(500) NOT NULL DEFAULT '',
  description_si VARCHAR(500) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE magazines (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(16) NOT NULL,
  month TINYINT UNSIGNED NOT NULL,
  year SMALLINT UNSIGNED NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  title_si VARCHAR(200) NOT NULL,
  summary_en TEXT NOT NULL,
  summary_si TEXT NOT NULL,
  highlights_json LONGTEXT NOT NULL,
  cover_path VARCHAR(255) NOT NULL DEFAULT '',
  back_path VARCHAR(255) NOT NULL DEFAULT '',
  cover_copy_json LONGTEXT NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_magazines_slug (slug),
  UNIQUE KEY uq_magazines_issue (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE articles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  magazine_id INT UNSIGNED NULL,
  title_en VARCHAR(220) NOT NULL,
  title_si VARCHAR(220) NOT NULL,
  body_en MEDIUMTEXT NOT NULL,
  body_si MEDIUMTEXT NOT NULL,
  excerpt_en VARCHAR(300) NOT NULL DEFAULT '',
  excerpt_si VARCHAR(300) NOT NULL DEFAULT '',
  byline_en VARCHAR(160) NOT NULL DEFAULT '',
  byline_si VARCHAR(160) NOT NULL DEFAULT '',
  status ENUM('draft', 'submitted', 'approved', 'rejected', 'published') NOT NULL DEFAULT 'draft',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  page_number TINYINT UNSIGNED NULL,
  sort_order INT NOT NULL DEFAULT 0,
  target_month TINYINT UNSIGNED NULL,
  target_year SMALLINT UNSIGNED NULL,
  reviewer_notes VARCHAR(1000) NOT NULL DEFAULT '',
  submitted_at DATETIME NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_articles_user (user_id),
  KEY idx_articles_status (status),
  KEY idx_articles_magazine (magazine_id),
  KEY idx_articles_target (target_year, target_month),
  CONSTRAINT fk_articles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_articles_magazine FOREIGN KEY (magazine_id) REFERENCES magazines(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE programs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  article_id INT UNSIGNED NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  target_group_en VARCHAR(220) NOT NULL DEFAULT '',
  target_group_si VARCHAR(220) NOT NULL DEFAULT '',
  venue_en VARCHAR(220) NOT NULL DEFAULT '',
  venue_si VARCHAR(220) NOT NULL DEFAULT '',
  participants INT UNSIGNED NULL,
  outcomes_en TEXT NOT NULL,
  outcomes_si TEXT NOT NULL,
  metrics_json LONGTEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_programs_article (article_id),
  CONSTRAINT fk_programs_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE media (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  article_id INT UNSIGNED NULL,
  magazine_id INT UNSIGNED NULL,
  user_id INT UNSIGNED NULL,
  filename VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,
  mime VARCHAR(80) NOT NULL,
  caption_en VARCHAR(255) NOT NULL DEFAULT '',
  caption_si VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_media_article (article_id),
  KEY idx_media_magazine (magazine_id),
  CONSTRAINT fk_media_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_media_magazine FOREIGN KEY (magazine_id) REFERENCES magazines(id) ON DELETE CASCADE,
  CONSTRAINT fk_media_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NULL,
  action VARCHAR(60) NOT NULL,
  entity VARCHAR(40) NOT NULL,
  entity_id INT UNSIGNED NULL,
  detail VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_audit_created (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
