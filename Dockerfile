# syntax=docker/dockerfile:1
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN npx --yes yarn@1.22.22 install --frozen-lockfile --production --ignore-scripts && npx --yes yarn@1.22.22 cache clean && npm cache clean --force

FROM node:24-alpine
ENV NODE_ENV=production PORT=3001
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chmod=0444 package.json index.js ./
COPY --chmod=0555 routes ./routes
USER node
EXPOSE 3001
# TCP-only check: an HTTP request would trigger the Discord webhook middleware.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "require(\"net\").connect(3001,\"127.0.0.1\").on(\"connect\",()=>process.exit(0)).on(\"error\",()=>process.exit(1))"]
CMD ["node", "index.js"]
