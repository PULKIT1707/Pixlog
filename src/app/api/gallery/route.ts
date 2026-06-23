import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerClient as createClient } from "@/lib/supabase/server";

// GET /api/gallery?page=0&limit=20
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  const supabase = createClient();
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("gallery")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data, total: count, page, limit });
}

// POST /api/gallery — submit pixel art to gallery
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.login) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { repoName, repoUrl, artLabel, gridData, year, commitCount } = body;

  if (!repoName || !repoUrl || !artLabel || !gridData || !year) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("gallery")
    .insert({
      username: session.user.login,
      avatar_url: session.user.avatarUrl ?? null,
      repo_name: repoName,
      repo_url: repoUrl,
      art_label: artLabel,
      grid_data: gridData,
      year,
      commit_count: commitCount ?? 0,
    })
    .select()
    .single();

  if (error) {
    // Ignore duplicate submissions silently
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
