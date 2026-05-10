# @odin/sdk

Tiny TypeScript SDK for the Odin Agent HTTP API. No transitive dependencies beyond `zod`.

```ts
import { OdinClient } from "@odin/sdk";

const odin = new OdinClient({ baseUrl: "http://localhost:3030" });

const health = await odin.health();
if (!health.ok) throw new Error("odin is down");

const reply = await odin.ask({
  prompt: "plan a Railway deploy for a Fastify app",
});

console.log(reply.title);
console.log(reply.answer);
```

## Optional chain helpers

`@odin/sdk/chain` re-exports read-only helpers against the `OdinRegistry` contract. `viem` is a peer dependency — install it if you want to use this entry point.

```ts
import { readRegistryEntry } from "@odin/sdk/chain";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const client = createPublicClient({ chain: sepolia, transport: http() });
const entry = await readRegistryEntry(client, {
  registry: "0x...",
  id: 1n,
});
```

See [`../../docs/sdk.md`](../../docs/sdk.md) for the full API surface.
