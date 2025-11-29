import sharp from 'sharp';

/**
 * Decode custom binary cover format to PNG
 *
 * Format:
 * - Byte 0: width
 * - Byte 1: height
 * - Bytes 2-49: 16-color RGB palette (3 bytes each, 48 bytes total)
 * - Remaining bytes: 4-bit indexed pixel data (2 pixels per byte, high nibble first)
 */
export async function decodeCover(buffer: Buffer): Promise<Buffer> {
  const width = buffer[0];
  const height = buffer[1];

  // Extract 16-color palette (RGB)
  const palette: [number, number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const offset = 2 + i * 3;
    palette.push([buffer[offset], buffer[offset + 1], buffer[offset + 2]]);
  }

  // Decode 4-bit indexed pixels
  const pixelDataOffset = 2 + 48; // 2 header + 48 palette
  const pixels = new Uint8Array(width * height * 4); // RGBA

  let pixelIndex = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const byteIndex = Math.floor(pixelIndex / 2);
      const isHighNibble = pixelIndex % 2 === 0;

      const byte = buffer[pixelDataOffset + byteIndex];
      // High nibble first (matches PHP: ($idx>>4)&0x0F for even, $idx&0x0F for odd)
      const colorIndex = isHighNibble ? (byte >> 4) & 0x0f : byte & 0x0f;

      const [r, g, b] = palette[colorIndex];
      const rgbaOffset = (y * width + x) * 4;
      pixels[rgbaOffset] = r;
      pixels[rgbaOffset + 1] = g;
      pixels[rgbaOffset + 2] = b;
      pixels[rgbaOffset + 3] = 255;

      pixelIndex++;
    }
  }

  return sharp(Buffer.from(pixels), {
    raw: { width, height, channels: 4 }
  })
    .png()
    .toBuffer();
}
