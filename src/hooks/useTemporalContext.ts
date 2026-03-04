"use client";

/**
 * useTemporalContext.ts — React hook providing real-time temporal awareness.
 * Updates every minute via setInterval so the UI stays current throughout the day.
 *
 * Imports getCurrentWeek from date-utils (NOT from curriculum.ts).
 */

import { useState, useEffect } from "react";
import type { TemporalContext, SemesterPhase } from "@/data/types";
import { getCurrentWeek } from "@/lib/date-utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_WEEKS = 15;

/** Croatian day names in schedule order. Index matches days_order array. */
const DAYS_ORDER: readonly string[] = [
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
] as const;

// ---------------------------------------------------------------------------
// Pure snapshot builder — called every minute
// ---------------------------------------------------------------------------

function buildContext(): TemporalContext {
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun, 1=Mon … 6=Sat
  const hour = now.getHours();

  // --- Week + progress ---
  const currentWeek = getCurrentWeek();
  const semesterProgress = Math.min((currentWeek - 1) / (TOTAL_WEEKS - 1), 1);

  // --- Semester phase ---
  let semesterPhase: SemesterPhase;
  if (currentWeek <= 3) {
    semesterPhase = "settling";
  } else if (currentWeek <= 12) {
    semesterPhase = "active";
  } else {
    semesterPhase = "endgame";
  }

  // --- Weekend detection ---
  // jsDay 0 = Sunday, 6 = Saturday
  const isWeekend = jsDay === 0 || jsDay === 6;

  // --- Croatian day name (null on weekend) ---
  // scheduleIndex 0 (Monday) corresponds to jsDay 1
  const scheduleIndex = isWeekend ? -1 : jsDay - 1; // 0–4 for Mon–Fri
  const dayName = scheduleIndex >= 0 ? (DAYS_ORDER[scheduleIndex] ?? null) : null;

  // --- Time of day ---
  let timeOfDay: TemporalContext["timeOfDay"];
  if (hour < 12) {
    timeOfDay = "morning";
  } else if (hour < 18) {
    timeOfDay = "afternoon";
  } else {
    timeOfDay = "evening";
  }

  // --- Smart default day ---
  let smartDefaultDay: number;

  if (isWeekend) {
    // Weekend → show Monday (index 0)
    smartDefaultDay = 0;
  } else if (hour < 20) {
    // Weekday before 20:00 → show today (scheduleIndex is 0-4)
    smartDefaultDay = scheduleIndex;
  } else {
    // Weekday after 20:00 → show tomorrow
    if (jsDay === 5) {
      // Friday evening → wrap to Monday
      smartDefaultDay = 0;
    } else {
      // Tomorrow is still a weekday; scheduleIndex + 1, but cap at 4
      const tomorrowScheduleIndex = scheduleIndex + 1;
      smartDefaultDay = Math.min(tomorrowScheduleIndex, DAYS_ORDER.length - 1);
    }
  }

  return {
    currentWeek,
    dayOfWeek: jsDay,
    dayName,
    timeOfDay,
    isWeekend,
    semesterProgress,
    semesterPhase,
    smartDefaultDay,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides a live-updating snapshot of temporal context derived from the
 * current wall clock time. Refreshes every 60 seconds.
 */
export function useTemporalContext(): TemporalContext {
  const [context, setContext] = useState<TemporalContext>(buildContext);

  useEffect(() => {
    // Refresh immediately in case SSR snapshot is stale
    setContext(buildContext());

    const interval = setInterval(() => {
      setContext(buildContext());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return context;
}
