# Stage 1: Install dependencies
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

# Native build tools for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build the Next.js application
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Create a fallback server.ts if another agent has not created it yet
RUN if [ ! -f server.ts ]; then \
    printf 'import next from "next";\nimport { createServer } from "http";\n\nconst port = parseInt(process.env.PORT || "3000", 10);\nconst dev = process.env.NODE_ENV !== "production";\nconst app = next({ dev });\nconst handle = app.getRequestHandler();\n\napp.prepare().then(() => {\n\tcreateServer((req, res) => {\n\t\thandle(req, res);\n\t}).listen(port);\n\tconsole.log(`> Server listening at http://localhost:${port} as ${dev ? "development" : process.env.NODE_ENV}`);\n});\n' > server.ts; \
    fi

RUN pnpm build

# Stage 3: Production runner
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy node_modules (needed because custom server is incompatible with standalone output)
COPY --from=builder /app/node_modules ./node_modules

# Copy built Next.js output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy custom server
COPY --from=builder /app/server.ts ./server.ts

# Copy database schema and migrations
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/schema ./schema
COPY --from=builder /app/lib ./lib

# Copy config files needed at runtime
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/next.config.ts ./next.config.ts

# Create data directory for SQLite and set ownership
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
