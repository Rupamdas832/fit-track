import { requireUser } from "@/server/auth";
import { getActiveHabits } from "@/server/services/habits.service";
import {
  getLogsForDate,
  getDailyNote,
  getWorkoutSession,
  getLastWorkoutSession,
  getWeekStripData,
} from "@/server/services/logs.service";
import { todayFor, isFuture, getDayName, formatDisplayDate } from "@/lib/dates";
import { WeekStrip } from "@/components/WeekStrip";
import { FocusWidget, getNextGroupIndex } from "@/components/FocusWidget";
import { TodayClient } from "@/components/TodayClient";
import { format } from "date-fns";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireUser();
  const today = todayFor(user.timezone);
  const { date: rawDate } = await searchParams;

  const selectedDate = rawDate && !isFuture(rawDate, user.timezone) ? rawDate : today;

  const [habits, logs, note, workoutSession, lastWorkout, weekStrip] = await Promise.all([
    getActiveHabits(user.id),
    getLogsForDate(user.id, selectedDate),
    getDailyNote(user.id, selectedDate),
    getWorkoutSession(user.id, selectedDate),
    getLastWorkoutSession(user.id),
    getWeekStripData(user.id, user.timezone),
  ]);

  // Build log state map: habitId → value | null
  const initialLogs: Record<string, boolean | null> = {};
  habits.forEach((h) => {
    initialLogs[h.id] = null;
  });
  logs.forEach((l) => {
    initialLogs[l.habitId] = l.value;
  });

  const workoutHabit = habits.find((h) => h.name === "Workout") ?? null;
  const lastBodyParts = lastWorkout?.bodyParts ?? [];
  const nextGroupIndex = getNextGroupIndex(lastBodyParts);

  const isEditingPast = selectedDate < today;
  const dayLabel = getDayName(selectedDate);
  const weekNum = parseInt(format(new Date(selectedDate + "T00:00:00"), "w"), 10);

  return (
    <>
      <h1 className="font-display mb-1 text-[22px] leading-tight font-bold tracking-tight">
        {dayLabel}.
        <br />
        {isEditingPast ? "editing past day." : "five taps & you're done."}
      </h1>
      <p className="text-muted mb-[18px] text-[14px]">
        {formatDisplayDate(selectedDate)} · week {weekNum}
        {!isEditingPast && ` · ${weekStrip.movementDaysThisWeek} of 4 movement days in`}
      </p>

      <FocusWidget
        lastBodyParts={lastBodyParts}
        lastWorkoutDate={lastWorkout?.logDate ?? null}
        nextGroupIndex={nextGroupIndex}
      />

      <WeekStrip days={weekStrip.days} />

      <TodayClient
        habits={habits}
        initialLogs={initialLogs}
        initialNote={note?.note ?? ""}
        initialBodyParts={workoutSession?.bodyParts ?? []}
        selectedDate={selectedDate}
        today={today}
        workoutHabitId={workoutHabit?.id ?? null}
        suggestedGroupIndex={nextGroupIndex}
      />
    </>
  );
}
