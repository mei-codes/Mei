import { describe, expect, it, vi } from "vitest";
import { OdinClient, OdinHttpError, OdinRateLimitError } from "../src/index.js";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
}

describe("OdinClient", () => {
  it("requires baseUrl", () => {
    expect(() => new OdinClient({ baseUrl: "" })).toThrow();
  });

  it("parses agent responses", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        ok: true,
        createdAt: "2026-04-02T10:00:00.000Z",
        title: "Plan",
        answer: "Step 1...",
      }),
    );
    const client = new OdinClient({
      baseUrl: "http://localhost:3030",
      fetch: fetchMock as unknown as typeof fetch,
    });
    const reply = await client.ask({ prompt: "plan a deploy" });
    expect(reply.title).toBe("Plan");
  });

  it("raises OdinRateLimitError on 429", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        { ok: false, error: { code: "rate_limited", message: "slow down" } },
        { status: 429, headers: { "retry-after": "12" } },
      ),
    );
    const client = new OdinClient({
      baseUrl: "http://localhost:3030",
      fetch: fetchMock as unknown as typeof fetch,
    });
    await expect(client.ask({ prompt: "x" })).rejects.toBeInstanceOf(
      OdinRateLimitError,
    );
  });

  it("raises OdinHttpError on 500", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        { ok: false, error: { code: "internal", message: "boom" } },
        { status: 500 },
      ),
    );
    const client = new OdinClient({
      baseUrl: "http://localhost:3030",
      fetch: fetchMock as unknown as typeof fetch,
    });
    await expect(client.ask({ prompt: "x" })).rejects.toBeInstanceOf(
      OdinHttpError,
    );
  });
});
