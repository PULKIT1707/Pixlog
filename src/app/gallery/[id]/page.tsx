import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import MiniPixelGrid from "@/components/gallery/MiniPixelGrid";
import CopyLinkButton from "@/components/gallery/CopyLinkButton";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pixlog.app";

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("gallery")
      .select("art_label, username, year")
      .eq("id", id)
      .single();

    if (!data) return {};

    const title = `${data.art_label} by @${data.username} — pixlog`;
    const description = `Pixel art drawn with real GitHub commits in ${data.year}. Made with pixlog.`;
    const ogImageUrl = `${appUrl}/api/og?id=${id}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogImageUrl, width: 1200, height: 630 }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {};
  }
}

export default async function GalleryItemPage({ params }: Props) {
  const { id } = await params;

  const supabase = createServerClient();
  const { data: item, error } = await supabase
    .from("gallery")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pixlog.app";
  const shareUrl = `${appUrl}/gallery/${id}`;

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const twitterText = encodeURIComponent(
    `Drew "${item.art_label}" on my GitHub graph with ${item.commit_count} real commits 🎨\n\nMade with Pixlog → ${shareUrl}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}`;

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
        <Link href="/gallery" className="text-sm text-[#8b949e] hover:text-white transition-colors">
          ← Gallery
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center py-12 px-4 gap-8 max-w-4xl mx-auto w-full">

        {/* Pixel art */}
        <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-6">
          <MiniPixelGrid gridData={item.grid_data as Record<string, number>} />
        </div>

        {/* Info */}
        <div className="w-full bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{item.art_label}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-[#8b949e]">
                <span>{item.year}</span>
                <span>·</span>
                <span>{item.commit_count} commits</span>
              </div>
            </div>
            <a
              href={item.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#30363d] text-sm text-[#8b949e] hover:text-white hover:border-[#8b949e] transition-colors"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
              </svg>
              View on GitHub
            </a>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#21262d]">
            {item.avatar_url ? (
              <img src={item.avatar_url} className="w-7 h-7 rounded-full" alt="" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#30363d]" />
            )}
            <div>
              <p className="text-sm text-white font-medium">@{item.username}</p>
              <p className="text-xs text-[#484f58]">
                {new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Share */}
        <div className="w-full space-y-3">
          <p className="text-xs text-[#484f58] uppercase tracking-wider font-mono">Share this</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a66c2] hover:bg-[#0958a8] text-white text-sm font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Share on LinkedIn
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-sm font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on X
            </a>
            <CopyLinkButton url={shareUrl} />
          </div>
        </div>

        {/* CTA */}
        <div className="w-full bg-[#0f2b1a] border border-[#238636] rounded-xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Make your own pixel art</p>
            <p className="text-sm text-[#8b949e] mt-0.5">Draw text or patterns on your GitHub contribution graph.</p>
          </div>
          <Link
            href="/"
            className="shrink-0 px-5 py-2.5 rounded-lg bg-[#238636] text-white font-semibold hover:bg-[#2ea043] transition-colors text-sm"
          >
            Try Pixlog →
          </Link>
        </div>
      </div>
    </main>
  );
}
