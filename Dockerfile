# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
ENV CI=true PRISMA_SKIP_POSTINSTALL=1 NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false
RUN apk add --no-cache bash curl openssl libc6-compat postgresql-client
RUN npm i -g npm@11.6.2

FROM base AS builder
# Copia manifests e tsconfig base para resolver workspaces e extends
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
# Instala todas deps dos workspaces sem rodar scripts
RUN npm ci --workspaces --ignore-scripts
# Copia o código
COPY packages/shared packages/shared
COPY apps/api apps/api
# Prisma client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
# Build shared e api
RUN npm run build -w @agenda-amiga/shared && npm run build -w @agenda-amiga/api
# Normaliza dist (no-op se não precisar)
RUN if [ -d "apps/api/dist/apps/api/src" ]; then \
      mkdir -p apps/api/dist.tmp && \
      cp -r apps/api/dist/apps/api/src/. apps/api/dist.tmp/ && \
      rm -rf apps/api/dist && \
      mv apps/api/dist.tmp apps/api/dist; \
    fi

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false
RUN apk add --no-cache curl openssl libc6-compat
# Copia runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
# Copia artefatos do shared (workspace local)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
# Link simbólico para resolver @agenda-amiga/shared
RUN mkdir -p node_modules/@agenda-amiga && \
    rm -rf node_modules/@agenda-amiga/shared && \
    ln -s ../../packages/shared node_modules/@agenda-amiga/shared
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD sh -c "curl -fsS http://localhost:${PORT:-3000}/health || exit 1"
CMD sh -c "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/index.js"
