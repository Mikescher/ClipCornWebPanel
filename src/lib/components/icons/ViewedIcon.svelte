<script lang="ts">
  import { parseViewedHistory } from '$lib/utils/format';

  let { viewedHistory, partial = false }: { viewedHistory: string; partial?: boolean } = $props();

  const iconData = $derived.by(() => {
    const { viewed, history } = parseViewedHistory(viewedHistory);
    const count = history.length;

    if (partial) {
      return { src: '/icons/viewed/viewed_partial.png', title: 'Partially viewed' };
    } else if (!viewed) {
      return { src: '/icons/viewed/viewed_no.png', title: 'Not viewed' };
    } else if (count <= 24) {
      return { src: `/icons/viewed/counter_${count}.png`, title: `Viewed ${count} time${count !== 1 ? 's' : ''}` };
    } else {
      return { src: '/icons/viewed/counter_24plus.png', title: `Viewed ${count} times` };
    }
  });
</script>

<img src={iconData.src} alt={iconData.title} title={iconData.title} class="icon" />

<style>
  .icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
  }
</style>
