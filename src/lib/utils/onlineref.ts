export interface OnlineRef {
  identifier: string;
  id: string;
  description?: string;
  url: string | null;
}

const URL_TEMPLATES: Record<string, string> = {
  imdb: 'https://www.imdb.com/title/{id}',
  tmdb: 'https://www.themoviedb.org/{id}',
  prox: 'https://proxer.me/info/{id}',
  myal: 'https://myanimelist.net/anime/{id}',
  anil: 'https://anilist.co/anime/{id}',
  anpl: 'https://www.anime-planet.com/anime/{id}',
  kisu: 'https://kitsu.io/anime/{id}',
  andb: 'https://anidb.net/anime/{id}'
};

export const ONLINE_REF_NAMES: Record<string, string> = {
  imdb: 'IMDB',
  tmdb: 'TMDB',
  amzn: 'Amazon',
  mvpt: 'Moviepilot',
  prox: 'Proxer',
  myal: 'MyAnimeList',
  anil: 'AniList',
  anpl: 'Anime-Planet',
  kisu: 'Kitsu',
  andb: 'AniDB',
  tvdb: 'TheTVDB',
  maze: 'TVMaze',
  wkde: 'Wikipedia (DE)',
  wken: 'Wikipedia (EN)',
  ofdb: 'OFDB'
};

function getOnlineRefUrl(identifier: string, id: string): string | null {
  const template = URL_TEMPLATES[identifier];
  if (!template) return null;
  return template.replace('{id}', id);
}

interface OnlineRefJson {
  t?: string;
  id?: string;
  d?: string;
}

export function parseOnlineRefs(onlineref: string): OnlineRef[] {
  if (!onlineref) return [];

  let entries: OnlineRefJson[];
  try {
    const parsed = JSON.parse(onlineref);
    entries = Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }

  const refs: OnlineRef[] = [];
  for (const entry of entries) {
    if (!entry || !entry.t || !entry.id) continue;

    const identifier = entry.t;
    const id = entry.id;

    refs.push({
      identifier,
      id,
      description: entry.d || undefined,
      url: getOnlineRefUrl(identifier, id)
    });
  }

  return refs;
}

export function getFirstRef(onlineref: string, identifier: string): OnlineRef | null {
  const refs = parseOnlineRefs(onlineref);
  return refs.find((r) => r.identifier === identifier && !r.description) ?? refs.find((r) => r.identifier === identifier) ?? null;
}
