import type { Slot, UrgencyLevel } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { MetaSep } from "@/components/shared/MetaSep";

export type TimeStatus = "now" | "next" | null;

export function SlotCard({
  slot,
  showProf,
  onClick,
  urgency,
  timeStatus,
  topic,
}: {
  slot: Slot;
  showProf?: boolean;
  onClick?: () => void;
  urgency?: UrgencyLevel;
  timeStatus?: TimeStatus;
  topic?: string;
}) {
  const subj = subjectMap.get(slot.subject_id);
  const label = subj ? `${subj.short_name} (${subj.semester})` : slot.subject_id;
  const isExercise = slot.type === "V";
  const base = slot.status === "M" ? "slot-card-m" : "slot-card-e";

  const urgencyColor =
    urgency === "critical"
      ? "var(--u-critical)"
      : urgency === "approaching"
      ? "var(--u-approaching)"
      : undefined;

  return (
    <div
      onClick={onClick}
      className={`${base}${isExercise ? " exercise" : ""}${timeStatus === "now" ? " slot-now" : ""} slot-cell cursor-pointer active:scale-[0.98] t-base transition-[filter,transform]`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`${slot.status === "M" ? "slot-subject-m" : "slot-subject-e"} text-[12px] font-semibold leading-snug tracking-[-0.01em]`}
        >
          {label}
        </span>
        {urgencyColor && (
          <span
            className="urgency-dot"
            style={{ background: urgencyColor }}
          />
        )}
        {timeStatus === "now" && (
          <span className="slot-time-badge" style={{ background: "var(--m-accent)" }}>SAT</span>
        )}
        {timeStatus === "next" && (
          <span className="slot-time-badge" style={{ background: "var(--muted-fg)" }}>SLJEDEĆE</span>
        )}
      </div>

      {/* Topic subtitle */}
      {topic && (
        <div className="mt-0.5 text-[11px] leading-tight"
          style={{ color: slot.status === "M" ? "var(--m-text)" : "var(--e-text)", opacity: 0.75 }}
        >
          {topic}
        </div>
      )}

      <div className="text-muted-fg mt-0.5 text-[11px] leading-tight flex items-center">
        <span className="font-medium tabular-nums">{slot.room}</span>
        <MetaSep />
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
