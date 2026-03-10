import Fastify, { type FastifyInstance } from "fastify";
import type { Env } from "./env.js";
import { registerHealth } from "./routes/health.js";

export interface BuildOptions {
  env: Env;
}

export async function buildServer(opts: BuildOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  registerHealth(app, { env: opts.env });
  return app;
}
