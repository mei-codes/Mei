import { Command } from "commander";
import kleur from "kleur";

export function registryCommand(): Command {
  const cmd = new Command("registry")
    .description("Read entries from an on-chain OdinRegistry contract.");

  cmd
    .command("get")
    .argument("<address>", "registry contract address")
    .argument("<id>", "entry id (uint)")
    .option("-r, --rpc <url>", "RPC URL", process.env.RPC_URL ?? "")
    .action(async (address: string, idStr: string, opts) => {
      if (!opts.rpc) {
        throw new Error("missing --rpc or RPC_URL");
      }
      const { createPublicClient, http } = await import("viem");
      const { readRegistryEntry } = await import("@odin/sdk/chain");
      const client = createPublicClient({ transport: http(opts.rpc) });
      const entry = await readRegistryEntry(client, {
        registry: address as `0x${string}`,
        id: BigInt(idStr),
      });
      process.stdout.write(
        `${kleur.bold(entry.name)} ${kleur.dim("v" + entry.version)}\n` +
          `  publisher    ${entry.publisher}\n` +
          `  contentHash  ${entry.contentHash}\n` +
          `  uri          ${entry.uri}\n` +
          `  createdAt    ${new Date(Number(entry.createdAt) * 1000).toISOString()}\n` +
          (entry.deprecatedAt > 0n
            ? `  deprecatedAt ${new Date(Number(entry.deprecatedAt) * 1000).toISOString()}\n`
            : ""),
      );
    });

  return cmd;
}
