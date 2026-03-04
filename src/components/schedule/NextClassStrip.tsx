"use client";

import { useMemo } from "react";
import { subjectMap } from "@/data/schedule";
import { getNextSlot } from "@/lib/schedule-utils";

const DAY_GENITIVE: Record<string, string> = {
  Ponedjeljak: "u ponedjeljak",
  Utorak: "u utorak",
  Srijeda: "u srijedu",
  "Četvrtak": "u četvrtak",
  Petak: "u petak",
};

export function NextClassStrip({
  currentMinutes,
  onTap,
}: {
  currentMinutes: number;
  onTap?: (slot: import("@/data/types").Slot) => void;
}) {
  const next = useMemo(() => getNextSlot(currentMinutes), [currentMinutes]);

  if (!next) return null;

  const { slot, dayName, minutesUntil } = next;
  const subj = subjectMap.get(slot.subject_id);
  const name = subj ? `${subj.short_name} ${slot.type}` : slot.subject_id;
  const jsDay = new Date().getDay();
  const isWeekday = jsDay >= 1 && jsDay <= 5;
  const todayIdx = isWeekday ? jsDay - 1 : -1;
  const slotDayIdx = ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"].indexOf(dayName);
  const isToday = slotDayIdx === todayIdx;

  let timeLabel: string;
  if (minutesUntil === 0) {
    timeLabel = "u tijeku";
  } else if (isToday && minutesUntil < 60) {
    timeLabel = `za ${minutesUntil} min`;
  } else if (isToday && minutesUntil < 120) {
    const h = Math.floor(minutesUntil / 60);
    const m = minutesUntil % 60;
    timeLabel = m > 0 ? `za ${h}h ${m}min` : `za ${h}h`;
  } else if (!isToday) {
    timeLabel = DAY_GENITIVE[dayName] ?? dayName;
  } else {
    const h = Math.floor(minutesUntil / 60);
    timeLabel = `za ~${h}h`;
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-b border-border-subtle cursor-pointer active:opacity-80 t-fast transition-opacity"
      style={{ background: "color-mix(in srgb, var(--m-tint) 60%, var(--background))" }}
      onClick={() => onTap?.(slot)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap?.(slot); } }}
      role="button"
      tabIndex={0}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: minutesUntil === 0 ? "var(--m-accent)" : "var(--muted-fg)" }}
      />
      <span className="text-[12px] font-semibold text-foreground leading-none">
        {name}
      </span>
      <span className="text-[11px] text-muted-fg leading-none">
        {slot.room}
      </span>
      <span
        className="ml-auto text-[11px] font-semibold tabular-nums"
        style={{ color: minutesUntil === 0 ? "var(--m-text)" : "var(--muted-fg)" }}
      >
        {timeLabel}
      </span>
    </div>
  );
}
