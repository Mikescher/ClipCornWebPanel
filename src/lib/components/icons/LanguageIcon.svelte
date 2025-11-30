<script lang="ts">
  import { LANGUAGES } from '$lib/constants';

  let { language }: { language: number } = $props();

  const title = language >= 0 && language < LANGUAGES.length ? LANGUAGES[language] : 'Unknown';
  const src = language === -1 ? '/icons/language/language_none_16x16.png' : `/icons/language/language_${String(language).padStart(2, '0')}_16x16.png`;
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
