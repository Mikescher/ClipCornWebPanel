<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';
  import AuthButton from '$lib/components/AuthButton.svelte';
  import '../app.css';

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  onMount(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.remove();
    }
  });
</script>

<div class="app">
  <AuthButton authenticated={data.authenticated} />
  {@render children()}
</div>

<style>
  .app {
    min-height: 100vh;
    background: #121218;
    color: #f1f5f9;
  }
</style>
