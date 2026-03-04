"use client";

import { useState, useMemo } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap } from "@/data/schedule";
import { extractCriticalDates, getWeekHeat } from "@/lib/extraction";
import { formatHrDate } from "@/lib/date-utils";
import type { CurriculumEntry, CriticalDate } from "@/data/types";

const TOTAL_WEEKS = 15;

const TYPE_LABEL: Record<CriticalDate["type"], string> = {
  kolokvij: "Kolokvij",
  obrana: "Obrana",
  kviz: "Kviz",
  ispit: "Ispit",
};

export function SemesterTimeline({ currentWeek }: { currentWeek: number }) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const { weekHeat, weekEvents } = useMemo(() => {
    const dates = extractCriticalDates(curriculum as Record<string, CurriculumEntry>);
    const heat = getWeekHeat(dates);
    const events = new Map<number, CriticalDate[]>();
    for (const d of dates) {
      if (!events.has(d.week)) events.set(d.week, []);
      events.get(d.week)!.push(d);
    }
    return { weekHeat: heat, weekEvents: events };
  }, []);

  const handleWeekTap = (week: number) => {
    setSelectedWeek(selectedWeek === week ? null : week);
  };

  const selected = selectedWeek !== null ? weekEvents.get(selectedWeek) ?? [] : [];

  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Week strip */}
      <div
        style={{
          display: "flex",
          width: "100%",
          background: "color-mix(in srgb, var(--muted) 50%, var(--background))",
          height: "40px",
        }}
      >
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
          const week = i + 1;
          const isCurrent = week === currentWeek;
          const isPast = week < currentWeek;
          const isSelected = week === selectedWeek;
          const heat = weekHeat.get(week) ?? 0;

          const dotColor =
            heat >= 2 ? "var(--u-critical)"
            : heat === 1 ? "var(--u-approaching)"
            : "transparent";

          return (
            <button
              key={week}
              onClick={() => handleWeekTap(week)}
              style={{
                flex: isCurrent ? 1.5 : 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                background: isSelected
                  ? "var(--card)"
                  : isCurrent
                  ? "var(--m-tint-strong)"
                  : "transparent",
                opacity: isPast && !isSelected ? 0.4 : 1,
                border: "none",
                cursor: "pointer",
                padding: 0,
                borderBottom: isSelected ? "2px solid var(--foreground)" : "2px solid transparent",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: isCurrent || isSelected ? 700 : 600,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.02em",
                  color: isSelected || isCurrent ? "var(--foreground)" : "var(--muted-fg)",
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
            </button>
          );
        })}
      </div>

      {/* Week detail panel */}
      {selectedWeek !== null && (
        <div className="px-4 py-2.5" style={{ background: "var(--card)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-fg">
              Tjedan {selectedWeek}
              {selectedWeek === currentWeek && (
                <span className="text-m-text ml-1.5 normal-case tracking-normal">(trenutni)</span>
              )}
            </span>
            <button
              onClick={() => setSelectedWeek(null)}
              className="text-[10px] text-muted-fg hover:text-foreground t-fast transition-colors"
            >
              zatvori
            </button>
          </div>
          {selected.length === 0 ? (
            <p className="text-[11px] text-muted-fg py-1">Nema rokova ovaj tjedan.</p>
          ) : (
            <div className="space-y-1">
              {selected.filter(e => e.type !== "ispit").map((event, i) => {
                const subj = subjectMap.get(event.subjectId);
                const urgencyColor =
                  event.urgency === "critical" ? "var(--u-critical)"
                  : event.urgency === "approaching" ? "var(--u-approaching)"
                  : "var(--muted-fg)";
                return (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: urgencyColor }}
                    />
                    <span className="text-foreground font-medium">
                      {subj?.short_name ?? event.subjectId}
                    </span>
                    <span className="text-muted-fg">
                      {TYPE_LABEL[event.type]}
                      {event.date ? ` · ${formatHrDate(event.date)}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
