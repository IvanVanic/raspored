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
  const shortName = subj?.short_name ?? slot.subject_id;
  const cc = getCourseColor(slot.subject_id);
  const isLive = minutesUntil === 0;

  const jsDay = new Date().getDay();
  const isWeekday = jsDay >= 1 && jsDay <= 5;
  const todayIdx = isWeekday ? jsDay - 1 : -1;
  const slotDayIdx = ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"].indexOf(dayName);
  const isToday = slotDayIdx === todayIdx;

  let timeLabel: string;
  if (isLive) {
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

  const progress = isLive
    ? Math.min(1, Math.max(0,
        (currentMinutes - parseTime(slot.start)) /
        (parseTime(slot.end) - parseTime(slot.start))
      ))
    : 0;

  return (
    <button
      type="button"
      className="next-class-strip group"
      onClick={() => onTap?.(slot)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap?.(slot);
        }
      }}
      aria-label={`Sljedeća nastava: ${shortName}, ${slot.type}, ${timeLabel}`}
    >
      {/* Left accent bar — same language as slot cards */}
      <span
        className="next-class-bar"
        style={{ background: cc.accent }}
        aria-hidden="true"
      />

      {/* Content */}
      <span className="next-class-body">
        <span className="next-class-top">
          <span
            className="next-class-name"
            style={{ color: cc.text }}
          >
            {shortName}
          </span>
          <span className="next-class-type">
            {slot.type}
          </span>
        </span>
        <span className="next-class-meta">
          <span>{slot.start} – {slot.end}</span>
          {slot.room && (
            <>
              <span className="meta-sep" aria-hidden="true" />
              <span>{slot.room}</span>
            </>
          )}
        </span>
      </span>

      {/* Time label */}
      <span
        className="next-class-time"
        style={{
          color: isLive ? cc.text : "var(--muted-fg)",
          background: isLive
            ? `color-mix(in srgb, ${cc.accent} 14%, transparent)`
            : "transparent",
        }}
      >
        {timeLabel}
      </span>

      {/* Live progress bar */}
      {isLive && (
        <span
          className="next-class-progress"
          style={{
            width: `${progress * 100}%`,
            background: cc.accent,
          }}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
