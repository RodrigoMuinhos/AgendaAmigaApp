# syntax=docker/dockerfile:1

##############################
# Base leve com utilitários #
##############################
FROM node:20-alpine AS base
WORKDIR /app

# Variáveis úteis
ENV CI=true \
    PNPM_HOME="/root/.local/share/pnpm" \
    PRISMA_SKIP_POSTINSTALL=1

# utilitários úteis (inclui libs para Prisma em Alpine)
RUN apk add --no-cache \
    bash \
    curl \
    postgresql-client \
    openssl \
    libc6-compat

# Alinha npm com o packageManager da raiz
RUN npm i -g npm@11.6.2

#########################################
# Stage de desenvolvimento (opcional)   #
#########################################
FROM base AS development
ENV NODE_ENV=development

# Código completo (dev usa tudo)
COPY . .

# Gera Prisma Client (musl) para ambiente dev
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

EXPOSE 3000 5555
CMD ["node", "-e", "console.log('Use docker compose para subir o serviço em dev')"]

##############################
# Build de produção (builder)#
##############################
FROM base AS builder
ENV NODE_ENV=development

# Copiamos o repositório completo (workspaces, file: e tudo)
COPY . .

# 1) Instala TODAS as deps (dev+prod) com workspaces
#    (install ao invés de ci para tolerar lock "misto" e manter scripts bloqueados)
RUN npm install --ignore-scripts --workspaces --no-audit --no-fund

# 2) Gera Prisma Client para produção (usa schema da API)
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# 3) Build dos pacotes (shared primeiro; depois api)
RUN npm run build -w @agenda-amiga/shared && \
    npm run build -w @agenda-amiga/api

# 4) Normaliza a pasta dist da API, se necessário
RUN if [ -d "apps/api/dist/apps/api/src" ]; then \
      mkdir -p apps/api/dist.tmp && \
      cp -r apps/api/dist/apps/api/src/. apps/api/dist.tmp/ && \
      rm -rf apps/api/dist && \
      mv apps/api/dist.tmp apps/api/dist; \
    fi

##################################
# Runtime de produção (Render)   #
##################################
FROM node:20-alpine AS production
WORKDIR /app

# Ambiente de produção + segurança
ENV NODE_ENV=production \
    HUSKY=0 \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    npm_config_ignore_scripts=true

# Dependências mínimas para runtime
RUN apk add --no-cache curl openssl libc6-compat

# Garante mesma versão do npm
RUN npm i -g npm@11.6.2

# Copia manifests p/ metadados (mantém integridade do node_modules copiado)
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

# Copia node_modules resolvido no builder (evita rodar npm ci com "file:")
COPY --from=builder /app/node_modules ./node_modules

# Poda para produção (remove devDeps)
RUN npm prune --omit=dev --no-audit --no-fund || true

# Copia artefatos buildados
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist

# (Opcional) Copiar schema do Prisma se a API ler em runtime
COPY apps/api/prisma apps/api/prisma

# 🔗 Garante que @agenda-amiga/shared fique resolvível em runtime
RUN mkdir -p node_modules/@agenda-amiga && \
    rm -rf node_modules/@agenda-amiga/shared && \
    ln -s ../../packages/shared node_modules/@agenda-amiga/shared

# Porta usada em produção
EXPOSE 3000

# Healthcheck simples (ajuste a rota se a sua for diferente)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:3000/health || exit 1

# Start da API
CMD ["node", "apps/api/dist/index.js"]
