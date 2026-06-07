import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getEpisode } from '$lib/server/queries';
import { parseViewedHistory } from '$lib/utils/format';

export const load: PageServerLoad = async ({ params, locals }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw error(400, 'Invalid episode ID');
  }

  const episode = getEpisode(id);
  if (!episode) {
    throw error(404, 'Episode not found');
  }

  const comment = (episode.scoreComment ?? '').trim();
  const { history } = parseViewedHistory(episode.viewedHistory ?? '');

  // Personal data must never reach unauthenticated clients — drop it from the payload.
  const { scoreComment: _scoreComment, viewedHistory: _viewedHistory, ...safeEpisode } = episode;

  return {
    episode: safeEpisode,
    authenticated: locals.authenticated,
    hasComment: comment.length > 0,
    comment: locals.authenticated ? comment : null,
    viewedHistory: locals.authenticated ? history : null
  };
};
