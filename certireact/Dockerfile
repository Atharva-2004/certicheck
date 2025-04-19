# === Build Stage ===
FROM node:18 AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependency files first
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of your project
COPY . .

# Build your frontend
RUN pnpm run build

# === Production Stage ===
FROM node:18

WORKDIR /app

# Install serve globally to serve the build
RUN npm install -g serve

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "3000"]
