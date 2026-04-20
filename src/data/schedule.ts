import scheduleData from "@/data/schedule-data.json";
import type { ScheduleData, Slot } from "@/data/types";
import { semesterStartLocal, getCurrentWeek } from "@/lib/date-utils";

export const data = scheduleData as unknown as ScheduleData;
export const subjectMap = new Map(data.subjects.map((s) => [s.id, s]));

/**
 * Returns the ISO date string (YYYY-MM-DD) for a given dayIdx (0=Mon..4=Fri)
 * in the specified teaching week (defaults to current week).
 */
export function getDateForDayIdx(dayIdx: number, week?: number): string {
  const w = week ?? getCurrentWeek();
  const start = semesterStartLocal();
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (w - 1) * 7 + dayIdx);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns the schedule slots for a given dayIdx, checking date_overrides first.
 * Merges `online: true` from online_sessions when applicable.
 */
export function getSlotsForDayIdx(dayIdx: number, week?: number): Slot[] {
  const dateStr = getDateForDayIdx(dayIdx, week);
  const override = data.date_overrides?.[dateStr];
  const base = override
    ? override.slots
    : data.personal_schedule[data.days_order[dayIdx]] ?? [];

  const onlineMap = data.online_sessions?.[dateStr];
  if (!onlineMap) return base;

  return base.map((slot) => {
    const types = onlineMap[slot.subject_id];
    return types?.includes(slot.type) ? { ...slot, online: true } : slot;
  });
}

/**
 * Returns the override note for the given dayIdx in the specified week, if any.
 */
export function getOverrideNote(dayIdx: number, week?: number): string | null {
  const dateStr = getDateForDayIdx(dayIdx, week);
  return data.date_overrides?.[dateStr]?.note ?? null;
}
