/**
 * Pixlog Art Generation Worker — local development only.
 *
 * In production, jobs are processed by the Vercel Cron at /api/cron (every minute).
 * Locally, run: npm run worker
 */

import "dotenv/config";
import { processPendingJobs } from "@/lib/processJob";

const POLL_INTERVAL_MS = 2000;

async function poll() {
  await processPendingJobs(5);
}

console.log("[Worker] Pixlog worker started — polling every 2s");
setInterval(poll, POLL_INTERVAL_MS);
poll();

process.on("SIGTERM", () => {
  console.log("[Worker] Shutting down...");
  process.exit(0);
});
