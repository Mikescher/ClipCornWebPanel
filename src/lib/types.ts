/**
 * Shared types used by both server queries and client components.
 * Kept out of `$lib/server/*` so client components can import them.
 */

/** Codec / technical information extracted from the MEDIAINFO.* columns. */
export interface MediaInfo {
  vcodec: string | null;
  acodec: string | null;
  vformat: string | null;
  aformat: string | null;
  width: number | null;
  height: number | null;
  framerate: number | null;
  duration: number | null;
  bitdepth: number | null;
  bitrate: number | null;
  framecount: number | null;
  achannels: number | null;
  samplerate: number | null;
  filesize: number | null;
}

/**
 * File checksums. Each algorithm is an array because a movie can consist of
 * multiple parts (one checksum per part). Episodes have a single entry.
 */
export interface Checksums {
  crc32: string[];
  md5: string[];
  sha256: string[];
  sha512: string[];
}

export function hasMediaInfo(mi: MediaInfo | null | undefined): mi is MediaInfo {
  return !!mi && Object.values(mi).some((v) => v !== null);
}

export function hasChecksums(c: Checksums | null | undefined): c is Checksums {
  return !!c && (c.crc32.length > 0 || c.md5.length > 0 || c.sha256.length > 0 || c.sha512.length > 0);
}
