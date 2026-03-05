"use client";

import { useState, useMemo } from "react";
import { curriculum } from "@/data/curriculum";
import { subjectMap } from "@/data/schedule";
import { extractCriticalDates } from "@/lib/extraction";
import { SEMESTER_START, TOTAL_WEEKS, formatHrDate, getWeekForDate } from "@/lib/date-utils";
import { TYPE_LABEL, EVENT_COLOR, TEST_TYPES } from "@/lib/labels";
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

      <div className="calendar-grid">
        {WEEKDAY_HEADERS.map((label, i) => (
          <div key={i} className="calendar-weekday-header">{label}</div>
        ))}
      </div>

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
                cursor: hasEvents ? "pointer" : "default",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 2,
                paddingTop: 4,
                paddingBottom: 4,
                opacity: isWeekend && !hasEvents ? 0.4 : 1,
              }}
            >
              {/* Teaching week label */}
              {teachingWeek !== null && (
                <span style={{
                  position: "absolute",
                  top: 1,
                  right: 2,
                  fontSize: 7,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  color: "var(--muted-fg)",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  opacity: 0.6,
                }}>
                  T{teachingWeek}
                </span>
              )}

              {/* Date number */}
              <span style={{
                fontSize: 12,
                fontWeight: today ? 700 : selected ? 600 : 500,
                color: today
                  ? "var(--m-text)"
                  : selected
                  ? "var(--foreground)"
                  : "var(--foreground)",
                lineHeight: 1,
              }}>
                {day.getDate()}
              </span>

              {/* Event dots */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                minHeight: 7,
                flexWrap: "nowrap",
                overflow: "hidden",
              }}>
                {events.slice(0, 3).map((event, i) => (
                  <span
                    key={i}
                    className="calendar-event-dot"
                    style={{
                      background: EVENT_COLOR[event.type],
                      width: 5,
                      height: 5,
                      boxShadow: selected ? `0 0 4px ${EVENT_COLOR[event.type]}99` : undefined,
                    }}
                  />
                ))}
                {events.length > 3 && (
                  <span style={{
                    fontSize: 7,
                    color: "var(--muted-fg)",
                    lineHeight: "5px",
                    fontWeight: 700,
                  }}>+</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
        margin: "0 0 12px 0",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--card)",
        animation: "row-in 150ms var(--ease-out-expo) both",
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--muted)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-foreground tabular-nums">
            {formatHrDate(selectedDate)}
          </span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums"
            style={{
              background: isCurrentWeek
                ? "color-mix(in srgb, var(--m-accent) 20%, transparent)"
                : "transparent",
              color: isCurrentWeek ? "var(--m-text)" : "var(--muted-fg)",
            }}
          >
            T{week}{isCurrentWeek ? " · Sada" : ""}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-fg hover:text-foreground t-fast transition-colors"
          style={{ fontSize: 16, lineHeight: 1, padding: "2px 4px" }}
        >
          ×
        </button>
      </div>

      {/* Event list */}
      <div className="px-3 py-2.5">
        {events.length === 0 ? (
          <p className="text-[11px] text-muted-fg">Nema rokova na ovaj datum.</p>
        ) : (
          <div className="space-y-2">
            {events.map((event, i) => {
              const subj = subjectMap.get(event.subjectId);
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5"
                  onClick={() => TEST_TYPES.has(event.type) && onTestTap?.(event)}
                  style={{
                    paddingLeft: 9,
                    borderLeft: `3px solid ${EVENT_COLOR[event.type]}`,
                    cursor: TEST_TYPES.has(event.type) && onTestTap ? "pointer" : undefined,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[12px] font-semibold text-foreground">
                        {TYPE_LABEL[event.type]}
                      </span>
                      <span className="text-[11px] text-muted-fg truncate">
                        {subj?.short_name ?? event.subjectId}
                      </span>
                    </div>
                    {subj?.full_name && (
                      <p className="text-[10px] text-muted-fg mt-0.5 truncate opacity-70">
                        {subj.full_name}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 tabular-nums"
                    style={{
                      background: `color-mix(in srgb, ${EVENT_COLOR[event.type]} 15%, transparent)`,
                      color: EVENT_COLOR[event.type],
                    }}
                  >
                    {TYPE_LABEL[event.type].toUpperCase().slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2" style={{ flexShrink: 0 }}>
          <div className="w-10 h-1 rounded-full bg-muted-fg/30" />
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-4 pb-3" style={{ flexShrink: 0 }}>
          <div>
            <span className="text-[13px] font-bold text-foreground">Semestar</span>
            <span className="text-[11px] text-muted-fg ml-2 uppercase tracking-[0.06em]">Ožujak &ndash; Lipanj 2026</span>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] font-semibold text-muted-fg hover:text-foreground t-fast transition-colors px-2 py-1 rounded-md hover:bg-muted"
          >
            Zatvori
          </button>
        </div>

        {/* Scrollable area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 32px" }}>

          {/* Event detail panel */}
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

          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 18px",
              marginTop: 8,
              paddingTop: 10,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {([
              ["kolokvij", "Kolokvij"],
              ["ispit", "Ispit"],
              ["obrana", "Obrana"],
              ["kontrolna", "Ostalo"],
            ] as const).map(([type, label]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
                <span
                  className="calendar-event-dot"
                  style={{ background: EVENT_COLOR[type], width: 6, height: 6 }}
                />
                <span style={{ color: "var(--muted-fg)", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
              <span style={{
                width: 13,
                height: 11,
                borderRadius: 3,
                background: "color-mix(in srgb, var(--m-accent) 10%, transparent)",
                display: "inline-block",
                border: "1px solid color-mix(in srgb, var(--m-accent) 35%, transparent)",
              }} />
              <span style={{ color: "var(--muted-fg)", fontWeight: 500 }}>Danas</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
              <span style={{
                width: 13,
                height: 11,
                borderRadius: 3,
                display: "inline-block",
                border: "1.5px solid var(--foreground)",
                background: "color-mix(in srgb, var(--foreground) 8%, transparent)",
              }} />
              <span style={{ color: "var(--muted-fg)", fontWeight: 500 }}>Odabrano</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
