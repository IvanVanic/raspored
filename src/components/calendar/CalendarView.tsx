"use client";

import { useMemo, useState } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap, data } from "@/data/schedule";
import { extractCriticalDates } from "@/lib/extraction";
import { formatHrDate, daysUntil } from "@/lib/date-utils";
import { TYPE_LABEL, TYPE_CATEGORY, EVENT_COLOR, TEST_TYPES } from "@/lib/labels";
import type { CurriculumEntry, CriticalDate, EventType } from "@/data/types";
import { Dropdown } from "@/components/shared/Dropdown";

function daysLabel(days: number): string {
  if (days === 0) return "danas";
  if (days === 1) return "sutra";
  if (days < 0) return "prošlo";
  return `za ${days}d`;
}

type CourseFilter = string | null;
type TypeFilter = EventType | "ostalo" | null;

const OSTALO_TYPES: Set<EventType> = new Set(["kontrolna", "kviz", "laboratorij", "predaja", "zadavanje", "domaca_zadaca"]);

const TYPE_FILTERS: { label: string; value: EventType | "ostalo" | null }[] = [
  { label: "Sve", value: null },
  { label: "Kolokviji", value: "kolokvij" },
  { label: "Ispiti", value: "ispit" },
  { label: "Obrane", value: "obrana" },
  { label: "Ostalo", value: "ostalo" },
];

export function CalendarView({ onTestTap }: { onTestTap?: (event: CriticalDate) => void }) {
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

  const includeIspiti = typeFilter === "ispit";
  const nonIspit = includeIspiti ? all : all.filter(d => d.type !== "ispit");
  const ispiti = includeIspiti ? [] : all.filter(d => d.type === "ispit");

  const filtered = nonIspit.filter(d => {
    if (courseFilter && d.subjectId !== courseFilter) return false;
    if (typeFilter === "ostalo") return OSTALO_TYPES.has(d.type);
    if (typeFilter && d.type !== typeFilter) return false;
    return true;
  });

  const upcoming = filtered.filter(d => !d.date || daysUntil(d.date) >= 0);
  const past = filtered.filter(d => d.date && daysUntil(d.date) < 0);

  const thisWeek = upcoming.filter(d => d.date && daysUntil(d.date) <= 7);
  const soon = upcoming.filter(d => !d.date || (d.date && daysUntil(d.date) > 7 && daysUntil(d.date) <= 21));
  const later = upcoming.filter(d => d.date && daysUntil(d.date) > 21);
  const undated = upcoming.filter(d => !d.date);

  const hasSections = thisWeek.length > 0 || soon.length > 0 || later.length > 0 || undated.length > 0;

  return (
    <div className="pb-6">
      {/* Filter row */}
      <div className="py-3 border-b border-border-subtle space-y-2.5">
        <div className="px-4">
          <Dropdown
            options={courses.map(c => ({ value: c.id, label: c.short }))}
            value={courseFilter}
            onChange={setCourseFilter}
            placeholder="Svi kolegiji"
          />
        </div>
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

      <div className="px-4 pt-4 space-y-5">
        {thisWeek.length > 0 && (
          <Section title="Ovaj tjedan" events={thisWeek} urgency="critical" onTestTap={onTestTap} />
        )}
        {soon.length > 0 && (
          <Section title="Uskoro" events={soon} urgency="approaching" onTestTap={onTestTap} />
        )}
        {later.length > 0 && (
          <Section title="Kasnije" events={later} onTestTap={onTestTap} />
        )}
        {undated.length > 0 && (
          <Section title="Bez datuma" events={undated} onTestTap={onTestTap} />
        )}

        {/* Ispiti — always at bottom */}
        {ispiti.length > 0 && (
          <div>
            {hasSections && (
              <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: 16 }} />
            )}
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-block w-[3px] h-3.5 rounded-full shrink-0" style={{ background: "var(--e-accent)" }} />
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-fg">
                Ispitni rokovi
              </h3>
              <span className="text-[10px] font-semibold tabular-nums text-muted-fg opacity-60">
                {ispiti.filter(d => !courseFilter || d.subjectId === courseFilter).filter(d => !d.date || daysUntil(d.date) >= 0).length}
              </span>
            </div>
            <div className="space-y-1">
              {ispiti
                .filter(d => !d.date || daysUntil(d.date) >= 0)
                .filter(d => !courseFilter || d.subjectId === courseFilter)
                .map((event, i) => (
                  <EventRow key={`isp-${i}`} event={event} compact onTestTap={onTestTap} />
                ))}
            </div>
            {ispiti.filter(d => d.date && daysUntil(d.date) < 0).filter(d => !courseFilter || d.subjectId === courseFilter).length > 0 && (
              <div className="mt-1 space-y-1 opacity-35">
                {ispiti
                  .filter(d => d.date && daysUntil(d.date) < 0)
                  .filter(d => !courseFilter || d.subjectId === courseFilter)
                  .map((event, i) => (
                    <EventRow key={`isp-p-${i}`} event={event} compact onTestTap={onTestTap} />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Past toggle */}
        {past.length > 0 && (
          <div>
            <button
              className="text-[11px] text-muted-fg hover:text-foreground t-fast transition-colors flex items-center gap-1.5"
              onClick={() => setShowPast(!showPast)}
            >
              <span style={{ fontSize: 9 }}>{showPast ? "▲" : "▼"}</span>
              {showPast ? "Sakrij prošlo" : `Prošlo (${past.length})`}
            </button>
            {showPast && (
              <div className="mt-2 space-y-1 opacity-40">
                {past.map((event, i) => <EventRow key={`p-${i}`} event={event} onTestTap={onTestTap} />)}
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
  urgency,
  onTestTap,
}: {
  title: string;
  events: CriticalDate[];
  urgency?: "critical" | "approaching";
  onTestTap?: (event: CriticalDate) => void;
}) {
  const accentColor = urgency === "critical"
    ? "var(--u-critical)"
    : urgency === "approaching"
    ? "var(--u-approaching)"
    : undefined;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        {accentColor && (
          <span
            className="inline-block w-[3px] h-3.5 rounded-full shrink-0"
            style={{ background: accentColor }}
          />
        )}
        <h3
          className="text-[10px] font-semibold uppercase tracking-[0.07em]"
          style={{ color: accentColor ?? "var(--muted-fg)" }}
        >
          {title}
        </h3>
        <span
          className="text-[10px] font-semibold tabular-nums"
          style={{ color: accentColor ?? "var(--muted-fg)", opacity: 0.6 }}
        >
          {events.length}
        </span>
      </div>
      <div className="space-y-1">
        {events.map((event, i) => (
          <EventRow key={i} event={event} onTestTap={onTestTap} />
        ))}
      </div>
    </div>
  );
}

function EventRow({ event, compact, onTestTap }: { event: CriticalDate; compact?: boolean; onTestTap?: (event: CriticalDate) => void }) {
  const isTest = TEST_TYPES.has(event.type);
  const subj = subjectMap.get(event.subjectId);
  const days = event.date ? daysUntil(event.date) : null;
  const isSoon = days !== null && days >= 0 && days <= 7;
  const isToday = days === 0;
  const isTomorrow = days === 1;

  const countdownColor = isToday
    ? "var(--u-critical)"
    : isSoon
    ? "var(--u-approaching)"
    : "var(--muted-fg)";

  const countdownBg = isToday
    ? "color-mix(in srgb, var(--u-critical) 15%, transparent)"
    : isTomorrow
    ? "color-mix(in srgb, var(--u-approaching) 15%, transparent)"
    : isSoon
    ? "color-mix(in srgb, var(--u-approaching) 10%, transparent)"
    : "var(--muted)";

  return (
    <div
      className="event-row"
      onClick={() => isTest && onTestTap?.(event)}
      style={{
        paddingLeft: 9,
        borderLeft: `3px solid ${EVENT_COLOR[event.type]}`,
        cursor: isTest && onTestTap ? "pointer" : undefined,
        background: isSoon
          ? "color-mix(in srgb, var(--u-critical-tint) 90%, transparent)"
          : "var(--muted)",
        animation: "row-in 200ms var(--ease-out-expo) both",
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[12px] font-semibold text-foreground leading-tight shrink-0">
            {TYPE_LABEL[event.type]}
          </span>
          <span className="text-[11px] text-muted-fg leading-tight truncate">
            {subj?.short_name ?? event.subjectId}
          </span>
          {event.date && (
            <span
              className="text-[11px] tabular-nums leading-tight shrink-0 ml-auto pl-2"
              style={{ color: isSoon ? "var(--u-approaching)" : "var(--muted-fg)" }}
            >
              {formatHrDate(event.date)}
            </span>
          )}
        </div>
      </div>

      {/* Countdown badge — more prominent */}
      {days !== null && days >= 0 && (
        <span
          className="event-countdown"
          style={{
            color: countdownColor,
            background: countdownBg,
            flexShrink: 0,
            fontWeight: isSoon ? 800 : 700,
            border: isSoon ? `1px solid ${countdownColor}33` : undefined,
            minWidth: 44,
            textAlign: "center",
          }}
        >
          {daysLabel(days)}
        </span>
      )}
      {!event.date && (
        <span className="event-countdown" style={{ color: "var(--muted-fg)", background: "var(--muted)", flexShrink: 0, minWidth: 36, textAlign: "center" }}>
          T{event.week}
        </span>
      )}
    </div>
  );
}
