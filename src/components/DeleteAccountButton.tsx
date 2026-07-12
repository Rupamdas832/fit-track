"use client";

import { useState, useTransition } from "react";
import { deleteAccountAction } from "@/server/actions/profile.actions";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="border-rose/20 bg-card text-rose/60 hover:border-rose/40 hover:text-rose w-full rounded-[18px] border py-[15px] text-[13px] font-bold transition-colors"
      >
        delete account
      </button>
    );
  }

  return (
    <div className="border-rose/40 bg-card space-y-3 rounded-[18px] border p-4">
      <p className="text-surface text-[13px]">
        This permanently deletes your account and all data. There&apos;s no undo.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          className="border-line bg-card-2 text-muted flex-1 rounded-[14px] border py-[11px] text-[13px] font-bold"
        >
          cancel
        </button>
        <button
          onClick={() => startTransition(() => deleteAccountAction())}
          disabled={isPending}
          className="bg-rose flex-1 rounded-[14px] py-[11px] text-[13px] font-bold text-white disabled:opacity-60"
        >
          {isPending ? "deleting…" : "yes, delete"}
        </button>
      </div>
    </div>
  );
}
