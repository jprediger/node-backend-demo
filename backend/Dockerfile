FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src/

# Gera tipos do Prisma antes do tsc
RUN pnpm exec prisma generate
RUN pnpm run build:ts


FROM node:20-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN pnpm exec prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Use PORT do Railway (ou 8080 local)
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node node_modules/fastify-cli/cli.js start -l info -a 0.0.0.0 -p ${PORT:-8080} dist/src/app.js"]