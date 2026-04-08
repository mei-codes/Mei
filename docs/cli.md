# CLI

Install once at the workspace root:

```bash
pnpm install
pnpm --filter @odin/cli build
```

Then `node packages/cli/bin/odin.js …`. When published to npm, `npm i -g @odin/cli`
makes plain `odin` available.

## Config

The CLI resolves settings in this order:

1. `ODIN_BASE_URL`, `ODIN_API_KEY` environment variables.
2. `~/.odinrc` (JSON): `{ "baseUrl": "...", "apiKey": "..." }`.
3. Built-in defaults.

## Commands

- `odin ask <prompt…>` — single-shot question.
- `odin chat` — interactive session, `/clear` resets, `/exit` quits.
- `odin health` — ping the server.
