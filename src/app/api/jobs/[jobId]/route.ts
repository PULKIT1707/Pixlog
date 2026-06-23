import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("id, status, progress, result, error")
    .eq("id", jobId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    jobId: data.id,
    status: data.status,
    progress: data.progress,
    result: data.result,
    error: data.error,
  });
}
