# Roadmap

Status of `v0.1.0-beta` and what's queued behind it.

## Shipped (0.1.0)

- `@odin/sdk` — typed client, error taxonomy, optional chain helpers.
- `@odin/server` — `/api/health`, `/api/agent`, dual-window rate limiter.
- `@odin/cli` — `ask`, `chat`, `health`, `registry get`.
- `contracts/` — `OdinRegistry`, `OdinAccessPass`, Foundry tests, deploy script.

## Next

1. **Persistent threads.** Move chat history out of the CLI process and into a server-side store (still no accounts — keyed by a client-generated thread id).
2. **Streaming.** SSE on `/api/agent/stream`. SDK gets an async-iterator method; CLI flushes tokens as they arrive.
3. **Tool bridge.** Opt-in shell / HTTP tools with an explicit allowlist per session.
4. **Runes.** Save repeatable prompt+tool procedures as reusable skills.
5. **Auth.** Bearer + optional `OdinAccessPass` gate, in that order.

## Design notes

The reason the public surface is intentionally small: most of the interesting work is in the *interaction* shape — title-then-body, single-source-of-truth response schema, predictable error codes — not the model layer underneath. Swapping providers (or pointing at a self-hosted Nous-style open model) only changes the runner in `packages/server/src/openai.ts`; the SDK and CLI never have to learn about it.
