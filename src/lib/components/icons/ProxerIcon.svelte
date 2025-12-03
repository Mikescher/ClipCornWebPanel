<script lang="ts">
  let { size = 24 }: { size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 72 72"
  class="icon"
  aria-label="Proxer"
>
  <rect width="72" height="72" rx="8" fill="#F89C24"/>
  <text x="36" y="44" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fff">P</text>
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>
