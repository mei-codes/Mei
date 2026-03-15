import { buildServer } from "./server.js";
import { loadEnv } from "./env.js";
import { logger } from "./log.js";

async function main() {
  const env = loadEnv(process.env);
  const app = await buildServer({ env });

  try {
    await app.listen({ host: env.HOST, port: env.PORT });
    logger.info(
      { host: env.HOST, port: env.PORT, model: env.OPENAI_MODEL },
      "odin server listening",
    );
  } catch (err) {
    logger.error({ err }, "failed to start odin server");
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "shutting down");
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error({ err }, "unhandled error during startup");
  process.exit(1);
});
