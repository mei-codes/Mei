export interface RateLimitOptions {
  perMinute: number;
  perDay: number;
  now?: () => number;
}

export interface RateLimitDecision {
  ok: boolean;
  retryAfterSeconds?: number;
  reason?: "per_minute" | "per_day";
}

interface Bucket {
  minuteWindowStart: number;
  minuteCount: number;
  dayWindowStart: number;
  dayCount: number;
}

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly opts: RateLimitOptions) {}

  check(key: string): RateLimitDecision {
    const now = this.opts.now?.() ?? Date.now();
    const bucket = this.buckets.get(key) ?? {
      minuteWindowStart: now,
      minuteCount: 0,
      dayWindowStart: now,
      dayCount: 0,
    };

    if (now - bucket.minuteWindowStart >= MINUTE_MS) {
      bucket.minuteWindowStart = now;
      bucket.minuteCount = 0;
    }
    if (now - bucket.dayWindowStart >= DAY_MS) {
      bucket.dayWindowStart = now;
      bucket.dayCount = 0;
    }

    if (this.opts.perMinute > 0 && bucket.minuteCount >= this.opts.perMinute) {
      const retry = Math.ceil((bucket.minuteWindowStart + MINUTE_MS - now) / 1000);
      return { ok: false, retryAfterSeconds: Math.max(retry, 1), reason: "per_minute" };
    }
    if (this.opts.perDay > 0 && bucket.dayCount >= this.opts.perDay) {
      const retry = Math.ceil((bucket.dayWindowStart + DAY_MS - now) / 1000);
      return { ok: false, retryAfterSeconds: Math.max(retry, 1), reason: "per_day" };
    }

    bucket.minuteCount += 1;
    bucket.dayCount += 1;
    this.buckets.set(key, bucket);
    return { ok: true };
  }
}
