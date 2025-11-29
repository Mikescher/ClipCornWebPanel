<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { filters, filtersToParams, paramsToFilters } from '$lib/stores/filters';
  import type { PageData } from './$types';
  import Header from '$lib/components/layout/Header.svelte';
  import ViewToggle from '$lib/components/layout/ViewToggle.svelte';
  import FilterPanel from '$lib/components/filters/FilterPanel.svelte';
  import MediaCard from '$lib/components/cards/MediaCard.svelte';

  let { data }: { data: PageData } = $props();

  // Initialize filters from URL on mount
  $effect(() => {
    const urlFilters = paramsToFilters($page.url.searchParams);
    filters.set(urlFilters);
  });

  // Navigate when filters change
  let isFirstRun = true;
  $effect(() => {
    const currentFilters = $filters;
    // Skip the initial effect run
    if (isFirstRun) {
      isFirstRun = false;
      return;
    }
    const params = filtersToParams(currentFilters);
    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    goto(newUrl, { replaceState: true, noScroll: true });
  });

  function nextPage() {
    const params = new URLSearchParams($page.url.searchParams);
    params.set('page', String(data.page + 1));
    goto(`?${params.toString()}`);
  }

  function prevPage() {
    const params = new URLSearchParams($page.url.searchParams);
    if (data.page > 0) {
      params.set('page', String(data.page - 1));
    } else {
      params.delete('page');
    }
    goto(`?${params.toString()}`);
  }
</script>

<Header />

<FilterPanel groups={data.groups} years={data.years} animeSeasons={data.animeSeasons} animeStudios={data.animeStudios} versions={data.versions} />

<main class="main">
  <div class="stats">
    <span>{data.stats.movies} Movies</span>
    <span>{data.stats.series} Series</span>
    <span>{data.stats.episodes} Episodes</span>
  </div>

  <div class="card-list">
    {#each data.items as item (item.id + '-' + item.type)}
      <MediaCard {item} />
    {/each}
  </div>

  {#if data.items.length === 0}
    <div class="empty">
      <p>No results found.</p>
      <p>Try adjusting your filters.</p>
    </div>
  {/if}

  <div class="pagination">
    <button onclick={prevPage} disabled={data.page === 0}>← Previous</button>
    <span class="page-info">Page {data.page + 1}</span>
    <button onclick={nextPage} disabled={!data.hasMore}>Next →</button>
  </div>
</main>

<ViewToggle />

<style>
  .main {
    padding: 1rem;
    padding-bottom: 5rem;
  }

  .stats {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    color: #8892b0;
  }

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .empty {
    text-align: center;
    padding: 3rem 1rem;
    color: #8892b0;
  }

  .empty p:first-child {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1rem;
  }

  .pagination button {
    padding: 0.5rem 1rem;
    background: #0f3460;
    border-radius: 6px;
    color: #ccd6f6;
    transition: background 0.15s;
  }

  .pagination button:hover:not(:disabled) {
    background: #1a4980;
  }

  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-info {
    color: #8892b0;
    font-size: 0.9rem;
  }

  /* Desktop: adjust for sidebar */
  @media (min-width: 1024px) {
    .main {
      margin-left: 280px;
    }

    .card-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
    }
  }
</style>
