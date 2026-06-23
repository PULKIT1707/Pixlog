"use client";

// 52 weeks × 7 days mini preview of a grid_data record
const INTENSITY_COLORS: Record<number, string> = {
  0: "#161b22",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

interface MiniPixelGridProps {
  gridData: Record<string, number>;
}

export default function MiniPixelGrid({ gridData }: MiniPixelGridProps) {
  const weeks = 52;
  const days = 7;

  return (
    <div
      className="w-full"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${weeks}, 1fr)`,
        gridTemplateRows: `repeat(${days}, 1fr)`,
        gap: "1px",
        aspectRatio: `${weeks} / ${days}`,
      }}
    >
      {Array.from({ length: weeks }, (_, w) =>
        Array.from({ length: days }, (_, d) => {
          const key = `${w}:${d}`;
          const intensity = gridData[key] ?? 0;
          return (
            <div
              key={key}
              style={{
                backgroundColor: INTENSITY_COLORS[intensity] ?? INTENSITY_COLORS[0],
                borderRadius: "1px",
              }}
            />
          );
        })
      )}
    </div>
  );
}
