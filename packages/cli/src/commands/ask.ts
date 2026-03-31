import { Command } from "commander";
import { makeClient } from "../client.js";

export function askCommand(): Command {
  return new Command("ask")
    .description("Send a single prompt to Odin and print the reply.")
    .argument("<prompt...>", "the prompt text")
    .option("-m, --model <model>", "override the server's default model")
    .action(async (prompt: string[], opts) => {
      const client = await makeClient();
      const reply = await client.ask({
        prompt: prompt.join(" "),
        model: opts.model,
      });
      process.stdout.write(`${reply.title}\n\n${reply.answer}\n`);
    });
}
