import type { PublicClient } from "viem";

export const odinRegistryAbi = [
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
  const [publisher, name, version, contentHash, uri, createdAt, deprecatedAt] = tuple;
  return { publisher, name, version, contentHash, uri, createdAt, deprecatedAt };
}
