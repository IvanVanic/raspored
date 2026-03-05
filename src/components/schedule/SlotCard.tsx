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
  const label = subj ? subj.short_name : slot.subject_id;
  const semLabel = subj ? subj.semester : "";
  const isExercise = slot.type === "V";
  const base = slot.status === "M" ? "slot-card-m" : "slot-card-e";
  const isM = slot.status === "M";

  const urgencyColor =
    urgency === "critical"
      ? "var(--u-critical)"
      : urgency === "approaching"
      ? "var(--u-approaching)"
      : undefined;

  return (
    <div
      onClick={onClick}
      className={`${base}${isExercise ? " exercise" : ""}${timeStatus === "now" ? " slot-now" : ""} slot-cell cursor-pointer active:scale-[0.985] t-base transition-[filter,transform] group`}
    >
      {/* Row 1: Subject label + badges */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`${isM ? "slot-subject-m" : "slot-subject-e"} text-[13px] font-bold leading-none tracking-[-0.01em] truncate`}
        >
          {label}
        </span>
        {semLabel && (
          <span className="text-[10px] text-muted-fg/50 font-medium leading-none shrink-0">
            {semLabel}
          </span>
        )}
        {urgencyColor && (
          <span
            className="urgency-dot shrink-0"
            style={{ background: urgencyColor }}
          />
        )}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {timeStatus === "now" && (
            <span className="slot-time-badge" style={{ background: "var(--m-accent)" }}>SAT</span>
          )}
          {timeStatus === "next" && (
            <span className="slot-time-badge" style={{ background: "var(--muted-fg)" }}>SLJEDEĆE</span>
          )}
        </div>
      </div>

      {/* Row 2: Topic — single line, hard truncated */}
      {topic && (
        <div
          className="mt-1.5 text-[12px] leading-snug truncate"
          style={{ color: isM ? "var(--m-text)" : "var(--e-text)", opacity: 0.75 }}
        >
          {topic}
        </div>
      )}

      {/* Row 3: Meta — type + group · room · prof */}
      <div className="mt-1.5 text-muted-fg text-[11px] leading-none flex items-center gap-0 opacity-60 group-hover:opacity-90 t-fast transition-opacity">
        <span className="font-medium">{slot.type === "P" ? "Pred." : "Vježbe"}{slot.group ? ` ${slot.group}` : ""}</span>
        <MetaSep />
        <span className="font-medium tabular-nums">{slot.room}</span>
        {showProf && slot.prof && (
          <>
            <MetaSep />
            <span className="truncate">{slot.prof}</span>
          </>
        )}
      </div>
    </div>
  );
}
