import { z } from "zod";

export const AgentMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export const AgentResponseSchema = z.object({
  ok: z.literal(true),
  createdAt: z.string().min(1),
  title: z.string(),
  answer: z.string(),
});

export const HealthResponseSchema = z.object({
  ok: z.boolean(),
  name: z.string(),
  version: z.string(),
  runtime: z.string(),
  provider: z.string(),
  protected: z.boolean(),
});

export const ErrorBodySchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
