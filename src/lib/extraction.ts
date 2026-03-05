/**
 * extraction.ts — Regex-driven extraction of critical academic dates
 * from curriculum data. Pure module: no React, no side effects.
 */

import type { CurriculumEntry, CriticalDate, UrgencyLevel, EventType } from "@/data/types";
import { parseHrDate, getWeekForDate, daysUntil } from "./date-utils";

// ---------------------------------------------------------------------------
// Internal regex patterns
// ---------------------------------------------------------------------------

/**
 * Captures an inline HR date from a label string.
 * Matches patterns like: "(07.04.2026.)", "obrana: 23.03.2026.", "25.05.2026."
 */
const DATE_INLINE_RE = /(\d{1,2})\.(\d{1,2})\.(\d{4})\.?/;

/**
 * Detects kolokvij mentions (numbered or bare).
 * Matches: "1. kolokvij", "2. kolokvij", "Kolokvij", "kolokvij"
 */
const KOLOKVIJ_RE = /\bkolokvij\b/i;

/**
 * Detects obrana (defense) mentions.
 * Matches: "obrana", "Obrana"
 */
const OBRANA_RE = /\bobrana\b/i;

/**
 * Detects kviz (quiz) mentions.
 */
const KVIZ_RE = /\bkviz\b/i;

/**
 * Detects ispit (exam) mentions.
 */
const ISPIT_RE = /\bispit\b/i;

const LABORATORIJ_RE = /\blaboratorij\b/i;
const PREDAJA_RE = /\bpredaj[ae]\b/i;
const ZADAVANJE_RE = /\bzadavanj[ae]\b/i;
const DOMACA_ZADACA_RE = /\bdomać[ae]\s+zadać[ae]\b/i;
const KONTROLNA_RE = /\bkontroln[ae]\s+zadać[ae]\b/i;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Negative patterns — these mention event keywords but are NOT actual events.
 * e.g. "Ponavljanje i priprema za ispit", "Rješavanje zadataka s prošlih ispita"
 */
const PREP_RE = /\b(priprema\s+za|prošl|ponavljanje|završni\s+pregled)\b/i;

function classifyText(text: string): EventType | null {
  // Skip preparation/review weeks — they mention event keywords but aren't events
  if (PREP_RE.test(text)) return null;
  if (KONTROLNA_RE.test(text)) return "kontrolna";
  if (KOLOKVIJ_RE.test(text)) return "kolokvij";
  if (OBRANA_RE.test(text)) return "obrana";
  if (KVIZ_RE.test(text)) return "kviz";
  if (ISPIT_RE.test(text)) return "ispit";
  if (LABORATORIJ_RE.test(text)) return "laboratorij";
  if (PREDAJA_RE.test(text)) return "predaja";
  if (ZADAVANJE_RE.test(text)) return "zadavanje";
  if (DOMACA_ZADACA_RE.test(text)) return "domaca_zadaca";
  return null;
}

function computeUrgency(date: Date | null): UrgencyLevel {
  if (date === null) return "ambient";
  const days = daysUntil(date);
  if (days < 0) return "ambient"; // already passed
  if (days <= 7) return "critical";
  if (days <= 21) return "approaching";
  return "ambient";
}

function extractDateFromText(text: string): Date | null {
  const match = text.match(DATE_INLINE_RE);
  if (!match) return null;
  return parseHrDate(match[0]);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Scans all weeks' lecture and exercise strings plus the `exams` array
 * for every CurriculumEntry in the provided record.
 *
 * Returns a flat array of CriticalDate objects, sorted by date ascending
 * (undated entries appear at the end, sorted by week).
 */
export function extractCriticalDates(
  curriculum: Record<string, CurriculumEntry>
): CriticalDate[] {
  const results: CriticalDate[] = [];

  for (const [rawSubjectId, entry] of Object.entries(curriculum)) {
    const subjectId = rawSubjectId.toLowerCase();
    // --- Scan week topics (lecture + exercise) ---
    for (const weekTopic of entry.weeks) {
      const sources: Array<{ text: string; source: "lecture" | "exercise" }> = [
        { text: weekTopic.lecture, source: "lecture" },
        { text: weekTopic.exercise, source: "exercise" },
      ];

      // Deduplicate: if both lecture and exercise have the same event type
      // for the same week we emit only one entry (lecture takes priority).
      const seenTypesThisWeek = new Set<EventType>();

      for (const { text } of sources) {
        const type = classifyText(text);
        if (type === null) continue;
        if (seenTypesThisWeek.has(type)) continue;
        seenTypesThisWeek.add(type);

        const date = extractDateFromText(text);
        const week = date ? getWeekForDate(date) : weekTopic.week;
        const urgency = computeUrgency(date);

        results.push({
          subjectId,
          label: text.trim(),
          date,
          week,
          type,
          urgency,
        });
      }
    }

    // --- Scan exams array ---
    for (const examStr of entry.exams) {
      const date = parseHrDate(examStr);
      const week = date ? getWeekForDate(date) : 15;
      const urgency = computeUrgency(date);

      results.push({
        subjectId,
        label: `Ispit: ${examStr}`,
        date,
        week,
        type: "ispit",
        urgency,
      });
    }

    // --- Scan grading notes for dated items not already caught by week topics ---
    const seenDates = new Set(results.filter(r => r.subjectId === subjectId && r.date).map(r => r.date!.getTime()));
    for (const g of entry.grading) {
      if (!g.note) continue;
      const date = extractDateFromText(g.note);
      if (!date || seenDates.has(date.getTime())) continue;
      const type = classifyText(g.component) ?? classifyText(g.note);
      if (!type || type === "ispit") continue; // exams already handled above
      const week = getWeekForDate(date);
      const urgency = computeUrgency(date);
      seenDates.add(date.getTime());
      results.push({ subjectId, label: g.component, date, week, type, urgency });
    }
  }

  // Sort: dated entries by ascending date, undated entries by week at the end
  results.sort((a, b) => {
    if (a.date !== null && b.date !== null) {
      return a.date.getTime() - b.date.getTime();
    }
    if (a.date !== null) return -1;
    if (b.date !== null) return 1;
    return a.week - b.week;
  });

  return results;
}

const URGENCY_RANK: Record<UrgencyLevel, number> = { critical: 2, approaching: 1, ambient: 0 };

/**
 * Returns the highest urgency level per subject.
 * Only considers non-ambient urgencies (no point telling you something is "fine").
 */
export function getSubjectUrgencies(
  curriculum: Record<string, CurriculumEntry>
): Map<string, UrgencyLevel> {
  const dates = extractCriticalDates(curriculum);
  const map = new Map<string, UrgencyLevel>();
  for (const cd of dates) {
    if (cd.urgency === "ambient") continue;
    const current = map.get(cd.subjectId);
    if (!current || URGENCY_RANK[cd.urgency] > URGENCY_RANK[current]) {
      map.set(cd.subjectId, cd.urgency);
    }
  }
  return map;
}

/**
 * Given a flat list of CriticalDates, returns a Map from week number (1–15)
 * to the count of critical events in that week.
 */
export function getWeekHeat(criticalDates: CriticalDate[]): Map<number, number> {
  const heat = new Map<number, number>();

  for (const cd of criticalDates) {
    const current = heat.get(cd.week) ?? 0;
    heat.set(cd.week, current + 1);
  }

  return heat;
}
