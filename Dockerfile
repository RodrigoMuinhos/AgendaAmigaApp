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

# Alinha npm com o packageManager da raiz (suporte a "workspace:*")
RUN npm i -g npm@11.6.2

################################
# Camada de dependências (NPM) #
################################
FROM base AS deps

# Copiamos somente manifests que afetam resolução de deps (melhora cache)
# O lockfile é opcional (usa * para não falhar se estiver ausente)
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

# Instala TODAS as deps do monorepo
# - Se houver lock: npm ci
# - Senão: npm install
# legacy-peer-deps evita travas por peer deps antigas
RUN if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps ; \
    else \
      npm install --legacy-peer-deps ; \
    fi

#########################################
# Imagem de desenvolvimento da nossa API#
#########################################
FROM deps AS development
ENV NODE_ENV=development

# Código
COPY . .

# Gera Prisma Client (musl) para ambiente dev
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Portas utilizadas em dev (ajuste conforme seu compose)
EXPOSE 3000
EXPOSE 5555

# Em dev, normalmente quem sobe é o docker-compose (scripts npm)
CMD ["node", "-e", "console.log('Use docker compose para subir o serviço em dev')"]

##############################
# Build de produção (builder)#
##############################
FROM deps AS builder
ENV NODE_ENV=production

# Código
COPY . .

# 1) Gerar Prisma Client (produção)
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# 2) Build dos pacotes (ajuste se seus scripts forem outros)
RUN npm run build -w @agenda-amiga/shared && \
    npm run build -w @agenda-amiga/api

# 3) Normaliza a pasta dist da API (em alguns setups o TS gera prefixo apps/api/src)
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

# Garantir mesma versão do npm no runtime
RUN npm i -g npm@11.6.2

# Copia apenas manifests necessários (cache melhor)
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

# Instala deps de produção dos WORKSPACES (cria links em node_modules)
# Usamos `npm install` para evitar EUNSUPPORTEDPROTOCOL com workspace:* em locks antigos/mistos
RUN npm install --omit=dev --ignore-scripts --workspaces --no-audit --no-fund

# Copia artefatos buildados
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist

# (Opcional) Copiar schema do Prisma se a API ler em runtime
COPY apps/api/prisma apps/api/prisma

# Porta usada em produção
EXPOSE 3000

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:3000/health || exit 1

# Start da API
CMD ["node", "apps/api/dist/index.js"]
