<script lang="ts">
  let { coverId, isSeries = false, alt = '' }: { coverId: number; isSeries?: boolean; alt?: string } = $props();

  const src = `/api/cover/${coverId}`;
</script>

<div class="cover-container" class:is-series={isSeries}>
  <img {src} {alt} class="cover" loading="lazy" />
  {#if isSeries}
    <img src="/mask_series.png" alt="" class="series-overlay" />
  {/if}
</div>

<style>
  .cover-container {
    position: relative;
    width: 60px;
    aspect-ratio: 2/3;
    flex-shrink: 0;
    background: #333;
    border-radius: 3px;
    overflow: hidden;
  }

  .cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .series-overlay {
    position: absolute;
    top: 0;
    right: 0;
    width: 24px;
    height: 24px;
  }
</style>
