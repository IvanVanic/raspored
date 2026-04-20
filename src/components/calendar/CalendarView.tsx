"use client";

import { useMemo, useState } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap, data } from "@/data/schedule";
import { extractCriticalDates } from "@/lib/extraction";
import { daysUntil } from "@/lib/date-utils";
import { TYPE_LABEL, TEST_TYPES, getCourseColor } from "@/lib/labels";
import type { CurriculumEntry, CriticalDate, EventType } from "@/data/types";
import { Dropdown } from "@/components/shared/Dropdown";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CROATIAN_DAYS = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
const CROATIAN_MONTHS_GEN = [
  "siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja",
  "srpnja", "kolovoza", "rujna", "listopada", "studenog", "prosinca",
];

function formatAgendaDate(date: Date): string {
  const dayName = CROATIAN_DAYS[date.getDay()];
  const day = date.getDate();
  const month = CROATIAN_MONTHS_GEN[date.getMonth()];
  return `${dayName}, ${day}. ${month}`;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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

// ── Grading points lookup ────────────────────────────────────────────────────

function getEventPoints(event: CriticalDate): number | null {
  const entry = curriculum[event.subjectId.toUpperCase()] as CurriculumEntry | undefined;
  if (!entry) return null;
  for (const g of entry.grading) {
    const gLabel = g.component.toLowerCase();
    const eLabel = TYPE_LABEL[event.type]?.toLowerCase() ?? "";
    if (gLabel.includes(eLabel) || eLabel.includes(gLabel)) return g.maxPoints;
    // Match numbered kolokvij: "1. kolokvij" in label vs "1. kolokvij" in grading
    if (event.type === "kolokvij" && gLabel.includes("kolokvij")) return g.maxPoints;
    if (event.type === "obrana" && gLabel.includes("projekt")) return g.maxPoints;
  }
  return null;
}

// ── Main Component ───────────────────────────────────────────────────────────

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

  // Separate ispiti unless explicitly filtering for them
  const includeIspiti = typeFilter === "ispit";
  const nonIspit = includeIspiti ? all : all.filter(d => d.type !== "ispit");
  const ispiti = includeIspiti ? [] : all.filter(d => d.type === "ispit");

  const filtered = nonIspit.filter(d => {
    if (courseFilter && d.subjectId !== courseFilter) return false;
    if (typeFilter === "ostalo") return OSTALO_TYPES.has(d.type);
    if (typeFilter && d.type !== typeFilter) return false;
    return true;
  });

  // Split into dated upcoming, past, and undated
  const upcoming = filtered.filter(d => d.date && daysUntil(d.date) >= 0);
  const past = filtered.filter(d => d.date && daysUntil(d.date) < 0);
  const undated = filtered.filter(d => !d.date);

  // Group upcoming by date for agenda view
  const dateGroups = useMemo(() => {
    const groups: { date: Date; key: string; events: CriticalDate[] }[] = [];
    const map = new Map<string, { date: Date; events: CriticalDate[] }>();

    for (const ev of upcoming) {
      if (!ev.date) continue;
      const key = toDateKey(ev.date);
      if (!map.has(key)) {
        map.set(key, { date: ev.date, events: [] });
      }
      map.get(key)!.events.push(ev);
    }

    for (const [key, val] of map) {
      groups.push({ date: val.date, key, events: val.events });
    }

    groups.sort((a, b) => a.date.getTime() - b.date.getTime());
    return groups;
  }, [upcoming]);

  // Group past by date (reversed — most recent first)
  const pastGroups = useMemo(() => {
    const groups: { date: Date; key: string; events: CriticalDate[] }[] = [];
    const map = new Map<string, { date: Date; events: CriticalDate[] }>();

    for (const ev of past) {
      if (!ev.date) continue;
      const key = toDateKey(ev.date);
      if (!map.has(key)) {
        map.set(key, { date: ev.date, events: [] });
      }
      map.get(key)!.events.push(ev);
    }

    for (const [key, val] of map) {
      groups.push({ date: val.date, key, events: val.events });
    }

    groups.sort((a, b) => b.date.getTime() - a.date.getTime());
    return groups;
  }, [past]);

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

      <div className="px-4 pt-4">
        {/* Agenda — upcoming events grouped by date */}
        {dateGroups.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {dateGroups.map(({ date, key, events }) => {
              const days = daysUntil(date);
              return (
                <div key={key} style={{ animation: "row-in 200ms var(--ease-out-expo) both" }}>
                  <DateDivider date={date} days={days} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
                    {events.map((event, i) => (
                      <AgendaRow key={i} event={event} onTestTap={onTestTap} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Undated events */}
        {undated.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                marginBottom: 4,
              }}
            >
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted-fg)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                Bez datuma
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {undated.map((event, i) => (
                <AgendaRow key={i} event={event} onTestTap={onTestTap} showWeek />
              ))}
            </div>
          </div>
        )}

        {/* Ispiti section — always at bottom unless filtered */}
        {ispiti.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: 16 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 3,
                  height: 14,
                  borderRadius: 2,
                  background: "var(--e-accent)",
                  flexShrink: 0,
                }}
              />
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--muted-fg)",
              }}>
                Ispitni rokovi
              </span>
            </div>
            {(() => {
              const visible = ispiti
                .filter(d => !courseFilter || d.subjectId === courseFilter)
                .filter(d => d.date && daysUntil(d.date) >= 0);
              const byDate = new Map<string, { date: Date; events: CriticalDate[] }>();
              for (const ev of visible) {
                if (!ev.date) continue;
                const key = toDateKey(ev.date);
                if (!byDate.has(key)) byDate.set(key, { date: ev.date, events: [] });
                byDate.get(key)!.events.push(ev);
              }
              const groups = Array.from(byDate.entries())
                .map(([key, v]) => ({ key, ...v }))
                .sort((a, b) => a.date.getTime() - b.date.getTime());
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {groups.map(({ key, date, events }) => (
                    <div key={key}>
                      <DateDivider date={date} days={daysUntil(date)} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                        {events.map((event, i) => (
                          <AgendaRow key={i} event={event} onTestTap={onTestTap} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Past toggle */}
        {past.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <button
              className="text-[11px] text-muted-fg hover:text-foreground t-fast transition-colors flex items-center gap-1.5"
              onClick={() => setShowPast(!showPast)}
            >
              <span style={{ fontSize: 9 }}>{showPast ? "▲" : "▼"}</span>
              {showPast ? "Sakrij prošlo" : `Prikaži prošlo (${past.length})`}
            </button>
            {showPast && (
              <div style={{ marginTop: 8 }}>
                {pastGroups.map(({ date, key, events }) => (
                  <div key={key} style={{ opacity: 0.45 }}>
                    <DateDivider date={date} days={daysUntil(date)} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                      {events.map((event, i) => (
                        <AgendaRow key={i} event={event} onTestTap={onTestTap} past />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {dateGroups.length === 0 && undated.length === 0 && (
          <div className="null-state">
            <p>Nema nadolazećih rokova{courseFilter || typeFilter ? " za odabrane filtre" : ""}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Date Divider ─────────────────────────────────────────────────────────────

function DateDivider({ date, days }: { date: Date; days: number }) {
  const isToday = days === 0;
  const isTomorrow = days === 1;
  const isSoon = days >= 0 && days <= 7;

  const label = isToday ? "Danas" : isTomorrow ? "Sutra" : formatAgendaDate(date);
  const accentColor = isToday
    ? "var(--u-critical)"
    : isSoon
    ? "var(--u-approaching)"
    : "var(--muted-fg)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 0 6px",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: isToday || isTomorrow ? accentColor : "var(--foreground)",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
      {days > 1 && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: accentColor,
            opacity: 0.7,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          za {days}d
        </span>
      )}
      <span
        style={{
          flex: 1,
          height: 1,
          background: isToday
            ? "color-mix(in srgb, var(--u-critical) 25%, transparent)"
            : "var(--border-subtle)",
        }}
      />
    </div>
  );
}

// ── Agenda Row ───────────────────────────────────────────────────────────────

function AgendaRow({
  event,
  onTestTap,
  past,
  showWeek,
}: {
  event: CriticalDate;
  onTestTap?: (event: CriticalDate) => void;
  past?: boolean;
  showWeek?: boolean;
}) {
  const isTest = TEST_TYPES.has(event.type);
  const subj = subjectMap.get(event.subjectId);
  const cc = getCourseColor(event.subjectId);
  const points = getEventPoints(event);

  return (
    <button
      onClick={() => isTest && onTestTap?.(event)}
      disabled={!isTest || !onTestTap}
      style={{
        all: "unset",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        background: "var(--muted)",
        cursor: isTest && onTestTap ? "pointer" : "default",
        boxSizing: "border-box",
        width: "100%",
        borderLeft: `3px solid ${cc.accent}`,
        opacity: past ? 0.5 : 1,
      }}
    >
      {/* Course name — colored */}
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: cc.text,
          minWidth: 44,
          flexShrink: 0,
        }}
      >
        {subj?.short_name ?? event.subjectId}
      </span>

      {/* Event type + label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--foreground)",
            lineHeight: 1.3,
          }}
        >
          {TYPE_LABEL[event.type]}
        </span>
      </div>

      {/* Points badge */}
      {points && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--muted-fg)",
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {points} pts
        </span>
      )}

      {/* Week badge for undated */}
      {showWeek && !event.date && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--muted-fg)",
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          T{event.week}
        </span>
      )}

      {/* Tap affordance for tests */}
      {isTest && onTestTap && !past && (
        <span
          style={{
            fontSize: 14,
            color: "var(--muted-fg)",
            flexShrink: 0,
            opacity: 0.5,
          }}
        >
          ›
        </span>
      )}
    </button>
  );
}
