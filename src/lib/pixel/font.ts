import type { IntensityLevel, PixelGrid } from "@/types";
import { cellKey } from "@/types";

// ── 5×7 Bitmap Font ───────────────────────────────────────────────────────────
// Each character is a 5-column × 7-row bitmap, stored as 7 row bitmasks (MSB = leftmost pixel).
// Source: derived from classic 5×7 LED matrix font.

const FONT: Record<string, number[]> = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11100, 0b10010, 0b10001, 0b10001, 0b10001, 0b10010, 0b11100],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01111],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  J: [0b11111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10001, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  X: [0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b01010, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  "0": [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  "1": [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  "2": [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
  "3": [0b11111, 0b00001, 0b00010, 0b00110, 0b00001, 0b10001, 0b01110],
  "4": [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  "5": [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  "6": [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  "7": [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  "8": [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  "9": [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  " ": [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
  "!": [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000, 0b00100],
  "?": [0b01110, 0b10001, 0b00001, 0b00110, 0b00100, 0b00000, 0b00100],
  ".": [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100],
  "-": [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
  "<": [0b00010, 0b00100, 0b01000, 0b10000, 0b01000, 0b00100, 0b00010],
  ">": [0b01000, 0b00100, 0b00010, 0b00001, 0b00010, 0b00100, 0b01000],
  "/": [0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b00000, 0b00000],
};

// Character dimensions (pixels)
export const CHAR_WIDTH = 5;
export const CHAR_HEIGHT = 7;
export const CHAR_GAP = 1; // 1 column gap between characters

/**
 * Converts a text string into a PixelGrid, starting at the given
 * (weekOffset, dayOffset) position within the contribution grid.
 *
 * Text is uppercased automatically. Unknown characters are treated as spaces.
 *
 * @param text        The string to render
 * @param intensity   The intensity level to use for lit pixels (default: 4)
 * @param weekOffset  Starting week column (default: 1, leaving a gap at the left edge)
 * @param dayOffset   Starting day row (default: 0)
 */
export function textToGrid(
  text: string,
  intensity: IntensityLevel = 4,
  weekOffset = 1,
  dayOffset = 0
): PixelGrid {
  const grid: PixelGrid = new Map();
  const upperText = text.toUpperCase();

  let currentWeek = weekOffset;

  for (const char of upperText) {
    const bitmap = FONT[char] ?? FONT[" "];

    for (let row = 0; row < CHAR_HEIGHT; row++) {
      const rowBits = bitmap[row];
      for (let col = 0; col < CHAR_WIDTH; col++) {
        const isLit = (rowBits >> (CHAR_WIDTH - 1 - col)) & 1;
        if (isLit) {
          const week = currentWeek + col;
          const day = dayOffset + row;
          // Clamp to valid grid bounds (0-52 weeks, 0-6 days)
          if (week <= 52 && day <= 6) {
            grid.set(cellKey(week, day), intensity);
          }
        }
      }
    }

    currentWeek += CHAR_WIDTH + CHAR_GAP;
  }

  return grid;
}

/**
 * Estimates how many weeks a string will occupy in the contribution grid.
 * Useful for truncating text that would overflow a given year.
 */
export function estimateTextWidth(text: string): number {
  return text.length * (CHAR_WIDTH + CHAR_GAP) - CHAR_GAP;
}

/**
 * Returns the maximum number of characters that fit within a given week count.
 */
export function maxCharsForWidth(availableWeeks: number): number {
  return Math.floor((availableWeeks + CHAR_GAP) / (CHAR_WIDTH + CHAR_GAP));
}
