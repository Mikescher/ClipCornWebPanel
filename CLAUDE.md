# CLAUDE.md - ClipCorn Web Panel

This file provides guidance for AI assistants working on this codebase.

## Project Overview

ClipCorn Web Panel is a SvelteKit application for browsing a movie/series database stored in SQLite. It displays media as cards, supports filtering and search, and shows detailed views for individual items.

## Tech Stack

- **SvelteKit 2** with TypeScript and Svelte 5 runes syntax (`$state`, `$derived`, `$effect`, `$props`)
- **better-sqlite3** for synchronous SQLite access (database opened read-only)
- **sharp** for cover image decoding
- **Plain CSS** for styling (no Tailwind/frameworks)

## Key Architecture Decisions

### Database Access
- Database is opened read-only via `better-sqlite3`
- Connection singleton in `src/lib/server/db.ts`
- All queries in `src/lib/server/queries.ts`
- Path configured via `DATABASE_PATH` environment variable

### Data Formats

1. **Genre/Language**: Stored as bitmasks. Use `getBits()` or `getLanguagesFromBitmask()` to extract individual values.

2. **Genre specifically**: Packed bytes (up to 8 genres per entry). Each byte is a genre index. Use `getGenresFromPacked()`.

3. **Groups**: Semicolon-separated strings (e.g., "DC;DCEU"). The GROUPS table has colors for display.

4. **Tags/SpecialVersion/AnimeSeason/AnimeStudio**: JSON arrays stored as strings. Parse with `JSON.parse()`. Note: `AnimeSeason`/`AnimeStudio` live on the `MOVIES` table for movies, but on the `SEASONS` table for series (not `SERIES`) — series-level values are aggregated over all their seasons in `getSeriesAggregates()`.

5. **Viewed History**: Comma-separated format: `"UNSPECIFIED,2017-06-17 21:29:00,2022-02-26 15:51:00"`. The "UNSPECIFIED" value should be filtered out.

6. **Covers**: Custom binary format decoded in `cover-decoder.ts`:
   - Byte 0: width
   - Byte 1: height
   - Bytes 2-49: 16-color RGB palette (3 bytes each)
   - Remaining: 4-bit indexed pixels (high nibble first)

### UI Patterns

- **Mobile-first**: Design for mobile, then enhance for desktop
- **Bottom sheet filters**: On mobile, filters slide up from bottom
- **Sidebar filters**: On desktop (>1024px), filters are fixed left sidebar
- **Viewed data hidden by default**: Eye icon in bottom-left toggles visibility
- **Sort dropdown**: Beside the search bar in `Header.svelte`, bound to `filters.sort` (URL-synced, but excluded from the active-filter chip count). Options: default, name, date added, online/user score (asc/desc), plus first/last watched (authenticated only). Ordering lives in `queries.ts`: `movieOrderBy`/`seriesOrderBy` build the SQL `ORDER BY` for the paginated type-specific queries, and `buildComparator` does the equivalent in JS for the merged (movies + series) list. Watch-based sorts fall back to default when not authenticated; `firstWatched`/`lastWatched` are only put on `MediaItem` when authenticated.

### State Management

- `$lib/stores/filters.ts`: URL-synced filter state
- `$lib/stores/ui.ts`: UI state (showViewedData, filterPanelOpen)
- Filters sync to URL query params for shareability

## File Locations

| Purpose | Location |
|---------|----------|
| Database connection | `src/lib/server/db.ts` |
| Database queries | `src/lib/server/queries.ts` |
| Cover decoder | `src/lib/server/cover-decoder.ts` |
| Constants (enums) | `src/lib/constants.ts` |
| Format utilities | `src/lib/utils/format.ts` |
| Bitmask utilities | `src/lib/utils/bitmask.ts` |
| Icon components | `src/lib/components/icons/` |
| Card components | `src/lib/components/cards/` |
| Filter components | `src/lib/components/filters/` |
| Main page | `src/routes/+page.svelte` |
| Movie detail | `src/routes/movie/[id]/+page.svelte` |
| Series detail | `src/routes/series/[id]/+page.svelte` |
| Cover API | `src/routes/api/cover/[id]/+server.ts` |

## Common Tasks

### Adding a new filter
1. Add to `FilterState` interface in `src/lib/stores/filters.ts`
2. Add to `defaultFilters`, `filtersToParams()`, `paramsToFilters()`
3. Add query condition in `src/lib/server/queries.ts` (getMovies/getSeries)
4. Add UI control in `src/lib/components/filters/FilterPanel.svelte`

### Adding a new data mapping
1. Add to `src/lib/constants.ts`
2. Create icon component in `src/lib/components/icons/` if needed
3. Use in card/detail components

### Modifying card display
- Edit `src/lib/components/cards/MediaCard.svelte`
- Cover is handled by `CoverImage.svelte`
- Icons are separate components for reuse

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run check    # TypeScript/Svelte check
```

## Testing with Database

Default test database path: `/home/mike/temp/jcc-prodcopy/ClipCornDB/ClipCornDB.db`

Override with: `DATABASE_PATH=/path/to/db npm run dev`

## Authentication

- A single shared password gates **personal data** (rating comments + watch history). It is set via the `PANEL_PASSWORD` env variable; if unset, login is impossible and personal data stays hidden.
- `src/lib/server/auth.ts` derives a SHA-256 token from the password; `src/hooks.server.ts` validates the `cc_auth` httpOnly cookie and sets `locals.authenticated`.
- `POST /api/auth` logs in (`{ password }`), `DELETE /api/auth` logs out. The eye button (top-right, in `src/lib/components/AuthButton.svelte`, mounted in the root layout) opens the password dialog and calls `invalidateAll()` after login/logout.
- **Server-side redaction**: `+page.server.ts` load functions must never return `scoreComment`/`viewedHistory` (rating comment / watch history) to unauthenticated clients. Movie/episode/series detail pages each show a Comment section: when locked they send only a `hasComment` boolean (the comment renders blurred client-side), when unlocked they send the real text. The series page shows both the series-level comment (`SERIES.SCORECOMMENT`) and per-season comments (`SEASONS.SCORECOMMENT`, surfaced per season as `hasComment`/`comment`). Watch history is omitted entirely when locked. `api/series` and the series episode rows blank `VIEWED_HISTORY`/`SCORECOMMENT` when locked.
- **Viewed filter (authenticated only)**: `filters.viewed` (`'full' | 'partial' | 'none'`) filters the root list by watch status. The control only shows when authenticated (`FilterPanel` takes an `authenticated` prop) and the SQL clause is only applied when `authenticated` is true (`movieViewedClause`/`seriesViewedClause` in `queries.ts`) — movies can never be `'partial'`. So a `viewed=` URL param is silently ignored for anonymous clients.
- **Watched indicators (root view)**: list queries (`getAllMedia`/`getMovies`/`getSeries`) take an `authenticated` flag and, only when true, set `MediaItem.watchedState` (`'full'` = movie watched / all episodes watched; `'partial'` = some episodes watched). Raw `viewedHistory` is never put on list items. `MediaCard` renders a `WatchedEye` badge (half-eye for partial) over the cover bottom-right, hidden on card hover. Series watched counts come from `getSeriesAggregates` (`watchedCount` via `json_each` over `EPISODES.VIEWED_HISTORY`, ignoring `UNSPECIFIED`).

## Important Notes

- Database is **read-only** - never write to it
- Use Svelte 5 runes syntax (`$state`, `$derived`, `$effect`, `$props`)
- SSR data loading in `+page.server.ts` files
- Cover images cached for 24 hours (Cache-Control header)
- Roman numerals for zyklus numbers (toRoman utility)
