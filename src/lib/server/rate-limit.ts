// Best-effort in-memory sliding-window rate limiter (per process / Fluid
// instance). Pure-ish and injectable: each limiter owns its own Map and
// takes `now` as an argument, so it's deterministically testable. Durable
// cross-instance limiting would need Vercel KV / Upstash.

export interface RateLimiter {
  /**
   * Record a hit for `ip` at `now` (epoch ms) and return true if the ip is
   * now OVER the limit within the window. Side-effecting by design — the
   * caller treats a `true` return as "reject this request".
   */
  check(ip: string, now: number): boolean;
}

export function createRateLimiter({
  windowMs,
  max,
  maxKeys = 5_000,
}: {
  windowMs: number;
  max: number;
  /** Crude memory guard — clear the whole map past this many distinct ips. */
  maxKeys?: number;
}): RateLimiter {
  const log = new Map<string, number[]>();
  return {
    check(ip, now) {
      const recent = (log.get(ip) ?? []).filter((t) => now - t < windowMs);
      recent.push(now);
      log.set(ip, recent);
      if (log.size > maxKeys) log.clear();
      return recent.length > max;
    },
  };
}
