import { NextRequest, NextResponse } from "next/server";
import { processPendingJobs } from "@/lib/processJob";

// Vercel Cron calls this every minute.
// The Authorization header check prevents unauthorized invocations.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processed = await processPendingJobs(3);
  return NextResponse.json({ ok: true, processed });
}
