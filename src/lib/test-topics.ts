/**
 * test-topics.ts — Compute which topics a test covers.
 * Pure module, no React.
 */

import type { CurriculumEntry, CriticalDate } from "@/data/types";

const HOLIDAY_RE = /\b(uskrsni\s+praznici?|praznik)\b/i;

export interface TestTopicItem {
  week: number;
  lecture: string;
  exercise: string;
  isHoliday: boolean;
}

/**
 * Given a curriculum and a test event, returns all weekly topics
 * that the test covers (weeks before the test week).
 *
 * For a 2nd kolokvij, starts from the week after the 1st kolokvij.
 * Skips holiday weeks in the returned list (marked isHoliday).
 */
export function getTestTopics(
  curr: CurriculumEntry,
  testEvent: CriticalDate,
  allEvents: CriticalDate[]
): TestTopicItem[] {
  const testWeek = testEvent.week;
  let startWeek = 1;

  // For 2nd kolokvij: find the 1st kolokvij for the same subject
  if (testEvent.type === "kolokvij") {
    const sameSubjectKolokviji = allEvents
      .filter(e => e.subjectId === testEvent.subjectId && e.type === "kolokvij")
      .sort((a, b) => a.week - b.week);

    if (sameSubjectKolokviji.length >= 2) {
      const idx = sameSubjectKolokviji.findIndex(e => e.week === testWeek);
      if (idx > 0) {
        startWeek = sameSubjectKolokviji[idx - 1].week;
      }
    }
  }

  // For kontrolna zadaća 2: start from after kontrolna 1
  if (testEvent.type === "kontrolna") {
    const sameSubjectKontrolne = allEvents
      .filter(e => e.subjectId === testEvent.subjectId && e.type === "kontrolna")
      .sort((a, b) => a.week - b.week);

    if (sameSubjectKontrolne.length >= 2) {
      const idx = sameSubjectKontrolne.findIndex(e => e.week === testWeek);
      if (idx > 0) {
        startWeek = sameSubjectKontrolne[idx - 1].week;
      }
    }
  }

  const items: TestTopicItem[] = [];
  for (const w of curr.weeks) {
    if (w.week < startWeek || w.week >= testWeek) continue;
    const isHoliday = HOLIDAY_RE.test(w.lecture) || HOLIDAY_RE.test(w.exercise);
    items.push({
      week: w.week,
      lecture: w.lecture,
      exercise: w.exercise,
      isHoliday,
    });
  }

  return items;
}

/**
 * Count total checkable items (non-holiday weeks × 2: lecture + exercise).
 */
export function countCheckableItems(topics: TestTopicItem[]): number {
  return topics.filter(t => !t.isHoliday).length * 2;
}
