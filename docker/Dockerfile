FROM node:22.1.0-alpine as builder

  WORKDIR /app
  COPY ../ ./
  RUN npm ci && \
      npm run build && \
      npm ci --omit=dev

FROM node:22.1.0-alpine

  WORKDIR /app

  COPY --from=builder /app/configs ./configs
  COPY --from=builder /app/dst ./dst
  COPY --from=builder /app/migrations ./migrations
  COPY --from=builder /app/node_modules ./node_modules

  COPY ../config.prod.yml ./config.yml
  COPY ../docker/entrypoint.sh ./entrypoint.sh
  COPY ../package.json ./package.json

  CMD ./entrypoint.sh
