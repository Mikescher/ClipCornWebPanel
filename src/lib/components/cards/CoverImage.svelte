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
    aspect-ratio: 182/254;
    flex-shrink: 0;
    background: #2a2a3a;
    border-radius: 8px;
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
    left: 0;
    width: 40px;
    height: 40px;
    object-fit: cover;
  }
</style>
