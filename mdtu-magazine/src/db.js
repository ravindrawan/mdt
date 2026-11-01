const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'retreat.db');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');

function exec(sql) {
  db.exec(sql);
}

function get(sql, params = []) {
  const row = db.prepare(sql).get(...params);
  return row ? { ...row } : null;
}

function all(sql, params = []) {
  return db.prepare(sql).all(...params).map((row) => ({ ...row }));
}

function run(sql, params = []) {
  const result = db.prepare(sql).run(...params);
  return {
    changes: Number(result.changes || 0),
    id: Number(result.lastInsertRowid || 0)
  };
}

function transaction(fn) {
  exec('BEGIN');
  try {
    const result = fn();
    exec('COMMIT');
    return result;
  } catch (error) {
    try { exec('ROLLBACK'); } catch { /* already closed */ }
    throw error;
  }
}

function ensureUsernames() {
  const columns = all('PRAGMA table_info(users)').map((column) => column.name);
  if (!columns.includes('username')) {
    exec(`ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT ''`);
  }
  const rows = all('SELECT id, email, role, username FROM users');
  const used = new Set(rows.map((row) => row.username).filter(Boolean));
  rows.forEach((row) => {
    if (row.username) return;
    const local = String(row.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
    let base = row.role === 'admin' ? 'admin' : (local || `user${row.id}`);
    if (base.length < 3) base = `user${row.id}`;
    let username = base;
    let n = 2;
    while (used.has(username)) {
      username = `${base}${n}`;
      n += 1;
    }
    used.add(username);
    run('UPDATE users SET username = ? WHERE id = ?', [username, row.id]);
  });
  exec('CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username)');
  ['byline_en', 'byline_si'].forEach((column) => {
    const columns = all('PRAGMA table_info(articles)').map((item) => item.name);
    if (!columns.includes(column)) {
      exec(`ALTER TABLE articles ADD COLUMN ${column} TEXT NOT NULL DEFAULT ''`);
    }
  });
  const magazineColumns = all('PRAGMA table_info(magazines)').map((column) => column.name);
  if (magazineColumns.length && !magazineColumns.includes('back_path')) {
    exec(`ALTER TABLE magazines ADD COLUMN back_path TEXT NOT NULL DEFAULT ''`);
  }
  if (magazineColumns.length && !magazineColumns.includes('cover_copy_json')) {
    exec(`ALTER TABLE magazines ADD COLUMN cover_copy_json TEXT NOT NULL DEFAULT ''`);
  }
}

function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  exec(schema);
  ensureUsernames();
  const { seedIfEmpty } = require('./seed');
  seedIfEmpty({ get, all, run, transaction });
}

module.exports = { db, get, all, run, exec, transaction, init, dbPath };
