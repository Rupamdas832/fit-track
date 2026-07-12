"use client";

import { useActionState, useState } from "react";
import { createHabitAction } from "@/server/actions/habits.actions";

const CATEGORIES = ["movement", "nutrition", "recovery", "mind"] as const;

export function AddHabitForm() {
  const [error, action, isPending] = useActionState(createHabitAction, null);
  const [isMovement, setIsMovement] = useState(false);
  const [category, setCategory] = useState<string>("movement");

  return (
    <form action={action} className="mt-3 space-y-2">
      <div className="flex gap-2">
        <input
          name="emoji"
          defaultValue="✨"
          className="border-line bg-card-2 focus:border-lav w-[56px] rounded-[14px] border px-2 py-[11px] text-center text-[18px] focus:outline-none"
        />
        <input
          name="name"
          placeholder="add a habit…"
          required
          className="border-line bg-card text-surface placeholder:text-muted/50 focus:border-lav flex-1 rounded-[14px] border px-[14px] py-[11px] text-[14px] focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          name="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setIsMovement(e.target.value === "movement");
          }}
          className="border-line bg-card text-surface focus:border-lav flex-1 rounded-[14px] border px-[14px] py-[10px] text-[13px] focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="text-muted flex cursor-pointer items-center gap-2 text-[12px]">
          <input
            type="checkbox"
            name="isMovement"
            value="true"
            checked={isMovement}
            onChange={(e) => setIsMovement(e.target.checked)}
            className="accent-[#FF6B35]"
          />
          counts for streak
        </label>
      </div>

      {error && <p className="bg-rose/10 text-rose rounded-xl px-3 py-2 text-[12px]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[14px] py-[11px] text-[13px] font-bold text-[#160F26] disabled:opacity-60"
        style={{ background: "linear-gradient(90deg,#FF6B35,#FFC24B)" }}
      >
        {isPending ? "adding…" : "add habit"}
      </button>
    </form>
  );
}
