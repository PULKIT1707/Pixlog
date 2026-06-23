"use client";

import { getAvailableYears } from "@/lib/pixel/calendar";

interface YearPickerProps {
  value: number;
  onChange: (year: number) => void;
}

export default function YearPicker({ value, onChange }: YearPickerProps) {
  const years = getAvailableYears();
  const currentYear = new Date().getFullYear();
  const isFuture = value > currentYear;
  const isPast = value < currentYear;

  let hint = "Showing your existing commits for this year";
  if (isFuture) hint = "⚠️ Future year — commits won't appear on your graph until those dates arrive";
  if (isPast && value < 2010) hint = "Clean canvas — great for pixel art";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-[#8b949e] font-mono">Year:</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-[#161b22] border border-[#30363d] text-white rounded-md px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-[#388bfd] cursor-pointer"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}{y === currentYear ? " (current)" : y === currentYear + 1 ? " (future)" : ""}
          </option>
        ))}
      </select>
      <span className={`text-xs ${isFuture ? "text-[#d29922]" : "text-[#484f58]"}`}>
        {hint}
      </span>
    </div>
  );
}
