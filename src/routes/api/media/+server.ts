import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllMedia } from '$lib/server/queries';
import type { FilterParams } from '$lib/server/queries';

export const GET: RequestHandler = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '0');

  const filters: FilterParams = {
    search: url.searchParams.get('search') || undefined,
    group: url.searchParams.get('group') || undefined,
    genre: url.searchParams.has('genre') ? parseInt(url.searchParams.get('genre')!) : undefined,
    language: url.searchParams.has('language') ? parseInt(url.searchParams.get('language')!) : undefined,
    format: url.searchParams.has('format') ? parseInt(url.searchParams.get('format')!) : undefined,
    fsk: url.searchParams.has('fsk') ? parseInt(url.searchParams.get('fsk')!) : undefined,
    score: url.searchParams.has('score') ? parseInt(url.searchParams.get('score')!) : undefined,
    tags: url.searchParams.has('tags') ? parseInt(url.searchParams.get('tags')!) : undefined,
    year: url.searchParams.has('year') ? parseInt(url.searchParams.get('year')!) : undefined,
    type: (url.searchParams.get('type') as 'movie' | 'series' | undefined) || undefined,
    animeseason: url.searchParams.get('animeseason') || undefined,
    animestudio: url.searchParams.get('animestudio') || undefined,
    version: url.searchParams.get('version') || undefined
  };

  const { items, hasMore } = getAllMedia(filters, page);

  return json({ items, hasMore, page });
};
