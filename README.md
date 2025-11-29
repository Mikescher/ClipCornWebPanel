# ClipCorn Web Panel

A modern SvelteKit web application for browsing a ClipCorn movie/series database.

## Features

- Browse movies and TV series
- Search by name, zyklus, groups, and tags
- Filter by multiple criteria (genre, language, format, FSK rating, year, etc.)
- Mobile-first responsive design with bottom sheet filters
- Detailed view for movies and series (including episode tables)
- Optional viewed history display (toggle with eye icon)

## Tech Stack

- **Framework:** SvelteKit 2 with TypeScript
- **Database:** SQLite (read-only) via better-sqlite3
- **Styling:** Plain CSS (no framework)
- **Deployment:** Node.js adapter for Docker

## Development

### Prerequisites

- Node.js 20+
- SQLite database file

### Setup

```bash
# Install dependencies
npm install

# Set database path (optional, defaults to local test path)
export DATABASE_PATH=/path/to/ClipCornDB.db

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PATH` | Path to SQLite database file | `/home/mike/temp/jcc-prodcopy/ClipCornDB/ClipCornDB.db` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Or run directly
node build
```

## Docker Deployment

### Build and Run

```bash
# Build image
docker build -t clipcorn-web .

# Run with database mounted
docker run -p 3000:3000 -v /path/to/ClipCornDB.db:/data/ClipCornDB.db:ro clipcorn-web
```

### Docker Compose

```bash
# Edit docker-compose.yml to set your database path
# Then run:
docker-compose up -d
```

## Project Structure

```
src/
├── lib/
│   ├── components/      # Svelte components
│   │   ├── cards/       # MediaCard, CoverImage
│   │   ├── filters/     # FilterPanel, SearchInput
│   │   ├── icons/       # Icon components (Language, Format, etc.)
│   │   └── layout/      # Header, ViewToggle
│   ├── server/          # Server-side code
│   │   ├── db.ts        # Database connection
│   │   ├── queries.ts   # SQL queries
│   │   └── cover-decoder.ts  # Cover image decoder
│   ├── stores/          # Svelte stores
│   ├── utils/           # Utility functions
│   └── constants.ts     # Enums and constants
├── routes/
│   ├── +page.svelte     # Main listing page
│   ├── movie/[id]/      # Movie detail page
│   ├── series/[id]/     # Series detail page
│   └── api/
│       └── cover/[id]/  # Cover image API
└── static/
    └── icons/           # UI icons
```

## Database Schema

The application reads from the following tables:

- `MOVIES` - Movie entries with metadata
- `SERIES` - TV series entries
- `SEASONS` - Series seasons
- `EPISODES` - Individual episodes
- `COVERS` - Cover image data (custom binary format)
- `GROUPS` - Movie/series groups with colors

## Cover Image Format

Covers are stored in a custom 4-bit indexed color format:
- Byte 0-1: Width and height
- Bytes 2-49: 16-color RGB palette
- Remaining: Pixel data (2 pixels per byte, high nibble first)

The `/api/cover/[id]` endpoint decodes this format to PNG.

## License

Private project.
