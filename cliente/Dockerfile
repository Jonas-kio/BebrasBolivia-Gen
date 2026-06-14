# ──────────────────────────────────────────────
# Dockerfile — cliente (frontend Next.js)
# Multi-stage build: deps → build → runtime
# ──────────────────────────────────────────────

# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json ./
# No lock file in the cliente directory; install from package.json
RUN npm install --ignore-scripts

# ── Stage 2: Build ──
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set the API URL at build time so Next.js bakes it into the client bundle
ENV NEXT_PUBLIC_API_URL=http://localhost:4102/api/v1

RUN npm run build

# ── Stage 3: Runtime ──
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:4102/api/v1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Next.js standalone output copies only what's needed
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
