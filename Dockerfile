# Based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies in a deterministic way (lockfile-based).
# Use package-lock.json (npm) to avoid fetching unintended versions.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy environment variables for the build
ENV PAYLOAD_IGNORE_DATABASE=true
ENV DATABASE_URL=postgres://dummy:dummy@localhost:5432/dummy
ENV PAYLOAD_SECRET=dummy

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Remove this line if you do not have this folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Entrypoint vorbereiten
COPY --chown=nextjs:nodejs --chmod=755 entrypoint.sh ./entrypoint.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]

# Migration target
FROM base AS migration
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json
COPY next.config.ts ./next.config.ts
COPY src ./src
COPY migrate-entrypoint.sh ./migrate-entrypoint.sh
RUN chmod +x ./migrate-entrypoint.sh

ENTRYPOINT ["./migrate-entrypoint.sh"]
