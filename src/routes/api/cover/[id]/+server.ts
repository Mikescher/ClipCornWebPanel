import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCover } from '$lib/server/queries';
import { decodeCover } from '$lib/server/cover-decoder';
import { isValidId } from '$lib/utils/id';

export const GET: RequestHandler = async ({ params }) => {
  if (!isValidId(params.id)) {
    throw error(400, 'Invalid cover ID');
  }

  const coverData = getCover(params.id);
  if (!coverData) {
    throw error(404, 'Cover not found');
  }

  try {
    const png = await decodeCover(coverData);
    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (e) {
    console.error('Error decoding cover:', e);
    throw error(500, 'Failed to decode cover');
  }
};
