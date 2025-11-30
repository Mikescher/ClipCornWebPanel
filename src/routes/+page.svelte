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

  // Track if we're currently syncing to prevent loops
  let isSyncingFromUrl = false;
  let isSyncingToUrl = false;

  // Initialize filters from URL on mount and when URL changes externally
  $effect(() => {
    const urlFilters = paramsToFilters($page.url.searchParams);
    if (isSyncingToUrl) return; // Skip if we caused this URL change
    isSyncingFromUrl = true;
    filters.set(urlFilters);
    isSyncingFromUrl = false;
  });

  // Navigate when filters change (from user interaction)
  $effect(() => {
    const currentFilters = $filters;
    if (isSyncingFromUrl) return; // Skip if URL caused this filter change
    const params = filtersToParams(currentFilters);
    // Preserve the page parameter from the current URL
    const currentPage = $page.url.searchParams.get('page');
    if (currentPage) {
      params.set('page', currentPage);
    }
    const currentSearch = $page.url.searchParams.toString();
    const newSearch = params.toString();
    if (currentSearch === newSearch) return; // No change needed
    isSyncingToUrl = true;
    const newUrl = newSearch ? `?${newSearch}` : '/';
    goto(newUrl, { replaceState: true, noScroll: true }).finally(() => {
      isSyncingToUrl = false;
    });
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
    <span class="page-info">Page {data.page + 1}/{data.totalPages}</span>
    <button onclick={nextPage} disabled={!data.hasMore}>Next →</button>
  </div>
</main>

<ViewToggle />

<style>
  .main {
    padding: 1rem;
    padding-bottom: 5rem;
  }

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .empty {
    text-align: center;
    padding: 3rem 1rem;
    color: #94a3b8;
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
    background: #2a2a3a;
    border-radius: 8px;
    color: #cbd5e1;
    transition: background 0.15s;
  }

  .pagination button:hover:not(:disabled) {
    background: #363648;
  }

  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-info {
    color: #94a3b8;
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
