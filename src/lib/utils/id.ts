/**
 * Database ids are UUIDs (v7, canonical lowercase 36-char form) since the database split.
 * The nil UUID replaces the old `-1` sentinel and means "no cover".
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const NO_COVER_ID = '00000000-0000-0000-0000-000000000000';

export function isValidId(value: string | undefined | null): value is string {
  return !!value && UUID_PATTERN.test(value);
}
