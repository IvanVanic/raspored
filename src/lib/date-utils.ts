/**
 * date-utils.ts — Pure temporal logic. No React. No side effects.
 * All functions are stateless and safe to call from any context.
 */

export const SEMESTER_START = "2026-03-02" as const;

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TOTAL_WEEKS = 15;

// Croatian day names in schedule order (index 0 = Monday, index 4 = Friday)
const CROATIAN_DAY_NAMES: readonly string[] = [
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
] as const;

/**
 * Returns the current teaching week (1–15), clamped to the valid range.
 * Week 1 begins on SEMESTER_START (Monday, 2026-03-02).
 */
export function getCurrentWeek(): number {
  const start = new Date(SEMESTER_START);
  const now = new Date();
  const elapsed = now.getTime() - start.getTime();
  const week = Math.floor(elapsed / MS_PER_WEEK) + 1;
  return Math.min(Math.max(week, 1), TOTAL_WEEKS);
}

/**
 * Returns which teaching week (1–15) the given date falls in.
 * Dates before SEMESTER_START return 1; dates after week 15 return 15.
 */
export function getWeekForDate(date: Date): number {
  const start = new Date(SEMESTER_START);
  const elapsed = date.getTime() - start.getTime();
  const week = Math.floor(elapsed / MS_PER_WEEK) + 1;
  return Math.min(Math.max(week, 1), TOTAL_WEEKS);
}

/**
 * Parses a Croatian date string in the format "DD.MM.YYYY." (trailing dot optional).
 * Returns a Date set to midnight local time, or null if the string is not parseable.
 *
 * Examples:
 *   "07.04.2026."  → Date(2026, 3, 7)
 *   "23.03.2026"   → Date(2026, 2, 23)
 */
export function parseHrDate(str: string): Date | null {
  // Match DD.MM.YYYY with an optional trailing dot
  const match = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\.?/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
  const year = parseInt(match[3], 10);

  if (
    month < 0 ||
    month > 11 ||
    day < 1 ||
    day > 31 ||
    year < 2000 ||
    year > 2100
  ) {
    return null;
  }

  const date = new Date(year, month, day);
  // Verify the date didn't roll over (e.g., 31 Feb → 3 Mar)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Formats a Date back to Croatian format "DD.MM.YYYY."
 *
 * Example: Date(2026, 3, 7) → "07.04.2026."
 */
export function formatHrDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}.`;
}

/**
 * Returns the number of whole days from now (midnight local) until the target date.
 * Positive = future, negative = past, 0 = today.
 */
export function daysUntil(date: Date): number {
  const now = new Date();
  // Normalize both to midnight local time for a clean day comparison
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / MS_PER_DAY);
}

/**
 * Returns true if the given Croatian day name (e.g. "Ponedjeljak") matches today.
 * Uses the days_order convention: index 0 (Monday) → JS getDay() 1.
 */
export function isToday(dayName: string): boolean {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon … 6=Sat
  const scheduleIndex = CROATIAN_DAY_NAMES.indexOf(dayName);
  if (scheduleIndex === -1) return false;
  // scheduleIndex 0 = Monday = jsDay 1 … scheduleIndex 4 = Friday = jsDay 5
  return jsDay === scheduleIndex + 1;
}

/**
 * Returns true if the given Croatian day name matches tomorrow.
 */
export function isTomorrow(dayName: string): boolean {
  const jsDay = new Date().getDay();
  const scheduleIndex = CROATIAN_DAY_NAMES.indexOf(dayName);
  if (scheduleIndex === -1) return false;
  const tomorrowJsDay = (jsDay + 1) % 7;
  return tomorrowJsDay === scheduleIndex + 1;
}
