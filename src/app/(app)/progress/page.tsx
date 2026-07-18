import { requireUser } from "@/server/auth";
import {
  getMovementWeeks,
  getHabitMonthlyRates,
  getWeightTrend,
  getConsistencyCallout,
  getWeightCallout,
} from "@/server/services/stats.service";
import { getMilestones } from "@/server/services/milestones.service";
import { MovementChart } from "@/components/MovementChart";
import { WeightChart } from "@/components/WeightChart";
import { todayFor, formatDisplayDate } from "@/lib/dates";
import { format } from "date-fns";
import type { MilestoneProgress } from "@/server/services/milestones.service";

const BADGE_EMOJI: Record<string, string> = {
  first_step: "🌟",
  the_first_fifty: "🥇",
  century_club: "💯",
  iron_quarter: "🛡️",
  half_year_human: "🏆",
  clean_month: "🥗",
  sleep_architect: "🌙",
  early_bird: "🐦",
};

export default async function ProgressPage() {
  const user = await requireUser();
  const today = todayFor(user.timezone);
  const monthName = format(new Date(today.slice(0, 7) + "-01T12:00:00Z"), "MMMM");

  const [movementWeeks, habitRates, weightData, milestones] = await Promise.all([
    getMovementWeeks(user.id, user.timezone),
    getHabitMonthlyRates(user.id, user.timezone),
    getWeightTrend(user.id),
    getMilestones(user.id, user.timezone),
  ]);

  const callout = getConsistencyCallout(movementWeeks);
  const weightCallout = getWeightCallout(
    weightData,
    (user as unknown as { goal?: string }).goal ?? "MAINTAIN"
  );

  const lastWeighIn = weightData.at(-1)?.date ?? null;
  const daysSinceWeighIn = lastWeighIn
    ? Math.floor(
        (new Date(today + "T12:00:00Z").getTime() -
          new Date(lastWeighIn + "T12:00:00Z").getTime()) /
          86_400_000
      )
    : null;
  const showWeighInNudge = daysSinceWeighIn !== null && daysSinceWeighIn > 7;

  return (
    <>
      <h1 className="font-display mb-1 text-[22px] leading-tight font-bold tracking-tight">
        proof you
        <br />
        showed up.
      </h1>
      <p className="text-muted mb-[18px] text-[14px]">consistency &gt; perfection, always</p>

      {/* ── Movement days per week ── */}
      <div className="border-line bg-card mb-[14px] rounded-[26px] border p-4">
        <h3 className="mb-1 text-[14px] font-bold">movement days per week</h3>
        <p className="text-muted mb-[14px] text-[12px]">last 12 completed weeks · goal line at 4</p>

        {movementWeeks.length === 0 ? (
          <p className="text-muted py-6 text-center text-[13px]">
            No movement days logged yet — your first tap starts the story.
          </p>
        ) : (
          <MovementChart data={movementWeeks} />
        )}

        {callout && (
          <p className="border-mint/25 bg-mint/10 text-mint mt-3 rounded-xl border px-3 py-[9px] text-[12.5px]">
            {callout}
          </p>
        )}
      </div>

      {/* ── This month habit rates ── */}
      <div className="border-line bg-card mb-[14px] rounded-[26px] border p-4">
        <h3 className="mb-1 text-[14px] font-bold">{monthName} habits</h3>
        <p className="text-muted mb-3 text-[12px]">done ÷ logged — absence is not failure</p>

        {habitRates.every((h) => h.logged === 0) ? (
          <p className="text-muted text-[13px]">No logs this month yet.</p>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {habitRates.map((h) => {
              const rate = h.logged > 0 ? h.done / h.logged : 0;
              const pct = Math.round(rate * 100);
              return (
                <div key={h.habitId}>
                  <div className="mb-[5px] flex items-center justify-between">
                    <span className="text-[13px]">
                      {h.emoji} {h.name}
                    </span>
                    <span className="text-muted text-[12px] font-bold">
                      {h.logged > 0 ? `${h.done}/${h.logged} · ${pct}%` : "—"}
                    </span>
                  </div>
                  <div className="h-[5px] overflow-hidden rounded-full bg-[#251E3D]">
                    {h.logged > 0 && (
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg,#FF6B35,#FFC24B)",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Weight trend ── */}
      <div className="border-line bg-card mb-[14px] rounded-[26px] border p-4">
        <h3 className="mb-1 text-[14px] font-bold">weight trend</h3>
        <p className="text-muted mb-[14px] text-[12px]">
          weekly weigh-ins · line = 7-point rolling average
        </p>

        {showWeighInNudge && (
          <p className="border-ice/25 bg-ice/10 text-ice mb-3 rounded-xl border px-3 py-[9px] text-[12.5px]">
            ⚖️ last weigh-in was {daysSinceWeighIn} days ago — head to Profile to log one
          </p>
        )}

        {weightData.length === 0 ? (
          <p className="text-muted py-4 text-center text-[13px]">
            No weigh-ins logged yet — add one from Profile.
          </p>
        ) : weightData.length === 1 ? (
          <p className="text-muted py-4 text-center text-[13px]">
            <span className="text-surface text-[20px] font-bold">{weightData[0]!.weightKg} kg</span>
            <br />
            logged {formatDisplayDate(weightData[0]!.date)} — log one more weigh-in to see a trend
            line.
          </p>
        ) : (
          <>
            <WeightChart data={weightData} />
            {weightCallout && (
              <p className="border-ice/25 bg-ice/10 text-ice mt-3 rounded-xl border px-3 py-[9px] text-[12.5px]">
                {weightCallout}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Milestones ── */}
      <div className="border-line bg-card mb-[14px] rounded-[26px] border p-4">
        <h3 className="mb-1 text-[14px] font-bold">milestones</h3>
        <p className="text-muted mb-3 text-[12px]">real names, real numbers</p>

        <div className="flex flex-col">
          {milestones.map((m, i) => (
            <MilestoneRow key={m.code} m={m} last={i === milestones.length - 1} />
          ))}
        </div>
      </div>
    </>
  );
}

function MilestoneRow({ m, last }: { m: MilestoneProgress; last: boolean }) {
  const earned = !!m.earnedOn;
  const secret = m.isSecret && !earned;
  const emoji = BADGE_EMOJI[m.code] ?? "🏅";
  const pct =
    m.progress !== null && m.target !== null && m.target > 0
      ? Math.min(100, Math.round((m.progress / m.target) * 100))
      : null;

  return (
    <div className={`flex items-center gap-3 py-[11px] ${last ? "" : "border-line border-b"}`}>
      {/* Badge icon */}
      <div
        className="grid h-[42px] w-[42px] flex-none place-items-center rounded-[14px] text-[22px]"
        style={
          earned
            ? { background: "linear-gradient(135deg,#FF6B35,#FFC24B)" }
            : { background: "#251E3D" }
        }
      >
        {secret ? "❓" : emoji}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <b className="block text-[14px]">{secret ? "???" : m.name}</b>
        <small className="text-muted text-[11.5px]">
          {secret ? "secret badge — keep going" : m.description}
          {!earned && pct !== null && ` · ${m.progress}/${m.target}`}
        </small>

        {/* Progress bar — only for unearned badges with known progress */}
        {!earned && pct !== null && (
          <div className="mt-[6px] h-[5px] overflow-hidden rounded-full bg-[#251E3D]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg,#B69CFF,#7DD3FC)",
              }}
            />
          </div>
        )}
      </div>

      {/* Earned date */}
      {earned && m.earnedOn && (
        <span className="text-muted flex-none text-[10px]">
          {format(new Date(m.earnedOn + "T12:00:00Z"), "MMM d")}
        </span>
      )}
    </div>
  );
}
