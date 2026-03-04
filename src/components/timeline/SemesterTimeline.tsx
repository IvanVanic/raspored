"use client";

import { useState, useMemo } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap } from "@/data/schedule";
import { extractCriticalDates, getWeekHeat } from "@/lib/extraction";
import { formatHrDate } from "@/lib/date-utils";
import { TOTAL_WEEKS } from "@/lib/date-utils";
import { TYPE_LABEL } from "@/lib/labels";
import type { CurriculumEntry, CriticalDate } from "@/data/types";

export function SemesterTimeline({
  currentWeek,
  isOpen,
  onClose,
}: {
  currentWeek: number;
  isOpen: boolean;
  onClose: () => void;
}) {
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

  if (!isOpen) return null;

  const handleWeekTap = (week: number) => {
    setSelectedWeek(selectedWeek === week ? null : week);
  };

  const selected = selectedWeek !== null ? weekEvents.get(selectedWeek) ?? [] : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{ zIndex: 45 }}
      />

      {/* Bottom sheet */}
      <div
        className="modal-content"
        style={{
          zIndex: 46,
          top: "auto",
          left: 0,
          right: 0,
          bottom: 0,
          transform: "none",
          width: "100%",
          maxWidth: "100%",
          maxHeight: "70vh",
          borderRadius: "16px 16px 0 0",
          animation: "sheet-up 300ms cubic-bezier(0.2, 0, 0, 1) both",
          padding: 0,
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-fg/30" />
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-fg">
            Raspored semestra
          </span>
          <button
            onClick={onClose}
            className="text-[11px] text-muted-fg hover:text-foreground t-fast transition-colors"
          >
            zatvori
          </button>
        </div>

        {/* Week strip */}
        <div className="timeline-strip">
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
                className="timeline-week"
                style={{
                  flex: isCurrent ? 1.5 : 1,
                  background: isSelected
                    ? "var(--card)"
                    : isCurrent
                    ? "var(--m-tint-strong)"
                    : "transparent",
                  opacity: isPast && !isSelected ? 0.4 : 1,
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
                  className="urgency-dot"
                  style={{ background: dotColor }}
                />
              </button>
            );
          })}
        </div>

        {/* Week detail panel */}
        <div className="px-4 py-3 overflow-y-auto" style={{ minHeight: 80 }}>
          {selectedWeek === null ? (
            <p className="text-[11px] text-muted-fg text-center py-4">
              Tapnite tjedan za pregled rokova.
            </p>
          ) : selected.filter(e => e.type !== "ispit").length === 0 ? (
            <div>
              <p className="text-[11px] font-semibold text-muted-fg mb-1">
                Tjedan {selectedWeek}
                {selectedWeek === currentWeek && (
                  <span className="text-m-text ml-1.5 normal-case">(trenutni)</span>
                )}
              </p>
              <p className="text-[11px] text-muted-fg py-1">Nema rokova ovaj tjedan.</p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-semibold text-muted-fg mb-2">
                Tjedan {selectedWeek}
                {selectedWeek === currentWeek && (
                  <span className="text-m-text ml-1.5 normal-case">(trenutni)</span>
                )}
              </p>
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
                        className="urgency-dot shrink-0"
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}
