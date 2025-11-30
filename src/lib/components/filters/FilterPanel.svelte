<script lang="ts">
  import { filterPanelOpen } from '$lib/stores/ui';
  import { filters, defaultFilters, activeFiltersCount } from '$lib/stores/filters';
  import { LANGUAGES, FSK_RATINGS, FORMATS, TAGS, SCORES, GENRES } from '$lib/constants';
  import type { GroupRow } from '$lib/server/queries';

  let {
    groups,
    years,
    animeSeasons,
    animeStudios,
    versions
  }: {
    groups: GroupRow[];
    years: number[];
    animeSeasons: string[];
    animeStudios: string[];
    versions: string[];
  } = $props();

  function clearFilters() {
    filters.set({ ...defaultFilters });
  }

  function closePanel() {
    filterPanelOpen.set(false);
  }

  // Filter out NO_GENRE and only show used genres
  const displayGenres = GENRES.slice(1);
</script>

<div class="backdrop" class:open={$filterPanelOpen} onclick={closePanel} onkeydown={(e) => e.key === 'Escape' && closePanel()} role="button" tabindex="-1"></div>

<div class="panel" class:open={$filterPanelOpen}>
  <div class="panel-header">
    <h2>Filters</h2>
    {#if $activeFiltersCount > 0}
      <button class="clear-btn" onclick={clearFilters}>Clear ({$activeFiltersCount})</button>
    {/if}
    <button class="close-btn" onclick={closePanel}>×</button>
  </div>

  <div class="panel-content">
    <!-- Type Filter -->
    <div class="filter-group">
      <h3>Type</h3>
      <div class="options">
        <label class:active={$filters.type === null}>
          <input type="radio" name="type" checked={$filters.type === null} onchange={() => filters.update((f) => ({ ...f, type: null }))} />
          All
        </label>
        <label class:active={$filters.type === 'movie'}>
          <input type="radio" name="type" checked={$filters.type === 'movie'} onchange={() => filters.update((f) => ({ ...f, type: 'movie' }))} />
          Movies
        </label>
        <label class:active={$filters.type === 'series'}>
          <input type="radio" name="type" checked={$filters.type === 'series'} onchange={() => filters.update((f) => ({ ...f, type: 'series' }))} />
          Series
        </label>
      </div>
    </div>

    <!-- Groups Filter -->
    {#if groups.length > 0}
      <div class="filter-group">
        <h3>Group</h3>
        <select bind:value={$filters.group} onchange={() => filters.update((f) => ({ ...f, group: f.group || null }))}>
          <option value={null}>All Groups</option>
          {#each groups as group}
            <option value={group.NAME} style="color: {group.COLOR}">{group.NAME}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Genre Filter -->
    <div class="filter-group">
      <h3>Genre</h3>
      <select bind:value={$filters.genre}>
        <option value={null}>All Genres</option>
        {#each displayGenres as genre, i}
          <option value={i + 1}>{genre}</option>
        {/each}
      </select>
    </div>

    <!-- Language Filter -->
    <div class="filter-group">
      <h3>Language</h3>
      <select bind:value={$filters.language}>
        <option value={null}>All Languages</option>
        {#each LANGUAGES as lang, i}
          <option value={i}>{lang}</option>
        {/each}
      </select>
    </div>

    <!-- Format Filter (Movies only) -->
    <div class="filter-group">
      <h3>Format</h3>
      <select bind:value={$filters.format}>
        <option value={null}>All Formats</option>
        {#each FORMATS as fmt, i}
          <option value={i}>{fmt}</option>
        {/each}
      </select>
    </div>

    <!-- FSK Filter -->
    <div class="filter-group">
      <h3>Age Rating</h3>
      <select bind:value={$filters.fsk}>
        <option value={null}>All Ratings</option>
        {#each FSK_RATINGS as fsk, i}
          <option value={i}>{fsk}</option>
        {/each}
      </select>
    </div>

    <!-- Score Filter -->
    <div class="filter-group">
      <h3>User Score</h3>
      <select bind:value={$filters.score}>
        <option value={null}>All Scores</option>
        {#each SCORES as score, i}
          {#if i !== 6}
            <option value={i}>{score}</option>
          {/if}
        {/each}
      </select>
    </div>

    <!-- Tags Filter -->
    <div class="filter-group">
      <h3>Tags</h3>
      <select bind:value={$filters.tags}>
        <option value={null}>All Tags</option>
        {#each TAGS as tag, i}
          <option value={i}>{tag}</option>
        {/each}
      </select>
    </div>

    <!-- Year Filter -->
    {#if years.length > 0}
      <div class="filter-group">
        <h3>Year</h3>
        <select bind:value={$filters.year}>
          <option value={null}>All Years</option>
          {#each years as year}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Anime Season Filter -->
    {#if animeSeasons.length > 0}
      <div class="filter-group">
        <h3>Anime Season</h3>
        <select bind:value={$filters.animeseason}>
          <option value={null}>All Seasons</option>
          {#each animeSeasons as season}
            <option value={season}>{season}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Anime Studio Filter -->
    {#if animeStudios.length > 0}
      <div class="filter-group">
        <h3>Anime Studio</h3>
        <select bind:value={$filters.animestudio}>
          <option value={null}>All Studios</option>
          {#each animeStudios as studio}
            <option value={studio}>{studio}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Version Filter -->
    {#if versions.length > 0}
      <div class="filter-group">
        <h3>Version</h3>
        <select bind:value={$filters.version}>
          <option value={null}>All Versions</option>
          {#each versions as version}
            <option value={version}>{version}</option>
          {/each}
        </select>
      </div>
    {/if}
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: 99;
  }

  .backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }

  .panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 75vh;
    background: #1c1c24;
    border-radius: 1rem 1rem 0 0;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    z-index: 100;
    display: flex;
    flex-direction: column;
  }

  .panel.open {
    transform: translateY(0);
  }

  .panel-header {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #2a2a3a;
    flex-shrink: 0;
  }

  .panel-header h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-right: auto;
  }

  .clear-btn {
    padding: 0.375rem 0.75rem;
    background: #3b82f6;
    color: white;
    border-radius: 8px;
    font-size: 0.8rem;
    margin-right: 0.5rem;
    transition: background 0.15s;
  }

  .clear-btn:hover {
    background: #60a5fa;
  }

  .close-btn {
    font-size: 1.5rem;
    padding: 0 0.5rem;
    color: #94a3b8;
  }

  .panel-content {
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group h3 {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .options {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .options label {
    padding: 0.375rem 0.75rem;
    background: #2a2a3a;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .options label:hover {
    background: #363648;
  }

  .options label.active {
    background: #3b82f6;
  }

  .options input {
    display: none;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    background: #2a2a3a;
    border: 1px solid #363648;
    border-radius: 8px;
    color: #f1f5f9;
    font-size: 0.9rem;
  }

  select:focus {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }

  /* Desktop styles */
  @media (min-width: 1024px) {
    .backdrop {
      display: none;
    }

    .panel {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      right: auto;
      width: 280px;
      max-height: none;
      border-radius: 0;
      transform: none;
      border-right: 1px solid #2a2a3a;
    }

    .close-btn {
      display: none;
    }
  }
</style>
