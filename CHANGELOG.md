# Changelog

All notable changes land here in reverse-chronological order.

## 0.1.0 — 2026-05-21

First public beta. Everything below is in this release.

### Added

- `@odin/sdk` — `OdinClient`, schema-validated responses, typed error classes, optional `@odin/sdk/chain` entry point.
- `@odin/server` — Fastify service exposing `/api/health` and `/api/agent`, with a dual-window per-IP rate limiter and a real OpenAI client.
- `@odin/cli` — `odin ask`, `odin chat`, `odin health`, `odin registry get`. Config resolves from env → `~/.odinrc` → defaults.
- `contracts/OdinRegistry.sol` — append-only manifest registry with publisher-scoped deprecation.
- `contracts/OdinAccessPass.sol` — soulbound-by-default ERC-721 access pass.
- `contracts/script/Deploy.s.sol` — single-shot Foundry deploy.
- `examples/node-ask`, `examples/publish-manifest` — minimal consumer programs for the SDK and the chain helpers.
- CI: pnpm workspace build + tests, Foundry build + tests, both on every PR.

### Notes

- No persistent memory yet. Chat history lives in the CLI process only.
- No auth yet. The portal is public; lock it behind an `OdinAccessPass` if you need to.
- The shape of the interaction (title-then-body, single response schema) is intentional and influenced by Nous Research's open-agent work.
