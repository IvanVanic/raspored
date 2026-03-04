"use client";

import { useMemo } from "react";
import type { Slot } from "@/data/types";
import { data } from "@/data/schedule";
import { curriculum } from "@/data/curriculum";
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

export function DayView({
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

  const urgencies = useMemo(() => getSubjectUrgencies(curriculum), []);

  const jsDay = new Date().getDay();
  const todayIdx = jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : -1;
  const timeStatuses = getTimeStatuses(slots, dayIdx === todayIdx);

  return (
    <div>
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

      <div className="px-4 pt-3 pb-4">
        {slots.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-fg text-sm">Nema nastave</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {slots.map((slot, i) => (
              <div key={`${dayIdx}-${i}`} className="flex gap-0">
                <div className="w-14 shrink-0 pt-2.5 pr-3 text-right border-r border-border-subtle">
                  <div className="text-[11px] font-semibold text-foreground tabular-nums leading-none">
                    {slot.start}
                  </div>
                  <div className="text-[10px] text-muted-fg/50 tabular-nums leading-none mt-1">
                    {slot.end}
                  </div>
                </div>
                <div className="flex-1 pl-2">
                  <SlotCard
                    slot={slot}
                    showProf
                    onClick={() => onSlotClick(slot)}
                    urgency={urgencies.get(slot.subject_id)}
                    timeStatus={timeStatuses[i]}
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
