import { Command } from "commander";
import readline from "node:readline";
import type { AgentMessage } from "@odin/sdk";
import { makeClient } from "../client.js";
import { printAgentReply } from "../ui.js";

export function chatCommand(): Command {
  return new Command("chat")
    .description("Interactive Odin session in the terminal.")
    .option("-m, --model <model>", "override the server's default model")
    .action(async (opts) => {
      const client = await makeClient();
      const history: AgentMessage[] = [];

      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const prompt = () => rl.question("you ➜ ", handle);

      const handle = async (line: string) => {
        const text = line.trim();
        if (!text) return prompt();
        if (text === "/exit" || text === "/quit") {
          rl.close();
          return;
        }
        if (text === "/clear") {
          history.length = 0;
          process.stdout.write("history cleared.\n");
          return prompt();
        }

        try {
          const reply = await client.ask({ prompt: text, messages: history, model: opts.model });
          printAgentReply(reply);
          history.push({ role: "user", content: text });
          history.push({ role: "assistant", content: reply.answer });
        } catch (err) {
          process.stderr.write(`error: ${(err as Error).message}\n`);
        }
        prompt();
      };

      process.stdout.write("odin chat — /exit to quit, /clear to reset history\n");
      prompt();
    });
}
