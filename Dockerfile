# Stage 1: Build the Expo Web App
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
# Use npm ci when possible; fall back to legacy peer dep resolution if needed
RUN npm ci --no-audit --prefer-offline || npm install --no-audit --prefer-offline --legacy-peer-deps

# Copy all project files
COPY . .

# Build for production (Expo static export)
# Allow selecting environment at build time (dev|test|prod)
ARG APP_ENV=prod
ENV EXPO_PUBLIC_ENV=$APP_ENV
RUN echo "Building Katalogos Web for ENV=$EXPO_PUBLIC_ENV" && npx expo export --platform web

# Inject the Umami analytics tag into every exported HTML page.
# Expo's static export strips <script> elements from app/+html.tsx, so the
# tag is added here as a post-export step instead.
RUN find dist -name '*.html' -exec sed -i 's#</head>#<script defer src="https://analytics.dloizides.com/script.js" data-website-id="493b52aa-6e97-4bb5-95ab-056e7e90b4aa"></script></head>#' {} +

# Inject SEO meta (Open Graph / Twitter / canonical) — Expo's static export
# strips these from app/+html.tsx, same as it strips <script>.
RUN find dist -name '*.html' -exec sed -i 's#</head>#<meta property="og:title" content="Katalogos - Your menu, online in minutes"><meta property="og:description" content="Build a beautiful digital menu for your restaurant. QR code per table, real-time updates, multi-language. Free trial, no credit card required."><meta property="og:type" content="website"><meta property="og:url" content="https://katalogos.dloizides.com"><meta property="og:image" content="https://katalogos.dloizides.com/icons/logo-512.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Katalogos - Your menu, online in minutes"><meta name="twitter:description" content="Build a beautiful digital menu for your restaurant. QR code per table, real-time updates, multi-language."><link rel="canonical" href="https://katalogos.dloizides.com"><meta name="robots" content="index, follow">#' {} +

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production
LABEL org.opencontainers.image.authors="dloizides.com"
LABEL org.opencontainers.image.vendor="dloizides.com"
LABEL org.opencontainers.image.title="Katalogos"
LABEL built-by="dloizides.com"

# Copy built static files (Expo exports to /app/dist)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional, if exists)
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
