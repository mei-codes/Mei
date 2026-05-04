import { OdinClient } from "@odin/sdk";

const baseUrl = process.env.ODIN_BASE_URL ?? "http://localhost:3030";
const client = new OdinClient({ baseUrl });

const health = await client.health();
if (!health.ok) {
  console.error(`odin is not healthy: ${JSON.stringify(health)}`);
  process.exit(1);
}

const reply = await client.ask({
  prompt: process.argv.slice(2).join(" ") || "plan a Railway deploy",
});

console.log(`# ${reply.title}\n`);
console.log(reply.answer);
if (reply.usage) {
  console.log(
    `\n— ${reply.usage.inputTokens} in / ${reply.usage.outputTokens} out`,
  );
}
