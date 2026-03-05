"use client";

import { useState, useMemo } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap } from "@/data/schedule";
import { extractCriticalDates } from "@/lib/extraction";
import { SEMESTER_START, TOTAL_WEEKS, formatHrDate, getWeekForDate } from "@/lib/date-utils";
import { TYPE_LABEL, EVENT_COLOR } from "@/lib/labels";
import type { CurriculumEntry, CriticalDate } from "@/data/types";

// ── Constants ────────────────────────────────────────────────────────────────

const CROATIAN_MONTHS = ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"];

const WEEKDAY_HEADERS = ["P", "U", "S", "Č", "P", "S", "N"];

// March–June 2026
const CALENDAR_MONTHS: Array<{ year: number; month: number }> = [
  { year: 2026, month: 2 },  // March   (JS: 0-indexed)
  { year: 2026, month: 3 },  // April
  { year: 2026, month: 4 },  // May
  { year: 2026, month: 5 },  // June
];

// ── Pure helpers ─────────────────────────────────────────────────────────────

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Returns the teaching week number (1–TOTAL_WEEKS) for a Monday that falls
 * inside the semester, or null if the Monday is outside the semester window.
 */
function getTeachingWeek(date: Date): number | null {
  const start = new Date(SEMESTER_START);
  const diff = date.getTime() - start.getTime();
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  if (week >= 1 && week <= TOTAL_WEEKS) return week;
  return null;
}

/** ISO weekday index: Monday = 0 … Sunday = 6 */
function isoWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** "YYYY-MM-DD" key for a Date */
function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** All days in a calendar month as Date objects */
function monthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface MonthGridProps {
  year: number;
  month: number;
  eventMap: Map<string, CriticalDate[]>;
  selectedKey: string | null;
  onDaySelect: (key: string, date: Date) => void;
}

function MonthGrid({ year, month, eventMap, selectedKey, onDaySelect }: MonthGridProps) {
  const days = monthDays(year, month);
  const firstWeekday = isoWeekday(days[0]); // leading blank cells

  return (
    <div className="mb-4">
      {/* Month header */}
      <div className="calendar-month-header px-1">
        {CROATIAN_MONTHS[month]} {year}
      </div>

      {/* Weekday labels row */}
      <div className="calendar-grid">
        {WEEKDAY_HEADERS.map((label, i) => (
          <div key={i} className="calendar-weekday-header">
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="calendar-grid">
        {/* Leading empty cells to align first day */}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`empty-${i}`} className="calendar-cell" />
        ))}

        {days.map((day) => {
          const key = toKey(day);
          const events = eventMap.get(key) ?? [];
          const today = isToday(day);
          const selected = selectedKey === key;
          const weekday = isoWeekday(day);
          const teachingWeek = weekday === 0 ? getTeachingWeek(day) : null;

          return (
            <button
              key={key}
              onClick={() => onDaySelect(key, day)}
              className={["calendar-cell", today ? "calendar-today" : ""].join(" ")}
              style={{
                cursor: events.length > 0 ? "pointer" : "default",
                background: selected ? "color-mix(in srgb, var(--foreground) 8%, transparent)" : undefined,
                outline: selected ? "1px solid var(--foreground)" : undefined,
                outlineOffset: "-1px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                paddingTop: 3,
                paddingBottom: 3,
              }}
            >
              {/* Teaching week label */}
              {teachingWeek !== null && (
                <span style={{
                  position: "absolute", top: 1, right: 2,
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.02em",
                  color: "var(--muted-fg)", lineHeight: 1, fontVariantNumeric: "tabular-nums",
                }}>
                  T{teachingWeek}
                </span>
              )}

              {/* Date number */}
              <span style={{
                fontSize: 11,
                fontWeight: today ? 700 : 500,
                color: today ? "var(--m-text)" : "var(--foreground)",
                lineHeight: 1,
              }}>
                {day.getDate()}
              </span>

              {/* Event dots — always takes space for consistent height */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                minHeight: 6,
                flexWrap: "wrap",
              }}>
                {events.slice(0, 4).map((event, i) => (
                  <span key={i} className="calendar-event-dot" style={{ background: EVENT_COLOR[event.type] }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Event detail panel ────────────────────────────────────────────────────────

interface EventDetailPanelProps {
  selectedDate: Date;
  events: CriticalDate[];
  currentWeek: number;
}

function EventDetailPanel({ selectedDate, events, currentWeek }: EventDetailPanelProps) {
  const week = getWeekForDate(selectedDate);
  const isCurrentWeek = week === currentWeek;

  return (
    <div
      style={{
        margin: "0 0 8px 0",
        padding: "10px 12px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
    >
      {/* Panel header */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted-fg)",
          marginBottom: 6,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {formatHrDate(selectedDate)}
        {isCurrentWeek && (
          <span style={{ color: "var(--m-text)", marginLeft: 6, fontWeight: 600, textTransform: "none" }}>
            · Tjedan {week} (trenutni)
          </span>
        )}
        {!isCurrentWeek && (
          <span style={{ color: "var(--muted-fg)", marginLeft: 6, fontWeight: 500, textTransform: "none" }}>
            · Tjedan {week}
          </span>
        )}
      </p>

      {events.length === 0 ? (
        <p style={{ fontSize: 11, color: "var(--muted-fg)" }}>Nema rokova na ovaj datum.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {events.map((event, i) => {
            const subj = subjectMap.get(event.subjectId);
            const urgencyColor =
              event.urgency === "critical"
                ? "var(--u-critical)"
                : event.urgency === "approaching"
                ? "var(--u-approaching)"
                : "var(--muted-fg)";

            return (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}
              >
                <span
                  className="urgency-dot"
                  style={{ background: urgencyColor, flexShrink: 0 }}
                />
                <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
                  {subj?.short_name ?? event.subjectId}
                </span>
                <span style={{ color: "var(--muted-fg)" }}>
                  {TYPE_LABEL[event.type]}
                  {event.date ? ` · ${formatHrDate(event.date)}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SemesterTimeline({
  currentWeek,
  isOpen,
  onClose,
}: {
  currentWeek: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Build a date-keyed event map from all critical dates that have an exact date
  const eventMap = useMemo<Map<string, CriticalDate[]>>(() => {
    const dates = extractCriticalDates(curriculum as Record<string, CurriculumEntry>);
    const map = new Map<string, CriticalDate[]>();
    for (const cd of dates) {
      if (!cd.date) continue;
      const key = toKey(cd.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(cd);
    }
    return map;
  }, []);

  if (!isOpen) return null;

  const handleDaySelect = (key: string, date: Date) => {
    if (selectedKey === key) {
      // Deselect on second tap
      setSelectedKey(null);
      setSelectedDate(null);
    } else {
      setSelectedKey(key);
      setSelectedDate(date);
    }
  };

  const selectedEvents = selectedKey ? (eventMap.get(selectedKey) ?? []) : [];

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
          maxHeight: "85vh",
          borderRadius: "16px 16px 0 0",
          animation: "sheet-up 300ms cubic-bezier(0.2, 0, 0, 1) both",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1" style={{ flexShrink: 0 }}>
          <div className="w-10 h-1 rounded-full bg-muted-fg/30" />
        </div>

        {/* Title row */}
        <div
          className="flex items-center justify-between px-4 pb-2"
          style={{ flexShrink: 0 }}
        >
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-fg">
            Kalendar semestra
          </span>
          <button
            onClick={onClose}
            className="text-[11px] text-muted-fg hover:text-foreground t-fast transition-colors"
          >
            zatvori
          </button>
        </div>

        {/* Scrollable content area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 16px 24px",
          }}
        >
          {/* Event detail panel — shown above months when a day is selected */}
          {selectedKey && selectedDate && (
            <EventDetailPanel
              selectedDate={selectedDate}
              events={selectedEvents}
              currentWeek={currentWeek}
            />
          )}

          {/* Month grids */}
          {CALENDAR_MONTHS.map(({ year, month }) => (
            <MonthGrid
              key={`${year}-${month}`}
              year={year}
              month={month}
              eventMap={eventMap}
              selectedKey={selectedKey}
              onDaySelect={handleDaySelect}
            />
          ))}

          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 16px",
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {([
              ["kolokvij", "Kolokvij"],
              ["ispit", "Ispit"],
              ["obrana", "Obrana"],
              ["kontrolna", "Ostalo"],
            ] as const).map(([type, label]) => (
              <div
                key={type}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}
              >
                <span
                  className="calendar-event-dot"
                  style={{ background: EVENT_COLOR[type] }}
                />
                <span style={{ color: "var(--muted-fg)", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
              <span
                style={{
                  width: 12,
                  height: 10,
                  borderRadius: 2,
                  background: "color-mix(in srgb, var(--m-accent) 8%, transparent)",
                  display: "inline-block",
                  border: "1px solid color-mix(in srgb, var(--m-accent) 30%, transparent)",
                }}
              />
              <span style={{ color: "var(--muted-fg)", fontWeight: 500 }}>Danas</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
