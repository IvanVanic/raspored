/**
 * schedule-utils.ts — Schedule query helpers.
 * Pure module: no React, no side effects.
 */

import { data } from "@/data/schedule";
import type { Slot } from "@/data/types";

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export interface NextSlotResult {
  slot: Slot;
  dayName: string;
  minutesUntil: number;
}

/**
 * Returns the next upcoming class slot, scanning from today (or tomorrow if
 * today's classes are all done) through Friday.
 *
 * @param currentMinutes - current time as minutes since midnight (e.g. 13*60+45)
 */
export function getNextSlot(currentMinutes: number): NextSlotResult | null {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon…6=Sat
  const isWeekend = jsDay === 0 || jsDay === 6;

  // Build ordered scan list: today first (if weekday), then remaining weekdays
  const startIdx = isWeekend ? 0 : jsDay - 1; // 0=Mon … 4=Fri
  const daysOrder = data.days_order; // ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"]

  for (let offset = 0; offset < 5; offset++) {
    const dayIdx = (startIdx + offset) % 5;
    const dayName = daysOrder[dayIdx];
    const slots = data.personal_schedule[dayName] ?? [];

    for (const slot of slots) {
      const start = parseTime(slot.start);
      const end = parseTime(slot.end);
      const daysAhead = offset; // 0 = today, 1 = tomorrow, etc.

      if (daysAhead === 0) {
        // Today: only show if not yet ended
        if (currentMinutes < end) {
          return {
            slot,
            dayName,
            minutesUntil: Math.max(0, start - currentMinutes),
          };
        }
      } else {
        // Future day: show first slot of the day
        const minutesUntil = daysAhead * 24 * 60 + start - currentMinutes;
        return { slot, dayName, minutesUntil };
      }
    }
  }

  return null;
}
