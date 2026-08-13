import { NextResponse } from "next/server";

// Uptime probe — boots-only signal; no env/third-party reads so failures stay
// attributable to us. Runs on the default Node runtime for consistency with the
// rest of the app (edge was deliberately stripped everywhere; see CLAUDE.md).
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
