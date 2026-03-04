"use client";

import { useMemo } from "react";
import { curriculum } from "@/data/curriculum";
import { extractCriticalDates, getWeekHeat } from "@/lib/extraction";
import type { CurriculumEntry } from "@/data/types";

const TOTAL_WEEKS = 15;

interface SemesterTimelineProps {
  currentWeek: number;
}

export function SemesterTimeline({ currentWeek }: SemesterTimelineProps) {
  const weekHeat = useMemo(() => {
    const dates = extractCriticalDates(curriculum as Record<string, CurriculumEntry>);
    return getWeekHeat(dates);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--muted) 50%, var(--background))",
        height: "40px",
      }}
    >
      {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
        const week = i + 1;
        const isCurrent = week === currentWeek;
        const isPast = week < currentWeek;
        const heat = weekHeat.get(week) ?? 0;

        const dotColor =
          heat >= 2
            ? "var(--u-critical)"
            : heat === 1
            ? "var(--u-approaching)"
            : "transparent";

        return (
          <div
            key={week}
            style={{
              flex: isCurrent ? 1.5 : 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              background: isCurrent
                ? "var(--m-tint-strong)"
                : isPast
                ? "transparent"
                : "transparent",
              opacity: isPast ? 0.4 : 1,
              position: "relative",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: isCurrent ? 700 : 600,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.02em",
                color: isCurrent
                  ? "var(--foreground)"
                  : isPast
                  ? "var(--muted-fg)"
                  : "var(--muted-fg)",
                lineHeight: 1,
              }}
            >
              {week}
            </span>
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: dotColor,
                flexShrink: 0,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
