# Femxo frontend: Next.js standalone server.
#
#   docker build -t femxo-frontend \
#     --build-arg FEMXO_API_ORIGIN=http://api:3000 .
#   docker run -p 3001:3001 femxo-frontend
#
# FEMXO_API_ORIGIN and NEXT_PUBLIC_* are read at build time (rewrites and
# public env are baked into the build), so pass them as build args.

FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.20.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG FEMXO_API_ORIGIN=http://localhost:3000
ARG NEXT_PUBLIC_API_BASE_URL=
# Demo sign-in stays off in production unless explicitly enabled for a
# public test deployment.
ARG NEXT_PUBLIC_AUTH_DEMO_MODE=false
ENV FEMXO_API_ORIGIN=$FEMXO_API_ORIGIN \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_AUTH_DEMO_MODE=$NEXT_PUBLIC_AUTH_DEMO_MODE \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0
# The standalone server serves public/ and .next/static once they sit beside it.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/" > /dev/null || exit 1
CMD ["node", "server.js"]
