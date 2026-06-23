import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getYearConfig } from "@/lib/pixel/calendar";
import { cellKey } from "@/types";
import { addDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const year = Number(req.nextUrl.searchParams.get("year"));
  if (!year) return NextResponse.json({ error: "Missing year" }, { status: 400 });

  const now = new Date();
  const currentYear = now.getFullYear();

  // Use GitHub's actual graph start (Sunday on or before Jan 1) for accuracy
  const yearConfig = getYearConfig(year);
  const from = new Date(yearConfig.startDate).toISOString();
  const to = year === currentYear ? now.toISOString() : `${year}-12-31T23:59:59Z`;

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: session.user.login, from, to } }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[contributions] GitHub API error:", res.status, text);
    return NextResponse.json({ error: "GitHub API error" }, { status: 500 });
  }

  const json = await res.json();

  if (json.errors) {
    console.error("[contributions] GraphQL errors:", JSON.stringify(json.errors));
    return NextResponse.json({ cells: {}, warning: json.errors[0]?.message });
  }

  const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
  const totalDays = weeks.reduce(
    (s: number, w: any) =>
      s + w.contributionDays.filter((d: any) => d.contributionCount > 0).length,
    0
  );
  console.log(`[contributions] @${session.user.login} year=${year} → ${totalDays} active days`);

  // Build date → count map
  const dateMap: Record<string, number> = {};
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        dateMap[day.date] = day.contributionCount;
      }
    }
  }

  // Convert to cellKey → count
  const start = new Date(yearConfig.startDate);
  const cellMap: Record<string, number> = {};

  for (let week = 0; week < yearConfig.totalWeeks; week++) {
    for (let day = 0; day < 7; day++) {
      const date = format(addDays(start, week * 7 + day), "yyyy-MM-dd");
      if (dateMap[date]) {
        cellMap[cellKey(week, day)] = dateMap[date];
      }
    }
  }

  return NextResponse.json({ cells: cellMap });
}
