"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface RepoData {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  visibility: string;
  pushed_at: string;
  open_issues_count: number;
  html_url: string;
  default_branch: string;
}

interface RepoDetailsProps {
  repoName: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? "s" : ""} ago`;
}

export default function RepoDetails({ repoName }: RepoDetailsProps) {
  const { data: session } = useSession();
  const [repo, setRepo] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!repoName || !session?.user?.login || !session?.user?.accessToken) return;
    setLoading(true);
    setError(false);
    setRepo(null);

    fetch(`https://api.github.com/repos/${session.user.login}/${repoName}`, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setRepo)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [repoName, session]);

  if (!repoName) return null;

  if (loading) {
    return (
      <div className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <div className="animate-pulse flex gap-4">
          <div className="h-4 bg-[#30363d] rounded w-32" />
          <div className="h-4 bg-[#30363d] rounded w-48" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3">
        <p className="text-xs text-[#484f58] font-mono">
          This repo doesn't exist yet — it will be created when you generate.
        </p>
      </div>
    );
  }

  if (!repo) return null;

  return (
    <div className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#388bfd] font-semibold text-sm hover:underline truncate"
          >
            {session?.user?.login}/{repo.name}
          </a>
          <span className={`text-xs px-1.5 py-0.5 rounded-full border font-mono shrink-0 ${
            repo.visibility === "public"
              ? "text-[#8b949e] border-[#30363d]"
              : "text-[#d29922] border-[#d29922]/30"
          }`}>
            {repo.visibility}
          </span>
        </div>
        <span className="text-xs text-[#484f58] shrink-0">
          pushed {timeAgo(repo.pushed_at)}
        </span>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-sm text-[#8b949e]">{repo.description}</p>
      )}

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#8b949e]">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39d353]" />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
          {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>
          {repo.forks_count}
        </span>
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0 0-13Z"/></svg>
          {repo.open_issues_count} issues
        </span>
        <span className="text-[#484f58]">
          default: {repo.default_branch}
        </span>
      </div>
    </div>
  );
}
