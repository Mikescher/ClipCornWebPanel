<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { filters, filtersToParams, paramsToFilters } from '$lib/stores/filters';
  import type { PageData } from './$types';
  import type { MediaItem } from '$lib/server/queries';
  import Header from '$lib/components/layout/Header.svelte';
  import FilterPanel from '$lib/components/filters/FilterPanel.svelte';
  import MediaCard from '$lib/components/cards/MediaCard.svelte';

  let { data }: { data: PageData } = $props();

  // Accumulated items for infinite scroll
  let allItems = $state<MediaItem[]>([]);
  let currentPage = $state(0);
  let isLoading = $state(false);
  let hasMore = $state(true);

  // Track filter string to detect filter changes
  let lastFilterString = $state('');

  // Reset items when filters change
  $effect(() => {
    const filterString = filtersToParams($filters).toString();
    if (filterString !== lastFilterString) {
      lastFilterString = filterString;
      allItems = [...data.items];
      currentPage = data.page;
      hasMore = data.hasMore;
    }
  });

  // Also reset when data changes from server (initial load or filter change)
  $effect(() => {
    // If this is page 0 data, it's a fresh load (filters changed or initial)
    if (data.page === 0) {
      allItems = [...data.items];
      currentPage = 0;
      hasMore = data.hasMore;
    }
  });

  // Set up scroll listener for infinite scroll
  $effect(() => {
    function onScroll() {
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const remaining = docHeight - scrollBottom;

      if (remaining < 1024 && hasMore && !isLoading) {
        loadMore();
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Check immediately on mount
    return () => window.removeEventListener('scroll', onScroll);
  });

  async function loadMore() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    const nextPage = currentPage + 1;

    try {
      const params = filtersToParams($filters);
      params.set('page', String(nextPage));

      const response = await fetch(`/api/media?${params.toString()}`);
      const result = await response.json();

      allItems = [...allItems, ...result.items];
      currentPage = nextPage;
      hasMore = result.hasMore;
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      isLoading = false;
    }
  }

  // Track if we're currently syncing to prevent loops
  let isSyncingFromUrl = false;
  let isSyncingToUrl = false;

  // Initialize filters from URL on mount and when URL changes externally
  $effect(() => {
    const urlFilters = paramsToFilters($page.url.searchParams);
    if (isSyncingToUrl) return;
    isSyncingFromUrl = true;
    filters.set(urlFilters);
    isSyncingFromUrl = false;
  });

  // Navigate when filters change (from user interaction)
  $effect(() => {
    const currentFilters = $filters;
    if (isSyncingFromUrl) return;
    const params = filtersToParams(currentFilters);
    const currentParams = new URLSearchParams($page.url.searchParams);
    currentParams.delete('page'); // Remove page param for comparison
    const currentSearch = currentParams.toString();
    const newSearch = params.toString();
    if (currentSearch === newSearch) return;
    isSyncingToUrl = true;
    const newUrl = newSearch ? `?${newSearch}` : '/';
    goto(newUrl, { replaceState: true, noScroll: true }).finally(() => {
      isSyncingToUrl = false;
    });
  });
</script>

<svelte:head>
  <title>ClipCorn</title>
</svelte:head>

<Header />

<FilterPanel groups={data.groups} years={data.years} animeSeasons={data.animeSeasons} animeStudios={data.animeStudios} versions={data.versions} />

<main class="main">
  <div class="card-list">
    {#each allItems as item (item.id + '-' + item.type)}
      <MediaCard {item} />
    {/each}
  </div>

  {#if allItems.length === 0 && !isLoading}
    <div class="empty">
      <p>No results found.</p>
      <p>Try adjusting your filters.</p>
    </div>
  {/if}

  {#if isLoading}
    <div class="loading">Loading...</div>
  {/if}
</main>

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

  .loading {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
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
