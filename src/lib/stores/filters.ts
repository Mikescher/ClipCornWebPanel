import { writable, derived } from 'svelte/store';

export interface FilterState {
  search: string;
  group: string | null;
  genre: number | null;
  language: number | null;
  format: number | null;
  fsk: number | null;
  score: number | null;
  tags: number | null;
  year: number | null;
  type: 'movie' | 'series' | null;
  animeseason: string | null;
  animestudio: string | null;
  version: string | null;
}

export const defaultFilters: FilterState = {
  search: '',
  group: null,
  genre: null,
  language: null,
  format: null,
  fsk: null,
  score: null,
  tags: null,
  year: null,
  type: null,
  animeseason: null,
  animestudio: null,
  version: null
};

export const filters = writable<FilterState>({ ...defaultFilters });

export const activeFiltersCount = derived(filters, ($filters) => {
  let count = 0;
  if ($filters.search) count++;
  if ($filters.group !== null) count++;
  if ($filters.genre !== null) count++;
  if ($filters.language !== null) count++;
  if ($filters.format !== null) count++;
  if ($filters.fsk !== null) count++;
  if ($filters.score !== null) count++;
  if ($filters.tags !== null) count++;
  if ($filters.year !== null) count++;
  if ($filters.type !== null) count++;
  if ($filters.animeseason !== null) count++;
  if ($filters.animestudio !== null) count++;
  if ($filters.version !== null) count++;
  return count;
});

export function filtersToParams(f: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (f.search) params.set('search', f.search);
  if (f.group !== null) params.set('group', f.group);
  if (f.genre !== null) params.set('genre', f.genre.toString());
  if (f.language !== null) params.set('language', f.language.toString());
  if (f.format !== null) params.set('format', f.format.toString());
  if (f.fsk !== null) params.set('fsk', f.fsk.toString());
  if (f.score !== null) params.set('score', f.score.toString());
  if (f.tags !== null) params.set('tags', f.tags.toString());
  if (f.year !== null) params.set('year', f.year.toString());
  if (f.type !== null) params.set('type', f.type);
  if (f.animeseason !== null) params.set('animeseason', f.animeseason);
  if (f.animestudio !== null) params.set('animestudio', f.animestudio);
  if (f.version !== null) params.set('version', f.version);
  return params;
}

export function paramsToFilters(params: URLSearchParams): FilterState {
  return {
    search: params.get('search') || '',
    group: params.get('group'),
    genre: params.has('genre') ? parseInt(params.get('genre')!) : null,
    language: params.has('language') ? parseInt(params.get('language')!) : null,
    format: params.has('format') ? parseInt(params.get('format')!) : null,
    fsk: params.has('fsk') ? parseInt(params.get('fsk')!) : null,
    score: params.has('score') ? parseInt(params.get('score')!) : null,
    tags: params.has('tags') ? parseInt(params.get('tags')!) : null,
    year: params.has('year') ? parseInt(params.get('year')!) : null,
    type: (params.get('type') as 'movie' | 'series' | null) || null,
    animeseason: params.get('animeseason'),
    animestudio: params.get('animestudio'),
    version: params.get('version')
  };
}
