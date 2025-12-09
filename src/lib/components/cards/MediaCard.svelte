<script lang="ts">
  import type { MediaItem } from '$lib/server/queries';
  import { GENRES } from '$lib/constants';
  import { toRoman, formatSize, formatLengthShort } from '$lib/utils/format';
  import { getFirstRef } from '$lib/utils/onlineref';
  import { showViewedData } from '$lib/stores/ui';
  import CoverImage from './CoverImage.svelte';
  import LanguageIcon from '../icons/LanguageIcon.svelte';
  import FormatIcon from '../icons/FormatIcon.svelte';
  import FskIcon from '../icons/FskIcon.svelte';
  import ScoreIcon from '../icons/ScoreIcon.svelte';
  import StarsIcon from '../icons/StarsIcon.svelte';
  import OnlineRefIcon from '../icons/OnlineRefIcon.svelte';

  let { item }: { item: MediaItem } = $props();

  // Get first refs for external links
  const tmdbRef = $derived(getFirstRef(item.onlineRef, 'tmdb'));
  const imdbRef = $derived(getFirstRef(item.onlineRef, 'imdb'));
  const malRef = $derived(getFirstRef(item.onlineRef, 'myal'));
  const anidbRef = $derived(getFirstRef(item.onlineRef, 'andb'));

  const href = $derived(item.type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`);

  // Build display title
  const displayTitle = $derived(
    item.zyklus && item.zyklusNumber && item.zyklusNumber > 0
      ? `${item.zyklus} ${toRoman(item.zyklusNumber)} - ${item.name}`
      : item.name
  );

  // Get genre names
  const genreNames = $derived(item.genres.map((g) => (g < GENRES.length ? GENRES[g] : `Genre ${g}`)).slice(0, 3));

  // Length and size display
  const lengthDisplay = item.type === 'movie' ? formatLengthShort(item.length || 0) : formatLengthShort(item.totalLength || 0);
  const sizeDisplay = formatSize(item.type === 'movie' ? (item.filesize || 0) : (item.totalFilesize || 0));

  // Episode count for series
  const episodeInfo = item.type === 'series' ? `${item.episodeCount} ep` : null;
</script>

<a {href} class="card">
  <CoverImage coverId={item.coverId} isSeries={item.type === 'series'} alt={item.name} />

  <div class="content">
    <div class="header">
      <h3 class="title">{displayTitle}</h3>
      {#if item.groups.length > 0}
        <span class="groups">{item.groups.join(', ')}</span>
      {/if}
    </div>

    <div class="meta">
      <span class="year">{item.year || '?'}</span>
      {#if episodeInfo}
        <span class="episodes">{episodeInfo}</span>
      {/if}
      <span class="length">{lengthDisplay}</span>
      <span class="size">{sizeDisplay}</span>
    </div>

    <div class="genres">
      {#each genreNames as genre}
        <span class="genre">{genre}</span>
      {/each}
    </div>

    {#if tmdbRef?.url || imdbRef?.url || malRef?.url || anidbRef?.url}
      <div class="external-links">
        {#if tmdbRef?.url}
          <button type="button" class="ext-btn" onclick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(tmdbRef.url!, '_blank'); }}>
            <OnlineRefIcon identifier="tmdb" size={20} />
          </button>
        {/if}
        {#if imdbRef?.url}
          <button type="button" class="ext-btn" onclick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(imdbRef.url!, '_blank'); }}>
            <OnlineRefIcon identifier="imdb" size={20} />
          </button>
        {/if}
        {#if malRef?.url}
          <button type="button" class="ext-btn" onclick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(malRef.url!, '_blank'); }}>
            <OnlineRefIcon identifier="myal" size={20} />
          </button>
        {/if}
        {#if anidbRef?.url}
          <button type="button" class="ext-btn" onclick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(anidbRef.url!, '_blank'); }}>
            <OnlineRefIcon identifier="andb" size={20} />
          </button>
        {/if}
      </div>
    {/if}
  </div>

  <div class="icons">
    <div class="icons-row">
      {#each item.languages.slice(0, 3) as lang}
        <LanguageIcon language={lang} />
      {/each}
      {#if item.languages.length > 3}
        <span class="more">+{item.languages.length - 3}</span>
      {/if}
    </div>
    <div class="icons-row">
      {#if item.type === 'movie' && item.format !== undefined}
        <FormatIcon format={item.format} />
      {/if}
      <FskIcon fsk={item.fsk} />
    </div>
    <div class="icons-row">
      {#if $showViewedData && item.score !== 6}
        <ScoreIcon score={item.score} />
      {/if}
    </div>
    <div class="stars-bottom">
      <StarsIcon num={item.onlineScoreNum} denom={item.onlineScoreDenom} />
    </div>
  </div>
</a>

<style>
  .card {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #1c1c24;
    border: 1px solid #2a2a3a;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: background 0.15s, box-shadow 0.15s;
  }

  .card:hover {
    background: #252530;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .title {
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .groups {
    font-size: 0.75rem;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #94a3b8;
    flex-wrap: wrap;
  }

  .genres {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .genre {
    font-size: 0.65rem;
    padding: 0.125rem 0.375rem;
    background: #2a2a3a;
    border-radius: 4px;
    color: #cbd5e1;
  }

  .external-links {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
    padding-top: 0.25rem;
  }

  .ext-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #2a2a3a;
    border: none;
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .ext-btn:hover {
    background: #363648;
    color: #cbd5e1;
  }

  .icons {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-end;
  }

  .icons-row {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .more {
    font-size: 0.65rem;
    color: #94a3b8;
  }

  .stars-bottom {
    margin-top: auto;
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .card {
      grid-template-columns: 60px 1fr auto;
      gap: 0.5rem;
    }

    .title {
      font-size: 0.85rem;
    }

    .meta {
      font-size: 0.7rem;
    }

    .genres {
      display: none;
    }
  }
</style>
