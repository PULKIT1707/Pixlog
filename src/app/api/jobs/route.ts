import { NextRequest, NextResponse, after } from "next/server";
import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { getInstallationId, getInstallationToken } from "@/lib/github/app";
import { getYearConfig, cellToDate } from "@/lib/pixel/calendar";
import { processPendingJobs } from "@/lib/processJob";
import { INTENSITY_COMMIT_COUNT } from "@/types";
import type { CommitSpec, IntensityLevel } from "@/types";

// Allow up to 60s (Vercel Hobby max) for after() to push commits before the
// function is torn down. Vercel Cron on Hobby only fires once/day, so jobs
// are processed inline right after creation instead of via polling.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grid, year, repoName } = await req.json();
  if (!grid || !year || !repoName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const username = session.user.login;

  // Get installation ID + token
  const installationId = await getInstallationId(username);
  if (!installationId) {
    return NextResponse.json(
      { error: "GitHub App not installed. Install PixlogApp first." },
      { status: 403 }
    );
  }
  const installationToken = await getInstallationToken(installationId);

  // Convert grid Map entries to CommitSpec[]
  const yearConfig = getYearConfig(year);
  const commits: CommitSpec[] = [];

  for (const [key, intensity] of Object.entries(grid)) {
    const [week, day] = key.split(":").map(Number);
    const count = INTENSITY_COMMIT_COUNT[intensity as IntensityLevel];
    if (count > 0) {
      commits.push({ date: cellToDate(yearConfig, week, day), count });
    }
  }

  if (commits.length === 0) {
    return NextResponse.json({ error: "No cells to generate" }, { status: 400 });
  }

  // Enqueue job in Supabase
  const supabase = createServerClient();
  const jobId = `pixlog-${username}-${Date.now()}`;

  const { error } = await supabase.from("jobs").insert({
    id: jobId,
    username,
    installation_token: installationToken,
    repo_name: repoName,
    art_label: repoName,
    commits,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Process the job inline after the response is sent — Vercel Cron on
  // Hobby plan only fires once/day, so polling can't be relied on.
  after(() => processPendingJobs(1));

  return NextResponse.json({ jobId });
}
