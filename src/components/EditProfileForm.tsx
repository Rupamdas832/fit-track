"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/server/actions/profile.actions";
import type { AuthUser } from "@/server/auth";

export function EditProfileForm({ user }: { user: AuthUser }) {
  const [error, action, isPending] = useActionState(updateProfileAction, null);

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="text-muted mb-[6px] block text-[11px] font-bold tracking-widest uppercase">
          name
        </label>
        <input
          name="name"
          defaultValue={user.name}
          required
          className="border-line bg-card text-surface placeholder:text-muted/50 focus:border-lav w-full rounded-[16px] border px-[15px] py-[13px] text-[15px] focus:outline-none"
        />
      </div>

      <div>
        <label className="text-muted mb-[6px] block text-[11px] font-bold tracking-widest uppercase">
          avatar emoji
        </label>
        <input
          name="avatarEmoji"
          defaultValue={user.avatarEmoji}
          maxLength={4}
          className="border-line bg-card text-surface focus:border-lav w-full rounded-[16px] border px-[15px] py-[13px] text-[15px] focus:outline-none"
        />
      </div>

      <div>
        <label className="text-muted mb-[6px] block text-[11px] font-bold tracking-widest uppercase">
          timezone
        </label>
        <input
          name="timezone"
          defaultValue={user.timezone}
          className="border-line bg-card text-surface focus:border-lav w-full rounded-[16px] border px-[15px] py-[13px] text-[15px] focus:outline-none"
        />
      </div>

      <div>
        <label className="text-muted mb-[6px] block text-[11px] font-bold tracking-widest uppercase">
          height (cm) — optional
        </label>
        <input
          name="heightCm"
          type="number"
          step="0.1"
          min="100"
          max="250"
          defaultValue={user.heightCm ?? ""}
          placeholder="e.g. 175"
          className="border-line bg-card text-surface placeholder:text-muted/50 focus:border-lav w-full rounded-[16px] border px-[15px] py-[13px] text-[15px] focus:outline-none"
        />
      </div>

      {/* hidden field for goal — managed by GoalSegment separately */}
      <input type="hidden" name="goal" value={user.goal} />

      {error && <p className="bg-rose/10 text-rose rounded-xl px-3 py-2 text-[13px]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[18px] py-[14px] text-[14px] font-bold text-[#160F26] shadow-[0_6px_20px_rgba(255,107,53,.3)] disabled:opacity-60"
        style={{ background: "linear-gradient(90deg,#FF6B35,#FFC24B)" }}
      >
        {isPending ? "saving…" : "save changes ✦"}
      </button>
    </form>
  );
}
