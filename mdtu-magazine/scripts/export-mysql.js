const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const root = path.join(__dirname, '..');
const db = new DatabaseSync(path.join(root, 'data', 'retreat.db'));
const tables = ['users', 'categories', 'magazines', 'articles', 'programs', 'media', 'audit_log'];

const dateColumns = new Set(['start_date', 'end_date']);

function mysqlDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function sqlValue(table, column, value) {
  if (dateColumns.has(column) && (value === '' || value === undefined || value === null)) return 'NULL';
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'bigint') return value.toString();
  let text = String(value);
  if (dateColumns.has(column)) text = text.slice(0, 10);
  else if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const converted = mysqlDateTime(text);
    if (converted) text = converted;
  }
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

const lines = [
  '-- Generated from data/retreat.db. Import after schema/mysql.sql.',
  'SET NAMES utf8mb4;',
  'SET FOREIGN_KEY_CHECKS=0;'
];

tables.forEach((table) => {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  lines.push(`DELETE FROM ${table};`);
  rows.forEach((row) => {
    const cols = Object.keys(row);
    lines.push(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((col) => sqlValue(table, col, row[col])).join(', ')});`);
  });
});

lines.push('SET FOREIGN_KEY_CHECKS=1;');
fs.writeFileSync(path.join(root, 'schema', 'mdtu-data.sql'), `${lines.join('\n')}\n`);
console.log(`Wrote schema/mdtu-data.sql (${lines.length} lines)`);
