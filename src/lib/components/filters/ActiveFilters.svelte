<script lang="ts">
  import { filters, defaultFilters } from '$lib/stores/filters';
  import { LANGUAGES, FSK_RATINGS, FORMATS, TAGS, SCORES, GENRES } from '$lib/constants';

  function getFilterLabel(key: string, value: unknown): string {
    switch (key) {
      case 'search':
        return `"${value}"`;
      case 'type':
        return value === 'movie' ? 'Movies' : 'Series';
      case 'group':
        return String(value);
      case 'genre':
        return GENRES[value as number] || `Genre ${value}`;
      case 'language':
        return LANGUAGES[value as number] || `Language ${value}`;
      case 'format':
        return FORMATS[value as number] || `Format ${value}`;
      case 'fsk':
        return FSK_RATINGS[value as number] || `FSK ${value}`;
      case 'score':
        return SCORES[value as number] || `Score ${value}`;
      case 'tags':
        return TAGS[value as number] || `Tag ${value}`;
      case 'year':
        return String(value);
      case 'animeseason':
        return String(value);
      case 'animestudio':
        return String(value);
      case 'version':
        return String(value);
      default:
        return String(value);
    }
  }

  function removeFilter(key: keyof typeof defaultFilters) {
    filters.update((f) => ({ ...f, [key]: defaultFilters[key] }));
  }

  function clearAllFilters() {
    filters.set({ ...defaultFilters });
  }

  // Get active filters as array of {key, label}
  let activeFilters = $derived(
    Object.entries($filters)
      .filter(([key, value]) => {
        if (key === 'search') return value !== '';
        return value !== null;
      })
      .map(([key, value]) => ({
        key: key as keyof typeof defaultFilters,
        label: getFilterLabel(key, value)
      }))
  );
</script>

<div class="active-filters" class:hidden={activeFilters.length === 0}>
  <div class="taglets">
    {#each activeFilters as filter (filter.key)}
      <span class="taglet">
        <span class="taglet-label">{filter.label}</span>
        <button
          class="taglet-remove"
          onclick={() => removeFilter(filter.key)}
          aria-label="Remove {filter.label} filter"
        >×</button>
      </span>
    {/each}
  </div>
  <button class="clear-all" onclick={clearAllFilters}>Clear all</button>
</div>

<style>
  .active-filters {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #1c1c24;
    border-bottom: 1px solid #2a2a3a;
  }

  .active-filters.hidden {
    visibility: hidden;
  }

  .taglets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    flex: 1;
  }

  .taglet {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: #2a2a3a;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #e2e8f0;
  }

  .taglet-label {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .taglet-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.1rem;
    height: 1.1rem;
    padding: 0;
    background: transparent;
    color: #94a3b8;
    font-size: 1rem;
    line-height: 1;
    border-radius: 50%;
    transition: background 0.15s, color 0.15s;
  }

  .taglet-remove:hover {
    background: #ef4444;
    color: white;
  }

  .clear-all {
    flex-shrink: 0;
    padding: 0.25rem 0.625rem;
    background: transparent;
    color: #94a3b8;
    font-size: 0.75rem;
    border: 1px solid #3a3a4a;
    border-radius: 6px;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .clear-all:hover {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }

  /* Desktop: adjust for sidebar */
  @media (min-width: 1024px) {
    .active-filters {
      margin-left: 280px;
    }
  }
</style>
