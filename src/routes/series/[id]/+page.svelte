<script lang="ts">
  import type { PageData } from './$types';
  import { GENRES, LANGUAGES, FORMATS, FSK_RATINGS, TAGS } from '$lib/constants';
  import { formatSize, formatLength, formatLengthShort } from '$lib/utils/format';
  import { parseOnlineRefs, ONLINE_REF_NAMES } from '$lib/utils/onlineref';
  import CoverImage from '$lib/components/cards/CoverImage.svelte';
  import LanguageIcon from '$lib/components/icons/LanguageIcon.svelte';
  import FormatIcon from '$lib/components/icons/FormatIcon.svelte';
  import FskIcon from '$lib/components/icons/FskIcon.svelte';
  import StarsIcon from '$lib/components/icons/StarsIcon.svelte';
  import TagIcon from '$lib/components/icons/TagIcon.svelte';
  import OnlineRefIcon from '$lib/components/icons/OnlineRefIcon.svelte';

  let { data }: { data: PageData } = $props();
  const series = data.series;
  const seasons = data.seasons;

  let selectedSeasonIndex = $state(0);
  const selectedSeason = $derived(seasons[selectedSeasonIndex]);

  const genreNames = series.genres.map((g) => (g < GENRES.length ? GENRES[g] : `Genre ${g}`));

  // Parse online references
  const onlineRefs = parseOnlineRefs(series.onlineRef).filter((r) => r.url);

  // Get all unique languages from episodes
  function getLanguagesFromBitmask(bitmask: number): number[] {
    const bits: number[] = [];
    for (let i = 0; i < 32; i++) {
      if ((bitmask & (1 << i)) !== 0) {
        bits.push(i);
      }
    }
    return bits;
  }
</script>

<svelte:head>
  <title>{series.name} - ClipCorn</title>
</svelte:head>

<div class="page">
  <header class="header">
    <a href="/" class="back-btn">← Back</a>
    <h1>{series.name}</h1>
  </header>

  <div class="content">
    <div class="cover-section">
      <div class="cover-wrapper">
        <CoverImage coverId={series.coverId} isSeries={true} alt={series.name} />
      </div>
    </div>

    <div class="info-section">
      <!-- Basic Info -->
      <div class="info-group">
        <h2>Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Seasons</span>
            <span class="value">{series.seasonCount || 0}</span>
          </div>
          <div class="info-item">
            <span class="label">Episodes</span>
            <span class="value">{series.episodeCount || 0}</span>
          </div>
          <div class="info-item">
            <span class="label">Total Length</span>
            <span class="value">{formatLength(series.totalLength || 0)}</span>
          </div>
          <div class="info-item">
            <span class="label">Total Size</span>
            <span class="value">{formatSize(series.totalFilesize || 0)}</span>
          </div>
          <div class="info-item">
            <span class="label">Age Rating</span>
            <span class="value">
              <FskIcon fsk={series.fsk} />
              {FSK_RATINGS[series.fsk] || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <!-- Ratings -->
      <div class="info-group">
        <h2>Ratings</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Online Score</span>
            <span class="value">
              <StarsIcon num={series.onlineScoreNum} denom={series.onlineScoreDenom} />
              {series.onlineScoreDenom > 0 ? Math.round((series.onlineScoreNum / series.onlineScoreDenom) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <!-- Genres -->
      {#if genreNames.length > 0}
        <div class="info-group">
          <h2>Genres</h2>
          <div class="tags-list">
            {#each genreNames as genre}
              <span class="tag">{genre}</span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Languages -->
      {#if series.languages.length > 0}
        <div class="info-group">
          <h2>Languages</h2>
          <div class="icons-list">
            {#each series.languages as lang}
              <span class="icon-with-label">
                <LanguageIcon language={lang} />
                {LANGUAGES[lang] || 'Unknown'}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Groups -->
      {#if series.groups.length > 0}
        <div class="info-group">
          <h2>Groups</h2>
          <div class="tags-list">
            {#each series.groups as group}
              <span class="tag group">{group}</span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Tags -->
      {#if series.tags.length > 0}
        <div class="info-group">
          <h2>Tags</h2>
          <div class="icons-list">
            {#each series.tags as tag}
              <span class="icon-with-label">
                <TagIcon {tag} />
                {TAGS[tag] || 'Unknown'}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Anime Info -->
      {#if (series.animeSeason && series.animeSeason.length > 0) || (series.animeStudio && series.animeStudio.length > 0)}
        <div class="info-group">
          <h2>Anime Info</h2>
          {#if series.animeSeason && series.animeSeason.length > 0}
            <div class="info-item">
              <span class="label">Season</span>
              <span class="value">{series.animeSeason.join(', ')}</span>
            </div>
          {/if}
          {#if series.animeStudio && series.animeStudio.length > 0}
            <div class="info-item">
              <span class="label">Studio</span>
              <span class="value">{series.animeStudio.join(', ')}</span>
            </div>
          {/if}
        </div>
      {/if}

      <!-- External Links -->
      {#if onlineRefs.length > 0}
        <div class="info-group">
          <h2>External Links</h2>
          <div class="external-links">
            {#each onlineRefs as ref}
              <a href={ref.url} class="ext-link" target="_blank" rel="noopener">
                <OnlineRefIcon identifier={ref.identifier} size={20} />
                <span class="ext-name">{ONLINE_REF_NAMES[ref.identifier] || ref.identifier}</span>
                {#if ref.description}
                  <span class="ext-desc">{ref.description}</span>
                {/if}
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Seasons & Episodes -->
  {#if seasons.length > 0}
    <div class="seasons-section">
      <h2>Seasons</h2>

      <div class="season-tabs">
        {#each seasons as season, i}
          <button class="season-tab" class:active={i === selectedSeasonIndex} onclick={() => (selectedSeasonIndex = i)}>
            {season.NAME || `Season ${i + 1}`}
            <span class="year">({season.SEASONYEAR})</span>
          </button>
        {/each}
      </div>

      {#if selectedSeason}
        <div class="episodes-table-container">
          <table class="episodes-table">
            <thead>
              <tr>
                <th class="col-ep">#</th>
                <th class="col-name">Name</th>
                <th class="col-length">Length</th>
                <th class="col-size">Size</th>
                <th class="col-lang">Lang</th>
                <th class="col-format">Format</th>
              </tr>
            </thead>
            <tbody>
              {#each selectedSeason.episodes as episode}
                {@const epLanguages = getLanguagesFromBitmask(episode.LANGUAGE)}
                <tr>
                  <td class="col-ep">{episode.EPISODE}</td>
                  <td class="col-name">{episode.NAME}</td>
                  <td class="col-length">{formatLengthShort(episode.LENGTH)}</td>
                  <td class="col-size">{formatSize(episode.FILESIZE)}</td>
                  <td class="col-lang">
                    {#each epLanguages.slice(0, 2) as lang}
                      <LanguageIcon language={lang} />
                    {/each}
                  </td>
                  <td class="col-format">
                    <FormatIcon format={episode.FORMAT} />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .page {
    min-height: 100vh;
    padding-bottom: 5rem;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #1c1c24;
    border-bottom: 1px solid #2a2a3a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .back-btn {
    padding: 0.5rem 1rem;
    background: #2a2a3a;
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 0.9rem;
    white-space: nowrap;
    transition: background 0.15s;
  }

  .back-btn:hover {
    background: #363648;
  }

  .header h1 {
    font-size: 1.1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .content {
    padding: 1rem;
  }

  .cover-section {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .cover-wrapper {
    width: 150px;
  }

  .cover-wrapper :global(.cover-container) {
    width: 100%;
  }

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .info-group h2 {
    font-size: 0.85rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #2a2a3a;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .value {
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    padding: 0.375rem 0.75rem;
    background: #2a2a3a;
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .tag.group {
    background: #363648;
  }

  .icons-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .icon-with-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.85rem;
  }

  .external-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .ext-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #2a2a3a;
    border-radius: 8px;
    color: #cbd5e1;
    transition: background 0.15s;
  }

  .ext-link:hover {
    background: #363648;
  }

  .ext-name {
    font-size: 0.85rem;
    font-weight: 500;
  }

  .ext-desc {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* Seasons Section */
  .seasons-section {
    padding: 1rem;
    border-top: 1px solid #2a2a3a;
    margin-top: 1rem;
  }

  .seasons-section h2 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .season-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .season-tab {
    padding: 0.5rem 1rem;
    background: #2a2a3a;
    border-radius: 8px;
    font-size: 0.85rem;
    transition: background 0.15s;
  }

  .season-tab:hover {
    background: #363648;
  }

  .season-tab.active {
    background: #3b82f6;
  }

  .season-tab .year {
    font-size: 0.75rem;
    opacity: 0.8;
    margin-left: 0.25rem;
  }

  .episodes-table-container {
    overflow-x: auto;
  }

  .episodes-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .episodes-table th,
  .episodes-table td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #2a2a3a;
  }

  .episodes-table th {
    font-weight: 600;
    color: #94a3b8;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .col-ep {
    width: 40px;
    text-align: center;
  }

  .col-name {
    min-width: 150px;
  }

  .col-length,
  .col-size,
  .col-lang,
  .col-format {
    width: 80px;
    white-space: nowrap;
  }

  /* Hide columns on mobile */
  @media (max-width: 640px) {
    .col-size,
    .col-format {
      display: none;
    }
  }

  @media (min-width: 640px) {
    .content {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 2rem;
      padding: 2rem;
    }

    .cover-section {
      margin-bottom: 0;
    }

    .cover-wrapper {
      width: 100%;
    }

    .info-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .seasons-section {
      padding: 2rem;
    }
  }
</style>
