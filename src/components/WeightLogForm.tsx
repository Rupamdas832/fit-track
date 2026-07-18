"use client";

import { useActionState } from "react";
import { logWeightAction } from "@/server/actions/body-metrics.actions";

export function WeightLogForm({ today }: { today: string }) {
  const [error, action, isPending] = useActionState(logWeightAction, null);

  return (
    <form action={action} className="mt-3 space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-muted mb-1 block text-[11px]">date</label>
          <input
            type="date"
            name="metricDate"
            defaultValue={today}
            max={today}
            className="border-line bg-card text-surface focus:border-lav w-full rounded-[14px] border px-3 py-[10px] text-[13px] [color-scheme:dark] focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-muted mb-1 block text-[11px]">weight (kg)</label>
          <input
            type="number"
            name="weightKg"
            step="0.1"
            min="1"
            required
            placeholder="72.5"
            className="border-line bg-card text-surface placeholder:text-muted/50 focus:border-lav w-full rounded-[14px] border px-3 py-[10px] text-[13px] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[14px] px-4 py-[11px] text-[13px] font-bold text-[#160F26] disabled:opacity-60"
          style={{ background: "linear-gradient(90deg,#FF6B35,#FFC24B)" }}
        >
          {isPending ? "…" : "log"}
        </button>
      </div>

      {error && <p className="bg-rose/10 text-rose rounded-xl px-3 py-2 text-[12px]">{error}</p>}
    </form>
  );
}
