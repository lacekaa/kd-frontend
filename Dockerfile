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
RUN npm run build -- --output-path=dist/kd-frontend

# ─── Stage 2: Serve with Nginx ───────────────────────────────────────────────────
FROM nginx:stable-alpine

# 4. Remove default static assets
RUN rm -rf /usr/share/nginx/html/*

# 5. Copy built files from the previous stage
COPY --from=build /app/dist/kd-frontend /usr/share/nginx/html

# 6. (Optional) If you use HTML5 pushState routing, add:
#    COPY nginx.conf /etc/nginx/conf.d/default.conf
#
#    And create an nginx.conf alongside this Dockerfile:
#    ```
#    server {
#      listen 80;
#      server_name _;
#      root /usr/share/nginx/html;
#      index index.html;
#      location / {
#        try_files $uri $uri/ /index.html;
#      }
#    }
#    ```

# 7. Expose port 80 and run Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
