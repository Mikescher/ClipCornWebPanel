<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import '../app.css';

  let { children }: { children: Snippet } = $props();

  onMount(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.remove();
    }
  });
</script>

<div class="app">
  {@render children()}
</div>

<style>
  .app {
    min-height: 100vh;
    background: #121218;
    color: #f1f5f9;
  }
</style>
