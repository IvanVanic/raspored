"use client";

import { useMemo } from "react";
import type { Slot } from "@/data/types";
import { data } from "@/data/schedule";
import { curriculum } from "@/data/curriculum";
import { getSubjectUrgencies } from "@/lib/extraction";
import { SlotCard } from "./SlotCard";

function getTodayDayName(): string | null {
  const jsDay = new Date().getDay();
  if (jsDay >= 1 && jsDay <= 5) return data.days_order[jsDay - 1];
  return null;
}

export function DesktopGrid({ onSlotClick }: { onSlotClick: (slot: Slot) => void }) {
  const timeSlots = data.day_time_slots;
  const todayName = getTodayDayName();

  const urgencies = useMemo(() => getSubjectUrgencies(curriculum), []);

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
                        <SlotCard
                          slot={slot}
                          onClick={() => onSlotClick(slot)}
                          urgency={urgencies.get(slot.subject_id)}
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
