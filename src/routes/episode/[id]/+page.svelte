<script lang="ts">
  import type { PageData } from './$types';
  import { LANGUAGES, FORMATS, TAGS } from '$lib/constants';
  import { formatSize, formatLength, formatDate } from '$lib/utils/format';
  import LanguageIcon from '$lib/components/icons/LanguageIcon.svelte';
  import FormatIcon from '$lib/components/icons/FormatIcon.svelte';
  import TagIcon from '$lib/components/icons/TagIcon.svelte';
  import MediaInfoSection from '$lib/components/detail/MediaInfoSection.svelte';
  import ChecksumsSection from '$lib/components/detail/ChecksumsSection.svelte';

  let { data }: { data: PageData } = $props();
  const episode = data.episode;

  const seasonLabel = episode.seasonName || `Season`;
</script>

<svelte:head>
  <title>{episode.name} - ClipCorn</title>
</svelte:head>

<div class="page">
  <header class="header">
    <button type="button" class="back-btn" onclick={() => history.back()}>← Back</button>
    <h1>{episode.name}</h1>
  </header>

  <div class="content">
    <nav class="breadcrumb">
      <a href={`/series/${episode.seriesId}`}>{episode.seriesName}</a>
      <span class="sep">/</span>
      <span>{seasonLabel}</span>
      <span class="sep">/</span>
      <span class="current">Episode {episode.episode}</span>
    </nav>

    <div class="info-section">
      <!-- Basic Info -->
      <div class="info-group">
        <h2>Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Episode</span>
            <span class="value">{episode.episode}</span>
          </div>
          <div class="info-item">
            <span class="label">Length</span>
            <span class="value">{formatLength(episode.length || 0)}</span>
          </div>
          <div class="info-item">
            <span class="label">Size</span>
            <span class="value">{formatSize(episode.filesize || 0)}</span>
          </div>
          <div class="info-item">
            <span class="label">Added</span>
            <span class="value">{formatDate(episode.addDate)}</span>
          </div>
          <div class="info-item">
            <span class="label">Format</span>
            <span class="value">
              <FormatIcon format={episode.format || 0} />
              {FORMATS[episode.format || 0] || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <!-- Media Info -->
      <MediaInfoSection mediaInfo={episode.mediaInfo} />

      <!-- Languages -->
      {#if episode.languages.length > 0}
        <div class="info-group">
          <h2>Languages</h2>
          <div class="icons-list">
            {#each episode.languages as lang}
              <span class="icon-with-label">
                <LanguageIcon language={lang} />
                {LANGUAGES[lang] || 'Unknown'}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Tags -->
      {#if episode.tags.length > 0}
        <div class="info-group">
          <h2>Tags</h2>
          <div class="icons-list">
            {#each episode.tags as tag}
              <span class="icon-with-label">
                <TagIcon {tag} />
                {TAGS[tag] || 'Unknown'}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Checksums -->
      <ChecksumsSection checksums={episode.checksums} />
    </div>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    padding-bottom: 5rem;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #1c1c24;
    border-bottom: 1px solid #2a2a3a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .back-btn {
    padding: 0.5rem 1rem;
    background: #2a2a3a;
    border: none;
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 0.9rem;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.15s;
  }

  .back-btn:hover {
    background: #363648;
  }

  .header h1 {
    font-size: 1.1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .content {
    padding: 1rem;
  }

  .breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }

  .breadcrumb a {
    color: #3b82f6;
  }

  .breadcrumb a:hover {
    text-decoration: underline;
  }

  .breadcrumb .sep {
    color: #475569;
  }

  .breadcrumb .current {
    color: #cbd5e1;
  }

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

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

  .icons-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .icon-with-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.85rem;
  }

  @media (min-width: 640px) {
    .content {
      padding: 2rem;
    }

    .info-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
