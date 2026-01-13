import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import { statSync } from 'fs';

const DATABASE_PATH = env.DATABASE_PATH ?? '/data/ClipCornDB.db';

let db: Database.Database | null = null;
let lastMtime: number | null = null;
let lastSize: number | null = null;

export function getDb(): Database.Database {
  const stat = statSync(DATABASE_PATH);

  if (db && (lastMtime !== stat.mtimeMs || lastSize !== stat.size)) {
    // Database file changed, close old connection
    db.close();
    db = null;
  }

  if (!db) {
    db = new Database(DATABASE_PATH, { readonly: true, fileMustExist: true });
    lastMtime = stat.mtimeMs;
    lastSize = stat.size;
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    lastMtime = null;
    lastSize = null;
  }
}
