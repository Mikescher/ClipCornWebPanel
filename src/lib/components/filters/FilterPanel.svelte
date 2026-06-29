<script lang="ts">
  import { filterPanelOpen } from '$lib/stores/ui';
  import { filters, defaultFilters, activeFiltersCount } from '$lib/stores/filters';
  import { LANGUAGES, FSK_RATINGS, FORMATS, TAGS, SCORES, GENRES } from '$lib/constants';
  import { formatSize, formatLength } from '$lib/utils/format';
  import type { GroupRow, DbStats } from '$lib/server/queries';

  let {
    groups,
    years,
    animeSeasons,
    animeStudios,
    versions,
    stats,
    authenticated = false
  }: {
    groups: GroupRow[];
    years: number[];
    animeSeasons: string[];
    animeStudios: string[];
    versions: string[];
    stats: DbStats;
    authenticated?: boolean;
  } = $props();

  const num = (n: number) => n.toLocaleString('en-US');

  // Render the UTC ISO timestamps in Berlin local time. An explicit timeZone makes the output
  // identical on the server and client regardless of the host's TZ (so no hydration mismatch),
  // and reconstructing from formatToParts avoids any locale-dependent ordering. h23 keeps the
  // hour as 00-23 (some ICU versions render midnight as "24" with hour12:false).
  function berlinParts(iso: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date(iso));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    return { y: get('year'), mo: get('month'), d: get('day'), h: get('hour'), mi: get('minute') };
  }
  const fmtDay = (iso: string) => {
    if (!iso) return '—';
    const p = berlinParts(iso);
    return `${p.y}-${p.mo}-${p.d}`;
  };
  const fmtDateTime = (iso: string) => {
    if (!iso) return '—';
    const p = berlinParts(iso);
    return `${p.y}-${p.mo}-${p.d} ${p.h}:${p.mi}`;
  };

  const totalTitles = $derived(stats.movies + stats.series);
  const totalSize = $derived(stats.movieSize + stats.seriesSize);
  const totalLength = $derived(stats.movieLength + stats.seriesLength);

  // Tooltip bodies, one string per line.
  const dataLines = $derived([`Created: ${fmtDateTime(stats.dbCreated)}`, `Modified: ${fmtDateTime(stats.dbModified)}`]);
  const titleLines = $derived([
    `${num(stats.movies)} movies`,
    `${num(stats.series)} series`,
    `${num(stats.seasons)} seasons`,
    `${num(stats.episodes)} episodes`
  ]);
  const sizeLines = $derived([`Movies: ${formatSize(stats.movieSize)}`, `Series: ${formatSize(stats.seriesSize)}`]);
  const lengthLines = $derived([`Movies: ${formatLength(stats.movieLength)}`, `Series: ${formatLength(stats.seriesLength)}`]);

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
    <button class="clear-btn" class:hidden={!($activeFiltersCount > 0)} onclick={clearFilters}>Clear ({$activeFiltersCount})</button>
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

    <!-- Viewed Filter (authenticated only) -->
    {#if authenticated}
      <div class="filter-group">
        <h3>Viewed</h3>
        <div class="options">
          <label class:active={$filters.viewed === null}>
            <input type="radio" name="viewed" checked={$filters.viewed === null} onchange={() => filters.update((f) => ({ ...f, viewed: null }))} />
            All
          </label>
          <label class:active={$filters.viewed === 'full'}>
            <input type="radio" name="viewed" checked={$filters.viewed === 'full'} onchange={() => filters.update((f) => ({ ...f, viewed: 'full' }))} />
            Fully
          </label>
          <label class:active={$filters.viewed === 'partial'}>
            <input type="radio" name="viewed" checked={$filters.viewed === 'partial'} onchange={() => filters.update((f) => ({ ...f, viewed: 'partial' }))} />
            Partial
          </label>
          <label class:active={$filters.viewed === 'none'}>
            <input type="radio" name="viewed" checked={$filters.viewed === 'none'} onchange={() => filters.update((f) => ({ ...f, viewed: 'none' }))} />
            None
          </label>
        </div>
      </div>
    {/if}

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

  {#snippet stat(value: string, lines: string[])}
    <div class="stat">
      <span class="stat-value">{value}</span>
      <span class="tooltip" role="tooltip">
        {#each lines as line}<span>{line}</span>{/each}
      </span>
    </div>
  {/snippet}

  <footer class="panel-footer">
    {@render stat(fmtDay(stats.dbModified), dataLines)}
    {@render stat(`${num(totalTitles)} entries`, titleLines)}
    {@render stat(formatSize(totalSize), sizeLines)}
    {@render stat(formatLength(totalLength), lengthLines)}
  </footer>
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

  .clear-btn.hidden {
    visibility: hidden;
  }
  
  .close-btn {
    font-size: 1.5rem;
    padding: 0 0.5rem;
    color: #94a3b8;
  }

  .panel-content {
    /* flex:1 + min-height:0 lets this region fill the sidebar and scroll, pinning the footer to the bottom */
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel-footer {
    flex-shrink: 0;
    padding: 0.625rem 1rem;
    border-top: 1px solid #2a2a3a;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.7rem;
  }

  .stat {
    position: relative;
    display: flex;
    justify-content: flex-end;
    cursor: default;
  }

  /* Muted via colour (not container opacity) so the tooltip below stays fully opaque. */
  .stat-value {
    color: rgba(241, 245, 249, 0.5);
    text-align: right;
  }

  .stat:hover .stat-value {
    color: rgba(241, 245, 249, 0.85);
  }

  .tooltip {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    white-space: nowrap;
    padding: 0.4rem 0.6rem;
    background: #2a2a3a;
    border: 1px solid #363648;
    border-radius: 6px;
    color: #f1f5f9;
    text-align: right;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    opacity: 0;
    transform: translateY(4px);
    pointer-events: none;
    transition: opacity 0.12s ease, transform 0.12s ease;
    z-index: 200;
  }

  .stat:hover .tooltip {
    opacity: 1;
    transform: translateY(0);
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
