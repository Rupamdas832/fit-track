import { db } from "@/server/db";
import type { DateString } from "@/lib/dates";

export async function upsertBodyMetric(userId: string, metricDate: DateString, weightKg: number) {
  return db.bodyMetric.upsert({
    where: { userId_metricDate: { userId, metricDate } },
    update: { weightKg },
    create: { userId, metricDate, weightKg },
  });
}
