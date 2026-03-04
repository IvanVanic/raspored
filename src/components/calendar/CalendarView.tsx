"use client";

import { useMemo } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap } from "@/data/schedule";
import { extractCriticalDates } from "@/lib/extraction";
import { formatHrDate, daysUntil } from "@/lib/date-utils";
import type { CurriculumEntry, CriticalDate } from "@/data/types";

const TYPE_LABEL: Record<CriticalDate["type"], string> = {
  kolokvij: "Kolokvij",
  obrana: "Obrana",
  kviz: "Kviz",
  ispit: "Ispit",
};

function daysLabel(days: number): string {
  if (days === 0) return "danas";
  if (days === 1) return "sutra";
  if (days < 0) return "prošlo";
  return `za ${days}d`;
}

export function CalendarView() {
  const { upcoming, past } = useMemo(() => {
    const all = extractCriticalDates(curriculum as Record<string, CurriculumEntry>);
    const now: CriticalDate[] = [];
    const old: CriticalDate[] = [];
    for (const d of all) {
      if (d.date && daysUntil(d.date) < 0) {
        old.push(d);
      } else {
        now.push(d);
      }
    }
    return { upcoming: now, past: old };
  }, []);

  return (
    <div className="px-4 pt-3 pb-6">
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
            Nadolazeće
          </h3>
          <div className="space-y-1">
            {upcoming.map((event, i) => (
              <EventRow key={`u-${i}`} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="mt-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
            Prošlo
          </h3>
          <div className="space-y-1 opacity-40">
            {past.map((event, i) => (
              <EventRow key={`p-${i}`} event={event} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-fg text-sm">Nema rokova.</p>
        </div>
      )}
    </div>
  );
}

function EventRow({ event }: { event: CriticalDate }) {
  const subj = subjectMap.get(event.subjectId);
  const urgencyColor =
    event.urgency === "critical" ? "var(--u-critical)"
    : event.urgency === "approaching" ? "var(--u-approaching)"
    : "var(--muted-fg)";
  const days = event.date ? daysUntil(event.date) : null;
  const isSoon = days !== null && days >= 0 && days <= 7;

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-md"
      style={{
        background: isSoon ? "var(--u-critical-tint)" : "var(--muted)",
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: urgencyColor }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-foreground">
            {TYPE_LABEL[event.type]}
          </span>
          <span className="text-[11px] text-muted-fg">
            {subj?.short_name ?? event.subjectId}
          </span>
        </div>
        {event.date && (
          <div className="text-[11px] text-muted-fg tabular-nums mt-0.5">
            {formatHrDate(event.date)}
          </div>
        )}
      </div>
      {days !== null && days >= 0 && (
        <span
          className="text-[10px] font-semibold tabular-nums shrink-0"
          style={{ color: urgencyColor }}
        >
          {daysLabel(days)}
        </span>
      )}
      {!event.date && (
        <span className="text-[10px] text-muted-fg shrink-0">
          T{event.week}
        </span>
      )}
    </div>
  );
}
