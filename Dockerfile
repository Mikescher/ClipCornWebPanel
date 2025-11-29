FROM node:24-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM node:24-alpine AS runner

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Copy built application
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

# Copy static assets
COPY static/ static/

# Set ownership
RUN chown -R sveltekit:nodejs /app

USER sveltekit

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", "build"]
