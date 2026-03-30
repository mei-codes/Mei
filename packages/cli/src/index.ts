import { Command } from "commander";
import { CLI_VERSION } from "./version.js";

async function main() {
  const program = new Command();
  program.name("odin").description("Terminal client for the Odin Agent").version(CLI_VERSION);
  await program.parseAsync(process.argv);
}

main();
