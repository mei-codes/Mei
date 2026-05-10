# SDK

`@odin/sdk` is the canonical TypeScript client. It is small (one file of real logic plus `zod` schemas), runs in Node and in any modern fetch-capable runtime, and ships its own types.

## Install

```bash
pnpm add @odin/sdk
# optional, only if you want chain helpers
pnpm add viem
```

## Constructor

```ts
new OdinClient({
  baseUrl: "http://localhost:3030",
  apiKey,            // optional Bearer token
  fetch,             // optional custom fetch implementation
  timeoutMs: 30_000, // default
  defaultHeaders,    // merged into every request
  userAgent,         // overrides the default "odin-sdk/0.1.0"
});
```

`baseUrl` is required. Trailing slashes are stripped, so `http://x/` and `http://x` behave the same.

## Methods

### `health(signal?)`

Returns `HealthResponse`. Throws `OdinValidationError` if the server returns a body that doesn't match the schema.

### `ask({ prompt, messages?, model?, maxOutputTokens?, signal? })`

Returns `AgentResponse`. The `messages` array is the conversation history to attach — the new `prompt` is appended on the server.

## Errors

All thrown errors extend `OdinError`:

| Class | When |
| --- | --- |
| `OdinNetworkError` | Network failed, request aborted, or request timed out. |
| `OdinRateLimitError` | HTTP 429. Carries `retryAfterSeconds` when the server provided it. |
| `OdinHttpError` | Any other non-2xx response. Carries `status`, `code`, `details`. |
| `OdinValidationError` | Server returned 2xx but the body did not match the response schema. |

```ts
try {
  await odin.ask({ prompt: "…" });
} catch (err) {
  if (err instanceof OdinRateLimitError) {
    await sleep((err.retryAfterSeconds ?? 1) * 1000);
  } else {
    throw err;
  }
}
```

## Chain entry point

`@odin/sdk/chain` is a thin layer over the registry contract. It re-exports the ABI, plus three helpers:

```ts
readRegistryEntry(publicClient, { registry, id });
readTotalEntries(publicClient, registry);
publishEntry(walletClient, { registry, name, version, contentHash, uri });
```

`viem` is a peer dependency. The SDK does not bundle it — if you don't import from `@odin/sdk/chain`, you don't pay for it.
