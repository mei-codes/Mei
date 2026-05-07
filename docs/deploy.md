# Deploy

The server is the only piece that needs hosting. The SDK and CLI are libraries; the contracts go to a chain.

## Railway

1. Create a new service from this repo.
2. Build command: `pnpm install --frozen-lockfile && pnpm --filter @odin/server build`
3. Start command: `pnpm --filter @odin/server start`
4. Variables: at minimum `OPENAI_API_KEY`. `PORT` is injected automatically.
5. Optionally set `OPENAI_MODEL`, `ODIN_RATE_LIMIT_PER_MINUTE`, `ODIN_RATE_LIMIT_PER_DAY`.

There is no database, so no `prisma migrate deploy` step is required. The build phase does not need network access beyond npm.

## Fly.io

```toml
# fly.toml
app = "odin-agent"
primary_region = "iad"

[build]
  builder = "paketobuildpacks/builder:base"

[[services]]
  internal_port = 3030
  protocol = "tcp"
  [[services.ports]]
    port = 80
    handlers = ["http"]
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

Set `OPENAI_API_KEY` via `fly secrets set OPENAI_API_KEY=…`.

## Docker (manual)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile && pnpm -r build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
ENV NODE_ENV=production
EXPOSE 3030
CMD ["node", "packages/server/dist/index.js"]
```
