"use client";

import { useEffect, useMemo, useRef } from "react";
import { curriculum } from "@/data/curriculum";
import { extractCriticalDates } from "@/lib/extraction";
import { semesterStartLocal, TOTAL_WEEKS } from "@/lib/date-utils";
import { EVENT_COLOR, TEST_TYPES } from "@/lib/labels";
import type { CurriculumEntry, CriticalDate } from "@/data/types";

const CROATIAN_MONTHS = [
  "Sijecanj",
  "Veljaca",
  "Ozujak",
  "Travanj",
  "Svibanj",
  "Lipanj",
  "Srpanj",
  "Kolovoz",
  "Rujan",
  "Listopad",
  "Studeni",
  "Prosinac",
];

const WEEKDAY_HEADERS = ["P", "U", "S", "C", "P", "S", "N"];

const CALENDAR_MONTHS: Array<{ year: number; month: number }> = [
  { year: 2026, month: 2 },
  { year: 2026, month: 3 },
  { year: 2026, month: 4 },
  { year: 2026, month: 5 },
];

const SHORT_EVENT_CODE: Partial<Record<CriticalDate["type"], string>> = {
  kolokvij: "Kol",
  ispit: "Isp",
  predrok: "Pre",
  obrana: "Obr",
  kviz: "Kvz",
  kontrolna: "KZ",
  predaja: "Pr",
  laboratorij: "Lab",
  domaca_zadaca: "DZ",
  zadavanje: "Zad",
};

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function getTeachingWeek(date: Date): number | null {
  const start = semesterStartLocal();
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const targetUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((targetUTC - startUTC) / 86400000);
  const week = Math.floor(days / 7) + 1;
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

function eventColor(event: CriticalDate): string {
  return EVENT_COLOR[event.type];
}

function assessmentEvent(events: CriticalDate[]): CriticalDate | null {
  return events.find((event) => TEST_TYPES.has(event.type) || event.points !== undefined) ?? null;
}

function isDenseExamDay(events: CriticalDate[]): boolean {
  const examLike: Set<CriticalDate["type"]> = new Set(["kolokvij", "ispit", "predrok", "kontrolna", "kviz"]);
  return events.filter((event) => examLike.has(event.type)).length >= 2;
}

function DayPills({ events }: { events: CriticalDate[] }) {
  const maxPills = 2;

  if (events.length === 0) {
    return <div style={{ height: 12 }} />;
  }

  if (events.length > maxPills) {
    const mostUrgent = events.reduce((best, event) => {
      const rank = { critical: 2, approaching: 1, ambient: 0 };
      return rank[event.urgency] > rank[best.urgency] ? event : best;
    }, events[0]);
    const color = eventColor(mostUrgent);

    return (
      <div style={{ display: "flex", justifyContent: "center", height: 12 }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 800,
            color,
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            borderRadius: 4,
            padding: "1px 5px",
            lineHeight: "12px",
          }}
        >
          {events.length}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        height: 12,
      }}
    >
      {events.map((event, index) => {
        const color = eventColor(event);
        const code = SHORT_EVENT_CODE[event.type] ?? event.type.slice(0, 3);
        return (
          <span
            key={`${event.subjectId}-${event.label}-${index}`}
            style={{
              flex: 1,
              height: 12,
              minWidth: 0,
              borderRadius: 4,
              background: `color-mix(in srgb, ${color} 20%, transparent)`,
              color,
              fontSize: 7,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              opacity: 0.9,
            }}
          >
            {code}
          </span>
        );
      })}
    </div>
  );
}

interface MonthGridProps {
  year: number;
  month: number;
  eventMap: Map<string, CriticalDate[]>;
  onDaySelect: (key: string, date: Date) => void;
}

function MonthGrid({ year, month, eventMap, onDaySelect }: MonthGridProps) {
  const days = monthDays(year, month);
  const firstWeekday = isoWeekday(days[0]);

  return (
    <div className="mb-5">
      <div className="calendar-month-header px-0" style={{ paddingTop: 10, paddingBottom: 8 }}>
        {CROATIAN_MONTHS[month]} {year}
      </div>

      <div className="calendar-grid">
        {WEEKDAY_HEADERS.map((label, index) => (
          <div key={`${label}-${index}`} className="calendar-weekday-header">
            {label}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {Array.from({ length: firstWeekday }, (_, index) => (
          <div key={`empty-${index}`} className="calendar-cell" />
        ))}

        {days.map((day) => {
          const key = toKey(day);
          const events = eventMap.get(key) ?? [];
          const today = isToday(day);
          const hasEvents = events.length > 0;
          const weekday = isoWeekday(day);
          const teachingWeek = weekday === 0 ? getTeachingWeek(day) : null;
          const isWeekend = weekday >= 5;
          const denseExam = isDenseExamDay(events);
          const assessment = assessmentEvent(events);
          const assessmentColor = assessment ? eventColor(assessment) : null;

          let cellBg = "transparent";
          if (today) cellBg = "color-mix(in srgb, var(--m-accent) 10%, transparent)";
          if (denseExam && !today) cellBg = "color-mix(in srgb, var(--u-approaching) 7%, transparent)";
          if (assessmentColor && !today) cellBg = `color-mix(in srgb, ${assessmentColor} 5%, transparent)`;

          return (
            <button
              key={key}
              onClick={() => onDaySelect(key, day)}
              className={["calendar-cell", today ? "calendar-today" : ""].join(" ")}
              style={{
                cursor: hasEvents ? "pointer" : "default",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
                paddingTop: 5,
                paddingBottom: 5,
                background: cellBg,
                border: assessmentColor
                  ? `1px solid color-mix(in srgb, ${assessmentColor} 40%, transparent)`
                  : today
                  ? "1px solid color-mix(in srgb, var(--m-accent) 60%, transparent)"
                  : undefined,
                borderBottom: assessmentColor || today ? undefined : "1px solid var(--border-subtle)",
                borderRadius: assessmentColor || today ? 4 : undefined,
                boxShadow: today
                  ? "inset 0 0 0 1px color-mix(in srgb, var(--m-accent) 35%, transparent), 0 0 0 2px color-mix(in srgb, var(--m-accent) 8%, transparent)"
                  : assessmentColor
                  ? `inset 0 0 0 1px color-mix(in srgb, ${assessmentColor} 16%, transparent)`
                  : undefined,
                opacity: isWeekend && !hasEvents ? 0.38 : 1,
                minHeight: 52,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {teachingWeek !== null && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    fontSize: 7,
                    fontWeight: 700,
                    color: "var(--muted-fg)",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    opacity: 0.5,
                  }}
                >
                  T{teachingWeek}
                </span>
              )}

              {denseExam && (
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

              <span
                style={{
                  fontSize: 13,
                  fontWeight: today ? 700 : 500,
                  color: today ? "var(--m-text)" : "var(--foreground)",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {day.getDate()}
              </span>

              <DayPills events={events} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
      {([
        ["kolokvij", "Kolokvij", "Kol"] as const,
        ["ispit", "Ispit", "Isp"] as const,
        ["predrok", "Predrok", "Pre"] as const,
        ["obrana", "Obrana", "Obr"] as const,
        ["kviz", "Kviz", "Kvz"] as const,
        ["kontrolna", "Kontrolna", "KZ"] as const,
      ]).map(([type, label, code]) => (
        <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--muted-fg)" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 12,
              borderRadius: 4,
              background: `color-mix(in srgb, ${EVENT_COLOR[type]} 20%, transparent)`,
              color: EVENT_COLOR[type],
              fontSize: 7,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {code}
          </span>
          <span style={{ fontWeight: 500 }}>{label}</span>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--muted-fg)" }}>
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
        <span style={{ fontWeight: 500 }}>Gust dan</span>
      </div>
    </div>
  );
}

export function SemesterTimeline({
  currentWeek,
  isOpen,
  onClose,
  onNavigateToDate,
}: {
  currentWeek: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDate?: (date: Date) => void;
}) {
  const scrollBodyRef = useRef<HTMLDivElement | null>(null);
  const monthRefs = useRef(new Map<string, HTMLDivElement>());

  const eventMap = useMemo<Map<string, CriticalDate[]>>(() => {
    const dates = extractCriticalDates(curriculum as Record<string, CurriculumEntry>);
    const map = new Map<string, CriticalDate[]>();
    for (const date of dates) {
      if (!date.date) continue;
      const key = toKey(date.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(date);
    }
    return map;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

    requestAnimationFrame(() => {
      const target = monthRefs.current.get(currentMonthKey);
      const body = scrollBodyRef.current;
      if (!target || !body) return;
      body.scrollTop = target.offsetTop - body.offsetTop;
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDaySelect = (key: string, date: Date) => {
    const events = eventMap.get(key) ?? [];
    if (events.length === 0) return;
    onNavigateToDate?.(date);
    onClose();
  };

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
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)" }}>Semestar</span>
            <span
              style={{
                fontSize: 11,
                color: "var(--muted-fg)",
                marginLeft: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              T{currentWeek}/15 - Ozujak-Lipanj 2026
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

        <div ref={scrollBodyRef} style={{ flex: 1, overflowY: "auto", padding: "0 16px 40px" }}>
          {CALENDAR_MONTHS.map(({ year, month }) => (
            <div
              key={`${year}-${month}`}
              ref={(node) => {
                const key = `${year}-${month}`;
                if (node) monthRefs.current.set(key, node);
                else monthRefs.current.delete(key);
              }}
            >
              <MonthGrid
                year={year}
                month={month}
                eventMap={eventMap}
                onDaySelect={handleDaySelect}
              />
            </div>
          ))}

          <CalendarLegend />
        </div>
      </div>
    </>
  );
}
