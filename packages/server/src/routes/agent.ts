import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Env } from "../env.js";
import type { OpenAIRunner } from "../openai.js";

const AgentBody = z.object({
  prompt: z.string().trim().min(1).max(8000),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(8000),
      }),
    )
    .max(40)
    .optional(),
  model: z.string().max(80).optional(),
  maxOutputTokens: z.number().int().positive().max(4000).optional(),
});

export interface AgentDeps {
  env: Env;
  runner: OpenAIRunner;
}

export function registerAgent(app: FastifyInstance, deps: AgentDeps) {
  app.post("/api/agent", async (req, reply) => {
    const parsed = AgentBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        ok: false,
        error: {
          code: "bad_request",
          message: "invalid agent request body",
          details: parsed.error.issues,
        },
      });
    }

    try {
      const output = await deps.runner.run({
        prompt: parsed.data.prompt,
        messages: parsed.data.messages,
        model: parsed.data.model,
        maxOutputTokens: parsed.data.maxOutputTokens,
      });
      return reply.send({
        ok: true,
        createdAt: new Date().toISOString(),
        title: output.title,
        answer: output.answer,
      });
    } catch (err) {
      req.log.error({ err }, "agent run failed");
      return reply.status(502).send({
        ok: false,
        error: { code: "upstream_failed", message: "agent provider call failed" },
      });
    }
  });
}
