import { Command } from "commander";
import { makeClient } from "../client.js";
import { printAgentReply, spinner } from "../ui.js";

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
      const sp = spinner("odin is thinking…");
      try {
        const reply = await client.ask({
          prompt: prompt.join(" "),
          model: opts.model,
          maxOutputTokens: opts.maxTokens,
        });
        sp.stop();
        printAgentReply(reply);
      } catch (err) {
        sp.stop();
        throw err;
      }
    });
}
