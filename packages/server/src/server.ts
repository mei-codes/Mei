import Fastify, { type FastifyInstance } from "fastify";
import type { Env } from "./env.js";
import { logger } from "./log.js";
import { createOpenAIRunner, type OpenAIRunner } from "./openai.js";
import { registerHealth } from "./routes/health.js";
import { registerAgent } from "./routes/agent.js";

export interface BuildOptions {
  env: Env;
  runner?: OpenAIRunner;
}

export async function buildServer(opts: BuildOptions): Promise<FastifyInstance> {
  const app = Fastify({ loggerInstance: logger, trustProxy: true });
  const runner = opts.runner ?? createOpenAIRunner(opts.env);
  registerHealth(app, { env: opts.env });
  registerAgent(app, { env: opts.env, runner });

  app.setErrorHandler((err, _req, reply) => {
    app.log.error({ err }, "unhandled error");
    reply.status(500).send({
      ok: false,
      error: { code: "internal", message: "internal server error" },
    });
  });

  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({
      ok: false,
      error: { code: "not_found", message: "no such route" },
    });
  });

  return app;
}
