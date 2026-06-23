"use client";

import type { IntensityLevel } from "@/types";

const GITHUB_GREENS: Record<IntensityLevel, string> = {
  0: "#161b22",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

const LABELS: Record<IntensityLevel, string> = {
  0: "Erase",
  1: "Light",
  2: "Medium",
  3: "Dark",
  4: "Max",
};

interface IntensityPickerProps {
  value: IntensityLevel;
  onChange: (v: IntensityLevel) => void;
}

export default function IntensityPicker({ value, onChange }: IntensityPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#8b949e] font-mono">Brush:</span>
      <div className="flex gap-1.5">
        {([0, 1, 2, 3, 4] as IntensityLevel[]).map((level) => (
          <button
            key={level}
            title={LABELS[level]}
            onClick={() => onChange(level)}
            className={`w-7 h-7 rounded-[3px] border-2 transition-all ${
              value === level
                ? "border-white scale-110"
                : "border-transparent hover:border-white/40"
            }`}
            style={{ backgroundColor: GITHUB_GREENS[level] }}
          />
        ))}
      </div>
      <span className="text-xs text-[#8b949e] font-mono">{LABELS[value]}</span>
    </div>
  );
}
