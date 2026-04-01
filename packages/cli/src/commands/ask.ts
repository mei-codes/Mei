import { Command } from "commander";
import { makeClient } from "../client.js";
import { printAgentReply } from "../ui.js";

export function askCommand(): Command {
  return new Command("ask")
    .description("Send a single prompt to Odin and print the reply.")
    .argument("<prompt...>", "the prompt text")
    .option("-m, --model <model>", "override the server's default model")
    .option(
      "-t, --max-tokens <count>",
      "cap on output tokens",
      (v) => Number.parseInt(v, 10),
    )
    .action(async (prompt: string[], opts) => {
      const client = await makeClient();
      const reply = await client.ask({
        prompt: prompt.join(" "),
        model: opts.model,
        maxOutputTokens: opts.maxTokens,
      });
      printAgentReply(reply);
    });
}
