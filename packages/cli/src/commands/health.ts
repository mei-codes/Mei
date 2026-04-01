import { Command } from "commander";
import { makeClient } from "../client.js";
import { printHealth } from "../ui.js";

export function healthCommand(): Command {
  return new Command("health")
    .description("Check whether the configured Odin server is reachable.")
    .action(async () => {
      const client = await makeClient();
      const health = await client.health();
      printHealth(health);
      if (!health.ok) process.exitCode = 1;
    });
}
