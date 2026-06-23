"use client";

import { useState } from "react";

interface ShareModalProps {
  repoUrl: string;
  repoName: string;
  username: string;
  year: number;
  artLabel: string;
  gridData: Record<string, number>;
  commitCount: number;
  onClose: () => void;
}

export default function ShareModal({
  repoUrl,
  repoName,
  username,
  year,
  artLabel,
  gridData,
  commitCount,
  onClose,
}: ShareModalProps) {
  const [addedToGallery, setAddedToGallery] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pixlog.app";

  const linkedInText = encodeURIComponent(
    `Just drew "${artLabel}" on my GitHub contribution graph using Pixlog 🎨\n\n` +
    `${commitCount} real commits, backdated to form pixel art — no tools installed, no local git required.\n\n` +
    `Check it out: ${repoUrl}\n\n` +
    `Make yours at ${appUrl} 👇\n` +
    `#GitHub #pixelart #buildinpublic #devtools`
  );

  const twitterText = encodeURIComponent(
    `Drew "${artLabel}" on my GitHub graph with ${commitCount} real commits 🎨\n\n` +
    `Made with Pixlog — pixel art via your contribution graph\n\n` +
    `${repoUrl}\n\n` +
    `Make yours → ${appUrl}`
  );

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(repoUrl)}&summary=${linkedInText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}`;

  const handleAddToGallery = async () => {
    setGalleryLoading(true);
    try {
      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoName,
          repoUrl,
          artLabel,
          gridData,
          year,
          commitCount,
        }),
      });
      setAddedToGallery(true);
    } catch {
      // silent fail
    } finally {
      setGalleryLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">🎉 Pixel art is live!</h2>
            <p className="text-[#8b949e] text-sm mt-0.5">
              It may take a few minutes to appear on your profile.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#484f58] hover:text-[#8b949e] transition-colors p-1"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
            </svg>
          </button>
        </div>

        {/* Repo link */}
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 rounded-lg border border-[#30363d] hover:border-[#8b949e] transition-colors group"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current text-[#8b949e] shrink-0">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
          </svg>
          <span className="text-[#388bfd] text-sm font-mono group-hover:underline truncate">
            github.com/{username}/{repoName}
          </span>
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current text-[#484f58] shrink-0 ml-auto">
            <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/>
          </svg>
        </a>

        {/* Share buttons */}
        <div className="space-y-2">
          <p className="text-xs text-[#484f58] uppercase tracking-wider font-mono">Share your creation</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a66c2] hover:bg-[#0958a8] text-white text-sm font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-sm font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X / Twitter
            </a>
          </div>
        </div>

        {/* Add to gallery */}
        <div className="border-t border-[#21262d] pt-4">
          {addedToGallery ? (
            <div className="flex items-center gap-2 text-sm text-[#39d353]">
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
              </svg>
              Added to the community gallery!{" "}
              <a href="/gallery" className="underline hover:text-white">View gallery →</a>
            </div>
          ) : (
            <button
              onClick={handleAddToGallery}
              disabled={galleryLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e] text-sm transition-colors disabled:opacity-50"
            >
              {galleryLoading ? (
                "Adding…"
              ) : (
                <>
                  <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
                    <path d="M8 2a5 5 0 1 0 4.5 7.15l2.15 2.15a.75.75 0 1 0 1.06-1.06l-2.15-2.15A5 5 0 0 0 8 2ZM4.5 7a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"/>
                    <path d="M7.25 4.75a.75.75 0 0 1 1.5 0v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5Z"/>
                  </svg>
                  Add to community gallery
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
