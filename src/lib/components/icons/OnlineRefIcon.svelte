<script lang="ts">
  import ImdbIcon from './ImdbIcon.svelte';
  import TmdbIcon from './TmdbIcon.svelte';
  import MyAnimeListIcon from './MyAnimeListIcon.svelte';
  import AniListIcon from './AniListIcon.svelte';
  import KitsuIcon from './KitsuIcon.svelte';
  import AniDBIcon from './AniDBIcon.svelte';
  import AnimePlanetIcon from './AnimePlanetIcon.svelte';
  import ProxerIcon from './ProxerIcon.svelte';
  import ExternalLinkIcon from './ExternalLinkIcon.svelte';

  let { identifier, size = 24 }: { identifier: string; size?: number } = $props();
</script>

{#if identifier === 'imdb'}
  <ImdbIcon {size} />
{:else if identifier === 'tmdb'}
  <TmdbIcon {size} />
{:else if identifier === 'myal'}
  <MyAnimeListIcon {size} />
{:else if identifier === 'anil'}
  <AniListIcon {size} />
{:else if identifier === 'kisu'}
  <KitsuIcon {size} />
{:else if identifier === 'andb'}
  <AniDBIcon {size} />
{:else if identifier === 'anpl'}
  <AnimePlanetIcon {size} />
{:else if identifier === 'prox'}
  <ProxerIcon {size} />
{:else}
  <ExternalLinkIcon {size} />
{/if}
