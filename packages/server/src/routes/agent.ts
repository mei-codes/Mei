import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import type { Env } from "../env.js";
import type { OpenAIRunner } from "../openai.js";
import type { RateLimiter } from "../rateLimit.js";

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
  limiter: RateLimiter;
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

    const decision = deps.limiter.check(rateKey(req));
    if (!decision.ok) {
      const retry = decision.retryAfterSeconds ?? 1;
      reply.header("retry-after", String(retry));
      return reply.status(429).send({
        ok: false,
        error: {
          code: "rate_limited",
          message:
            decision.reason === "per_day"
              ? "daily request budget exceeded"
              : "per-minute request budget exceeded",
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

function rateKey(req: FastifyRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.ip || "unknown";
}
