import { describe, expect, it } from "vitest";

import {
  classifyOtpError,
  clientIpFromHeaders,
  isRateLimitError,
  isUserNotFoundError,
} from "@/lib/auth/error-classify";

// Direct tests for the pure Supabase-error classifiers extracted from
// actions.ts. The server-action harness covers them through the real call
// paths; these pin each branch in isolation.

describe("isRateLimitError", () => {
  it("treats HTTP 429 as a rate limit", () => {
    expect(isRateLimitError({ status: 429 })).toBe(true);
  });

  it("recognises the documented rate-limit codes", () => {
    expect(isRateLimitError({ code: "over_email_send_rate_limit" })).toBe(true);
    expect(isRateLimitError({ code: "rate_limit_exceeded" })).toBe(true);
  });

  it("returns false for unrelated or empty errors", () => {
    expect(isRateLimitError({ code: "invalid_credentials" })).toBe(false);
    expect(isRateLimitError({})).toBe(false);
  });
});

describe("classifyOtpError", () => {
  it("maps expiry codes and messages to otpExpired", () => {
    expect(classifyOtpError({ code: "otp_expired" })).toBe("otpExpired");
    expect(classifyOtpError({ code: "expired_token" })).toBe("otpExpired");
    expect(classifyOtpError({ message: "Token has expired" })).toBe("otpExpired");
  });

  it("maps throttling to rateLimited", () => {
    expect(classifyOtpError({ status: 429 })).toBe("rateLimited");
    expect(classifyOtpError({ code: "over_email_send_rate_limit" })).toBe("rateLimited");
  });

  it("falls back to otpFailed for anything unrecognised", () => {
    expect(classifyOtpError({ code: "token_mismatch" })).toBe("otpFailed");
    expect(classifyOtpError({})).toBe("otpFailed");
  });

  it("prefers the expiry classification over rate limiting", () => {
    // An expired token that also carries a 429 still reads as expired.
    expect(classifyOtpError({ code: "otp_expired", status: 429 })).toBe("otpExpired");
  });
});

describe("isUserNotFoundError", () => {
  it("recognises the not-found signals", () => {
    expect(isUserNotFoundError({ code: "user_not_found" })).toBe(true);
    expect(isUserNotFoundError({ status: 404 })).toBe(true);
    expect(isUserNotFoundError({ message: "User not found" })).toBe(true);
    expect(isUserNotFoundError({ message: "no user exists" })).toBe(true);
  });

  it("returns false otherwise", () => {
    expect(isUserNotFoundError({ code: "weak_password" })).toBe(false);
    expect(isUserNotFoundError({})).toBe(false);
  });
});

describe("clientIpFromHeaders", () => {
  it("takes the first x-forwarded-for entry, trimmed", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(clientIpFromHeaders(h)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip then cf-connecting-ip", () => {
    expect(clientIpFromHeaders(new Headers({ "x-real-ip": "198.51.100.9" }))).toBe(
      "198.51.100.9",
    );
    expect(
      clientIpFromHeaders(new Headers({ "cf-connecting-ip": "192.0.2.7" })),
    ).toBe("192.0.2.7");
  });

  it("returns null when no IP header is present", () => {
    expect(clientIpFromHeaders(new Headers())).toBeNull();
  });
});
