import { NextResponse } from "next/server";

// Uptime probe — boots-only signal; no env/third-party reads so failures stay attributable to us.
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
