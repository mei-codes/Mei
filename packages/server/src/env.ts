import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3030),
  HOST: z.string().default("0.0.0.0"),

  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(700),
  OPENAI_BASE_URL: z.string().url().optional(),

  ODIN_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().nonnegative().default(6),
  ODIN_RATE_LIMIT_PER_DAY: z.coerce.number().int().nonnegative().default(80),

  ODIN_CORS_ORIGIN: z.string().default("*"),
  ODIN_LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n  ");
    throw new Error(`invalid environment configuration:\n  ${issues}`);
  }
  return parsed.data;
}
