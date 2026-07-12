import { requireUser } from "@/server/auth";
import { currentStreakView, getCalendarMonth } from "@/server/services/streaks.service";
import { todayFor } from "@/lib/dates";
import { StreakCalendar } from "@/components/StreakCalendar";

export default async function StreaksPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const user = await requireUser();
  const today = todayFor(user.timezone);
  const currentYear = parseInt(today.slice(0, 4), 10);
  const currentMonth = parseInt(today.slice(5, 7), 10);

  // Parse year/month from URL; fall back to current month
  const { year: rawYear, month: rawMonth } = await searchParams;
  let year = rawYear ? parseInt(rawYear, 10) : currentYear;
  let month = rawMonth ? parseInt(rawMonth, 10) : currentMonth;

  // Clamp to valid calendar values; never allow a future month
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    year = currentYear;
    month = currentMonth;
  }
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    year = currentYear;
    month = currentMonth;
  }

  const [streak, { weeks, canGoForward }] = await Promise.all([
    currentStreakView(user.id, user.timezone),
    getCalendarMonth(user.id, user.timezone, year, month),
  ]);

  // Prev / next month hrefs
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  const heroCards = [
    {
      key: "current",
      label: "current streak\n4+ movement days/wk",
      value: streak.current,
      gradient: "from-flame-a to-flame-b",
    },
    {
      key: "longest",
      label:
        streak.current === streak.longest && streak.current > 0
          ? "longest ever\nthis is it. right now."
          : "longest ever",
      value: streak.longest,
      gradient: "from-lav to-ice",
    },
  ];

  const subtitle = (() => {
    if (streak.current === 0 && streak.longest > 0) {
      const n = streak.longest;
      return `${n} ${n === 1 ? "week" : "weeks"} was your best yet — week 1 starts Monday.`;
    }
    if (streak.movementDaysThisWeek > 0) {
      return `${streak.movementDaysThisWeek} of 4 movement days logged this week.`;
    }
    return "Log 4+ movement days Mon–Sun to earn a streak week.";
  })();

  return (
    <>
      <h1 className="font-display mb-1 text-[22px] leading-tight font-bold tracking-tight">
        streaks
      </h1>
      <p className="text-muted mb-[18px] text-[14px]">{subtitle}</p>

      {/* Hero numbers */}
      <div className="mb-[18px] flex gap-3">
        {heroCards.map(({ key, label, value, gradient }) => (
          <div
            key={key}
            className="border-line bg-card flex flex-1 flex-col items-center rounded-[26px] border px-[10px] py-[18px] text-center"
          >
            <span
              className={`bg-gradient-to-r ${gradient} font-display bg-clip-text text-[44px] leading-none font-black text-transparent`}
            >
              {value}
            </span>
            <p className="text-muted mt-2 text-[12px] leading-[1.4] whitespace-pre-line">{label}</p>
          </div>
        ))}
      </div>

      <StreakCalendar
        year={year}
        month={month}
        weeks={weeks}
        prevHref={`/streaks?year=${prevYear}&month=${prevMonth}`}
        nextHref={canGoForward ? `/streaks?year=${nextYear}&month=${nextMonth}` : null}
      />
    </>
  );
}
