import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSeriesById, getSeriesSeasons, getSeasonEpisodes } from '$lib/server/queries';

export const GET: RequestHandler = async ({ params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw error(400, 'Invalid series ID');
  }

  const series = getSeriesById(id);
  if (!series) {
    throw error(404, 'Series not found');
  }

  const seasons = getSeriesSeasons(id);
  const seasonsWithEpisodes = seasons.map((season) => {
    const episodes = getSeasonEpisodes(season.LOCALID);
    return {
      id: season.LOCALID,
      name: season.NAME,
      year: season.SEASONYEAR,
      coverId: season.COVERID,
      score: season.SCORE,
      episodes: episodes.map((ep) => ({
        id: ep.LOCALID,
        episode: ep.EPISODE,
        name: ep.NAME,
        viewedHistory: ep.VIEWED_HISTORY,
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
