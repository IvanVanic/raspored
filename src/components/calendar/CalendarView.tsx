"use client";

import { useMemo, useState } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap, data } from "@/data/schedule";
import { extractCriticalDates } from "@/lib/extraction";
import { daysUntil, semesterStartLocal } from "@/lib/date-utils";
import { TYPE_LABEL, TEST_TYPES, getCourseColor, EVENT_COLOR } from "@/lib/labels";
import type { CurriculumEntry, CriticalDate, EventType } from "@/data/types";

const CROATIAN_DAYS = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "cetvrtak", "petak", "subota"];
const CROATIAN_MONTHS_GEN = [
  "sijecnja", "veljace", "ozujka", "travnja", "svibnja", "lipnja",
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

function inferDate(event: CriticalDate): Date {
  if (event.date) return event.date;
  const start = semesterStartLocal();
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + (event.week - 1) * 7);
}

type CourseFilter = string | null;
type TypeFilter = EventType | "ostalo" | null;

const OSTALO_TYPES: Set<EventType> = new Set(["kontrolna", "kviz", "laboratorij", "predaja", "zadavanje", "domaca_zadaca", "predrok"]);

const TYPE_FILTERS: { label: string; value: EventType | "ostalo" | null }[] = [
  { label: "Sve", value: null },
  { label: "Kol", value: "kolokvij" },
  { label: "Isp", value: "ispit" },
  { label: "Obr", value: "obrana" },
  { label: "Ost", value: "ostalo" },
];

function getEventPoints(event: CriticalDate): number | null {
  if (event.points !== undefined) return event.points;

  const entry = curriculum[event.subjectId.toUpperCase()] as CurriculumEntry | undefined;
  if (!entry) return null;

  const numberedKolokvij = event.label.match(/\b(\d+)\.\s*kolokvij\b/i)?.[1];
  if (event.type === "kolokvij" && numberedKolokvij) {
    const exact = entry.grading.find(g =>
      new RegExp(`\\b${numberedKolokvij}\\.\\s*kolokvij\\b`, "i").test(g.component)
    );
    if (exact) return exact.maxPoints;
  }

  const numberedProject = event.label.match(/\b(\d+)\.\s*projektn/i)?.[1];
  if (event.type === "obrana" && numberedProject) {
    const exact = entry.grading.find(g =>
      new RegExp(`\\b${numberedProject}\\.\\s*projektn`, "i").test(g.component)
    );
    if (exact) return exact.maxPoints;
  }

  for (const g of entry.grading) {
    const gLabel = g.component.toLowerCase();
    const eLabel = TYPE_LABEL[event.type]?.toLowerCase() ?? "";
    if (gLabel.includes(eLabel) || eLabel.includes(gLabel)) return g.maxPoints;
    if (event.type === "kolokvij" && gLabel.includes("kolokvij")) return g.maxPoints;
    if (event.type === "obrana" && gLabel.includes("projekt")) return g.maxPoints;
  }
  return null;
}

function sourceKind(event: CriticalDate): "obavijest" | "dinp" | "inferred" {
  const source = event.source?.toLowerCase() ?? "";
  if (source.includes("obavijest") || source.includes("merlin")) return "obavijest";
  if (source.includes("dinp") || source.includes("vazniji")) return "dinp";
  return "inferred";
}

function sourceLabel(event: CriticalDate): string {
  const kind = sourceKind(event);
  if (kind === "obavijest") return "prema Obavijesti";
  if (kind === "dinp") return "prema DINP-u";
  return "iz kurikuluma";
}

function groupByDate(events: CriticalDate[]) {
  const map = new Map<string, { date: Date; key: string; events: CriticalDate[]; approximate: boolean }>();

  for (const event of events) {
    const date = inferDate(event);
    const key = toDateKey(date);
    if (!map.has(key)) {
      map.set(key, { date, key, events: [], approximate: !event.date });
    }
    const group = map.get(key)!;
    group.events.push(event);
    group.approximate = group.approximate || !event.date;
  }

  return Array.from(map.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function CalendarView({ onTestTap }: { onTestTap?: (event: CriticalDate) => void }) {
  const [courseFilter, setCourseFilter] = useState<CourseFilter>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(null);
  const [showPast, setShowPast] = useState(false);
  const [showLater, setShowLater] = useState(false);

  const resetListScroll = () => {
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const all = useMemo(
    () => extractCriticalDates(curriculum as Record<string, CurriculumEntry>),
    []
  );

  const courses = useMemo(
    () => data.subjects.map(s => ({ id: s.id, short: s.short_name })),
    []
  );

  const filtered = all.filter(d => {
    if (courseFilter && d.subjectId !== courseFilter) return false;
    if (typeFilter === "ostalo") return OSTALO_TYPES.has(d.type);
    if (typeFilter && d.type !== typeFilter) return false;
    return true;
  });

  const upcoming = filtered.filter(d => daysUntil(inferDate(d)) >= 0);
  const past = filtered.filter(d => daysUntil(inferDate(d)) < 0);
  const thisWeek = upcoming.filter(d => daysUntil(inferDate(d)) <= 7);
  const soon = upcoming.filter(d => {
    const days = daysUntil(inferDate(d));
    return days > 7 && days <= 30;
  });
  const later = upcoming.filter(d => daysUntil(inferDate(d)) > 30);

  const pastGroups = groupByDate(past).sort((a, b) => b.date.getTime() - a.date.getTime());
  const soonGroups = groupByDate(soon);
  const laterGroups = groupByDate(later);
  const noMatches = filtered.length === 0;

  return (
    <div className="pb-6">
      <div className="rokovi-filter-bar">
        <select
          value={courseFilter ?? ""}
          onChange={e => {
            setCourseFilter(e.target.value || null);
            resetListScroll();
          }}
          className="rokovi-course-select"
          aria-label="Filtriraj kolegij"
        >
          <option value="">Svi kolegiji</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.short}</option>
          ))}
        </select>
        <div className="filter-chip-strip">
          {TYPE_FILTERS.map(f => (
            <button
              key={String(f.value)}
              className="filter-chip"
              data-active={typeFilter === f.value ? "true" : "false"}
              onClick={() => {
                setTypeFilter(typeFilter === f.value ? null : f.value);
                resetListScroll();
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        {past.length > 0 && (
          <button
            className="rokovi-past-toggle"
            onClick={() => setShowPast(!showPast)}
          >
            <span style={{ fontSize: 9 }}>{showPast ? "▴" : "▸"}</span>
            {showPast ? "Sakrij proslo" : `${past.length} proslih rokova`}
          </button>
        )}

        {showPast && past.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {pastGroups.map(({ date, key, events, approximate }) => (
              <div key={key}>
                <DateDivider date={date} days={daysUntil(date)} approximate={approximate} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                  {events.map((event, i) => (
                    <AgendaRow key={i} event={event} onTestTap={onTestTap} past />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {noMatches ? (
          <div className="null-state">
            <p>Nema rokova za odabrane filtre.</p>
          </div>
        ) : (
          <>
            {thisWeek.length > 0 && (
              <section style={{ marginBottom: 20 }}>
                <span className="rokovi-section-label">Ovaj tjedan</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {thisWeek.map((event, i) => (
                    <UrgentCard key={`${event.subjectId}-${event.label}-${i}`} event={event} onTestTap={onTestTap} />
                  ))}
                </div>
              </section>
            )}

            {thisWeek.length === 0 && !courseFilter && !typeFilter && (
              <div style={{ padding: "20px 0 16px", textAlign: "center" }}>
                <span style={{ fontSize: 12, color: "var(--muted-fg)" }}>Nema rokova ovaj tjedan.</span>
              </div>
            )}

            {soonGroups.length > 0 && (
              <section style={{ marginBottom: 20 }}>
                <span className="rokovi-section-label">Nadolazece</span>
                {soonGroups.map(({ date, key, events, approximate }) => (
                  <div key={key}>
                    <DateDivider date={date} days={daysUntil(date)} approximate={approximate} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                      {events.map((event, i) => (
                        <AgendaRow key={i} event={event} onTestTap={onTestTap} />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {later.length > 0 && (
              <section>
                <button
                  className="rokovi-past-toggle"
                  onClick={() => setShowLater(!showLater)}
                >
                  <span style={{ fontSize: 9 }}>{showLater ? "▴" : "▸"}</span>
                  Kasnije - {later.length} rokova
                </button>
                {showLater && (
                  <div style={{ marginTop: 8 }}>
                    {laterGroups.map(({ date, key, events, approximate }) => (
                      <div key={key}>
                        <DateDivider date={date} days={daysUntil(date)} approximate={approximate} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                          {events.map((event, i) => (
                            <AgendaRow key={i} event={event} onTestTap={onTestTap} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DateDivider({ date, days, approximate }: { date: Date; days: number; approximate?: boolean }) {
  const isToday = days === 0;
  const isTomorrow = days === 1;
  const isSoon = days >= 0 && days <= 7;
  const rawLabel = isToday ? "Danas" : isTomorrow ? "Sutra" : formatAgendaDate(date);
  const label = approximate ? `~ ${rawLabel}` : rawLabel;
  const accentColor = isToday
    ? "var(--u-critical)"
    : isSoon
    ? "var(--u-approaching)"
    : "var(--muted-fg)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 6px" }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: isToday || isTomorrow ? accentColor : "var(--foreground)",
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
          background: isToday ? "color-mix(in srgb, var(--u-critical) 25%, transparent)" : "var(--border-subtle)",
        }}
      />
    </div>
  );
}

function UrgentCard({ event, onTestTap }: { event: CriticalDate; onTestTap?: (event: CriticalDate) => void }) {
  const isTest = TEST_TYPES.has(event.type);
  const subj = subjectMap.get(event.subjectId);
  const cc = getCourseColor(event.subjectId);
  const points = getEventPoints(event);
  const date = inferDate(event);
  const days = daysUntil(date);
  const countdownLabel = days === 0 ? "danas" : days === 1 ? "sutra" : `za ${days}d`;
  const isCritical = days <= 3;

  return (
    <button
      onClick={() => isTest && onTestTap?.(event)}
      disabled={!isTest || !onTestTap}
      className="rokovi-urgent-card"
      style={{ background: cc.tint, borderLeft: `3px solid ${cc.accent}` }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span className="rokovi-urgent-type" style={{ color: EVENT_COLOR[event.type] }}>
          {TYPE_LABEL[event.type]}
        </span>
        <span
          className="rokovi-countdown"
          style={{
            color: isCritical ? "var(--u-critical)" : EVENT_COLOR[event.type],
            background: isCritical
              ? "color-mix(in srgb, var(--u-critical) 14%, transparent)"
              : `color-mix(in srgb, ${EVENT_COLOR[event.type]} 12%, transparent)`,
          }}
        >
          {countdownLabel}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: cc.text, minWidth: 0 }}>
          {subj?.short_name ?? event.subjectId}
        </span>
        {points !== null && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-fg)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
            {points} bod.
          </span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "var(--muted-fg)" }}>
          {!event.date ? "~ " : ""}{formatAgendaDate(date)}
        </span>
        <span style={{ fontSize: 9, color: "var(--muted-fg)", opacity: 0.65, fontWeight: 500, textAlign: "right" }}>
          {sourceLabel(event)}
        </span>
      </div>

      {isTest && onTestTap && (
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--muted-fg)", opacity: 0.4 }}>
          ›
        </span>
      )}
    </button>
  );
}

function AgendaRow({
  event,
  onTestTap,
  past,
}: {
  event: CriticalDate;
  onTestTap?: (event: CriticalDate) => void;
  past?: boolean;
}) {
  const isTest = TEST_TYPES.has(event.type);
  const subj = subjectMap.get(event.subjectId);
  const cc = getCourseColor(event.subjectId);
  const points = getEventPoints(event);
  const source = sourceKind(event);
  const sourceColor = source === "obavijest" ? "var(--m-accent)" : "var(--muted-fg)";

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

      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            flexShrink: 0,
            background: sourceColor,
            opacity: event.source ? 0.8 : 0.3,
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.3 }}>
          {TYPE_LABEL[event.type]}
        </span>
      </div>

      {points !== null && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: EVENT_COLOR[event.type],
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {points} pts
        </span>
      )}

      {isTest && onTestTap && !past && (
        <span style={{ fontSize: 14, color: "var(--muted-fg)", flexShrink: 0, opacity: 0.5 }}>
          ›
        </span>
      )}
    </button>
  );
}
