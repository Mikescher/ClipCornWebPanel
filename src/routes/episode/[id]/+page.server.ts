import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getEpisode } from '$lib/server/queries';

export const load: PageServerLoad = async ({ params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw error(400, 'Invalid episode ID');
  }

  const episode = getEpisode(id);
  if (!episode) {
    throw error(404, 'Episode not found');
  }

  return { episode };
};
