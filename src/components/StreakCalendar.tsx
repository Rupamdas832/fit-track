import Link from "next/link";
import { format } from "date-fns";
import type { CalendarDay, CalendarWeek } from "@/server/services/streaks.service";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

interface StreakCalendarProps {
  year: number;
  month: number;
  weeks: CalendarWeek[];
  prevHref: string;
  nextHref: string | null; // null = already at current month
}

export function StreakCalendar({ year, month, weeks, prevHref, nextHref }: StreakCalendarProps) {
  const monthName = format(new Date(year, month - 1, 1), "MMMM yyyy");

  return (
    <div className="border-line bg-card rounded-[26px] border p-4">
      {/* Month header with prev / next navigation */}
      <div className="mb-[14px] flex items-center justify-between">
        <Link
          href={prevHref}
          className="border-line text-muted hover:border-lav hover:text-surface grid h-8 w-8 place-items-center rounded-full border text-[16px] transition-colors"
        >
          ‹
        </Link>
        <div className="text-center">
          <span className="font-display text-[14px] font-bold">{monthName}</span>
          <span className="text-muted ml-2 text-[11px] font-normal">week verdict →</span>
        </div>
        {nextHref ? (
          <Link
            href={nextHref}
            className="border-line text-muted hover:border-lav hover:text-surface grid h-8 w-8 place-items-center rounded-full border text-[16px] transition-colors"
          >
            ›
          </Link>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      {/* Day-of-week label row */}
      <div className="mb-[6px] grid grid-cols-[repeat(7,minmax(0,1fr))_30px] gap-[6px]">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-muted text-center text-[9.5px] tracking-[.08em]">
            {label}
          </div>
        ))}
        <div className="text-muted text-center text-[9px] tracking-[.04em]" />
      </div>

      {/* Week rows */}
      <div className="flex flex-col gap-[6px]">
        {weeks.map((week) => (
          <div
            key={week.weekStart}
            className="grid grid-cols-[repeat(7,minmax(0,1fr))_30px] gap-[6px]"
          >
            {week.days.map((day) => (
              <DayCell key={day.date} day={day} />
            ))}

            {/* Verdict column */}
            <div className="grid place-items-center text-[14px]">
              {week.verdict === "passed" ? (
                "🔥"
              ) : week.verdict === "failed" ? (
                <span className="text-rose text-[12px] font-bold">✖</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-[14px]">
        <span className="text-muted flex items-center gap-[6px] text-[11px]">
          <i
            className="inline-block h-[11px] w-[11px] flex-none rounded-[4px] not-italic"
            style={{ background: "linear-gradient(135deg,#FF6B35,#FFC24B)" }}
          />
          moved
        </span>
        <span className="text-muted flex items-center gap-[6px] text-[11px]">
          <i className="inline-block h-[11px] w-[11px] flex-none rounded-[4px] bg-[#2E2650] not-italic" />
          logged
        </span>
        <span className="text-muted text-[11px]">🔥 week passed</span>
        <span className="text-muted text-[11px]">✖ week failed</span>
      </div>
    </div>
  );
}

function DayCell({ day }: { day: CalendarDay }) {
  const dayNum = parseInt(day.date.slice(8), 10);

  // Dim: padding cells (not in month), future days, or pre-history days.
  // isToday is never future/padding/pre-history, so no need to exclude it here.
  const dim = !day.inMonth || day.isFuture || day.isPreHistory;

  // Background follows prototype: move > log > default (card-2)
  let bgStyle: React.CSSProperties;
  let textClass: string;

  if (day.hasMovementDone && !day.isFuture) {
    bgStyle = { background: "linear-gradient(135deg,rgba(255,107,53,.85),rgba(255,194,75,.85))" };
    textClass = "font-bold text-[#160F26]";
  } else if (day.hasAnyLog && !day.isFuture) {
    bgStyle = { background: "#2E2650" };
    textClass = "text-surface";
  } else {
    bgStyle = { background: "#251E3D" }; // card-2
    textClass = "text-muted";
  }

  // Today outline: 2px solid flame-b (#FFC24B), matching the prototype exactly
  const todayStyle: React.CSSProperties = day.isToday
    ? { outline: "2px solid #FFC24B", outlineOffset: "1px" }
    : {};

  return (
    <div
      className={`grid aspect-square place-items-center rounded-[11px] text-[11.5px] transition-opacity ${textClass} ${dim ? "opacity-25" : ""}`}
      style={{ ...bgStyle, ...todayStyle }}
    >
      {dayNum}
    </div>
  );
}
