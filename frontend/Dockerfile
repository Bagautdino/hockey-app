# -- Frontend: React (Vite) build-only container --
# Build context: repo root (.) because package.json, src/, etc. live at root.
#
# This image is NOT a long-running server. It builds the React app and copies
# the output into /build. In docker-compose.prod.yml, the `frontend-build`
# service runs once and copies dist/ into the `frontend_dist` named volume.
# The main nginx container then mounts that volume to serve static files.
#
# This eliminates the "frontend upstream not found" and 502 problems entirely.

FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

COPY index.html ./
COPY tsconfig.json tsconfig.node.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

# Final stage: tiny image with just the built files.
# The entrypoint copies them into the mounted volume and exits.
FROM alpine:3.20
COPY --from=builder /app/dist /build
CMD ["cp", "-a", "/build/.", "/dist/"]
