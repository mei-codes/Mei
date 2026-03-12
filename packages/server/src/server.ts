import Fastify, { type FastifyInstance } from "fastify";
import type { Env } from "./env.js";
import { logger } from "./log.js";
import { registerHealth } from "./routes/health.js";
import { registerAgent } from "./routes/agent.js";

export interface BuildOptions {
  env: Env;
}

export async function buildServer(opts: BuildOptions): Promise<FastifyInstance> {
  const app = Fastify({ loggerInstance: logger, trustProxy: true });
  registerHealth(app, { env: opts.env });
  registerAgent(app, { env: opts.env });
  return app;
}
