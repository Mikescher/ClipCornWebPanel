<script lang="ts">
  let { size = 24 }: { size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 72 72"
  class="icon"
  aria-label="AniList"
>
  <rect width="72" height="72" rx="8" fill="#02A9FF"/>
  <path fill="#fff" d="M24 52V20l12 32h-6l-2-6h-8l2 6h2zm6-12l-3-10-3 10h6z"/>
  <path fill="#fff" d="M42 52V28h6v18h8v6H42z"/>
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>
