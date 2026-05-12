import { NextResponse } from "next/server";

/**
 * Tiny uptime probe. Returns 200 + a fixed payload as long as the
 * route handler boots — sufficient signal for Better Stack /
 * UptimeRobot / Pingdom polls.
 *
 * Deliberately does NOT touch:
 *   - the env module (a misconfigured Resend key would fail healthy
 *     polls; that's the build's job to catch, not the monitor's),
 *   - Resend / dev.to / Firebase (third-party flakiness isn't *our*
 *     health, it'd skew the dashboards),
 *   - any client islands (no JS shipped).
 *
 * Edge runtime to keep cold-start latency under 50 ms even after a
 * long idle. No `node:` imports allowed.
 */
export const runtime = "edge";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "m4rkyu.com",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    },
  );
}
