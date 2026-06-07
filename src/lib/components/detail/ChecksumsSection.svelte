<script lang="ts">
  import type { Checksums } from '$lib/types';

  let { checksums }: { checksums: Checksums | null | undefined } = $props();

  const rows = $derived(
    checksums
      ? [
          { label: 'CRC32', values: checksums.crc32 },
          { label: 'MD5', values: checksums.md5 },
          { label: 'SHA256', values: checksums.sha256 },
          { label: 'SHA512', values: checksums.sha512 }
        ].filter((r) => r.values.length > 0)
      : []
  );

  // Only show part indices when a file is split into multiple parts.
  const multiPart = $derived(rows.some((r) => r.values.length > 1));
</script>

{#if rows.length > 0}
  <div class="info-group">
    <h2>Checksums</h2>
    <div class="checksum-list">
      {#each rows as row}
        <div class="checksum-row">
          <span class="label">{row.label}</span>
          <div class="checksum-values">
            {#each row.values as value, i}
              <code class="checksum">{#if multiPart}<span class="part-idx">#{i + 1}</span>{/if}{value}</code>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .info-group h2 {
    font-size: 0.85rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #2a2a3a;
  }

  .checksum-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .checksum-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .checksum-values {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .checksum {
    font-family: ui-monospace, 'SF Mono', 'Cascadia Code', monospace;
    font-size: 0.8rem;
    color: #cbd5e1;
    background: #1c1c24;
    border: 1px solid #2a2a3a;
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    word-break: break-all;
    user-select: all;
  }

  .part-idx {
    color: #64748b;
    margin-right: 0.5rem;
    user-select: none;
  }
</style>
