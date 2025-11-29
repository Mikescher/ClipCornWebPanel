<script lang="ts">
  import { getStarCount } from '$lib/utils/format';

  let { num, denom }: { num: number; denom: number } = $props();

  const stars = getStarCount(num, denom);
  const percentage = denom > 0 ? Math.round((num / denom) * 100) : 0;
  const src = `/icons/stars/stars_${stars}.png`;
</script>

<img {src} alt="{percentage}%" title="{percentage}%" class="icon" />

<style>
  .icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
  }
</style>
