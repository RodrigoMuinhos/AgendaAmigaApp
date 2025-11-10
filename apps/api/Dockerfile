#
# API Dockerfile (monorepo-aware)
#   - build context must be the repository root
#   - supports development and production targets
#
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

WORKDIR /app
ENV CI=true \
    PRISMA_SKIP_POSTINSTALL=1 \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false

# toolchain required by Prisma + dev ergonomics
RUN apk add --no-cache bash curl openssl libc6-compat postgresql-client
RUN npm install -g npm@11.6.2

# Workspace dependency layer (npm workspaces)
FROM base AS deps
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci --workspaces --ignore-scripts

# Copy source code after installing dependencies (better cache)
FROM deps AS source
COPY packages/shared packages/shared
COPY apps/api apps/api

# Dev image used by docker-compose (hot reload, ts-node, etc)
FROM source AS development
ENV NODE_ENV=development
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
EXPOSE 3000 5555
CMD ["npm", "run", "dev", "-w", "@agenda-amiga/api"]

# Builder image for production artifacts
FROM source AS builder
ENV NODE_ENV=production
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build -w @agenda-amiga/shared && npm run build -w @agenda-amiga/api

# Normalize nest ts dist path if tsc emitted apps/api/src prefix
RUN if [ -d "apps/api/dist/apps/api/src" ]; then \
      mkdir -p apps/api/dist.tmp && \
      cp -r apps/api/dist/apps/api/src/. apps/api/dist.tmp/ && \
      rm -rf apps/api/dist && \
      mv apps/api/dist.tmp apps/api/dist; \
    fi

# Final runtime layer (Render/heroku style)
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false

RUN apk add --no-cache curl openssl libc6-compat

# Node + workspace runtime deps
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# API build + prisma schema
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Shared artifacts (workspace local package)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# Link @agenda-amiga/shared to workspace folder
RUN mkdir -p node_modules/@agenda-amiga && \
    rm -rf node_modules/@agenda-amiga/shared && \
    ln -s ../../packages/shared node_modules/@agenda-amiga/shared

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD sh -c "curl -fsS http://localhost:${PORT:-3000}/health || exit 1"

CMD sh -c "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/index.js"
