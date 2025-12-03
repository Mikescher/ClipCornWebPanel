<script lang="ts">
  let { size = 24 }: { size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 72 72"
  class="icon"
  aria-label="Kitsu"
>
  <rect width="72" height="72" rx="8" fill="#F75239"/>
  <text x="36" y="44" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#fff">K</text>
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>
