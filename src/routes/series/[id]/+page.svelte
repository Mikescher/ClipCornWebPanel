<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { GENRES, LANGUAGES, FORMATS, FSK_RATINGS, TAGS } from '$lib/constants';
  import { formatSize, formatLength, formatLengthShort, parseViewedHistory } from '$lib/utils/format';
  import { parseOnlineRefs, ONLINE_REF_NAMES } from '$lib/utils/onlineref';
  import CoverImage from '$lib/components/cards/CoverImage.svelte';
  import WatchedEye from '$lib/components/icons/WatchedEye.svelte';
  import LanguageIcon from '$lib/components/icons/LanguageIcon.svelte';
  import FormatIcon from '$lib/components/icons/FormatIcon.svelte';
  import FskIcon from '$lib/components/icons/FskIcon.svelte';
  import StarsIcon from '$lib/components/icons/StarsIcon.svelte';
  import ScoreIcon from '$lib/components/icons/ScoreIcon.svelte';
  import TagIcon from '$lib/components/icons/TagIcon.svelte';
  import OnlineRefIcon from '$lib/components/icons/OnlineRefIcon.svelte';

  let { data }: { data: PageData } = $props();
  const series = data.series;
  // Sort the season list by title (numeric-aware so "Season 2" precedes "Season 10")
  const seasons = [...data.seasons].sort((a, b) =>
    (a.NAME || '').localeCompare(b.NAME || '', undefined, { numeric: true, sensitivity: 'base' })
  );

  let selectedSeasonIndex = $state(0);
  const selectedSeason = $derived(seasons[selectedSeasonIndex]);

  const genreNames = series.genres.map((g) => (g < GENRES.length ? GENRES[g] : `Genre ${g}`));

  // Parse online references (series-level, then per-season)
  const onlineRefs = parseOnlineRefs(series.onlineRef).filter((r) => r.url);
  const seasonOnlineRefs = seasons
    .map((s) => ({ name: s.NAME, refs: parseOnlineRefs(s.ONLINEREF).filter((r) => r.url) }))
    .filter((s) => s.refs.length > 0);

  // Whether an episode has been watched (VIEWED_HISTORY only sent when authenticated)
  function isEpisodeWatched(value: string): boolean {
    return parseViewedHistory(value).viewed;
  }

  // Parse the per-episode language list (JSON int array)
  function getEpisodeLanguages(value: string): number[] {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
</script>

<svelte:head>
  <title>{series.name} - ClipCorn</title>
</svelte:head>

<div class="page">
  <header class="header">
    <button type="button" class="back-btn" onclick={() => history.back()}>← Back</button>
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
      {#if onlineRefs.length > 0 || seasonOnlineRefs.length > 0}
        <div class="info-group">
          <h2>External Links</h2>
          {#if onlineRefs.length > 0}
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
          {/if}
          {#each seasonOnlineRefs as season}
            <div class="ext-season-row">
              <span class="ext-season-label">{season.name}</span>
              <div class="external-links">
                {#each season.refs as ref}
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
          {/each}
        </div>
      {/if}

      <!-- Comment -->
      {#if data.hasComment}
        <div class="info-group">
          <h2>Comment</h2>
          {#if data.authenticated && data.comment}
            <p class="comment">{data.comment}</p>
          {:else}
            <p class="comment blurred" aria-hidden="true">
              A personal rating note exists for this show. Unlock to read it.
            </p>
          {/if}
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
            <span class="season-cover">
              <CoverImage coverId={season.COVERID} alt={season.NAME || `Season ${i + 1}`} />
            </span>
            <span class="season-label">
              {season.NAME || `Season ${i + 1}`}
              <span class="year">({season.SEASONYEAR})</span>
            </span>
          </button>
        {/each}
      </div>

      {#if selectedSeason}
        {#if selectedSeason.hasComment}
          <div class="season-comment">
            {#if data.authenticated && selectedSeason.comment}
              <p class="comment">{selectedSeason.comment}</p>
            {:else}
              <p class="comment blurred" aria-hidden="true">
                A personal note exists for this season. Unlock to read it.
              </p>
            {/if}
          </div>
        {/if}

        <div class="episodes-table-container">
          <table class="episodes-table">
            <thead>
              <tr>
                <th class="col-ep">#</th>
                {#if data.authenticated}
                  <th class="col-viewed" aria-label="Viewed"></th>
                {/if}
                <th class="col-name">Name</th>
                {#if data.authenticated}
                  <th class="col-rating">Rating</th>
                {/if}
                <th class="col-length">Length</th>
                <th class="col-size">Size</th>
                <th class="col-lang">Lang</th>
                <th class="col-format">Format</th>
              </tr>
            </thead>
            <tbody>
              {#each selectedSeason.episodes as episode}
                {@const epLanguages = getEpisodeLanguages(episode.LANGUAGE)}
                <tr
                  class="clickable"
                  role="link"
                  tabindex="0"
                  onclick={() => goto(`/episode/${episode.LOCALID}`)}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      goto(`/episode/${episode.LOCALID}`);
                    }
                  }}
                >
                  <td class="col-ep">{episode.EPISODE}</td>
                  {#if data.authenticated}
                    <td class="col-viewed">
                      {#if isEpisodeWatched(episode.VIEWED_HISTORY)}
                        <WatchedEye badge={false} size={15} idSuffix={`ep${episode.LOCALID}`} />
                      {/if}
                    </td>
                  {/if}
                  <td class="col-name">{episode.NAME}</td>
                  {#if data.authenticated}
                    <td class="col-rating">
                      {#if episode.SCORE !== 6}
                        <ScoreIcon score={episode.SCORE} />
                      {/if}
                      {#if episode.SCORECOMMENT && episode.SCORECOMMENT.trim()}
                        <img src="/icons/score/comment.png" alt="Comment" title="Comment" class="comment-icon" />
                      {/if}
                    </td>
                  {/if}
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
    border: none;
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 0.9rem;
    white-space: nowrap;
    cursor: pointer;
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

  .comment {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #cbd5e1;
    white-space: pre-wrap;
  }

  .comment.blurred {
    filter: blur(5px);
    user-select: none;
    pointer-events: none;
    color: #94a3b8;
  }

  .season-comment {
    margin-bottom: 1rem;
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

  .ext-season-row {
    margin-top: 0.75rem;
  }

  .ext-season-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    margin-bottom: 0.4rem;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 110px;
    padding: 0.5rem;
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

  .season-cover {
    width: 90px;
    display: block;
  }

  .season-cover :global(.cover-container) {
    width: 100%;
  }

  .season-label {
    display: block;
    text-align: center;
    line-height: 1.3;
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

  .episodes-table tbody tr.clickable {
    cursor: pointer;
    transition: background 0.15s;
  }

  .episodes-table tbody tr.clickable:hover {
    background: #232331;
  }

  .episodes-table tbody tr.clickable:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }

  .col-ep {
    width: 40px;
    text-align: center;
  }

  .col-name {
    min-width: 150px;
  }

  .col-viewed {
    width: 24px;
    padding-left: 0;
    padding-right: 0;
    text-align: center;
    color: #94a3b8;
  }

  .col-viewed :global(.plain) {
    vertical-align: middle;
  }

  .col-length,
  .col-size,
  .col-lang,
  .col-format {
    width: 80px;
    white-space: nowrap;
  }

  .col-rating {
    width: 56px;
    white-space: nowrap;
  }

  .col-rating .comment-icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
    margin-left: 0.25rem;
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
