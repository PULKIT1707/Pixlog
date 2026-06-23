"use client";

interface InstallGateProps {
  appSlug: string;
}

export default function InstallGate({ appSlug }: InstallGateProps) {
  return (
    <div className="w-full bg-[#161b22] border border-[#d29922] rounded-lg px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[#d29922] text-lg">⚠️</span>
        <div>
          <p className="text-white text-sm font-semibold">GitHub App not installed</p>
          <p className="text-[#8b949e] text-xs mt-0.5">
            Install the PixlogApp on your GitHub account to create repos and push commits.
          </p>
        </div>
      </div>
      <a
        href={`https://github.com/apps/${appSlug}/installations/new`}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 px-4 py-2 rounded-lg bg-[#d29922] text-black text-sm font-semibold hover:bg-[#e3b341] transition-colors whitespace-nowrap"
      >
        Install App →
      </a>
    </div>
  );
}
