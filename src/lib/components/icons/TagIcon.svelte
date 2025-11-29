<script lang="ts">
  import { TAGS } from '$lib/constants';

  let { tag }: { tag: number } = $props();

  const title = tag >= 0 && tag < TAGS.length ? TAGS[tag] : 'Unknown';
  const src = `/icons/tags/tag_${tag}_on.png`;
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
