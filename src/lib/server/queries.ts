import { getDb } from './db';
import { PAGE_SIZE } from '$lib/constants';

export interface MovieRow {
  LOCALID: number;
  NAME: string;
  VIEWED_HISTORY: string;
  ZYKLUS: string;
  ZYKLUSNUMBER: number;
  LANGUAGE: number;
  SUBTITLES: string;
  GENRE: number;
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
  GENRE: number;
  ONLINESCORE_NUM: number;
  ONLINESCORE_DENOM: number;
  FSK: number;
  ONLINEREF: string;
  GROUPS: string;
  SCORE: number;
  SCORECOMMENT: string;
  COVERID: number;
  SPECIALVERSION: string | null;
  ANIMESEASON: string | null;
  ANIMESTUDIO: string | null;
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
  LANGUAGE: number;
  SUBTITLES: string;
  SCORE: number;
  SCORECOMMENT: number;
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
}

export function getMovies(filters: FilterParams, page: number): { items: MediaItem[]; hasMore: boolean } {
  const db = getDb();
  let query = 'SELECT * FROM MOVIES WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.search) {
    query += ` AND (NAME LIKE ? OR ZYKLUS LIKE ? OR GROUPS LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (filters.group) {
    query += ` AND (GROUPS = ? OR GROUPS LIKE ? OR GROUPS LIKE ? OR GROUPS LIKE ?)`;
    params.push(filters.group, `${filters.group};%`, `%;${filters.group}`, `%;${filters.group};%`);
  }

  if (filters.language !== undefined) {
    query += ` AND (LANGUAGE & ?) != 0`;
    params.push(1 << filters.language);
  }

  if (filters.fsk !== undefined) {
    query += ` AND FSK = ?`;
    params.push(filters.fsk);
  }

  if (filters.format !== undefined) {
    query += ` AND FORMAT = ?`;
    params.push(filters.format);
  }

  if (filters.score !== undefined) {
    query += ` AND SCORE = ?`;
    params.push(filters.score);
  }

  if (filters.year !== undefined) {
    query += ` AND MOVIEYEAR = ?`;
    params.push(filters.year);
  }

  if (filters.genre !== undefined) {
    // Genre is packed bytes, check if genre appears in any byte position
    let genreQuery = '(';
    for (let i = 0; i < 8; i++) {
      if (i > 0) genreQuery += ' OR ';
      genreQuery += `((GENRE >> ?) & 0xFF) = ?`;
      params.push(i * 8, filters.genre);
    }
    genreQuery += ')';
    query += ` AND ${genreQuery}`;
  }

  if (filters.animeseason) {
    query += ` AND ANIMESEASON LIKE ?`;
    params.push(`%${filters.animeseason}%`);
  }

  if (filters.animestudio) {
    query += ` AND ANIMESTUDIO LIKE ?`;
    params.push(`%${filters.animestudio}%`);
  }

  if (filters.version) {
    query += ` AND SPECIALVERSION LIKE ?`;
    params.push(`%${filters.version}%`);
  }

  query += ` ORDER BY ADDDATE DESC LIMIT ? OFFSET ?`;
  params.push(PAGE_SIZE + 1, page * PAGE_SIZE);

  const rows = db.prepare(query).all(...params) as MovieRow[];
  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);

  return {
    items: items.map((row) => movieRowToMediaItem(row)),
    hasMore
  };
}

export function getSeries(filters: FilterParams, page: number): { items: MediaItem[]; hasMore: boolean } {
  const db = getDb();
  let query = 'SELECT * FROM SERIES WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.search) {
    query += ` AND (NAME LIKE ? OR GROUPS LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern);
  }

  if (filters.group) {
    query += ` AND (GROUPS = ? OR GROUPS LIKE ? OR GROUPS LIKE ? OR GROUPS LIKE ?)`;
    params.push(filters.group, `${filters.group};%`, `%;${filters.group}`, `%;${filters.group};%`);
  }

  if (filters.fsk !== undefined) {
    query += ` AND FSK = ?`;
    params.push(filters.fsk);
  }

  if (filters.score !== undefined) {
    query += ` AND SCORE = ?`;
    params.push(filters.score);
  }

  if (filters.genre !== undefined) {
    let genreQuery = '(';
    for (let i = 0; i < 8; i++) {
      if (i > 0) genreQuery += ' OR ';
      genreQuery += `((GENRE >> ?) & 0xFF) = ?`;
      params.push(i * 8, filters.genre);
    }
    genreQuery += ')';
    query += ` AND ${genreQuery}`;
  }

  if (filters.animeseason) {
    query += ` AND ANIMESEASON LIKE ?`;
    params.push(`%${filters.animeseason}%`);
  }

  if (filters.animestudio) {
    query += ` AND ANIMESTUDIO LIKE ?`;
    params.push(`%${filters.animestudio}%`);
  }

  if (filters.version) {
    query += ` AND SPECIALVERSION LIKE ?`;
    params.push(`%${filters.version}%`);
  }

  query += ` ORDER BY NAME ASC LIMIT ? OFFSET ?`;
  params.push(PAGE_SIZE + 1, page * PAGE_SIZE);

  const rows = db.prepare(query).all(...params) as SeriesRow[];
  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);

  // Get aggregated data for each series
  const seriesIds = items.map((s) => s.LOCALID);
  const aggregates = getSeriesAggregates(seriesIds);

  return {
    items: items.map((row) => seriesRowToMediaItem(row, aggregates.get(row.LOCALID))),
    hasMore
  };
}

export function getAllMedia(filters: FilterParams, page: number): { items: MediaItem[]; hasMore: boolean } {
  if (filters.type === 'movie') {
    return getMovies(filters, page);
  }
  if (filters.type === 'series') {
    return getSeries(filters, page);
  }

  // Get both movies and series, interleaved by date
  const movies = getMovies(filters, 0);
  const series = getSeries(filters, 0);

  // Combine and sort by addDate (descending) or name
  const all = [...movies.items, ...series.items];
  all.sort((a, b) => {
    const dateA = a.addDate || '1970-01-01';
    const dateB = b.addDate || '1970-01-01';
    return dateB.localeCompare(dateA);
  });

  const start = page * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);
  const hasMore = all.length > start + PAGE_SIZE;

  return { items, hasMore };
}

function getSeriesAggregates(seriesIds: number[]): Map<number, SeriesAggregate> {
  if (seriesIds.length === 0) return new Map();

  const db = getDb();
  const placeholders = seriesIds.map(() => '?').join(',');

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
      MAX(ep.ADDDATE) as lastAddDate
    FROM SEASONS se
    LEFT JOIN EPISODES ep ON ep.SEASONID = se.LOCALID
    WHERE se.SERIESID IN (${placeholders})
    GROUP BY se.SERIESID
  `;

  const rows = db.prepare(query).all(...seriesIds) as {
    SERIESID: number;
    seasonCount: number;
    episodeCount: number;
    totalLength: number;
    totalFilesize: number;
    minYear: number;
    maxYear: number;
    languages: string;
    lastAddDate: string;
  }[];

  const result = new Map<number, SeriesAggregate>();
  for (const row of rows) {
    // Combine all language bitmasks
    const langStrings = row.languages?.split(',') || [];
    let combinedLang = 0;
    for (const l of langStrings) {
      combinedLang |= parseInt(l) || 0;
    }

    result.set(row.SERIESID, {
      seasonCount: row.seasonCount || 0,
      episodeCount: row.episodeCount || 0,
      totalLength: row.totalLength || 0,
      totalFilesize: row.totalFilesize || 0,
      yearRange: row.minYear === row.maxYear ? `${row.minYear}` : `${row.minYear}-${row.maxYear}`,
      languages: combinedLang,
      lastAddDate: row.lastAddDate || ''
    });
  }
  return result;
}

interface SeriesAggregate {
  seasonCount: number;
  episodeCount: number;
  totalLength: number;
  totalFilesize: number;
  yearRange: string;
  languages: number;
  lastAddDate: string;
}

function movieRowToMediaItem(row: MovieRow): MediaItem {
  return {
    id: row.LOCALID,
    type: 'movie',
    name: row.NAME,
    coverId: row.COVERID,
    genres: getGenresFromPacked(BigInt(row.GENRE)),
    groups: row.GROUPS ? row.GROUPS.split(';').filter((g) => g) : [],
    languages: getBitsFromNumber(row.LANGUAGE),
    score: row.SCORE,
    onlineScoreNum: row.ONLINESCORE_NUM,
    onlineScoreDenom: row.ONLINESCORE_DENOM,
    fsk: row.FSK,
    tags: parseTagsFromJson(row.TAGS),
    year: row.MOVIEYEAR,
    addDate: row.ADDDATE,
    zyklus: row.ZYKLUS || undefined,
    zyklusNumber: row.ZYKLUSNUMBER,
    format: row.FORMAT,
    length: row.LENGTH,
    filesize: row.FILESIZE,
    viewedHistory: row.VIEWED_HISTORY,
    specialVersion: parseJsonArraySafe(row.SPECIALVERSION),
    animeSeason: parseJsonArraySafe(row.ANIMESEASON),
    animeStudio: parseJsonArraySafe(row.ANIMESTUDIO)
  };
}

function seriesRowToMediaItem(row: SeriesRow, aggregate?: SeriesAggregate): MediaItem {
  return {
    id: row.LOCALID,
    type: 'series',
    name: row.NAME,
    coverId: row.COVERID,
    genres: getGenresFromPacked(BigInt(row.GENRE)),
    groups: row.GROUPS ? row.GROUPS.split(';').filter((g) => g) : [],
    languages: aggregate ? getBitsFromNumber(aggregate.languages) : [],
    score: row.SCORE,
    onlineScoreNum: row.ONLINESCORE_NUM,
    onlineScoreDenom: row.ONLINESCORE_DENOM,
    fsk: row.FSK,
    tags: parseTagsFromJson(row.TAGS),
    year: aggregate ? parseInt(aggregate.yearRange.split('-')[0]) || 0 : 0,
    addDate: aggregate?.lastAddDate || '',
    episodeCount: aggregate?.episodeCount,
    seasonCount: aggregate?.seasonCount,
    totalLength: aggregate?.totalLength,
    totalFilesize: aggregate?.totalFilesize,
    specialVersion: parseJsonArraySafe(row.SPECIALVERSION),
    animeSeason: parseJsonArraySafe(row.ANIMESEASON),
    animeStudio: parseJsonArraySafe(row.ANIMESTUDIO)
  };
}

function getGenresFromPacked(value: bigint): number[] {
  const genres: number[] = [];
  let v = value;
  for (let i = 0; i < 8; i++) {
    const genre = Number(v & 0xffn);
    if (genre !== 0) genres.push(genre);
    v = v >> 8n;
  }
  return genres;
}

function getBitsFromNumber(value: number): number[] {
  const bits: number[] = [];
  for (let i = 0; i < 32; i++) {
    if ((value & (1 << i)) !== 0) {
      bits.push(i);
    }
  }
  return bits;
}

function parseTagsFromJson(value: string | null): number[] {
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

export function getCover(id: number): Buffer | null {
  const db = getDb();
  const row = db.prepare('SELECT PREVIEW FROM COVERS WHERE ID = ?').get(id) as { PREVIEW: Buffer } | undefined;
  return row?.PREVIEW || null;
}

export function getMovie(id: number): MediaItem | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM MOVIES WHERE LOCALID = ?').get(id) as MovieRow | undefined;
  if (!row) return null;
  return movieRowToMediaItem(row);
}

export function getSeriesById(id: number): MediaItem | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM SERIES WHERE LOCALID = ?').get(id) as SeriesRow | undefined;
  if (!row) return null;

  const aggregates = getSeriesAggregates([id]);
  return seriesRowToMediaItem(row, aggregates.get(id));
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
  return db.prepare('SELECT * FROM GROUPS WHERE VISIBLE = 1 ORDER BY ORDERING ASC').all() as GroupRow[];
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
  const seriesSeasons = db.prepare("SELECT DISTINCT ANIMESEASON FROM SERIES WHERE ANIMESEASON IS NOT NULL AND ANIMESEASON != ''").all() as { ANIMESEASON: string }[];

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
  const seriesStudios = db.prepare("SELECT DISTINCT ANIMESTUDIO FROM SERIES WHERE ANIMESTUDIO IS NOT NULL AND ANIMESTUDIO != ''").all() as { ANIMESTUDIO: string }[];

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
