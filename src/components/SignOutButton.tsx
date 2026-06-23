"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-[#8b949e] hover:text-white transition-colors"
    >
      Sign out
    </button>
  );
}
