import { startOfWeek, getDay, addDays, format } from "date-fns";
import type { YearConfig } from "@/types";

/**
 * GitHub renders the contribution graph starting from the Sunday
 * of the week containing January 1st of the selected year.
 *
 * This matches GitHub's exact rendering logic.
 */
export function getYearConfig(year: number): YearConfig {
  const jan1 = new Date(year, 0, 1);

  // Find the Sunday on or before Jan 1
  const dayOfWeek = getDay(jan1); // 0 = Sun, 6 = Sat
  const graphStart = addDays(jan1, -dayOfWeek);

  // Count weeks: from graphStart until we've covered the full year
  const dec31 = new Date(year, 11, 31);
  const daysDiff = Math.floor(
    (dec31.getTime() - graphStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalWeeks = Math.ceil((daysDiff + 1) / 7);

  return {
    year,
    startDate: format(graphStart, "yyyy-MM-dd"),
    totalWeeks,
  };
}

/**
 * Converts a grid cell (week, day) into an ISO date string.
 * week: 0-based column index, day: 0=Sunday … 6=Saturday
 */
export function cellToDate(
  yearConfig: YearConfig,
  week: number,
  day: number
): string {
  const start = new Date(yearConfig.startDate);
  const date = addDays(start, week * 7 + day);
  return format(date, "yyyy-MM-dd");
}

/**
 * Returns an array of available years for the year picker.
 * Spans from GitHub's founding year (2008) to current year + 1.
 */
export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear + 1; y >= 2008; y--) {
    years.push(y);
  }
  return years;
}

/**
 * Short month labels positioned at the correct week column
 * for the contribution graph header row.
 */
export function getMonthLabels(
  yearConfig: YearConfig
): Array<{ label: string; week: number }> {
  const start = new Date(yearConfig.startDate);
  const labels: Array<{ label: string; week: number }> = [];
  const seen = new Set<number>();

  for (let week = 0; week < yearConfig.totalWeeks; week++) {
    const date = addDays(start, week * 7);
    const month = date.getMonth();
    if (!seen.has(month)) {
      seen.add(month);
      labels.push({
        label: date.toLocaleString("default", { month: "short" }),
        week,
      });
    }
  }

  return labels;
}
