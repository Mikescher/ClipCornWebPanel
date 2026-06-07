import { getDb } from './db';
import { PAGE_SIZE } from '$lib/constants';
import { parseViewedHistory } from '$lib/utils/format';
import type { MediaInfo, Checksums } from '$lib/types';

export type { MediaInfo, Checksums } from '$lib/types';

export interface MovieRow {
  LOCALID: number;
  NAME: string;
  VIEWED_HISTORY: string;
  ZYKLUS: string;
  ZYKLUSNUMBER: number;
  LANGUAGE: string;
  SUBTITLES: string;
  GENRE: string;
  LENGTH: number;
  ADDDATE: string;
  ONLINESCORE_NUM: number;
  ONLINESCORE_DENOM: number;
  FSK: number;
  FORMAT: number;
  MOVIEYEAR: number;
  ONLINEREF: string;
  GROUPS: string;
  FILESIZE: number;
  SCORE: number;
  SCORECOMMENT: string;
  COVERID: number;
  SPECIALVERSION: string | null;
  ANIMESEASON: string | null;
  ANIMESTUDIO: string | null;
  TAGS: string | null;
}

export interface SeriesRow {
  LOCALID: number;
  NAME: string;
  GENRE: string;
  ONLINESCORE_NUM: number;
  ONLINESCORE_DENOM: number;
  FSK: number;
  ONLINEREF: string;
  GROUPS: string;
  SCORE: number;
  SCORECOMMENT: string;
  COVERID: number;
  SPECIALVERSION: string | null;
  TAGS: string | null;
}

export interface SeasonRow {
  LOCALID: number;
  SERIESID: number;
  NAME: string;
  SEASONYEAR: number;
  COVERID: number;
  SCORE: number;
  SCORECOMMENT: string;
  ONLINEREF: string;
  ANIMESEASON: string | null;
  ANIMESTUDIO: string | null;
}

export interface EpisodeRow {
  LOCALID: number;
  SEASONID: number;
  EPISODE: number;
  NAME: string;
  VIEWED_HISTORY: string;
  LENGTH: number;
  FORMAT: number;
  FILESIZE: number;
  PART1: string;
  ADDDATE: string;
  LANGUAGE: string;
  SUBTITLES: string;
  SCORE: number;
  SCORECOMMENT: string;
  TAGS: string | null;
}

export interface GroupRow {
  NAME: string;
  ORDERING: number;
  COLOR: string;
  SERIALIZE: number;
  PARENTGROUP: string;
  VISIBLE: number;
}

export interface CoverRow {
  ID: number;
  PREVIEW: Buffer;
}

export interface FilterParams {
  search?: string;
  group?: string;
  genre?: number;
  language?: number;
  format?: number;
  fsk?: number;
  score?: number;
  onlineScore?: number;
  tags?: number;
  year?: number;
  type?: 'movie' | 'series';
  animeseason?: string;
  animestudio?: string;
  version?: string;
  viewed?: 'full' | 'partial' | 'none';
  sort?: string;
}

export interface MediaItem {
  id: number;
  type: 'movie' | 'series';
  name: string;
  coverId: number;
  genres: number[];
  groups: string[];
  languages: number[];
  score: number;
  onlineScoreNum: number;
  onlineScoreDenom: number;
  fsk: number;
  tags: number[];
  year: number;
  addDate: string;
  onlineRef: string;
  // Movie-specific
  zyklus?: string;
  zyklusNumber?: number;
  format?: number;
  length?: number;
  filesize?: number;
  viewedHistory?: string;
  specialVersion?: string[];
  animeSeason?: string[];
  animeStudio?: string[];
  // Series-specific
  episodeCount?: number;
  seasonCount?: number;
  totalLength?: number;
  totalFilesize?: number;
  // Detail-only (populated by getMovie/getEpisode, not in list queries)
  mediaInfo?: MediaInfo | null;
  checksums?: Checksums;
  // Personal data — must be redacted server-side for unauthenticated clients
  scoreComment?: string;
  // Watched status — only populated when authenticated. 'full' = watched (all episodes for series),
  // 'partial' = some (but not all) episodes watched. Absent = not watched / hidden.
  watchedState?: 'full' | 'partial';
  // First/last watch timestamps — only populated when authenticated; used for watch-based sorting.
  firstWatched?: string;
  lastWatched?: string;
}

// Watched = at least one VIEWED_HISTORY entry that isn't the 'UNSPECIFIED' placeholder.
// json_valid guards against empty/malformed JSON (json_each would otherwise throw).
const MOVIE_WATCHED = `EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(VIEWED_HISTORY) THEN VIEWED_HISTORY ELSE '[]' END) je WHERE je.value <> 'UNSPECIFIED' AND je.value <> '')`;
const SERIES_TOTAL_EP = `(SELECT COUNT(*) FROM SEASONS se JOIN EPISODES ep ON ep.SEASONID = se.LOCALID WHERE se.SERIESID = SERIES.LOCALID)`;
const SERIES_WATCHED_EP = `(SELECT COUNT(*) FROM SEASONS se JOIN EPISODES ep ON ep.SEASONID = se.LOCALID WHERE se.SERIESID = SERIES.LOCALID AND EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(ep.VIEWED_HISTORY) THEN ep.VIEWED_HISTORY ELSE '[]' END) je WHERE je.value <> 'UNSPECIFIED' AND je.value <> ''))`;

/** SQL fragment for the movie `viewed` filter. Movies are binary, so 'partial' matches nothing. */
function movieViewedClause(viewed?: string): string {
  switch (viewed) {
    case 'full':
      return ` AND ${MOVIE_WATCHED}`;
    case 'none':
      return ` AND NOT ${MOVIE_WATCHED}`;
    case 'partial':
      return ` AND 1=0`;
    default:
      return '';
  }
}

/** SQL fragment for the series `viewed` filter, comparing watched episodes to total episodes. */
function seriesViewedClause(viewed?: string): string {
  switch (viewed) {
    case 'full':
      return ` AND ${SERIES_TOTAL_EP} > 0 AND ${SERIES_WATCHED_EP} = ${SERIES_TOTAL_EP}`;
    case 'partial':
      return ` AND ${SERIES_WATCHED_EP} > 0 AND ${SERIES_WATCHED_EP} < ${SERIES_TOTAL_EP}`;
    case 'none':
      return ` AND ${SERIES_WATCHED_EP} = 0`;
    default:
      return '';
  }
}

// --- Sorting ---
// Watch timestamps stored as "YYYY-MM-DD HH:MM:SS" sort lexically = chronologically.
const MOVIE_FIRST_WATCHED = `(SELECT MIN(je.value) FROM json_each(CASE WHEN json_valid(VIEWED_HISTORY) THEN VIEWED_HISTORY ELSE '[]' END) je WHERE je.value <> 'UNSPECIFIED' AND je.value <> '')`;
const MOVIE_LAST_WATCHED = `(SELECT MAX(je.value) FROM json_each(CASE WHEN json_valid(VIEWED_HISTORY) THEN VIEWED_HISTORY ELSE '[]' END) je WHERE je.value <> 'UNSPECIFIED' AND je.value <> '')`;
// COALESCE to -1 so unrated items sort below any real score (first in ASC, last in DESC).
const MOVIE_ONLINE = `COALESCE(CAST(ONLINESCORE_NUM AS REAL) / NULLIF(ONLINESCORE_DENOM, 0), -1)`;

const SERIES_LAST_ADD = `(SELECT MAX(ep.ADDDATE) FROM SEASONS se JOIN EPISODES ep ON ep.SEASONID = se.LOCALID WHERE se.SERIESID = SERIES.LOCALID)`;
const SERIES_FIRST_WATCHED = `(SELECT MIN(je.value) FROM SEASONS se JOIN EPISODES ep ON ep.SEASONID = se.LOCALID, json_each(CASE WHEN json_valid(ep.VIEWED_HISTORY) THEN ep.VIEWED_HISTORY ELSE '[]' END) je WHERE se.SERIESID = SERIES.LOCALID AND je.value <> 'UNSPECIFIED' AND je.value <> '')`;
const SERIES_LAST_WATCHED = `(SELECT MAX(je.value) FROM SEASONS se JOIN EPISODES ep ON ep.SEASONID = se.LOCALID, json_each(CASE WHEN json_valid(ep.VIEWED_HISTORY) THEN ep.VIEWED_HISTORY ELSE '[]' END) je WHERE se.SERIESID = SERIES.LOCALID AND je.value <> 'UNSPECIFIED' AND je.value <> '')`;
const SERIES_ONLINE = `COALESCE(CAST(ONLINESCORE_NUM AS REAL) / NULLIF(ONLINESCORE_DENOM, 0), -1)`;
const SERIES_SIZE = `(SELECT COALESCE(SUM(ep.FILESIZE), 0) FROM SEASONS se JOIN EPISODES ep ON ep.SEASONID = se.LOCALID WHERE se.SERIESID = SERIES.LOCALID)`;
const SERIES_LENGTH = `(SELECT COALESCE(SUM(ep.LENGTH), 0) FROM SEASONS se JOIN EPISODES ep ON ep.SEASONID = se.LOCALID WHERE se.SERIESID = SERIES.LOCALID)`;

const TIEBREAK = `, NAME COLLATE NOCASE ASC, LOCALID ASC`;
const NAME_ORDER = `ORDER BY NAME COLLATE NOCASE ASC, LOCALID ASC`;

/** Build the `ORDER BY ...` clause for the paginated movie query. */
function movieOrderBy(sort: string | undefined, authenticated: boolean): string {
  switch (sort) {
    case 'name':
      return NAME_ORDER;
    case 'added':
      return `ORDER BY ADDDATE DESC${TIEBREAK}`;
    case 'first_watched':
      return authenticated ? `ORDER BY ${MOVIE_FIRST_WATCHED} DESC${TIEBREAK}` : `ORDER BY ADDDATE DESC${TIEBREAK}`;
    case 'last_watched':
      return authenticated ? `ORDER BY ${MOVIE_LAST_WATCHED} DESC${TIEBREAK}` : `ORDER BY ADDDATE DESC${TIEBREAK}`;
    case 'online_asc':
      return `ORDER BY ${MOVIE_ONLINE} ASC${TIEBREAK}`;
    case 'online_desc':
      return `ORDER BY ${MOVIE_ONLINE} DESC${TIEBREAK}`;
    case 'user_asc':
      return `ORDER BY SCORE ASC${TIEBREAK}`;
    case 'user_desc':
      return `ORDER BY SCORE DESC${TIEBREAK}`;
    case 'size_asc':
      return `ORDER BY FILESIZE ASC${TIEBREAK}`;
    case 'size_desc':
      return `ORDER BY FILESIZE DESC${TIEBREAK}`;
    case 'duration_asc':
      return `ORDER BY LENGTH ASC${TIEBREAK}`;
    case 'duration_desc':
      return `ORDER BY LENGTH DESC${TIEBREAK}`;
    default:
      return `ORDER BY ADDDATE DESC${TIEBREAK}`;
  }
}

/** Build the `ORDER BY ...` clause for the paginated series query. */
function seriesOrderBy(sort: string | undefined, authenticated: boolean): string {
  switch (sort) {
    case 'name':
      return NAME_ORDER;
    case 'added':
      return `ORDER BY ${SERIES_LAST_ADD} DESC${TIEBREAK}`;
    case 'first_watched':
      return authenticated ? `ORDER BY ${SERIES_FIRST_WATCHED} DESC${TIEBREAK}` : NAME_ORDER;
    case 'last_watched':
      return authenticated ? `ORDER BY ${SERIES_LAST_WATCHED} DESC${TIEBREAK}` : NAME_ORDER;
    case 'online_asc':
      return `ORDER BY ${SERIES_ONLINE} ASC${TIEBREAK}`;
    case 'online_desc':
      return `ORDER BY ${SERIES_ONLINE} DESC${TIEBREAK}`;
    case 'user_asc':
      return `ORDER BY SCORE ASC${TIEBREAK}`;
    case 'user_desc':
      return `ORDER BY SCORE DESC${TIEBREAK}`;
    case 'size_asc':
      return `ORDER BY ${SERIES_SIZE} ASC${TIEBREAK}`;
    case 'size_desc':
      return `ORDER BY ${SERIES_SIZE} DESC${TIEBREAK}`;
    case 'duration_asc':
      return `ORDER BY ${SERIES_LENGTH} ASC${TIEBREAK}`;
    case 'duration_desc':
      return `ORDER BY ${SERIES_LENGTH} DESC${TIEBREAK}`;
    default:
      return NAME_ORDER;
  }
}

/** JS comparator mirroring the SQL ordering, used for the merged (movies + series) list. */
function buildComparator(sort: string | undefined, authenticated: boolean): (a: MediaItem, b: MediaItem) => number {
  const nameCmp = (a: MediaItem, b: MediaItem) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
  const addedDesc = (a: MediaItem, b: MediaItem) => (b.addDate || '').localeCompare(a.addDate || '') || nameCmp(a, b);
  const onlineVal = (it: MediaItem) => (it.onlineScoreDenom > 0 ? it.onlineScoreNum / it.onlineScoreDenom : -1);
  const sizeVal = (it: MediaItem) => (it.type === 'movie' ? it.filesize || 0 : it.totalFilesize || 0);
  const durationVal = (it: MediaItem) => (it.type === 'movie' ? it.length || 0 : it.totalLength || 0);
  const watchedDesc = (field: 'firstWatched' | 'lastWatched') => (a: MediaItem, b: MediaItem) => {
    const av = a[field] || '';
    const bv = b[field] || '';
    if (av && !bv) return -1; // watched items before unwatched
    if (!av && bv) return 1;
    if (av !== bv) return bv.localeCompare(av);
    return nameCmp(a, b);
  };
  switch (sort) {
    case 'name':
      return nameCmp;
    case 'added':
      return addedDesc;
    case 'first_watched':
      return authenticated ? watchedDesc('firstWatched') : addedDesc;
    case 'last_watched':
      return authenticated ? watchedDesc('lastWatched') : addedDesc;
    case 'online_asc':
      return (a, b) => onlineVal(a) - onlineVal(b) || nameCmp(a, b);
    case 'online_desc':
      return (a, b) => onlineVal(b) - onlineVal(a) || nameCmp(a, b);
    case 'user_asc':
      return (a, b) => a.score - b.score || nameCmp(a, b);
    case 'user_desc':
      return (a, b) => b.score - a.score || nameCmp(a, b);
    case 'size_asc':
      return (a, b) => sizeVal(a) - sizeVal(b) || nameCmp(a, b);
    case 'size_desc':
      return (a, b) => sizeVal(b) - sizeVal(a) || nameCmp(a, b);
    case 'duration_asc':
      return (a, b) => durationVal(a) - durationVal(b) || nameCmp(a, b);
    case 'duration_desc':
      return (a, b) => durationVal(b) - durationVal(a) || nameCmp(a, b);
    default:
      return addedDesc;
  }
}

export function getMovies(filters: FilterParams, page: number, authenticated = false): { items: MediaItem[]; hasMore: boolean; totalCount: number } {
  const db = getDb();
  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.search) {
    whereClause += ` AND (NAME LIKE ? OR ZYKLUS LIKE ? OR GROUPS LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (filters.group) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(GROUPS) WHERE value = ?)`;
    params.push(filters.group);
  }

  if (filters.language !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(LANGUAGE) WHERE value = ?)`;
    params.push(filters.language);
  }

  if (filters.fsk !== undefined) {
    whereClause += ` AND FSK = ?`;
    params.push(filters.fsk);
  }

  if (filters.format !== undefined) {
    whereClause += ` AND FORMAT = ?`;
    params.push(filters.format);
  }

  if (filters.score !== undefined) {
    whereClause += ` AND SCORE = ?`;
    params.push(filters.score);
  }

  if (filters.year !== undefined) {
    whereClause += ` AND MOVIEYEAR = ?`;
    params.push(filters.year);
  }

  if (filters.genre !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(GENRE) WHERE value = ?)`;
    params.push(filters.genre);
  }

  if (filters.animeseason) {
    whereClause += ` AND ANIMESEASON LIKE ?`;
    params.push(`%${filters.animeseason}%`);
  }

  if (filters.animestudio) {
    whereClause += ` AND ANIMESTUDIO LIKE ?`;
    params.push(`%${filters.animestudio}%`);
  }

  if (filters.version) {
    whereClause += ` AND SPECIALVERSION LIKE ?`;
    params.push(`%${filters.version}%`);
  }

  if (filters.tags !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(TAGS) WHERE value = ?)`;
    params.push(filters.tags);
  }

  if (authenticated && filters.viewed) {
    whereClause += movieViewedClause(filters.viewed);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM MOVIES ${whereClause}`;
  const totalCount = (db.prepare(countQuery).get(...params) as { count: number }).count;

  // Get paginated results
  const query = `SELECT * FROM MOVIES ${whereClause} ${movieOrderBy(filters.sort, authenticated)} LIMIT ? OFFSET ?`;
  const paginatedParams = [...params, PAGE_SIZE + 1, page * PAGE_SIZE];

  const rows = db.prepare(query).all(...paginatedParams) as MovieRow[];
  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);

  return {
    items: items.map((row) => movieRowToMediaItem(row, authenticated)),
    hasMore,
    totalCount
  };
}

export function getSeries(filters: FilterParams, page: number, authenticated = false): { items: MediaItem[]; hasMore: boolean; totalCount: number } {
  const db = getDb();
  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.search) {
    whereClause += ` AND (NAME LIKE ? OR GROUPS LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern);
  }

  if (filters.group) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(GROUPS) WHERE value = ?)`;
    params.push(filters.group);
  }

  if (filters.language !== undefined) {
    whereClause += ` AND EXISTS (
      SELECT 1 FROM SEASONS se
      JOIN EPISODES ep ON ep.SEASONID = se.LOCALID
      WHERE se.SERIESID = SERIES.LOCALID AND EXISTS (SELECT 1 FROM json_each(ep.LANGUAGE) WHERE value = ?)
    )`;
    params.push(filters.language);
  }

  if (filters.fsk !== undefined) {
    whereClause += ` AND FSK = ?`;
    params.push(filters.fsk);
  }

  if (filters.format !== undefined) {
    whereClause += ` AND EXISTS (
      SELECT 1 FROM SEASONS se
      JOIN EPISODES ep ON ep.SEASONID = se.LOCALID
      WHERE se.SERIESID = SERIES.LOCALID AND ep.FORMAT = ?
    )`;
    params.push(filters.format);
  }

  if (filters.score !== undefined) {
    whereClause += ` AND SCORE = ?`;
    params.push(filters.score);
  }

  if (filters.genre !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(GENRE) WHERE value = ?)`;
    params.push(filters.genre);
  }

  if (filters.animeseason) {
    whereClause += ` AND EXISTS (SELECT 1 FROM SEASONS se WHERE se.SERIESID = SERIES.LOCALID AND se.ANIMESEASON LIKE ?)`;
    params.push(`%${filters.animeseason}%`);
  }

  if (filters.animestudio) {
    whereClause += ` AND EXISTS (SELECT 1 FROM SEASONS se WHERE se.SERIESID = SERIES.LOCALID AND se.ANIMESTUDIO LIKE ?)`;
    params.push(`%${filters.animestudio}%`);
  }

  if (filters.version) {
    whereClause += ` AND SPECIALVERSION LIKE ?`;
    params.push(`%${filters.version}%`);
  }

  if (filters.tags !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(TAGS) WHERE value = ?)`;
    params.push(filters.tags);
  }

  if (authenticated && filters.viewed) {
    whereClause += seriesViewedClause(filters.viewed);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM SERIES ${whereClause}`;
  const totalCount = (db.prepare(countQuery).get(...params) as { count: number }).count;

  // Get paginated results
  const query = `SELECT * FROM SERIES ${whereClause} ${seriesOrderBy(filters.sort, authenticated)} LIMIT ? OFFSET ?`;
  const paginatedParams = [...params, PAGE_SIZE + 1, page * PAGE_SIZE];

  const rows = db.prepare(query).all(...paginatedParams) as SeriesRow[];
  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);

  // Get aggregated data for each series
  const seriesIds = items.map((s) => s.LOCALID);
  const aggregates = getSeriesAggregates(seriesIds, authenticated);

  return {
    items: items.map((row) => seriesRowToMediaItem(row, aggregates.get(row.LOCALID), authenticated)),
    hasMore,
    totalCount
  };
}

export function getAllMedia(filters: FilterParams, page: number, authenticated = false): { items: MediaItem[]; hasMore: boolean; totalCount: number } {
  if (filters.type === 'movie') {
    return getMovies(filters, page, authenticated);
  }
  if (filters.type === 'series') {
    return getSeries(filters, page, authenticated);
  }

  // Get both movies and series (all items, no pagination)
  const movies = getAllMoviesUnpaginated(filters, authenticated);
  const series = getAllSeriesUnpaginated(filters, authenticated);

  // Combine and sort according to the requested order (default: most recently added first)
  const all = [...movies, ...series];
  all.sort(buildComparator(filters.sort, authenticated));

  const start = page * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);
  const hasMore = all.length > start + PAGE_SIZE;
  const totalCount = all.length;

  return { items, hasMore, totalCount };
}

function getAllMoviesUnpaginated(filters: FilterParams, authenticated = false): MediaItem[] {
  const db = getDb();
  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.search) {
    whereClause += ` AND (NAME LIKE ? OR ZYKLUS LIKE ? OR GROUPS LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (filters.group) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(GROUPS) WHERE value = ?)`;
    params.push(filters.group);
  }

  if (filters.language !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(LANGUAGE) WHERE value = ?)`;
    params.push(filters.language);
  }

  if (filters.fsk !== undefined) {
    whereClause += ` AND FSK = ?`;
    params.push(filters.fsk);
  }

  if (filters.format !== undefined) {
    whereClause += ` AND FORMAT = ?`;
    params.push(filters.format);
  }

  if (filters.score !== undefined) {
    whereClause += ` AND SCORE = ?`;
    params.push(filters.score);
  }

  if (filters.year !== undefined) {
    whereClause += ` AND MOVIEYEAR = ?`;
    params.push(filters.year);
  }

  if (filters.genre !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(GENRE) WHERE value = ?)`;
    params.push(filters.genre);
  }

  if (filters.animeseason) {
    whereClause += ` AND ANIMESEASON LIKE ?`;
    params.push(`%${filters.animeseason}%`);
  }

  if (filters.animestudio) {
    whereClause += ` AND ANIMESTUDIO LIKE ?`;
    params.push(`%${filters.animestudio}%`);
  }

  if (filters.version) {
    whereClause += ` AND SPECIALVERSION LIKE ?`;
    params.push(`%${filters.version}%`);
  }

  if (filters.tags !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(TAGS) WHERE value = ?)`;
    params.push(filters.tags);
  }

  if (authenticated && filters.viewed) {
    whereClause += movieViewedClause(filters.viewed);
  }

  const query = `SELECT * FROM MOVIES ${whereClause} ORDER BY ADDDATE DESC`;
  const rows = db.prepare(query).all(...params) as MovieRow[];

  return rows.map((row) => movieRowToMediaItem(row, authenticated));
}

function getAllSeriesUnpaginated(filters: FilterParams, authenticated = false): MediaItem[] {
  const db = getDb();
  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.search) {
    whereClause += ` AND (NAME LIKE ? OR GROUPS LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern);
  }

  if (filters.group) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(GROUPS) WHERE value = ?)`;
    params.push(filters.group);
  }

  if (filters.language !== undefined) {
    whereClause += ` AND EXISTS (
      SELECT 1 FROM SEASONS se
      JOIN EPISODES ep ON ep.SEASONID = se.LOCALID
      WHERE se.SERIESID = SERIES.LOCALID AND EXISTS (SELECT 1 FROM json_each(ep.LANGUAGE) WHERE value = ?)
    )`;
    params.push(filters.language);
  }

  if (filters.fsk !== undefined) {
    whereClause += ` AND FSK = ?`;
    params.push(filters.fsk);
  }

  if (filters.format !== undefined) {
    whereClause += ` AND EXISTS (
      SELECT 1 FROM SEASONS se
      JOIN EPISODES ep ON ep.SEASONID = se.LOCALID
      WHERE se.SERIESID = SERIES.LOCALID AND ep.FORMAT = ?
    )`;
    params.push(filters.format);
  }

  if (filters.score !== undefined) {
    whereClause += ` AND SCORE = ?`;
    params.push(filters.score);
  }

  if (filters.genre !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(GENRE) WHERE value = ?)`;
    params.push(filters.genre);
  }

  if (filters.animeseason) {
    whereClause += ` AND EXISTS (SELECT 1 FROM SEASONS se WHERE se.SERIESID = SERIES.LOCALID AND se.ANIMESEASON LIKE ?)`;
    params.push(`%${filters.animeseason}%`);
  }

  if (filters.animestudio) {
    whereClause += ` AND EXISTS (SELECT 1 FROM SEASONS se WHERE se.SERIESID = SERIES.LOCALID AND se.ANIMESTUDIO LIKE ?)`;
    params.push(`%${filters.animestudio}%`);
  }

  if (filters.version) {
    whereClause += ` AND SPECIALVERSION LIKE ?`;
    params.push(`%${filters.version}%`);
  }

  if (filters.tags !== undefined) {
    whereClause += ` AND EXISTS (SELECT 1 FROM json_each(TAGS) WHERE value = ?)`;
    params.push(filters.tags);
  }

  if (authenticated && filters.viewed) {
    whereClause += seriesViewedClause(filters.viewed);
  }

  const query = `SELECT * FROM SERIES ${whereClause} ORDER BY NAME ASC`;
  const rows = db.prepare(query).all(...params) as SeriesRow[];

  // Get aggregated data for all series
  const seriesIds = rows.map((s) => s.LOCALID);
  const aggregates = getSeriesAggregates(seriesIds, authenticated);

  return rows.map((row) => seriesRowToMediaItem(row, aggregates.get(row.LOCALID), authenticated));
}

function getSeriesAggregates(seriesIds: number[], authenticated = false): Map<number, SeriesAggregate> {
  if (seriesIds.length === 0) return new Map();

  const db = getDb();
  const placeholders = seriesIds.map(() => '?').join(',');

  // Watch stats are only needed when authenticated. Compute them per-episode within the single
  // GROUP BY pass (O(episodes)); the old per-series subqueries re-scanned every episode for every
  // series (O(series × episodes)), which was the dominant cost on large libraries.
  const epMinWatch = `(SELECT MIN(je.value) FROM json_each(CASE WHEN json_valid(ep.VIEWED_HISTORY) THEN ep.VIEWED_HISTORY ELSE '[]' END) je WHERE je.value <> 'UNSPECIFIED' AND je.value <> '')`;
  const epMaxWatch = `(SELECT MAX(je.value) FROM json_each(CASE WHEN json_valid(ep.VIEWED_HISTORY) THEN ep.VIEWED_HISTORY ELSE '[]' END) je WHERE je.value <> 'UNSPECIFIED' AND je.value <> '')`;
  const watchCols = authenticated
    ? `,
      SUM(CASE WHEN ${epMinWatch} IS NOT NULL THEN 1 ELSE 0 END) as watchedCount,
      MIN(${epMinWatch}) as firstWatched,
      MAX(${epMaxWatch}) as lastWatched`
    : `,
      0 as watchedCount,
      NULL as firstWatched,
      NULL as lastWatched`;

  const query = `
    SELECT
      se.SERIESID,
      COUNT(DISTINCT se.LOCALID) as seasonCount,
      COUNT(ep.LOCALID) as episodeCount,
      SUM(ep.LENGTH) as totalLength,
      SUM(ep.FILESIZE) as totalFilesize,
      MIN(se.SEASONYEAR) as minYear,
      MAX(se.SEASONYEAR) as maxYear,
      GROUP_CONCAT(DISTINCT ep.LANGUAGE) as languages,
      GROUP_CONCAT(DISTINCT NULLIF(se.ANIMESEASON, '')) as animeSeasons,
      GROUP_CONCAT(DISTINCT NULLIF(se.ANIMESTUDIO, '')) as animeStudios,
      MAX(ep.ADDDATE) as lastAddDate${watchCols}
    FROM SEASONS se
    LEFT JOIN EPISODES ep ON ep.SEASONID = se.LOCALID
    WHERE se.SERIESID IN (${placeholders})
    GROUP BY se.SERIESID
  `;

  const rows = db.prepare(query).all(...seriesIds) as {
    SERIESID: number;
    seasonCount: number;
    episodeCount: number;
    watchedCount: number;
    firstWatched: string | null;
    lastWatched: string | null;
    totalLength: number;
    totalFilesize: number;
    minYear: number;
    maxYear: number;
    languages: string;
    animeSeasons: string;
    animeStudios: string;
    lastAddDate: string;
  }[];

  const result = new Map<number, SeriesAggregate>();
  for (const row of rows) {
    // Combine all per-episode language arrays (each ep.LANGUAGE is a JSON int array).
    // GROUP_CONCAT joins them with ',', so wrapping in [] yields a JSON array of arrays.
    const langSet = new Set<number>();
    if (row.languages) {
      try {
        const nested = JSON.parse(`[${row.languages}]`) as number[][];
        for (const arr of nested) for (const l of arr) langSet.add(l);
      } catch {
        // ignore malformed language aggregate
      }
    }

    result.set(row.SERIESID, {
      seasonCount: row.seasonCount || 0,
      episodeCount: row.episodeCount || 0,
      watchedCount: row.watchedCount || 0,
      firstWatched: row.firstWatched || undefined,
      lastWatched: row.lastWatched || undefined,
      totalLength: row.totalLength || 0,
      totalFilesize: row.totalFilesize || 0,
      yearRange: row.minYear === row.maxYear ? `${row.minYear}` : `${row.minYear}-${row.maxYear}`,
      languages: Array.from(langSet).sort((a, b) => a - b),
      // AnimeSeason/AnimeStudio moved from SERIES to SEASONS - aggregate (deduplicated) over all seasons
      animeSeason: flattenConcatJsonStrings(row.animeSeasons),
      animeStudio: flattenConcatJsonStrings(row.animeStudios),
      lastAddDate: row.lastAddDate || ''
    });
  }
  return result;
}

interface SeriesAggregate {
  seasonCount: number;
  episodeCount: number;
  watchedCount: number;
  firstWatched?: string;
  lastWatched?: string;
  totalLength: number;
  totalFilesize: number;
  yearRange: string;
  languages: number[];
  animeSeason: string[];
  animeStudio: string[];
  lastAddDate: string;
}

/**
 * Each season's ANIMESEASON/ANIMESTUDIO is a JSON string-array; GROUP_CONCAT joins them with ','.
 * Wrapping in [] yields a JSON array of arrays, which we flatten and deduplicate.
 */
function flattenConcatJsonStrings(concat: string | null): string[] {
  if (!concat) return [];
  const set = new Set<string>();
  try {
    const nested = JSON.parse(`[${concat}]`) as string[][];
    for (const arr of nested) for (const v of arr) if (v) set.add(v);
  } catch {
    // ignore malformed aggregate
  }
  return Array.from(set).sort();
}

function movieRowToMediaItem(row: MovieRow, authenticated = false): MediaItem {
  const item: MediaItem = {
    id: row.LOCALID,
    type: 'movie',
    name: row.NAME,
    coverId: row.COVERID,
    genres: parseIntArrayFromJson(row.GENRE),
    groups: parseJsonArraySafe(row.GROUPS),
    languages: parseIntArrayFromJson(row.LANGUAGE),
    score: row.SCORE,
    onlineScoreNum: row.ONLINESCORE_NUM,
    onlineScoreDenom: row.ONLINESCORE_DENOM,
    fsk: row.FSK,
    tags: parseIntArrayFromJson(row.TAGS),
    year: row.MOVIEYEAR,
    addDate: row.ADDDATE,
    onlineRef: row.ONLINEREF || '',
    zyklus: row.ZYKLUS || undefined,
    zyklusNumber: row.ZYKLUSNUMBER,
    format: row.FORMAT,
    length: row.LENGTH,
    filesize: row.FILESIZE,
    specialVersion: parseJsonArraySafe(row.SPECIALVERSION),
    animeSeason: parseJsonArraySafe(row.ANIMESEASON),
    animeStudio: parseJsonArraySafe(row.ANIMESTUDIO)
  };
  // viewedHistory is personal data — never include it in list items. getMovie() sets it
  // explicitly for the detail page, where the load function gates it behind authentication.
  if (authenticated) {
    const { viewed, history } = parseViewedHistory(row.VIEWED_HISTORY);
    if (viewed) {
      item.watchedState = 'full';
      const sorted = [...history].sort();
      item.firstWatched = sorted[0];
      item.lastWatched = sorted[sorted.length - 1];
    }
  }
  return item;
}

function seriesRowToMediaItem(row: SeriesRow, aggregate?: SeriesAggregate, authenticated = false): MediaItem {
  const item: MediaItem = {
    id: row.LOCALID,
    type: 'series',
    name: row.NAME,
    coverId: row.COVERID,
    genres: parseIntArrayFromJson(row.GENRE),
    groups: parseJsonArraySafe(row.GROUPS),
    languages: aggregate ? aggregate.languages : [],
    score: row.SCORE,
    onlineScoreNum: row.ONLINESCORE_NUM,
    onlineScoreDenom: row.ONLINESCORE_DENOM,
    fsk: row.FSK,
    tags: parseIntArrayFromJson(row.TAGS),
    year: aggregate ? parseInt(aggregate.yearRange.split('-')[0]) || 0 : 0,
    addDate: aggregate?.lastAddDate || '',
    onlineRef: row.ONLINEREF || '',
    episodeCount: aggregate?.episodeCount,
    seasonCount: aggregate?.seasonCount,
    totalLength: aggregate?.totalLength,
    totalFilesize: aggregate?.totalFilesize,
    specialVersion: parseJsonArraySafe(row.SPECIALVERSION),
    animeSeason: aggregate ? aggregate.animeSeason : [],
    animeStudio: aggregate ? aggregate.animeStudio : []
  };
  if (authenticated && aggregate) {
    if (aggregate.episodeCount > 0 && aggregate.watchedCount > 0) {
      item.watchedState = aggregate.watchedCount >= aggregate.episodeCount ? 'full' : 'partial';
    }
    if (aggregate.firstWatched) item.firstWatched = aggregate.firstWatched;
    if (aggregate.lastWatched) item.lastWatched = aggregate.lastWatched;
  }
  return item;
}

function parseIntArrayFromJson(value: string | null): number[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonArraySafe(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function numOrNull(value: unknown): number | null {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

function codecOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  return String(value);
}

/** Extract codec/technical info from a row's MEDIAINFO.* columns (SELECT * required). */
function extractMediaInfo(row: Record<string, unknown>): MediaInfo | null {
  const mi: MediaInfo = {
    vcodec: codecOrNull(row['MEDIAINFO.VCODEC']),
    acodec: codecOrNull(row['MEDIAINFO.ACODEC']),
    vformat: codecOrNull(row['MEDIAINFO.VFORMAT']),
    aformat: codecOrNull(row['MEDIAINFO.AFORMAT']),
    width: numOrNull(row['MEDIAINFO.WIDTH']),
    height: numOrNull(row['MEDIAINFO.HEIGHT']),
    framerate: numOrNull(row['MEDIAINFO.FRAMERATE']),
    duration: numOrNull(row['MEDIAINFO.DURATION']),
    bitdepth: numOrNull(row['MEDIAINFO.BITDEPTH']),
    bitrate: numOrNull(row['MEDIAINFO.BITRATE']),
    framecount: numOrNull(row['MEDIAINFO.FRAMECOUNT']),
    achannels: numOrNull(row['MEDIAINFO.ACHANNELS']),
    samplerate: numOrNull(row['MEDIAINFO.SAMPLERATE']),
    filesize: numOrNull(row['MEDIAINFO.FILESIZE'])
  };
  return Object.values(mi).some((v) => v !== null) ? mi : null;
}

/**
 * Parse a CHECKSUM_* column. Movies store a JSON array (one entry per part),
 * episodes store a single bare string. Both normalize to a string[].
 */
function parseChecksumField(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  const s = String(value).trim();
  if (s === '' || s === '[]') return [];
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed.map(String).filter((x) => x !== '') : [];
    } catch {
      return [];
    }
  }
  return [s];
}

function extractChecksums(row: Record<string, unknown>): Checksums {
  return {
    crc32: parseChecksumField(row['CHECKSUM_CRC32']),
    md5: parseChecksumField(row['CHECKSUM_MD5']),
    sha256: parseChecksumField(row['CHECKSUM_SHA256']),
    sha512: parseChecksumField(row['CHECKSUM_SHA512'])
  };
}

export function getCover(id: number): Buffer | null {
  const db = getDb();
  const row = db.prepare('SELECT PREVIEW FROM COVERS WHERE ID = ?').get(id) as { PREVIEW: Buffer } | undefined;
  return row?.PREVIEW || null;
}

export function getMovie(id: number): MediaItem | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM MOVIES WHERE LOCALID = ?').get(id) as MovieRow | undefined;
  if (!row) return null;
  const item = movieRowToMediaItem(row);
  const raw = row as unknown as Record<string, unknown>;
  item.mediaInfo = extractMediaInfo(raw);
  item.checksums = extractChecksums(raw);
  item.scoreComment = row.SCORECOMMENT ?? '';
  item.viewedHistory = row.VIEWED_HISTORY;
  return item;
}

export interface EpisodeDetail {
  id: number;
  seasonId: number;
  seriesId: number;
  seriesName: string;
  seasonName: string;
  seasonYear: number;
  episode: number;
  name: string;
  length: number;
  filesize: number;
  format: number;
  addDate: string;
  languages: number[];
  tags: number[];
  score: number;
  viewedHistory: string;
  scoreComment: string;
  mediaInfo: MediaInfo | null;
  checksums: Checksums;
}

export function getEpisode(id: number): EpisodeDetail | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT ep.*,
              se.NAME AS SEASON_NAME,
              se.SEASONYEAR AS SEASON_YEAR,
              se.SERIESID AS SERIES_ID,
              sr.NAME AS SERIES_NAME
       FROM EPISODES ep
       JOIN SEASONS se ON se.LOCALID = ep.SEASONID
       JOIN SERIES sr ON sr.LOCALID = se.SERIESID
       WHERE ep.LOCALID = ?`
    )
    .get(id) as
    | (EpisodeRow & { SEASON_NAME: string; SEASON_YEAR: number; SERIES_ID: number; SERIES_NAME: string })
    | undefined;
  if (!row) return null;

  const raw = row as unknown as Record<string, unknown>;
  return {
    id: row.LOCALID,
    seasonId: row.SEASONID,
    seriesId: row.SERIES_ID,
    seriesName: row.SERIES_NAME,
    seasonName: row.SEASON_NAME,
    seasonYear: row.SEASON_YEAR,
    episode: row.EPISODE,
    name: row.NAME,
    length: row.LENGTH,
    filesize: row.FILESIZE,
    format: row.FORMAT,
    addDate: row.ADDDATE,
    languages: parseIntArrayFromJson(row.LANGUAGE),
    tags: parseIntArrayFromJson(row.TAGS),
    score: row.SCORE,
    viewedHistory: row.VIEWED_HISTORY,
    scoreComment: row.SCORECOMMENT ?? '',
    mediaInfo: extractMediaInfo(raw),
    checksums: extractChecksums(raw)
  };
}

export function getSeriesById(id: number): MediaItem | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM SERIES WHERE LOCALID = ?').get(id) as SeriesRow | undefined;
  if (!row) return null;

  const aggregates = getSeriesAggregates([id]);
  const item = seriesRowToMediaItem(row, aggregates.get(id));
  item.scoreComment = row.SCORECOMMENT ?? '';
  return item;
}

export function getSeriesSeasons(seriesId: number): SeasonRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM SEASONS WHERE SERIESID = ? ORDER BY SEASONYEAR ASC, NAME ASC').all(seriesId) as SeasonRow[];
}

export function getSeasonEpisodes(seasonId: number): EpisodeRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM EPISODES WHERE SEASONID = ? ORDER BY EPISODE ASC').all(seasonId) as EpisodeRow[];
}

export function getGroups(): GroupRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM GROUPS ORDER BY ORDERING ASC').all() as GroupRow[];
}

export function getDistinctYears(): number[] {
  const db = getDb();
  const movieYears = db.prepare('SELECT DISTINCT MOVIEYEAR as year FROM MOVIES WHERE MOVIEYEAR > 0 ORDER BY MOVIEYEAR DESC').all() as { year: number }[];
  const seriesYears = db.prepare('SELECT DISTINCT SEASONYEAR as year FROM SEASONS WHERE SEASONYEAR > 0 ORDER BY SEASONYEAR DESC').all() as { year: number }[];

  const allYears = new Set([...movieYears.map((r) => r.year), ...seriesYears.map((r) => r.year)]);
  return Array.from(allYears).sort((a, b) => b - a);
}

export function getDistinctAnimeSeasons(): string[] {
  const db = getDb();
  const movieSeasons = db.prepare("SELECT DISTINCT ANIMESEASON FROM MOVIES WHERE ANIMESEASON IS NOT NULL AND ANIMESEASON != ''").all() as { ANIMESEASON: string }[];
  const seriesSeasons = db.prepare("SELECT DISTINCT ANIMESEASON FROM SEASONS WHERE ANIMESEASON IS NOT NULL AND ANIMESEASON != ''").all() as { ANIMESEASON: string }[];

  const all = new Set<string>();
  for (const row of [...movieSeasons, ...seriesSeasons]) {
    const parsed = parseJsonArraySafe(row.ANIMESEASON);
    for (const s of parsed) {
      all.add(s);
    }
  }
  return Array.from(all).sort();
}

export function getDistinctAnimeStudios(): string[] {
  const db = getDb();
  const movieStudios = db.prepare("SELECT DISTINCT ANIMESTUDIO FROM MOVIES WHERE ANIMESTUDIO IS NOT NULL AND ANIMESTUDIO != ''").all() as { ANIMESTUDIO: string }[];
  const seriesStudios = db.prepare("SELECT DISTINCT ANIMESTUDIO FROM SEASONS WHERE ANIMESTUDIO IS NOT NULL AND ANIMESTUDIO != ''").all() as { ANIMESTUDIO: string }[];

  const all = new Set<string>();
  for (const row of [...movieStudios, ...seriesStudios]) {
    const parsed = parseJsonArraySafe(row.ANIMESTUDIO);
    for (const s of parsed) {
      all.add(s);
    }
  }
  return Array.from(all).sort();
}

export function getDistinctVersions(): string[] {
  const db = getDb();
  const movieVersions = db.prepare("SELECT DISTINCT SPECIALVERSION FROM MOVIES WHERE SPECIALVERSION IS NOT NULL AND SPECIALVERSION != '' AND SPECIALVERSION != '[]'").all() as { SPECIALVERSION: string }[];
  const seriesVersions = db.prepare("SELECT DISTINCT SPECIALVERSION FROM SERIES WHERE SPECIALVERSION IS NOT NULL AND SPECIALVERSION != '' AND SPECIALVERSION != '[]'").all() as { SPECIALVERSION: string }[];

  const all = new Set<string>();
  for (const row of [...movieVersions, ...seriesVersions]) {
    const parsed = parseJsonArraySafe(row.SPECIALVERSION);
    for (const s of parsed) {
      all.add(s);
    }
  }
  return Array.from(all).sort();
}

export function getStats(): { movies: number; series: number; seasons: number; episodes: number } {
  const db = getDb();
  const movies = (db.prepare('SELECT COUNT(*) as count FROM MOVIES').get() as { count: number }).count;
  const series = (db.prepare('SELECT COUNT(*) as count FROM SERIES').get() as { count: number }).count;
  const seasons = (db.prepare('SELECT COUNT(*) as count FROM SEASONS').get() as { count: number }).count;
  const episodes = (db.prepare('SELECT COUNT(*) as count FROM EPISODES').get() as { count: number }).count;
  return { movies, series, seasons, episodes };
}
