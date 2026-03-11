import { buildServer } from "./server.js";
import { loadEnv } from "./env.js";
import { logger } from "./log.js";

async function main() {
  const env = loadEnv(process.env);
  const app = await buildServer({ env });
  try {
    await app.listen({ host: env.HOST, port: env.PORT });
    logger.info({ host: env.HOST, port: env.PORT }, "odin server listening");
  } catch (err) {
    logger.error({ err }, "failed to start odin server");
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error({ err }, "unhandled error during startup");
  process.exit(1);
});
