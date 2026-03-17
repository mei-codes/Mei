import { describe, expect, it } from "vitest";
import { buildServer } from "../src/server.js";
import type { Env } from "../src/env.js";
import type { AgentOutput, OpenAIRunner } from "../src/openai.js";

function fakeEnv(overrides: Partial<Env> = {}): Env {
  return {
    PORT: 0,
    HOST: "127.0.0.1",
    OPENAI_API_KEY: "sk-test",
    OPENAI_MODEL: "gpt-4o-mini",
    OPENAI_MAX_OUTPUT_TOKENS: 700,
    ...overrides,
  } as Env;
}

function fakeRunner(reply: AgentOutput): OpenAIRunner {
  return { async run() { return reply; } };
}

describe("server routes", () => {
  it("GET /api/health returns runtime info", async () => {
    const app = await buildServer({
      env: fakeEnv(),
      runner: fakeRunner({ answer: "", title: "" }),
    });
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
    await app.close();
  });

  it("POST /api/agent returns the runner's output", async () => {
    const app = await buildServer({
      env: fakeEnv(),
      runner: fakeRunner({ answer: "Step 1.", title: "Deploy plan" }),
    });
    const res = await app.inject({
      method: "POST",
      url: "/api/agent",
      payload: { prompt: "plan a deploy" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().title).toBe("Deploy plan");
    await app.close();
  });

  it("rejects empty prompts", async () => {
    const app = await buildServer({
      env: fakeEnv(),
      runner: fakeRunner({ answer: "", title: "" }),
    });
    const res = await app.inject({
      method: "POST",
      url: "/api/agent",
      payload: { prompt: "" },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });
});
