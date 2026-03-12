import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Env } from "../env.js";

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
});

export interface AgentDeps {
  env: Env;
}

export function registerAgent(app: FastifyInstance, _deps: AgentDeps) {
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
    // openai integration lands in a follow-up
    return reply.send({
      ok: true,
      createdAt: new Date().toISOString(),
      title: "Odin",
      answer: "agent runner not wired yet",
    });
  });
}
