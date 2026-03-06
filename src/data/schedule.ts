import scheduleData from "@/data/schedule-data.json";
import type { ScheduleData, Slot } from "@/data/types";
import { SEMESTER_START, getCurrentWeek } from "@/lib/date-utils";

export const data = scheduleData as unknown as ScheduleData;
export const subjectMap = new Map(data.subjects.map((s) => [s.id, s]));

/**
 * Returns the ISO date string (YYYY-MM-DD) for a given dayIdx (0=Mon..4=Fri)
 * in the specified teaching week (defaults to current week).
 */
export function getDateForDayIdx(dayIdx: number, week?: number): string {
  const w = week ?? getCurrentWeek();
  const start = new Date(SEMESTER_START);
  const d = new Date(start.getTime() + ((w - 1) * 7 + dayIdx) * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the schedule slots for a given dayIdx, checking date_overrides first.
 */
export function getSlotsForDayIdx(dayIdx: number, week?: number): Slot[] {
  const dateStr = getDateForDayIdx(dayIdx, week);
  const override = data.date_overrides?.[dateStr];
  if (override) return override.slots;
  const dayName = data.days_order[dayIdx];
  return data.personal_schedule[dayName] ?? [];
}

/**
 * Returns the override note for the given dayIdx in the specified week, if any.
 */
export function getOverrideNote(dayIdx: number, week?: number): string | null {
  const dateStr = getDateForDayIdx(dayIdx, week);
  return data.date_overrides?.[dateStr]?.note ?? null;
}
