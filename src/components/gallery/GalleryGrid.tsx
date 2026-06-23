"use client";

import { useEffect, useState } from "react";
import MiniPixelGrid from "./MiniPixelGrid";
import Link from "next/link";

interface GalleryItem {
  id: string;
  username: string;
  avatar_url: string | null;
  repo_name: string;
  repo_url: string;
  art_label: string;
  grid_data: Record<string, number>;
  year: number;
  commit_count: number;
  created_at: string;
}

export default function GalleryGrid() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const LIMIT = 18;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gallery?page=${page}&limit=${LIMIT}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 animate-pulse">
            <div className="h-16 bg-[#30363d] rounded mb-3" />
            <div className="h-3 bg-[#30363d] rounded w-2/3 mb-2" />
            <div className="h-3 bg-[#30363d] rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-[#8b949e]">
        <p>Failed to load gallery. Please try again.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-[#8b949e] text-lg">No pixel art yet — be the first!</p>
        <Link
          href="/editor"
          className="inline-block px-6 py-2.5 rounded-lg bg-[#238636] text-white font-semibold hover:bg-[#2ea043] transition-colors text-sm"
        >
          Create pixel art →
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-1.5 rounded-lg border border-[#30363d] text-sm text-[#8b949e] hover:text-white hover:border-[#8b949e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-[#484f58]">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-1.5 rounded-lg border border-[#30363d] text-sm text-[#8b949e] hover:text-white hover:border-[#8b949e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      <p className="text-center text-xs text-[#484f58]">{total} piece{total !== 1 ? "s" : ""} in the gallery</p>
    </div>
  );
}

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <a href={`/gallery/${item.id}`} className="block bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#8b949e] transition-colors group space-y-3">
      {/* Mini grid preview */}
      <div className="w-full overflow-hidden rounded">
        <MiniPixelGrid gridData={item.grid_data} />
      </div>

      {/* Label */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{item.art_label}</p>
          <p className="text-[#484f58] text-xs font-mono">{item.year} · {item.commit_count} commits</p>
        </div>
        <a
          href={item.repo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1.5 rounded text-[#484f58] hover:text-[#8b949e] transition-colors"
          title="View on GitHub"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
          </svg>
        </a>
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#21262d]">
        {item.avatar_url ? (
          <img src={item.avatar_url} className="w-5 h-5 rounded-full" alt="" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-[#30363d]" />
        )}
        <span className="text-xs text-[#8b949e]">@{item.username}</span>
      </div>
    </a>
  );
}
