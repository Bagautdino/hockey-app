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

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
