import { formatDisplayDate } from "@/lib/dates";

export const ROTATION_GROUPS = [
  { label: "Chest + Triceps", parts: ["chest", "triceps"], emoji: "💪" },
  { label: "Back + Biceps", parts: ["back", "biceps"], emoji: "🏋️" },
  { label: "Shoulders + Legs", parts: ["shoulders", "legs"], emoji: "🎯" },
] as const;

export function getNextGroupIndex(lastBodyParts: string[]): number {
  if (!lastBodyParts.length) return 0;

  const idx = ROTATION_GROUPS.findIndex((g) =>
    g.parts.some((p) => lastBodyParts.map((bp) => bp.toLowerCase()).includes(p))
  );

  return idx === -1 ? 0 : (idx + 1) % ROTATION_GROUPS.length;
}

interface FocusWidgetProps {
  lastBodyParts: string[];
  lastWorkoutDate: string | null;
  nextGroupIndex: number;
  workoutDoneToday: boolean;
}

export function FocusWidget({
  lastBodyParts,
  lastWorkoutDate,
  nextGroupIndex,
  workoutDoneToday,
}: FocusWidgetProps) {
  const next = ROTATION_GROUPS[nextGroupIndex] ?? ROTATION_GROUPS[0];
  const lastGroup = lastBodyParts.length
    ? (ROTATION_GROUPS.find((g) =>
        g.parts.some((p) => lastBodyParts.map((bp) => bp.toLowerCase()).includes(p))
      )?.label ?? "other")
    : null;

  return (
    <div className="border-line from-card-2 to-card mb-[14px] flex items-center gap-[14px] rounded-[26px] border bg-gradient-to-br p-4">
      <div
        className="border-line grid h-[52px] w-[52px] flex-none place-items-center rounded-[18px] border text-[26px]"
        style={{
          background: "linear-gradient(135deg,rgba(182,156,255,.25),rgba(125,211,252,.15))",
        }}
      >
        {next.emoji}
      </div>
      <div>
        <span className="text-lav text-[10.5px] font-bold tracking-[.14em] uppercase">
          {workoutDoneToday ? "tomorrow's focus" : "today's focus"}
        </span>
        <b className="block text-[15px]">{next.label}</b>
        <p className="text-muted mt-[3px] text-[12.5px] leading-[1.45]">
          {lastGroup && lastWorkoutDate
            ? `Next in rotation — last session was ${lastGroup.toLowerCase()} on ${formatDisplayDate(lastWorkoutDate)}.`
            : "Start your rotation with this group."}
        </p>
      </div>
    </div>
  );
}
