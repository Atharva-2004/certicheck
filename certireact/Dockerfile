# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependency files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of your project
COPY . .

# Set environment variable
ENV VITE_BASE_URL=http://localhost:8000

# Build your frontend
RUN pnpm run build

# Install `serve` to serve the production build
RUN npm install -g serve


# Expose port
EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "3000"]
