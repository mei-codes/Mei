import type { AgentResponse, HealthResponse } from "@odin/sdk";

export function printHealth(health: HealthResponse): void {
  const status = health.ok ? "ok" : "down";
  process.stdout.write(
    `odin ${health.name}@${health.version} ${status}\n` +
      `  runtime  ${health.runtime}\n` +
      `  provider ${health.provider}\n` +
      `  protected ${health.protected}\n`,
  );
}

export function printAgentReply(reply: AgentResponse): void {
  process.stdout.write(`${reply.title}\n\n${reply.answer}\n`);
}
