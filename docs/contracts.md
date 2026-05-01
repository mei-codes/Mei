# Contracts

Two contracts live in `contracts/src/`:

## `OdinRegistry`

Append-only registry. Each entry stores:

- `publisher` — `msg.sender` at publish time.
- `name`, `version` — non-empty strings.
- `contentHash` — non-zero `bytes32`, expected to be a keccak256 of the off-chain manifest.
- `uri` — up to 512 bytes (`ipfs://`, `https://`, `ar://`…).
- `createdAt`, `deprecatedAt` — `uint64` unix seconds.

Public methods:

| Function | Purpose |
| --- | --- |
| `publish(name, version, contentHash, uri) → id` | Anyone can call. Returns the new entry id (starts at 1). |
| `deprecate(id)` | Only the original publisher. Sets `deprecatedAt`. |
| `entries(id) → (…)` | Reverts on unknown id. |
| `isActive(id) → bool` | True if the entry exists and is not deprecated. |
| `totalEntries() → uint256` | Number of entries published so far. |

Events: `Published(id, publisher, contentHash)`, `Deprecated(id, publisher)`.

No admin, no owner, no upgrade path. Tests cover empty-input, bad-actor, double-deprecation, and unknown-id paths in `contracts/test/OdinRegistry.t.sol`.

## `OdinAccessPass`

Minimal ERC-721. Owner-mintable. Soulbound by default — the owner can flip `setTransferable(true)` once, after which holders can transfer normally.

This contract is **optional** for the beta. Public deployments do not require it; private deployments can mint a pass and require it server-side before processing a request.

## Foundry

```bash
cd contracts
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge test -vv
```

## Deploying

```bash
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify
```

Set `DEPLOY_ACCESS_PASS=true` to also deploy `OdinAccessPass` in the same broadcast. Without it, only the registry is deployed.
