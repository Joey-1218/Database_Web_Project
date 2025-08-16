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
const MIGRATION = path.resolve(__dirname, '../sql/2025-08-15_add_seed_flags.sql');

async function main() {
  const sql = await fs.readFile(MIGRATION, 'utf8');
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });

  // Good practice for schema changes
  await db.exec('PRAGMA foreign_keys = OFF;');
  await db.exec('BEGIN;');

  try {
    await db.exec(sql);
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
