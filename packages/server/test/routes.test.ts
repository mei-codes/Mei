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
    OPENAI_BASE_URL: undefined,
    ODIN_RATE_LIMIT_PER_MINUTE: 6,
    ODIN_RATE_LIMIT_PER_DAY: 80,
    ODIN_CORS_ORIGIN: "*",
    ODIN_LOG_LEVEL: "silent",
    ...overrides,
  } as Env;
}

function fakeRunner(reply: AgentOutput): OpenAIRunner {
  return {
    async run() {
      return reply;
    },
  };
}

describe("server routes", () => {
  it("GET /api/health returns runtime info", async () => {
    const app = await buildServer({
      env: fakeEnv(),
      runner: fakeRunner({ answer: "", title: "" }),
    });
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.name).toBe("odin-agent");
    await app.close();
  });

  it("POST /api/agent returns the runner's output", async () => {
    const app = await buildServer({
      env: fakeEnv(),
      runner: fakeRunner({
        answer: "Step 1.\nStep 2.",
        title: "Deploy plan",
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      }),
    });
    const res = await app.inject({
      method: "POST",
      url: "/api/agent",
      payload: { prompt: "plan a deploy" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.title).toBe("Deploy plan");
    expect(body.usage.totalTokens).toBe(30);
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

  it("rate-limits after per-minute budget", async () => {
    const app = await buildServer({
      env: fakeEnv({ ODIN_RATE_LIMIT_PER_MINUTE: 1, ODIN_RATE_LIMIT_PER_DAY: 1000 }),
      runner: fakeRunner({ answer: "x", title: "y" }),
    });
    const first = await app.inject({
      method: "POST",
      url: "/api/agent",
      payload: { prompt: "x" },
    });
    expect(first.statusCode).toBe(200);

    const second = await app.inject({
      method: "POST",
      url: "/api/agent",
      payload: { prompt: "x" },
    });
    expect(second.statusCode).toBe(429);
    expect(second.headers["retry-after"]).toBeDefined();
    await app.close();
  });
});
