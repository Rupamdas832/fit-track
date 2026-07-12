"use client";

import { useOptimistic, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { Habit } from "@prisma/client";
import {
  upsertLogAction,
  upsertNoteAction,
  upsertWorkoutSessionAction,
} from "@/server/actions/logs.actions";
import { ROTATION_GROUPS } from "@/components/FocusWidget";

const HABIT_GRADIENTS: [string, string][] = [
  ["#FF8A5C", "#FFC24B"],
  ["#B69CFF", "#8FB8FF"],
  ["#6EE7B7", "#A7F3D0"],
  ["#7DD3FC", "#C4B5FD"],
  ["#FDA4AF", "#FDBA74"],
];

type LogMap = Record<string, boolean | null>;

interface TodayClientProps {
  habits: Habit[];
  initialLogs: LogMap;
  initialNote: string;
  initialBodyParts: string[];
  selectedDate: string;
  today: string;
  workoutHabitId: string | null;
  suggestedGroupIndex: number;
}

export function TodayClient({
  habits,
  initialLogs,
  initialNote,
  initialBodyParts,
  selectedDate,
  today,
  workoutHabitId,
  suggestedGroupIndex,
}: TodayClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [note, setNote] = useState(initialNote);
  const [selectedParts, setSelectedParts] = useState<string[]>(() => {
    if (initialBodyParts.length) return initialBodyParts;
    return ROTATION_GROUPS[suggestedGroupIndex]?.parts.slice() ?? [];
  });
  const [saving, setSaving] = useState(false);

  const [optimisticLogs, addOptimistic] = useOptimistic(
    initialLogs,
    (state: LogMap, update: { habitId: string; value: boolean | null }) => ({
      ...state,
      [update.habitId]: update.value,
    })
  );

  const workoutDone = workoutHabitId ? (optimisticLogs[workoutHabitId] ?? null) === true : false;

  function cycleLog(habitId: string) {
    const cur = optimisticLogs[habitId] ?? null;
    const next = cur === null ? true : cur === true ? false : null;
    startTransition(async () => {
      addOptimistic({ habitId, value: next });
      await upsertLogAction(habitId, selectedDate, next);
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await upsertNoteAction(selectedDate, note);
      if (workoutDone && workoutHabitId && selectedParts.length) {
        await upsertWorkoutSessionAction(selectedDate, selectedParts);
      }
      const movedToday = habits
        .filter((h) => h.isMovement)
        .some((h) => (optimisticLogs[h.id] ?? null) === true);
      showToast(movedToday ? "day saved · movement logged 🔥" : "day saved ✓");
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1900);
  }

  return (
    <>
      {/* Habit tiles */}
      <div className="mb-4 flex flex-col gap-[10px]">
        {habits.map((habit) => {
          const value = optimisticLogs[habit.id] ?? null;
          const [hA, hB] =
            HABIT_GRADIENTS[habit.sortOrder % HABIT_GRADIENTS.length] ?? HABIT_GRADIENTS[0]!;

          return (
            <button
              key={habit.id}
              onClick={() => cycleLog(habit.id)}
              aria-pressed={value === true}
              className={`flex w-full items-center gap-[14px] rounded-[26px] border-[1.5px] px-4 py-4 text-left transition-all duration-200 active:scale-[.965] ${
                value === true
                  ? "border-transparent text-[#160F26]"
                  : value === false
                    ? "border-rose/50 bg-card"
                    : "border-line bg-card"
              }`}
              style={
                value === true ? { background: `linear-gradient(135deg,${hA},${hB})` } : undefined
              }
            >
              <span
                className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[16px] text-[26px] transition-colors"
                style={{
                  background: value === true ? "rgba(255,255,255,.28)" : "rgba(255,255,255,.05)",
                }}
              >
                {habit.emoji}
              </span>
              <div className="flex-1">
                <b className="block text-[16px]">{habit.name}</b>
                <small
                  className={`text-[12px] ${value === true ? "text-[rgba(22,15,38,.65)]" : "text-muted"}`}
                >
                  {habit.category}
                </small>
              </div>
              <span
                className={`rounded-full px-[11px] py-[6px] text-[11px] font-bold tracking-[.06em] uppercase transition-all ${
                  value === true
                    ? "bg-[rgba(22,15,38,.18)] text-[#160F26]"
                    : value === false
                      ? "bg-rose/14 text-rose"
                      : "text-muted bg-white/[.06]"
                }`}
              >
                {value === true ? "done ✓" : value === false ? "not today" : "log it"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body-part picker — visible when Workout = done */}
      {workoutHabitId && workoutDone && (
        <div className="border-line bg-card mb-4 flex flex-wrap gap-2 rounded-[20px] border border-dashed p-[13px] pb-[15px]">
          <span className="text-muted w-full text-[10.5px] font-bold tracking-[.12em] uppercase">
            what did you hit? (suggestion pre-selected)
          </span>
          {ROTATION_GROUPS.map(({ label, parts }) => {
            const isSelected = parts.some((p) => selectedParts.includes(p));
            return (
              <button
                key={label}
                type="button"
                onClick={() => setSelectedParts(parts.slice())}
                className={`rounded-full border px-[13px] py-2 text-[12.5px] font-bold transition-all ${
                  isSelected
                    ? "border-transparent text-[#160F26]"
                    : "border-line bg-card-2 text-muted"
                }`}
                style={
                  isSelected ? { background: "linear-gradient(90deg,#FF6B35,#FFC24B)" } : undefined
                }
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedParts(["other"])}
            className={`rounded-full border px-[13px] py-2 text-[12.5px] font-bold transition-all ${
              selectedParts.includes("other")
                ? "border-transparent text-[#160F26]"
                : "border-line bg-card-2 text-muted"
            }`}
            style={
              selectedParts.includes("other")
                ? { background: "linear-gradient(90deg,#FF6B35,#FFC24B)" }
                : undefined
            }
          >
            Other
          </button>
        </div>
      )}

      <p className="text-muted mb-3 text-center text-[12px]">
        tap once = done · tap again = not today · tap again = clear
      </p>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="one-line note (optional) — 'shoulder press PR 30kg'"
        maxLength={280}
        className="border-line bg-card text-surface focus:border-lav mb-3 w-full rounded-[16px] border px-[14px] py-[13px] text-[14px] placeholder:text-[#6d6390] focus:outline-none"
      />

      <div className="mb-4">
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => e.target.value && router.push(`/today?date=${e.target.value}`)}
          className="border-line bg-card text-surface focus:border-lav w-full rounded-[16px] border px-[14px] py-[13px] text-[14px] [color-scheme:dark] focus:outline-none"
          aria-label="Log date"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="font-display w-full rounded-[20px] py-[17px] text-[14px] font-bold text-[#160F26] shadow-[0_8px_28px_rgba(255,107,53,.35)] transition-transform active:scale-[.98] disabled:opacity-60"
        style={{ background: "linear-gradient(90deg,#FF6B35,#FFC24B)" }}
      >
        {saving ? "saving…" : "save today ✦"}
      </button>

      {/* Toast */}
      {toast && (
        <div
          className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-[11px] text-[13.5px] font-bold text-[#0B1E15] shadow-lg"
          style={{ background: "#6EE7B7" }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
