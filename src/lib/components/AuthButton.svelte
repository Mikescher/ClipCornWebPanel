<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let { authenticated }: { authenticated: boolean } = $props();

  let open = $state(false);
  let password = $state('');
  let errorMsg = $state('');
  let loading = $state(false);

  function openDialog() {
    errorMsg = '';
    password = '';
    open = true;
  }

  function close() {
    open = false;
  }

  function autofocus(node: HTMLElement) {
    node.focus();
  }

  async function submit(e: Event) {
    e.preventDefault();
    if (!password) return;
    loading = true;
    errorMsg = '';
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        password = '';
        open = false;
        await invalidateAll();
      } else {
        errorMsg = 'Incorrect password';
      }
    } catch {
      errorMsg = 'Something went wrong';
    } finally {
      loading = false;
    }
  }

  async function logout() {
    loading = true;
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      open = false;
      await invalidateAll();
    } finally {
      loading = false;
    }
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') close();
  }}
/>

<button
  type="button"
  class="eye"
  class:authed={authenticated}
  aria-label={authenticated ? 'Account' : 'Unlock'}
  onclick={openDialog}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
</button>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" role="presentation" onclick={(e) => { if (e.target === e.currentTarget) close(); }}>
    <div class="dialog" role="dialog" aria-modal="true">
      {#if authenticated}
        <h2>Authenticated</h2>
        <p class="status">Personal ratings and watch history are visible.</p>
        <button type="button" class="primary" onclick={logout} disabled={loading}>
          {loading ? '…' : 'Log out'}
        </button>
      {:else}
        <h2>Unlock</h2>
        <form onsubmit={submit}>
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            autocomplete="current-password"
            use:autofocus
          />
          {#if errorMsg}
            <p class="error">{errorMsg}</p>
          {/if}
          <button type="submit" class="primary" disabled={loading || !password}>
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .eye {
    position: fixed;
    top: 1rem;
    right: 1.25rem;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #475569;
    opacity: 0.35;
    cursor: pointer;
    transition: opacity 0.15s, color 0.15s, background 0.15s;
  }

  .eye:hover {
    opacity: 1;
    color: #cbd5e1;
    background: rgba(42, 42, 58, 0.8);
  }

  .eye.authed {
    color: #3b82f6;
    opacity: 0.7;
  }

  .eye.authed:hover {
    opacity: 1;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.6);
  }

  .dialog {
    width: 100%;
    max-width: 320px;
    padding: 1.5rem;
    background: #1c1c24;
    border: 1px solid #2a2a3a;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  }

  .dialog h2 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .status {
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    background: #121218;
    border: 1px solid #2a2a3a;
    border-radius: 8px;
    color: #f1f5f9;
    font-size: 0.9rem;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .primary {
    padding: 0.625rem 0.75rem;
    background: #3b82f6;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    font-size: 0.8rem;
    color: #f87171;
  }
</style>
