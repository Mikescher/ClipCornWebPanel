<script lang="ts">
  import { parseViewedHistory } from '$lib/utils/format';

  let { viewedHistory, partial = false }: { viewedHistory: string; partial?: boolean } = $props();

  const iconData = $derived.by(() => {
    const { viewed, history } = parseViewedHistory(viewedHistory);
    const count = history.length;

    if (partial) {
      return { src: '/icons/viewed/counter_dot.png', title: 'Partially viewed' };
    } else if (!viewed) {
      return { src: '/icons/viewed/counter_00.png', title: 'Not viewed' };
    } else if (count <= 24) {
      return { src: `/icons/viewed/counter_${String(count).padStart(2, '0')}.png`, title: `Viewed ${count} time${count !== 1 ? 's' : ''}` };
    } else {
      return { src: '/icons/viewed/counter_24.png', title: `Viewed ${count} times` };
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
