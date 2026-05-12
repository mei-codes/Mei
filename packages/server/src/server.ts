import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import type { Env } from "./env.js";
import { logger } from "./log.js";
import { createOpenAIRunner, type OpenAIRunner } from "./openai.js";
import { RateLimiter } from "./rateLimit.js";
import { registerHealth } from "./routes/health.js";
import { registerAgent } from "./routes/agent.js";

export interface BuildOptions {
  env: Env;
  runner?: OpenAIRunner;
}

export async function buildServer(opts: BuildOptions): Promise<FastifyInstance> {
  const app = Fastify({ loggerInstance: logger, trustProxy: true });

  await app.register(cors, {
    origin: opts.env.ODIN_CORS_ORIGIN === "*" ? true : opts.env.ODIN_CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  });

  const limiter = new RateLimiter({
    perMinute: opts.env.ODIN_RATE_LIMIT_PER_MINUTE,
    perDay: opts.env.ODIN_RATE_LIMIT_PER_DAY,
  });
  const runner = opts.runner ?? createOpenAIRunner(opts.env);

  registerHealth(app, { env: opts.env });
  registerAgent(app, { env: opts.env, limiter, runner });

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
