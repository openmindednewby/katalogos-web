# Stage 1: Build the Expo Web App
FROM node:20-alpine AS builder
# IMPORTANT: Build with repo root as context (.) so we can access workspace packages
WORKDIR /app

# Install client dependencies using lockfile
COPY clients/OnlineMenuClientApp/package.json clients/OnlineMenuClientApp/package-lock.json ./
# Local workspace deps referenced via `file:` (e.g. `../packages/identity-client`)
COPY clients/packages/identity-client /packages/identity-client
# Use npm ci when possible; fall back to legacy peer dep resolution if needed
RUN npm ci --no-audit --prefer-offline || npm install --no-audit --prefer-offline --legacy-peer-deps

# Copy client source
COPY clients/OnlineMenuClientApp/. ./

# Build for production (Expo static export)
# Allow selecting environment at build time (dev|test|prod)
ARG APP_ENV=test
ENV EXPO_PUBLIC_ENV=$APP_ENV
RUN echo "Building Quiz Manager Web for ENV=$EXPO_PUBLIC_ENV" \
  && npx expo export --platform web

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production

# Copy built static files (Expo exports to /app/dist)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration if present
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
