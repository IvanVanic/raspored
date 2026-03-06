"use client";

import { useMemo, useRef } from "react";
import type { Slot } from "@/data/types";
import { data, getSlotsForDayIdx, getOverrideNote } from "@/data/schedule";
import { curriculum } from "@/data/curriculum";
import { getCurrentWeek } from "@/lib/date-utils";
import { getSubjectUrgencies } from "@/lib/extraction";
import { SlotCard } from "./SlotCard";
import type { TimeStatus } from "./SlotCard";

const DAY_ABBR: Record<string, string> = {
  Ponedjeljak: "PON",
  Utorak: "UTO",
  Srijeda: "SRI",
  "Četvrtak": "ČET",
  Petak: "PET",
};

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getTimeStatuses(slots: Slot[], isToday: boolean): TimeStatus[] {
  if (!isToday) return slots.map(() => null);
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  let foundNext = false;
  return slots.map((slot) => {
    const start = parseTime(slot.start);
    const end = parseTime(slot.end);
    if (mins >= start && mins < end) return "now";
    if (!foundNext && mins < start) {
      foundNext = true;
      return "next";
    }
    return null;
  });
}

/** Returns the topic string for a slot based on current week and slot type. */
function getSlotTopic(subjectId: string, slotType: "P" | "V", currentWeek: number): string | undefined {
  const curr = curriculum[subjectId.toUpperCase()];
  if (!curr) return undefined;
  const weekData = curr.weeks[currentWeek - 1];
  if (!weekData) return undefined;
  return slotType === "P" ? weekData.lecture : weekData.exercise;
}

export function DayView({
  dayIdx,
  setDayIdx,
  viewingWeek,
  onSlotClick,
}: {
  dayIdx: number;
  setDayIdx: (i: number) => void;
  viewingWeek: number;
  onSlotClick: (slot: Slot) => void;
}) {
  const dayName = data.days_order[dayIdx];
  const slots = getSlotsForDayIdx(dayIdx, viewingWeek);
  const overrideNote = getOverrideNote(dayIdx, viewingWeek);
  const currentWeek = getCurrentWeek();
  const isCurrentWeek = viewingWeek === currentWeek;

  const urgencies = useMemo(() => getSubjectUrgencies(curriculum), []);

  const jsDay = new Date().getDay();
  const todayIdx = jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : -1;
  // Only show time statuses (now/next) when viewing current week
  const timeStatuses = getTimeStatuses(slots, isCurrentWeek && dayIdx === todayIdx);

  // Swipe handling
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0 && dayIdx < data.days_order.length - 1) {
      setDayIdx(dayIdx + 1);
    } else if (dx > 0 && dayIdx > 0) {
      setDayIdx(dayIdx - 1);
    }
  };

  return (
    <div>
      {/* Day tabs */}
      <div className="flex border-b border-border">
        {data.days_order.map((day, i) => (
          <button
            key={day}
            onClick={() => setDayIdx(i)}
            className={[
              "flex-1 py-3.5 text-[11px] font-bold tracking-[0.06em] uppercase t-fast transition-[color,box-shadow]",
              i === dayIdx
                ? "day-tab-active text-foreground"
                : "text-muted-fg hover:text-foreground",
            ].join(" ")}
          >
            {DAY_ABBR[day]}
          </button>
        ))}
      </div>

      {/* Swipeable content */}
      <div
        className="px-4 pt-4 pb-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {overrideNote && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[12px] text-amber-400 leading-snug">
            {overrideNote}
          </div>
        )}
        {slots.length === 0 ? (
          <div className="null-state">
            <p>Nema nastave</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {slots.map((slot, i) => {
              const topic = getSlotTopic(slot.subject_id, slot.type as "P" | "V", viewingWeek);
              return (
                <div key={`${dayIdx}-${i}`} className="flex gap-0">
                  <div className="w-16 shrink-0 pt-3 pr-3 text-right border-r border-border-subtle">
                    <div className="text-[12px] font-bold text-foreground tabular-nums leading-none">
                      {slot.start}
                    </div>
                    <div className="text-[11px] text-muted-fg/40 tabular-nums leading-none mt-1.5">
                      {slot.end}
                    </div>
                  </div>
                  <div className="flex-1 pl-3 min-w-0">
                    <SlotCard
                      slot={slot}
                      showProf
                      onClick={() => onSlotClick(slot)}
                      urgency={urgencies.get(slot.subject_id)}
                      timeStatus={timeStatuses[i]}
                      topic={topic}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
