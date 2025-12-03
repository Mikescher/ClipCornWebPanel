<script lang="ts">
  let { size = 24 }: { size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 72 72"
  class="icon"
  aria-label="Anime-Planet"
>
  <rect width="72" height="72" rx="8" fill="#E75A8D"/>
  <circle cx="36" cy="36" r="20" fill="none" stroke="#fff" stroke-width="3"/>
  <ellipse cx="36" cy="36" rx="28" ry="8" fill="none" stroke="#fff" stroke-width="2" transform="rotate(-20 36 36)"/>
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>
