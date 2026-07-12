const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface WeekDay {
  date: string;
  hasFire: boolean;
  hasLog: boolean;
  isToday: boolean;
}

export function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <div className="mb-[18px] grid grid-cols-7 gap-[6px]">
      {days.map((day, i) => {
        const dayNum = parseInt(day.date.slice(8), 10);
        let fireIcon = "";
        if (day.hasFire) fireIcon = "🔥";
        else if (day.hasLog) fireIcon = "·";
        else if (day.isToday) fireIcon = "❔";

        return (
          <div
            key={day.date}
            className={`flex flex-col items-center rounded-[14px] border py-2 ${
              day.isToday ? "border-flame-a shadow-[0_0_0_1px_#FF6B35_inset]" : "border-line"
            } bg-card`}
          >
            <em className="text-muted mb-1 block text-[10px] tracking-[.08em] not-italic">
              {DAY_LABELS[i]}
            </em>
            <b className="text-[15px]">{dayNum}</b>
            <span className="mt-[2px] h-[18px] text-[14px] leading-none">{fireIcon}</span>
          </div>
        );
      })}
    </div>
  );
}
