"use client";

import { useMemo } from "react";
import { subjectMap } from "@/data/schedule";
import { getCourseColor } from "@/lib/labels";
import { getNextSlot } from "@/lib/schedule-utils";

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

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
  const name = subj ? `${subj.short_name} (${slot.type})` : slot.subject_id;
  const cc = getCourseColor(slot.subject_id);
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

  const progress = minutesUntil === 0
    ? Math.min(1, Math.max(0, (currentMinutes - parseTime(slot.start)) / (parseTime(slot.end) - parseTime(slot.start))))
    : 0;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle cursor-pointer active:opacity-80 t-fast transition-opacity"
      style={{ position: "relative", background: `color-mix(in srgb, ${cc.tint} 60%, var(--background))` }}
      onClick={() => onTap?.(slot)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap?.(slot); } }}
      role="button"
      tabIndex={0}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: minutesUntil === 0 ? cc.accent : cc.accent, opacity: minutesUntil === 0 ? 1 : 0.5 }}
      />
      <span className="text-[13px] font-semibold leading-none" style={{ color: cc.text }}>
        {name}
      </span>
      <span className="text-[12px] text-muted-fg leading-none">
        {slot.room}
      </span>
      <span
        className="ml-auto text-[11px] font-semibold tabular-nums"
        style={{ color: minutesUntil === 0 ? cc.text : "var(--muted-fg)" }}
      >
        {timeLabel}
      </span>
      {minutesUntil === 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "2px",
            width: `${progress * 100}%`,
            background: cc.accent,
            transition: "width 1s linear",
          }}
        />
      )}
    </div>
  );
}
