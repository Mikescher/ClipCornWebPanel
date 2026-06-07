import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSeriesById, getSeriesSeasons, getSeasonEpisodes, type SeasonRow, type EpisodeRow } from '$lib/server/queries';

export interface SeasonWithEpisodes extends SeasonRow {
  episodes: EpisodeRow[];
  hasComment: boolean;
  comment: string | null;
}

export const load: PageServerLoad = async ({ params, locals }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw error(400, 'Invalid series ID');
  }

  const series = getSeriesById(id);
  if (!series) {
    throw error(404, 'Series not found');
  }

  const seriesComment = (series.scoreComment ?? '').trim();
  // Personal data must never reach unauthenticated clients.
  delete series.scoreComment;

  const seasons = getSeriesSeasons(id);
  const seasonsWithEpisodes: SeasonWithEpisodes[] = seasons.map((season) => {
    const seasonComment = (season.SCORECOMMENT ?? '').trim();
    return {
      ...season,
      SCORECOMMENT: '',
      hasComment: seasonComment.length > 0,
      comment: locals.authenticated ? seasonComment : null,
      episodes: getSeasonEpisodes(season.LOCALID).map((ep) =>
        // Personal data must never reach unauthenticated clients (the table doesn't render it anyway).
        locals.authenticated ? ep : { ...ep, VIEWED_HISTORY: '', SCORECOMMENT: '' }
      )
    };
  });

  return {
    series,
    seasons: seasonsWithEpisodes,
    authenticated: locals.authenticated,
    hasComment: seriesComment.length > 0,
    comment: locals.authenticated ? seriesComment : null
  };
};
