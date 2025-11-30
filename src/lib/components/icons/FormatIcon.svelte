<script lang="ts">
  import { FORMATS } from '$lib/constants';

  let { format }: { format: number } = $props();

  const title = format >= 0 && format < FORMATS.length ? FORMATS[format] : 'Unknown';
  const src = `/icons/format/ext${format}_16x16.png`;
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
