"use client";

// Renders "PIXLOG" using the 5×7 bitmap font as a GitHub-graph-style preview
const FONT: Record<string, number[]> = {
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  X: [0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b01010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01111],
};

const CHAR_WIDTH = 5;
const CHAR_GAP = 1;
const TEXT = "PIXLOG";

// Build the set of lit cells
const litCells = new Set<string>();
let wx = 1;
for (const ch of TEXT) {
  const bitmap = FONT[ch];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < CHAR_WIDTH; col++) {
      if ((bitmap[row] >> (CHAR_WIDTH - 1 - col)) & 1) {
        litCells.add(`${wx + col}:${row}`);
      }
    }
  }
  wx += CHAR_WIDTH + CHAR_GAP;
}

const TOTAL_WEEKS = wx + 1;

const GITHUB_GREENS = [
  "#161b22", // 0 — empty
  "#0e4429", // 1
  "#006d32", // 2
  "#26a641", // 3
  "#39d353", // 4
];

function cellShade(week: number, day: number): string {
  if (litCells.has(`${week}:${day}`)) return GITHUB_GREENS[4];
  // faint noise for empty cells — makes it look like a real graph
  const hash = (week * 7 + day) % 7;
  if (hash === 0) return GITHUB_GREENS[1];
  return GITHUB_GREENS[0];
}

export default function PixlogPreview() {
  return (
    <div className="overflow-x-auto w-full max-w-xl">
      <div
        className="inline-grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 11px)`,
          gridTemplateRows: `repeat(7, 11px)`,
        }}
      >
        {Array.from({ length: TOTAL_WEEKS }, (_, week) =>
          Array.from({ length: 7 }, (_, day) => (
            <div
              key={`${week}:${day}`}
              className="rounded-[2px]"
              style={{
                width: 11,
                height: 11,
                backgroundColor: cellShade(week, day),
                gridColumn: week + 1,
                gridRow: day + 1,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
