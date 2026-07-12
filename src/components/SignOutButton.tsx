"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="border-rose/40 bg-card text-rose w-full rounded-[18px] border py-[15px] text-[14px] font-bold transition-opacity active:opacity-70"
    >
      log out
    </button>
  );
}
