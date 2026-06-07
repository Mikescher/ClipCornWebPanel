<script lang="ts">
  let {
    half = false,
    idSuffix = '',
    size = 27,
    badge = true
  }: { half?: boolean; idSuffix?: string; size?: number; badge?: boolean } = $props();

  const clipId = `eye-half-${idSuffix}`;
  const title = half ? 'Partially watched' : 'Watched';
  const almond = 'M12 5C5.5 5 2 12 2 12s3.5 7 10 7 10-7 10-7-3.5-7-10-7Z';
  const glyph = badge ? Math.round((size * 2) / 3) : size;
</script>

{#snippet eye(s: number)}
  <svg viewBox="0 0 24 24" width={s} height={s} role="img" aria-hidden="true">
    {#if half}
      <defs>
        <clipPath id={clipId}><rect x="0" y="0" width="12" height="24" /></clipPath>
      </defs>
      <path d={almond} fill="currentColor" clip-path={`url(#${clipId})`} />
      <path d={almond} fill="none" stroke="currentColor" stroke-width="1.8" />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6" />
    {:else}
      <path d={almond} fill="currentColor" />
      <circle cx="12" cy="12" r="2.6" fill="#13131a" />
    {/if}
  </svg>
{/snippet}

{#if badge}
  <span class="badge" style="width:{size}px;height:{size}px" {title} aria-label={title}>
    {@render eye(glyph)}
  </span>
{:else}
  <span class="plain" {title} aria-label={title}>
    {@render eye(glyph)}
  </span>
{/if}

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.65);
    color: #f1f5f9;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
  }

  .plain {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    display: block;
  }
</style>
