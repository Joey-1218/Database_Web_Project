// backend/scripts/migrate.js (ESM)
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// adjust these if your paths differ
const DB_FILE   = path.resolve(__dirname, '../sql/spotify.db');
const MIGRATION1 = path.resolve(__dirname, '../sql/2025-08-15_add_seed_flags.sql');
const MIGRATION2 = path.resolve(__dirname, '../sql/fix_created_at.sql');


async function main() {
  const sql1 = await fs.readFile(MIGRATION1, 'utf8');
  const sql2 = await fs.readFile(MIGRATION2, 'utf8');
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });

  // Good practice for schema changes
  await db.exec('PRAGMA foreign_keys = OFF;');
  await db.exec('BEGIN;');

  try {
    await db.exec(sql1);
    await db.exec(sql2);
    await db.exec('COMMIT;');
    console.log('Migration applied successfully.');
  } catch (err) {
    await db.exec('ROLLBACK;');
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

main();
