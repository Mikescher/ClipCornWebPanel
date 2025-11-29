<script lang="ts">
  import { filterPanelOpen } from '$lib/stores/ui';
  import { activeFiltersCount } from '$lib/stores/filters';
  import SearchInput from '../filters/SearchInput.svelte';

  function toggleFilters() {
    filterPanelOpen.update((v) => !v);
  }
</script>

<header class="header">
  <a href="/" class="logo">
    <img src="/icon_jcc.png" alt="ClipCorn" class="logo-icon" />
    <span class="logo-text">ClipCorn</span>
  </a>

  <SearchInput />

  <button class="filter-btn" onclick={toggleFilters}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
    {#if $activeFiltersCount > 0}
      <span class="badge">{$activeFiltersCount}</span>
    {/if}
  </button>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #16213e;
    border-bottom: 1px solid #0f3460;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
  }

  .logo-text {
    font-size: 1.1rem;
    font-weight: 700;
    color: #e94560;
  }

  .filter-btn {
    position: relative;
    padding: 0.5rem;
    background: #0f3460;
    border-radius: 6px;
    color: #ccd6f6;
    flex-shrink: 0;
  }

  .filter-btn:hover {
    background: #1a4980;
  }

  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background: #e94560;
    border-radius: 9px;
    font-size: 0.7rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Hide logo text on small screens */
  @media (max-width: 480px) {
    .logo-text {
      display: none;
    }
  }

  /* Desktop: adjust for sidebar */
  @media (min-width: 1024px) {
    .header {
      margin-left: 280px;
    }

    .filter-btn {
      display: none;
    }
  }
</style>
