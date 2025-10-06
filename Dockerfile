# syntax=docker/dockerfile:1

# ---------- base ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- deps (instala dependências com dev) ----------
FROM base AS deps
# Copiamos apenas manifests para aproveitar cache de dependências
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
# Se sua raiz usa workspaces no package.json, npm ci já resolve tudo
RUN npm ci

# ---------- development (hot-reload) ----------
FROM deps AS development
ENV NODE_ENV=development
# Copiamos o código inteiro só agora (cache de deps preservado)
COPY . .
# Use o script que preferir (ajuste se usa "dev:api" na raiz)
CMD ["npm", "run", "dev", "-w", "@agenda-amiga/api"]

# ---------- builder (compila TS -> JS) ----------
FROM deps AS builder
ENV NODE_ENV=production
COPY . .
# Garanta que o shared builda antes da API
RUN npm run build -w @agenda-amiga/shared && npm run build -w @agenda-amiga/api

# ---------- production (runtime enxuto) ----------
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Só manifests para instalar deps de runtime (sem dev)
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --omit=dev

# Copiamos apenas os artefatos necessários do build
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist
# (se a API lê .env em runtime, monte via docker-compose; evitar copiar .env para a imagem)

EXPOSE 3000
# Se você tem script "start:api" na raiz, pode usar:
# CMD ["npm", "run", "start:api"]
# Como garantimos CJS, dá pra chamar direto o Node:
CMD ["node", "apps/api/dist/index.js"]
