# Odin Contracts

Foundry project with two small contracts:

- `OdinRegistry` — append-only registry of agent manifests. Anyone can publish, only the original publisher can deprecate their own entry.
- `OdinAccessPass` — minimal ERC-721 access pass, owner-mintable. Not required for the public beta.

## Build / test

```bash
cd contracts
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
forge test -vv
```

## Deploy (Sepolia)

```bash
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify
```

The registry has no admin and no upgrade path — once deployed, it is what it is.
