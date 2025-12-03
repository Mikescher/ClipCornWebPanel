<script lang="ts">
  let { coverId, isSeries = false, alt = '' }: { coverId: number; isSeries?: boolean; alt?: string } = $props();

  let loaded = $state(false);

  const src = `/api/cover/${coverId}`;
</script>

<div class="cover-container" class:is-series={isSeries}>
  {#if !loaded}
    <div class="placeholder">
      <svg viewBox="0 0 24 24" fill="currentColor" class="placeholder-icon">
        <path d="M18 4V3a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1h-1v1H5V3h12v1h1z"/>
        <path d="M21 6h-5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-1 14h-3V8h3v12z" opacity="0.5"/>
      </svg>
    </div>
  {/if}
  <img {src} {alt} class="cover" class:loaded loading="lazy" onload={() => loaded = true} />
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
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  .cover.loaded {
    opacity: 1;
  }

  .placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2a2a3a 0%, #1a1a2a 100%);
  }

  .placeholder-icon {
    width: 40%;
    height: 40%;
    color: #444;
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
