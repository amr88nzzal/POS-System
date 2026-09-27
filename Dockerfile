# =========================================================
# Multi-stage Dockerfile for POS Admin & Cashier Application
# =========================================================

# Stage 1: Build the frontend and bundle the server
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Build Vite frontend + esbuild server.ts bundle
RUN npm run build

# Stage 2: Production runtime environment
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start Node production server
CMD ["node", "dist/server.cjs"]
