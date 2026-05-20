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

## Live deployments

| Chain | Contract | Address |
| --- | --- | --- |
| Base mainnet (8453) | `OdinRegistry` | [`0x65099C6B2490D85eaB22a76aA9771E3afd65a4ca`](https://basescan.org/address/0x65099c6b2490d85eab22a76aa9771e3afd65a4ca#code) |
