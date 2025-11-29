import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSeriesById, getSeriesSeasons, getSeasonEpisodes, type SeasonRow, type EpisodeRow } from '$lib/server/queries';

export interface SeasonWithEpisodes extends SeasonRow {
  episodes: EpisodeRow[];
}

export const load: PageServerLoad = async ({ params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw error(400, 'Invalid series ID');
  }

  const series = getSeriesById(id);
  if (!series) {
    throw error(404, 'Series not found');
  }

  const seasons = getSeriesSeasons(id);
  const seasonsWithEpisodes: SeasonWithEpisodes[] = seasons.map((season) => ({
    ...season,
    episodes: getSeasonEpisodes(season.LOCALID)
  }));

  return { series, seasons: seasonsWithEpisodes };
};
