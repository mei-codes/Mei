import { Command } from "commander";
import { askCommand } from "./commands/ask.js";
import { chatCommand } from "./commands/chat.js";
import { healthCommand } from "./commands/health.js";
import { CLI_VERSION } from "./version.js";

async function main() {
  const program = new Command();
  program.name("odin").description("Terminal client for the Odin Agent").version(CLI_VERSION);
  program.addCommand(askCommand());
  program.addCommand(chatCommand());
  program.addCommand(healthCommand());

  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    process.stderr.write(`error: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

main();
