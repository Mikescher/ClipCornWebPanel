<script lang="ts">
  let { size = 24 }: { size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 72 72"
  class="icon"
  aria-label="MyAnimeList"
>
  <rect width="72" height="72" rx="8" fill="#2E51A2"/>
  <path fill="#fff" d="M36 12c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zm0 44c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/>
  <text x="36" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff">MAL</text>
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>
