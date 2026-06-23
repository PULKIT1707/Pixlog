"use client";

import { useState } from "react";
import type { IntensityLevel, PixelGrid } from "@/types";
import { textToGrid, maxCharsForWidth } from "@/lib/pixel/font";

interface FontInputProps {
  intensity: IntensityLevel;
  onApply: (grid: PixelGrid) => void;
}

const MAX_CHARS = maxCharsForWidth(52);

export default function FontInput({ intensity, onApply }: FontInputProps) {
  const [text, setText] = useState("");

  const handleApply = () => {
    if (!text.trim()) return;
    const grid = textToGrid(text.trim(), intensity);
    onApply(grid);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={(e) => e.key === "Enter" && handleApply()}
        placeholder="Type text (A–Z, 0–9)…"
        maxLength={MAX_CHARS}
        className="bg-[#161b22] border border-[#30363d] text-white placeholder-[#484f58] rounded-md px-3 py-1.5 text-sm font-mono w-52 focus:outline-none focus:border-[#388bfd]"
      />
      <button
        onClick={handleApply}
        disabled={!text.trim()}
        className="px-3 py-1.5 text-sm rounded-md bg-[#238636] text-white font-medium hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Render
      </button>
      <button
        onClick={() => onApply(new Map())}
        className="px-3 py-1.5 text-sm rounded-md border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e] transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
