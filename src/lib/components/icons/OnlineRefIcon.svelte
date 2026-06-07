<script lang="ts">
  import ExternalLinkIcon from './ExternalLinkIcon.svelte';

  let { identifier, size = 24 }: { identifier: string; size?: number } = $props();

  const ICON_FILES: Record<string, string> = {
    imdb: 'ref01',
    amzn: 'ref02',
    mvpt: 'ref03',
    tmdb: 'ref04',
    prox: 'ref05',
    myal: 'ref06',
    anil: 'ref07',
    anpl: 'ref08',
    kisu: 'ref09',
    andb: 'ref10',
    tvdb: 'ref11',
    maze: 'ref12',
    wkde: 'ref13',
    wken: 'ref14',
    ofdb: 'ref15'
  };

  const file = $derived(ICON_FILES[identifier]);
</script>

{#if file}
  <img src="/icons/onlineref/{file}.png" alt={identifier} width={size} height={size} />
{:else}
  <ExternalLinkIcon {size} />
{/if}

<style>
  img {
    display: block;
    object-fit: contain;
  }
</style>
