import { Suspense } from "react";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import Link from "next/link";

export const metadata = {
  title: "Gallery — pixlog",
  description: "Pixel art drawn with GitHub contribution graphs",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#30363d] px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 grid grid-cols-4 grid-rows-4 gap-0.5">
            {[1,1,1,0, 1,0,1,1, 1,0,0,1, 1,1,1,0].map((on, i) => (
              <div key={i} className={`rounded-[1px] ${on ? "bg-[#39d353]" : "bg-[#161b22]"}`} />
            ))}
          </div>
          <span className="font-mono font-bold text-lg text-white tracking-tight">pixlog</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-[#8b949e]">
          <Link href="/editor" className="hover:text-white transition-colors">Editor</Link>
          <span className="text-[#30363d]">|</span>
          <span className="text-white font-medium">Gallery</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center py-10 px-4 gap-8 max-w-6xl mx-auto w-full">
        {/* Page title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Community Gallery</h1>
          <p className="text-[#8b949e]">Pixel art drawn with real GitHub commits</p>
        </div>

        <Suspense fallback={<GalleryFallback />}>
          <GalleryGrid />
        </Suspense>
      </div>
    </main>
  );
}

function GalleryFallback() {
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
