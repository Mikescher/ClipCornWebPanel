<script lang="ts">
  import { SCORES } from '$lib/constants';

  let { score }: { score: number } = $props();

  const title = score >= 0 && score < SCORES.length ? SCORES[score] : 'Unknown';
  // Score 6 is "Unset" - skip it in the icon
  const iconIndex = score === 7 ? 7 : score;
  const src = `/icons/score/score_${iconIndex}_16x16.png`;
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
