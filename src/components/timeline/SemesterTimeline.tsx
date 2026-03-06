"use client";

import { useState, useMemo } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap } from "@/data/schedule";
import { extractCriticalDates } from "@/lib/extraction";
import { SEMESTER_START, TOTAL_WEEKS, formatHrDate, getWeekForDate } from "@/lib/date-utils";
import { TYPE_LABEL, EVENT_COLOR, TEST_TYPES, getCourseColor, COURSE_COLOR } from "@/lib/labels";
import type { CurriculumEntry, CriticalDate } from "@/data/types";

const CROATIAN_MONTHS = ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"];

const WEEKDAY_HEADERS = ["P", "U", "S", "Č", "P", "S", "N"];

const CALENDAR_MONTHS: Array<{ year: number; month: number }> = [
  { year: 2026, month: 2 },
  { year: 2026, month: 3 },
  { year: 2026, month: 4 },
  { year: 2026, month: 5 },
];

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function getTeachingWeek(date: Date): number | null {
  const start = new Date(SEMESTER_START);
  const diff = date.getTime() - start.getTime();
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  if (week >= 1 && week <= TOTAL_WEEKS) return week;
  return null;
}

function isoWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

/** Returns a stable accent color for a subject, falling back to event-type color. */
function resolveEventColor(event: CriticalDate): string {
  const cc = COURSE_COLOR[event.subjectId];
  return cc ? cc.accent : EVENT_COLOR[event.type];
}

// ─── Day event indicators ─────────────────────────────────────────────────────
// Each day cell shows colored pill-bars instead of dots.
// Up to 3 events get individual bars; 4+ collapses into a "+N" overflow pill.

interface DayPillsProps {
  events: CriticalDate[];
  selected: boolean;
}

function DayPills({ events, selected }: DayPillsProps) {
  const MAX_BARS = 3;
  const shown = events.slice(0, MAX_BARS);
  const overflow = events.length - MAX_BARS;

  if (events.length === 0) {
    // Reserve the bar-row height so all cells align
    return <div style={{ height: 6 }} />;
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        height: 6,
      }}
    >
      {shown.map((ev, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: 6,
            minWidth: 0,
            borderRadius: 3,
            background: resolveEventColor(ev),
            opacity: selected ? 1 : 0.85,
            boxShadow: selected ? `0 0 6px ${resolveEventColor(ev)}88` : undefined,
          }}
        />
      ))}
      {overflow > 0 && (
        <span
          style={{
            fontSize: 7,
            fontWeight: 800,
            color: "var(--muted-fg)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            flexShrink: 0,
          }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

// ─── Dense-day "provjera" indicator ──────────────────────────────────────────
// If a day has 2+ exam-class events we mark it with a faint amber halo so it
// reads as a "heavy" day even before the user taps.

function isDenseExamDay(events: CriticalDate[]): boolean {
  const examLike: Set<CriticalDate["type"]> = new Set(["kolokvij", "ispit", "kontrolna", "kviz"]);
  return events.filter(e => examLike.has(e.type)).length >= 2;
}

// ─── Month grid ───────────────────────────────────────────────────────────────

interface MonthGridProps {
  year: number;
  month: number;
  eventMap: Map<string, CriticalDate[]>;
  selectedKey: string | null;
  onDaySelect: (key: string, date: Date) => void;
}

function MonthGrid({ year, month, eventMap, selectedKey, onDaySelect }: MonthGridProps) {
  const days = monthDays(year, month);
  const firstWeekday = isoWeekday(days[0]);

  return (
    <div className="mb-5">
      <div
        className="calendar-month-header px-0"
        style={{ paddingTop: 10, paddingBottom: 8, letterSpacing: "-0.01em" }}
      >
        {CROATIAN_MONTHS[month]} {year}
      </div>

      {/* Weekday header row */}
      <div className="calendar-grid">
        {WEEKDAY_HEADERS.map((label, i) => (
          <div key={i} className="calendar-weekday-header">{label}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="calendar-grid">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`empty-${i}`} className="calendar-cell" />
        ))}

        {days.map((day) => {
          const key = toKey(day);
          const events = eventMap.get(key) ?? [];
          const today = isToday(day);
          const selected = selectedKey === key;
          const hasEvents = events.length > 0;
          const weekday = isoWeekday(day);
          const teachingWeek = weekday === 0 ? getTeachingWeek(day) : null;
          const isWeekend = weekday >= 5;
          const denseExam = isDenseExamDay(events);

          // Build background: today tint > dense exam tint > selected tint > default
          let cellBg = "transparent";
          if (today) cellBg = "color-mix(in srgb, var(--m-accent) 10%, transparent)";
          if (denseExam && !today) cellBg = "color-mix(in srgb, var(--u-approaching) 7%, transparent)";
          if (selected) cellBg = "color-mix(in srgb, var(--foreground) 10%, transparent)";

          return (
            <button
              key={key}
              onClick={() => onDaySelect(key, day)}
              className={[
                "calendar-cell",
                today ? "calendar-today" : "",
                selected ? "calendar-selected" : "",
              ].join(" ")}
              style={{
                // All cells are buttons and feel tappable — cursor always pointer
                cursor: "pointer",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
                paddingTop: 5,
                paddingBottom: 5,
                background: cellBg,
                opacity: isWeekend && !hasEvents ? 0.38 : 1,
                minHeight: 44, // comfortable tap target
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Teaching week label — top-right micro text */}
              {teachingWeek !== null && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    fontSize: 7,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    color: "var(--muted-fg)",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    opacity: 0.5,
                  }}
                >
                  T{teachingWeek}
                </span>
              )}

              {/* Dense exam day halo ring — amber inset ring */}
              {denseExam && !selected && (
                <span
                  style={{
                    position: "absolute",
                    inset: 1,
                    borderRadius: 3,
                    border: "1px solid color-mix(in srgb, var(--u-approaching) 40%, transparent)",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Date number */}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: today ? 700 : selected ? 600 : 500,
                  color: today
                    ? "var(--m-text)"
                    : selected
                    ? "var(--foreground)"
                    : "var(--foreground)",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {day.getDate()}
              </span>

              {/* Event pill bars — always rendered to keep cell height stable */}
              <DayPills events={events} selected={selected} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Event detail panel ───────────────────────────────────────────────────────

interface EventDetailPanelProps {
  selectedDate: Date;
  events: CriticalDate[];
  currentWeek: number;
  onClose: () => void;
  onTestTap?: (event: CriticalDate) => void;
}

function EventDetailPanel({ selectedDate, events, currentWeek, onClose, onTestTap }: EventDetailPanelProps) {
  const week = getWeekForDate(selectedDate);
  const isCurrentWeek = week === currentWeek;

  return (
    <div
      style={{
        margin: "0 0 14px 0",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--card)",
        animation: "row-in 150ms var(--ease-out-expo) both",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px 10px 14px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--foreground)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.01em",
            }}
          >
            {formatHrDate(selectedDate)}
          </span>
          {/* Week badge — purely informational, styled distinctly from interactive chips */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 6,
              fontVariantNumeric: "tabular-nums",
              background: isCurrentWeek
                ? "color-mix(in srgb, var(--m-accent) 20%, transparent)"
                : "color-mix(in srgb, var(--muted-fg) 12%, transparent)",
              color: isCurrentWeek ? "var(--m-text)" : "var(--muted-fg)",
              letterSpacing: "0.02em",
              userSelect: "none",
            }}
          >
            T{week}{isCurrentWeek ? " · Sada" : ""}
          </span>
        </div>

        {/* Close — explicit label so it reads as an action, not a decoration */}
        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "var(--muted-fg)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 6,
            lineHeight: 1,
          }}
          aria-label="Zatvori detalj"
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>×</span>
        </button>
      </div>

      {/* Event list */}
      <div style={{ padding: "10px 14px 12px" }}>
        {events.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--muted-fg)", margin: 0 }}>
            Nema rokova na ovaj datum.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((event, i) => {
              const subj = subjectMap.get(event.subjectId);
              const cc = getCourseColor(event.subjectId);
              const isTest = TEST_TYPES.has(event.type);
              const barColor = resolveEventColor(event);

              return (
                <button
                  key={i}
                  onClick={() => isTest && onTestTap?.(event)}
                  disabled={!isTest || !onTestTap}
                  style={{
                    all: "unset",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: 6,
                    background: `color-mix(in srgb, ${barColor} 6%, transparent)`,
                    padding: "8px 10px",
                    cursor: isTest && onTestTap ? "pointer" : "default",
                    boxSizing: "border-box",
                    width: "100%",
                  }}
                >
                  {/* Colored left stripe — the visual accent bar */}
                  <span
                    style={{
                      width: 3,
                      minWidth: 3,
                      alignSelf: "stretch",
                      borderRadius: 2,
                      background: barColor,
                      flexShrink: 0,
                    }}
                  />

                  {/* Text block */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--foreground)",
                          lineHeight: 1.2,
                        }}
                      >
                        {TYPE_LABEL[event.type]}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: cc.text,
                          lineHeight: 1.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 120,
                        }}
                      >
                        {subj?.short_name ?? event.subjectId}
                      </span>
                    </div>
                    {subj?.full_name && (
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--muted-fg)",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          opacity: 0.7,
                        }}
                      >
                        {subj.full_name}
                      </p>
                    )}
                  </div>

                  {/* Tap-to-detail affordance — only for test types */}
                  {isTest && onTestTap && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: barColor,
                        background: `color-mix(in srgb, ${barColor} 14%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${barColor} 30%, transparent)`,
                        padding: "3px 8px",
                        borderRadius: 5,
                        flexShrink: 0,
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}
                    >
                      Otvori
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function CalendarLegend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px 20px",
        marginTop: 12,
        paddingTop: 12,
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {/* Event type legend — pill bars to match the calendar cells */}
      {([
        ["kolokvij", "Kolokvij"] as const,
        ["ispit", "Ispit"] as const,
        ["obrana", "Obrana"] as const,
        ["kontrolna", "Ostalo"] as const,
      ]).map(([type, label]) => (
        <div
          key={type}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--muted-fg)" }}
        >
          <span
            style={{
              display: "inline-block",
              width: 18,
              height: 6,
              borderRadius: 3,
              background: EVENT_COLOR[type],
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 500 }}>{label}</span>
        </div>
      ))}

      {/* Today indicator */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--muted-fg)" }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: 4,
            background: "color-mix(in srgb, var(--m-accent) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--m-accent) 40%, transparent)",
            fontSize: 9,
            fontWeight: 700,
            color: "var(--m-text)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {new Date().getDate()}
        </span>
        <span style={{ fontWeight: 500 }}>Danas</span>
      </div>

      {/* Dense exam day indicator */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--muted-fg)" }}
      >
        <span
          style={{
            display: "inline-flex",
            width: 18,
            height: 18,
            borderRadius: 4,
            border: "1px solid color-mix(in srgb, var(--u-approaching) 50%, transparent)",
            background: "color-mix(in srgb, var(--u-approaching) 8%, transparent)",
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 500 }}>Provjera</span>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function SemesterTimeline({
  currentWeek,
  isOpen,
  onClose,
  onTestTap,
}: {
  currentWeek: number;
  isOpen: boolean;
  onClose: () => void;
  onTestTap?: (event: CriticalDate) => void;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
      setSelectedKey(null);
      setSelectedDate(null);
    } else {
      setSelectedKey(key);
      setSelectedDate(date);
    }
  };

  const closeDetail = () => {
    setSelectedKey(null);
    setSelectedDate(null);
  };

  const selectedEvents = selectedKey ? (eventMap.get(selectedKey) ?? []) : [];

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 45 }} />

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
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 6, flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "color-mix(in srgb, var(--muted-fg) 35%, transparent)",
            }}
          />
        </div>

        {/* Sheet title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px 14px",
            flexShrink: 0,
          }}
        >
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
              Semestar
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--muted-fg)",
                marginLeft: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Ožujak&ndash;Lipanj 2026
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted-fg)",
              background: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "5px 12px",
              cursor: "pointer",
              lineHeight: 1,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Zatvori
          </button>
        </div>

        {/* Scrollable calendar body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 40px" }}>

          {/* Sticky day-detail panel */}
          {selectedKey && selectedDate && (
            <EventDetailPanel
              selectedDate={selectedDate}
              events={selectedEvents}
              currentWeek={currentWeek}
              onClose={closeDetail}
              onTestTap={onTestTap}
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

          <CalendarLegend />
        </div>
      </div>
    </>
  );
}
