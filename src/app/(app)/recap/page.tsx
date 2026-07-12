import { requireUser } from "@/server/auth";
import { getLastWeekRecap } from "@/server/services/recap.service";
import { getHabitMonthlyRates } from "@/server/services/stats.service";
import { RecapPoster } from "@/components/RecapPoster";
import { todayFor } from "@/lib/dates";
import { format } from "date-fns";

export default async function RecapPage() {
  const user = await requireUser();
  const today = todayFor(user.timezone);
  const monthName = format(new Date(today.slice(0, 7) + "-01T12:00:00Z"), "MMMM");

  const [recap, habitRates] = await Promise.all([
    getLastWeekRecap(user.id, user.timezone),
    getHabitMonthlyRates(user.id, user.timezone),
  ]);

  const weekLabel = recap ? `week ${recap.weekNumber}` : "weekly";

  return (
    <>
      <h1 className="font-display mb-1 text-[22px] leading-tight font-bold tracking-tight">
        {weekLabel}
        <br />
        recap
      </h1>
      <p className="text-muted mb-[18px] text-[14px]">
        auto-made every sunday night · tap share, flex a little
      </p>

      {recap ? (
        <RecapPoster recap={recap} />
      ) : (
        <div className="border-line bg-card mb-[14px] rounded-[26px] border px-5 py-8 text-center">
          <p className="text-[28px]">🌱</p>
          <p className="mt-2 text-[14px] font-semibold">no recap yet</p>
          <p className="text-muted mt-1 text-[13px]">
            log your first full Mon – Sun week and your poster will appear here.
          </p>
        </div>
      )}

      {/* Month so far */}
      <div className="border-line bg-card mt-[22px] rounded-[26px] border p-4">
        <h3 className="mb-1 text-[14px] font-bold">{monthName} so far</h3>
        <p className="text-muted mb-3 text-[12px]">done ÷ logged — absence is not failure</p>

        {habitRates.every((h) => h.logged === 0) ? (
          <p className="text-muted text-[13px]">No logs this month yet.</p>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {habitRates.map((h) => {
              const pct = h.logged > 0 ? Math.round((h.done / h.logged) * 100) : 0;
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
    </>
  );
}
