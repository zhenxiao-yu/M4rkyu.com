import { describe, expect, it } from "vitest";

import { createRateLimiter } from "@/lib/server/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to `max` hits in the window, then rejects", () => {
    const rl = createRateLimiter({ windowMs: 1000, max: 3 });
    expect(rl.check("a", 0)).toBe(false); // 1
    expect(rl.check("a", 0)).toBe(false); // 2
    expect(rl.check("a", 0)).toBe(false); // 3
    expect(rl.check("a", 0)).toBe(true); // 4 → over
  });

  it("slides the window — old hits expire", () => {
    const rl = createRateLimiter({ windowMs: 1000, max: 2 });
    expect(rl.check("a", 0)).toBe(false); // 1
    expect(rl.check("a", 500)).toBe(false); // 2
    expect(rl.check("a", 600)).toBe(true); // 3 in window → over
    // At t=1700 the t=0 and t=500/600 hits older than 1000ms drop off.
    expect(rl.check("a", 1700)).toBe(false); // only t=600+1700 in window
  });

  it("tracks ips independently", () => {
    const rl = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(rl.check("a", 0)).toBe(false);
    expect(rl.check("b", 0)).toBe(false); // different ip, own budget
    expect(rl.check("a", 0)).toBe(true); // a's second hit → over
  });

  it("clears state past the key cap (memory guard)", () => {
    const rl = createRateLimiter({ windowMs: 10_000, max: 1, maxKeys: 2 });
    rl.check("a", 0);
    rl.check("b", 0);
    rl.check("c", 0); // size now > 2 → map cleared after this insert
    // 'a' was wiped, so its next hit starts fresh (not over).
    expect(rl.check("a", 0)).toBe(false);
  });
});
