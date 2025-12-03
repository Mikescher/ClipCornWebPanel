<script lang="ts">
  let { size = 24 }: { size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 190 190"
  class="icon"
  aria-label="TMDB"
>
  <defs>
    <linearGradient id="tmdb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#90CEA1"/>
      <stop offset="50%" stop-color="#3CBEC9"/>
      <stop offset="100%" stop-color="#00B3E5"/>
    </linearGradient>
  </defs>
  <circle cx="95" cy="95" r="95" fill="#0D253F"/>
  <path fill="url(#tmdb-grad)" d="M95 10C48.1 10 10 48.1 10 95s38.1 85 85 85 85-38.1 85-85S141.9 10 95 10zm0 150c-35.8 0-65-29.2-65-65s29.2-65 65-65 65 29.2 65 65-29.2 65-65 65z"/>
  <text x="95" y="105" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="url(#tmdb-grad)">TMDB</text>
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>
