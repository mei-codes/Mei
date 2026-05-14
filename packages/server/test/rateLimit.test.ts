import { describe, expect, it } from "vitest";
import { RateLimiter } from "../src/rateLimit.js";

describe("RateLimiter", () => {
  it("permits up to perMinute and then blocks with retry-after", () => {
    let now = 0;
    const lim = new RateLimiter({ perMinute: 2, perDay: 100, now: () => now });

    expect(lim.check("ip").ok).toBe(true);
    expect(lim.check("ip").ok).toBe(true);
    const blocked = lim.check("ip");
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toBe("per_minute");
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after one minute", () => {
    let now = 0;
    const lim = new RateLimiter({ perMinute: 1, perDay: 100, now: () => now });
    expect(lim.check("ip").ok).toBe(true);
    expect(lim.check("ip").ok).toBe(false);
    now += 61_000;
    expect(lim.check("ip").ok).toBe(true);
  });

  it("enforces per-day independently of per-minute", () => {
    let now = 0;
    const lim = new RateLimiter({ perMinute: 100, perDay: 2, now: () => now });
    expect(lim.check("ip").ok).toBe(true);
    expect(lim.check("ip").ok).toBe(true);
    const blocked = lim.check("ip");
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toBe("per_day");
  });

  it("perMinute = 0 disables the per-minute window", () => {
    const lim = new RateLimiter({ perMinute: 0, perDay: 100 });
    for (let i = 0; i < 50; i += 1) {
      expect(lim.check("ip").ok).toBe(true);
    }
  });
});
