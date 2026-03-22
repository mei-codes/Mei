import { describe, expect, it } from "vitest";
import { RateLimiter } from "../src/rateLimit.js";

describe("RateLimiter", () => {
  it("permits up to perMinute and then blocks", () => {
    let now = 0;
    const lim = new RateLimiter({ perMinute: 2, perDay: 100, now: () => now });
    expect(lim.check("ip").ok).toBe(true);
    expect(lim.check("ip").ok).toBe(true);
    const blocked = lim.check("ip");
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toBe("per_minute");
  });

  it("resets after one minute", () => {
    let now = 0;
    const lim = new RateLimiter({ perMinute: 1, perDay: 100, now: () => now });
    expect(lim.check("ip").ok).toBe(true);
    expect(lim.check("ip").ok).toBe(false);
    now += 61_000;
    expect(lim.check("ip").ok).toBe(true);
  });

  it("enforces per-day independently", () => {
    const lim = new RateLimiter({ perMinute: 100, perDay: 2 });
    expect(lim.check("ip").ok).toBe(true);
    expect(lim.check("ip").ok).toBe(true);
    expect(lim.check("ip").ok).toBe(false);
  });
});
