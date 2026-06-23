import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInButton from "@/components/SignInButton";
import PixlogPreview from "@/components/PixlogPreview";

export default async function LandingPage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Auth not configured yet — show landing page
  }
  if (session) redirect("/editor");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0d1117] px-4">
      {/* Hero */}
      <div className="flex flex-col items-center gap-8 text-center max-w-2xl">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 grid grid-cols-4 grid-rows-4 gap-0.5">
            {[1,1,1,0, 1,0,1,1, 1,0,0,1, 1,1,1,0].map((on, i) => (
              <div
                key={i}
                className={`rounded-[1px] ${on ? "bg-[#39d353]" : "bg-[#161b22]"}`}
              />
            ))}
          </div>
          <span className="text-3xl font-bold tracking-tight text-white font-mono">
            pixlog
          </span>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Pixel art drawn with<br />your git log
          </h1>
          <p className="text-[#8b949e] text-lg">
            Turn your GitHub contribution graph into pixel art.
            <br />No credentials ever leave your browser.
          </p>
        </div>

        {/* Live pixel art preview */}
        <PixlogPreview />

        {/* Sign in */}
        <SignInButton />

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-3 text-sm text-[#8b949e]">
          {[
            "GitHub App — no PATs",
            "5-level intensity",
            "Live preview",
            "No local git needed",
          ].map((f) => (
            <span
              key={f}
              className="rounded-full border border-[#30363d] px-3 py-1"
            >
              {f}
            </span>
          ))}
        </div>

        {/* How it works */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mt-4">
          {[
            { step: "01", title: "Draw", desc: "Type text or paint cells on a 52×7 grid — exactly like GitHub's graph." },
            { step: "02", title: "Generate", desc: "Pixlog creates a repo and pushes backdated commits via the GitHub API." },
            { step: "03", title: "Watch", desc: "Progress updates live. A link appears when your pixel art is live." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 space-y-1">
              <span className="text-xs font-mono text-[#39d353]">{step}</span>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-[#8b949e]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
