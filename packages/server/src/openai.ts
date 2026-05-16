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
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

const SYSTEM_PROMPT = `You are Odin, an operator-style assistant.
Reply with one tight title line, then a blank line, then the body.
The body should be concrete, ordered next steps when the user asks for a plan,
or a direct answer when the user asks a question. Avoid filler.
`;

export interface OpenAIRunner {
  run(input: AgentInput): Promise<AgentOutput>;
}

export function createOpenAIRunner(env: Env): OpenAIRunner {
  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
  });

  return {
    async run(input) {
      const model = input.model ?? env.OPENAI_MODEL;
      const maxOutputTokens =
        input.maxOutputTokens ?? env.OPENAI_MAX_OUTPUT_TOKENS;

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
          max_tokens: maxOutputTokens,
          temperature: 0.5,
        },
        { signal: input.signal },
      );

      const choice = completion.choices[0];
      const raw = choice?.message?.content?.trim() ?? "";
      const { title, body } = splitTitle(raw);

      return {
        answer: body,
        title,
        usage: completion.usage
          ? {
              inputTokens: completion.usage.prompt_tokens ?? 0,
              outputTokens: completion.usage.completion_tokens ?? 0,
              totalTokens: completion.usage.total_tokens ?? 0,
            }
          : undefined,
      };
    },
  };
}

export function splitTitle(raw: string): { title: string; body: string } {
  if (!raw) return { title: "Odin", body: "" };
  const lines = raw.split(/\r?\n/);
  const first = (lines[0] ?? "").trim();
  if (!first) {
    return { title: "Odin", body: raw.trim() };
  }
  const rest = lines.slice(1).join("\n").trim();
  if (rest.length === 0) {
    return { title: "Odin", body: first };
  }
  const title = first.replace(/^#+\s*/, "").slice(0, 120);
  return { title: title || "Odin", body: rest };
}
