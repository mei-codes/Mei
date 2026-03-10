import type { FastifyInstance } from "fastify";
import type { Env } from "../env.js";

export interface HealthDeps {
  env: Env;
}

export function registerHealth(app: FastifyInstance, deps: HealthDeps) {
  app.get("/api/health", async (_req, reply) => {
    reply.send({
      ok: true,
      name: "odin-agent",
      version: "0.0.1",
      runtime: "fastify",
      provider: "openai",
      protected: false,
      model: deps.env.OPENAI_MODEL,
    });
  });
}
