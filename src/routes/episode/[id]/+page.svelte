<script lang="ts">
  import type { PageData } from './$types';
  import { LANGUAGES, FORMATS, TAGS } from '$lib/constants';
  import { formatSize, formatLength, formatDate } from '$lib/utils/format';
  import LanguageIcon from '$lib/components/icons/LanguageIcon.svelte';
  import FormatIcon from '$lib/components/icons/FormatIcon.svelte';
  import TagIcon from '$lib/components/icons/TagIcon.svelte';
  import MediaInfoSection from '$lib/components/detail/MediaInfoSection.svelte';
  import ChecksumsSection from '$lib/components/detail/ChecksumsSection.svelte';
  import AuthButton from '$lib/components/AuthButton.svelte';

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
    <AuthButton authenticated={data.authenticated} />
  </header>

  <div class="content">
    <nav class="breadcrumb">
      <a href="/" class="home" aria-label="Back to list" title="Back to list">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
        </svg>
      </a>
      <span class="sep">/</span>
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

      <!-- Rating Comment -->
      {#if data.hasComment}
        <div class="info-group">
          <h2>Comment</h2>
          {#if data.authenticated && data.comment}
            <p class="comment">{data.comment}</p>
          {:else}
            <p class="comment blurred" aria-hidden="true">
              A personal rating note exists for this episode. Unlock to read it.
            </p>
          {/if}
        </div>
      {/if}

      <!-- Watch History -->
      {#if data.authenticated && data.viewedHistory && data.viewedHistory.length > 0}
        <div class="info-group">
          <h2>Watch History</h2>
          <ul class="history-list">
            {#each data.viewedHistory as watched}
              <li>{watched}</li>
            {/each}
          </ul>
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
    flex: 1;
    min-width: 0;
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

  .breadcrumb a.home {
    display: inline-flex;
    align-items: center;
  }

  .breadcrumb a.home:hover {
    text-decoration: none;
    color: #60a5fa;
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

  .comment {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #cbd5e1;
    white-space: pre-wrap;
  }

  .comment.blurred {
    filter: blur(5px);
    user-select: none;
    pointer-events: none;
    color: #94a3b8;
  }

  .history-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .history-list li {
    width: fit-content;
    padding: 0.375rem 0.625rem;
    background: #2a2a3a;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #cbd5e1;
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
