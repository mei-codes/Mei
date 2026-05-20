# @odin/server

Fastify service for Odin. Owns the OpenAI key, applies a two-window rate limit, exposes `/api/health` and `/api/agent`.

```bash
cp ../../.env.example .env
pnpm install
pnpm --filter @odin/server dev
```

See [`../../docs/server.md`](../../docs/server.md) for the full environment and route reference.
