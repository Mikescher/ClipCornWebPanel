<script lang="ts">
  import { FSK_RATINGS } from '$lib/constants';

  let { fsk }: { fsk: number } = $props();

  const title = fsk >= 0 && fsk < FSK_RATINGS.length ? FSK_RATINGS[fsk] : 'Unknown';
  const src = `/icons/fsk/fsk_${fsk}_16x16.png`;
</script>

<img {src} alt={title} {title} class="icon" />

<style>
  .icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
  }
</style>
