/**
 * date-utils.ts — Pure temporal logic. No React. No side effects.
 * All functions are stateless and safe to call from any context.
 */

export const SEMESTER_START = "2026-03-02" as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const TOTAL_WEEKS = 15;

/** UTC epoch of a local calendar date — DST-safe for day-diff math. */
function localDateUTC(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Parse SEMESTER_START as local midnight (not UTC).
 * `new Date("2026-03-02")` creates UTC midnight which causes off-by-one
 * errors in timezones east of UTC (e.g. CET/CEST).
 */
export function semesterStartLocal(): Date {
  const [y, m, d] = SEMESTER_START.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns the current teaching week (1–15), clamped to the valid range.
 * Week 1 begins on SEMESTER_START (Monday, 2026-03-02).
 */
export function getCurrentWeek(): number {
  const days = Math.floor((localDateUTC(new Date()) - localDateUTC(semesterStartLocal())) / MS_PER_DAY);
  const week = Math.floor(days / 7) + 1;
  return Math.min(Math.max(week, 1), TOTAL_WEEKS);
}

/**
 * Returns which teaching week (1–15) the given date falls in.
 * Dates before SEMESTER_START return 1; dates after week 15 return 15.
 */
export function getWeekForDate(date: Date): number {
  const days = Math.floor((localDateUTC(date) - localDateUTC(semesterStartLocal())) / MS_PER_DAY);
  const week = Math.floor(days / 7) + 1;
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
  return Math.round((localDateUTC(date) - localDateUTC(new Date())) / MS_PER_DAY);
}

/**
 * Returns the Monday and Friday dates for the given teaching week number (1–15).
 * Week 1 starts on SEMESTER_START (which is a Monday).
 */
export function getWeekDates(week: number): { monday: Date; friday: Date } {
  const start = semesterStartLocal();
  const monday = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (week - 1) * 7);
  const friday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4);
  return { monday, friday };
}

/**
 * Returns a short Croatian date string in the format "DD.MM."
 * Example: Date(2026, 2, 9) → "09.03."
 */
export function formatShortDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.`;
}

