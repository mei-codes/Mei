# Odin Agent

Odin Agent is an open command portal for turning launch questions, product ideas, and technical decisions into usable next steps. It ships as three pieces that share a single contract surface:

- **`@odin/sdk`** — a small TypeScript SDK that wraps the Odin HTTP API.
- **`@odin/cli`** — a terminal client (`odin`) built on top of the SDK.
- **`@odin/server`** — a Fastify-based agent service that talks to OpenAI on the server side and exposes `/api/health` and `/api/agent`.
- **`contracts/`** — Solidity contracts (Foundry) for the on-chain registry and access pass.

This repository is the public beta (`v0.1.0-beta`). Nothing here is a managed service yet — you bring your own OpenAI key, run the server yourself, and (optionally) deploy the registry contract to any EVM chain.

## Why Odin

Most "agent" projects are either closed SaaS or research demos. Odin tries to sit in between: small, inspectable, and easy to self-host. The shape of the runtime — a portal that turns prompts into structured next steps — is heavily inspired by the open-agent work coming out of [Nous Research](https://nousresearch.com), in particular their stance that command interfaces should be readable end to end and replayable. Odin is not affiliated with Nous Research; the influence is on the interaction model, not the weights.

## Quick start

```bash
pnpm install
pnpm -r build

# run the server (needs OPENAI_API_KEY in the environment)
pnpm --filter @odin/server dev

# in another shell, talk to it
pnpm --filter @odin/cli build
node packages/cli/bin/odin.js ask "plan a Railway deploy"
```

The server reads its OpenAI key from `OPENAI_API_KEY` and is never reachable from the browser in this repo — there is no Next.js frontend by design. See [`docs/server.md`](docs/server.md) for the full env list.

## Layout

```
.
├── packages/
│   ├── sdk/        TypeScript SDK consumed by everything below
│   ├── cli/        `odin` command-line tool
│   └── server/     Fastify service exposing /api/health and /api/agent
├── contracts/      Foundry project: OdinRegistry + OdinAccessPass
├── examples/       small consumer programs (node, deploy script)
└── docs/           per-surface docs
```

## API surface

```http
GET  /api/health    → runtime status, version, provider, rate-limit posture
POST /api/agent     → { prompt, messages? } → { ok, answer, title, usage? }
```

A full schema lives in [`docs/server.md`](docs/server.md). The SDK and CLI both target this contract — if you replace the server with your own, anything that speaks the same shape will work.

## On-chain pieces

The `contracts/` folder is intentionally small:

- **`OdinRegistry.sol`** — append-only registry of agent manifests (name, version, contentHash). Anyone can publish, owners can deprecate their own entries.
- **`OdinAccessPass.sol`** — minimal ERC-721 access pass for gating private deployments. Not required for the public beta.

Foundry is the test runner. See [`docs/contracts.md`](docs/contracts.md).

## Status

- `v0.1.0-beta` — public beta. SDK + CLI + server + contracts all green on CI. No persistent memory, no auth, no managed hosting.
- Roadmap items (saved threads, tool bridge, account-gated portal) live in [`docs/roadmap.md`](docs/roadmap.md).

## License

MIT. See [`LICENSE`](LICENSE).
