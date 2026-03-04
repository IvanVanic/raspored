"use client";

import { useMemo, useState } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap, data } from "@/data/schedule";
import { extractCriticalDates } from "@/lib/extraction";
import { formatHrDate, daysUntil } from "@/lib/date-utils";
import { TYPE_LABEL, TYPE_CATEGORY, EVENT_COLOR } from "@/lib/labels";
import type { CurriculumEntry, CriticalDate, EventType } from "@/data/types";

function daysLabel(days: number): string {
  if (days === 0) return "danas";
  if (days === 1) return "sutra";
  if (days < 0) return "prošlo";
  return `za ${days}d`;
}

type CourseFilter = string | null; // null = all
type TypeFilter = EventType | null; // null = all

const TYPE_FILTERS: { label: string; value: EventType | null }[] = [
  { label: "Sve", value: null },
  { label: "Kolokviji", value: "kolokvij" },
  { label: "Obrane", value: "obrana" },
  { label: "Kvizovi", value: "kviz" },
];

export function CalendarView() {
  const [courseFilter, setCourseFilter] = useState<CourseFilter>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(null);
  const [showPast, setShowPast] = useState(false);

  const all = useMemo(
    () => extractCriticalDates(curriculum as Record<string, CurriculumEntry>),
    []
  );

  const courses = useMemo(
    () => data.subjects.map(s => ({ id: s.id, short: s.short_name })),
    []
  );

  // Split ispit from everything else
  const nonIspit = all.filter(d => d.type !== "ispit");
  const ispiti = all.filter(d => d.type === "ispit");

  // Apply filters to non-ispit events
  const filtered = nonIspit.filter(d => {
    if (courseFilter && d.subjectId !== courseFilter) return false;
    if (typeFilter && d.type !== typeFilter) return false;
    return true;
  });

  const upcoming = filtered.filter(d => !d.date || daysUntil(d.date) >= 0);
  const past = filtered.filter(d => d.date && daysUntil(d.date) < 0);

  // Group upcoming into bands
  const thisWeek = upcoming.filter(d => d.date && daysUntil(d.date) <= 7);
  const soon = upcoming.filter(d => !d.date || (d.date && daysUntil(d.date) > 7 && daysUntil(d.date) <= 21));
  const later = upcoming.filter(d => d.date && daysUntil(d.date) > 21);
  const undated = upcoming.filter(d => !d.date);

  return (
    <div className="pb-6">
      {/* Filter row */}
      <div className="py-3 border-b border-border-subtle">
        {/* Course filter */}
        <div className="filter-chip-strip mb-2.5">
          <button
            className="filter-chip"
            data-active={courseFilter === null ? "true" : "false"}
            onClick={() => setCourseFilter(null)}
          >
            Svi kolegiji
          </button>
          {courses.map(c => (
            <button
              key={c.id}
              className="filter-chip"
              data-active={courseFilter === c.id ? "true" : "false"}
              onClick={() => setCourseFilter(courseFilter === c.id ? null : c.id)}
            >
              {c.short}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="filter-chip-strip">
          {TYPE_FILTERS.map(f => (
            <button
              key={String(f.value)}
              className="filter-chip"
              data-active={typeFilter === f.value ? "true" : "false"}
              onClick={() => setTypeFilter(typeFilter === f.value ? null : f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 space-y-5">
        {/* This week */}
        {thisWeek.length > 0 && (
          <Section title="Ovaj tjedan" events={thisWeek} accent />
        )}

        {/* Soon */}
        {soon.length > 0 && (
          <Section title="Uskoro" events={soon} />
        )}

        {/* Later */}
        {later.length > 0 && (
          <Section title="Kasnije" events={later} />
        )}

        {/* Undated */}
        {undated.length > 0 && (
          <Section title="Bez datuma" events={undated} />
        )}

        {/* Ispiti — always shown separately at bottom */}
        {ispiti.length > 0 && (
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
              Ispitni rokovi
            </h3>
            <div className="space-y-1">
              {ispiti
                .filter(d => !d.date || daysUntil(d.date) >= 0)
                .filter(d => !courseFilter || d.subjectId === courseFilter)
                .map((event, i) => (
                  <EventRow key={`isp-${i}`} event={event} compact />
                ))}
            </div>
            {ispiti.filter(d => d.date && daysUntil(d.date) < 0).filter(d => !courseFilter || d.subjectId === courseFilter).length > 0 && (
              <div className="mt-1 space-y-1 opacity-35">
                {ispiti
                  .filter(d => d.date && daysUntil(d.date) < 0)
                  .filter(d => !courseFilter || d.subjectId === courseFilter)
                  .map((event, i) => (
                    <EventRow key={`isp-p-${i}`} event={event} compact />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Past toggle */}
        {past.length > 0 && (
          <div>
            <button
              className="text-[11px] text-muted-fg hover:text-foreground t-fast transition-colors"
              onClick={() => setShowPast(!showPast)}
            >
              {showPast ? "▲ Sakrij prošlo" : `▼ Prikaži prošlo (${past.length})`}
            </button>
            {showPast && (
              <div className="mt-2 space-y-1 opacity-40">
                {past.map((event, i) => (
                  <EventRow key={`p-${i}`} event={event} />
                ))}
              </div>
            )}
          </div>
        )}

        {upcoming.length === 0 && undated.length === 0 && (
          <div className="null-state">
            <p>Nema nadolazećih rokova{courseFilter || typeFilter ? " za odabrane filtre" : ""}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  events,
  accent,
}: {
  title: string;
  events: CriticalDate[];
  accent?: boolean;
}) {
  return (
    <div>
      <h3
        className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-2"
        style={{ color: accent ? "var(--m-text)" : "var(--muted-fg)" }}
      >
        {title}
      </h3>
      <div className="space-y-1">
        {events.map((event, i) => (
          <EventRow key={i} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventRow({ event, compact }: { event: CriticalDate; compact?: boolean }) {
  const subj = subjectMap.get(event.subjectId);
  const days = event.date ? daysUntil(event.date) : null;
  const isSoon = days !== null && days >= 0 && days <= 7;

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-md"
      style={{
        background: isSoon
          ? "color-mix(in srgb, var(--u-critical-tint) 80%, transparent)"
          : "var(--muted)",
        animation: "row-in 200ms var(--ease-out-expo) both",
      }}
    >
      <span
        className="urgency-dot shrink-0"
        style={{ background: EVENT_COLOR[event.type] }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {!compact && (
            <span className="text-[12px] font-semibold text-foreground">
              {TYPE_LABEL[event.type]}
            </span>
          )}
          <span className="text-[11px] text-muted-fg">
            {subj?.short_name ?? event.subjectId}
          </span>
          {compact && (
            <span className="text-[11px] text-muted-fg">
              — {TYPE_LABEL[event.type]}
            </span>
          )}
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
          style={{ color: isSoon ? "var(--u-critical)" : "var(--muted-fg)" }}
        >
          {daysLabel(days)}
        </span>
      )}
      {!event.date && (
        <span className="text-[10px] text-muted-fg shrink-0">T{event.week}</span>
      )}
    </div>
  );
}
