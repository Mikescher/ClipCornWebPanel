<script lang="ts">
  import { filters } from '$lib/stores/filters';

  let searchValue = $state($filters.search);
  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchValue = target.value;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filters.update((f) => ({ ...f, search: searchValue }));
    }, 300);
  }

  function clearSearch() {
    searchValue = '';
    filters.update((f) => ({ ...f, search: '' }));
  }
</script>

<div class="search-container">
  <input type="search" placeholder="Search movies & series..." value={searchValue} oninput={handleInput} class="search-input" />
  {#if searchValue}
    <button class="clear-btn" onclick={clearSearch}>×</button>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    flex: 1;
    max-width: 400px;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    background: #0f3460;
    border: 1px solid #1a4980;
    border-radius: 6px;
    color: #eee;
    font-size: 0.9rem;
  }

  .search-input::placeholder {
    color: #8892b0;
  }

  .search-input:focus {
    outline: 2px solid #e94560;
    outline-offset: -2px;
  }

  .clear-btn {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.25rem;
    color: #8892b0;
    padding: 0 0.25rem;
  }

  .clear-btn:hover {
    color: #eee;
  }
</style>
