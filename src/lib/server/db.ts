import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import { statSync } from 'fs';
import { performance } from 'node:perf_hooks';
import { color } from './logcolor';

const DATABASE_PATH = env.DATABASE_PATH ?? '/data/ClipCornDB.db';

// SQL query logging is on unless LOG_SQL is explicitly set to "false"/"0".
const LOG_SQL = env.LOG_SQL !== 'false' && env.LOG_SQL !== '0';

let db: Database.Database | null = null;
let lastMtime: number | null = null;
let lastSize: number | null = null;

let querySeq = 0;

function logQuery(start: Date, sql: string, durationMs: number, rows: number): void {
  if (!LOG_SQL) return;
  const oneLine = sql.replace(/\s+/g, ' ').trim();
  // Cover-image lookups are high-volume and uninteresting — they'd just spam the log.
  if (oneLine.includes('FROM COVERS')) return;

  const ts = start.toISOString().slice(11, 23); // HH:MM:SS.mmm (UTC)
  const slow = durationMs > 300;
  const durRaw = `${durationMs.toFixed(1)}ms`.padStart(9);
  const dur = slow ? color.red(durRaw) : color.green(durRaw);
  const count = String(rows).padStart(6);
  const head = color.gray(`[SQL #${String(++querySeq).padStart(4, '0')} ${ts}]`);
  const flag = slow ? color.red(' ⚠ SLOW') : '';
  console.log(`${head} ${dur} rows=${count}${flag}  ${color.cyan(oneLine)}`);
}

/** Wrap a prepared statement so all/get/run are timed and logged. */
function wrapStatement(stmt: Database.Statement, sql: string): Database.Statement {
  return new Proxy(stmt, {
    get(target, prop, receiver) {
      if (prop === 'all' || prop === 'get' || prop === 'run') {
        return (...args: unknown[]) => {
          const startTime = new Date();
          const t0 = performance.now();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = (target as any)[prop](...args);
          const duration = performance.now() - t0;
          let rows: number;
          if (prop === 'all') rows = Array.isArray(result) ? result.length : 0;
          else if (prop === 'get') rows = result === undefined ? 0 : 1;
          else rows = result && typeof result.changes === 'number' ? result.changes : 0;
          logQuery(startTime, sql, duration, rows);
          return result;
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (target as any)[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    }
  }) as Database.Statement;
}

/** Patch a Database so every prepare() returns an instrumented statement. */
function instrument(database: Database.Database): Database.Database {
  const origPrepare = database.prepare.bind(database);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (database as any).prepare = (sql: string) => wrapStatement(origPrepare(sql), sql);
  return database;
}

export function getDb(): Database.Database {
  const stat = statSync(DATABASE_PATH);

  if (db && (lastMtime !== stat.mtimeMs || lastSize !== stat.size)) {
    // Database file changed, close old connection
    db.close();
    db = null;
  }

  if (!db) {
    const raw = new Database(DATABASE_PATH, { readonly: true, fileMustExist: true });
    db = LOG_SQL ? instrument(raw) : raw;
    lastMtime = stat.mtimeMs;
    lastSize = stat.size;
  }

  return db;
}

/** Filesystem timestamps of the database file, so the UI can show how old the data is. */
export function getDbFileInfo(): { created: string; modified: string } {
  const stat = statSync(DATABASE_PATH);
  // birthtime is the creation date where the filesystem records it; some filesystems leave it
  // unset (epoch 0), in which case ctime (inode change time) is the best available fallback.
  const created = stat.birthtimeMs > 0 ? stat.birthtime : stat.ctime;
  return { created: created.toISOString(), modified: stat.mtime.toISOString() };
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    lastMtime = null;
    lastSize = null;
  }
}
