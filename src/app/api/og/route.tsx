import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

// Intensity → hex color
const COLORS: Record<number, string> = {
  0: "#161b22",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  let gridData: Record<string, number> = {};
  let artLabel = "Pixel Art";
  let username = "";
  let year = new Date().getFullYear();
  let commitCount = 0;

  if (id) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data } = await supabase
        .from("gallery")
        .select("art_label, username, grid_data, year, commit_count")
        .eq("id", id)
        .single();

      if (data) {
        gridData = data.grid_data as Record<string, number>;
        artLabel = data.art_label;
        username = data.username;
        year = data.year;
        commitCount = data.commit_count;
      }
    } catch {
      // fallback to empty grid
    }
  }

  // Build pixel grid as SVG rects
  const WEEKS = 52;
  const DAYS = 7;
  const CELL = 12;
  const GAP = 2;
  const GRID_W = WEEKS * (CELL + GAP) - GAP;
  const GRID_H = DAYS * (CELL + GAP) - GAP;

  const rects = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const key = `${w}:${d}`;
      const intensity = gridData[key] ?? 0;
      const x = w * (CELL + GAP);
      const y = d * (CELL + GAP);
      rects.push(
        <rect
          key={key}
          x={x}
          y={y}
          width={CELL}
          height={CELL}
          rx={2}
          fill={COLORS[intensity] ?? COLORS[0]}
        />
      );
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0d1117",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          gap: "32px",
          fontFamily: "monospace",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Logo pixels: 4×4 P shape */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              gap: "3px",
              width: 40,
              height: 40,
            }}
          >
            {[1,1,1,0, 1,0,1,1, 1,0,0,1, 1,1,1,0].map((on, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 1,
                  background: on ? "#39d353" : "#161b22",
                }}
              />
            ))}
          </div>
          <span style={{ color: "#ffffff", fontSize: 36, fontWeight: 700, letterSpacing: "-1px" }}>
            pixlog
          </span>
        </div>

        {/* Pixel grid */}
        <div
          style={{
            background: "#0d1117",
            borderRadius: 12,
            padding: "16px",
            border: "1px solid #30363d",
          }}
        >
          <svg width={GRID_W} height={GRID_H} viewBox={`0 0 ${GRID_W} ${GRID_H}`}>
            {rects}
          </svg>
        </div>

        {/* Label + meta */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          {artLabel && (
            <span style={{ color: "#ffffff", fontSize: 28, fontWeight: 700 }}>
              {artLabel}
            </span>
          )}
          <div style={{ display: "flex", gap: "16px", color: "#8b949e", fontSize: 16 }}>
            {username && <span>@{username}</span>}
            {year && <span>{year}</span>}
            {commitCount > 0 && <span>{commitCount} commits</span>}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 36,
            color: "#484f58",
            fontSize: 14,
          }}
        >
          pixlog.app — pixel art from your git log
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
