# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
ENV PRISMA_SKIP_POSTINSTALL=1
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

FROM deps AS development
ENV NODE_ENV=development
COPY . .
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
CMD ["npm", "run", "dev", "-w", "@agenda-amiga/api"]

FROM deps AS builder
ENV NODE_ENV=production
COPY . .
RUN npm run build -w @agenda-amiga/shared && npm run build -w @agenda-amiga/api

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --omit=dev
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist
EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
