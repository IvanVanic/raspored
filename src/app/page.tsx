"use client";

import { useState, useMemo, useEffect } from "react";
import scheduleData from "@/data/schedule-data.json";
import { curriculum, getCurrentWeek } from "@/data/curriculum";
import type { ScheduleData, Slot } from "@/data/types";

const data = scheduleData as unknown as ScheduleData;

// ── Constants & helpers ───────────────────────────────────────────

const DAY_ABBR: Record<string, string> = {
  Ponedjeljak: "PON",
  Utorak: "UTO",
  Srijeda: "SRI",
  "Četvrtak": "ČET",
  Petak: "PET",
};

const subjectMap = new Map(data.subjects.map((s) => [s.id, s]));

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  if (jsDay >= 1 && jsDay <= 5) return jsDay - 1;
  return 0;
}

function getTodayDayName(): string | null {
  const jsDay = new Date().getDay();
  if (jsDay >= 1 && jsDay <= 5) return data.days_order[jsDay - 1];
  return null;
}

// ── SlotCard ──────────────────────────────────────────────────────

function SlotCard({
  slot,
  showProf,
  onClick,
}: {
  slot: Slot;
  showProf?: boolean;
  onClick?: () => void;
}) {
  const subj = subjectMap.get(slot.subject_id);
  const label = subj ? `${subj.short_name} (${subj.semester})` : slot.subject_id;
  const isExercise = slot.type === "V";
  const base = slot.status === "M" ? "slot-card-m" : "slot-card-e";

  return (
    <div
      onClick={onClick}
      className={`${base}${isExercise ? " exercise" : ""} slot-cell cursor-pointer active:scale-[0.98] t-base transition-[filter,transform]`}
    >
      <span
        className={`${slot.status === "M" ? "slot-subject-m" : "slot-subject-e"} text-[12px] font-semibold leading-snug tracking-[-0.01em]`}
      >
        {label}
      </span>
      <div className="text-muted-fg mt-0.5 text-[11px] leading-tight flex items-center">
        <span className="font-medium tabular-nums">{slot.room}</span>
        <span className="meta-sep" aria-hidden="true" />
        <span>{slot.type}{slot.group ? ` (${slot.group})` : ""}</span>
      </div>
      {showProf && (
        <div className="text-muted-fg mt-0.5 text-[11px] leading-tight">
          {slot.prof}
        </div>
      )}
    </div>
  );
}

// ── CourseModal ────────────────────────────────────────────────────

function CourseModal({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const subj = subjectMap.get(slot.subject_id);
  const curr = curriculum[slot.subject_id];
  const currentWeek = getCurrentWeek();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-fg/30" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <h2 className="text-base font-bold text-foreground">
            {subj?.full_name ?? slot.subject_id}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-[12px] text-muted-fg">
            <span>{slot.type === "P" ? "Predavanje" : "Vježbe"}</span>
            <span className="meta-sep" aria-hidden="true" />
            <span>{slot.prof}</span>
            <span className="meta-sep" aria-hidden="true" />
            <span>Prostorija {slot.room}</span>
          </div>
          {subj && (
            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-fg">
              <span>Semestar {subj.semester}</span>
              {slot.group && (
                <>
                  <span className="meta-sep" aria-hidden="true" />
                  <span>Grupa {slot.group}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Curriculum weeks */}
        {curr && (
          <div className="px-5 py-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
              Nastavni plan
            </h3>
            <div className="space-y-1">
              {curr.weeks.map((w) => (
                <div
                  key={w.week}
                  className={`flex items-start gap-3 py-1.5 px-2 rounded-md text-[12px] ${
                    w.week === currentWeek
                      ? "bg-m-tint-strong text-foreground"
                      : "text-muted-fg"
                  }`}
                >
                  <span className="w-6 shrink-0 text-right font-semibold tabular-nums">
                    {w.week}.
                  </span>
                  <div className="min-w-0">
                    <div className={w.week === currentWeek ? "text-m-text font-medium" : ""}>
                      {w.lecture}
                    </div>
                    {w.exercise && w.exercise !== w.lecture && (
                      <div className="text-[11px] opacity-70 mt-0.5">V: {w.exercise}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grading */}
        {curr && curr.grading.length > 0 && (
          <div className="px-5 py-3 border-t border-border-subtle">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
              Vrednovanje
            </h3>
            <div className="space-y-1">
              {curr.grading.map((g, i) => (
                <div key={i} className="flex justify-between text-[12px]">
                  <span className="text-foreground">{g.component}</span>
                  <span className="text-muted-fg tabular-nums">{g.maxPoints} bod.</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams */}
        {curr && curr.exams.length > 0 && (
          <div className="px-5 py-3 border-t border-border-subtle">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
              Ispitni rokovi
            </h3>
            <div className="flex flex-wrap gap-2">
              {curr.exams.map((e, i) => (
                <span
                  key={i}
                  className="text-[12px] text-foreground tabular-nums bg-muted px-2 py-0.5 rounded"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Close button desktop */}
        <div className="hidden md:block absolute top-3 right-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-fg hover:text-foreground hover:bg-muted t-fast transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ── DayView (mobile) ──────────────────────────────────────────────

function DayView({
  dayIdx,
  setDayIdx,
  onSlotClick,
}: {
  dayIdx: number;
  setDayIdx: (i: number) => void;
  onSlotClick: (slot: Slot) => void;
}) {
  const dayName = data.days_order[dayIdx];
  const slots = data.personal_schedule[dayName] ?? [];

  return (
    <div>
      {/* Day tabs */}
      <div className="flex border-b border-border">
        {data.days_order.map((day, i) => (
          <button
            key={day}
            onClick={() => setDayIdx(i)}
            className={[
              "flex-1 py-3 text-[11px] font-semibold tracking-[0.06em] uppercase t-fast transition-[color,box-shadow]",
              i === dayIdx
                ? "day-tab-active text-foreground"
                : "text-muted-fg hover:text-foreground",
            ].join(" ")}
          >
            {DAY_ABBR[day]}
          </button>
        ))}
      </div>

      {/* Slot list */}
      <div className="px-4 pt-3 pb-4">
        {slots.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-fg text-sm">Nema nastave</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {slots.map((slot, i) => (
              <div key={`${dayIdx}-${i}`} className="flex gap-0">
                {/* Time column */}
                <div className="w-14 shrink-0 pt-2.5 pr-3 text-right border-r border-border-subtle">
                  <div className="text-[11px] font-semibold text-foreground tabular-nums leading-none">
                    {slot.start}
                  </div>
                  <div className="text-[10px] text-muted-fg/50 tabular-nums leading-none mt-1">
                    {slot.end}
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 pl-2">
                  <SlotCard
                    slot={slot}
                    showProf
                    onClick={() => onSlotClick(slot)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DesktopGrid ────────────────────────────────────────────────────

function DesktopGrid({ onSlotClick }: { onSlotClick: (slot: Slot) => void }) {
  const timeSlots = data.day_time_slots;
  const todayName = getTodayDayName();

  const scheduleGrid = useMemo(() => {
    const grid: Record<string, Record<string, Slot | null>> = {};
    for (const ts of timeSlots) {
      grid[ts.start] = {};
      for (const day of data.days_order) {
        const slots = data.personal_schedule[day] ?? [];
        const found = slots.find((s) => s.start === ts.start) ?? null;
        grid[ts.start][day] = found;
      }
    }
    return grid;
  }, [timeSlots]);

  return (
    <div className="overflow-x-auto px-4 pt-4 pb-6">
      <div className="rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="schedule-table min-w-[680px] bg-card">
          <thead>
            <tr>
              <th className="time-col p-3 text-left">
                <span className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-medium">
                  Sat
                </span>
              </th>
              {data.days_order.map((day) => (
                <th
                  key={day}
                  className={`p-3 text-left text-[11px] font-semibold tracking-[0.05em] uppercase text-muted-fg${day === todayName ? " today-col" : ""}`}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((ts) => (
              <tr key={ts.start} className="h-[64px]">
                <td className="time-col p-2.5 align-top">
                  <div className="text-[11px] font-semibold text-foreground tabular-nums leading-none">
                    {ts.start}
                  </div>
                  <div className="text-[10px] text-muted-fg/60 tabular-nums leading-none mt-0.5">
                    {ts.end}
                  </div>
                </td>
                {data.days_order.map((day) => {
                  const slot = scheduleGrid[ts.start]?.[day] ?? null;
                  return (
                    <td
                      key={day}
                      className={`p-1 align-top${day === todayName ? " today-col" : ""}`}
                    >
                      {slot && (
                        <SlotCard slot={slot} onClick={() => onSlotClick(slot)} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────

export default function Home() {
  const [dayIdx, setDayIdx] = useState(getTodayIndex);
  const [modalSlot, setModalSlot] = useState<Slot | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const currentWeek = getCurrentWeek();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border"
        style={{ boxShadow: "var(--shadow-header)" }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[13px] font-bold tracking-[-0.02em] text-foreground leading-none">
              Raspored
            </h1>
            <p className="text-[11px] text-muted-fg mt-0.5 tracking-[0.01em]">
              FIDIT &middot; {data.meta.year}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-sm"
                  style={{ background: "var(--m-accent)" }}
                />
                <span className="text-[10px] text-muted-fg">Obvezno</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-sm"
                  style={{ background: "var(--e-accent)" }}
                />
                <span className="text-[10px] text-muted-fg">Fleksibilno</span>
              </div>
            </div>
            {currentWeek >= 1 && currentWeek <= 15 && (
              <span className="week-badge">T{currentWeek}/15</span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile */}
      <div className="md:hidden">
        <DayView
          dayIdx={dayIdx}
          setDayIdx={setDayIdx}
          onSlotClick={setModalSlot}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopGrid onSlotClick={setModalSlot} />
      </div>

      {/* Modal */}
      {modalSlot && (
        <CourseModal slot={modalSlot} onClose={() => setModalSlot(null)} />
      )}

      <div className="pb-10" />
    </div>
  );
}
