"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface RepoSelectorProps {
  value: string;
  onChange: (name: string) => void;
}

export default function RepoSelector({ value, onChange }: RepoSelectorProps) {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (!session?.user?.accessToken) return;
    setLoading(true);
    fetch("https://api.github.com/user/repos?per_page=100&sort=updated&type=owner", {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((r: any) => r.name);
          setRepos(names);
          // Pre-select first repo if nothing selected yet
          if (!value) onChange(names[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [session]);

  if (isCustom) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#8b949e] font-mono">New repo:</span>
        <input
          type="text"
          value={value}
          autoFocus
          onChange={(e) =>
            onChange(e.target.value.replace(/[^a-z0-9-_.]/gi, "-").toLowerCase())
          }
          placeholder="my-pixel-art"
          className={`bg-[#0d1117] border text-white rounded-md px-3 py-1.5 text-sm font-mono w-44 focus:outline-none ${
            value ? "border-[#30363d] focus:border-[#388bfd]" : "border-[#f85149]"
          }`}
        />
        <button
          onClick={() => { setIsCustom(false); onChange(repos[0] ?? ""); }}
          className="text-xs text-[#8b949e] hover:text-white transition-colors whitespace-nowrap"
        >
          ← pick existing
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#8b949e] font-mono">Repo:</span>
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === "__new__") {
            setIsCustom(true);
            onChange("");
          } else {
            onChange(e.target.value);
          }
        }}
        disabled={loading}
        className="bg-[#161b22] border border-[#30363d] text-white rounded-md px-2 py-1.5 text-sm font-mono w-52 focus:outline-none focus:border-[#388bfd] cursor-pointer disabled:opacity-50"
      >
        {loading
          ? <option>Loading repos…</option>
          : <>
              <option value="__new__">+ Create new repo…</option>
              {repos.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </>
        }
      </select>
    </div>
  );
}
