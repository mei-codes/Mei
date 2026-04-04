import kleur from "kleur";
import type { AgentResponse, HealthResponse } from "@odin/sdk";

export function printHealth(health: HealthResponse): void {
  const status = health.ok ? kleur.green("ok") : kleur.red("down");
  process.stdout.write(
    `${kleur.bold("odin")} ${health.name}@${health.version} ${status}\n` +
      `  runtime  ${kleur.dim(health.runtime)}\n` +
      `  provider ${kleur.dim(health.provider)}\n` +
      `  protected ${kleur.dim(String(health.protected))}\n`,
  );
}

export function printAgentReply(reply: AgentResponse): void {
  process.stdout.write(`${kleur.bold().cyan(reply.title)}\n\n${reply.answer}\n`);
}

export function spinner(label: string): { stop: () => void } {
  if (!process.stderr.isTTY) {
    return { stop: () => {} };
  }
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const interval = setInterval(() => {
    process.stderr.write(`\r${kleur.cyan(frames[i % frames.length])} ${label}`);
    i += 1;
  }, 80);
  return {
    stop: () => {
      clearInterval(interval);
      process.stderr.write(`\r${" ".repeat(label.length + 4)}\r`);
    },
  };
}
