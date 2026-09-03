import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMovie } from '$lib/server/queries';
import { parseViewedHistory } from '$lib/utils/format';
import { isValidId } from '$lib/utils/id';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!isValidId(params.id)) {
    throw error(400, 'Invalid movie ID');
  }

  const movie = getMovie(params.id);
  if (!movie) {
    throw error(404, 'Movie not found');
  }

  const comment = (movie.scoreComment ?? '').trim();
  const { history } = parseViewedHistory(movie.viewedHistory ?? '');

  // Personal data must never reach unauthenticated clients — strip it from the payload.
  delete movie.scoreComment;
  delete movie.viewedHistory;

  return {
    movie,
    authenticated: locals.authenticated,
    hasComment: comment.length > 0,
    comment: locals.authenticated ? comment : null,
    viewedHistory: locals.authenticated ? history : null
  };
};
