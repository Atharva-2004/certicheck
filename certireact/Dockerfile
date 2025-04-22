# === Build Stage ===
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependencies and install
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source and build
COPY . .
RUN pnpm run build

# === Production Stage ===
FROM node:18-alpine

WORKDIR /app

# Install only what's needed to serve files
RUN npm install -g serve

# Copy built files only
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Serve static files
CMD ["serve", "-s", "dist", "-l", "3000"]
