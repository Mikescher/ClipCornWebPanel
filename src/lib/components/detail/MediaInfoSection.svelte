<script lang="ts">
  import type { MediaInfo } from '$lib/types';
  import { formatBitrate, formatDuration, formatSampleRate } from '$lib/utils/format';

  let { mediaInfo }: { mediaInfo: MediaInfo | null | undefined } = $props();

  const resolution = $derived(
    mediaInfo?.width && mediaInfo?.height ? `${mediaInfo.width} × ${mediaInfo.height}` : null
  );

  // Build the list of rows that actually have a value, so we render nothing when empty.
  const rows = $derived(
    mediaInfo
      ? [
          { label: 'Video Codec', value: mediaInfo.vcodec, mono: true },
          { label: 'Video Format', value: mediaInfo.vformat, mono: false },
          { label: 'Resolution', value: resolution, mono: false },
          { label: 'Frame Rate', value: mediaInfo.framerate ? `${mediaInfo.framerate} fps` : null, mono: false },
          { label: 'Bit Depth', value: mediaInfo.bitdepth ? `${mediaInfo.bitdepth} bit` : null, mono: false },
          { label: 'Bitrate', value: mediaInfo.bitrate ? formatBitrate(mediaInfo.bitrate) : null, mono: false },
          { label: 'Duration', value: mediaInfo.duration ? formatDuration(mediaInfo.duration) : null, mono: false },
          { label: 'Audio Codec', value: mediaInfo.acodec, mono: true },
          { label: 'Audio Format', value: mediaInfo.aformat, mono: false },
          { label: 'Channels', value: mediaInfo.achannels ? `${mediaInfo.achannels}` : null, mono: false },
          { label: 'Sample Rate', value: mediaInfo.samplerate ? formatSampleRate(mediaInfo.samplerate) : null, mono: false }
        ].filter((r) => r.value)
      : []
  );
</script>

{#if rows.length > 0}
  <div class="info-group">
    <h2>Media Info</h2>
    <div class="info-grid">
      {#each rows as row}
        <div class="info-item">
          <span class="label">{row.label}</span>
          <span class="value" class:mono={row.mono}>{row.value}</span>
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

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .value {
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .value.mono {
    font-family: ui-monospace, 'SF Mono', 'Cascadia Code', monospace;
    font-size: 0.8rem;
  }

  @media (min-width: 640px) {
    .info-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
