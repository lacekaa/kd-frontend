# ─── Stage 1: Build Angular App ───────────────────────────────────────────────────
#docker build -t kd-frontend:latest .


FROM node:18-alpine AS build

# 1. Set working dir inside the container
WORKDIR /app

# 2. Copy package metadata & install dependencies
COPY package*.json ./
RUN npm ci

# 3. Copy source files & build
COPY . .
# outputPath is defined in angular.json as "dist/kd-frontend"
RUN npm run build

# ─── Stage 2: Serve with http-server ───────────────────────────────────────────────────
CMD ["npx", "http-server", "-p", "80", "dist/kd-frontend/browser"]

EXPOSE 80
