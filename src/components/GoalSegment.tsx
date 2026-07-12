"use client";

import { useTransition } from "react";
import { updateGoalAction } from "@/server/actions/profile.actions";
import type { Goal } from "@prisma/client";

const GOALS: { value: Goal; label: string }[] = [
  { value: "LOSE", label: "lose" },
  { value: "MAINTAIN", label: "maintain" },
  { value: "GAIN", label: "gain" },
];

export function GoalSegment({ current }: { current: Goal }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="border-line bg-card-2 flex gap-1 rounded-[16px] border p-1">
      {GOALS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => updateGoalAction(value))}
          className={`flex-1 rounded-xl py-[10px] text-[12.5px] font-bold transition-all ${
            current === value ? "text-[#160F26]" : "text-muted bg-transparent"
          }`}
          style={
            current === value ? { background: "linear-gradient(90deg,#FF6B35,#FFC24B)" } : undefined
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
