import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { readFileSync } from "fs";
import path from "path";

const DB_FILE = path.resolve("sql", "spotify.db");

export async function initDb() {
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  const schema = readFileSync(path.resolve("sql", "schema.sql"), "utf-8");
  await db.exec(schema);
  return db;
}
