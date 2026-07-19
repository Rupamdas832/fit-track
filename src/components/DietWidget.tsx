import { getCurrentMealIndex, type DietDay } from "@/lib/diet-plan";

interface DietWidgetProps {
  dayLabel: string;
  day: DietDay;
  nowMinutes: number;
}

export function DietWidget({ dayLabel, day, nowMinutes }: DietWidgetProps) {
  const { index, status } = getCurrentMealIndex(day.meals, nowMinutes);
  const meal = day.meals[index]!;

  return (
    <div className="border-line from-card-2 to-card mb-[14px] rounded-[26px] border bg-gradient-to-br p-4">
      <div className="flex items-center gap-[14px]">
        <div
          className="border-line grid h-[52px] w-[52px] flex-none place-items-center rounded-[18px] border text-[26px]"
          style={{
            background: "linear-gradient(135deg,rgba(110,231,183,.25),rgba(125,211,252,.15))",
          }}
        >
          🍽️
        </div>
        <div>
          <span className="text-mint text-[10.5px] font-bold tracking-[.14em] uppercase">
            {status === "now" ? "eat now" : "up next"} · {meal.time}
          </span>
          <b className="block text-[15px]">{meal.meal}</b>
          <p className="text-muted mt-[3px] text-[12.5px] leading-[1.45]">{meal.primary}</p>
        </div>
      </div>

      <details className="mt-3">
        <summary className="text-muted cursor-pointer text-[10.5px] font-bold tracking-[.1em] uppercase">
          {dayLabel}&apos;s full plan — {day.focus}
        </summary>
        <ul className="mt-2 flex flex-col gap-[6px]">
          {day.meals.map((m, i) => (
            <li
              key={m.time}
              className={`rounded-[14px] border px-3 py-2 text-[12px] ${
                i === index ? "border-mint/40 bg-mint/10" : "border-line bg-card"
              }`}
            >
              <div className="flex items-baseline justify-between font-bold">
                <span>{m.meal}</span>
                <span className="text-muted font-normal">{m.time}</span>
              </div>
              <p className="text-muted mt-1">{m.primary}</p>
              <p className="text-muted/70 mt-1 text-[11px]">swap: {m.alt}</p>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
