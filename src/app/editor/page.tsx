"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import PixelGrid from "@/components/editor/PixelGrid";
import IntensityPicker from "@/components/editor/IntensityPicker";
import FontInput from "@/components/editor/FontInput";
import YearPicker from "@/components/editor/YearPicker";
import RepoSelector from "@/components/editor/RepoSelector";
import RepoDetails from "@/components/editor/RepoDetails";
import InstallGate from "@/components/editor/InstallGate";
import ShareModal from "@/components/editor/ShareModal";
import SignOutButton from "@/components/SignOutButton";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useState } from "react";
import type { IntensityLevel, PixelGrid as PixelGridType } from "@/types";

export default function EditorPage() {
  const { data: session } = useSession();
  const { grid, set: setGrid, undo, redo, canUndo, canRedo } = useUndoRedo(new Map());
  const [intensity, setIntensity] = useState<IntensityLevel>(4);
  const [year, setYear] = useState(new Date().getFullYear());
  const [repoName, setRepoName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [totalCommits, setTotalCommits] = useState(0);
  const [existingCells, setExistingCells] = useState<Record<string, number>>({});
  const [loadingContributions, setLoadingContributions] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isInstalled = session?.user?.installationId != null;

  // Fetch existing contributions when year changes
  useEffect(() => {
    setLoadingContributions(true);
    fetch(`/api/contributions?year=${year}`)
      .then((r) => r.json())
      .then((data) => setExistingCells(data.cells ?? {}))
      .catch(() => setExistingCells({}))
      .finally(() => setLoadingContributions(false));
  }, [year]);

  // Keyboard shortcuts: Cmd+Z / Cmd+Shift+Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const handleApplyText = useCallback((newGrid: PixelGridType) => {
    setGrid(newGrid);
  }, [setGrid]);

  const handleGenerate = async () => {
    if (grid.size === 0 || !repoName) return;
    setStatus("loading");
    setProgress(0);
    setRepoUrl(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grid: Object.fromEntries(grid), year, repoName }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to start job");
      }

      const { jobId } = await res.json();

      pollRef.current = setInterval(async () => {
        const r = await fetch(`/api/jobs/${jobId}`);
        const data = await r.json();
        setProgress(data.progress ?? 0);
        if (data.status === "done") {
          clearInterval(pollRef.current!);
          setStatus("done");
          setRepoUrl(data.result?.repoUrl ?? null);
          setTotalCommits(data.result?.commitCount ?? grid.size);
          setShowShareModal(true);
        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setStatus("error");
        }
      }, 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#30363d] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 grid grid-cols-4 grid-rows-4 gap-0.5">
            {[1,1,1,0, 1,0,1,1, 1,0,0,1, 1,1,1,0].map((on, i) => (
              <div key={i} className={`rounded-[1px] ${on ? "bg-[#39d353]" : "bg-[#161b22]"}`} />
            ))}
          </div>
          <span className="font-mono font-bold text-lg text-white tracking-tight">pixlog</span>
        </div>
        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="flex items-center gap-2 text-sm text-[#8b949e]">
              <img src={session.user.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
              <span>@{session.user.login}</span>
            </div>
          )}
          <span className="text-[#30363d]">|</span>
          <a href="/" className="text-sm text-[#8b949e] hover:text-white transition-colors">Home</a>
          <span className="text-[#30363d]">|</span>
          <a href="/gallery" className="text-sm text-[#8b949e] hover:text-white transition-colors">Gallery</a>
          <span className="text-[#30363d]">|</span>
          <SignOutButton />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center py-6 px-4 gap-4 max-w-5xl mx-auto w-full">

        {/* Install gate */}
        {session && !isInstalled && (
          <InstallGate appSlug="pixlogapp" />
        )}

        {/* Toolbar */}
        <div className="w-full flex flex-wrap items-center gap-4 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3">
          <FontInput intensity={intensity} onApply={handleApplyText} />
          <div className="h-5 w-px bg-[#30363d] hidden sm:block" />
          <IntensityPicker value={intensity} onChange={setIntensity} />
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (⌘Z)"
              className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current"><path d="M1.22 6.28a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06l-2.22 2.22V1.75a.75.75 0 0 0-1.5 0v4c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5H3.5l2.22-2.22a.75.75 0 0 0-1.06-1.06l-3.5 3.5ZM13 9.25H3a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5ZM3 12.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H3Z"/></svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (⌘⇧Z)"
              className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current" style={{transform:"scaleX(-1)"}}><path d="M1.22 6.28a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06l-2.22 2.22V1.75a.75.75 0 0 0-1.5 0v4c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5H3.5l2.22-2.22a.75.75 0 0 0-1.06-1.06l-3.5 3.5ZM13 9.25H3a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5ZM3 12.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H3Z"/></svg>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
          <div className="mb-2 text-xs text-[#8b949e] font-mono flex items-center gap-3">
            <span>{grid.size} cell{grid.size !== 1 ? "s" : ""} painted</span>
            {loadingContributions && <span className="text-[#484f58]">Loading existing commits…</span>}
            {!loadingContributions && Object.keys(existingCells).length > 0 && (
              <span className="text-[#1f6feb]">{Object.keys(existingCells).length} locked cells</span>
            )}
          </div>
          <PixelGrid
            grid={grid}
            existingCells={existingCells}
            selectedIntensity={intensity}
            onChange={setGrid}
          />
        </div>

        {/* Bottom row: Year + Repo + Generate */}
        <div className="w-full flex flex-wrap items-center gap-4 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3">
          <YearPicker value={year} onChange={setYear} />
          <div className="h-5 w-px bg-[#30363d] hidden sm:block" />
          <RepoSelector value={repoName} onChange={setRepoName} />
          <div className="ml-auto">
            <button
              onClick={handleGenerate}
              disabled={grid.size === 0 || !repoName || status === "loading" || !isInstalled}
              className="px-5 py-2 rounded-lg bg-[#238636] text-white font-semibold hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {status === "loading" ? `Generating… ${progress}%` : "Generate →"}
            </button>
          </div>
        </div>

        {/* Repo details */}
        <RepoDetails repoName={repoName} />

        {/* Progress bar */}
        {status === "loading" && (
          <div className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="flex justify-between text-xs text-[#8b949e] mb-2 font-mono">
              <span>Pushing commits to GitHub…</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-[#0d1117] rounded-full h-2">
              <div
                className="bg-[#39d353] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success */}
        {status === "done" && repoUrl && (
          <div className="w-full bg-[#0f2b1a] border border-[#238636] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-[#39d353] font-semibold">🎉 Pixel art is live!</p>
              <p className="text-sm text-[#8b949e] mt-1">
                It may take a few minutes to appear on your GitHub profile.
              </p>
            </div>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-medium hover:bg-[#2ea043] transition-colors whitespace-nowrap"
            >
              View on GitHub →
            </a>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="w-full bg-[#2d1b1b] border border-[#f85149] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-[#f85149] font-semibold">Generation failed</p>
              <p className="text-sm text-[#8b949e] mt-1">
                Check that PixlogApp is installed on your account and try again.
              </p>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm text-[#8b949e] hover:text-white border border-[#30363d] rounded-lg px-3 py-1.5 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Share modal */}
      {showShareModal && repoUrl && session?.user && (
        <ShareModal
          repoUrl={repoUrl}
          repoName={repoName}
          username={session.user.login ?? ""}
          year={year}
          artLabel={repoName}
          gridData={Object.fromEntries(grid)}
          commitCount={totalCommits}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </main>
  );
}
