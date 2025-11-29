/**
 * Extract individual bits as array of set bit positions
 */
export function getBits(value: number | bigint, maxBits = 32): number[] {
  const bits: number[] = [];
  const v = BigInt(value);
  for (let i = 0; i < maxBits; i++) {
    if ((v & (1n << BigInt(i))) !== 0n) {
      bits.push(i);
    }
  }
  return bits;
}

/**
 * Genre is stored as packed bytes (up to 8 genres)
 * Each byte represents one genre ID
 */
export function getGenres(value: bigint): number[] {
  const genres: number[] = [];
  let v = value;
  for (let i = 0; i < 8; i++) {
    const genre = Number(v & 0xffn);
    if (genre !== 0) genres.push(genre);
    v = v >> 8n;
  }
  return genres;
}

/**
 * Check if a specific bit is set
 */
export function hasBit(value: number | bigint, bit: number): boolean {
  return (BigInt(value) & (1n << BigInt(bit))) !== 0n;
}
