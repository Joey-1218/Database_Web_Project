// src/db.js (ESM, singleton)
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url); //full path to the current file
const __dirname  = path.dirname(__filename); //Absolute path to the folder containing the current file

//path.resolve(path to the current folder, relative path from the current folder to target file)
const DB_FILE     = path.resolve(__dirname, '../sql/spotify.db');
const SCHEMA_FILE = path.resolve(__dirname, '../sql/schema.sql');

let dbPromise;

/** Get a shared DB connection. Applies schema once, enables FKs. */
export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({ filename: DB_FILE, driver: sqlite3.Database }) 
    // This returns a database obj with nice async methods
      .then(async (db) => {
        // SQLite doesn’t enforce foreign keys unless you turn it on.
        await db.exec('PRAGMA foreign_keys = ON;');
        // Optional safety: re-apply schema (all CREATE IF NOT EXISTS)
        try {
          // read schema as text
          // It returns a Promise that resolves to the file’s contents.
          const schema = await fs.readFile(SCHEMA_FILE, 'utf8');
          await db.exec(schema);
        } catch {
          /* ignore if schema file missing */
        }
        //We have turned on FK settings and init the db, 
        //now we return the modified db obj
        return db;
      });
  }
  return dbPromise;
}

export async function all(sql, params = []) {
  const db = await getDb();
  return db.all(sql, params);
}

export async function get(sql, params = []) {
  const db = await getDb();
  return db.get(sql, params);
}

export async function run(sql, params = []) {
  const db = await getDb();
  return db.run(sql, params);
}
