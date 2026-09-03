import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSeriesById, getSeriesSeasons, getSeasonEpisodes } from '$lib/server/queries';
import { isValidId } from '$lib/utils/id';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!isValidId(params.id)) {
    throw error(400, 'Invalid series ID');
  }

  const series = getSeriesById(params.id);
  if (!series) {
    throw error(404, 'Series not found');
  }

  const seasons = getSeriesSeasons(params.id);
  const seasonsWithEpisodes = seasons.map((season) => {
    const episodes = getSeasonEpisodes(season.ID);
    return {
      id: season.ID,
      name: season.NAME,
      year: season.SEASONYEAR,
      coverId: season.COVERID,
      score: season.SCORE,
      episodes: episodes.map((ep) => ({
        id: ep.ID,
        episode: ep.EPISODE,
        name: ep.NAME,
        viewedHistory: locals.authenticated ? ep.VIEWED_HISTORY : '',
        length: ep.LENGTH,
        format: ep.FORMAT,
        filesize: ep.FILESIZE,
        addDate: ep.ADDDATE,
        language: ep.LANGUAGE,
        tags: ep.TAGS ? JSON.parse(ep.TAGS) : []
      }))
    };
  });

  return json({
    ...series,
    seasons: seasonsWithEpisodes
  });
};
