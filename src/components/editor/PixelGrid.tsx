"use client";

import { useCallback } from "react";
import type { IntensityLevel, PixelGrid } from "@/types";
import { cellKey } from "@/types";

// Your painted cells
const GITHUB_GREENS: Record<IntensityLevel, string> = {
  0: "#2d333b",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

// Existing commits — shown in blue-grey tones to distinguish from your art
function existingColor(count: number): string {
  if (count >= 10) return "#1f6feb";
  if (count >= 5)  return "#1158c7";
  if (count >= 2)  return "#0d419d";
  return "#0c2d6b";
}

const TOTAL_WEEKS = 52;
const TOTAL_DAYS = 7;

interface PixelGridProps {
  grid: PixelGrid;
  existingCells?: Record<string, number>; // cellKey → commit count (read-only)
  selectedIntensity: IntensityLevel;
  onChange: (grid: PixelGrid) => void;
}

export default function PixelGrid({
  grid,
  existingCells = {},
  selectedIntensity,
  onChange,
}: PixelGridProps) {
  const paint = useCallback(
    (week: number, day: number, e: React.MouseEvent) => {
      e.preventDefault();
      const key = cellKey(week, day);
      // Don't paint over existing commits
      if (existingCells[key]) return;

      const newGrid = new Map(grid);
      if (selectedIntensity === 0 || newGrid.get(key) === selectedIntensity) {
        newGrid.delete(key);
      } else {
        newGrid.set(key, selectedIntensity);
      }
      onChange(newGrid);
    },
    [grid, existingCells, selectedIntensity, onChange]
  );

  return (
    <div className="overflow-x-auto w-full">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs text-[#8b949e] font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[2px] inline-block" style={{ backgroundColor: "#39d353" }} />
          Your art
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[2px] inline-block" style={{ backgroundColor: "#1f6feb" }} />
          Existing commits (locked)
        </span>
      </div>

      <div
        className="inline-grid select-none"
        style={{
          gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 14px)`,
          gridTemplateRows: `repeat(${TOTAL_DAYS}, 14px)`,
          gap: "3px",
        }}
      >
        {Array.from({ length: TOTAL_WEEKS }, (_, week) =>
          Array.from({ length: TOTAL_DAYS }, (_, day) => {
            const key = cellKey(week, day);
            const existingCount = existingCells[key];
            const paintedIntensity = (grid.get(key) ?? 0) as IntensityLevel;
            const isLocked = !!existingCount;

            const bgColor = isLocked
              ? existingColor(existingCount)
              : GITHUB_GREENS[paintedIntensity];

            return (
              <div
                key={key}
                title={isLocked ? `${existingCount} existing commit${existingCount !== 1 ? "s" : ""} — locked` : undefined}
                className={`rounded-[2px] transition-colors ${
                  isLocked
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:ring-1 hover:ring-white/30"
                }`}
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: bgColor,
                  gridColumn: week + 1,
                  gridRow: day + 1,
                  outline: isLocked ? "1px solid rgba(31,111,235,0.4)" : "none",
                  outlineOffset: "-1px",
                }}
                onMouseDown={(e) => !isLocked && paint(week, day, e)}
                onMouseEnter={(e) => {
                  if (!isLocked && e.buttons === 1) paint(week, day, e);
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
