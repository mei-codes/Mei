import type { PublicClient, WalletClient } from "viem";

export const odinRegistryAbi = [
  {
    type: "function",
    name: "publish",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "contentHash", type: "bytes32" },
      { name: "uri", type: "string" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "deprecate",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "entries",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "publisher", type: "address" },
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "contentHash", type: "bytes32" },
      { name: "uri", type: "string" },
      { name: "createdAt", type: "uint64" },
      { name: "deprecatedAt", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "totalEntries",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "Published",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "publisher", type: "address" },
      { indexed: false, name: "contentHash", type: "bytes32" },
    ],
  },
  {
    type: "event",
    name: "Deprecated",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "publisher", type: "address" },
    ],
  },
] as const;

export interface RegistryEntry {
  publisher: `0x${string}`;
  name: string;
  version: string;
  contentHash: `0x${string}`;
  uri: string;
  createdAt: bigint;
  deprecatedAt: bigint;
}

export interface ReadEntryArgs {
  registry: `0x${string}`;
  id: bigint;
}

export async function readRegistryEntry(
  client: PublicClient,
  args: ReadEntryArgs,
): Promise<RegistryEntry> {
  const tuple = (await client.readContract({
    address: args.registry,
    abi: odinRegistryAbi,
    functionName: "entries",
    args: [args.id],
  })) as readonly [
    `0x${string}`,
    string,
    string,
    `0x${string}`,
    string,
    bigint,
    bigint,
  ];
  const [publisher, name, version, contentHash, uri, createdAt, deprecatedAt] =
    tuple;
  return { publisher, name, version, contentHash, uri, createdAt, deprecatedAt };
}

export async function readTotalEntries(
  client: PublicClient,
  registry: `0x${string}`,
): Promise<bigint> {
  return (await client.readContract({
    address: registry,
    abi: odinRegistryAbi,
    functionName: "totalEntries",
  })) as bigint;
}

export interface PublishArgs {
  registry: `0x${string}`;
  name: string;
  version: string;
  contentHash: `0x${string}`;
  uri: string;
}

export async function publishEntry(
  wallet: WalletClient,
  args: PublishArgs,
): Promise<`0x${string}`> {
  const account = wallet.account;
  if (!account) {
    throw new Error("wallet client has no account attached");
  }
  return wallet.writeContract({
    account,
    chain: wallet.chain ?? null,
    address: args.registry,
    abi: odinRegistryAbi,
    functionName: "publish",
    args: [args.name, args.version, args.contentHash, args.uri],
  });
}
