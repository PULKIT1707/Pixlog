/**
 * Pixlog Art Generation Worker
 *
 * Run with: npm run worker
 * Polls the Supabase jobs table for pending work and processes it.
 */

import "dotenv/config";
import { createServerClient } from "@/lib/supabase/server";
import type { CommitSpec, PixlogJobResult } from "@/types";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 3;

interface JobRow {
  id: string;
  username: string;
  installation_token: string;
  repo_name: string;
  commits: CommitSpec[];
  art_label: string;
  attempts: number;
}

async function processJob(job: JobRow): Promise<PixlogJobResult> {
  const supabase = createServerClient();
  const { id, username, installation_token, repo_name, commits, art_label } = job;

  const octokit = new (await import("@octokit/rest")).Octokit({ auth: installation_token });

  const updateProgress = (progress: number) =>
    supabase.from("jobs").update({ progress }).eq("id", id);

  // 1. Create repo
  await updateProgress(5);
  await octokit.repos.createForAuthenticatedUser({
    name: repo_name,
    private: false,
    description: "Pixel art on my GitHub contribution graph — made with Pixlog",
    auto_init: true,
  });

  // 2. Get default branch + HEAD SHA + tree SHA
  await updateProgress(10);
  const { data: repo } = await octokit.repos.get({ owner: username, repo: repo_name });
  const defaultBranch = repo.default_branch;

  const { data: refData } = await octokit.git.getRef({
    owner: username, repo: repo_name, ref: `heads/${defaultBranch}`,
  });
  let parentSha = refData.object.sha;

  const { data: headCommit } = await octokit.git.getCommit({
    owner: username, repo: repo_name, commit_sha: parentSha,
  });
  const treeSha = headCommit.tree.sha;

  // 3. Push backdated commits
  const totalCommits = commits.reduce((sum, c) => sum + c.count, 0);
  let createdCommits = 0;

  for (const spec of commits) {
    for (let i = 0; i < spec.count; i++) {
      const isoDate = `${spec.date}T12:00:00Z`;
      const { data: commitData } = await octokit.git.createCommit({
        owner: username,
        repo: repo_name,
        message: `pixlog: ${art_label} [${spec.date} ${i + 1}/${spec.count}]`,
        tree: treeSha,
        parents: [parentSha],
        author: { name: username, email: `${username}@users.noreply.github.com`, date: isoDate },
        committer: { name: username, email: `${username}@users.noreply.github.com`, date: isoDate },
      });

      parentSha = commitData.sha;
      createdCommits++;
      await updateProgress(10 + Math.floor((createdCommits / totalCommits) * 85));
    }
  }

  // 4. Update HEAD
  await octokit.git.updateRef({
    owner: username, repo: repo_name,
    ref: `heads/${defaultBranch}`, sha: parentSha, force: false,
  });

  await updateProgress(100);
  return { repoUrl: `https://github.com/${username}/${repo_name}`, commitCount: createdCommits };
}

async function poll() {
  const supabase = createServerClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "pending")
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(5);

  if (!jobs?.length) return;

  for (const job of jobs as JobRow[]) {
    // Claim the job (optimistic lock via status check)
    const { error } = await supabase
      .from("jobs")
      .update({ status: "running", attempts: job.attempts + 1 })
      .eq("id", job.id)
      .eq("status", "pending");

    if (error) continue;

    console.log(`[Worker] Processing job ${job.id} for @${job.username}`);

    try {
      const result = await processJob(job);
      await supabase.from("jobs").update({ status: "done", result, progress: 100 }).eq("id", job.id);
      console.log(`[Worker] Done — ${result.repoUrl}`);
    } catch (err: any) {
      const failed = job.attempts + 1 >= MAX_ATTEMPTS;
      await supabase
        .from("jobs")
        .update({ status: failed ? "failed" : "pending", error: err.message })
        .eq("id", job.id);
      console.error(`[Worker] Job ${job.id} failed:`, err.message);
    }
  }
}

console.log("[Worker] Pixlog worker started — polling every 2s");
setInterval(poll, POLL_INTERVAL_MS);
poll();

process.on("SIGTERM", () => {
  console.log("[Worker] Shutting down...");
  process.exit(0);
});
