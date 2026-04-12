import { describe, expect, it } from "vitest";
import {
  AgentResponseSchema,
  ErrorBodySchema,
  HealthResponseSchema,
} from "../src/schemas.js";

describe("schemas", () => {
  it("HealthResponseSchema accepts the canonical body", () => {
    const out = HealthResponseSchema.parse({
      ok: true,
      name: "odin",
      version: "0.1.0",
      runtime: "fastify",
      provider: "openai",
      protected: false,
    });
    expect(out.name).toBe("odin");
  });

  it("AgentResponseSchema requires ok:true", () => {
    expect(() =>
      AgentResponseSchema.parse({
        ok: false,
        createdAt: "2026-04-01",
        title: "x",
        answer: "y",
      }),
    ).toThrow();
  });

  it("AgentResponseSchema accepts optional usage", () => {
    const out = AgentResponseSchema.parse({
      ok: true,
      createdAt: "2026-04-01",
      title: "x",
      answer: "y",
    });
    expect(out.usage).toBeUndefined();
  });

  it("ErrorBodySchema captures code + message", () => {
    const out = ErrorBodySchema.parse({
      ok: false,
      error: { code: "bad_request", message: "nope" },
    });
    expect(out.error.code).toBe("bad_request");
  });
});
