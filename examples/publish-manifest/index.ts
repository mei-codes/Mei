import { readFile } from "node:fs/promises";
import { createPublicClient, createWalletClient, http, keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { publishEntry, readTotalEntries } from "@odin/sdk/chain";

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`missing env: ${name}`);
  return v;
}

const rpcUrl = need("RPC_URL");
const registry = need("REGISTRY_ADDRESS") as `0x${string}`;
const pk = need("DEPLOYER_PRIVATE_KEY") as `0x${string}`;

const manifestPath = process.argv[2] ?? "./manifest.json";
const buf = await readFile(manifestPath);
const contentHash = keccak256(toHex(buf));

const account = privateKeyToAccount(pk);
const wallet = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });
const reader = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });

const before = await readTotalEntries(reader, registry);
console.log(`registry currently has ${before} entries`);

const txHash = await publishEntry(wallet, {
  registry,
  name: "example-agent",
  version: "0.1.0",
  contentHash,
  uri: `file://${manifestPath}`,
});
console.log(`published, tx=${txHash}`);
