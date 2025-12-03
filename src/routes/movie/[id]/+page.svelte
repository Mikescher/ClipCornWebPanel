<script lang="ts">
  import type { PageData } from './$types';
  import { GENRES, LANGUAGES, FORMATS, FSK_RATINGS, TAGS } from '$lib/constants';
  import { toRoman, formatSize, formatLength, formatDate } from '$lib/utils/format';
  import { parseOnlineRefs, ONLINE_REF_NAMES } from '$lib/utils/onlineref';
  import CoverImage from '$lib/components/cards/CoverImage.svelte';
  import LanguageIcon from '$lib/components/icons/LanguageIcon.svelte';
  import FormatIcon from '$lib/components/icons/FormatIcon.svelte';
  import FskIcon from '$lib/components/icons/FskIcon.svelte';
  import StarsIcon from '$lib/components/icons/StarsIcon.svelte';
  import TagIcon from '$lib/components/icons/TagIcon.svelte';
  import OnlineRefIcon from '$lib/components/icons/OnlineRefIcon.svelte';

  let { data }: { data: PageData } = $props();
  const movie = data.movie;

  // Parse online references
  const onlineRefs = parseOnlineRefs(movie.onlineRef).filter((r) => r.url);

  // Build display title
  const displayTitle =
    movie.zyklus && movie.zyklusNumber && movie.zyklusNumber > 0
      ? `${movie.zyklus}${toRoman(movie.zyklusNumber)} - ${movie.name}`
      : movie.name;

  const genreNames = movie.genres.map((g) => (g < GENRES.length ? GENRES[g] : `Genre ${g}`));
</script>

<svelte:head>
  <title>{movie.name} - ClipCorn</title>
</svelte:head>

<div class="page">
  <header class="header">
    <a href="/" class="back-btn">← Back</a>
    <h1>{displayTitle}</h1>
  </header>

  <div class="content">
    <div class="cover-section">
      <div class="cover-wrapper">
        <CoverImage coverId={movie.coverId} alt={movie.name} />
      </div>
    </div>

    <div class="info-section">
      <!-- Basic Info -->
      <div class="info-group">
        <h2>Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Year</span>
            <span class="value">{movie.year || 'Unknown'}</span>
          </div>
          <div class="info-item">
            <span class="label">Length</span>
            <span class="value">{formatLength(movie.length || 0)}</span>
          </div>
          <div class="info-item">
            <span class="label">Size</span>
            <span class="value">{formatSize(movie.filesize || 0)}</span>
          </div>
          <div class="info-item">
            <span class="label">Added</span>
            <span class="value">{formatDate(movie.addDate)}</span>
          </div>
          <div class="info-item">
            <span class="label">Format</span>
            <span class="value">
              <FormatIcon format={movie.format || 0} />
              {FORMATS[movie.format || 0] || 'Unknown'}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Age Rating</span>
            <span class="value">
              <FskIcon fsk={movie.fsk} />
              {FSK_RATINGS[movie.fsk] || 'Unknown'}
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
              <StarsIcon num={movie.onlineScoreNum} denom={movie.onlineScoreDenom} />
              {movie.onlineScoreDenom > 0 ? Math.round((movie.onlineScoreNum / movie.onlineScoreDenom) * 100) : 0}%
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
      {#if movie.languages.length > 0}
        <div class="info-group">
          <h2>Languages</h2>
          <div class="icons-list">
            {#each movie.languages as lang}
              <span class="icon-with-label">
                <LanguageIcon language={lang} />
                {LANGUAGES[lang] || 'Unknown'}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Groups -->
      {#if movie.groups.length > 0}
        <div class="info-group">
          <h2>Groups</h2>
          <div class="tags-list">
            {#each movie.groups as group}
              <span class="tag group">{group}</span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Tags -->
      {#if movie.tags.length > 0}
        <div class="info-group">
          <h2>Tags</h2>
          <div class="icons-list">
            {#each movie.tags as tag}
              <span class="icon-with-label">
                <TagIcon {tag} />
                {TAGS[tag] || 'Unknown'}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Special Version -->
      {#if movie.specialVersion && movie.specialVersion.length > 0}
        <div class="info-group">
          <h2>Version</h2>
          <div class="tags-list">
            {#each movie.specialVersion as version}
              <span class="tag version">{version}</span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Anime Info -->
      {#if (movie.animeSeason && movie.animeSeason.length > 0) || (movie.animeStudio && movie.animeStudio.length > 0)}
        <div class="info-group">
          <h2>Anime Info</h2>
          {#if movie.animeSeason && movie.animeSeason.length > 0}
            <div class="info-item">
              <span class="label">Season</span>
              <span class="value">{movie.animeSeason.join(', ')}</span>
            </div>
          {/if}
          {#if movie.animeStudio && movie.animeStudio.length > 0}
            <div class="info-item">
              <span class="label">Studio</span>
              <span class="value">{movie.animeStudio.join(', ')}</span>
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

  .tag.version {
    background: #3b82f6;
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
  }
</style>
