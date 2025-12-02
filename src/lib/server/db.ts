import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

const DATABASE_PATH = env.DATABASE_PATH ?? '/data/ClipCornDB.db';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DATABASE_PATH, { readonly: true, fileMustExist: true });
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
