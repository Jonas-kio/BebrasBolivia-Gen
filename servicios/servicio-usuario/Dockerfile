# ──────────────────────────────────────────────
# Dockerfile — servicio-usuario (backend Express)
# Usa tsx para ejecutar TypeScript directamente
# ──────────────────────────────────────────────

# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Runtime ──
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 4102

# Usa tsx (el mismo que dev) para evitar problemas con ES modules y extensiones .js
CMD ["npx", "tsx", "src/server.ts"]
