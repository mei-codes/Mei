import OpenAI from "openai";
import type { Env } from "./env.js";

export interface AgentInput {
  prompt: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?: string;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

export interface AgentOutput {
  answer: string;
  title: string;
}

const SYSTEM_PROMPT = `You are Odin, an operator-style assistant.
Reply with one tight title line, then a blank line, then the body.
Avoid filler.`;

export interface OpenAIRunner {
  run(input: AgentInput): Promise<AgentOutput>;
}

export function createOpenAIRunner(env: Env): OpenAIRunner {
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  return {
    async run(input) {
      const model = input.model ?? env.OPENAI_MODEL;
      const history = input.messages ?? [];
      const messages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...history,
        { role: "user" as const, content: input.prompt },
      ];

      const completion = await client.chat.completions.create(
        {
          model,
          messages,
          max_tokens: input.maxOutputTokens ?? 700,
          temperature: 0.5,
        },
        { signal: input.signal },
      );

      const raw = completion.choices[0]?.message?.content?.trim() ?? "";
      const [first, ...rest] = raw.split(/\r?\n/);
      const title = (first ?? "").trim() || "Odin";
      const body = rest.join("\n").trim() || (first ?? "");

      return { answer: body, title };
    },
  };
}
