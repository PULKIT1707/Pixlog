// ── Grid / Pixel Art ─────────────────────────────────────────────────────────

/**
 * Intensity level matching GitHub's 5-step contribution graph scale.
 * 0 = no contribution, 4 = maximum (darkest green).
 */
export type IntensityLevel = 0 | 1 | 2 | 3 | 4;

/**
 * A single cell in the contribution grid.
 * week: 0-52 (column), day: 0-6 (row, 0 = Sunday)
 */
export interface GridCell {
  week: number;
  day: number;
  intensity: IntensityLevel;
}

/**
 * Full pixel art design: a sparse map of activated cells.
 * Key format: `${week}:${day}`
 */
export type PixelGrid = Map<string, IntensityLevel>;

export function cellKey(week: number, day: number): string {
  return `${week}:${day}`;
}

// ── Year / Calendar ───────────────────────────────────────────────────────────

export interface YearConfig {
  year: number;
  /** ISO date string of the Sunday that starts week 0 in the contribution graph */
  startDate: string;
  /** Total number of weeks in this year's graph (52 or 53) */
  totalWeeks: number;
}

// ── Commit Engine ─────────────────────────────────────────────────────────────

/**
 * Commits-per-day mapping for each intensity level.
 * Chosen so GitHub renders visually distinct shades.
 */
export const INTENSITY_COMMIT_COUNT: Record<IntensityLevel, number> = {
  0: 0,
  1: 1,
  2: 4,
  3: 9,
  4: 16,
};

export interface CommitSpec {
  /** ISO 8601 date string — the date to backdate the commit to */
  date: string;
  /** Number of commits to create on this date */
  count: number;
}

// ── Job Queue ─────────────────────────────────────────────────────────────────

export type JobStatus = "pending" | "running" | "done" | "failed";

export interface PixlogJobData {
  /** GitHub user login */
  username: string;
  /** GitHub App installation token (short-lived, fetched at enqueue time) */
  installationToken: string;
  /** Name of the repo to create */
  repoName: string;
  /** Commit specs derived from the pixel grid */
  commits: CommitSpec[];
  /** Display label shown in the UI */
  artLabel: string;
}

export interface PixlogJobResult {
  repoUrl: string;
  commitCount: number;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: number; // 0-100
  result?: PixlogJobResult;
  error?: string;
}

// ── GitHub Auth ───────────────────────────────────────────────────────────────

export interface GitHubSession {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
  };
  /** GitHub App installation ID for this user's account */
  installationId: number | null;
  /** NextAuth access token (used only to fetch installation ID) */
  accessToken: string;
}
