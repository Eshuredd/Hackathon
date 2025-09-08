# Production Dockerfile for Next.js frontend

# --- build stage ---
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build
COPY . .
# Rely on .env.local copied above for NEXT_PUBLIC_* at build time

RUN npm run build

# --- runtime stage ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 80
CMD ["npm", "run", "start", "--", "-p", "80"]


