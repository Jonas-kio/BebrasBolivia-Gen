# ──────────────────────────────────────────────
# Dockerfile — servicio-usuario (backend Express)
# Multi-stage build: deps → build → runtime
# ──────────────────────────────────────────────

# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ── Stage 2: Build ──
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema prisma/schema.prisma

# Compile TypeScript
RUN npx tsc

# ── Stage 3: Runtime ──
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy only what we need
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

# Regenerate prisma client for the runtime OS
RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 4102

CMD ["node", "dist/src/server.js"]
