import { buildServer } from "./server.js";
import { loadEnv } from "./env.js";

async function main() {
  const env = loadEnv(process.env);
  const app = await buildServer({ env });
  await app.listen({ host: env.HOST, port: env.PORT });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
