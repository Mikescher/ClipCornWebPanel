import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMovie } from '$lib/server/queries';

export const load: PageServerLoad = async ({ params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw error(400, 'Invalid movie ID');
  }

  const movie = getMovie(id);
  if (!movie) {
    throw error(404, 'Movie not found');
  }

  return { movie };
};
