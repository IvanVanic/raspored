"use client";

import { useMemo } from "react";
import type { Slot } from "@/data/types";
import { data, getSlotsForDayIdx } from "@/data/schedule";
import { curriculum } from "@/data/curriculum";
import { getCurrentWeek } from "@/lib/date-utils";
import { getSubjectUrgencies } from "@/lib/extraction";
import { SlotCard } from "./SlotCard";

function getTodayDayName(): string | null {
  const jsDay = new Date().getDay();
  if (jsDay >= 1 && jsDay <= 5) return data.days_order[jsDay - 1];
  return null;
}

function getSlotTopic(subjectId: string, slotType: "P" | "V", currentWeek: number): string | undefined {
  const curr = curriculum[subjectId.toUpperCase()];
  if (!curr) return undefined;
  const weekData = curr.weeks[currentWeek - 1];
  if (!weekData) return undefined;
  return slotType === "P" ? weekData.lecture : weekData.exercise;
}

export function DesktopGrid({ viewingWeek, onSlotClick }: { viewingWeek: number; onSlotClick: (slot: Slot) => void }) {
  const timeSlots = data.day_time_slots;
  const currentWeek = getCurrentWeek();
  const isCurrentWeek = viewingWeek === currentWeek;
  const todayName = isCurrentWeek ? getTodayDayName() : null;

  const urgencies = useMemo(() => getSubjectUrgencies(curriculum), []);

  const scheduleGrid = useMemo(() => {
    const grid: Record<string, Record<string, Slot | null>> = {};
    // Collect all unique start times (regular + override slots)
    const allStarts = new Set(timeSlots.map((ts) => ts.start));
    for (let i = 0; i < data.days_order.length; i++) {
      for (const s of getSlotsForDayIdx(i, viewingWeek)) allStarts.add(s.start);
    }
    const sortedStarts = [...allStarts].sort();

    for (const start of sortedStarts) {
      grid[start] = {};
      for (let i = 0; i < data.days_order.length; i++) {
        const day = data.days_order[i];
        const slots = getSlotsForDayIdx(i, viewingWeek);
        grid[start][day] = slots.find((s) => s.start === start) ?? null;
      }
    }
    return { grid, rows: sortedStarts };
  }, [timeSlots, viewingWeek]);

  // Build end-time lookup: override slots may have non-standard end times
  const endTimeMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const ts of timeSlots) m[ts.start] = ts.end;
    for (let i = 0; i < data.days_order.length; i++) {
      for (const s of getSlotsForDayIdx(i, viewingWeek)) m[s.start] = s.end;
    }
    return m;
  }, [timeSlots, viewingWeek]);

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
            {scheduleGrid.rows.map((start) => (
              <tr key={start} className="h-[72px]">
                <td className="time-col p-2.5 align-top">
                  <div className="text-[11px] font-semibold text-foreground tabular-nums leading-none">
                    {start}
                  </div>
                  <div className="text-[10px] text-muted-fg/60 tabular-nums leading-none mt-0.5">
                    {endTimeMap[start] ?? ""}
                  </div>
                </td>
                {data.days_order.map((day) => {
                  const slot = scheduleGrid.grid[start]?.[day] ?? null;
                  return (
                    <td
                      key={day}
                      className={`p-1 align-top${day === todayName ? " today-col" : ""}`}
                    >
                      {slot && (
                        <SlotCard
                          slot={slot}
                          onClick={() => onSlotClick(slot)}
                          urgency={urgencies.get(slot.subject_id)}
                          topic={getSlotTopic(slot.subject_id, slot.type as "P" | "V", viewingWeek)}
                        />
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
