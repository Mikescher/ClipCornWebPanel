<script lang="ts">
  let { size = 24 }: { size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 72 72"
  class="icon"
  aria-label="AniDB"
>
  <rect width="72" height="72" rx="8" fill="#2A4D6E"/>
  <text x="36" y="32" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#fff">Ani</text>
  <text x="36" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#6AC7F0">DB</text>
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>
