<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.css';

  let { children }: { children: Snippet } = $props();
</script>

<div class="app">
  {@render children()}
</div>

<style>
  .app {
    min-height: 100vh;
    background: #1a1a2e;
    color: #eee;
  }
</style>
