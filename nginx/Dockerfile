FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_STATIC_URL=https://cdn.jsdelivr.net/gh/mazazyrik/park_maximum@main/frontend/src/assets/images
ENV VITE_STATIC_URL=$VITE_STATIC_URL

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.init.conf /etc/nginx/conf.d/default.conf
COPY nginx/includes /etc/nginx/includes

EXPOSE 80 443
